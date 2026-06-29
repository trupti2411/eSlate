import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams } from 'wouter';
import { ChevronLeft, Send, Check, AlertCircle, Star, FileText, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  maxMarks: number;
  answer: string | null;
  score: number | null;
  tutorComment: string | null;
  isHandwritten: boolean;
}
interface AllocationDetail {
  id: string;
  assignmentTitle: string;
  instructions: string | null;
  status: 'assigned' | 'in_progress' | 'submitted' | 'returned' | 'overdue';
  dueDate: string | null;
  isLate: boolean;
  totalScore: number | null;
  maxMarks: number | null;
  overallFeedback: string | null;
  questions: QuestionAnswer[];
}

export default function LibraryAssignmentWork() {
  const { user } = useAuth();
  const params = useParams<{ allocationId: string }>();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersInitialised = useRef(false);

  const { data: allocation, isLoading } = useQuery<AllocationDetail>({
    queryKey: [`/api/me/library-assignments/${params.allocationId}`],
    enabled: !!params.allocationId && !!user?.id,
  });

  // Initialise answers from fetched data (once)
  useEffect(() => {
    if (allocation && !answersInitialised.current) {
      answersInitialised.current = true;
      const initial: Record<string, string> = {};
      allocation.questions.forEach(q => { initial[q.questionId] = q.answer ?? ''; });
      setAnswers(initial);
    }
  }, [allocation]);

  const saveDraftMutation = useMutation({
    mutationFn: (ans: Record<string, string>) =>
      apiRequest('PATCH', `/api/me/library-assignments/${params.allocationId}/draft`, { answers: ans }),
    onMutate: () => setAutoSaveStatus('saving'),
    onSuccess: () => setAutoSaveStatus('saved'),
    onError: () => setAutoSaveStatus('idle'),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', `/api/me/library-assignments/${params.allocationId}/submit`, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/me/library-assignments/${params.allocationId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/me/library-assignments'] });
      setShowConfirm(false);
    },
    onError: (e: any) => {
      setSubmitError(e?.message ?? 'Failed to submit. Please try again.');
      setShowConfirm(false);
    },
  });

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value };
      setAutoSaveStatus('idle');
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => saveDraftMutation.mutate(next), 1500);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Assignment not found.</p>
          <Link href="/student/library-assignments" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">
            Back to assignments
          </Link>
        </div>
      </div>
    );
  }

  const isReturned = allocation.status === 'returned';
  const isSubmitted = allocation.status === 'submitted';
  const isEditable = !isReturned && !isSubmitted;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/student/library-assignments" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Assignment</p>
            <h1 className="text-xl font-black truncate">{allocation.assignmentTitle}</h1>
          </div>
          {isEditable && (
            <span className="text-xs text-indigo-200 flex items-center gap-1 flex-shrink-0">
              {autoSaveStatus === 'saving' && <><Clock size={11} /> Saving…</>}
              {autoSaveStatus === 'saved' && <><Check size={11} /> Saved</>}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Info + score banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {allocation.dueDate && (
                <p className={`text-sm flex items-center gap-1.5 mb-2 ${allocation.isLate ? 'text-rose-600 font-semibold' : 'text-gray-500'}`}>
                  <Clock size={13} />
                  Due {new Date(allocation.dueDate).toLocaleDateString('en-AU', {
                    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {allocation.isLate && ' (overdue)'}
                </p>
              )}
              {allocation.instructions && (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{allocation.instructions}</p>
              )}
            </div>
            {isReturned && allocation.totalScore != null && allocation.maxMarks != null && (
              <div className="text-center bg-emerald-50 rounded-xl px-4 py-3 flex-shrink-0">
                <p className="text-2xl font-black text-emerald-700">{allocation.totalScore}/{allocation.maxMarks}</p>
                <p className="text-xs text-emerald-600 font-semibold">Your Score</p>
              </div>
            )}
          </div>
          {isReturned && allocation.overallFeedback && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Tutor Feedback
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{allocation.overallFeedback}</p>
            </div>
          )}
        </div>

        {submitError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} /> {submitError}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {allocation.questions.map((q, i) => (
            <div key={q.questionId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{q.questionText}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isReturned && q.score != null && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <Star size={11} /> {q.score}/{q.maxMarks}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{q.maxMarks} marks</span>
                </div>
              </div>

              {q.isHandwritten ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 italic">
                  Handwriting submitted
                </div>
              ) : isEditable ? (
                <textarea
                  value={answers[q.questionId] ?? ''}
                  onChange={e => handleAnswerChange(q.questionId, e.target.value)}
                  rows={4}
                  placeholder="Type your answer here…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[60px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {answers[q.questionId] || q.answer || (
                      <span className="text-gray-400 italic">No answer provided</span>
                    )}
                  </p>
                </div>
              )}

              {isReturned && q.tutorComment && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
                    <FileText size={11} /> Tutor Comment
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{q.tutorComment}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit / status */}
        {isEditable && (
          <div className="flex justify-end pb-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm"
            >
              <Send size={15} /> Submit Assignment
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold px-4 py-4 rounded-2xl flex items-center gap-3 mb-6">
            <Check size={16} className="text-purple-500 flex-shrink-0" />
            Assignment submitted — awaiting review from your tutor.
          </div>
        )}
      </main>

      {/* Confirm submit dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-gray-900 mb-2">Submit Assignment?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Once submitted you won't be able to edit your answers. Make sure you've answered all questions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? 'Submitting…' : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
