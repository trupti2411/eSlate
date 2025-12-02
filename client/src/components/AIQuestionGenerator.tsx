import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  Plus,
  AlertCircle,
  Wand2,
  BookOpen
} from 'lucide-react';

interface GeneratedQuestion {
  type: 'multiple_choice' | 'short_text' | 'long_text' | 'fill_blank' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  helpText: string;
  points: number;
}

interface AIQuestionGeneratorProps {
  subject?: string;
  onAddQuestion: (question: {
    questionType: string;
    questionText: string;
    correctAnswer?: string;
    helpText?: string;
    points?: number;
    options?: { id: string; text: string; isCorrect: boolean }[];
  }) => void;
  onClose: () => void;
}

const questionTypeOptions = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_text', label: 'Short Answer' },
  { value: 'long_text', label: 'Essay' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'true_false', label: 'True/False' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Basic comprehension questions' },
  { value: 'medium', label: 'Medium', description: 'Application and analysis' },
  { value: 'hard', label: 'Hard', description: 'Critical thinking and synthesis' },
];

const gradeLevelOptions = [
  { value: 'elementary', label: 'Elementary (K-5)' },
  { value: 'middle', label: 'Middle School (6-8)' },
  { value: 'high', label: 'High School (9-12)' },
  { value: 'college', label: 'College/University' },
];

export function AIQuestionGenerator({ subject, onAddQuestion, onClose }: AIQuestionGeneratorProps) {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [subjectInput, setSubjectInput] = useState(subject || '');
  const [gradeLevel, setGradeLevel] = useState('middle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['multiple_choice', 'short_text']);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

  const { data: aiStatus } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ['/api/ai/status'],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/ai/generate-questions', 'POST', {
        subject: subjectInput,
        topic,
        gradeLevel,
        questionTypes: selectedTypes,
        count,
        difficulty,
      });
      return response.questions as GeneratedQuestion[];
    },
    onSuccess: (questions) => {
      setGeneratedQuestions(questions);
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
      toast({
        title: 'Questions Generated',
        description: `Successfully generated ${questions.length} questions`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate questions',
        variant: 'destructive',
      });
    },
  });

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleToggleQuestion = (index: number) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    const questionsToAdd = generatedQuestions.filter((_, i) => selectedQuestions.has(i));
    
    questionsToAdd.forEach((q, idx) => {
      let questionType = q.type;
      if (q.type === 'true_false') {
        questionType = 'multiple_choice' as any;
      }
      
      const questionData: any = {
        questionType,
        questionText: q.question,
        correctAnswer: q.correctAnswer,
        helpText: q.helpText,
        points: q.points,
      };

      if (q.type === 'multiple_choice' && q.options) {
        questionData.options = q.options.map((opt, i) => ({
          id: String(i + 1),
          text: opt.replace(/^[A-D]\)\s*/, ''),
          isCorrect: q.correctAnswer.startsWith(opt.charAt(0)) || opt.includes(q.correctAnswer),
        }));
      } else if (q.type === 'true_false') {
        questionData.options = [
          { id: '1', text: 'True', isCorrect: q.correctAnswer.toLowerCase() === 'true' },
          { id: '2', text: 'False', isCorrect: q.correctAnswer.toLowerCase() === 'false' },
        ];
      }

      onAddQuestion(questionData);
    });

    toast({
      title: 'Questions Added',
      description: `Added ${questionsToAdd.length} questions to worksheet`,
    });
    
    onClose();
  };

  const isConfigured = aiStatus?.configured;

  if (!isConfigured) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <div>
              <h3 className="font-semibold text-lg">AI Features Not Configured</h3>
              <p className="text-muted-foreground mt-2">
                To use AI-powered question generation, please configure your Google Gemini API key.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add <code className="bg-muted px-1 rounded">GEMINI_API_KEY</code> to your environment variables.
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Question Generator
        </CardTitle>
        <CardDescription>
          Generate worksheet questions automatically using AI. Review and select which questions to add.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {generatedQuestions.length === 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g., Mathematics, Science, History"
                  data-testid="input-ai-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger data-testid="select-ai-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevelOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe the specific topic you want questions about. e.g., 'Photosynthesis and how plants convert sunlight into energy'"
                rows={3}
                data-testid="input-ai-topic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                  <SelectTrigger data-testid="select-ai-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  data-testid="input-ai-count"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="flex flex-wrap gap-2">
                {questionTypeOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedTypes.includes(opt.value) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={selectedTypes.includes(opt.value)}
                      onCheckedChange={() => handleToggleType(opt.value)}
                      className="sr-only"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Generated Questions</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedQuestions.size} of {generatedQuestions.length} selected
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeneratedQuestions([]);
                  setSelectedQuestions(new Set());
                }}
              >
                Generate New
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <Card 
                    key={idx} 
                    className={`cursor-pointer transition-colors ${
                      selectedQuestions.has(idx) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleToggleQuestion(idx)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedQuestions.has(idx) ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                          {selectedQuestions.has(idx) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {q.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {q.points} pts
                            </Badge>
                          </div>
                          <p className="font-medium">{q.question}</p>
                          {q.options && (
                            <div className="pl-4 space-y-1">
                              {q.options.map((opt, i) => (
                                <p key={i} className={`text-sm ${
                                  opt.includes(q.correctAnswer) || q.correctAnswer.startsWith(opt.charAt(0))
                                    ? 'text-green-600 font-medium' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {opt}
                                </p>
                              ))}
                            </div>
                          )}
                          {!q.options && (
                            <p className="text-sm text-green-600">
                              Answer: {q.correctAnswer}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground italic">
                            Hint: {q.helpText}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>

      <Separator />
      
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        
        {generatedQuestions.length === 0 ? (
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !topic.trim() || !subjectInput.trim() || selectedTypes.length === 0}
            className="gap-2"
            data-testid="button-generate-questions"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleAddSelected}
            disabled={selectedQuestions.size === 0}
            className="gap-2"
            data-testid="button-add-selected-questions"
          >
            <Plus className="h-4 w-4" />
            Add {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
