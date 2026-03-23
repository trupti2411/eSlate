import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { DesignNavToggle } from '@/components/DesignSwitchBanner';
import type { Design } from '@/hooks/useDesignPreference';
import { isPast, format, startOfWeek } from 'date-fns';
import {
  Users, CheckSquare, MessageCircle, Bell, LogOut, AlertCircle,
  ChevronDown, ChevronUp, MessageSquare, Star, Clock, CheckCircle2,
  BookOpen, Send, Eye, PenLine
} from 'lucide-react';
import MessageCenter from '@/components/MessageCenter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MarkedWorkViewer from '@/components/MarkedWorkViewer';

interface Props { setDesign: (d: Design) => void; }
type Tab = 'children' | 'homework' | 'messages';

interface Submission {
  id: string;
  status: string;
  submittedAt: string | null;
  isLate: boolean;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  fileUrls: string[];
  documentUrl: string | null;
  reviewerAnnotations: string | null;
  parentComment: string | null;
  parentCommentAt: string | null;
}

interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  submissionDate: string;
  submissionStatus: string;
  submission: Submission | null;
  className?: string | null;
  classDescription?: string | null;
}

interface ChildData {
  id: string;
  user: { firstName: string | null; lastName: string | null; email: string };
  gradeLevel: string | null;
  companyInfo: { name: string } | null;
  tutorInfo: { firstName: string | null; lastName: string | null } | null;
  assignments: AssignmentItem[];
}

function statusLabel(status: string): string {
  switch (status) {
    case 'submitted': return 'Submitted';
    case 'graded': return 'Graded';
    case 'parent_verified': return 'Verified';
    case 'needs_revision': return 'Needs Revision';
    case 'draft': return 'Draft';
    default: return 'Not started';
  }
}

