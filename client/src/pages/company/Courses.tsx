import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Trophy, Bell, LogOut, ArrowLeft, Plus, X, Save, Search, User,
  Target, Calendar, GraduationCap, ChevronRight, Filter,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface TutorRow { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; }

interface CourseTemplate {
  id: number;
  state_code: string;
  year_group_code: string;
  kind: 'foundations' | 'theory' | 'mock_tests';
  test_alignment: 'oc' | 'selective' | 'naplan_y3' | 'naplan_y5' | 'naplan_y7' | 'naplan_y9' | null;
  code: string;
  name: string;
  short_name: string;
  description?: string | null;
  sort_order: number;
}

interface CourseOffering {
  id: number;
  business_id: number;
  course_template_id: number;
  tutor_id: number;
  name: string;
  target_test_date: string | null;
  starts_on: string;
  ends_on: string;
  capacity: number | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  template?: { id: number; code: string; name: string; short_name: string; kind: string; test_alignment: string | null; year_group_code: string };
  tutor?: { id: number; user?: { name?: string; email?: string } };
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function alignmentLabel(a: string | null | undefined): string | null {
  if (!a) return null;
  if (a === 'oc') return 'OC';
  if (a === 'selective') return 'Selective';
  if (a.startsWith('naplan_')) return 'NAPLAN';
  return a;
}

const STATUS_TONE: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  active:    { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
  completed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Completed' },
  archived:  { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Archived' },
};

export default function CoursesPage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'archived'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: offerings = [], isLoading } = useQuery<CourseOffering[]>({
    queryKey: ['/api/course-offerings'],
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offerings.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return `${o.name} ${o.template?.short_name ?? ''} ${o.template?.name ?? ''} ${o.tutor?.user?.name ?? ''}`
        .toLowerCase().includes(q);
    });
  }, [offerings, search, statusFilter]);

  const counts = useMemo(() => ({
    total: offerings.length,
    active: offerings.filter(o => o.status === 'active').length,
    draft: offerings.filter(o => o.status === 'draft').length,
    completed: offerings.filter(o => o.status === 'completed').length,
  }), [offerings]);

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
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Test-prep courses</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiTile value={counts.total} label="Offerings" tone="indigo" />
          <KpiTile value={counts.active} label="Active" tone="emerald" />
          <KpiTile value={counts.draft} label="Draft" tone="amber" />
          <KpiTile value={counts.completed} label="Completed" tone="rose" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, template, or tutor"
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
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> New offering
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : offerings.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No offerings match the current filters.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(o => <OfferingRow key={o.id} o={o} />)}
          </ul>
        )}
      </main>

      {createOpen && companyId && (
        <CreateOfferingModal
          businessId={companyId}
          onClose={() => setCreateOpen(false)}
        />
      )}
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

