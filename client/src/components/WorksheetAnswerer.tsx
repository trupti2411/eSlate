import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AIHintButton } from './AIHintButton';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  Pencil, 
  Type,
  Eraser,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  AlignLeft,
  List,
  Image,
  Info
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
}

interface WorksheetAnswererProps {
  worksheetId: string;
  studentId?: string;
  assignmentId?: string;
  onClose?: () => void;
  onComplete?: () => void;
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

export function WorksheetAnswerer({ worksheetId, studentId: providedStudentId, assignmentId, onClose, onComplete }: WorksheetAnswererProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [inputMode, setInputMode] = useState<'type' | 'draw'>('type');
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [currentStrokes, setCurrentStrokes] = useState<Record<string, Stroke[]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [penColor] = useState('#000000');
  const [penWidth] = useState(2);
  
  const studentId = providedStudentId || (user?.id ? `student-${user.id}` : '');

  const { data: worksheet, isLoading } = useQuery<Worksheet>({
    queryKey: ['/api/worksheets', worksheetId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId,
  });

  const { data: savedAnswers } = useQuery<Answer[]>({
    queryKey: ['/api/worksheets', worksheetId, 'answers', studentId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}/answers/${studentId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId && !!studentId,
  });

  useEffect(() => {
    if (savedAnswers) {
      const answersMap: Record<string, Answer> = {};
      savedAnswers.forEach(answer => {
        answersMap[answer.questionId] = answer;
      });
      setAnswers(answersMap);
      
      savedAnswers.forEach(answer => {
        if (answer.handwritingData) {
          try {
            const strokes = JSON.parse(answer.handwritingData);
            setCurrentStrokes(prev => ({ ...prev, [answer.questionId]: strokes }));
          } catch (e) {
            console.error('Failed to parse handwriting data');
          }
        }
      });
    }
  }, [savedAnswers]);

  const saveAnswerMutation = useMutation({
    mutationFn: (data: { questionId: string; answer: Partial<Answer> }) =>
      apiRequest(`/api/worksheets/${worksheetId}/answers`, 'POST', {
        questionId: data.questionId,
        studentId,
        ...data.answer,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets', worksheetId, 'answers', studentId] });
    },
  });

  const submitWorksheetMutation = useMutation({
    mutationFn: () => apiRequest(`/api/worksheets/${worksheetId}/submit/${studentId}`, 'POST'),
    onSuccess: () => {
      toast({ title: 'Worksheet submitted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets', worksheetId, 'answers', studentId] });
      if (onComplete) {
        onComplete();
      }
      if (onClose) {
        onClose();
      }
    },
    onError: () => {
      toast({ title: 'Failed to submit worksheet', variant: 'destructive' });
    },
  });

  const handleSaveAnswer = useCallback(async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return;

    const strokes = currentStrokes[questionId];
    const handwritingData = strokes ? JSON.stringify(strokes) : undefined;

    setIsSaving(true);
    try {
      await saveAnswerMutation.mutateAsync({
        questionId,
        answer: {
          textAnswer: answer.textAnswer,
          selectedOption: answer.selectedOption,
          handwritingData,
        },
      });
      toast({ title: 'Answer saved' });
    } finally {
      setIsSaving(false);
    }
  }, [answers, currentStrokes, saveAnswerMutation, toast]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const allQuestions = worksheet?.pages.flatMap(p => p.questions) || [];
      for (const question of allQuestions) {
        const answer = answers[question.id];
        const strokes = currentStrokes[question.id];
        
        if (answer?.textAnswer || answer?.selectedOption || strokes?.length) {
          await saveAnswerMutation.mutateAsync({
            questionId: question.id,
            answer: {
              textAnswer: answer?.textAnswer,
              selectedOption: answer?.selectedOption,
              handwritingData: strokes ? JSON.stringify(strokes) : undefined,
            },
          });
        }
      }
      toast({ title: 'All answers saved' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    await handleSaveAll();
    await submitWorksheetMutation.mutateAsync();
    setShowSubmitDialog(false);
  };

  const updateAnswer = (questionId: string, updates: Partial<Answer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        isSubmitted: false,
        ...updates,
      },
    }));
  };

