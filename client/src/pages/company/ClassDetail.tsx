import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  BookOpen, Bell, LogOut, ArrowLeft, UserPlus, Trash2, X, Save,
  User, Users, GraduationCap, Calendar, CalendarDays, School,
  Pencil, Play, CheckCircle2, Archive,
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

export default function ClassDetailPage() {
  const [, params] = useRoute('/company/classes/:id');
  const classId = params?.id;
  const { logoutMutation } = useAuth();
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
                <Stat icon={<School size={14} />} label="Subject" value={cls.subject?.name ?? '—'} />
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RosterSection
                  classId={cls.id}
                  students={cls.students ?? []}
                  capacity={cls.capacity}
                  atCap={atCap}
                  onEnrolClick={() => setEnrolOpen(true)}
                />
              </div>
              <div>
                <LifecycleSection classId={cls.id} status={cls.status} />
              </div>
            </div>
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
    </div>
  );
}

/* ---------- Lifecycle ---------- */

function LifecycleSection({ classId, status }: { classId: number; status: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const transition = useMutation({
    mutationFn: (next: string) => apiRequest(`/api/classes/${classId}`, 'PATCH', { status: next }),
    onSuccess: (_, next) => {
      toast({ title: `Status changed to ${next}` });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
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

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Lifecycle</h3>
      <p className="text-xs text-gray-500 mb-3">
        Current status: <span className="font-bold text-gray-700 capitalize">{status}</span>
      </p>
      <div className="space-y-2">
        {transitions.map(t => (
          <button
            key={t.to}
            onClick={() => transition.mutate(t.to)}
            disabled={transition.isPending}
            className={`w-full ${t.tone} text-white text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60`}
          >
            {t.icon} {t.label}
          </button>
        ))}
        {status !== 'archived' && (
          <button
            onClick={() => {
              if (confirm('Archive this class? Students will keep their historical record.')) {
                transition.mutate('archived');
              }
            }}
            disabled={transition.isPending}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Archive size={12} /> Archive class
          </button>
        )}
        {status === 'archived' && (
          <p className="text-xs text-gray-500">Archived classes are read-only.</p>
        )}
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
  const [pickedTermIds, setPickedTermIds] = useState<Set<number>>(new Set((cls.terms ?? []).map(t => t.id)));
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
    return (y?.terms ?? []) as { id: number; name: string; start_date: string; end_date: string }[];
  }, [allYears, cls.academic_year_id]);

  const toggleTerm = (id: number) => {
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
        course_id: courseId ? Number(courseId) : null,
        tutor_id: tutorId ? Number(tutorId) : null,
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
  classId, students, capacity, atCap, onEnrolClick,
}: {
  classId: number;
  students: StudentRow[];
  capacity: number | null;
  atCap: boolean;
  onEnrolClick: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const unenrol = useMutation({
    mutationFn: (studentId: number) =>
      apiRequest(`/api/classes/${classId}/students/${studentId}`, 'DELETE', {}),
    onSuccess: () => {
      toast({ title: 'Removed from class' });
      qc.invalidateQueries({ queryKey: [`/api/classes/${classId}`] });
    },
    onError: (e: any) => toast({ title: 'Failed to remove', description: e.message, variant: 'destructive' }),
  });

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Roster ({students.length}{capacity != null ? ` / ${capacity}` : ''})
        </h3>
        <button
          onClick={onEnrolClick}
          disabled={atCap}
          title={atCap ? 'Capacity reached' : undefined}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
        >
          <UserPlus size={12} /> {atCap ? 'At capacity' : 'Enrol students'}
        </button>
      </div>
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
        await apiRequest(`/api/classes/${classId}/enrol`, 'POST', { student_id: studentId });
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