function OfferingRow({ o }: { o: CourseOffering }) {
  const tone = STATUS_TONE[o.status] ?? STATUS_TONE.draft;
  const tutorName = o.tutor?.user?.name ?? '—';
  const alignment = alignmentLabel(o.template?.test_alignment);
  const initials = o.name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'O';
  return (
    <Link
      href={`/company/courses/${o.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-gray-900 truncate">{o.name}</p>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}>
              {tone.label}
            </span>
            {alignment && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                {alignment}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate flex items-center gap-2 flex-wrap mt-0.5">
            {o.template?.short_name && <span className="font-semibold text-gray-700">{o.template.short_name}</span>}
            <span className="flex items-center gap-1"><User size={11} /> {tutorName}</span>
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(o.starts_on)} → {formatDate(o.ends_on)}</span>
            {o.target_test_date && (
              <span className="flex items-center gap-1"><Target size={11} /> Test {formatDate(o.target_test_date)}</span>
            )}
            {o.capacity != null && <span>Cap {o.capacity}</span>}
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
        <Trophy size={22} />
      </div>
      <h2 className="text-lg font-black text-gray-900">No test-prep offerings yet</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        Pick a template — OC, Selective, NAPLAN, or general Foundations / WEMT / Mock Tests — and create your first cohort.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
      >
        <Plus size={14} /> Create your first offering
      </button>
    </div>
  );
}

function CreateOfferingModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Step 0: pick mode (template vs custom). Step 1: pick a template (template mode only). Step 2: fill cohort details.
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'oc' | 'selective' | 'naplan' | 'general'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tutorId, setTutorId] = useState<string>('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [testDate, setTestDate] = useState('');
  const [capacity, setCapacity] = useState('');

  const { data: templates = [] } = useQuery<CourseTemplate[]>({
    queryKey: ['/api/course-templates?state=NSW'],
  });
  const { data: tutors = [] } = useQuery<TutorRow[]>({
    queryKey: [`/api/companies/${businessId}/tutors`],
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (yearFilter && t.year_group_code !== yearFilter) return false;
      if (alignmentFilter === 'all') return true;
      if (alignmentFilter === 'general') return t.test_alignment === null;
      if (alignmentFilter === 'naplan') return t.test_alignment?.startsWith('naplan_') ?? false;
      return t.test_alignment === alignmentFilter;
    });
  }, [templates, yearFilter, alignmentFilter]);

  const pickTemplate = (t: CourseTemplate) => {
    setSelectedTemplate(t);
    setName(`${t.short_name} cohort`);
    setStep(2);
  };

  const m = useMutation({
    mutationFn: () =>
      apiRequest('/api/course-offerings', 'POST', {
        course_template_id: mode === 'template' ? selectedTemplate!.id : null,
        tutor_id: Number(tutorId),
        name,
        description: mode === 'custom' && description.trim() ? description.trim() : null,
        starts_on: startsOn,
        ends_on: endsOn,
        target_test_date: testDate || null,
        capacity: capacity ? Number(capacity) : null,
      }),
    onSuccess: () => {
      toast({ title: 'Offering created', description: 'Now enrol students and assign your first homework.' });
      qc.invalidateQueries({ queryKey: ['/api/course-offerings'] });
      onClose();
    },
    onError: (e: any) => {
      toast({ title: 'Could not create offering', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const valid =
    (mode === 'template' ? !!selectedTemplate : true) &&
    name.trim() && tutorId && startsOn && endsOn && startsOn <= endsOn;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" /> New course offering
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Step {step + 1} of {mode === 'template' ? 3 : 2}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {step === 0 && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <p className="text-sm text-gray-600">How would you like to set up this course?</p>
            <div className="space-y-3">
              <button
                onClick={() => { setMode('template'); setStep(1); }}
                className="w-full text-left rounded-2xl border-2 border-gray-200 hover:border-indigo-400 p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900">Use a platform template</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pre-built structure for OC, Selective, NAPLAN — including section names, durations, and weights from the published test format.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-2" />
                </div>
              </button>
              <button
                onClick={() => { setMode('custom'); setSelectedTemplate(null); setName(''); setStep(2); }}
                className="w-full text-left rounded-2xl border-2 border-gray-200 hover:border-indigo-400 p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Plus size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900">Create a custom course</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Author your own programme from scratch — any name, any year scope, any structure. No template needed.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-2" />
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <p className="text-sm text-gray-600">Pick the template your cohort will follow.</p>
            <div className="flex gap-2 flex-wrap">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All years</option>
                {['K', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12'].map(y => (
                  <option key={y} value={y}>{y === 'K' ? 'Kindergarten' : `Year ${y.slice(1)}`}</option>
                ))}
              </select>
              {(['all', 'oc', 'selective', 'naplan', 'general'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAlignmentFilter(a)}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-colors ${
                    alignmentFilter === a ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <ul className="space-y-2">
              {filteredTemplates.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => pickTemplate(t)}
                    className="w-full text-left rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {t.year_group_code}
                        </span>
                        <p className="font-black text-gray-900 truncate">{t.short_name}</p>
                        {alignmentLabel(t.test_alignment) && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            {alignmentLabel(t.test_alignment)}
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {t.kind === 'theory' ? 'WEMT' : t.kind.replace('_', ' ')}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{t.name}</p>
                  </button>
                </li>
              ))}
              {filteredTemplates.length === 0 && (
                <li className="text-sm text-gray-500 p-4 text-center">No templates match those filters.</li>
              )}
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-4 overflow-y-auto">
            {mode === 'template' && selectedTemplate && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Template</p>
                <p className="text-sm font-black text-indigo-900 mt-0.5">{selectedTemplate.name}</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Change template
                </button>
              </div>
            )}
            {mode === 'custom' && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Custom course</p>
                <p className="text-sm font-black text-amber-900 mt-0.5">No platform template</p>
                <button
                  onClick={() => setStep(0)}
                  className="mt-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  Use a template instead
                </button>
              </div>
            )}

            <Field label="Offering name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'custom' ? 'e.g. Saturday Selective Bootcamp' : ''}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </Field>

            {mode === 'custom' && (
              <Field label="Description (optional)" hint="One or two sentences students and parents will see.">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What does this course cover? Who's it for?"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            )}

            <Field label="Tutor" required>
              <select
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select…</option>
                {tutors.map(t => {
                  const nm = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email || `Tutor #${t.id}`;
                  return <option key={t.id} value={t.id}>{nm}</option>;
                })}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts on" required>
                <input
                  type="date"
                  value={startsOn}
                  onChange={(e) => setStartsOn(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
              <Field label="Ends on" required>
                <input
                  type="date"
                  value={endsOn}
                  onChange={(e) => setEndsOn(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Target test date" hint="When students sit the actual test">
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
              <Field label="Capacity (optional)">
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min={1}
                  placeholder="Leave blank for no cap"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          {step === 1 ? (
            <button onClick={() => setStep(0)} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              ← Back
            </button>
          ) : step === 2 ? (
            <button onClick={() => setStep(mode === 'template' ? 1 : 0)} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              ← Back
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={() => m.mutate()}
                disabled={!valid || m.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Save size={14} /> {m.isPending ? 'Creating…' : 'Create offering'}
              </button>
            )}
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