  const getCanvasContext = (questionId: string): CanvasRenderingContext2D | null => {
    const canvas = canvasRefs.current[questionId];
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const startDrawing = (questionId: string, e: React.MouseEvent | React.TouchEvent) => {
    if (inputMode !== 'draw') return;
    
    const canvas = canvasRefs.current[questionId];
    if (!canvas) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const point = 'touches' in e 
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    setCurrentStroke({
      points: [point],
      color: penColor,
      width: penWidth,
    });
  };

  const draw = (questionId: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || inputMode !== 'draw' || !currentStroke) return;

    const canvas = canvasRefs.current[questionId];
    if (!canvas) return;

    const ctx = getCanvasContext(questionId);
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const point = 'touches' in e 
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const newStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(newStroke);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentStroke.points.length > 0) {
      const lastPoint = currentStroke.points[currentStroke.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (questionId: string) => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    setCurrentStrokes(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), currentStroke],
    }));
    setCurrentStroke(null);
  };

  const clearCanvas = (questionId: string) => {
    const canvas = canvasRefs.current[questionId];
    const ctx = getCanvasContext(questionId);
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentStrokes(prev => ({ ...prev, [questionId]: [] }));
  };

  const redrawCanvas = useCallback((questionId: string) => {
    const canvas = canvasRefs.current[questionId];
    const ctx = getCanvasContext(questionId);
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const strokes = currentStrokes[questionId] || [];
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [currentStrokes]);

  useEffect(() => {
    Object.keys(currentStrokes).forEach(questionId => {
      redrawCanvas(questionId);
    });
  }, [currentStrokes, redrawCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading worksheet...</div>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Worksheet not found</div>
      </div>
    );
  }

  if (!worksheet.pages || worksheet.pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">This worksheet has no pages</div>
      </div>
    );
  }

  const currentPage = worksheet.pages[currentPageIndex];
  const totalPages = worksheet.pages.length;

  const getAnswerProgress = () => {
    const allQuestions = worksheet.pages.flatMap(p => p.questions);
    const answerableQuestions = allQuestions.filter(q => q.questionType !== 'information');
    const answeredCount = answerableQuestions.filter(q => {
      const answer = answers[q.id];
      const strokes = currentStrokes[q.id];
      return answer?.textAnswer || answer?.selectedOption || (strokes && strokes.length > 0);
    }).length;
    return { answered: answeredCount, total: answerableQuestions.length };
  };

  const progress = getAnswerProgress();

  const renderQuestionInput = (question: Question) => {
    const answer = answers[question.id];
    const Icon = questionTypeIcons[question.questionType];

    if (question.questionType === 'information') {
      return (
        <Card key={question.id} className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase">
                    Information
                  </span>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-base font-serif leading-relaxed whitespace-pre-wrap">{question.questionText}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={question.id} className="mb-6 border-2">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="font-bold text-xl">{question.questionNumber}.</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {question.questionType.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground">({question.points} pts)</span>
                <AIHintButton
                  question={question.questionText}
                  questionType={question.questionType}
                  correctAnswer={question.correctAnswer}
                  studentAttempt={answer?.textAnswer || answer?.selectedOption}
                />
              </div>
              <p className="text-lg font-serif leading-relaxed">{question.questionText}</p>
              
              {question.questionType === 'text_image' && question.imageUrl && (
                <img src={question.imageUrl} alt="Question" className="max-w-md rounded mt-3 border" />
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Input Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Answer with:</span>
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'type' | 'draw')}>
              <TabsList>
                <TabsTrigger value="type" data-testid={`toggle-type-${question.id}`}>
                  <Type className="h-4 w-4 mr-1" /> Typing
                </TabsTrigger>
                <TabsTrigger value="draw" data-testid={`toggle-draw-${question.id}`}>
                  <Pencil className="h-4 w-4 mr-1" /> Pen/Stylus
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Answer Input Area */}
          {question.questionType === 'multiple_choice' ? (
            <RadioGroup
              value={answer?.selectedOption || ''}
              onValueChange={(value) => updateAnswer(question.id, { selectedOption: value })}
              className="space-y-2"
            >
              {question.options?.map((option, i) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem 
                    value={option.id} 
                    id={`${question.id}-${option.id}`}
                    data-testid={`option-${question.id}-${i}`}
                  />
                  <Label 
                    htmlFor={`${question.id}-${option.id}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : inputMode === 'type' ? (
            question.questionType === 'short_text' || question.questionType === 'fill_blank' ? (
              <Input
                value={answer?.textAnswer || ''}
                onChange={(e) => updateAnswer(question.id, { textAnswer: e.target.value })}
                placeholder={question.questionType === 'fill_blank' ? 'Enter the missing word...' : 'Type your answer...'}
                className="text-lg font-serif"
                data-testid={`input-answer-${question.id}`}
              />
            ) : (
              <Textarea
                value={answer?.textAnswer || ''}
                onChange={(e) => updateAnswer(question.id, { textAnswer: e.target.value })}
                placeholder="Type your answer here..."
                className="min-h-[150px] text-lg font-serif leading-relaxed"
                data-testid={`textarea-answer-${question.id}`}
              />
            )
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCanvas(question.id)}
                  data-testid={`button-clear-canvas-${question.id}`}
                >
                  <Eraser className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <div className="border-2 border-dashed rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={(el) => { canvasRefs.current[question.id] = el; }}
                  width={600}
                  height={question.questionType === 'long_text' || question.questionType === 'text_image' ? 300 : 150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={(e) => startDrawing(question.id, e)}
                  onMouseMove={(e) => draw(question.id, e)}
                  onMouseUp={() => stopDrawing(question.id)}
                  onMouseLeave={() => stopDrawing(question.id)}
                  onTouchStart={(e) => { e.preventDefault(); startDrawing(question.id, e); }}
                  onTouchMove={(e) => { e.preventDefault(); draw(question.id, e); }}
                  onTouchEnd={() => stopDrawing(question.id)}
                  data-testid={`canvas-answer-${question.id}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use your stylus, finger, or mouse to write your answer
              </p>
            </div>
          )}

          {/* Save individual answer button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveAnswer(question.id)}
              disabled={isSaving}
              data-testid={`button-save-answer-${question.id}`}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Answer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-background">
      {/* Header - Compact for 13.3" e-ink screens */}
      <div className="border-b-2 border-black p-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" data-testid="button-close-answerer">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{worksheet.title}</h1>
            <div className="flex items-center gap-2">
              {worksheet.subject && (
                <span className="text-xs text-muted-foreground">{worksheet.subject}</span>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{totalPages} pages</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {progress.answered}/{progress.total} answered
          </div>
          <Button variant="outline" size="sm" onClick={handleSaveAll} disabled={isSaving} className="h-8 px-3 text-sm" data-testid="button-save-all">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save Work'}
          </Button>
          <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="h-8 px-3 text-sm bg-black text-white hover:bg-gray-800" data-testid="button-submit-worksheet">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Worksheet?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {progress.answered} of {progress.total} questions.
                  Once submitted, you cannot make changes. Are you sure you want to submit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSubmit} data-testid="button-confirm-submit">
                  Submit Worksheet
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page Navigation Sidebar - Narrower for 13.3" screens */}
        <div className="w-40 border-r-2 border-black bg-muted/30 p-3 flex flex-col">
          <div className="font-medium mb-3">Pages</div>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {worksheet.pages.map((page, index) => {
                const pageQuestions = page.questions;
                const answeredOnPage = pageQuestions.filter(q => {
                  const answer = answers[q.id];
                  const strokes = currentStrokes[q.id];
                  return answer?.textAnswer || answer?.selectedOption || (strokes && strokes.length > 0);
                }).length;
                
                return (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPageIndex(index)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      currentPageIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    data-testid={`button-page-${index + 1}`}
                  >
                    <div className="font-medium">Page {page.pageNumber}</div>
                    <div className="text-xs opacity-75">
                      {answeredOnPage}/{pageQuestions.length} answered
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area - Full width for 13.3" e-ink screens */}
        <ScrollArea className="flex-1">
          <div className="p-4 w-full">
            {currentPage ? (
              <>
                <h2 className="text-xl font-bold mb-4">Page {currentPage.pageNumber}</h2>
                {currentPage.questions.map(renderQuestionInput)}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                No questions on this page
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Page Navigation Footer */}
      <div className="border-t p-4 flex items-center justify-center gap-4 bg-card">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          data-testid="button-prev-page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPageIndex + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === totalPages - 1}
          data-testid="button-next-page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
