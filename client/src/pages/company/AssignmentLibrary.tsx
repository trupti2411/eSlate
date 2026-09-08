import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import {
  ChevronLeft, Plus, Edit2, BookOpen, Archive, Users, Search, X, CheckCircle, AlertTriangle, User as UserIcon,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface LibraryItem {
  id: string;
  title: string;
  subjects: string[];
  yearGroups: string[];
  libStatus: 'draft' | 'published' | 'archived';
  maxMarks: number;
  questionCount: number;
  createdByName: string;
  createdAt: string;
}
interface Classroom { id: string; name: string; }

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const SUBJECTS = ['English', 'Mathematics', 'Reading', 'Science', 'Writing', 'Thinking Skills'];

export default function AssignmentLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [allocateItem, setAllocateItem] = useState<LibraryItem | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const buildParams = () => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    if (subjectFilter) p.set('subject', subjectFilter);
    if (search) p.set('search', search);
    return p.toString() ? `?${p.toString()}` : '';
  };

  const { data: rawItems, isLoading } = useQuery<LibraryItem[]>({
    queryKey: [`/api/companies/${companyId}/assignment-library`, statusFilter, subjectFilter, search],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/assignment-library${buildParams()}`);
      if (!res.ok) throw new Error('Failed to fetch library items');
      return res.json();
    },
    enabled: !!companyId,
  });
  const items = Array.isArray(rawItems) ? rawItems : [];

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/assignment-library/${id}/publish`, 'POST', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] }),
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/assignment-library/${id}/archive`, 'POST', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Content</p>
            <h1 className="text-xl font-black">Assignment Library</h1>
          </div>
          <Link
            href="/company/assignment-library/new"
            className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={14} /> New Assignment
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Items grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded mb-3" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No assignments found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first assignment to get started.</p>
            <Link
              href="/company/assignment-library/new"
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              <Plus size={14} /> New Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 leading-snug flex-1">{item.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_BADGE[item.libStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.libStatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.subjects.map(s => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{item.questionCount} questions</span>
                  <span>{item.maxMarks} marks</span>
                  <span>by {item.createdByName}</span>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50">
                  <Link
                    href={`/company/assignment-library/${item.id}`}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </Link>
                  {item.libStatus === 'draft' && (
                    <button
                      onClick={() => publishMutation.mutate(item.id)}
                      disabled={publishMutation.isPending}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Publish
                    </button>
                  )}
                  {item.libStatus === 'published' && (
                    <button
                      onClick={() => archiveMutation.mutate(item.id)}
                      disabled={archiveMutation.isPending}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Archive size={12} /> Archive
                    </button>
                  )}
                  {item.libStatus === 'published' && (
                    <button
                      onClick={() => setAllocateItem(item)}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Users size={12} /> Allocate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {allocateItem && companyId && (
        <AllocateModal
          item={allocateItem}
          companyId={companyId}
          onClose={() => setAllocateItem(null)}
        />
      )}
    </div>
  );
}

interface EnrolledStudentRow { studentId: string; student?: { id: string; firstName?: string | null; lastName?: string | null; user?: { firstName?: string | null; lastName?: string | null } } }
interface StudentOption { id: string; first_name?: string | null; last_name?: string | null; user?: { firstName?: string | null; lastName?: string | null } }

type Step = 'form' | 'summary';

function AllocateModal({ item, companyId, onClose }: { item: LibraryItem; companyId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('form');
  const [targetType, setTargetType] = useState<'class' | 'students'>('class');
  const [classId, setClassId] = useState('');
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [releaseDate, setReleaseDate] = useState('');
  const [allowResubmission, setAllowResubmission] = useState(false);
  const [studentNote, setStudentNote] = useState('');
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<{ impact: string; studentIds: string[] } | null>(null);
  const [success, setSuccess] = useState<{ allocated: number } | null>(null);

  const { data: classes = [] } = useQuery<Classroom[]>({
    queryKey: [`/api/companies/${companyId}/classes`],
    enabled: !!companyId,
  });
  const { data: allStudents = [] } = useQuery<StudentOption[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId && targetType === 'students',
  });
  const { data: enrolledRows = [] } = useQuery<EnrolledStudentRow[]>({
    queryKey: [`/api/classes/${classId}/students`],
    enabled: !!classId && targetType === 'class',
  });

  const enrolledStudents = useMemo(() => enrolledRows.map(r => ({
    id: r.studentId,
    name: r.student ? `${r.student.firstName ?? r.student.user?.firstName ?? ''} ${r.student.lastName ?? r.student.user?.lastName ?? ''}`.trim() || 'Student' : 'Student',
  })), [enrolledRows]);

  const targetCount = targetType === 'class'
    ? enrolledStudents.filter(s => !excludedIds.has(s.id)).length
    : selectedStudentIds.size;

  const buildPayload = (confirmDuplicates?: boolean) => ({
    targetType,
    ...(targetType === 'class' ? { classId, excludeStudentIds: Array.from(excludedIds) } : { studentIds: Array.from(selectedStudentIds) }),
    dueAt: dueDate ? new Date(`${dueDate}T${dueTime}:00`).toISOString() : undefined,
    releaseAt: releaseDate ? new Date(`${releaseDate}T00:00:00`).toISOString() : undefined,
    allowResubmission,
    studentNote: studentNote.trim() || undefined,
    ...(confirmDuplicates ? { confirmDuplicates: true } : {}),
  });

  const allocateMutation = useMutation({
    mutationFn: (confirmDuplicates?: boolean) => apiRequest(`/api/assignment-library/${item.id}/allocate`, 'POST', buildPayload(confirmDuplicates)),
    onSuccess: (data: any) => {
      setSuccess({ allocated: data.allocated ?? targetCount });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] });
    },
    onError: (e: any) => {
      if (e?.body?.message === 'confirm_required') {
        setDuplicateWarning({ impact: e.body.impact, studentIds: e.body.studentIds ?? [] });
        return;
      }
      setError(e?.message ?? 'Failed to allocate. Please try again.');
    },
  });

  const canProceed = targetCount > 0 && !!dueDate && (targetType === 'class' ? !!classId : true);

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-gray-900">Allocated!</h3>
          <p className="text-sm text-gray-500 mt-2">"{item.title}" allocated to {success.allocated} student{success.allocated === 1 ? '' : 's'}.</p>
          <button onClick={onClose} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-sm">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const dueLabel = dueDate ? new Date(`${dueDate}T${dueTime}:00`).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Confirm Allocation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Assignment</span><span className="font-semibold text-gray-900 text-right">{item.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="font-semibold text-gray-900 text-right">{targetType === 'class' ? classes.find(c => c.id === classId)?.name : `${targetCount} selected student${targetCount === 1 ? '' : 's'}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Students</span><span className="font-semibold text-gray-900">{targetCount}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Due</span><span className="font-semibold text-gray-900 text-right">{dueLabel}</span></div>
            {releaseDate && <div className="flex justify-between"><span className="text-gray-500">Release date</span><span className="font-semibold text-gray-900">{new Date(releaseDate).toLocaleDateString('en-AU')}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Resubmission</span><span className="font-semibold text-gray-900">{allowResubmission ? 'Allowed' : 'Not allowed'}</span></div>
          </div>

          {duplicateWarning && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{duplicateWarning.impact}</p>
            </div>
          )}
          {error && <p className="text-sm text-rose-600 mt-3 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm">
              Back
            </button>
            <button
              onClick={() => allocateMutation.mutate(!!duplicateWarning)}
              disabled={allocateMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm"
            >
              {allocateMutation.isPending ? 'Allocating…' : duplicateWarning ? 'Allocate Anyway' : 'Confirm & Allocate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">Allocate Assignment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Allocating: <span className="font-semibold text-gray-900">{item.title}</span></p>
        {error && <p className="text-sm text-rose-600 mb-3 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Target</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetType('class')}
                className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl border ${targetType === 'class' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                Whole Class
              </button>
              <button
                onClick={() => setTargetType('students')}
                className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl border ${targetType === 'students' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                Specific Students
              </button>
            </div>
          </div>

          {targetType === 'class' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Class</label>
              <select
                value={classId}
                onChange={e => { setClassId(e.target.value); setExcludedIds(new Set()); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select a class…</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {classId && enrolledStudents.length > 0 && (
                <div className="mt-2 border border-gray-100 rounded-xl max-h-36 overflow-y-auto divide-y divide-gray-50">
                  {enrolledStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!excludedIds.has(s.id)}
                        onChange={e => setExcludedIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.delete(s.id); else next.add(s.id);
                          return next;
                        })}
                      />
                      <span className="text-gray-700">{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {classId && (
                <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1"><Users size={11} /> Will allocate to {targetCount} of {enrolledStudents.length} enrolled students</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Students</label>
              <div className="border border-gray-100 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50">
                {allStudents.map(s => (
                  <label key={s.id} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(s.id)}
                      onChange={e => setSelectedStudentIds(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(s.id); else next.delete(s.id);
                        return next;
                      })}
                    />
                    <UserIcon size={11} className="text-gray-400" />
                    <span className="text-gray-700">{`${s.user?.firstName ?? s.first_name ?? ''} ${s.user?.lastName ?? s.last_name ?? ''}`.trim() || 'Student'}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">{targetCount} student{targetCount === 1 ? '' : 's'} selected</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Release Date (optional)</label>
            <input
              type="date"
              value={releaseDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setReleaseDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-[11px] text-gray-400 mt-1">Hidden from students until this date. Leave blank to make available immediately.</p>
          </div>

          <label className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 cursor-pointer">
            <span className="text-sm font-semibold text-gray-700">Allow resubmission</span>
            <input type="checkbox" checked={allowResubmission} onChange={e => setAllowResubmission(e.target.checked)} />
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Note to Students (optional)</label>
            <textarea
              value={studentNote}
              onChange={e => setStudentNote(e.target.value)}
              rows={2}
              placeholder="Overrides or supplements the assignment description…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={() => { setDuplicateWarning(null); setError(''); setStep('summary'); }}
            disabled={!canProceed}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            Review &amp; Allocate
          </button>
        </div>
      </div>
    </div>
  );
}
