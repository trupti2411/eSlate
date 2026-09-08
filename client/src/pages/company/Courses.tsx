import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, LogOut, ArrowLeft, Plus, X, Save, Search, User, Target, Calendar, GraduationCap, ChevronRight, Filter, Sparkles } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

interface CourseTemplateOption {
  key: string;
  label: string;
  name: string;
  description: string;
  tone: 'indigo' | 'amber' | 'emerald' | 'rose' | 'violet' | 'sky';
  badge: string;
  subjectNames: string[];
}

const COURSE_TEMPLATES: CourseTemplateOption[] = [
  {
    key: 'oc',
    label: 'OC Prep',
    name: 'OC Test Preparation',
    description: 'Opportunity Class placement test preparation covering English, Mathematics, and Thinking Skills for Year 3–4 students.',
    tone: 'indigo',
    badge: 'OC',
    subjectNames: ['English', 'Mathematics', 'Thinking Skills'],
  },
  {
    key: 'selective',
    label: 'Selective',
    name: 'Selective School Preparation',
    description: 'Selective Entry High School test preparation covering Reading, Mathematics, Thinking Skills, and Writing for Year 5–6 students.',
    tone: 'violet',
    badge: 'SEL',
    subjectNames: ['Mathematics', 'Reading', 'Thinking Skills', 'Writing'],
  },
  {
    key: 'naplan',
    label: 'NAPLAN',
    name: 'NAPLAN Preparation',
    description: 'National Assessment Program preparation covering Literacy (Reading, Writing, Language Conventions) and Numeracy.',
    tone: 'sky',
    badge: 'NAP',
    subjectNames: ['English', 'Mathematics', 'Reading', 'Writing'],
  },
  {
    key: 'foundation',
    label: 'Foundation',
    name: 'Foundation Program',
    description: 'Core foundations in literacy and numeracy for primary school students. Builds confidence and closes learning gaps.',
    tone: 'emerald',
    badge: 'FDN',
    subjectNames: ['English', 'Mathematics', 'Reading', 'Writing'],
  },
  {
    key: 'wemt',
    label: 'WEMT',
    name: 'WEMT Program',
    description: 'Writing, English, Mathematics, and Thinking Skills comprehensive program for students preparing for competitive entry exams.',
    tone: 'amber',
    badge: 'WEMT',
    subjectNames: ['English', 'Mathematics', 'Thinking Skills', 'Writing'],
  },
  {
    key: 'mock',
    label: 'Mock Tests',
    name: 'Mock Test Series',
    description: 'Simulated exam-condition practice tests with timed assessments, performance tracking, and exam technique coaching.',
    tone: 'rose',
    badge: 'MOCK',
    subjectNames: ['English', 'Mathematics', 'Reading', 'Science', 'Thinking Skills', 'Writing'],
  },
];

interface AdminProfile { userId: string; companyId: string; companyName: string; }

interface Course {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'archived' | string;
  subjectIds: number[];
}

interface YearGroupRow { id: number; code: string; label: string; }
interface SubjectRow { id: number; code: string; name: string; }

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

