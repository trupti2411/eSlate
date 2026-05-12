import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Trophy, Bell, LogOut, ArrowLeft, UserPlus, Trash2, X, Save,
  Target, Calendar, User, BookOpen, Play, CheckCircle2, Archive, ChevronDown,
} from 'lucide-react';

interface Enrolment {
  id: number;
  course_offering_id: number;
  student_id: number;
  status: 'active' | 'withdrawn' | 'completed';
  enrolled_at: string;
  student?: { id: number; first_name?: string; last_name?: string; year_group_code?: string };
}
interface Template {
  id: number; code: string; name: string; short_name: string;
  kind: 'foundations' | 'theory' | 'mock_tests';
  test_alignment: string | null;
  year_group_code: string;
  components?: Component[];
}
interface Component {
  id: number; code: string; name: string;
  weight_pct?: number | null; duration_minutes?: number | null;
  question_count?: number | null; question_format: string;
}
interface Offering {
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
  notes?: string | null;
  template?: Template;
  tutor?: { id: number; user?: { name?: string; email?: string } };
  enrolments?: Enrolment[];
  academicYear?: { id: number; year: number };
}
interface StudentRow {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  year_group_code?: string | null;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function daysUntil(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return null;
  const t = new Date(m[1] + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  return Math.round((t - today) / 86400000);
}

export default function CourseOfferingDetail() {
  const [, params] = useRoute('/company/courses/:id');
  const offeringId = params?.id;
  const { logoutMutation } = useAuth();
  const [enrolOpen, setEnrolOpen] = useState(false);

  const { data: offering, isLoading } = useQuery<Offering>({
    queryKey: [`/api/course-offerings/${offeringId}`],
    enabled: !!offeringId,
  });

  const countdown = daysUntil(offering?.target_test_date);
  const activeEnrolments = (offering?.enrolments ?? []).filter(e => e.status === 'active');

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
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Course offering</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{offering?.name ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/company/courses" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
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
        {isLoading || !offering ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : (
          <>
            <OverviewCard offering={offering} countdown={countdown} activeCount={activeEnrolments.length} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <EnrolmentSection
                  offering={offering}
                  activeEnrolments={activeEnrolments}
                  onEnrolClick={() => setEnrolOpen(true)}
                />
                <ComponentsSection template={offering.template} />
              </div>
              <div className="space-y-6">
                <StatusSection offering={offering} />
              </div>
            </div>
          </>
        )}
      </main>

      {enrolOpen && offering && (
        <EnrolmentModal
          offering={offering}
          alreadyEnrolledIds={new Set(activeEnrolments.map(e => e.student_id))}
          onClose={() => setEnrolOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function OverviewCard({ offering, countdown, activeCount }: { offering: Offering; countdown: number | null; activeCount: number }) {
  const tone = STATUS_TONE[offering.status] ?? STATUS_TONE.draft;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
              {offering.template?.short_name ?? 'Template'} · {offering.template?.year_group_code}
            </p>
            <h2 className="text-2xl font-black mt-0.5 truncate">{offering.name}</h2>
            <p className="text-sm text-indigo-100 mt-0.5">{offering.template?.name}</p>
          </div>
        </div>
        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${tone.lightBg} ${tone.text}`}>
          {tone.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={<Calendar size={14} />} label="Starts" value={formatDate(offering.starts_on)} />
        <Stat icon={<Calendar size={14} />} label="Ends" value={formatDate(offering.ends_on)} />
        <Stat
          icon={<Target size={14} />}
          label="Test date"
          value={offering.target_test_date
            ? `${formatDate(offering.target_test_date)}${countdown !== null ? ` (${countdown}d)` : ''}`
            : 'Not set'}
        />
        <Stat icon={<User size={14} />} label="Enrolled" value={`${activeCount}${offering.capacity != null ? ` / ${offering.capacity}` : ''}`} />
      </div>
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

const STATUS_TONE: Record<string, { lightBg: string; text: string; label: string }> = {
  draft:     { lightBg: 'bg-white/15', text: 'text-white', label: 'Draft' },
  active:    { lightBg: 'bg-emerald-200', text: 'text-emerald-900', label: 'Active' },
  completed: { lightBg: 'bg-indigo-200', text: 'text-indigo-900', label: 'Completed' },
  archived:  { lightBg: 'bg-rose-200', text: 'text-rose-900', label: 'Archived' },
};

function EnrolmentSection({
  offering, activeEnrolments, onEnrolClick,
}: { offering: Offering; activeEnrolments: Enrolment[]; onEnrolClick: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const atCap = offering.capacity != null && activeEnrolments.length >= offering.capacity;

  const withdraw = useMutation({
    mutationFn: (enrolmentId: number) =>
      apiRequest(`/api/course-offerings/${offering.id}/enrolments/${enrolmentId}`, 'DELETE', {}),
    onSuccess: () => {
      toast({ title: 'Withdrew' });
      qc.invalidateQueries({ queryKey: [`/api/course-offerings/${offering.id}`] });
    },
    onError: (e: any) => toast({ title: 'Failed to withdraw', description: e.message, variant: 'destructive' }),
  });

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Enrolment ({activeEnrolments.length}{offering.capacity != null ? ` / ${offering.capacity}` : ''})
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
        {activeEnrolments.length === 0 ? (
          <p className="text-sm text-gray-500">No students enrolled yet. Click "Enrol students" to add from your roster.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activeEnrolments.map(e => {
              const name = `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`.trim() || `Student #${e.student_id}`;
              const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'S';
              return (
                <li key={e.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500">
                      {e.student?.year_group_code && <span className="font-semibold">{e.student.year_group_code}</span>}
                      {e.enrolled_at && <span> · enrolled {formatDate(e.enrolled_at)}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => withdraw.mutate(e.id)}
                    disabled={withdraw.isPending}
                    className="text-gray-400 hover:text-rose-600 transition-colors flex-shrink-0"
                    aria-label="Withdraw"
                    title="Withdraw"
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

function ComponentsSection({ template }: { template?: Template }) {
  const components = template?.components ?? [];
  if (components.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
        Test components ({components.length})
      </h3>
      <ul className="space-y-2">
        {components.map(c => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">
                {c.duration_minutes ? `${c.duration_minutes} min` : null}
                {c.question_count ? ` · ${c.question_count} Q` : null}
                {c.weight_pct ? ` · ${c.weight_pct}%` : null}
                {c.question_format && <span className="ml-1 text-gray-400">({c.question_format.replace(/_/g, ' ')})</span>}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mt-3">
        Tag PDF assignments with a component to track what each piece of homework is training.
      </p>
    </section>
  );
}

function StatusSection({ offering }: { offering: Offering }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const transition = useMutation({
    mutationFn: (status: string) =>
      apiRequest(`/api/course-offerings/${offering.id}`, 'PATCH', { status }),
    onSuccess: (_, status) => {
      toast({ title: `Status changed to ${status}` });
      qc.invalidateQueries({ queryKey: [`/api/course-offerings/${offering.id}`] });
      qc.invalidateQueries({ queryKey: ['/api/course-offerings'] });
      setOpen(false);
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const archive = useMutation({
    mutationFn: () => apiRequest(`/api/course-offerings/${offering.id}`, 'DELETE', {}),
    onSuccess: () => {
      toast({ title: 'Archived' });
      qc.invalidateQueries({ queryKey: [`/api/course-offerings/${offering.id}`] });
      qc.invalidateQueries({ queryKey: ['/api/course-offerings'] });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const transitions: { to: string; label: string; icon: React.ReactNode; tone: string }[] = [];
  if (offering.status === 'draft') {
    transitions.push({ to: 'active', label: 'Activate', icon: <Play size={12} />, tone: 'bg-emerald-600 hover:bg-emerald-700' });
  }
  if (offering.status === 'active') {
    transitions.push({ to: 'completed', label: 'Mark completed', icon: <CheckCircle2 size={12} />, tone: 'bg-indigo-600 hover:bg-indigo-700' });
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Lifecycle</h3>
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
        {offering.status !== 'archived' && (
          <button
            onClick={() => archive.mutate()}
            disabled={archive.isPending}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Archive size={12} /> Archive offering
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Draft → Active makes assignments visible to students. Completed locks new assignments but keeps history accessible.
      </p>
    </section>
  );
}

function EnrolmentModal({
  offering, alreadyEnrolledIds, onClose,
}: { offering: Offering; alreadyEnrolledIds: Set<number>; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  const { data: allStudents = [] } = useQuery<StudentRow[]>({
    queryKey: [`/api/companies/${offering.business_id}/students`],
  });

  const eligible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter(s => !alreadyEnrolledIds.has(s.id))
      .filter(s => {
        if (!q) return true;
        return `${s.first_name ?? ''} ${s.last_name ?? ''} ${s.year_group_code ?? ''}`.toLowerCase().includes(q);
      });
  }, [allStudents, alreadyEnrolledIds, search]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/course-offerings/${offering.id}/enrolments`, 'POST', {
        student_ids: Array.from(selected),
      }),
    onSuccess: () => {
      toast({ title: `Enrolled ${selected.size} student${selected.size === 1 ? '' : 's'}` });
      qc.invalidateQueries({ queryKey: [`/api/course-offerings/${offering.id}`] });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Could not enrol', description: e.message ?? 'Try again.', variant: 'destructive' }),
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
              {allStudents.length === 0 ? 'No students yet — add some on the Students page first.' : 'All matching students are already enrolled.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {eligible.map(s => {
                const name = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || `Student #${s.id}`;
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
                          <span className="text-xs text-gray-500">{s.year_group_code}</span>
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
