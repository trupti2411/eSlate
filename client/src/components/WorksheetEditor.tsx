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
import { AIQuestionGenerator } from './AIQuestionGenerator';
import { RichTextEditor } from './RichTextEditor';
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
  GripVertical,
  Check,
  Info,
  Sparkles,
  X,
  PlusCircle
} from 'lucide-react';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'fill_blank' | 'text_image' | 'information';

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
  worksheetId?: string;
  companyId: string;
  onClose: () => void;
  onSave?: (worksheetId: string) => void;
}

const questionTypeLabels: Record<QuestionType, { label: string; icon: any; description: string }> = {
  short_text: { label: 'Short Answer', icon: Type, description: 'Single line text input' },
  long_text: { label: 'Essay', icon: AlignLeft, description: 'Multi-line text area for longer responses' },
  multiple_choice: { label: 'Multiple Choice', icon: List, description: 'Select one correct answer from options' },
  fill_blank: { label: 'Fill in the Blank', icon: FileText, description: 'Complete the sentence with missing word' },
  text_image: { label: 'Text + Image', icon: Image, description: 'Question with an image attachment' },
  information: { label: 'Information Block', icon: Info, description: 'Display text/instructions without requiring an answer' },
};

const defaultQuestion: Partial<Question> = {
  questionType: 'short_text',
  questionText: '',
  points: 1,
  options: [{ id: '1', text: '', isCorrect: true }, { id: '2', text: '', isCorrect: false }],
};

