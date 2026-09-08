import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams, useLocation } from 'wouter';
import { ChevronLeft, Check, AlertCircle, FileText, RefreshCw, Pen, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { LibraryAnnotator } from '@/components/LibraryAnnotator';

interface QuestionReview {
  questionId: string;
  questionText: string;
  questionType: string;
  maxMarks: number;
  studentAnswer: string | null;
  ocrTranscription: string | null;
  provisionalScore: number | null;
  isHandwritten: boolean;
  answerImageUrl: string | null;
}
interface QuestionLocal extends QuestionReview {
  finalScore: string;
  tutorComment: string;
}
interface SubmissionReview {
  id: string;
  studentName: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  isLate: boolean;
  maxMarks: number;
  tutorAnnotations: string | null;
  questions: QuestionReview[];
}

export default function LibraryMarkingDetail() {
  const { user } = useAuth();
  const params = useParams<{ submissionId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [localQuestions, setLocalQuestions] = useState<QuestionLocal[]>([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [grantResubmission, setGrantResubmission] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [markError, setMarkError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [initialised, setInitialised] = useState(false);
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [tutorAnnotations, setTutorAnnotations] = useState<string | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);

  const { data: review, isLoading } = useQuery<SubmissionReview>({
    queryKey: [`/api/library-submissions/${params.submissionId}/review`],
    enabled: !!params.submissionId && !!user?.id,
  });

  useEffect(() => {
    if (review && !initialised) {
      setInitialised(true);
      setLocalQuestions(review.questions.map(q => ({
        ...q,
        finalScore: q.provisionalScore != null ? String(q.provisionalScore) : '',
        tutorComment: '',
      })));
      setTutorAnnotations(review.tutorAnnotations ?? null);
    }
  }, [review, initialised]);

  const saveAnnotationsMutation = useMutation({
    mutationFn: (annotationsJson: string) =>
      apiRequest(`/api/submissions/${params.submissionId}/save-progress`, 'PATCH', { tutorAnnotations: annotationsJson }),
    onSuccess: (_data, annotationsJson) => setTutorAnnotations(annotationsJson),
  });

  const saveProgressMutation = useMutation({
    mutationFn: () => apiRequest(`/api/submissions/${params.submissionId}/save-progress`, 'PATCH', {
      overallFeedback,
      tutorAnnotations,
    }),
    onSuccess: () => {
      setProgressSaved(true);
      setTimeout(() => setProgressSaved(false), 2500);
    },
  });

  const updateMarkMutation = useMutation({
    mutationFn: (payload: { questionId: string; finalScore: number; tutorComment: string }) =>
      apiRequest(`/api/submissions/${params.submissionId}/marks`, 'PATCH', payload),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => setSaveStatus('saved'),
    onError: () => setSaveStatus('idle'),
  });

  const finaliseMutation = useMutation({
    mutationFn: () => apiRequest(`/api/submissions/${params.submissionId}/finalise`, 'POST', {
      overallFeedback,
      grantResubmission,
      tutorAnnotations,
      questions: localQuestions.map(q => ({
        questionId: q.questionId,
        finalScore: Number(q.finalScore) || 0,
        tutorComment: q.tutorComment,
      })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me/marking-queue'] });
      navigate('/company/library-marking');
    },
    onError: (e: any) => {
      setMarkError(e?.message ?? 'Failed to finalise. Please try again.');
      setShowConfirm(false);
    },
  });

  const updateLocal = (questionId: string, field: 'finalScore' | 'tutorComment', value: string) => {
    setLocalQuestions(prev => prev.map(q => q.questionId === questionId ? { ...q, [field]: value } : q));
  };

  const handleBlur = (q: QuestionLocal) => {
    const score = Number(q.finalScore);
    if (!isNaN(score) && score >= 0 && score <= q.maxMarks) {
      updateMarkMutation.mutate({ questionId: q.questionId, finalScore: score, tutorComment: q.tutorComment });
    }
  };

  const totalFinalScore = localQuestions.reduce((s, q) => s + (Number(q.finalScore) || 0), 0);
  const totalMaxMarks = review?.maxMarks ?? localQuestions.reduce((s, q) => s + q.maxMarks, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Submission not found.</p>
          <Link href="/company/library-marking" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">
            Back to queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company/library-marking" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Marking</p>
            <h1 className="text-xl font-black truncate">{review.assignmentTitle}</h1>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-indigo-200 font-semibold">{review.studentName}</p>
            <p className="text-xs text-indigo-300">{review.className}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Meta + running total */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Student</p>
            <p className="font-bold text-gray-900">{review.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Submitted</p>
            <p className="font-semibold text-gray-700">
              {new Date(review.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Timing</p>
            <p className={`font-semibold ${review.isLate ? 'text-rose-600' : 'text-green-600'}`}>
              {review.isLate ? 'Late submission' : 'On time'}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-bold uppercase text-gray-500">Running Total</p>
            <p className="text-2xl font-black text-indigo-700">
              {totalFinalScore}<span className="text-sm text-gray-400 font-normal">/{totalMaxMarks}</span>
            </p>
            {saveStatus !== 'idle' && (
              <p className="text-[10px] text-gray-400">{saveStatus === 'saving' ? 'Saving…' : 'Saved'}</p>
            )}
          </div>
        </div>

        {markError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} /> {markError}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {localQuestions.map((q, i) => (
            <div key={q.questionId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{q.questionText}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{q.maxMarks} marks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                {/* Student answer */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Student Answer</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[80px]">
                    {q.isHandwritten ? (
                      <p className="text-sm text-gray-500 italic">{q.answerImageUrl ? 'Handwriting submitted (see image below)' : 'Handwriting submitted'}</p>
                    ) : q.studentAnswer ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{q.studentAnswer}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No answer provided</p>
                    )}
                  </div>
                  {q.ocrTranscription && (
                    <div className="mt-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">OCR Transcription</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <p className="text-xs text-amber-800 leading-relaxed">{q.ocrTranscription}</p>
                      </div>
                    </div>
                  )}
                  {q.answerImageUrl && (
                    <img
                      src={q.answerImageUrl}
                      alt={`Handwritten answer to question ${i + 1}`}
                      className="mt-2 w-full max-h-56 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  )}
                </div>

                {/* Marking panel */}
                <div className="space-y-3">
                  {q.provisionalScore != null && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold text-amber-700">AI provisional:</span>
                      <span className="text-sm font-bold text-amber-800">{q.provisionalScore}/{q.maxMarks}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Final Score</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={q.finalScore}
                        onChange={e => updateLocal(q.questionId, 'finalScore', e.target.value)}
                        onBlur={() => handleBlur(q)}
                        min={0}
                        max={q.maxMarks}
                        className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                      <span className="text-sm text-gray-500">/ {q.maxMarks}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Comment</label>
                    <textarea
                      value={q.tutorComment}
                      onChange={e => updateLocal(q.questionId, 'tutorComment', e.target.value)}
                      onBlur={() => handleBlur(q)}
                      rows={3}
                      placeholder="Feedback for this question…"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pen annotation */}
        {localQuestions.some(q => q.answerImageUrl) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-1">
                <Pen size={14} className="text-indigo-500" /> Pen Annotation
              </h3>
              <p className="text-xs text-gray-500">
                {tutorAnnotations ? 'Markup saved on the student\'s handwritten work.' : 'Mark up the student\'s handwritten work with ticks, crosses, circles or freehand pen.'}
              </p>
            </div>
            <button
              onClick={() => setShowAnnotator(true)}
              className="bg-gray-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm flex-shrink-0"
            >
              <Pen size={14} /> {tutorAnnotations ? 'Edit Annotations' : 'Annotate Work'}
            </button>
          </div>
        )}

        {/* Overall feedback + finalise */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <FileText size={14} className="text-indigo-500" /> Overall Feedback
          </h3>
          <textarea
            value={overallFeedback}
            onChange={e => setOverallFeedback(e.target.value)}
            rows={4}
            placeholder="Overall comments for the student…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={grantResubmission}
              onChange={e => setGrantResubmission(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <RefreshCw size={14} className="text-indigo-500" /> Grant resubmission
            </span>
          </label>
          <div className="flex justify-end items-center gap-3">
            {progressSaved && <span className="text-xs font-semibold text-emerald-600">Draft saved</span>}
            <button
              onClick={() => saveProgressMutation.mutate()}
              disabled={saveProgressMutation.isPending}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm"
            >
              <Save size={14} /> {saveProgressMutation.isPending ? 'Saving…' : 'Save Progress'}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm"
            >
              <Check size={15} /> Finalise &amp; Return
            </button>
          </div>
        </div>
      </main>

      {showAnnotator && (
        <LibraryAnnotator
          images={localQuestions
            .map((q, i) => ({ questionId: q.questionId, questionNumber: i + 1, imageUrl: q.answerImageUrl }))
            .filter((q): q is { questionId: string; questionNumber: number; imageUrl: string } => !!q.imageUrl)}
          existingAnnotations={tutorAnnotations}
          isViewOnly={false}
          studentName={review.studentName}
          assignmentTitle={review.assignmentTitle}
          onSave={async (json) => { await saveAnnotationsMutation.mutateAsync(json); }}
          onClose={() => setShowAnnotator(false)}
        />
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-gray-900 mb-2">Finalise Marking?</h3>
            <p className="text-sm text-gray-600 mb-3">
              This will return the assignment to <span className="font-semibold">{review.studentName}</span> with:
            </p>
            <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-4 text-center">
              <p className="text-3xl font-black text-indigo-700">
                {totalFinalScore}<span className="text-base text-gray-400 font-normal">/{totalMaxMarks}</span>
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">Total Score</p>
            </div>
            {grantResubmission && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-4">
                <RefreshCw size={14} /> Resubmission will be granted
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => finaliseMutation.mutate()}
                disabled={finaliseMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {finaliseMutation.isPending ? 'Finalising…' : <><Check size={14} /> Finalise</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
