import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { DesignNavToggle } from '@/components/DesignSwitchBanner';
import type { Design } from '@/hooks/useDesignPreference';
import { isPast, format } from 'date-fns';
import { Users, CheckSquare, MessageCircle, Bell, LogOut, AlertCircle, ChevronRight } from 'lucide-react';
import MessageCenter from '@/components/MessageCenter';

interface Props { setDesign: (d: Design) => void; }
type Tab = 'children' | 'homework' | 'messages';

interface ChildData {
  id: string;
  user: { firstName: string | null; lastName: string | null; email: string };
  gradeLevel: string | null;
  companyInfo: { name: string } | null;
  tutorInfo: { firstName: string | null; lastName: string | null } | null;
  assignments: Array<{
    id: string; title: string; subject: string; submissionDate: string;
    submissionStatus: string; submission: { status: string; score: number | null; feedback: string | null } | null;
  }>;
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

  const getAssignmentStatus = (a: ChildData['assignments'][0]): 'overdue' | 'pending' | 'done' => {
    if (a.submission && ['submitted', 'graded'].includes(a.submission.status)) return 'done';
    if (isPast(new Date(a.submissionDate))) return 'overdue';
    return 'pending';
  };

  const childStats = (child: ChildData) => {
    const overdue = child.assignments.filter(a => getAssignmentStatus(a) === 'overdue').length;
    const pending = child.assignments.filter(a => getAssignmentStatus(a) === 'pending').length;
    return { overdue, pending };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Nav */}
      <div className="bg-rose-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-black">eS</span>
              </div>
              <span className="font-black text-base">eSlate</span>
              <span className="text-rose-300 text-sm mx-1">·</span>
              <span className="text-sm text-rose-200">{firstName}</span>
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
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                  tab === t.key ? 'bg-gray-50 text-rose-700' : 'text-rose-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* MY CHILDREN */}
          {tab === 'children' && (
            isLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
            ) : children.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👶</div>
                <p className="font-bold text-gray-800">No children linked yet</p>
                <p className="text-sm text-gray-500 mt-1">Contact your tutoring centre to link your children.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child, idx) => {
                  const stats = childStats(child);
                  const name = `${child.user.firstName || ''} ${child.user.lastName || ''}`.trim() || child.user.email;
                  return (
                    <button
                      key={child.id}
                      onClick={() => { setSelectedChildIdx(idx); setTab('homework'); }}
                      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {child.gradeLevel || 'Student'}{child.companyInfo ? ` · ${child.companyInfo.name}` : ''}
                          </p>
                          {child.tutorInfo && (
                            <p className="text-xs text-gray-400">Tutor: {child.tutorInfo.firstName} {child.tutorInfo.lastName}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {stats.overdue > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                              <AlertCircle size={10} /> {stats.overdue} overdue
                            </span>
                          )}
                          {stats.pending > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              {stats.pending} pending
                            </span>
                          )}
                          <ChevronRight size={16} className="text-gray-400 mt-1" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* HOMEWORK */}
          {tab === 'homework' && (
            <>
              {children.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
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
                    <p className="font-bold text-gray-800">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedChild.assignments
                      .sort((a, b) => {
                        const sa = getAssignmentStatus(a), sb = getAssignmentStatus(b);
                        const order = { overdue: 0, pending: 1, done: 2 };
                        return order[sa] - order[sb];
                      })
                      .map(a => {
                        const status = getAssignmentStatus(a);
                        return (
                          <div
                            key={a.id}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                              status === 'overdue' ? 'border-red-200' : 'border-gray-100'
                            }`}
                          >
                            {status === 'overdue' && (
                              <div className="px-4 py-1.5 bg-red-50">
                                <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                                  <AlertCircle size={11} /> OVERDUE
                                </p>
                              </div>
                            )}
                            <div className="px-4 py-3 flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">📚</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">{a.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {a.subject} · {status === 'done' ? 'Submitted' : `Due ${format(new Date(a.submissionDate), 'EEE d MMM')}`}
                                </p>
                                {a.submission?.score !== null && a.submission?.score !== undefined && (
                                  <p className="text-xs font-bold text-indigo-600 mt-0.5">Grade: {a.submission.score}/20</p>
                                )}
                              </div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                                status === 'done' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-amber-100 text-amber-700 border-amber-200'
                              }`}>
                                {status === 'overdue' ? 'Overdue' : status === 'done' ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
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
        </div>
      </div>
    </div>
  );
}
