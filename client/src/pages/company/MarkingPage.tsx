import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, CheckCircle, FileText, Eye,
  ChevronLeft, ChevronRight, User, BookOpen, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useMultipleFileMetadata, getDisplayFilename } from '@/hooks/useFileMetadata';

interface SubmissionWithDetails {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  fileUrls: string[] | null;
  content: string | null;
  student: {
    id: string;
    user: { firstName: string; lastName: string; email: string };
  };
  assignment: {
    id: string;
    title: string;
    description: string;
    submissionDate: string;
    subject?: string;
  };
}

const QUICK_SCORES = [
  { label: 'Excellent', score: 20, color: 'bg-green-100 text-green-800 border-green-200' },
  { label: 'Good',      score: 16, color: 'bg-blue-100  text-blue-800  border-blue-200' },
  { label: 'OK',        score: 12, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Needs work',score:  8, color: 'bg-red-100   text-red-800   border-red-200' },
];

function SubmittedFiles({ fileUrls }: { fileUrls: string[] }) {
  const { data: fileMetadata } = useMultipleFileMetadata(fileUrls);
  return (
    <div className="space-y-2">
      {fileUrls.map((url, i) => {
        const metadata = fileMetadata?.[i];
        const displayFilename = getDisplayFilename(url, metadata, i);
        return (
          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
            <FileText size={15} className="text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 flex-1 truncate">{displayFilename}</span>
            <button
              onClick={() => {
                const objectPath = url.includes('/uploads/') ? url.split('/uploads/').pop() : url.split('/').pop();
                window.open(`/objects/uploads/${objectPath}`, '_blank');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 flex-shrink-0"
            >
              <Eye size={13} /> View
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function MarkingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [gradedIds, setGradedIds] = useState<Set<string>>(new Set());

  const { data: allSubmissions = [], isLoading } = useQuery<SubmissionWithDetails[]>({
    queryKey: ['/api/company/submissions'],
  });

  const pending = allSubmissions.filter(s => s.status === 'submitted' && !gradedIds.has(s.id));
  const current = pending[currentIndex] || null;

  const gradeMutation = useMutation({
    mutationFn: ({ id, score, feedback }: { id: string; score: number; feedback: string }) =>
      apiRequest(`/api/company/submissions/${id}/grade`, 'PATCH', { score, feedback }),
    onSuccess: (_, vars) => {
      setGradedIds(prev => new Set(Array.from(prev).concat(vars.id)));
      queryClient.invalidateQueries({ queryKey: ['/api/company/submissions'] });
      toast({ title: 'Marked!', description: `Score ${vars.score}/20 saved.` });
      setScore('');
      setFeedback('');
      if (currentIndex >= pending.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    },
    onError: () => {
      toast({ title: 'Failed to save', description: 'Please try again.', variant: 'destructive' });
    },
  });

  const handleGrade = () => {
    if (!current || score === '' || score < 0 || score > 20) {
      toast({ title: 'Enter a valid score', description: 'Score must be between 0 and 20.', variant: 'destructive' });
      return;
    }
    gradeMutation.mutate({ id: current.id, score: Number(score), feedback });
  };

  const selectSubmission = (idx: number) => {
    setCurrentIndex(idx);
    setScore('');
    setFeedback('');
  };

  const goBack = () => navigate('/company/homework');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading submissions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* Nav */}
      <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="font-black text-sm">Mark Submissions</p>
          <p className="text-xs text-teal-200">{pending.length} ungraded</p>
        </div>
        {/* Progress (nav bar level) */}
        {allSubmissions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-teal-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${allSubmissions.length > 0 ? Math.round((gradedIds.size / allSubmissions.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-teal-200">{gradedIds.size}/{allSubmissions.length}</span>
          </div>
        )}
      </div>

      {/* All done state */}
      {pending.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">All marked!</h2>
          <p className="text-sm text-gray-500 mb-6">
            {gradedIds.size > 0
              ? `You marked ${gradedIds.size} submission${gradedIds.size > 1 ? 's' : ''} this session.`
              : 'No ungraded submissions at the moment.'}
          </p>
          <button
            onClick={goBack}
            className="flex items-center gap-2 bg-teal-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back to submissions
          </button>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left panel: submission list (tablet sidebar) ── */}
          <div className="hidden md:flex md:w-72 lg:w-80 flex-col border-r border-gray-200 bg-white flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{pending.length} to mark</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {pending.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => selectSubmission(idx)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50 transition-all ${
                    idx === currentIndex
                      ? 'bg-teal-50 border-l-4 border-l-teal-500'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${idx === currentIndex ? 'text-teal-800' : 'text-gray-800'}`}>
                      {s.student.user.firstName} {s.student.user.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{s.assignment.title}</p>
                    {s.submittedAt && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {format(new Date(s.submittedAt), 'd MMM, HH:mm')}
                      </p>
                    )}
                  </div>
                  {idx === currentIndex && (
                    <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right panel: grading form ── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Mobile nav arrows */}
            <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
              <button
                onClick={() => selectSubmission(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="flex-1 text-center text-xs font-bold text-gray-500">
                {currentIndex + 1} of {pending.length}
              </p>
              <button
                onClick={() => selectSubmission(Math.min(pending.length - 1, currentIndex + 1))}
                disabled={currentIndex >= pending.length - 1}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 md:px-6 py-5 space-y-4">

                {/* Student + assignment info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-base">
                        {current.student.user.firstName} {current.student.user.lastName}
                      </p>
                      <p className="text-sm font-semibold text-gray-600 mt-0.5">{current.assignment.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        {current.assignment.subject && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={11} /> {current.assignment.subject}
                          </span>
                        )}
                        {current.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> Submitted {format(new Date(current.submittedAt), 'd MMM, HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Desktop position indicator */}
                    <span className="hidden md:block text-xs font-bold text-gray-400 flex-shrink-0">
                      {currentIndex + 1} / {pending.length}
                    </span>
                  </div>
                </div>

                {/* Assignment description */}
                {current.assignment.description && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Assignment brief</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{current.assignment.description}</p>
                  </div>
                )}

                {/* Student text response */}
                {current.content && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Student's response</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{current.content}</p>
                  </div>
                )}

                {/* Submitted files */}
                {current.fileUrls && current.fileUrls.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Submitted files</p>
                    <SubmittedFiles fileUrls={current.fileUrls} />
                  </div>
                )}

                {/* Grading */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Grade out of 20</p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {QUICK_SCORES.map(q => (
                      <button
                        key={q.label}
                        onClick={() => setScore(q.score)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          score === q.score
                            ? `${q.color} ring-2 ring-offset-1 ring-teal-500 scale-105`
                            : `${q.color} hover:scale-105`
                        }`}
                      >
                        <span className="block text-base font-black">{q.score}</span>
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 flex-1">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={score}
                        onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0–20"
                        className="w-full bg-transparent text-gray-900 font-black text-lg focus:outline-none"
                      />
                      <span className="text-sm text-gray-400 font-semibold">/ 20</span>
                    </div>
                    {score !== '' && (
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-700 font-black text-lg">{Math.round(Number(score) / 20 * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Feedback for the student (optional but encouraged)…"
                    className="w-full h-20 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-teal-400"
                  />
                </div>

              </div>
            </div>

            {/* Bottom action bar */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3 flex-shrink-0">
              <button
                onClick={() => selectSubmission(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40 hover:bg-gray-50 flex-shrink-0 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={handleGrade}
                disabled={score === '' || gradeMutation.isPending}
                className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  score === ''
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98]'
                }`}
              >
                <CheckCircle size={15} />
                {gradeMutation.isPending ? 'Saving…' : score === '' ? 'Enter score first' : 'Save & next →'}
              </button>

              <button
                onClick={() => selectSubmission(Math.min(pending.length - 1, currentIndex + 1))}
                disabled={currentIndex >= pending.length - 1}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40 hover:bg-gray-50 flex-shrink-0 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
