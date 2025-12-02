import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Lightbulb, 
  Loader2, 
  ChevronRight,
  AlertCircle,
  Lock
} from 'lucide-react';

interface AIHintButtonProps {
  question: string;
  questionType: string;
  correctAnswer?: string;
  helpText?: string;
  studentAttempt?: string;
  disabled?: boolean;
}

export function AIHintButton({ 
  question, 
  questionType, 
  correctAnswer, 
  helpText, 
  studentAttempt,
  disabled 
}: AIHintButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  const { data: aiStatus } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ['/api/ai/status'],
  });

  const hintMutation = useMutation({
    mutationFn: async (level: 1 | 2 | 3) => {
      const response = await apiRequest('/api/ai/student-hint', 'POST', {
        question,
        questionType,
        correctAnswer,
        helpText,
        studentAttempt,
        hintLevel: level,
      });
      return response.hint as string;
    },
    onSuccess: (hint) => {
      setHints(prev => [...prev, hint]);
      setCurrentLevel(prev => prev + 1);
    },
    onError: (error: any) => {
      if (error.message?.includes('disabled by your parent')) {
        toast({
          title: 'Hints Disabled',
          description: 'AI hints have been disabled by your parent. Please contact them to enable this feature.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Could not get hint',
          description: error.message || 'Failed to generate hint. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleGetHint = () => {
    if (currentLevel < 3) {
      hintMutation.mutate((currentLevel + 1) as 1 | 2 | 3);
    }
  };

  const isConfigured = aiStatus?.configured;

  if (!isConfigured) {
    return null;
  }

  const hintLevelLabels = ['Small Hint', 'Medium Hint', 'Big Hint'];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          disabled={disabled}
          data-testid="button-get-hint"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="text-xs">Hint</span>
          {currentLevel > 0 && (
            <span className="text-xs bg-amber-100 px-1.5 rounded-full">{currentLevel}/3</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              AI Hints
            </h4>
            <span className="text-xs text-muted-foreground">
              {currentLevel}/3 used
            </span>
          </div>

          {hints.length > 0 && (
            <div className="space-y-2">
              {hints.map((hint, idx) => (
                <Card key={idx} className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-amber-600 whitespace-nowrap">
                        {hintLevelLabels[idx]}:
                      </span>
                      <p className="text-sm text-gray-700">{hint}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {currentLevel < 3 ? (
            <Button
              onClick={handleGetHint}
              disabled={hintMutation.isPending}
              variant="outline"
              size="sm"
              className="w-full gap-2 border-amber-200 hover:bg-amber-50"
              data-testid="button-next-hint"
            >
              {hintMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting hint...
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Get {hintLevelLabels[currentLevel]}
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-2">
              <Lock className="h-4 w-4 inline mr-1" />
              All hints used for this question
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Hints get progressively more helpful. Try solving on your own first!
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
