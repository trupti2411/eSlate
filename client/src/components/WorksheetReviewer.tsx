import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  X,
  Check,
  MessageSquare,
  FileText,
  AlignLeft,
  List,
  Image,
  Info,
  Type,
  Loader2
} from 'lucide-react';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'fill_blank' | 'text_image' | 'information';

interface Question {
  id: string;
  pageId: string;
  questionType: QuestionType;
  questionText: string;
  questionNumber: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
  imageUrl?: string;
  correctAnswer?: string;
  points?: number;
}

interface Page {
  id: string;
  worksheetId: string;
  pageNumber: number;
  title?: string;
  questions: Question[];
}

interface Worksheet {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  pages: Page[];
}

interface Answer {
  id?: string;
  questionId: string;
  textAnswer?: string;
  handwritingData?: string;
  selectedOption?: string;
  isSubmitted: boolean;
  score?: number;
  feedback?: string;
}

interface WorksheetReviewerProps {
  worksheetId: string;
  studentId: string;
  studentName?: string;
  onClose: () => void;
  onGradeComplete?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const questionTypeIcons: Record<QuestionType, any> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: List,
  fill_blank: FileText,
  text_image: Image,
  information: Info,
};

export function WorksheetReviewer({ worksheetId, studentId, studentName, onClose, onGradeComplete }: WorksheetReviewerProps) {
  const { toast } = useToast();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const { data: worksheet, isLoading: worksheetLoading } = useQuery<Worksheet>({
    queryKey: ['/api/worksheets', worksheetId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId,
  });

  const { data: answers = [], isLoading: answersLoading } = useQuery<Answer[]>({
    queryKey: ['/api/worksheets', worksheetId, 'answers', studentId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}/answers/${studentId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId && !!studentId,
  });

  const saveGradesMutation = useMutation({
    mutationFn: async (gradeData: { questionId: string; score: number; feedback: string }[]) => {
      return apiRequest(`/api/worksheets/${worksheetId}/grade/${studentId}`, 'POST', { grades: gradeData });
    },
    onSuccess: () => {
      toast({ title: 'Grades saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets', worksheetId, 'answers', studentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/company/submissions'] });
      onGradeComplete?.();
    },
    onError: (error) => {
      toast({ title: 'Failed to save grades', description: String(error), variant: 'destructive' });
    }
  });

  useEffect(() => {
    if (answers.length > 0) {
      const initialGrades: Record<string, { score: number; feedback: string }> = {};
      answers.forEach(answer => {
        if (answer.score !== undefined || answer.feedback) {
          initialGrades[answer.questionId] = {
            score: answer.score || 0,
            feedback: answer.feedback || ''
          };
        }
      });
      setGrades(initialGrades);
    }
  }, [answers]);

  useEffect(() => {
    answers.forEach(answer => {
      if (answer.handwritingData) {
        const canvas = canvasRefs.current[answer.questionId];
        if (canvas) {
          try {
            const strokes: Stroke[] = JSON.parse(answer.handwritingData);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              strokes.forEach(stroke => {
                if (stroke.points.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                for (let i = 1; i < stroke.points.length; i++) {
                  ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }
                ctx.stroke();
              });
            }
          } catch (e) {
            console.error('Failed to parse handwriting data:', e);
          }
        }
      }
    });
  }, [answers, currentPageIndex]);

  const isLoading = worksheetLoading || answersLoading;

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!worksheet) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Worksheet not found</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Unable to load worksheet data.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const pages = worksheet.pages || [];
  const currentPage = pages[currentPageIndex];
  const allQuestions = pages.flatMap(page => page.questions || []);
  const answersMap = new Map(answers.map(a => [a.questionId, a]));

  const getAnswer = (questionId: string): Answer | undefined => {
    return answersMap.get(questionId);
  };

  const getDisplayAnswer = (question: Question): string => {
    const answer = getAnswer(question.id);
    if (!answer) return '(No answer provided)';
    
    if (question.questionType === 'multiple_choice' && answer.selectedOption) {
      const selectedOpt = question.options?.find(o => o.id === answer.selectedOption);
      return selectedOpt?.text || answer.selectedOption;
    }
    
    return answer.textAnswer || '(No answer provided)';
  };

  const isCorrect = (question: Question): boolean | null => {
    const answer = getAnswer(question.id);
    if (!answer) return null;
    
    if (question.questionType === 'multiple_choice') {
      const correctOpt = question.options?.find(o => o.isCorrect);
      return answer.selectedOption === correctOpt?.id;
    }
    
    if (question.correctAnswer) {
      return answer.textAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    }
    
    return null;
  };

  const handleGradeChange = (questionId: string, field: 'score' | 'feedback', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = () => {
    const gradeData = Object.entries(grades).map(([questionId, grade]) => ({
      questionId,
      score: grade.score,
      feedback: grade.feedback
    }));
    saveGradesMutation.mutate(gradeData);
  };

  const getTotalScore = (): { earned: number; possible: number } => {
    let earned = 0;
    let possible = 0;
    allQuestions.forEach(q => {
      if (q.questionType !== 'information') {
        possible += q.points || 1;
        if (grades[q.id]?.score !== undefined) {
          earned += grades[q.id].score;
        }
      }
    });
    return { earned, possible };
  };

  const { earned, possible } = getTotalScore();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none h-[95vh] max-h-none overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{worksheet.title}</DialogTitle>
              <CardDescription>
                Reviewing: {studentName || studentId}
                {worksheet.subject && ` | Subject: ${worksheet.subject}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Score: {earned}/{possible}
              </Badge>
              <Button onClick={handleSaveGrades} disabled={saveGradesMutation.isPending}>
                {saveGradesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Grades
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {currentPage?.questions?.map((question, idx) => {
              const answer = getAnswer(question.id);
              const correct = isCorrect(question);
              const Icon = questionTypeIcons[question.questionType];
              const grade = grades[question.id] || { score: 0, feedback: '' };

              if (question.questionType === 'information') {
                return (
                  <Card key={question.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={question.id} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">
                          Q{question.questionNumber}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {question.questionType.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({question.points || 1} pts)
                            </span>
                          </div>
                          <p className="font-medium">{question.questionText}</p>
                        </div>
                      </div>
                      {correct !== null && (
                        <Badge variant={correct ? 'default' : 'destructive'}>
                          {correct ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                          {correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {question.imageUrl && (
                      <img 
                        src={question.imageUrl} 
                        alt="Question" 
                        className="max-h-40 rounded border"
                      />
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                      <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 block">Student's Answer:</Label>
                      
                      {question.questionType === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {question.options?.map(option => {
                            const isSelected = answer?.selectedOption === option.id;
                            return (
                              <div 
                                key={option.id}
                                className={`p-2 rounded border ${
                                  isSelected 
                                    ? option.isCorrect 
                                      ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                                      : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                                    : option.isCorrect
                                      ? 'bg-green-50/50 border-green-300 dark:bg-green-900/10'
                                      : 'bg-white dark:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected && (option.isCorrect ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />)}
                                  {!isSelected && option.isCorrect && <Check className="w-4 h-4 text-green-400" />}
                                  <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                                  {isSelected && <Badge variant="secondary" className="ml-auto">Selected</Badge>}
                                  {option.isCorrect && <Badge variant="outline" className="ml-auto text-green-600">Correct Answer</Badge>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : answer?.handwritingData ? (
                        <canvas
                          ref={el => canvasRefs.current[question.id] = el}
                          width={600}
                          height={200}
                          className="border-2 rounded bg-white w-full"
                        />
                      ) : (
                        <p className={`text-lg ${answer?.textAnswer ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
                          {getDisplayAnswer(question)}
                        </p>
                      )}

                      {question.correctAnswer && question.questionType !== 'multiple_choice' && (
                        <div className="mt-2 pt-2 border-t">
                          <Label className="text-xs text-muted-foreground">Expected Answer:</Label>
                          <p className="text-green-600 dark:text-green-400 font-medium">{question.correctAnswer}</p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`score-${question.id}`}>Score (out of {question.points || 1})</Label>
                        <Input
                          id={`score-${question.id}`}
                          type="number"
                          min={0}
                          max={question.points || 1}
                          value={grade.score}
                          onChange={(e) => handleGradeChange(question.id, 'score', Number(e.target.value))}
                          className="mt-1 w-32"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`feedback-${question.id}`}>Feedback</Label>
                      <Textarea
                        id={`feedback-${question.id}`}
                        value={grade.feedback}
                        onChange={(e) => handleGradeChange(question.id, 'feedback', e.target.value)}
                        placeholder="Add feedback for this answer..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPageIndex === pages.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
