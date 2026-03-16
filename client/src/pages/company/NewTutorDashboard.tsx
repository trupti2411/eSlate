import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { DesignNavToggle } from '@/components/DesignSwitchBanner';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Design } from '@/hooks/useDesignPreference';
import { format } from 'date-fns';
import {
  Calendar, ClipboardList, MessageCircle, Bell, LogOut,
  Check, X, Users, ChevronRight, Award, ThumbsUp, ChevronLeft,
  Sparkles, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  PenLine, Maximize2, ZoomIn,
} from 'lucide-react';
import MessageCenter from '@/components/MessageCenter';

interface Props { setDesign: (d: Design) => void; }
type Tab = 'today' | 'marking' | 'students' | 'messages';

interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  studentName?: string;
  assignmentTitle?: string;
  fileUrls?: string[];
  documentUrl?: string | null;
  content?: string;
  student?: { user: { firstName: string | null; lastName: string | null } };
  assignment?: { title: string; description?: string };
}

interface Student {
  id: string;
  userId: string;
  gradeLevel: string | null;
  user: { firstName: string | null; lastName: string | null; email: string };
}

export default function NewTutorDashboard({ setDesign }: Props) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('today');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [rollCall, setRollCall] = useState<Record<string, boolean | null>>({});
  const [aiResult, setAiResult] = useState<{
    overallAssessment: string;
    whatIsCorrect: string[];
    whatIsIncorrect: string[];
    whatIsMissing: string[];
    suggestedNextSteps: string[];
    canFullyCheck: boolean;
    warnings?: string[];
  } | null>(null);

  const { data: adminProfile } = useQuery<{ companyId?: string }>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user,
  });
  const companyId = adminProfile?.companyId;

  const { data: submissions = [], isLoading: subLoading } = useQuery<Submission[]>({
    queryKey: ['/api/tutor/submissions'],
    enabled: !!user,
  });

  const { data: students = [], isLoading: studLoading } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ['/api/assignments'],
    enabled: !!user,
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ id, score, fb }: { id: string; score: number; fb: string }) => {
      return apiRequest(`/api/tutor/submissions/${id}/grade`, 'PATCH', { score, feedback: fb });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutor/submissions'] });
      toast({ title: 'Feedback submitted', description: 'Student and parent have been notified.' });
      setMarkingId(null);
      setFeedback('');
      setAiResult(null);
      setLightboxOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit grade.', variant: 'destructive' });
    },
  });

  const aiMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/submissions/${id}/ai-check`, 'POST', {}),
    onSuccess: (data: any) => setAiResult(data),
    onError: (error: any) => toast({
      title: 'AI check failed',
      description: error?.message?.includes('quota') ? 'The AI quota has been reached for today. Please try again later.' : (error?.message || 'Could not analyse this submission.'),
      variant: 'destructive',
    }),
  });

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'today', label: 'Today', icon: Calendar },
    { key: 'marking', label: 'To Mark', icon: ClipboardList },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  const firstName = user?.firstName || 'Tutor';
  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');

  const markingSubmission = submissions.find(s => s.id === markingId);
  const matchedAssignment = markingSubmission ? assignments.find((a: any) => a.id === markingSubmission.assignmentId) : null;

  const studentName = markingSubmission?.student?.user
    ? `${markingSubmission.student.user.firstName || ''} ${markingSubmission.student.user.lastName || ''}`.trim() || 'Student'
    : markingSubmission?.studentName || 'Student';
  const assignmentTitle = markingSubmission?.assignment?.title || matchedAssignment?.title || 'Submission';

  if (markingId && markingSubmission) {
    return (
      <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-teal-600 text-white px-4 py-4 flex items-center gap-3">
          <button onClick={() => { setMarkingId(null); setLightboxOpen(false); }} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="font-black">{studentName}</p>
            <p className="text-sm text-teal-200">{assignmentTitle}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
            {/* Annotated submission (PDF annotator) */}
            {markingSubmission.documentUrl ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <PenLine size={11} className="text-teal-500" /> Student's annotated work
                  </p>
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Maximize2 size={12} /> View full size
                  </button>
                </div>
                <div className="relative cursor-zoom-in group" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={`/api/files/${markingSubmission.documentUrl}`}
                    alt="Student's annotated submission"
                    className="w-full object-contain max-h-96 bg-gray-50"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                      <ZoomIn size={14} className="text-gray-700" />
                      <span className="text-xs font-bold text-gray-700">Click to zoom in</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Student's submitted work</p>
                </div>
                <div className="p-4">
                  {markingSubmission.content ? (
                    <p className="text-sm text-gray-700 leading-relaxed">{markingSubmission.content}</p>
                  ) : markingSubmission.fileUrls && markingSubmission.fileUrls.length > 0 ? (
                    <div className="space-y-2">
                      {markingSubmission.fileUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal-600 font-semibold hover:underline">
                          📎 View file {i + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Submitted {markingSubmission.submittedAt ? format(new Date(markingSubmission.submittedAt), 'd MMM yyyy') : ''}</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Check */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Assessment</p>
                {!aiResult && (
                  <button
                    onClick={() => aiMutation.mutate(markingId)}
                    disabled={aiMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold hover:bg-violet-200 disabled:opacity-50 transition-colors"
                  >
                    {aiMutation.isPending ? <><Sparkles size={12} className="animate-spin" /> Checking…</> : <><Sparkles size={12} /> Check with AI</>}
                  </button>
                )}
                {aiResult && (
                  <button onClick={() => setAiResult(null)} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                )}
              </div>

              {!aiResult && !aiMutation.isPending && (
                <p className="text-xs text-gray-400 italic">Tap "Check with AI" to get an instant assessment of this submission.</p>
              )}
              {aiMutation.isPending && (
                <p className="text-xs text-violet-500 italic">Gemini is reading the submission…</p>
              )}

              {aiResult && (
                <div className="space-y-3">
                  {!aiResult.canFullyCheck && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl p-3">
                      <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-medium">AI quota temporarily reached — files could not be analysed. This assessment does not reflect the student's actual work. Try again in a few minutes.</p>
                    </div>
                  )}

                  {aiResult.canFullyCheck && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-violet-700 mb-1">Overall</p>
                    <p className="text-sm text-violet-900 leading-relaxed">{aiResult.overallAssessment}</p>
                  </div>
                  )}

                  {aiResult.warnings && aiResult.warnings.length > 0 && aiResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">{w}</p>
                    </div>
                  ))}

                  {aiResult.whatIsCorrect.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-green-700 flex items-center gap-1 mb-1"><CheckCircle2 size={12} /> Correct</p>
                      <ul className="space-y-1">{aiResult.whatIsCorrect.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700"><span className="text-green-500 flex-shrink-0">✓</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}
                  {aiResult.whatIsIncorrect.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1"><XCircle size={12} /> Incorrect</p>
                      <ul className="space-y-1">{aiResult.whatIsIncorrect.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700"><span className="text-red-500 flex-shrink-0">✗</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}
                  {aiResult.whatIsMissing.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-1"><AlertTriangle size={12} /> Missing</p>
                      <ul className="space-y-1">{aiResult.whatIsMissing.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700"><span className="text-amber-500 flex-shrink-0">⚠</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}
                  {aiResult.suggestedNextSteps.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-1"><Lightbulb size={12} /> Next steps</p>
                      <ul className="space-y-1">{aiResult.suggestedNextSteps.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700"><span className="text-blue-500 flex-shrink-0">→</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Feedback</p>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Great work on Q1–3! For Q4, remember to..."
                className="w-full h-24 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-teal-400"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['Well done!', 'Good effort', 'Needs improvement', 'Check working'].map(q => (
                  <button
                    key={q}
                    onClick={() => setFeedback(q)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-600 hover:border-teal-300 hover:text-teal-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
          <button onClick={() => { setMarkingId(null); setAiResult(null); setLightboxOpen(false); }} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-700">
            Cancel
          </button>
          <button
            onClick={() => {
              gradeMutation.mutate({ id: markingId, score: 0, fb: feedback });
            }}
            disabled={gradeMutation.isPending}
            className="flex-1 py-3 rounded-xl border-2 border-teal-600 bg-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ThumbsUp size={15} /> {gradeMutation.isPending ? 'Submitting…' : 'Submit grade'}
          </button>
        </div>
      </div>

      {/* Full-screen lightbox */}
      {lightboxOpen && markingSubmission?.documentUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={() => setLightboxOpen(false)}>
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div>
              <p className="text-white font-bold text-sm">{studentName}</p>
              <p className="text-white/60 text-xs">{assignmentTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={e => { e.stopPropagation(); aiMutation.mutate(markingId!); setLightboxOpen(false); }}
                disabled={aiMutation.isPending}
                className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                <Sparkles size={12} /> Check with AI
              </button>
              <button onClick={() => setLightboxOpen(false)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center p-4" onClick={e => e.stopPropagation()}>
            <img
              src={`/api/files/${markingSubmission.documentUrl}`}
              alt="Student's annotated submission — full size"
              className="max-w-full h-auto rounded-lg shadow-2xl"
              style={{ imageRendering: 'crisp-edges', minWidth: '320px' }}
            />
          </div>
          <p className="text-white/40 text-xs text-center pb-3 flex-shrink-0">Tap outside or press ✕ to close</p>
        </div>
      )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Nav */}
      <div className="bg-teal-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-black">eS</span>
              </div>
              <span className="font-black text-base">eSlate</span>
              <span className="text-teal-300 text-sm mx-1">·</span>
              <span className="text-sm text-teal-200">{firstName}</span>
            </div>
            <div className="flex items-center gap-2">
              <DesignNavToggle design="new" onSwitch={setDesign} />
              <button className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <Bell size={16} />
              </button>
              <button onClick={() => logoutMutation.mutate()} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <LogOut size={15} />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                  tab === t.key ? 'bg-gray-50 text-teal-700' : 'text-teal-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                {t.key === 'marking' && pending.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* TODAY */}
          {tab === 'today' && (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: pending.length, l: 'To mark', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                  { n: graded.length, l: 'Graded', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                  { n: students.length, l: 'Students', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
                ].map(s => (
                  <div key={s.l} className={`rounded-2xl border ${s.bg} ${s.border} p-4 text-center`}>
                    <p className={`text-2xl font-black ${s.text}`}>{s.n}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${s.text}`}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Roll call */}
              {students.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Quick roll call</p>
                    <button
                      onClick={() => {
                        const all: Record<string, boolean | null> = {};
                        students.forEach(s => { all[s.id] = true; });
                        setRollCall(all);
                      }}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      Mark all present
                    </button>
                  </div>
                  <div className="space-y-2">
                    {students.slice(0, 8).map(s => {
                      const name = `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() || s.user.email;
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700 flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <p className="flex-1 text-sm font-semibold text-gray-800">{name}</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setRollCall(r => ({ ...r, [s.id]: true }))}
                              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                                rollCall[s.id] === true ? 'bg-green-100 border-green-400' : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <Check size={14} className={rollCall[s.id] === true ? 'text-green-600' : 'text-gray-400'} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setRollCall(r => ({ ...r, [s.id]: false }))}
                              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                                rollCall[s.id] === false ? 'bg-red-100 border-red-400' : 'border-gray-200 hover:border-red-300'
                              }`}
                            >
                              <X size={14} className={rollCall[s.id] === false ? 'text-red-600' : 'text-gray-400'} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent grading */}
              {graded.slice(0, 3).map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{s.studentName || 'Student'}</p>
                    <p className="text-xs text-gray-500">Graded {s.score}/20 · {s.submittedAt ? format(new Date(s.submittedAt), 'd MMM') : ''}</p>
                  </div>
                  <span className="text-lg font-black text-green-600">{s.score}</span>
                </div>
              ))}
            </>
          )}

          {/* MARKING */}
          {tab === 'marking' && (
            <>
              {subLoading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
              ) : pending.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-bold text-gray-800">All marked!</p>
                  <p className="text-sm text-gray-500 mt-1">No submissions waiting for review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">Waiting to mark ({pending.length})</p>
                  {pending.map(s => {
                    const assignment = assignments.find((a: any) => a.id === s.assignmentId);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setMarkingId(s.id)}
                        className="w-full text-left bg-white rounded-2xl border border-amber-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                          {(s.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{s.studentName || 'Student'}</p>
                          <p className="text-xs text-gray-500 truncate">{assignment?.title || 'Assignment'}</p>
                          <p className="text-xs text-amber-600 font-semibold mt-0.5">
                            Submitted {s.submittedAt ? format(new Date(s.submittedAt), 'd MMM yyyy') : ''}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* STUDENTS */}
          {tab === 'students' && (
            <>
              {studLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="font-bold text-gray-800">No students yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map(s => {
                    const name = `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() || s.user.email;
                    const studentSubs = submissions.filter(sub => sub.studentId === s.id);
                    const hasPending = studentSubs.some(sub => sub.status === 'submitted');
                    return (
                      <div key={s.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700 flex-shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500">{s.gradeLevel || 'Student'}</p>
                        </div>
                        {hasPending && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Needs marking
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 400 }}>
              <MessageCenter />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
