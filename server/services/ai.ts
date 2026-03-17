import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import Groq from "groq-sdk";
import OpenAI from "openai";
import * as fs from 'fs';
import * as path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");
const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENAI_MODEL = "gpt-4o";

interface QuestionGenerationParams {
  subject: string;
  topic: string;
  gradeLevel?: string;
  questionTypes: ('multiple_choice' | 'short_text' | 'long_text' | 'fill_blank' | 'true_false')[];
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedQuestion {
  type: 'multiple_choice' | 'short_text' | 'long_text' | 'fill_blank' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  helpText: string;
  points: number;
}

interface GradingParams {
  question: string;
  studentAnswer: string;
  correctAnswer?: string;
  rubric?: string;
  maxPoints: number;
}

interface GradingResult {
  suggestedScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface HintParams {
  question: string;
  questionType: string;
  correctAnswer?: string;
  helpText?: string;
  studentAttempt?: string;
  hintLevel: 1 | 2 | 3;
}

interface ProgressInsightParams {
  studentName: string;
  submissions: {
    assignmentTitle: string;
    subject: string;
    score?: number;
    maxScore?: number;
    submittedAt: string;
    isLate: boolean;
  }[];
  testResults: {
    testTitle: string;
    subject: string;
    score: number;
    totalPoints: number;
    completedAt: string;
  }[];
}

class AIService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  private async callGroq(prompt: string): Promise<string> {
    if (!groqClient) throw new Error("Groq not configured");
    const res = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || "";
  }