function AssignmentCard({ a, childName }: { a: AssignmentItem; childName: string }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(a.submission?.parentComment ?? '');
  const [editing, setEditing] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Four distinct stages
  const isInProgress = a.submission?.status === 'draft';
  const hasSubmission = !!a.submission && !isInProgress;
  const isGraded = a.submission?.status === 'graded' || a.submission?.status === 'parent_verified';
  // Only mark overdue if student hasn't started at all — in-progress should not be shown as overdue
  const isOverdue = !a.submission && isPast(new Date(a.submissionDate));

  const cardBorder = isOverdue
    ? 'border-red-200'
    : isGraded
    ? 'border-green-200'
    : hasSubmission
    ? 'border-blue-200'
    : isInProgress
    ? 'border-violet-200'
    : 'border-gray-100';

  const badgeStyle = isOverdue
    ? 'bg-red-100 text-red-700 border-red-200'
    : isGraded
    ? 'bg-green-100 text-green-700 border-green-200'
    : hasSubmission
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : isInProgress
    ? 'bg-violet-100 text-violet-700 border-violet-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';

  const badgeText = isOverdue
    ? 'Overdue'
    : isGraded
    ? 'Graded'
    : hasSubmission
    ? 'Submitted'
    : isInProgress
    ? 'In progress'
    : 'Assigned';

  const saveComment = useMutation({
    mutationFn: async () => {
      if (!a.submission) return;
      return apiRequest(`/api/submissions/${a.submission.id}/parent-comment`, 'PATCH', { comment });
    },
    onSuccess: () => {
      toast({ title: 'Comment saved', description: 'Your comment is now visible to the tutor.' });
      queryClient.invalidateQueries({ queryKey: ['/api/parents/children'] });
      setEditing(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not save comment. Please try again.', variant: 'destructive' });
    },
  });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cardBorder}`}>
      {isOverdue && (
        <div className="px-4 py-1.5 bg-red-50">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1">
            <AlertCircle size={11} /> OVERDUE
          </p>
        </div>
      )}
      <button
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">
          <BookOpen className="h-5 w-5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">{a.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {a.subject} · Due {format(new Date(a.submissionDate), 'EEE d MMM')}
          </p>
          {isGraded && a.submission?.score !== null && a.submission?.score !== undefined && (
            <p className="text-xs font-bold text-indigo-600 mt-0.5 flex items-center gap-1">
              <Star className="h-3 w-3" /> Grade: {a.submission.score}/20
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
            {badgeText}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">

          {/* Assignment description */}
          {a.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Assignment Details</p>
              <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
            </div>
          )}

          {/* Submission status details — four stages */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {isOverdue ? (
                <div className="flex items-center gap-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Overdue — not yet started · Due {format(new Date(a.submissionDate), 'EEE d MMM')}
                </div>
              ) : isInProgress ? (
                <div className="flex items-center gap-1.5 text-sm text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5">
                  <PenLine className="h-4 w-4" />
                  In progress — your child is working on this
                </div>
              ) : hasSubmission ? (
                <>
                  <div className="flex items-center gap-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Submitted {a.submission?.submittedAt ? format(new Date(a.submission.submittedAt), 'EEE d MMM, h:mm a') : ''}
                    {a.submission?.isLate && <span className="ml-1 text-red-600 font-semibold">(Late)</span>}
                  </div>
                  {isGraded && (
                    <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                      <Star className="h-4 w-4" />
                      Graded {a.submission?.gradedAt ? format(new Date(a.submission.gradedAt), 'EEE d MMM') : ''}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  <Clock className="h-4 w-4" />
                  Assigned · Due {format(new Date(a.submissionDate), 'EEE d MMM')}
                </div>
              )}
            </div>
          </div>

          {/* Tutor feedback */}
          {isGraded && (a.submission?.score !== null || a.submission?.feedback) && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1.5">Tutor Feedback</p>
              {a.submission?.score !== null && a.submission?.score !== undefined && (
                <p className="text-sm font-bold text-indigo-800 mb-1">Score: {a.submission.score}/20</p>
              )}
              {a.submission?.feedback && (
                <p className="text-sm text-indigo-900 leading-relaxed">{a.submission.feedback}</p>
              )}
            </div>
          )}

          {/* View marked work */}
          {isGraded && a.submission && ((a.submission.fileUrls?.length > 0) || a.submission.reviewerAnnotations || a.submission.feedback) && (
            <button
              onClick={() => setShowViewer(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100"
            >
              <Eye size={13} /> View Marked Work
            </button>
          )}

          {showViewer && a.submission && (
            <MarkedWorkViewer
              submissionId={a.submission.id}
              fileUrls={a.submission.fileUrls ?? []}
              documentUrl={a.submission.documentUrl}
              reviewerAnnotations={a.submission.reviewerAnnotations}
              feedback={a.submission.feedback}
              score={a.submission.score}
              assignmentTitle={a.title}
              studentName={childName}
              gradedAt={a.submission.gradedAt}
              onClose={() => setShowViewer(false)}
            />
          )}

          {/* Parent comment — only if submitted */}
          {hasSubmission && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Your comment to the tutor
              </p>
              {!editing && a.submission?.parentComment ? (
                <div className="bg-white border border-rose-200 rounded-xl p-3">
                  <p className="text-sm text-gray-800 leading-relaxed">{a.submission.parentComment}</p>
                  {a.submission.parentCommentAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Sent {format(new Date(a.submission.parentCommentAt), 'EEE d MMM, h:mm a')}
                    </p>
                  )}
                  <button
                    onClick={() => { setComment(a.submission?.parentComment ?? ''); setEditing(true); }}
                    className="mt-2 text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Edit comment
                  </button>
                </div>
              ) : editing || !a.submission?.parentComment ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                    rows={3}
                    placeholder={`Leave a note about ${childName}'s work — your tutor will see this...`}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveComment.mutate()}
                      disabled={saveComment.isPending || !comment.trim()}
                      className="flex items-center gap-1.5 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-rose-700 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {saveComment.isPending ? 'Saving...' : 'Send to Tutor'}
                    </button>
                    {editing && (
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {!hasSubmission && (
            <p className="text-xs text-gray-400 italic">
              You can leave a comment once {childName} has submitted this assignment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewParentDashboard({ setDesign }: Props) {
  const { user, logoutMutation } = useAuth();
  const [tab, setTab] = useState<Tab>('children');
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);

  const { data: children = [], isLoading } = useQuery<ChildData[]>({
    queryKey: ['/api/parents/children'],
    enabled: !!user,
  });

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'children', label: 'My Children', icon: Users },
    { key: 'homework', label: 'Homework', icon: CheckSquare },
    { key: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  const firstName = user?.firstName || 'Parent';
  const selectedChild = children[selectedChildIdx];

  const childStats = (child: ChildData) => {
    const total = child.assignments.length;
    const inProgress = child.assignments.filter(a => a.submission?.status === 'draft').length;
    const submitted = child.assignments.filter(a => a.submission && a.submission.status !== 'draft').length;
    const graded = child.assignments.filter(a => a.submission?.status === 'graded' || a.submission?.status === 'parent_verified').length;
    // Overdue = no submission at all (not even a draft) and past due date
    const overdue = child.assignments.filter(a =>
      !a.submission && isPast(new Date(a.submissionDate))
    ).length;
    return { total, inProgress, submitted, graded, overdue };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pb-24">

        {/* Header */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hi, {firstName}</h1>
            <p className="text-sm text-gray-500">Parent dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <DesignNavToggle currentDesign="new" onSwitch={() => setDesign('classic')} />
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-200 p-1 mb-5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-rose-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* CHILDREN */}
            {tab === 'children' && (
              <div className="space-y-4">
                {children.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <p className="font-bold text-gray-800">No children linked yet</p>
                    <p className="text-sm text-gray-500 mt-1">Contact your tutoring centre to be linked to your child's account.</p>
                  </div>
                ) : (
                  children.map((child, idx) => {
                    const name = `${child.user.firstName || ''} ${child.user.lastName || ''}`.trim() || child.user.email;
                    const stats = childStats(child);
                    return (
                      <div key={child.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-lg font-extrabold text-rose-600">
                            {(child.user.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">
                              {child.gradeLevel && `Year ${child.gradeLevel} · `}
                              {child.companyInfo?.name}
                            </p>
                            {child.tutorInfo && (
                              <p className="text-xs text-gray-400">
                                Tutor: {child.tutorInfo.firstName} {child.tutorInfo.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 text-center mb-3">
                          {[
                            { label: 'Total', value: stats.total, color: 'text-gray-700' },
                            { label: 'In Progress', value: stats.inProgress, color: stats.inProgress > 0 ? 'text-violet-600' : 'text-gray-400' },
                            { label: 'Submitted', value: stats.submitted, color: 'text-blue-600' },
                            { label: 'Graded', value: stats.graded, color: 'text-green-600' },
                            { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? 'text-red-600' : 'text-gray-400' },
                          ].map(s => (
                            <div key={s.label} className="bg-gray-50 rounded-xl py-2">
                              <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
                              <div className="text-[10px] text-gray-400 leading-tight">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => { setSelectedChildIdx(idx); setTab('homework'); }}
                          className="w-full bg-rose-50 text-rose-700 font-bold py-2 rounded-xl text-sm hover:bg-rose-100 transition-colors"
                        >
                          View Homework →
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* HOMEWORK */}
            {tab === 'homework' && (
              <>
                {children.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                    {children.map((child, idx) => {
                      const name = child.user.firstName || child.user.email;
                      return (
                        <button
                          key={child.id}
                          onClick={() => setSelectedChildIdx(idx)}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                            selectedChildIdx === idx ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedChild ? (
                  selectedChild.assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="font-bold text-gray-800">No assignments yet</p>
                      <p className="text-sm text-gray-500 mt-1">Assignments will appear here once the tutor sets them.</p>
                    </div>
                  ) : (() => {
                    // Group by term (className) → week (submissionDate)
                    const sorted = [...selectedChild.assignments].sort((a, b) =>
                      new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()
                    );
                    const byTerm: Record<string, Record<string, AssignmentItem[]>> = {};
                    for (const a of sorted) {
                      const term = a.className || 'General';
                      const weekStart = startOfWeek(new Date(a.submissionDate), { weekStartsOn: 1 });
                      const weekKey = format(weekStart, 'yyyy-MM-dd');
                      if (!byTerm[term]) byTerm[term] = {};
                      if (!byTerm[term][weekKey]) byTerm[term][weekKey] = [];
                      byTerm[term][weekKey].push(a);
                    }
                    const childName = selectedChild.user.firstName || 'your child';
                    return (
                      <div className="space-y-6">
                        {selectedChild.gradeLevel && (
                          <p className="text-xs font-bold text-rose-600 uppercase tracking-widest px-1">{selectedChild.gradeLevel}</p>
                        )}
                        {Object.entries(byTerm).map(([term, weekGroups]) => (
                          <div key={term}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1 bg-rose-100" />
                              <span className="text-xs font-black uppercase tracking-widest text-rose-500 px-2">{term}</span>
                              <div className="h-px flex-1 bg-rose-100" />
                            </div>
                            <div className="space-y-4">
                              {Object.entries(weekGroups)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([weekKey, items]) => (
                                  <div key={weekKey}>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                      Week of {format(new Date(weekKey), 'd MMM')}
                                    </p>
                                    <div className="space-y-3">
                                      {items.map(a => (
                                        <AssignmentCard key={a.id} a={a} childName={childName} />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a child above to view their homework.</p>
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
          </>
        )}
      </div>
    </div>
  );
}
