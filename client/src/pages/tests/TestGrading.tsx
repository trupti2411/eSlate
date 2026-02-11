import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { AIGradingAssistant } from "@/components/AIGradingAssistant";
import type { Test, TestQuestion, TestAttempt, TestAnswer } from "@shared/schema";

export default function TestGrading() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/company/tests/:testId/grade/:attemptId");
  const [, tutorParams] = useRoute("/tutor/tests/:testId/grade/:attemptId");
  
  const testId = params?.testId || tutorParams?.testId;
  const attemptId = params?.attemptId || tutorParams?.attemptId;
  
  const [answerGrades, setAnswerGrades] = useState<Record<string, { pointsAwarded: number; feedback: string }>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  
  // Fetch test with questions
  const { data: testData, isLoading: testLoading } = useQuery({
    queryKey: ['/api/tests', testId],
    enabled: !!testId,
  });
  
  // Fetch attempt details
  const { data: attemptData } = useQuery<TestAttempt>({
    queryKey: ['/api/tests/attempts', attemptId],
    enabled: !!attemptId,
  });
  
  // Fetch student's answers
  const { data: answersData = [] } = useQuery<TestAnswer[]>({
    queryKey: ['/api/tests/attempts', attemptId, 'answers'],
    enabled: !!attemptId,
  });
  
  const test = testData as (Test & { questions: TestQuestion[] }) | undefined;
  const questions = test?.questions || [];
  
  // Grade mutation
  const gradeMutation = useMutation({
    mutationFn: async () => {
      const grades = Object.entries(answerGrades).map(([answerId, grade]) => ({
        answerId,
        pointsAwarded: grade.pointsAwarded,
        feedback: grade.feedback,
        isCorrect: grade.pointsAwarded > 0,
      }));
      
      return apiRequest(`/api/tests/attempts/${attemptId}/grade`, "POST", {
        answerGrades: grades,
        feedback: overallFeedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests/attempts', attemptId] });
      toast({ title: "Grading saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save grading", description: error.message, variant: "destructive" });
    },
  });
  
  const handleGradeChange = (answerId: string, field: 'pointsAwarded' | 'feedback', value: string | number) => {
    setAnswerGrades(prev => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value,
      },
    }));
  };
  
  const getQuestionForAnswer = (questionId: string) => {
    return questions.find(q => q.id === questionId);
  };
  
  const getAnswerForQuestion = (questionId: string) => {
    return answersData.find(a => a.questionId === questionId);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800" data-testid="badge-in-progress"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800" data-testid="badge-submitted"><AlertCircle className="h-3 w-3 mr-1" /> Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-green-100 text-green-800" data-testid="badge-graded"><CheckCircle className="h-3 w-3 mr-1" /> Graded</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-unknown">{status}</Badge>;
    }
  };
  
  if (authLoading || testLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen" data-testid="loading">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated || (user?.role !== "tutor" && user?.role !== "company_admin")) {
    return (
      <Layout>
        <div className="p-6" data-testid="unauthorized">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You must be a tutor or company admin to access this page.</p>
        </div>
      </Layout>
    );
  }
  
  const backUrl = user?.role === "tutor" ? "/tutor/tests" : "/company/tests";
  
  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="test-grading-page">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tests
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="page-title">Grade Test: {test?.title}</h1>
            {attemptData && (
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(attemptData.status)}
                {attemptData.submittedAt && (
                  <span className="text-sm text-muted-foreground">
                    Submitted: {format(new Date(attemptData.submittedAt), "PPp")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Test Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
            <CardDescription>
              Total Points: {test?.totalPoints || 0} | Questions: {questions.length}
              {test?.passingScore && ` | Passing Score: ${test.passingScore}%`}
            </CardDescription>
          </CardHeader>
          {attemptData?.status === "graded" && (
            <CardContent>
              <div className="flex gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-3xl font-bold">{attemptData.totalScore || 0}</div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-3xl font-bold">{attemptData.percentageScore || 0}%</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                {attemptData.isPassed !== undefined && (
                  <div className={`text-center p-4 border rounded ${attemptData.isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="text-3xl font-bold">{attemptData.isPassed ? "PASS" : "FAIL"}</div>
                    <div className="text-sm text-muted-foreground">Result</div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Questions and Answers */}
        <div className="space-y-4">
          {questions.map((question, index) => {
            const answer = getAnswerForQuestion(question.id);
            const currentGrade = answer && answerGrades[answer.id];
            const existingGrade = answer?.pointsAwarded;
            const isAutoGraded = question.questionType === "multiple_choice" || question.questionType === "true_false";
            
            return (
              <Card key={question.id} data-testid={`question-card-${question.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Question {question.questionNumber}: {question.questionText}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{question.questionType.replace("_", " ")}</Badge>
                        <span>{question.points || 1} point{(question.points || 1) !== 1 ? "s" : ""}</span>
                        {isAutoGraded && (
                          <Badge variant="outline" className="text-blue-600">Auto-graded</Badge>
                        )}
                      </CardDescription>
                    </div>
                    {answer && (
                      <div className="text-right">
                        {answer.isCorrect !== null && (
                          answer.isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show options for multiple choice */}
                  {question.questionType === "multiple_choice" && question.options && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Options:</p>
                      {(question.options as { id: string; text: string; isCorrect: boolean }[]).map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 border rounded text-sm ${
                            opt.isCorrect ? "bg-green-50 border-green-300" : ""
                          } ${
                            answer?.selectedOption === opt.id && !opt.isCorrect ? "bg-red-50 border-red-300" : ""
                          } ${
                            answer?.selectedOption === opt.id ? "font-medium" : ""
                          }`}
                        >
                          {opt.id.toUpperCase()}. {opt.text}
                          {opt.isCorrect && " (Correct)"}
                          {answer?.selectedOption === opt.id && " (Student's answer)"}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* True/False */}
                  {question.questionType === "true_false" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Student's answer: {answer?.selectedOption === "true" ? "True" : answer?.selectedOption === "false" ? "False" : "No answer"}</p>
                      {question.options && (
                        <p className="text-sm text-muted-foreground">
                          Correct answer: {(question.options as { id: string; text: string; isCorrect: boolean }[]).find((o) => o.isCorrect)?.id === "true" ? "True" : "False"}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Short answer, essay, or fill in the blank */}
                  {(question.questionType === "short_answer" || question.questionType === "essay" || question.questionType === "fill_blank") && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Student's answer:</p>
                      <div className="p-3 bg-muted rounded border">
                        {answer?.studentAnswer || <span className="text-muted-foreground italic">No answer provided</span>}
                      </div>
                      {question.correctAnswer && (
                        <div>
                          <p className="text-sm font-medium text-green-700">Expected answer:</p>
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            {question.correctAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Grading controls for non-auto-graded questions */}
                  {!isAutoGraded && answer && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Points:</label>
                          <Input
                            type="number"
                            min="0"
                            max={question.points || 1}
                            value={currentGrade?.pointsAwarded ?? existingGrade ?? 0}
                            onChange={(e) => handleGradeChange(answer.id, 'pointsAwarded', parseInt(e.target.value) || 0)}
                            className="w-20"
                            data-testid={`input-points-${question.id}`}
                          />
                          <span className="text-sm text-muted-foreground">/ {question.points || 1}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 hover:bg-green-100"
                            onClick={() => handleGradeChange(answer.id, 'pointsAwarded', question.points || 1)}
                            data-testid={`button-full-points-${question.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Full Points
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100"
                            onClick={() => handleGradeChange(answer.id, 'pointsAwarded', 0)}
                            data-testid={`button-zero-points-${question.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Zero Points
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Feedback for this answer:</label>
                        <Textarea
                          value={currentGrade?.feedback ?? answer.feedback ?? ""}
                          onChange={(e) => handleGradeChange(answer.id, 'feedback', e.target.value)}
                          placeholder="Provide feedback to the student..."
                          className="mt-1"
                          data-testid={`input-feedback-${question.id}`}
                        />
                      </div>
                      
                      {/* AI Grading Assistant */}
                      <div className="mt-4">
                        <AIGradingAssistant
                          question={question.questionText || ''}
                          studentAnswer={answer.studentAnswer || ''}
                          correctAnswer={question.correctAnswer || undefined}
                          maxPoints={question.points || 1}
                          onApplySuggestion={(score, feedback) => {
                            handleGradeChange(answer.id, 'pointsAwarded', score);
                            handleGradeChange(answer.id, 'feedback', feedback);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Show explanation if available */}
                  {question.explanation && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-muted-foreground">Explanation:</p>
                      <p className="text-sm mt-1">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Overall Feedback and Submit */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
            <CardDescription>Provide general feedback for the student's test performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Enter overall feedback..."
              rows={4}
              data-testid="input-overall-feedback"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => gradeMutation.mutate()}
                disabled={gradeMutation.isPending}
                data-testid="button-submit-grading"
              >
                {gradeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Grading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
