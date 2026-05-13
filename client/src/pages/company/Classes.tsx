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

interface OfferingSummary {
  id: number;
  name: string;
  status: string;
  course_template_id: number | null;
  template?: { short_name?: string } | null;
}

function CreateClassModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [yearGroupId, setYearGroupId] = useState<string>('');
  const [tutorId, setTutorId] = useState<string>('');
  // courseOfferingId is either '' (standalone), a numeric id, or '__new__' (inline create custom)
  const [courseOfferingId, setCourseOfferingId] = useState<string>('');
  // Inline custom-course fields (only shown when courseOfferingId === '__new__')
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });
  const { data: yearGroups = [] } = useQuery<YearGroupRow[]>({ queryKey: ['/api/year-groups?state=NSW'] });
  const { data: tutors = [] } = useQuery<TutorRow[]>({
    queryKey: [`/api/companies/${businessId}/tutors`],
  });
  const { data: offerings = [] } = useQuery<OfferingSummary[]>({
    queryKey: ['/api/course-offerings'],
  });
  // Hide archived offerings from the dropdown — owners shouldn't link new classes to them.
  const availableOfferings = offerings.filter(o => o.status !== 'archived');
  // Pick the most recent active academic year for this business
  const { data: hierarchy } = useQuery<{ years?: AcademicYearRow[] } | AcademicYearRow[]>({
    queryKey: [`/api/companies/${businessId}/academic-hierarchy`],
  });
  const academicYears = useMemo<AcademicYearRow[]>(() => {
    if (!hierarchy) return [];
    if (Array.isArray(hierarchy)) return hierarchy;
    return hierarchy.years ?? [];
  }, [hierarchy]);
  const currentYear = academicYears[0]; // hierarchy is orderByDesc('year')

  const m = useMutation({
    mutationFn: async () => {
      let offeringIdToLink: number | null = null;

      // Inline-create the offering first if the owner chose "+ New custom course"
      if (courseOfferingId === '__new__') {
        if (!currentYear) throw new Error('No academic year available for the new course.');
        const newOffering = await apiRequest('/api/course-offerings', 'POST', {
          course_template_id: null,
          tutor_id: Number(tutorId),
          name: newCourseName.trim(),
          description: newCourseDescription.trim() || null,
          starts_on: currentYear.start_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          ends_on: currentYear.end_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          academic_year_id: currentYear.id,
          target_test_date: null,
          capacity: null,
        });
        offeringIdToLink = newOffering.id;
      } else if (courseOfferingId) {
        offeringIdToLink = Number(courseOfferingId);
      }

      return apiRequest('/api/classes', 'POST', {
        name,
        subject_id: Number(subjectId),
        year_group_id: Number(yearGroupId),
        tutor_id: Number(tutorId),
        course_offering_id: offeringIdToLink,
        academic_year_id: currentYear?.id,
        business_id: Number(businessId),
      });
    },
    onSuccess: () => {
      toast({ title: 'Class created' });
      qc.invalidateQueries({ queryKey: ['/api/classes'] });
      qc.invalidateQueries({ queryKey: ['/api/course-offerings'] }); // refresh in case we made a custom one
      onClose();
    },
    onError: (e: any) => {
      toast({ title: 'Could not create class', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const isCreatingNewCourse = courseOfferingId === '__new__';
  const valid =
    name.trim() && subjectId && yearGroupId && tutorId && currentYear &&
    (!isCreatingNewCourse || newCourseName.trim().length > 0);
  const blockers: string[] = [];
  if (!currentYear) blockers.push('No academic year set up yet — apply your state pack first.');
  if (tutors.length === 0) blockers.push('No tutors yet — invite at least one tutor.');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Create a class
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {blockers.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
              {blockers.map((b, i) => <p key={i}>• {b}</p>)}
            </div>
          )}

          <Field label="Class name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Year 7 Maths — Tuesdays"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select…</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Year group">
              <select
                value={yearGroupId}
                onChange={(e) => setYearGroupId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select…</option>
                {yearGroups.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tutor">
            <select
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              disabled={tutors.length === 0}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select…</option>
              {tutors.map(t => {
                const nm = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email || `Tutor #${t.id}`;
                return <option key={t.id} value={t.id}>{nm}</option>;
              })}
            </select>
          </Field>

          <Field
            label="Course (optional)"
            hint="Link to an existing course offering, create a new custom one, or leave blank for a standalone class."
          >
            <select
              value={courseOfferingId}
              onChange={(e) => setCourseOfferingId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Standalone class (no course)</option>
              {availableOfferings.length > 0 && (
                <optgroup label="Existing courses">
                  {availableOfferings.map(o => {
                    const tag = o.template?.short_name ?? 'Custom';
                    return (
                      <option key={o.id} value={o.id}>
                        {o.name} — {tag}
                      </option>
                    );
                  })}
                </optgroup>
              )}
              <option value="__new__">+ Create new custom course…</option>
            </select>
          </Field>

          {isCreatingNewCourse && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">New custom course</p>
              <Field label="Course name" hint="e.g. Saturday Selective Bootcamp, Y6 Writing Intensive.">
                <input
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="What should this course be called?"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
              </Field>
              <Field label="Description (optional)">
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  rows={2}
                  placeholder="One or two sentences about what this course covers."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
              </Field>
              <p className="text-xs text-amber-700">
                The course runs across academic year <span className="font-semibold">{currentYear?.year}</span>. You can edit dates and capacity later on the course detail page.
              </p>
            </div>
          )}

          {currentYear && (
            <p className="text-xs text-gray-500">
              Will be added to academic year <span className="font-semibold text-gray-700">{currentYear.year}</span>.
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
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
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
