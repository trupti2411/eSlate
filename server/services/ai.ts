import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
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
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
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
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
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
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
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
      const result = await this.model.generateContent(prompts[contentType]);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error enhancing content:", error);
      throw new Error("Failed to enhance content. Please try again.");
    }
  }

  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }
}

export const aiService = new AIService();
export type { QuestionGenerationParams, GeneratedQuestion, GradingParams, GradingResult, HintParams, ProgressInsightParams };
