import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { DesignNavToggle } from '@/components/DesignSwitchBanner';
import type { Design } from '@/hooks/useDesignPreference';
import { isPast, format, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import {
  CheckSquare, BookOpen, BarChart2, Bell, LogOut,
  AlertCircle, Clock, ChevronRight, ChevronDown, Check, Eye, CheckCircle2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import type { Assignment, Submission, Class } from '@shared/schema';
import MarkedWorkViewer from '@/components/MarkedWorkViewer';

interface Props { setDesign: (d: Design) => void; }

type Tab = 'homework' | 'classes' | 'results';

function statusBadge(status: 'overdue' | 'pending' | 'done') {
  if (status === 'overdue') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Overdue</span>;
  if (status === 'pending') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Done</span>;
}

export default function NewStudentDashboard({ setDesign }: Props) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>('homework');
  const [viewerSub, setViewerSub] = useState<any | null>(null);
  const [openTerms, setOpenTerms] = useState<Record<string, boolean>>({});
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});

  const { data: studentProfile } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student',
  });
  const studentDbId = (studentProfile as any)?.id || '';

  const { data: assignments = [], isLoading: aLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/students', studentDbId, 'assignments'],
    enabled: !!studentDbId,
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/students', studentDbId, 'submissions'],
    enabled: !!studentDbId,
  });

  const { data: classes = [], isLoading: cLoading } = useQuery<Class[]>({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId,
  });

  const { data: worksheets = [] } = useQuery<any[]>({
    queryKey: ['/api/students', studentDbId, 'worksheets'],
    enabled: !!studentDbId,
  });

  const submissionMap = new Map(submissions.map((s: any) => [s.assignmentId, s]));

  const getStatus = (a: any): 'overdue' | 'pending' | 'done' => {
    const sub = submissionMap.get(a.id);
    if (sub && ['submitted', 'graded'].includes((sub as any).status)) return 'done';
    const dueDate = a.dueDate || a.submissionDate;
    if (dueDate && isPast(new Date(dueDate))) return 'overdue';
    return 'pending';
  };

  const allWork = [
    ...assignments.map(a => ({ ...a, kind: 'assignment' })),
    ...worksheets.map(w => ({ ...w, kind: 'worksheet' })),
  ];

  const overdue = allWork.filter(a => getStatus(a) === 'overdue');
  const pending = allWork.filter(a => getStatus(a) === 'pending');
  const done = allWork.filter(a => getStatus(a) === 'done');
  const overdueCount = overdue.length;

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Student';

  const TABS: { key: Tab; label: string; Icon: typeof CheckSquare }[] = [
    { key: 'homework', label: 'Homework', Icon: CheckSquare },
    { key: 'classes',  label: 'My Classes', Icon: BookOpen },
    { key: 'results',  label: 'Results', Icon: BarChart2 },
  ];

  const openWork = (a: any) =>
    navigate(a.kind === 'worksheet' ? `/student/worksheet/${a.id}` : `/student/assignment/${a.id}`);

  // Build Term → Week grouping for collapsible homework list
  const classMap = new Map((classes as any[]).map(c => [c.id, c]));
  const byTerm: Record<string, Record<string, typeof allWork>> = {};
  for (const a of allWork) {
    const cls = classMap.get((a as any).classId);
    const term = cls?.name || 'General';
    const dueDate = (a as any).dueDate || (a as any).submissionDate;
    const weekStart = dueDate ? startOfWeek(new Date(dueDate), { weekStartsOn: 1 }) : new Date();
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    if (!byTerm[term]) byTerm[term] = {};
    if (!byTerm[term][weekKey]) byTerm[term][weekKey] = [];
    byTerm[term][weekKey].push(a);
  }
  const termList = Object.entries(byTerm);

  return (
    <>
    <div className="h-screen flex overflow-hidden bg-gray-50">

      {/* ── Sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 lg:w-60 bg-indigo-600 flex-col flex-shrink-0 shadow-lg">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">eS</span>
            </div>
            <span className="font-black text-white text-base">eSlate</span>
          </div>
          <p className="text-xs text-indigo-300 pl-10">{firstName}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-indigo-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <t.Icon size={15} />
              {t.label}
              {t.key === 'homework' && overdueCount > 0 && (
                <span className="ml-auto text-xs font-black bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1 border-t border-indigo-500 pt-3">
          <DesignNavToggle design="new" onSwitch={setDesign} accentClass="bg-indigo-600" />
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Right side ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top nav (hidden on md+) */}
        <div className="md:hidden bg-indigo-600 text-white shadow-lg flex-shrink-0">
          <div className="px-4 pt-4 pb-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-black">eS</span>
                </div>
                <span className="font-black text-sm">eSlate</span>
                <span className="text-indigo-300 mx-1">·</span>
                <span className="text-sm text-indigo-200">{firstName}</span>
              </div>
              <div className="flex items-center gap-1">
                <DesignNavToggle design="new" onSwitch={setDesign} accentClass="bg-indigo-600" />
                <button onClick={() => logoutMutation.mutate()} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                    tab === t.key ? 'bg-gray-50 text-indigo-700' : 'text-indigo-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <t.Icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet header (md+ only, sidebar replaces tabs) */}
        <div className="hidden md:flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <h1 className="text-lg font-black text-gray-900">
            {tab === 'homework' && 'Homework'}
            {tab === 'classes' && 'My Classes'}
            {tab === 'results' && 'Results'}
          </h1>
          {tab === 'homework' && allWork.length > 0 && (
            <span className="text-xs font-semibold text-gray-400 ml-1">
              {done.length} / {allWork.length} complete
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
              <Bell size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 space-y-4">

            {/* ── HOMEWORK TAB ── */}
            {tab === 'homework' && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { n: overdue.length, l: 'Overdue', bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200' },
                    { n: pending.length, l: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    { n: done.length,    l: 'Done',    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                  ].map(s => (
                    <div key={s.l} className={`rounded-2xl border ${s.bg} ${s.border} p-4 text-center`}>
                      <p className={`text-2xl font-black ${s.text}`}>{s.n}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${s.text}`}>{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {allWork.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Term progress</span>
                      <span className="text-xs font-bold text-gray-700">{done.length} / {allWork.length} complete</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${allWork.length > 0 ? Math.round((done.length / allWork.length) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {allWork.length > 0 ? Math.round((done.length / allWork.length) * 100) : 0}% submitted this term
                    </p>
                  </div>
                )}

                {aLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
                  </div>
                ) : allWork.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="font-bold text-gray-800">All caught up!</p>
                    <p className="text-sm text-gray-500 mt-1">No homework at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {termList.map(([term, weekGroups]) => {
                      const allHw = Object.values(weekGroups).flat();
                      const termDone = allHw.filter(a => getStatus(a) === 'done').length;
                      const isTermOpen = openTerms[term] !== false;
                      const progressPct = allHw.length ? Math.round((termDone / allHw.length) * 100) : 0;
                      return (
                        <div key={term}>
                          {/* ── Term header ── */}
                          <button
                            onClick={() => setOpenTerms(prev => ({ ...prev, [term]: !isTermOpen }))}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white rounded-xl mb-2 hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {isTermOpen
                                ? <ChevronDown size={15} className="text-gray-400 shrink-0" />
                                : <ChevronRight size={15} className="text-gray-400 shrink-0" />}
                              <span className="text-sm font-bold">{term}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="h-1.5 w-20 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full transition-all"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 tabular-nums">{termDone}/{allHw.length}</span>
                            </div>
                          </button>

                          {/* ── Weeks ── */}
                          {isTermOpen && (
                            <div className="pl-3 space-y-2">
                              {Object.entries(weekGroups)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([weekKey, items], wIdx) => {
                                  const wStart = new Date(weekKey);
                                  const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
                                  const weekDone = items.filter(a => getStatus(a) === 'done').length;
                                  const allWeekDone = weekDone === items.length;
                                  const isWeekOpen = openWeeks[weekKey] !== false;
                                  return (
                                    <div key={weekKey} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                      {/* Week header */}
                                      <button
                                        onClick={() => setOpenWeeks(prev => ({ ...prev, [weekKey]: !isWeekOpen }))}
                                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${allWeekDone ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          {isWeekOpen
                                            ? <ChevronDown size={13} className="text-gray-400 shrink-0" />
                                            : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className={`text-sm font-semibold ${allWeekDone ? 'text-gray-400' : 'text-gray-800'}`}>
                                                Week {wIdx + 1}
                                              </span>
                                              {allWeekDone && (
                                                <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">All done</span>
                                              )}
                                            </div>
                                            <div className={`text-[11px] font-mono ${allWeekDone ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {format(wStart, 'd MMM')} – {format(wEnd, 'd MMM')}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex gap-0.5">
                                            {items.map(hw => {
                                              const s = getStatus(hw);
                                              return (
                                                <div
                                                  key={hw.id}
                                                  className={`w-2 h-2 rounded-full ${s === 'done' ? 'bg-emerald-400' : s === 'overdue' ? 'bg-red-400' : 'bg-gray-200'}`}
                                                />
                                              );
                                            })}
                                          </div>
                                          <span className="text-[11px] text-gray-400 tabular-nums">{weekDone}/{items.length}</span>
                                        </div>
                                      </button>

                                      {/* Homework rows */}
                                      {isWeekOpen && (
                                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                                          {items.map(a => {
                                            const status = getStatus(a);
                                            const isDone = status === 'done';
                                            const hwDue = (a as any).dueDate || (a as any).submissionDate;
                                            const givenDate = (a as any).createdAt
                                              ? format(new Date((a as any).createdAt), 'd MMM')
                                              : '—';
                                            const sub = submissionMap.get(a.id);
                                            const grade = (sub as any)?.score;
                                            return (
                                              <button
                                                key={a.id}
                                                onClick={() => !isDone ? openWork(a) : undefined}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                  isDone
                                                    ? 'bg-gray-50/70 cursor-default'
                                                    : status === 'overdue'
                                                    ? 'bg-white hover:bg-red-50/40'
                                                    : 'bg-white hover:bg-indigo-50/30'
                                                }`}
                                              >
                                                {/* Status icon */}
                                                <div className="shrink-0">
                                                  {isDone
                                                    ? <CheckCircle2 size={18} className="text-emerald-500" />
                                                    : status === 'overdue'
                                                    ? <AlertCircle size={18} className="text-red-400" />
                                                    : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />}
                                                </div>

                                                {/* Title + subject */}
                                                <div className="flex-1 min-w-0">
                                                  <p className={`text-sm font-medium leading-tight truncate ${isDone ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {a.title}
                                                  </p>
                                                  <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`text-[10px] ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                                                      {(a as any).subject || (a.kind === 'worksheet' ? 'Worksheet' : 'Assignment')}
                                                    </span>
                                                    {hwDue && (
                                                      <span className="text-[10px] text-gray-400">
                                                        · Due {format(new Date(hwDue), 'd MMM')}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Given date box */}
                                                <div className="shrink-0 border border-gray-200 rounded-lg px-2 py-1 bg-white shadow-sm text-center min-w-[56px]">
                                                  <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Given</div>
                                                  <div className={`text-xs font-semibold ${isDone ? 'text-gray-400' : 'text-gray-700'}`}>{givenDate}</div>
                                                </div>

                                                {/* Status badge */}
                                                <div className="shrink-0">
                                                  {isDone ? (
                                                    grade != null ? (
                                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{grade}/10</span>
                                                    ) : (
                                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Done</span>
                                                    )
                                                  ) : status === 'overdue' ? (
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Overdue</span>
                                                  ) : (
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>
                                                  )}
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── CLASSES TAB ── */}
            {tab === 'classes' && (
              <>
                {cLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="font-bold text-gray-800">No classes yet</p>
                    <p className="text-sm text-gray-500 mt-1">Your enrolled classes will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classes.map((cls: any) => (
                      <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">📖</div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{cls.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{cls.subject || 'General'}</p>
                            {cls.daysOfWeek && cls.daysOfWeek.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">{cls.daysOfWeek.join(', ')} · {cls.startTime} – {cls.endTime}</p>
                            )}
                            {cls.location && <p className="text-xs text-gray-400">{cls.location}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── RESULTS TAB ── */}
            {tab === 'results' && (
              <>
                {submissions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="font-bold text-gray-800">No results yet</p>
                    <p className="text-sm text-gray-500 mt-1">Graded work will show here once your tutor has marked it.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {submissions
                      .filter((s: any) => s.status === 'graded' || s.status === 'parent_verified')
                      .map((s: any) => {
                        const assignment = allWork.find(a => a.id === s.assignmentId);
                        const hasMarkedWork = (s.fileUrls?.length > 0) || s.reviewerAnnotations || s.feedback;
                        return (
                          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 leading-tight">{assignment?.title || 'Assignment'}</p>
                                {s.gradedAt && <p className="text-xs text-gray-400 mt-0.5">Graded {format(new Date(s.gradedAt), 'd MMM yyyy')}</p>}
                                {s.feedback && <p className="text-sm text-gray-600 mt-2 italic line-clamp-2">"{s.feedback}"</p>}
                              </div>
                              <div className="text-right flex-shrink-0">
                                {s.score !== null && s.score !== undefined ? (
                                  <>
                                    <p className="text-2xl font-black text-indigo-700">{s.score}</p>
                                    <p className="text-xs text-gray-400">/{s.maxScore || 20}</p>
                                  </>
                                ) : (
                                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Marked</span>
                                )}
                              </div>
                            </div>
                            {hasMarkedWork && (
                              <button
                                onClick={() => setViewerSub({ ...s, assignmentTitle: assignment?.title || 'Assignment' })}
                                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                              >
                                <Eye size={13} /> View Marked Work
                              </button>
                            )}
                          </div>
                        );
                      })}
                    {submissions.filter((s: any) => s.status === 'graded' || s.status === 'parent_verified').length === 0 && (
                      <div className="col-span-2 text-center py-16">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="font-bold text-gray-800">Waiting for marks</p>
                        <p className="text-sm text-gray-500 mt-1">Your tutor hasn't graded any submissions yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {viewerSub && (
      <MarkedWorkViewer
        submissionId={viewerSub.id}
        fileUrls={viewerSub.fileUrls ?? []}
        documentUrl={viewerSub.documentUrl ?? null}
        reviewerAnnotations={viewerSub.reviewerAnnotations}
        feedback={viewerSub.feedback}
        score={viewerSub.score}
        assignmentTitle={viewerSub.assignmentTitle}
        gradedAt={viewerSub.gradedAt}
        onClose={() => setViewerSub(null)}
      />
    )}
    </>
  );
}
