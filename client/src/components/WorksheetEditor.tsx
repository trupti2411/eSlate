import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  AlignLeft, 
  List, 
  Type, 
  Image,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Send,
  GripVertical
} from 'lucide-react';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'fill_blank' | 'text_image';

interface Question {
  id?: string;
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
  companyId: string;
  createdBy: string;
  isPublished: boolean;
  dueDate?: string;
  pages: Page[];
}

interface WorksheetEditorProps {
  worksheetId: string;
  companyId: string;
  onClose: () => void;
}

const questionTypeLabels: Record<QuestionType, { label: string; icon: any; description: string }> = {
  short_text: { label: 'Short Answer', icon: Type, description: 'Single line text input' },
  long_text: { label: 'Essay', icon: AlignLeft, description: 'Multi-line text area for longer responses' },
  multiple_choice: { label: 'Multiple Choice', icon: List, description: 'Select one correct answer from options' },
  fill_blank: { label: 'Fill in the Blank', icon: FileText, description: 'Complete the sentence with missing word' },
  text_image: { label: 'Text + Image', icon: Image, description: 'Question with an image attachment' },
};

export function WorksheetEditor({ worksheetId, companyId, onClose }: WorksheetEditorProps) {
  const { toast } = useToast();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    questionType: 'short_text',
    questionText: '',
    points: 1,
    options: [{ id: '1', text: '', isCorrect: true }, { id: '2', text: '', isCorrect: false }],
  });

  const { data: worksheet, isLoading, refetch } = useQuery<Worksheet>({
    queryKey: ['/api/worksheets', worksheetId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId,
  });

  const updateWorksheetMutation = useMutation({
    mutationFn: (data: Partial<Worksheet>) => 
      apiRequest('PATCH', `/api/worksheets/${worksheetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets', worksheetId] });
      toast({ title: 'Worksheet saved' });
    },
  });

  const addPageMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/worksheets/${worksheetId}/pages`, {}),
    onSuccess: () => {
      refetch();
      toast({ title: 'Page added' });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest('DELETE', `/api/worksheets/pages/${pageId}`),
    onSuccess: () => {
      refetch();
      if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
      toast({ title: 'Page deleted' });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: (data: { pageId: string; question: Partial<Question> }) =>
      apiRequest('POST', `/api/worksheets/pages/${data.pageId}/questions`, data.question),
    onSuccess: () => {
      refetch();
      setShowAddQuestion(false);
      setNewQuestion({
        questionType: 'short_text',
        questionText: '',
        points: 1,
        options: [{ id: '1', text: '', isCorrect: true }, { id: '2', text: '', isCorrect: false }],
      });
      toast({ title: 'Question added' });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: { questionId: string; updates: Partial<Question> }) =>
      apiRequest('PATCH', `/api/worksheets/questions/${data.questionId}`, data.updates),
    onSuccess: () => {
      refetch();
      setEditingQuestion(null);
      toast({ title: 'Question updated' });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => apiRequest('DELETE', `/api/worksheets/questions/${questionId}`),
    onSuccess: () => {
      refetch();
      toast({ title: 'Question deleted' });
    },
  });

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

  const currentPage = worksheet.pages[currentPageIndex];
  const totalPages = worksheet.pages.length;

  const handleAddQuestion = () => {
    if (!currentPage || !newQuestion.questionText) return;
    
    addQuestionMutation.mutate({
      pageId: currentPage.id,
      question: newQuestion,
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion?.id) return;
    
    updateQuestionMutation.mutate({
      questionId: editingQuestion.id,
      updates: editingQuestion,
    });
  };

  const renderQuestionForm = (question: Partial<Question>, onChange: (q: Partial<Question>) => void, isEditing = false) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="questionType">Question Type</Label>
        <Select
          value={question.questionType}
          onValueChange={(value: QuestionType) => onChange({ ...question, questionType: value })}
        >
          <SelectTrigger data-testid="select-question-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(questionTypeLabels).map(([type, { label, description }]) => (
              <SelectItem key={type} value={type} data-testid={`question-type-${type}`}>
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="questionText">Question Text</Label>
        <Textarea
          id="questionText"
          value={question.questionText || ''}
          onChange={(e) => onChange({ ...question, questionText: e.target.value })}
          placeholder="Enter your question..."
          className="min-h-[80px]"
          data-testid="input-question-text"
        />
      </div>

      {question.questionType === 'multiple_choice' && (
        <div className="space-y-2">
          <Label>Answer Options</Label>
          {(question.options || []).map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={option.isCorrect}
                onChange={() => {
                  const newOptions = (question.options || []).map((o, i) => ({
                    ...o,
                    isCorrect: i === index,
                  }));
                  onChange({ ...question, options: newOptions });
                }}
                data-testid={`radio-correct-${index}`}
              />
              <Input
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[index] = { ...newOptions[index], text: e.target.value };
                  onChange({ ...question, options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
                data-testid={`input-option-${index}`}
              />
              {(question.options || []).length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newOptions = (question.options || []).filter((_, i) => i !== index);
                    onChange({ ...question, options: newOptions });
                  }}
                  data-testid={`button-remove-option-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newOptions = [...(question.options || []), { id: String(Date.now()), text: '', isCorrect: false }];
              onChange({ ...question, options: newOptions });
            }}
            data-testid="button-add-option"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Option
          </Button>
        </div>
      )}

      {question.questionType === 'fill_blank' && (
        <div>
          <Label htmlFor="correctAnswer">Correct Answer</Label>
          <Input
            id="correctAnswer"
            value={question.correctAnswer || ''}
            onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
            placeholder="Enter the correct answer"
            data-testid="input-correct-answer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use underscores (___) in the question to indicate the blank
          </p>
        </div>
      )}

      {question.questionType === 'text_image' && (
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={question.imageUrl || ''}
            onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
            placeholder="Enter image URL"
            data-testid="input-image-url"
          />
        </div>
      )}

      <div>
        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          type="number"
          min="1"
          value={question.points || 1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
          className="w-24"
          data-testid="input-points"
        />
      </div>
    </div>
  );

  const renderQuestion = (question: Question, index: number) => {
    const typeInfo = questionTypeLabels[question.questionType];
    const Icon = typeInfo.icon;

    return (
      <Card key={question.id} className="mb-4 border-2 hover:border-primary/50 transition-colors">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GripVertical className="h-5 w-5 cursor-move" />
              <span className="font-bold text-lg">{question.questionNumber}.</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase">{typeInfo.label}</span>
                <span className="text-xs text-muted-foreground">({question.points} pts)</span>
              </div>
              <p className="text-lg mb-2">{question.questionText}</p>
              
              {question.questionType === 'multiple_choice' && question.options && (
                <div className="space-y-1 ml-4">
                  {question.options.map((option: any, i: number) => (
                    <div key={i} className={`flex items-center gap-2 ${option.isCorrect ? 'text-green-700 font-medium' : ''}`}>
                      <div className={`w-4 h-4 rounded-full border-2 ${option.isCorrect ? 'border-green-600 bg-green-100' : 'border-gray-400'}`} />
                      <span>{option.text}</span>
                      {option.isCorrect && <span className="text-xs">(correct)</span>}
                    </div>
                  ))}
                </div>
              )}

              {question.questionType === 'fill_blank' && question.correctAnswer && (
                <p className="text-sm text-green-700">Answer: {question.correctAnswer}</p>
              )}

              {question.questionType === 'text_image' && question.imageUrl && (
                <img src={question.imageUrl} alt="Question" className="max-w-xs rounded mt-2" />
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingQuestion(question)}
                data-testid={`button-edit-question-${index}`}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => question.id && deleteQuestionMutation.mutate(question.id)}
                data-testid={`button-delete-question-${index}`}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-editor">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={worksheet.title}
              onChange={(e) => updateWorksheetMutation.mutate({ title: e.target.value })}
              className="text-xl font-bold border-none focus:ring-0 p-0 h-auto"
              placeholder="Worksheet Title"
              data-testid="input-worksheet-title"
            />
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={worksheet.subject || ''}
                onChange={(e) => updateWorksheetMutation.mutate({ subject: e.target.value })}
                className="text-sm text-muted-foreground border-none focus:ring-0 p-0 h-auto w-32"
                placeholder="Subject"
                data-testid="input-worksheet-subject"
              />
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{totalPages} pages</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => updateWorksheetMutation.mutate({ isPublished: !worksheet.isPublished })}
            data-testid="button-toggle-publish"
          >
            {worksheet.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="default" data-testid="button-assign-worksheet">
            <Send className="h-4 w-4 mr-2" /> Assign
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page Navigation Sidebar */}
        <div className="w-48 border-r bg-muted/30 p-4 flex flex-col">
          <div className="font-medium mb-3">Pages</div>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {worksheet.pages.map((page, index) => (
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
                  <div className="text-xs opacity-75">{page.questions.length} questions</div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <Separator className="my-3" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPageMutation.mutate()}
            className="w-full"
            data-testid="button-add-page"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Page
          </Button>
          {totalPages > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentPage && deletePageMutation.mutate(currentPage.id)}
              className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-delete-page"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Page
            </Button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {currentPage ? (
            <>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Page {currentPage.pageNumber}</h2>
                  <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-question">
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                      </DialogHeader>
                      {renderQuestionForm(newQuestion, setNewQuestion)}
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddQuestion(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddQuestion}
                          disabled={!newQuestion.questionText}
                          data-testid="button-confirm-add-question"
                        >
                          Add Question
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {currentPage.questions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Click "Add Question" to create your first question on this page
                      </p>
                      <Button onClick={() => setShowAddQuestion(true)} data-testid="button-add-first-question">
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {currentPage.questions.map((question, index) => renderQuestion(question, index))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No pages found</p>
                <Button onClick={() => addPageMutation.mutate()} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create First Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && renderQuestionForm(editingQuestion, (q) => setEditingQuestion(q as Question), true)}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} data-testid="button-confirm-edit-question">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
