import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Sparkles, 
  Loader2, 
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy
} from 'lucide-react';

interface GradingResult {
  suggestedScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface AIGradingAssistantProps {
  question: string;
  studentAnswer: string;
  correctAnswer?: string;
  maxPoints: number;
  onApplySuggestion: (score: number, feedback: string) => void;
}

export function AIGradingAssistant({ 
  question, 
  studentAnswer, 
  correctAnswer, 
  maxPoints, 
  onApplySuggestion 
}: AIGradingAssistantProps) {
  const { toast } = useToast();
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [customFeedback, setCustomFeedback] = useState('');

  const { data: aiStatus } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ['/api/ai/status'],
  });

  const gradingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/ai/grading-suggestion', 'POST', {
        question,
        studentAnswer,
        correctAnswer,
        maxPoints,
      });
      return response as GradingResult;
    },
    onSuccess: (result) => {
      setGradingResult(result);
      setCustomFeedback(result.feedback);
      toast({
        title: 'Grading Suggestion Ready',
        description: 'Review the AI suggestion and apply or modify as needed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Generate Suggestion',
        description: error.message || 'An error occurred while generating the grading suggestion.',
        variant: 'destructive',
      });
    },
  });

  const handleApply = () => {
    if (gradingResult) {
      onApplySuggestion(gradingResult.suggestedScore, customFeedback);
      toast({
        title: 'Applied',
        description: 'Grading suggestion has been applied.',
      });
    }
  };

  const handleCopyFeedback = () => {
    navigator.clipboard.writeText(customFeedback);
    toast({
      title: 'Copied',
      description: 'Feedback copied to clipboard.',
    });
  };

  const isConfigured = aiStatus?.configured;

  if (!isConfigured) {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">AI grading assistant requires GEMINI_API_KEY</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!studentAnswer?.trim()) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          No student answer to analyze
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Grading Assistant
        </CardTitle>
        <CardDescription className="text-xs">
          Get AI-powered feedback suggestions for essay and short-answer responses
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!gradingResult ? (
          <Button
            onClick={() => gradingMutation.mutate()}
            disabled={gradingMutation.isPending}
            variant="outline"
            className="w-full gap-2"
            data-testid="button-get-ai-grading"
          >
            {gradingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get AI Suggestion
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Suggested Score:</span>
                <Badge 
                  variant={gradingResult.suggestedScore >= maxPoints * 0.7 ? 'default' : 'secondary'}
                  className="text-lg px-3"
                >
                  {gradingResult.suggestedScore} / {maxPoints}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setGradingResult(null)}
              >
                Regenerate
              </Button>
            </div>

            {gradingResult.strengths.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <ThumbsUp className="h-3 w-3" />
                  Strengths
                </div>
                <ul className="text-xs space-y-1 pl-4">
                  {gradingResult.strengths.map((s, i) => (
                    <li key={i} className="text-muted-foreground list-disc">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {gradingResult.improvements.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Lightbulb className="h-3 w-3" />
                  Areas for Improvement
                </div>
                <ul className="text-xs space-y-1 pl-4">
                  {gradingResult.improvements.map((imp, i) => (
                    <li key={i} className="text-muted-foreground list-disc">{imp}</li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Feedback (editable)</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={handleCopyFeedback}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                rows={3}
                className="text-sm"
                data-testid="textarea-ai-feedback"
              />
            </div>

            <Button
              onClick={handleApply}
              className="w-full gap-2"
              data-testid="button-apply-ai-grading"
            >
              <CheckCircle2 className="h-4 w-4" />
              Apply Score & Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