export function WorksheetEditor({ worksheetId: initialWorksheetId, companyId, onClose, onSave }: WorksheetEditorProps) {
  const { toast } = useToast();
  const [worksheetId, setWorksheetId] = useState<string | undefined>(initialWorksheetId);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editorMode, setEditorMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({ ...defaultQuestion });
  const [newWorksheetTitle, setNewWorksheetTitle] = useState('');
  const [newWorksheetSubject, setNewWorksheetSubject] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const { data: worksheet, isLoading, refetch } = useQuery<Worksheet>({
    queryKey: ['/api/worksheets', worksheetId],
    queryFn: () => fetch(`/api/worksheets/${worksheetId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!worksheetId,
  });

  const createWorksheetMutation = useMutation({
    mutationFn: (data: { title: string; subject?: string; companyId: string }) =>
      apiRequest('/api/worksheets', 'POST', data),
    onSuccess: (newWorksheet: any) => {
      setWorksheetId(newWorksheet.id);
      toast({ title: 'Worksheet created' });
    },
  });

  const updateWorksheetMutation = useMutation({
    mutationFn: (data: Partial<Worksheet>) => 
      apiRequest(`/api/worksheets/${worksheetId}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets', worksheetId] });
      toast({ title: 'Worksheet saved' });
    },
  });

  const addPageMutation = useMutation({
    mutationFn: () => apiRequest(`/api/worksheets/${worksheetId}/pages`, 'POST', {}),
    onSuccess: () => {
      refetch();
      toast({ title: 'Page added' });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest(`/api/worksheets/pages/${pageId}`, 'DELETE'),
    onSuccess: () => {
      refetch();
      if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
      toast({ title: 'Page deleted' });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: (data: { pageId: string; question: Partial<Question> }) =>
      apiRequest(`/api/worksheets/pages/${data.pageId}/questions`, 'POST', data.question),
    onSuccess: () => {
      refetch();
      setNewQuestion({ ...defaultQuestion });
      toast({ title: 'Question added' });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: { questionId: string; updates: Partial<Question> }) =>
      apiRequest(`/api/worksheets/questions/${data.questionId}`, 'PATCH', data.updates),
    onSuccess: () => {
      refetch();
      setEditingQuestion(null);
      setEditorMode('closed');
      toast({ title: 'Question updated' });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => apiRequest(`/api/worksheets/questions/${questionId}`, 'DELETE'),
    onSuccess: () => {
      refetch();
      toast({ title: 'Question deleted' });
    },
  });

  const openAddPanel = () => {
    setEditorMode('add');
    setEditingQuestion(null);
    setNewQuestion({ ...defaultQuestion });
  };

  const openEditPanel = (question: Question) => {
    setEditorMode('edit');
    setEditingQuestion(question);
  };

  const closePanel = () => {
    setEditorMode('closed');
    setEditingQuestion(null);
  };

  if (isLoading && worksheetId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading worksheet...</div>
      </div>
    );
  }

  if (!worksheetId) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Create New Worksheet</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-worksheet-title">Worksheet Title *</Label>
              <Input
                id="new-worksheet-title"
                value={newWorksheetTitle}
                onChange={(e) => setNewWorksheetTitle(e.target.value)}
                placeholder="Enter worksheet title"
              />
            </div>
            <div>
              <Label htmlFor="new-worksheet-subject">Subject (optional)</Label>
              <Input
                id="new-worksheet-subject"
                value={newWorksheetSubject}
                onChange={(e) => setNewWorksheetSubject(e.target.value)}
                placeholder="e.g., Mathematics, English"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!newWorksheetTitle.trim()) {
                    toast({ title: 'Error', description: 'Please enter a title', variant: 'destructive' });
                    return;
                  }
                  createWorksheetMutation.mutate({
                    title: newWorksheetTitle,
                    subject: newWorksheetSubject || undefined,
                    companyId,
                  });
                }}
                disabled={createWorksheetMutation.isPending}
              >
                {createWorksheetMutation.isPending ? 'Creating...' : 'Create Worksheet'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
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

  const handleAddQuestion = (addAnother = false) => {
    if (!currentPage || !newQuestion.questionText) return;
    
    addQuestionMutation.mutate({
      pageId: currentPage.id,
      question: newQuestion,
    }, {
      onSuccess: () => {
        if (!addAnother) {
          setEditorMode('closed');
        }
      }
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion?.id) return;
    
    updateQuestionMutation.mutate({
      questionId: editingQuestion.id,
      updates: editingQuestion,
    });
  };

  const renderQuestionForm = (question: Partial<Question>, onChange: (q: Partial<Question>) => void) => (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Question Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(questionTypeLabels).map(([type, { label, icon: Icon, description }]) => (
            <button
              key={type}
              onClick={() => onChange({ ...question, questionType: type as QuestionType })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                question.questionType === type
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              data-testid={`question-type-${type}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-semibold mb-2 block">
          {question.questionType === 'information' ? 'Content' : 'Question Text'}
        </Label>
        {question.questionType === 'information' ? (
          <>
            <RichTextEditor
              content={question.questionText || ''}
              onChange={(content) => onChange({ ...question, questionText: content })}
              placeholder="Enter information, instructions, or content to display..."
              minHeight="250px"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This content will be displayed to students without requiring an answer. You can add tables, highlight text, and format content.
            </p>
          </>
        ) : (
          <Textarea
            value={question.questionText || ''}
            onChange={(e) => onChange({ ...question, questionText: e.target.value })}
            placeholder="Enter your question..."
            className="min-h-[120px] text-base"
            data-testid="input-question-text"
          />
        )}
      </div>

      {question.questionType === 'multiple_choice' && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Answer Options</Label>
          <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
          {(question.options || []).map((option, index) => (
            <div key={option.id} className="flex items-center gap-3">
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
                className="w-5 h-5"
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
                  <Trash2 className="h-4 w-4 text-red-500" />
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
          <Label className="text-sm font-semibold mb-2 block">Correct Answer</Label>
          <Input
            value={question.correctAnswer || ''}
            onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
            placeholder="Enter the correct answer"
            data-testid="input-correct-answer"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Use underscores (___) in the question to indicate the blank
          </p>
        </div>
      )}

      {question.questionType === 'text_image' && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">Image URL</Label>
          <Input
            value={question.imageUrl || ''}
            onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
            placeholder="Enter image URL"
            data-testid="input-image-url"
          />
        </div>
      )}

      {question.questionType !== 'information' && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">Points</Label>
          <Input
            type="number"
            min="1"
            value={question.points || 1}
            onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
            className="w-24"
            data-testid="input-points"
          />
        </div>
      )}
    </div>
  );

  const renderQuestion = (question: Question, index: number) => {
    const typeInfo = questionTypeLabels[question.questionType];
    const Icon = typeInfo.icon;
    const isSelected = editorMode === 'edit' && editingQuestion?.id === question.id;

    return (
      <Card 
        key={question.id} 
        className={`mb-3 border-2 cursor-pointer transition-all ${
          isSelected ? 'border-black ring-2 ring-black/10' : 'hover:border-gray-400'
        }`}
        onClick={() => openEditPanel(question)}
      >
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-bold text-base w-6">{question.questionNumber}.</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase">{typeInfo.label}</span>
                {question.questionType !== 'information' && (
                  <span className="text-xs text-muted-foreground">({question.points} pts)</span>
                )}
              </div>
              {question.questionType === 'information' ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm line-clamp-2">
                  <div dangerouslySetInnerHTML={{ __html: question.questionText }} className="prose prose-sm max-w-none" />
                </div>
              ) : (
                <p className="text-sm line-clamp-2">{question.questionText}</p>
              )}
              
              {question.questionType === 'multiple_choice' && question.options && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {question.options.length} options
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                question.id && deleteQuestionMutation.mutate(question.id);
              }}
              data-testid={`button-delete-question-${index}`}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isPanelOpen = editorMode !== 'closed';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-editor">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={worksheet.title}
              onChange={(e) => updateWorksheetMutation.mutate({ title: e.target.value })}
              className="text-lg font-bold border-none focus:ring-0 p-0 h-auto"
              placeholder="Worksheet Title"
              data-testid="input-worksheet-title"
            />
            <div className="flex items-center gap-2 mt-0.5">
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
          {onSave && (
            <Button 
              variant="default" 
              onClick={() => {
                if (!worksheet.isPublished) {
                  updateWorksheetMutation.mutate({ isPublished: true });
                }
                onSave(worksheet.id);
              }}
              data-testid="button-save-and-use"
            >
              <Check className="h-4 w-4 mr-2" /> Save & Use
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page Navigation Sidebar */}
        <div className="w-44 border-r bg-muted/30 p-3 flex flex-col">
          <div className="font-medium text-sm mb-2">Pages</div>
          <ScrollArea className="flex-1">
            <div className="space-y-1.5">
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
                  <div className="font-medium text-sm">Page {page.pageNumber}</div>
                  <div className="text-xs opacity-75">{page.questions.length} questions</div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <Separator className="my-2" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPageMutation.mutate()}
            className="w-full text-xs"
            data-testid="button-add-page"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Page
          </Button>
          {totalPages > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentPage && deletePageMutation.mutate(currentPage.id)}
              className="w-full mt-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
              data-testid="button-delete-page"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete Page
            </Button>
          )}
        </div>

        {/* Main Content Area - Question List */}
        <div className={`flex-1 overflow-auto transition-all ${isPanelOpen ? 'w-1/2' : 'w-full'}`}>
          {currentPage ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Page {currentPage.pageNumber}</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIGenerator(true)}
                    data-testid="button-ai-generate"
                  >
                    <Sparkles className="h-4 w-4 mr-1" /> AI Generate
                  </Button>
                  <Button 
                    size="sm"
                    onClick={openAddPanel}
                    data-testid="button-add-question"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Question
                  </Button>
                </div>
              </div>

              {currentPage.questions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-base font-medium mb-1">No questions yet</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Click "Add Question" to create your first question
                    </p>
                    <Button size="sm" onClick={openAddPanel} data-testid="button-add-first-question">
                      <Plus className="h-4 w-4 mr-1" /> Add Question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {currentPage.questions.map((question, index) => renderQuestion(question, index))}
                </div>
              )}
            </div>
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

        {/* Right Panel - Question Editor */}
        {isPanelOpen && (
          <div className="w-1/2 border-l bg-card flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editorMode === 'add' ? 'Add Question' : 'Edit Question'}
              </h3>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {editorMode === 'add' && renderQuestionForm(newQuestion, setNewQuestion)}
              {editorMode === 'edit' && editingQuestion && renderQuestionForm(editingQuestion, (q) => setEditingQuestion(q as Question))}
            </ScrollArea>
            <div className="p-4 border-t bg-muted/30 flex gap-2">
              {editorMode === 'add' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAddQuestion(true)}
                    disabled={!newQuestion.questionText || addQuestionMutation.isPending}
                    className="flex-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add & Create Another
                  </Button>
                  <Button
                    onClick={() => handleAddQuestion(false)}
                    disabled={!newQuestion.questionText || addQuestionMutation.isPending}
                    className="flex-1"
                    data-testid="button-confirm-add-question"
                  >
                    {addQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={closePanel} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateQuestion} 
                    disabled={updateQuestionMutation.isPending}
                    className="flex-1"
                    data-testid="button-confirm-edit-question"
                  >
                    {updateQuestionMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Question Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <AIQuestionGenerator
            subject={worksheet.subject}
            onAddQuestion={(q) => {
              if (currentPage) {
                addQuestionMutation.mutate({
                  pageId: currentPage.id,
                  question: {
                    ...q,
                    questionType: q.questionType as QuestionType,
                  },
                });
              }
            }}
            onClose={() => setShowAIGenerator(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Page Navigation Footer */}
      <div className="border-t p-2 flex items-center justify-center gap-4 bg-card">
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