  private async callGroqVision(textPrompt: string, images: { mimeType: string; data: string }[]): Promise<string> {
    if (!groqClient) throw new Error("Groq not configured");
    const content: any[] = images.map(img => ({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.data}` },
    }));
    content.push({ type: "text", text: textPrompt });
    const res = await groqClient.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [{ role: "user", content }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || "";
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!openaiClient) throw new Error("OpenAI not configured");
    const res = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || "";
  }

  private async callOpenAIVision(textPrompt: string, images: { mimeType: string; data: string }[]): Promise<string> {
    if (!openaiClient) throw new Error("OpenAI not configured");
    const content: OpenAI.ChatCompletionContentPart[] = images.map(img => ({
      type: "image_url" as const,
      image_url: { url: `data:${img.mimeType};base64,${img.data}`, detail: "high" as const },
    }));
    content.push({ type: "text", text: textPrompt });
    const res = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || "";
  }

  private isQuotaError(err: any): boolean {
    return err?.status === 429 || err?.statusText === "Too Many Requests";
  }

  private quotaErrorMessage(): string {
    return "AI quota reached. Please try again in a few minutes or tomorrow if the daily limit is exhausted.";
  }

  // For text-only AI calls — Gemini first, then Groq, then GPT-4o
  private async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      if (this.isQuotaError(err)) {
        if (groqClient) {
          console.log("Gemini quota exceeded — switching to Groq fallback");
          return this.callGroq(prompt);
        }
        if (openaiClient) {
          console.log("Gemini quota exceeded — switching to GPT-4o fallback");
          return this.callOpenAI(prompt);
        }
        throw new Error(this.quotaErrorMessage());
      }
      throw err;
    }
  }

  // For multimodal calls (text + images) — Gemini first, then GPT-4o vision (best at handwriting)
  private async generateWithFallback(contentParts: any): Promise<string> {
    try {
      const result = await this.model.generateContent(contentParts);
      return result.response.text();
    } catch (err: any) {
      if (this.isQuotaError(err)) {
        const parts = Array.isArray(contentParts) ? contentParts : [contentParts];
        const textOnly = parts.filter((p: any) => p.text).map((p: any) => p.text).join("\n\n");
        const imageParts = parts
          .filter((p: any) => p.inlineData)
          .map((p: any) => ({ mimeType: p.inlineData.mimeType, data: p.inlineData.data }));
        const hasImages = imageParts.length > 0;

        if (hasImages && openaiClient) {
          console.log("Gemini quota exceeded — switching to GPT-4o vision fallback");
          return this.callOpenAIVision(textOnly, imageParts);
        }
        if (!hasImages && groqClient) {
          console.log("Gemini quota exceeded — switching to Groq fallback (text only)");
          return this.callGroq(textOnly);
        }
        if (!hasImages && openaiClient) {
          console.log("Gemini quota exceeded — switching to GPT-4o fallback (text only)");
          return this.callOpenAI(textOnly);
        }
        throw new Error(this.quotaErrorMessage());
      }
      throw err;
    }
  }

  private safeParseJSON<T>(response: string, type: 'array' | 'object'): T {
    try {
      const pattern = type === 'array' ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
      const jsonMatch = response.match(pattern);
      if (!jsonMatch) {
        throw new Error(`No valid JSON ${type} found in response`);
      }
      
      const cleanJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/,\s*([}\]])/g, '$1');
      
      return JSON.parse(cleanJson) as T;
    } catch (error) {
      console.error(`Failed to parse AI response as ${type}:`, response.substring(0, 500));
      throw new Error(`Failed to parse AI response. The AI returned an invalid format.`);
    }
  }

  async generateQuestions(params: QuestionGenerationParams): Promise<GeneratedQuestion[]> {
    const prompt = `You are an educational content expert. Generate ${params.count} questions for a ${params.gradeLevel || 'middle school'} level ${params.subject} class on the topic "${params.topic}".

Requirements:
- Difficulty level: ${params.difficulty}
- Question types to include: ${params.questionTypes.join(', ')}
- Each question should have a clear correct answer
- Include helpful hints that guide students without giving away the answer
- For multiple choice questions, provide 4 options (A, B, C, D)
- For fill-in-the-blank, use ___ to indicate the blank

Return the response as a JSON array with this exact structure (no markdown, just raw JSON):
[
  {
    "type": "multiple_choice" | "short_text" | "long_text" | "fill_blank" | "true_false",
    "question": "The question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], // Only for multiple_choice
    "correctAnswer": "The correct answer",
    "helpText": "A helpful hint without giving away the answer",
    "points": 10
  }
]

Generate exactly ${params.count} questions covering different aspects of ${params.topic}.`;

    try {
      const response = await this.generateText(prompt);
      
      const questions = this.safeParseJSON<GeneratedQuestion[]>(response, 'array');
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI returned no questions");
      }
      
      return questions.map(q => ({
        type: q.type || 'short_text',
        question: q.question || 'Question text missing',
        options: q.options,
        correctAnswer: q.correctAnswer || '',
        helpText: q.helpText || 'Think carefully about this question.',
        points: q.points || 10
      }));
    } catch (error: any) {
      console.error("Error generating questions:", error);
      throw new Error(error.message || "Failed to generate questions. Please try again.");
    }
  }

  async getGradingSuggestion(params: GradingParams): Promise<GradingResult> {
    const prompt = `You are an experienced teacher grading a student's answer. Provide fair and constructive feedback.

Question: ${params.question}

Student's Answer: ${params.studentAnswer}

${params.correctAnswer ? `Expected/Correct Answer: ${params.correctAnswer}` : ''}
${params.rubric ? `Grading Rubric: ${params.rubric}` : ''}

Maximum Points: ${params.maxPoints}

Evaluate the student's answer and provide:
1. A suggested score out of ${params.maxPoints} (be fair but not too lenient)
2. Constructive feedback explaining the score
3. Specific strengths in the answer
4. Areas for improvement

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "suggestedScore": number,
  "feedback": "Overall feedback paragraph",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`;

    try {
      const response = await this.generateText(prompt);
      
      const grading = this.safeParseJSON<GradingResult>(response, 'object');
      
      return {
        suggestedScore: Math.max(0, Math.min(params.maxPoints, grading.suggestedScore || 0)),
        feedback: grading.feedback || 'Please review this answer.',
        strengths: Array.isArray(grading.strengths) ? grading.strengths : [],
        improvements: Array.isArray(grading.improvements) ? grading.improvements : []
      };
    } catch (error: any) {
      console.error("Error getting grading suggestion:", error);
      throw new Error(error.message || "Failed to generate grading suggestion. Please try again.");
    }
  }

  async getStudentHint(params: HintParams): Promise<string> {
    const hintLevelDescriptions = {
      1: "Give a subtle, minimal hint that points the student in the right direction without revealing much. Just nudge them to think differently.",
      2: "Provide a moderate hint that gives more guidance. Explain the concept or approach they should consider.",
      3: "Give a detailed hint that walks through the problem-solving approach step by step, but still don't give the direct answer."
    };

    const prompt = `You are a helpful tutor providing hints to a student struggling with a question. 

Question: ${params.question}
Question Type: ${params.questionType}
${params.helpText ? `Teacher's Help Text: ${params.helpText}` : ''}
${params.studentAttempt ? `Student's Current Attempt: ${params.studentAttempt}` : ''}
${params.correctAnswer ? `(For your reference only - DO NOT reveal this) Correct Answer: ${params.correctAnswer}` : ''}

Hint Level Requested: ${params.hintLevel} out of 3
${hintLevelDescriptions[params.hintLevel]}

IMPORTANT RULES:
- NEVER reveal the actual answer directly
- Be encouraging and supportive
- Use age-appropriate language
- If there's a student attempt, acknowledge what they got right before guiding them

Provide your hint as a plain text response (no JSON, no formatting):`;

    try {
      const response = await this.generateText(prompt);
      return response.trim();
    } catch (error) {
      console.error("Error generating hint:", error);
      throw new Error("Failed to generate hint. Please try again.");
    }
  }

  async generateProgressInsights(params: ProgressInsightParams): Promise<{
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
    overallTrend: 'improving' | 'stable' | 'declining';
  }> {
    const prompt = `You are an educational analyst providing insights for a parent about their child's academic progress.

Student Name: ${params.studentName}

Recent Assignments (${params.submissions.length} total):
${params.submissions.map(s => `- ${s.assignmentTitle} (${s.subject}): ${s.score !== undefined ? `${s.score}/${s.maxScore}` : 'Pending grade'} - Submitted ${s.submittedAt}${s.isLate ? ' (Late)' : ''}`).join('\n')}

Recent Test Results (${params.testResults.length} total):
${params.testResults.map(t => `- ${t.testTitle} (${t.subject}): ${t.score}/${t.totalPoints} (${Math.round(t.score/t.totalPoints*100)}%) - Completed ${t.completedAt}`).join('\n')}

Analyze this data and provide:
1. A brief summary of overall academic performance (2-3 sentences)
2. Key strengths demonstrated
3. Areas that need improvement
4. Specific recommendations for the parent to help their child
5. Whether the overall trend is improving, stable, or declining

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "summary": "Overall performance summary paragraph",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "overallTrend": "improving" | "stable" | "declining"
}`;

    try {
      const response = await this.generateText(prompt);
      
      const insights = this.safeParseJSON<{
        summary: string;
        strengths: string[];
        areasForImprovement: string[];
        recommendations: string[];
        overallTrend: 'improving' | 'stable' | 'declining';
      }>(response, 'object');
      
      return {
        summary: insights.summary || 'No summary available.',
        strengths: Array.isArray(insights.strengths) ? insights.strengths : [],
        areasForImprovement: Array.isArray(insights.areasForImprovement) ? insights.areasForImprovement : [],
        recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
        overallTrend: ['improving', 'stable', 'declining'].includes(insights.overallTrend) 
          ? insights.overallTrend 
          : 'stable'
      };
    } catch (error: any) {
      console.error("Error generating progress insights:", error);
      throw new Error(error.message || "Failed to generate progress insights. Please try again.");
    }
  }

  async enhanceContent(content: string, contentType: 'question' | 'helpText' | 'instructions'): Promise<string> {
    const prompts = {
      question: `Improve this educational question to be clearer, more engaging, and academically appropriate. Keep the same meaning but enhance clarity and educational value:\n\n${content}\n\nReturn only the improved question text, no explanations.`,
      helpText: `Enhance this hint/help text to be more helpful for students without giving away the answer. Make it encouraging and educational:\n\n${content}\n\nReturn only the improved help text, no explanations.`,
      instructions: `Improve these assignment instructions to be clearer and more student-friendly. Ensure they are easy to understand:\n\n${content}\n\nReturn only the improved instructions, no explanations.`
    };

    try {
      const response = await this.generateText(prompts[contentType]);
      return response.trim();
    } catch (error) {
      console.error("Error enhancing content:", error);
      throw new Error("Failed to enhance content. Please try again.");
    }
  }

  async checkAssignment(params: {
    assignmentTitle: string;
    subject: string;
    assignmentDescription?: string;
    assignmentInstructions?: string;
    studentContent?: string;
    files?: { buffer: Buffer; mimeType: string }[];
  }): Promise<{
    overallAssessment: string;
    whatIsCorrect: string[];
    whatIsIncorrect: string[];
    whatIsMissing: string[];
    suggestedNextSteps: string[];
    canFullyCheck: boolean;
  }> {
    const hasText = !!(params.studentContent && params.studentContent.trim().length > 10);
    const hasFiles = !!(params.files && params.files.length > 0);

    const isMathSubject = /math|maths|arithmetic|algebra|geometry|calculus|numeracy|number|integer|fraction|decimal|statistic|trigon|addition|subtract|multiply|division/i.test(params.subject || params.assignmentTitle || '');
    const hasImageFiles = hasFiles && params.files!.some(f => f.mimeType.startsWith('image/'));

    const prompt = isMathSubject && hasImageFiles ? `You are an experienced maths teacher carefully marking a student's handwritten worksheet. Your job is to be ACCURATE and FAIR — do not mark a correct answer as wrong.

ASSIGNMENT: ${params.assignmentTitle}
SUBJECT: ${params.subject}
${params.assignmentDescription ? `DESCRIPTION: ${params.assignmentDescription}` : ''}

---
CRITICAL INSTRUCTIONS FOR HANDWRITTEN MATHS:

1. SCAN THE IMAGE carefully. Identify every numbered problem on the worksheet.

2. For EACH problem, do the following in your head (do NOT put this reasoning in the JSON output):
   a. Read the printed question text (e.g. "-2 + 3 = ___")
   b. Calculate the mathematically correct answer yourself (e.g. 1)
   c. Read what the student has written in the answer blank — handwriting can be messy:
      - A minus sign may look like a dash or underline
      - The digit "1" may look like a slash or tick mark
      - "0" may look like "D", "O", or an oval
      - Numbers like "-15" have a minus sign followed by digits — read them together as a negative number
      - If the answer space has a dash/line before digits, it is a NEGATIVE number
   d. Compare: does the student's answer equal the correct answer you calculated?
   e. If YES → the answer is CORRECT. Do NOT list it as incorrect.
   f. If NO, and you are VERY confident (95%+) about your reading → list it as incorrect.
   g. If you are UNSURE how to read the handwriting → give the student the benefit of the doubt and count it as correct.

3. SELF-CHECK RULE (mandatory): Before outputting any problem as "incorrect", verify:
   - You calculated the correct answer as X
   - You read the student's answer as Y
   - X ≠ Y
   Only if all three are true should you list it as incorrect.
   If your stated "correct answer" in whatIsIncorrect matches what the student appears to have written, you have made a reading error — remove that problem from the incorrect list.

4. Grouping: Instead of listing every single correct problem individually, you may group them (e.g. "Problems 1, 2, 4–8, 10–12 are all correct").

Return ONLY raw JSON (no markdown, no code blocks):
{
  "overallAssessment": "2-3 sentence fair summary of the student's performance",
  "whatIsCorrect": ["Brief summary of correct answers, e.g. 'Problems 1, 2, 4, 5, 6, 7, 8, 10, 11, 12 are all correct'"],
  "whatIsIncorrect": ["Problem X is incorrect; student wrote Y, correct answer is Z"],
  "whatIsMissing": ["any problems left completely blank"],
  "suggestedNextSteps": ["specific, constructive improvement tip"]
}` : `You are an experienced teacher reviewing a student's assignment submission. Provide a thorough, fair, and constructive assessment.

ASSIGNMENT TITLE: ${params.assignmentTitle}
SUBJECT: ${params.subject}
${params.assignmentDescription ? `ASSIGNMENT DESCRIPTION: ${params.assignmentDescription}` : ''}
${params.assignmentInstructions ? `INSTRUCTIONS GIVEN TO STUDENT: ${params.assignmentInstructions}` : ''}

STUDENT'S SUBMITTED WORK:
${hasText ? params.studentContent : hasFiles ? '(See attached file(s) below)' : '(No written response provided)'}

${hasFiles ? `The student submitted ${params.files!.length} file(s) — review their contents carefully above when assessing correctness.` : ''}

Check the student's work thoroughly against the assignment brief. Assess:
1. What has the student done CORRECTLY or addressed well?
2. What is INCORRECT, has errors, or is factually/logically wrong?
3. What is MISSING — required parts of the assignment not addressed?
4. What are the suggested next steps for improvement?
5. Provide a brief overall assessment paragraph (2-3 sentences).

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "overallAssessment": "2-3 sentence overall summary of the submission quality",
  "whatIsCorrect": ["specific thing done correctly", "another correct element"],
  "whatIsIncorrect": ["specific error or incorrect element", "another mistake"],
  "whatIsMissing": ["required element not addressed", "missing section or concept"],
  "suggestedNextSteps": ["specific actionable suggestion", "another improvement step"]
}

Be specific and reference the actual content of the student's work. If the submission is very short or incomplete, reflect that in your assessment.`;

    try {
      // Build the content parts — text prompt first, then any files as inline data
      const contentParts: any[] = [{ text: prompt }];

      if (hasFiles) {
        for (const f of params.files!) {
          const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'application/pdf'];
          if (supported.includes(f.mimeType)) {
            contentParts.push({
              inlineData: {
                mimeType: f.mimeType,
                data: f.buffer.toString('base64'),
              },
            });
          }
        }
      }

      const response = await this.generateWithFallback(contentParts);

      const check = this.safeParseJSON<{
        overallAssessment: string;
        whatIsCorrect: string[];
        whatIsIncorrect: string[];
        whatIsMissing: string[];
        suggestedNextSteps: string[];
      }>(response, 'object');

      return {
        overallAssessment: check.overallAssessment || 'Assessment could not be generated.',
        whatIsCorrect: Array.isArray(check.whatIsCorrect) ? check.whatIsCorrect : [],
        whatIsIncorrect: Array.isArray(check.whatIsIncorrect) ? check.whatIsIncorrect : [],
        whatIsMissing: Array.isArray(check.whatIsMissing) ? check.whatIsMissing : [],
        suggestedNextSteps: Array.isArray(check.suggestedNextSteps) ? check.suggestedNextSteps : [],
        canFullyCheck: true,
      };
    } catch (error: any) {
      console.error("Error checking assignment:", error);
      const msg = error.message || "Failed to check assignment. Please try again.";
      throw new Error(msg);
    }
  }

