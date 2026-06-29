import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, withBase, authHeaders } from '@/lib/queryClient';
import {
  BookOpen, Bell, LogOut, ArrowLeft, UserPlus, Trash2, X, Save,
  User, Users, GraduationCap, Calendar, CalendarDays, School,
  Pencil, Play, CheckCircle2, Archive, RotateCcw, Copy,
  ClipboardPlus, FileText, Download, Clock, ClipboardCheck,
  ListOrdered, CheckSquare, XSquare, AlertCircle, MinusCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';

interface ClassData {
  id: number;
  business_id: number;
  course_id: number | null;
  course_offering_id: number | null;
  tutor_id: number | null;
  academic_year_id: number;
  year_group_id: number;
  subject_id: number;
  name: string;
  starts_on: string | null;
  ends_on: string | null;
  capacity: number | null;
  status: 'draft' | 'active' | 'completed' | 'archived' | string;
  description: string | null;
  level: string | null;
  schedule_day_of_week: number | null;
  schedule_start_time: string | null;
  schedule_end_time: string | null;
  location: string | null;
  course?: { id: number; name: string; description?: string | null } | null;
  subject?: { id: number; name: string; code?: string } | null;
  subjects?: { id: number; name: string; code?: string; pivot?: { is_primary?: boolean } }[];
  yearGroup?: { id: number; label: string; code: string } | null;
  year_group?: { id: number; label: string; code: string } | null;
  tutor?: { id: number; user?: { name?: string; email?: string } } | null;
  academicYear?: { id: number; year: number } | null;
  academic_year?: { id: number; year: number } | null;
  terms?: { id: number; name: string; start_date: string; end_date: string }[];
  students?: StudentRow[];
}

interface StudentRow {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  year_group_code?: string | null;
  school?: string | null;
  pivot?: { enrolled_at?: string };
  user?: { firstName?: string | null; lastName?: string | null } | null;
}

function fullName(s: StudentRow): string {
  const fn = s.first_name ?? s.user?.firstName ?? '';
  const ln = s.last_name ?? s.user?.lastName ?? '';
  return `${fn} ${ln}`.trim() || `Student #${s.id}`;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

const STATUS_TONE: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  active:    { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
  completed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Completed' },
  archived:  { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Archived' },
};

type PageTab = 'overview' | 'sessions' | 'waitlist';

export default function ClassDetailPage() {
  const [, params] = useRoute('/company/classes/:id');
  const classId = params?.id;
  const { logoutMutation } = useAuth();
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PageTab>('overview');

  const { data: cls, isLoading } = useQuery<ClassData>({
    queryKey: [`/api/classes/${classId}`],
    enabled: !!classId,
  });

  const yearGroup = cls?.yearGroup ?? cls?.year_group;
  const academicYear = cls?.academicYear ?? cls?.academic_year;
  const tone = STATUS_TONE[cls?.status ?? 'draft'] ?? STATUS_TONE.draft;
  const tutorName = cls?.tutor?.user?.name
    || (cls?.tutor_id ? `Tutor #${cls.tutor_id}` : 'Not assigned');
  const enrolledCount = cls?.students?.length ?? 0;
  const atCap = cls?.capacity != null && enrolledCount >= cls.capacity;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Class</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{cls?.name ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/company/classes" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
                <ArrowLeft size={12} /> Back
              </Link>
              <button className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center" aria-label="Notifications">
                <Bell size={16} />
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading || !cls ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 shadow-md">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    {cls.course && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                        Course · {cls.course.name}
                      </p>
                    )}
                    <h2 className="text-2xl font-black mt-0.5 truncate">{cls.name}</h2>
                    {cls.description && (
                      <p className="text-sm text-indigo-100 mt-0.5">{cls.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${tone.bg} ${tone.text}`}>
                    {tone.label}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat icon={<GraduationCap size={14} />} label="Year" value={yearGroup?.label ?? '—'} />
                <Stat
                  icon={<School size={14} />}
                  label={cls.subjects && cls.subjects.length > 1 ? 'Subjects' : 'Subject'}
                  value={(() => {
                    if (cls.subjects && cls.subjects.length > 0) {
                      if (cls.subjects.length === 1) return cls.subjects[0].name;
                      if (cls.subjects.length <= 2) return cls.subjects.map((s: any) => s.name).join(' + ');
                      return `${cls.subjects.length} subjects`;
                    }
                    return cls.subject?.name ?? '—';
                  })()}
                />
                <Stat icon={<User size={14} />} label="Tutor" value={tutorName} />
                <Stat icon={<Users size={14} />} label="Roster" value={`${enrolledCount}${cls.capacity != null ? ` / ${cls.capacity}` : ''}`} />
              </div>

              {(cls.starts_on || cls.ends_on) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-100 flex-wrap">
                  <Calendar size={12} />
                  <span>{cls.starts_on ? formatDate(cls.starts_on) : '?'} → {cls.ends_on ? formatDate(cls.ends_on) : '?'}</span>
                  {academicYear && <span>· AY {academicYear.year}</span>}
                  {cls.level && <span>· Level: {cls.level}</span>}
                </div>
              )}

              {cls.schedule_day_of_week && cls.schedule_start_time && (
                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-100 flex-wrap">
                  <CalendarDays size={12} />
                  <span className="font-semibold">{['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][cls.schedule_day_of_week]}</span>
                  <span>{(cls.schedule_start_time ?? '').slice(0, 5)}{cls.schedule_end_time ? `–${cls.schedule_end_time.slice(0, 5)}` : ''}</span>
                  {cls.location && <span>· {cls.location}</span>}
                </div>
              )}

              {cls.terms && cls.terms.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <CalendarDays size={12} className="text-indigo-200" />
                  {cls.terms.map(t => (
                    <span key={t.id} className="text-[10px] font-bold uppercase tracking-widest bg-white/15 text-white px-2 py-1 rounded-full">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
              {([
                { id: 'overview', label: 'Overview', icon: <BookOpen size={13} /> },
                { id: 'sessions', label: 'Sessions', icon: <ClipboardCheck size={13} /> },
                { id: 'waitlist', label: 'Waitlist', icon: <ListOrdered size={13} /> },
              ] as { id: PageTab; label: string; icon: React.ReactNode }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <RosterSection
                    classId={cls.id}
                    students={cls.students ?? []}
                    capacity={cls.capacity}
                    atCap={atCap}
                    enrolledCount={enrolledCount}
                    onEnrolClick={() => setEnrolOpen(true)}
                    onWaitlistClick={() => setActiveTab('waitlist')}
                  />
                  <AssignmentsSection
                    classId={cls.id}
                    onCreateClick={() => setCreateAssignmentOpen(true)}
                  />
                </div>
                <div>
                  <LifecycleSection classId={String(cls.id)} businessId={cls.business_id} status={cls.status} className={cls} />
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <SessionsTab classId={String(cls.id)} cls={cls} />
            )}

            {activeTab === 'waitlist' && (
              <WaitlistTab classId={String(cls.id)} cls={cls} />
            )}
          </>
        )}
      </main>

      {enrolOpen && cls && (
        <EnrolModal
          classId={cls.id}
          businessId={cls.business_id}
          alreadyEnrolledIds={new Set((cls.students ?? []).map(s => s.id))}
          onClose={() => setEnrolOpen(false)}
        />
      )}
      {editOpen && cls && (
        <EditClassModal cls={cls} onClose={() => setEditOpen(false)} />
      )}
      {createAssignmentOpen && cls && (
        <CreateAssignmentModal classId={cls.id} onClose={() => setCreateAssignmentOpen(false)} />
      )}
    </div>
  );
}

/* ---------- Assignments ---------- */

interface AssignmentRow {
  id: number;
  title: string;
  description?: string | null;
  pdf_path?: string | null;
  pdf_original_name?: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
  submissions?: { id: number; status: string }[];
}

function AssignmentsSection({ classId, onCreateClick }: { classId: number; onCreateClick: () => void }) {
  const { data: assignments = [], isLoading } = useQuery<AssignmentRow[]>({
    queryKey: [`/api/assignments?class_id=${classId}`],
  });

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Assignments ({assignments.length})
        </h3>
        <button
          onClick={onCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
        >
          <ClipboardPlus size={12} /> New assignment
        </button>
      </div>
      <div className="p-5">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No assignments yet. Click "New assignment" to upload a PDF and assign it to everyone enrolled.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {assignments.map(a => <AssignmentRow key={a.id} a={a} />)}
          </ul>
        )}
      </div>
    </section>
  );
}

function AssignmentRow({ a }: { a: AssignmentRow }) {
  const downloadPdf = async () => {
    const res = await fetch(withBase(`/api/assignments/${a.id}/pdf`), { headers: authHeaders() });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = a.pdf_original_name ?? `assignment-${a.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const submittedCount = (a.submissions ?? []).filter(s => s.status === 'submitted').length;
  const gradedCount = (a.submissions ?? []).filter(s => s.status === 'graded').length;
  return (
    <li className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{a.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            a.status === 'published' ? 'bg-emerald-100 text-emerald-700'
              : a.status === 'archived' ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-100 text-amber-700'
          }`}>{a.status}</span>
          {a.due_date && <span className="flex items-center gap-1"><Clock size={11} /> due {a.due_date.slice(0, 10)}</span>}
          {submittedCount > 0 && <span>{submittedCount} submitted</span>}
          {gradedCount > 0 && <span>{gradedCount} graded</span>}
        </p>
      </div>
      {a.pdf_path && (
        <button
          onClick={downloadPdf}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 flex-shrink-0"
          title="Download PDF"
        >
          <Download size={12} /> PDF
        </button>
      )}
    </li>
  );
}

function CreateAssignmentModal({ classId, onClose }: { classId: number; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !pdf) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      if (description.trim()) fd.append('description', description.trim());
      if (dueDate) fd.append('due_date', dueDate);
      fd.append('class_id', String(classId));
      fd.append('status', status);
      fd.append('pdf', pdf);

      const res = await fetch(withBase('/api/assignments'), {
        method: 'POST',
        headers: { Accept: 'application/json', ...authHeaders() },  // no Content-Type — browser sets multipart boundary
        body: fd,
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { msg = (await res.json())?.message ?? msg; } catch {}
        throw new Error(msg);
      }
      toast({ title: 'Assignment created' });
      qc.invalidateQueries({ queryKey: [`/api/assignments?class_id=${classId}`] });
      onClose();
    } catch (e: any) {
      toast({ title: 'Could not create assignment', description: e.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const valid = title.trim() && pdf;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <ClipboardPlus size={16} className="text-indigo-600" /> New assignment
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <AField label="Title" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 3 Maths practice"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </AField>
          <AField label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Instructions or context for students"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </AField>
          <div className="grid grid-cols-2 gap-3">
            <AField label="Due date (optional)">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </AField>
            <AField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="published">Published (visible to students)</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </AField>
          </div>
          <AField label="PDF" required hint="One PDF — max 20MB. Students see this on their dashboard.">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-bold file:px-3 file:py-2 hover:file:bg-indigo-100"
            />
            {pdf && (
              <p className="text-xs text-gray-500 mt-1.5 truncate">
                Selected: {pdf.name} ({Math.round(pdf.size / 1024)} KB)
              </p>
            )}
          </AField>
          <p className="text-xs text-gray-500">
            All students enrolled in this class will see this assignment when status is "published".
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid || submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {submitting ? 'Uploading…' : 'Create assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AField({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ---------- Lifecycle ---------- */

function LifecycleSection({ classId, businessId, status, className: cls }: { classId: string; businessId: number; status: string; className: ClassData }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const transition = useMutation({
    mutationFn: (next: string) => apiRequest(`/api/classes/${classId}`, 'PATCH', { status: next }),
    onSuccess: (_, next) => {
      toast({ title: `Status changed to ${next}` });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/classes/${classId}/archive`, 'POST', {}),
    onSuccess: () => {
      toast({ title: 'Class archived' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (e: any) => toast({ title: 'Failed to archive', description: e.message, variant: 'destructive' }),
  });

  const restoreMutation = useMutation({
    mutationFn: () => apiRequest(`/api/classes/${classId}/restore`, 'POST', {}),
    onSuccess: () => {
      toast({ title: 'Class restored to active' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (e: any) => toast({ title: 'Failed to restore', description: e.message, variant: 'destructive' }),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiRequest(`/api/classes/${classId}/duplicate`, 'POST', {}),
    onSuccess: (data: any) => {
      toast({ title: `Duplicated as "${data.name}"` });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
      if (data.id) navigate(`/company/classes/${data.id}`);
    },
    onError: (e: any) => toast({ title: 'Could not duplicate', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/companies/${businessId}/classes/${classId}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: 'Class deleted' });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
      navigate('/company/classes');
    },
    onError: (e: any) => toast({ title: 'Could not delete', description: e.message, variant: 'destructive' }),
  });

  type Btn = { to: string; label: string; icon: React.ReactNode; tone: string };
  const transitions: Btn[] = [];
  if (status === 'draft') {
    transitions.push({ to: 'active', label: 'Activate', icon: <Play size={12} />, tone: 'bg-emerald-600 hover:bg-emerald-700' });
  }
  if (status === 'active') {
    transitions.push({ to: 'completed', label: 'Mark completed', icon: <CheckCircle2 size={12} />, tone: 'bg-indigo-600 hover:bg-indigo-700' });
  }
  if (status === 'completed') {
    transitions.push({ to: 'active', label: 'Reopen as active', icon: <Play size={12} />, tone: 'bg-amber-600 hover:bg-amber-700' });
  }

  const isPending = transition.isPending || archiveMutation.isPending || restoreMutation.isPending || duplicateMutation.isPending;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Lifecycle</h3>
      <p className="text-xs text-gray-500 mb-3">
        Status: <span className="font-bold text-gray-700 capitalize">{status}</span>
      </p>
      <div className="space-y-2">
        {transitions.map(t => (
          <button
            key={t.to}
            onClick={() => transition.mutate(t.to)}
            disabled={isPending}
            className={`w-full ${t.tone} text-white text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60`}
          >
            {t.icon} {t.label}
          </button>
        ))}

        {/* Duplicate (ESLATE-28) */}
        <button
          onClick={() => {
            if (confirm(`Duplicate "${cls.name}"? A copy will be created in draft status (no terms or students).`)) {
              duplicateMutation.mutate();
            }
          }}
          disabled={isPending}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Copy size={12} /> Duplicate class
        </button>

        {/* Archive / Restore (ESLATE-27) */}
        {status !== 'archived' ? (
          <button
            onClick={() => {
              if (confirm('Archive this class? Students will keep their historical record.')) {
                archiveMutation.mutate();
              }
            }}
            disabled={isPending}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Archive size={12} /> Archive class
          </button>
        ) : (
          <>
            <div className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2 border border-rose-100">
              Archived — read-only. Restore to make active again.
            </div>
            <button
              onClick={() => restoreMutation.mutate()}
              disabled={isPending}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RotateCcw size={12} /> Restore class
            </button>
          </>
        )}

        <button
          onClick={() => {
            if (confirm('Permanently delete this class? This cannot be undone.')) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
        >
          <Trash2 size={12} /> Delete class permanently
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Draft → Active makes the class visible to students. Completed locks the roster but keeps history.
      </p>
    </section>
  );
}

/* ---------- Edit ---------- */

interface CourseSummary { id: number; name: string; }
interface TutorPickerRow { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; }

function EditClassModal({ cls, onClose }: { cls: ClassData; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [name, setName] = useState(cls.name);
  const [description, setDescription] = useState(cls.description ?? '');
  const [level, setLevel] = useState(cls.level ?? '');
  const [capacity, setCapacity] = useState(cls.capacity != null ? String(cls.capacity) : '');
  const [courseId, setCourseId] = useState<string>(cls.course_id ? String(cls.course_id) : '');
  const [tutorId, setTutorId] = useState<string>(cls.tutor_id ? String(cls.tutor_id) : '');
  const [pickedTermIds, setPickedTermIds] = useState<Set<string>>(new Set((cls.terms ?? []).map(t => String(t.id))));
  const [scheduleDay, setScheduleDay] = useState<string>(cls.schedule_day_of_week ? String(cls.schedule_day_of_week) : '');
  const [startTime, setStartTime] = useState<string>(cls.schedule_start_time?.slice(0, 5) ?? '');
  const [endTime, setEndTime] = useState<string>(cls.schedule_end_time?.slice(0, 5) ?? '');
  const [location, setLocation] = useState<string>(cls.location ?? '');

  const { data: courses = [] } = useQuery<CourseSummary[]>({ queryKey: ['/api/courses'] });
  const { data: tutors = [] } = useQuery<TutorPickerRow[]>({
    queryKey: [`/api/companies/${cls.business_id}/tutors`],
  });
  const { data: hierarchy } = useQuery<any>({
    queryKey: [`/api/companies/${cls.business_id}/academic-hierarchy`],
  });
  const allYears = useMemo<any[]>(() => {
    if (!hierarchy) return [];
    return Array.isArray(hierarchy) ? hierarchy : (hierarchy.years ?? []);
  }, [hierarchy]);
  const thisYearTerms = useMemo(() => {
    const y = allYears.find((y: any) => y.id === cls.academic_year_id);
    return (y?.terms ?? []) as { id: string; name: string; startDate?: string; endDate?: string }[];
  }, [allYears, cls.academic_year_id]);

  const toggleTerm = (id: string) => {
    setPickedTermIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/classes/${cls.id}`, 'PATCH', {
        name: name.trim() || undefined,
        description: description.trim() || null,
        level: level.trim() || null,
        capacity: capacity ? Number(capacity) : null,
        course_id: courseId || null,
        tutor_id: tutorId || null,
        term_ids: Array.from(pickedTermIds),
        schedule_day_of_week: scheduleDay ? Number(scheduleDay) : null,
        schedule_start_time: startTime || null,
        schedule_end_time: endTime || null,
        location: location.trim() || null,
      }),
    onSuccess: () => {
      toast({ title: 'Class updated' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${cls.id}`] });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Pencil size={16} className="text-indigo-600" /> Edit class
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto">
          <EditField label="Class name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </EditField>

          <div className="grid grid-cols-2 gap-3">
            <EditField label="Course (catalogue parent)">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Standalone (no course)</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </EditField>
            <EditField label="Tutor">
              <select
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Not assigned</option>
                {tutors.map(t => {
                  const nm = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email || `Tutor #${t.id}`;
                  return <option key={t.id} value={t.id}>{nm}</option>;
                })}
              </select>
            </EditField>
          </div>

          <EditField label="Terms">
            {thisYearTerms.length === 0 ? (
              <p className="text-xs text-gray-500">No terms available in this academic year.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {thisYearTerms.map(t => {
                  const isOn = pickedTermIds.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTerm(t.id)}
                      className={`text-left rounded-xl border px-3 py-2 transition-colors ${
                        isOn ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          isOn ? 'bg-indigo-600 text-white' : 'border border-gray-300 bg-white'
                        }`}>
                          {isOn && <span className="text-[10px]">✓</span>}
                        </span>
                        <span className="font-bold text-sm">{t.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </EditField>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Schedule</h4>
            <div className="grid grid-cols-3 gap-3">
              <EditField label="Day">
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">—</option>
                  <option value="1">Mon</option>
                  <option value="2">Tue</option>
                  <option value="3">Wed</option>
                  <option value="4">Thu</option>
                  <option value="5">Fri</option>
                  <option value="6">Sat</option>
                  <option value="7">Sun</option>
                </select>
              </EditField>
              <EditField label="Start">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </EditField>
              <EditField label="End">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </EditField>
            </div>
            <div className="mt-3">
              <EditField label="Location">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Room A, Online, …"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </EditField>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditField label="Capacity">
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min={1}
                placeholder="No cap"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </EditField>
            <EditField label="Difficulty">
              <input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Beginner, Intermediate, Advanced, …"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </EditField>
          </div>

          <EditField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </EditField>

          <p className="text-xs text-gray-400">
            Year group, subject, and academic year are fixed for a class — create a new class if those need to change.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => m.mutate()}
            disabled={!name.trim() || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {m.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-200">
        {icon} {label}
      </div>
      <p className="text-sm font-black mt-0.5 text-white truncate">{value}</p>
    </div>
  );
}

function RosterSection({
  classId, students, capacity, atCap, enrolledCount, onEnrolClick, onWaitlistClick,
}: {
  classId: number;
  students: StudentRow[];
  capacity: number | null;
  atCap: boolean;
  enrolledCount: number;
  onEnrolClick: () => void;
  onWaitlistClick: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const fillPct = capacity != null && capacity > 0 ? Math.min(100, Math.round((enrolledCount / capacity) * 100)) : 0;
  const fillColor = fillPct >= 100 ? 'bg-rose-500' : fillPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

  const unenrol = useMutation({
    mutationFn: (studentId: number) =>
      apiRequest(`/api/classes/${classId}/students/${studentId}`, 'DELETE', {}),
    onSuccess: (data: any) => {
      toast({ title: 'Removed from class' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      if (data?.waitlistInfo) {
        toast({ title: `Waitlist: ${data.waitlistInfo.nextStudentName} is next`, description: `${data.waitlistInfo.waitlistCount} student(s) on waitlist` });
      }
    },
    onError: (e: any) => toast({ title: 'Failed to remove', description: e.message, variant: 'destructive' }),
  });

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Roster ({students.length}{capacity != null ? ` / ${capacity}` : ''})
        </h3>
        <div className="flex gap-2">
          {atCap && (
            <button onClick={onWaitlistClick} className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <ListOrdered size={12} /> Waitlist
            </button>
          )}
          <a href={`/api/export/classes/${classId}/students`} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Download size={12} /> Export
          </a>
          <button
            onClick={onEnrolClick}
            disabled={atCap}
            title={atCap ? 'Class is full — use waitlist' : undefined}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <UserPlus size={12} /> {atCap ? 'Full' : 'Enrol students'}
          </button>
        </div>
      </div>
      {capacity != null && (
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Capacity</span>
            <span className={`font-bold ${fillPct >= 100 ? 'text-rose-600' : fillPct >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {enrolledCount} / {capacity} ({fillPct}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${fillColor}`} style={{ width: `${fillPct}%` }} />
          </div>
          {fillPct >= 80 && fillPct < 100 && (
            <p className="text-xs text-amber-600 mt-1 font-semibold">Almost full — {capacity - enrolledCount} spot{capacity - enrolledCount === 1 ? '' : 's'} remaining</p>
          )}
        </div>
      )}
      <div className="p-5">
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">No students enrolled yet. Click "Enrol students" to add from your roster.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {students.map(s => {
              const name = fullName(s);
              const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'S';
              return (
                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500">
                      {s.year_group_code && <span className="font-semibold">{s.year_group_code}</span>}
                      {s.school && <> · {s.school}</>}
                      {s.pivot?.enrolled_at && <> · enrolled {formatDate(s.pivot.enrolled_at)}</>}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${name} from this class?`)) unenrol.mutate(s.id);
                    }}
                    disabled={unenrol.isPending}
                    className="text-gray-400 hover:text-rose-600 transition-colors flex-shrink-0"
                    aria-label="Remove from class"
                    title="Remove from class"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function EnrolModal({
  classId, businessId, alreadyEnrolledIds, onClose,
}: {
  classId: number;
  businessId: number;
  alreadyEnrolledIds: Set<number>;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  const { data: allStudents = [] } = useQuery<StudentRow[]>({
    queryKey: [`/api/companies/${businessId}/students`],
  });

  const eligible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter(s => !alreadyEnrolledIds.has(s.id))
      .filter(s => {
        if (!q) return true;
        const nm = `${s.first_name ?? ''} ${s.last_name ?? ''}`.toLowerCase();
        return nm.includes(q) || (s.year_group_code ?? '').toLowerCase().includes(q);
      });
  }, [allStudents, alreadyEnrolledIds, search]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // The classroom enrol endpoint takes one student_id per call. Loop for multi-select.
  const m = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      for (const studentId of ids) {
        await apiRequest(`/api/classes/${classId}/students`, 'POST', { studentId });
      }
      return ids.length;
    },
    onSuccess: (count) => {
      toast({ title: `Enrolled ${count} student${count === 1 ? '' : 's'}` });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      onClose();
    },
    onError: (e: any) =>
      toast({ title: 'Could not enrol', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black flex items-center gap-2">
            <UserPlus size={16} className="text-indigo-600" /> Enrol students
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter students…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          {eligible.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              {allStudents.length === 0
                ? 'No students yet — add some on /company/students first.'
                : 'All matching students are already in this class.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {eligible.map(s => {
                const name = fullName(s);
                const isOn = selected.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      className={`w-full text-left rounded-xl px-3 py-2 flex items-center gap-3 transition-colors ${
                        isOn ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        isOn ? 'bg-indigo-600 text-white' : 'border border-gray-300 bg-white'
                      }`}>
                        {isOn && <span className="text-[10px]">✓</span>}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 truncate block">{name}</span>
                        {s.year_group_code && (
                          <span className="text-xs text-gray-500">{s.year_group_code}{s.school ? ` · ${s.school}` : ''}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => m.mutate()}
            disabled={selected.size === 0 || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {m.isPending ? 'Enrolling…' : `Enrol ${selected.size}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== ESLATE-29: Sessions Tab ===== */

interface SessionRow {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceCount: number;
  presentCount: number;
  hasAttendance: boolean;
}

interface RollEntry {
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
  yearGroupCode: string | null;
  attendanceStatus: string;
  notes: string;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'Present', icon: <CheckSquare size={13} className="text-emerald-600" /> },
  { value: 'absent', label: 'Absent', icon: <XSquare size={13} className="text-rose-600" /> },
  { value: 'late', label: 'Late', icon: <AlertCircle size={13} className="text-amber-600" /> },
  { value: 'excused', label: 'Excused', icon: <MinusCircle size={13} className="text-indigo-500" /> },
];

function SessionsTab({ classId, cls }: { classId: string; cls: ClassData }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [roll, setRoll] = useState<Record<string, string>>({}); // studentId → status
  const [addDate, setAddDate] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: sessions = [], isLoading } = useQuery<SessionRow[]>({
    queryKey: [`/api/classes/${classId}/sessions`],
    enabled: !!classId,
  });

  const { data: rollData = [], isLoading: rollLoading } = useQuery<RollEntry[]>({
    queryKey: [`/api/classes/${classId}/sessions/${openSessionId}/roll`],
    enabled: !!openSessionId,
    onSuccess: (data: RollEntry[]) => {
      const initial: Record<string, string> = {};
      data.forEach((r: RollEntry) => { initial[r.studentId] = r.attendanceStatus === 'not_marked' ? 'present' : r.attendanceStatus; });
      setRoll(initial);
    },
  } as any);

  const saveAttendanceMutation = useMutation({
    mutationFn: () => apiRequest(`/api/sessions/${openSessionId}/attendance/save`, 'POST', {
      records: rollData.map((r: RollEntry) => ({ studentId: r.studentId, status: roll[r.studentId] ?? 'absent', notes: '' })),
    }),
    onSuccess: () => {
      toast({ title: 'Attendance saved' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/sessions`] });
      setOpenSessionId(null);
    },
    onError: (e: any) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (sid: string) => apiRequest(`/api/classes/${classId}/sessions/${sid}/cancel`, 'PATCH', {}),
    onSuccess: () => {
      toast({ title: 'Session cancelled' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/sessions`] });
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: () => apiRequest(`/api/classes/${classId}/sessions`, 'POST', { sessionDate: addDate }),
    onSuccess: () => {
      toast({ title: 'Session added' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/sessions`] });
      setAddDate('');
      setShowAdd(false);
    },
    onError: (e: any) => toast({ title: 'Failed to add session', description: e.message, variant: 'destructive' }),
  });

  const markAllPresent = () => {
    const next: Record<string, string> = {};
    rollData.forEach((r: RollEntry) => { next[r.studentId] = 'present'; });
    setRoll(next);
  };

  const sessionStatusBadge = (s: SessionRow) => {
    if (s.status === 'cancelled') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Cancelled</span>;
    if (s.hasAttendance) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Marked ({s.presentCount}/{s.attendanceCount})</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Not marked</span>;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Sessions ({sessions.length})</h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            + Add session
          </button>
        </div>

        {showAdd && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button
              onClick={() => addSessionMutation.mutate()}
              disabled={!addDate || addSessionMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-xl"
            >
              {addSessionMutation.isPending ? 'Adding…' : 'Add'}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        )}

        <div className="p-5">
          {isLoading ? <p className="text-sm text-gray-500">Loading…</p> :
            sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No sessions yet. Use "Generate Sessions" in the class settings or add individual sessions above.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {sessions.map(s => (
                  <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(s.sessionDate).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          {s.startTime && <span>{s.startTime.slice(0, 5)}–{s.endTime?.slice(0, 5)}</span>}
                          {sessionStatusBadge(s)}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {s.status !== 'cancelled' && (
                          <button
                            onClick={() => setOpenSessionId(openSessionId === s.id ? null : s.id)}
                            className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1"
                          >
                            <ClipboardCheck size={12} /> {openSessionId === s.id ? 'Close' : 'Mark'}
                          </button>
                        )}
                        {s.status !== 'cancelled' && (
                          <button
                            onClick={() => { if (confirm('Cancel this session?')) cancelSessionMutation.mutate(s.id); }}
                            className="text-xs text-gray-400 hover:text-rose-600 px-2 py-1.5 rounded-xl"
                            title="Cancel session"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Roll call panel */}
                    {openSessionId === s.id && (
                      <div className="mt-3 ml-12 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Roll call</p>
                          <button onClick={markAllPresent} className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl">
                            Mark all present
                          </button>
                        </div>
                        {rollLoading ? <p className="p-4 text-sm text-gray-500">Loading roll…</p> : (
                          rollData.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500">No students enrolled in this class.</p>
                          ) : (
                            <ul className="divide-y divide-gray-100">
                              {rollData.map((r: RollEntry) => (
                                <li key={r.studentId} className="flex items-center gap-3 px-4 py-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                                    {(r.firstName[0] ?? '').toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                                    {(r.rollNumber || r.yearGroupCode) && (
                                      <p className="text-xs text-gray-500">{[r.rollNumber, r.yearGroupCode].filter(Boolean).join(' · ')}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    {ATTENDANCE_OPTIONS.map(opt => (
                                      <button
                                        key={opt.value}
                                        onClick={() => setRoll(prev => ({ ...prev, [r.studentId]: opt.value }))}
                                        title={opt.label}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                          roll[r.studentId] === opt.value ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'
                                        }`}
                                      >
                                        {opt.icon}
                                      </button>
                                    ))}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )
                        )}
                        <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-gray-200 bg-white">
                          <button onClick={() => setOpenSessionId(null)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl">Cancel</button>
                          <button
                            onClick={() => saveAttendanceMutation.mutate()}
                            disabled={saveAttendanceMutation.isPending || rollData.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                          >
                            <Save size={13} /> {saveAttendanceMutation.isPending ? 'Saving…' : 'Save attendance'}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>
    </div>
  );
}

/* ===== ESLATE-31: Waitlist Tab ===== */

interface WaitlistEntry {
  id: string;
  position: number;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
  yearGroupCode: string | null;
  addedAt: string;
  addedByName: string | null;
  status: string;
}

function WaitlistTab({ classId, cls }: { classId: string; cls: ClassData }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addStudentId, setAddStudentId] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: waitlist = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: [`/api/classes/${classId}/waitlist`],
    enabled: !!classId,
  });

  const { data: allStudents = [] } = useQuery<StudentRow[]>({
    queryKey: [`/api/companies/${cls.business_id}/students`],
  });

  const enrolledIds = new Set((cls.students ?? []).map(s => String(s.id)));
  const waitlistedIds = new Set(waitlist.map(w => w.studentId));
  const eligibleForWaitlist = allStudents.filter(s => !enrolledIds.has(String(s.id)) && !waitlistedIds.has(String(s.id)));

  const addToWaitlist = useMutation({
    mutationFn: () => apiRequest(`/api/classes/${classId}/waitlist`, 'POST', { studentId: addStudentId }),
    onSuccess: (data: any) => {
      toast({ title: data.message ?? 'Added to waitlist' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/waitlist`] });
      setAddStudentId('');
      setShowAdd(false);
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const removeFromWaitlist = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/waitlist/${id}`, 'DELETE', {}),
    onSuccess: () => {
      toast({ title: 'Removed from waitlist' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/waitlist`] });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const enrolFromWaitlist = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/waitlist/${id}/enrol`, 'POST', {}),
    onSuccess: () => {
      toast({ title: 'Student enrolled from waitlist' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}/waitlist`] });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
    },
    onError: (e: any) => toast({ title: 'Could not enrol', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Waitlist ({waitlist.length})
        </h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl flex items-center gap-1.5">
          <UserPlus size={12} /> Add to waitlist
        </button>
      </div>

      {showAdd && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <select value={addStudentId} onChange={e => setAddStudentId(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select student…</option>
            {eligibleForWaitlist.map(s => (
              <option key={s.id} value={String(s.id)}>
                {`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || `Student #${s.id}`}
                {s.year_group_code ? ` (${s.year_group_code})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => addToWaitlist.mutate()}
            disabled={!addStudentId || addToWaitlist.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            {addToWaitlist.isPending ? 'Adding…' : 'Add'}
          </button>
          <button onClick={() => setShowAdd(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      )}

      <div className="p-5">
        {isLoading ? <p className="text-sm text-gray-500">Loading…</p> :
          waitlist.length === 0 ? (
            <p className="text-sm text-gray-500">No students on the waitlist. Add students using the button above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 pr-4">Pos</th>
                    <th className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 pr-4">Student</th>
                    <th className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 pr-4 hidden sm:table-cell">Year</th>
                    <th className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 pr-4 hidden sm:table-cell">Added</th>
                    <th className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {waitlist.map(w => (
                    <tr key={w.id}>
                      <td className="py-3 pr-4">
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                          {w.position}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-gray-900">{w.firstName} {w.lastName}</p>
                        {w.rollNumber && <p className="text-xs text-gray-500">{w.rollNumber}</p>}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-gray-600">{w.yearGroupCode ?? '—'}</span>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-gray-500 text-xs">{new Date(w.addedAt).toLocaleDateString('en-AU')}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { if (confirm(`Enrol ${w.firstName} ${w.lastName} from waitlist?`)) enrolFromWaitlist.mutate(w.id); }}
                            disabled={enrolFromWaitlist.isPending}
                            className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-xl disabled:opacity-60"
                          >
                            Enrol now
                          </button>
                          <button
                            onClick={() => { if (confirm(`Remove ${w.firstName} ${w.lastName} from waitlist?`)) removeFromWaitlist.mutate(w.id); }}
                            disabled={removeFromWaitlist.isPending}
                            className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-xl disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
