import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  BookOpen, Bell, LogOut, ArrowLeft, Plus, X, Save, Search,
  User, GraduationCap, CalendarDays,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface SubjectRow { id: number; code: string; name: string; state_code?: string; }
interface YearGroupRow { id: number; code: string; label: string; state_code: string; order: number; }
interface TutorRow { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; }
interface AcademicYearRow {
  id: number;
  year: number;
  state_code: string;
  start_date?: string;
  end_date?: string;
}
interface ClassRow {
  id: number;
  name: string;
  business_id: number;
  tutor_id: number | null;
  academic_year_id: number;
  year_group_id: number;
  subject_id: number;
  subject?: { id: number; name: string; code?: string };
  yearGroup?: { id: number; label: string; code: string };
  tutor?: { id: number; user?: { name?: string; firstName?: string; lastName?: string } };
  academicYear?: { id: number; year: number };
}

export default function ClassesPage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: classes = [], isLoading } = useQuery<ClassRow[]>({
    queryKey: ['/api/classes'],
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(c =>
      `${c.name} ${c.subject?.name ?? ''} ${c.yearGroup?.label ?? ''} ${c.tutor?.user?.name ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [classes, search]);

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
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Classes</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
                <ArrowLeft size={12} /> Dashboard
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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, subject, year, or tutor"
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> Create class
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : classes.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No classes match "{search}".
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(c => <ClassRowItem key={c.id} c={c} />)}
          </ul>
        )}
      </main>

      {createOpen && companyId && (
        <CreateClassModal
          businessId={companyId}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function ClassRowItem({ c }: { c: ClassRow }) {
  const tutorName = c.tutor?.user?.name
    || `${c.tutor?.user?.firstName ?? ''} ${c.tutor?.user?.lastName ?? ''}`.trim()
    || (c.tutor_id ? 'Tutor' : '—');
  const initials = c.name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'C';
  return (
    <li className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate">{c.name}</p>
        <div className="text-xs text-gray-500 truncate flex items-center gap-2 flex-wrap mt-0.5">
          {c.subject?.name && (
            <span className="font-semibold text-gray-700">{c.subject.name}</span>
          )}
          {c.yearGroup?.label && (
            <span className="flex items-center gap-1">
              <GraduationCap size={11} /> {c.yearGroup.label}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User size={11} /> {tutorName}
          </span>
          {c.academicYear?.year && (
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> {c.academicYear.year}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
        <BookOpen size={22} />
      </div>
      <h2 className="text-lg font-black text-gray-900">No classes yet</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        Create a class to group students by subject and year level. You'll assign a tutor and enrol students.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
      >
        <Plus size={14} /> Create your first class
      </button>
    </div>
  );
}

interface CourseSummary {
  id: number;
  name: string;
}
interface TermRow {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  academic_year_id: number;
}
interface YearWithTerms extends AcademicYearRow {
  terms?: TermRow[];
}

const dateOnly = (s: string) => s.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? s;

function CreateClassModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Course parent
  const [courseId, setCourseId] = useState<string>('');           // '' | numeric id | '__new__'
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  // About this class
  const [yearGroupId, setYearGroupId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [level, setLevel] = useState<string>('');

  // When
  const [pickedTermIds, setPickedTermIds] = useState<Set<number>>(new Set());

  // Who
  const [tutorId, setTutorId] = useState<string>('');

  // Optional details
  const [capacity, setCapacity] = useState<string>('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });
  const { data: yearGroups = [] } = useQuery<YearGroupRow[]>({ queryKey: ['/api/year-groups?state=NSW'] });
  const { data: tutors = [] } = useQuery<TutorRow[]>({
    queryKey: [`/api/companies/${businessId}/tutors`],
  });
  const { data: courses = [] } = useQuery<CourseSummary[]>({ queryKey: ['/api/courses'] });

  const { data: hierarchy } = useQuery<{ years?: YearWithTerms[] } | YearWithTerms[]>({
    queryKey: [`/api/companies/${businessId}/academic-hierarchy`],
  });
  const academicYears = useMemo<YearWithTerms[]>(() => {
    if (!hierarchy) return [];
    if (Array.isArray(hierarchy)) return hierarchy;
    return hierarchy.years ?? [];
  }, [hierarchy]);
  const currentYear = academicYears[0];
  const terms = currentYear?.terms ?? [];

  // Auto-suggest class name from its parts unless the owner has typed one.
  const suggestedName = useMemo(() => {
    const courseLabel = courseId && courseId !== '__new__'
      ? courses.find(c => String(c.id) === courseId)?.name
      : courseId === '__new__' ? newCourseName.trim() : '';
    const yg = yearGroups.find(y => String(y.id) === yearGroupId)?.label;
    const sj = subjects.find(s => String(s.id) === subjectId)?.name;
    return [courseLabel, yg, sj, level].filter(Boolean).join(' · ');
  }, [courseId, newCourseName, yearGroupId, subjectId, level, courses, yearGroups, subjects]);
  const effectiveName = nameTouched ? name : suggestedName;

  const toggleTerm = (id: number) => {
    setPickedTermIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const m = useMutation({
    mutationFn: async () => {
      let parentCourseId: number | null = null;
      if (courseId === '__new__') {
        const c = await apiRequest('/api/courses', 'POST', {
          name: newCourseName.trim(),
          description: newCourseDescription.trim() || null,
        });
        parentCourseId = c.id;
      } else if (courseId) {
        parentCourseId = Number(courseId);
      }

      return apiRequest('/api/classes', 'POST', {
        name: effectiveName.trim(),
        course_id: parentCourseId,
        subject_id: Number(subjectId),
        year_group_id: Number(yearGroupId),
        tutor_id: tutorId ? Number(tutorId) : null,
        academic_year_id: currentYear?.id,
        business_id: Number(businessId),
        term_ids: Array.from(pickedTermIds),
        capacity: capacity ? Number(capacity) : null,
        description: description.trim() || null,
        level: level.trim() || null,
        status: 'draft',
      });
    },
    onSuccess: () => {
      toast({ title: 'Class created' });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (e: any) => {
      toast({ title: 'Could not create class', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const isCreatingNewCourse = courseId === '__new__';
  const valid =
    yearGroupId && subjectId && pickedTermIds.size > 0 && currentYear &&
    (!isCreatingNewCourse || newCourseName.trim().length >= 2) &&
    effectiveName.trim().length > 0;
  const blockers: string[] = [];
  if (!currentYear) blockers.push('No academic year set up yet — apply your state pack at /company/academic first.');

  // List of what's still missing — surfaces under the disabled Save button.
  const missing: string[] = [];
  if (!yearGroupId) missing.push('Year group');
  if (!subjectId) missing.push('Subject');
  if (pickedTermIds.size === 0) missing.push('at least one Term');
  if (isCreatingNewCourse && newCourseName.trim().length < 2) missing.push('new course name');
  if (!effectiveName.trim()) missing.push('Class name');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Create a class
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto">
          {blockers.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
              {blockers.map((b, i) => <p key={i}>• {b}</p>)}
            </div>
          )}

          {/* Course (catalogue parent) */}
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Course</h4>
            <Field label="Catalogue parent" hint="Pick an existing course or create a new one. Leave blank for a standalone class.">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              >
                <option value="">Standalone class (no course)</option>
                {courses.length > 0 && (
                  <optgroup label="Existing courses">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                )}
                <option value="__new__">+ Create new course…</option>
              </select>
            </Field>
            {isCreatingNewCourse && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-3">
                <Field label="New course name" hint="e.g. Foundation, OC Test Prep, Saturday Selective Bootcamp.">
                  <input
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="What's this course called?"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </Field>
                <Field label="Description (optional)">
                  <textarea
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </Field>
              </div>
            )}
          </section>

          {/* About this class */}
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">About this class</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year group" required>
                <select
                  value={yearGroupId}
                  onChange={(e) => setYearGroupId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select…</option>
                  {yearGroups.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
                </select>
              </Field>
              <Field label="Subject" required>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select…</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Difficulty (optional)" hint="Beginner / Intermediate / Advanced — or your own label.">
                <input
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Beginner, Intermediate, Advanced, …"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
          </section>

          {/* When */}
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">When</h4>
            <Field label="Terms" required hint="Pick which term(s) this class runs in. Dates come from the term boundaries.">
              {terms.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  No terms available — apply your state pack on /company/academic first.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {terms.map(t => {
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
                        <p className="text-[10px] text-gray-500 mt-1">
                          {dateOnly(t.start_date)} → {dateOnly(t.end_date)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>
          </section>

          {/* Who */}
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Who</h4>
            <Field label="Tutor (optional)" hint="Leave blank if you haven't decided yet — you can assign one later from the class detail page.">
              <select
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                disabled={tutors.length === 0}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Not assigned yet</option>
                {tutors.map(t => {
                  const nm = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email || `Tutor #${t.id}`;
                  return <option key={t.id} value={t.id}>{nm}</option>;
                })}
              </select>
            </Field>
          </section>

          {/* Optional */}
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Optional details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacity">
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min={1}
                  placeholder="No cap"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
              <Field label="Class name" hint="Auto-suggested. Override if you want a different label.">
                <input
                  value={effectiveName}
                  onChange={(e) => { setNameTouched(true); setName(e.target.value); }}
                  placeholder={suggestedName || 'Class name'}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Anything students or parents should know"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
          </section>

          {currentYear && (
            <p className="text-xs text-gray-500">
              Class will live under academic year <span className="font-semibold text-gray-700">{currentYear.year}</span>.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-500 min-w-0 truncate">
            {missing.length > 0
              ? <>Still need: <span className="font-semibold text-amber-700">{missing.join(', ')}</span></>
              : <span className="text-emerald-700 font-semibold">Ready to save</span>}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              Cancel
            </button>
            <button
              onClick={() => m.mutate()}
              disabled={!valid || m.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Save size={14} /> {m.isPending ? 'Creating…' : 'Create class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
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