  isConfigured(): boolean {
    return !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);
  }

  async extractWorksheetFromPDF(pdfPath: string, options?: { 
    startPage?: number; 
    endPage?: number;
    subject?: string;
    gradeLevel?: string;
  }): Promise<{
    title: string;
    subject: string;
    description: string;
    pages: {
      pageNumber: number;
      title: string;
      questions: {
        questionNumber: number;
        questionType: 'multiple_choice' | 'short_text' | 'long_text' | 'fill_blank' | 'true_false' | 'information';
        questionText: string;
        options?: { id: string; text: string }[];
        correctAnswer?: string;
        helpText?: string;
        points: number;
      }[];
    }[];
  }> {
    try {
      // Upload the PDF file to Gemini
      const uploadResult = await fileManager.uploadFile(pdfPath, {
        mimeType: "application/pdf",
        displayName: path.basename(pdfPath),
      });

      console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

      // Wait for file to be processed
      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === "PROCESSING") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        file = await fileManager.getFile(uploadResult.file.name);
      }

      if (file.state === "FAILED") {
        throw new Error("PDF processing failed");
      }

      // Use gemini-2.0-flash for PDF understanding (supports multimodal, large context)
      const pdfModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const pageRange = options?.startPage && options?.endPage 
        ? `Focus on pages ${options.startPage} to ${options.endPage}.` 
        : 'Process all pages.';

      const prompt = `You are an expert at converting educational PDFs into digital worksheets.

Analyze this PDF document and extract ALL questions, exercises, and content to create a comprehensive digital worksheet.

${pageRange}

For each piece of content, determine the appropriate question type:
- "information" - For instructional text, examples, or reading passages (not questions)
- "multiple_choice" - Questions with specific answer options (A, B, C, D, etc.)
- "short_text" - Questions requiring brief 1-2 word or short phrase answers
- "long_text" - Questions requiring paragraph-length written responses
- "fill_blank" - Sentences with blanks to fill in
- "true_false" - True/False questions

IMPORTANT EXTRACTION RULES:
1. Preserve the EXACT wording of all questions from the PDF
2. For multiple choice, extract ALL answer options exactly as shown
3. Include any diagrams/images descriptions as part of the question text if relevant
4. Group questions by their page number in the PDF
5. For reading comprehension, include the passage as an "information" type, followed by questions
6. Extract correct answers if they are provided in the PDF (often in answer keys)
7. Assign point values based on question complexity (simple: 1-2 pts, medium: 3-5 pts, complex: 10+ pts)

${options?.subject ? `Subject hint: ${options.subject}` : ''}
${options?.gradeLevel ? `Grade level hint: ${options.gradeLevel}` : ''}

Return the response as JSON with this EXACT structure (no markdown, just raw JSON):
{
  "title": "Worksheet title from the PDF",
  "subject": "Subject area (English, Math, Science, etc.)",
  "description": "Brief description of the worksheet content",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page title or section name",
      "questions": [
        {
          "questionNumber": 1,
          "questionType": "multiple_choice",
          "questionText": "The exact question text",
          "options": [
            { "id": "a", "text": "Option A text" },
            { "id": "b", "text": "Option B text" },
            { "id": "c", "text": "Option C text" },
            { "id": "d", "text": "Option D text" }
          ],
          "correctAnswer": "a",
          "helpText": "A hint without giving away the answer",
          "points": 2
        }
      ]
    }
  ]
}

Extract all content comprehensively. Do not summarize or skip any questions.`;

      const result = await pdfModel.generateContent([
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
        { text: prompt },
      ]);

      const response = result.response.text();
      const worksheetData = this.safeParseJSON<{
        title: string;
        subject: string;
        description: string;
        pages: {
          pageNumber: number;
          title: string;
          questions: {
            questionNumber: number;
            questionType: 'multiple_choice' | 'short_text' | 'long_text' | 'fill_blank' | 'true_false' | 'information';
            questionText: string;
            options?: { id: string; text: string }[];
            correctAnswer?: string;
            helpText?: string;
            points: number;
          }[];
        }[];
      }>(response, 'object');

      // Clean up uploaded file
      await fileManager.deleteFile(uploadResult.file.name);

      return worksheetData;
    } catch (error: any) {
      console.error("Error extracting worksheet from PDF:", error);
      throw new Error(error.message || "Failed to extract worksheet from PDF. Please try again.");
    }
  }
}

export const aiService = new AIService();
export type { QuestionGenerationParams, GeneratedQuestion, GradingParams, GradingResult, HintParams, ProgressInsightParams };