export default function CoursesPage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [createCourseOpen, setCreateCourseOpen] = useState(() => new URLSearchParams(window.location.search).get('create') === '1');
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyName = adminProfile?.companyName;

  const { data: courses = [], isLoading, isError: coursesError } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(c => {
      if (statusFilter !== 'all' && (c.status ?? 'active') !== statusFilter) return false;
      if (!q) return true;
      return `${c.name} ${c.description ?? ''}`.toLowerCase().includes(q);
    });
  }, [courses, search, statusFilter]);

  const counts = useMemo(() => ({
    total: courses.length,
    active: courses.filter(c => (c.status ?? 'active') === 'active').length,
    archived: courses.filter(c => c.status === 'archived').length,
  }), [courses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Trophy size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Courses</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
                <ArrowLeft size={12} /> Dashboard
              </Link>
              <NotificationBell />
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
        <div className="grid grid-cols-3 gap-3">
          <KpiTile value={counts.total} label="Total courses" tone="indigo" />
          <KpiTile value={counts.active} label="Active" tone="emerald" />
          <KpiTile value={counts.archived} label="Archived" tone="rose" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name or description"
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white rounded-xl border border-gray-200 pl-9 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All statuses</option>
            </select>
          </div>
          <button
            onClick={() => setCreateCourseOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> New course
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : coursesError ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-rose-600">
            Could not load courses. Refresh the page or contact support if the problem persists.
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No courses yet. Click <span className="font-semibold">+ New course</span> above to add your first course (e.g. "OC Test Preparation", "NAPLAN Prep").
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No courses match the current filters.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(c => (
              <li key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition-colors">
                <Link href={`/company/courses/${c.id}`} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 truncate">{c.name}</p>
                      {c.status === 'archived' && (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Archived</span>
                      )}
                    </div>
                    {c.description && <p className="text-xs text-gray-400 truncate">{c.description}</p>}
                  </div>
                </Link>
                <button
                  onClick={() => setEditCourse(c)}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {createCourseOpen && (
        <CreateCourseModal onClose={() => setCreateCourseOpen(false)} />
      )}
      {editCourse && (
        <EditCourseModal course={editCourse} onClose={() => setEditCourse(null)} />
      )}
    </div>
  );
}

const TEMPLATE_TONE_MAP: Record<CourseTemplateOption['tone'], { ring: string; bg: string; text: string; badge: string; selected: string }> = {
  indigo: { ring: 'ring-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', selected: 'border-indigo-400 bg-indigo-50' },
  violet: { ring: 'ring-violet-400', bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', selected: 'border-violet-400 bg-violet-50' },
  sky:    { ring: 'ring-sky-400',    bg: 'bg-sky-50',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-700',    selected: 'border-sky-400 bg-sky-50' },
  emerald:{ ring: 'ring-emerald-400',bg: 'bg-emerald-50',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-700', selected: 'border-emerald-400 bg-emerald-50' },
  amber:  { ring: 'ring-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  selected: 'border-amber-400 bg-amber-50' },
  rose:   { ring: 'ring-rose-400',   bg: 'bg-rose-50',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-700',   selected: 'border-rose-400 bg-rose-50' },
};

function EditCourseModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description ?? '');
  const [pickedSubjectIds, setPickedSubjectIds] = useState<Set<number>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });
  const { data: courseDetail } = useQuery<any>({
    queryKey: [`/api/courses/${course.id}`],
    enabled: !!course.id,
  });

  // Pre-select subjects when courseDetail loads
  useEffect(() => {
    if (courseDetail?.subject_ids?.length) {
      setPickedSubjectIds(new Set(courseDetail.subject_ids as number[]));
    }
  }, [courseDetail]);

  const toggleSubject = (id: number) => {
    setPickedSubjectIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/courses/${course.id}`, 'PATCH', {
      name: name.trim(),
      description: description.trim() || null,
      subject_ids: Array.from(pickedSubjectIds),
    }),
    onSuccess: () => {
      toast({ title: 'Course updated' });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Could not update', description: e.message, variant: 'destructive' }),
  });

  const valid = name.trim().length > 0 && pickedSubjectIds.size > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black">Edit course</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Course name <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={150}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {submitAttempted && !name.trim() && <p className="text-xs text-rose-600 mt-1">Course name is required.</p>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subjects <span className="text-rose-500">*</span></label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {subjects.map(s => {
                const isOn = pickedSubjectIds.has(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                    className={`text-left rounded-xl border px-3 py-2 text-sm transition-colors ${isOn ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    <span className={`inline-flex w-4 h-4 rounded mr-2 items-center justify-center flex-shrink-0 ${isOn ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`}>
                      {isOn && <span className="text-[10px]">✓</span>}
                    </span>
                    {s.name}
                  </button>
                );
              })}
            </div>
            {submitAttempted && pickedSubjectIds.size === 0 && <p className="text-xs text-rose-600 mt-1">Select at least one subject.</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">Cancel</button>
          <button
            onClick={() => { setSubmitAttempted(true); if (valid) saveMutation.mutate(); }}
            disabled={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCourseModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [yearGroupCode, setYearGroupCode] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<number>>(new Set());

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });
  const { data: yearGroups = [] } = useQuery<YearGroupRow[]>({ queryKey: ['/api/year-groups?state=NSW'] });

  const applyTemplate = (tpl: CourseTemplateOption) => {
    if (selectedTemplateKey === tpl.key) {
      setSelectedTemplateKey(null);
      setName('');
      setDescription('');
      setSelectedSubjectIds(new Set());
    } else {
      setSelectedTemplateKey(tpl.key);
      setName(tpl.name);
      setDescription(tpl.description);
      const ids = new Set(
        subjects
          .filter(s => tpl.subjectNames.includes(s.name))
          .map(s => s.id)
      );
      setSelectedSubjectIds(ids);
    }
  };

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const m = useMutation({
    mutationFn: () =>
      apiRequest('/api/courses', 'POST', {
        name: name.trim(),
        description: description.trim() || null,
        year_group_code: yearGroupCode || null,
        subject_ids: Array.from(selectedSubjectIds),
      }),
    onSuccess: () => {
      toast({ title: 'Course created' });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (e: any) =>
      toast({ title: 'Could not create course', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const valid = name.trim().length >= 2 && selectedSubjectIds.size > 0;

  const missingItems: string[] = [];
  if (name.trim().length < 2) missingItems.push('course name');
  if (selectedSubjectIds.size === 0) missingItems.push('at least one subject');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> New course
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Template picker */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-indigo-500" /> Start from a template
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COURSE_TEMPLATES.map(tpl => {
                const tone = TEMPLATE_TONE_MAP[tpl.tone];
                const isSelected = selectedTemplateKey === tpl.key;
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    title={tpl.description}
                    className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                      isSelected
                        ? `${tone.selected} border-2`
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded-md mb-1.5 ${tone.badge}`}>
                      {tpl.badge}
                    </span>
                    <p className={`text-xs font-bold leading-tight ${isSelected ? tone.text : 'text-gray-700'}`}>
                      {tpl.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                      {tpl.subjectNames.slice(0, 2).join(', ')}{tpl.subjectNames.length > 2 ? ` +${tpl.subjectNames.length - 2}` : ''}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Pick a template to pre-fill name, description, and subjects — edit freely before saving.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <Field label="Course name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OC Test Preparation, Foundation Program"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </Field>

            <Field label="Year group" hint="When selected in Create Class, this year will be auto-filled.">
              <select
                value={yearGroupCode}
                onChange={(e) => setYearGroupCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any year (not year-specific)</option>
                {yearGroups.map(yg => (
                  <option key={yg.code} value={yg.code}>{yg.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Description" hint="What this course covers — students and parents will see this.">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what students will learn and who this course is for…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>

            <Field label="Subjects this course covers" required hint="Classes in this course can only pick from this set.">
              <div className="flex flex-wrap gap-2 mt-1">
                {subjects.map(s => {
                  const checked = selectedSubjectIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                        checked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-400">
            {missingItems.length > 0
              ? `Still need: ${missingItems.join(', ')}`
              : <span className="text-emerald-600 font-semibold">Ready to create</span>
            }
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              Cancel
            </button>
            <button
              onClick={() => m.mutate()}
              disabled={!valid || m.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Save size={14} /> {m.isPending ? 'Creating…' : 'Create course'}
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

/* ---------- subcomponents ---------- */

const TONE = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700' },
} as const;

function KpiTile({ value, label, tone }: { value: number; label: string; tone: keyof typeof TONE }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-2xl border ${t.bg} ${t.border} p-4 text-center`}>
      <p className={`text-2xl sm:text-3xl font-black ${t.text}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${t.text}`}>{label}</p>
    </div>
  );
}
