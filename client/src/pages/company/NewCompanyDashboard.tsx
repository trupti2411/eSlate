import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { DesignNavToggle } from '@/components/DesignSwitchBanner';
import type { Design } from '@/hooks/useDesignPreference';
import {
  Building2, Users, GraduationCap, BookOpen, ShieldCheck, ShieldAlert,
  CalendarDays, FileBarChart, Bell, LogOut, ArrowRight, UserPlus,
  ClipboardPlus, Plus, AlertTriangle, ChevronRight, Activity, Mail,
  UserCheck, FileEdit, CircleSlash,
} from 'lucide-react';

interface Props { setDesign: (d: Design) => void; }

interface AdminProfile {
  userId: string;
  companyId: string;
  companyName: string;
  tier?: 'individual' | 'starter' | 'pro' | 'enterprise' | string;
  businessType?: 'individual' | 'multi_tutor' | string;
}

const TIER_CAP: Record<string, number | null> = {
  individual: 1,
  starter: 5,
  pro: 20,
  enterprise: null, // unlimited (fair use)
};
function tutorCap(tier?: string): number | null | undefined {
  if (!tier) return undefined;
  return TIER_CAP[tier];
}
interface Tutor {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  status?: string;
  complianceStatus?: 'compliant' | 'pending_compliance' | 'compliance_hold' | null;
  wwccExpiry?: string | null;
}
interface Student { id: string; user?: { firstName?: string | null; lastName?: string | null }; }
interface Classroom { id: string; name: string; subject?: string; tutorId?: string | null; }
interface Term {
  id: string | number;
  name: string;
  start_date: string;
  end_date: string;
  term_number?: number;
}
interface AcademicYear {
  id: string | number;
  year: number;
  state_code: string;
  status?: string;
  pack_version?: string;
  terms?: Term[];
}

interface AuditEntry {
  id: number;
  event: string;
  entity: string | null;
  entityId: number | null;
  occurredAt: string;
  actor: { id: number; name: string } | null;
  payload: Record<string, unknown> | null;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function dayDiff(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.round((b - a) / 86400000);
}

// Days from `from` to `to` (both YYYY-MM-DD or ISO). Negative if `to` is in the past.
function daysBetween(from: string, to: string): number {
  const a = new Date(dateOnly(from) + 'T00:00:00Z').getTime();
  const b = new Date(dateOnly(to) + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

// Normalize "2026-02-02T00:00:00.000000Z" or "2026-02-02" to "2026-02-02"
// so date-only string comparisons work consistently.
function dateOnly(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : String(s);
}

export default function NewCompanyDashboard({ setDesign }: Props) {
  const { user, logoutMutation } = useAuth();

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: tutors = [] } = useQuery<Tutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });
  const { data: classes = [] } = useQuery<Classroom[]>({
    queryKey: [`/api/companies/${companyId}/classes`],
    enabled: !!companyId,
  });
  // Hierarchy returns the company's academic structure as { years: [...] }
  const { data: hierarchy } = useQuery<{ years?: AcademicYear[] } | AcademicYear[]>({
    queryKey: [`/api/companies/${companyId}/academic-hierarchy`],
    enabled: !!companyId,
  });

  const { data: auditLog = [] } = useQuery<AuditEntry[]>({
    queryKey: [`/api/companies/${companyId}/audit-log?limit=8`],
    enabled: !!companyId,
  });

  const academicYears: AcademicYear[] = useMemo(() => {
    if (!hierarchy) return [];
    if (Array.isArray(hierarchy)) return hierarchy;
    return hierarchy.years ?? [];
  }, [hierarchy]);

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = useMemo(() => {
    return academicYears.find(y =>
      (y.terms ?? []).some(t => dateOnly(t.start_date) <= today && dateOnly(t.end_date) >= today)
    ) ?? academicYears[0];
  }, [academicYears, today]);

  const activeTerm = useMemo(() => {
    if (!currentYear?.terms) return undefined;
    return currentYear.terms.find(t => dateOnly(t.start_date) <= today && dateOnly(t.end_date) >= today)
      ?? currentYear.terms.find(t => dateOnly(t.start_date) > today); // next upcoming
  }, [currentYear, today]);

  const termProgress = useMemo(() => {
    if (!activeTerm) return null;
    if (dateOnly(activeTerm.start_date) > today) return { state: 'upcoming' as const };
    const total = dayDiff(dateOnly(activeTerm.start_date), dateOnly(activeTerm.end_date)) || 1;
    const elapsed = Math.max(0, Math.min(total, dayDiff(dateOnly(activeTerm.start_date), today)));
    return { state: 'active' as const, pct: Math.round((elapsed / total) * 100), elapsed, total };
  }, [activeTerm, today]);

  const complianceFlags = useMemo(() => {
    return tutors.filter(t =>
      t.complianceStatus === 'pending_compliance' || t.complianceStatus === 'compliance_hold'
    ).length;
  }, [tutors]);

  const cap = tutorCap(adminProfile?.tier);
  const staffSub = (() => {
    if (cap === null) return `${tutors.length} active · unlimited`;
    if (cap === undefined) return complianceFlags > 0 ? `${complianceFlags} pending compliance` : 'all compliant';
    return `${tutors.length} of ${cap} on ${adminProfile?.tier} tier`;
  })();

  // WWCC alerts: on-hold (red), expiring ≤30 days (urgency by days remaining),
  // pending compliance (amber, no expiry yet). Per v3 §8.2.
  const wwccAlerts = useMemo(() => {
    const items: { tutor: Tutor; severity: 'red' | 'amber'; reason: string }[] = [];
    for (const t of tutors) {
      if (t.complianceStatus === 'compliance_hold') {
        items.push({ tutor: t, severity: 'red', reason: 'on hold' });
      } else if (t.complianceStatus === 'pending_compliance') {
        items.push({ tutor: t, severity: 'amber', reason: 'pending capture' });
      } else if (t.wwccExpiry) {
        const days = daysBetween(today, dateOnly(t.wwccExpiry));
        if (days < 0) {
          items.push({ tutor: t, severity: 'red', reason: 'expired' });
        } else if (days <= 7) {
          items.push({ tutor: t, severity: 'red', reason: `expires in ${days}d` });
        } else if (days <= 30) {
          items.push({ tutor: t, severity: 'amber', reason: `expires in ${days}d` });
        }
      }
    }
    return items;
  }, [tutors, today]);

  const ownerFirstName = user?.firstName ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                  Business Portal
                </p>
                <h1 className="text-xl sm:text-2xl font-black truncate">
                  {companyName ?? 'Loading…'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="hidden md:inline text-xs text-indigo-200 mr-1">
                {ownerFirstName ? `Owner · ${ownerFirstName}` : ''}
              </span>
              <DesignNavToggle design="new" onSwitch={setDesign} accentClass="bg-indigo-600" />
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* WWCC compliance alerts (top-of-page so owners see them first) */}
        {wwccAlerts.length > 0 && <WwccAlertsBanner alerts={wwccAlerts} />}

        {/* Active term banner */}
        <TermBanner
          academicYear={currentYear}
          activeTerm={activeTerm}
          progress={termProgress}
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            href="/company/tutors"
            icon={<Users size={18} />}
            label="Staff"
            value={tutors.length}
            sub={staffSub}
            tone="indigo"
            warning={complianceFlags > 0 || (cap != null && tutors.length >= cap)}
          />
          <KpiCard
            href="/company/students"
            icon={<GraduationCap size={18} />}
            label="Students"
            value={students.length}
            sub={students.length === 0 ? 'add your first' : 'enrolled'}
            tone="emerald"
          />
          <KpiCard
            href="/company/academic"
            icon={<BookOpen size={18} />}
            label="Classes"
            value={classes.length}
            sub={classes.length === 0 ? 'create a class' : 'active'}
            tone="amber"
          />
          <KpiCard
            href="/company/reports"
            icon={<FileBarChart size={18} />}
            label="Reports"
            value={'—'}
            sub="open reports"
            tone="rose"
          />
        </div>

        {/* Two-column body: Quick actions + Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QuickActionsCard hasStudents={students.length > 0} hasClasses={classes.length > 0} hasTutors={tutors.length > 0} />
            <AcademicCard year={currentYear} />
            <ActivityCard entries={auditLog} />
          </div>
          <div className="space-y-6">
            <ComplianceCard tutors={tutors} />
            <GettingStartedCard
              hasTutors={tutors.length > 0}
              hasStudents={students.length > 0}
              hasClasses={classes.length > 0}
              hasYear={!!currentYear}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function TermBanner({
  academicYear,
  activeTerm,
  progress,
}: {
  academicYear?: AcademicYear;
  activeTerm?: Term;
  progress: { state: 'active'; pct: number; elapsed: number; total: number } | { state: 'upcoming' } | null;
}) {
  if (!academicYear) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-amber-900">No academic year set up</p>
          <p className="text-sm text-amber-800 mt-0.5">
            Apply your state's academic calendar to start scheduling classes.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 flex-shrink-0"
        >
          Set up <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
              {academicYear.state_code} · Academic year {academicYear.year}
            </p>
            <h2 className="text-xl font-black mt-0.5">
              {activeTerm ? activeTerm.name : 'Between terms'}
            </h2>
            {activeTerm && (
              <p className="text-sm text-indigo-100 mt-0.5">
                {formatDate(activeTerm.start_date)} → {formatDate(activeTerm.end_date)}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/company/academic"
          className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl flex items-center gap-1.5"
        >
          Manage Terms <ChevronRight size={12} />
        </Link>
      </div>

      {progress?.state === 'active' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-100 mb-1.5">
            <span>{progress.pct}% through term</span>
            <span>{progress.total - progress.elapsed} days left</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}
      {progress?.state === 'upcoming' && (
        <p className="mt-3 text-xs font-semibold text-indigo-100">Term begins {formatDate(activeTerm!.start_date)}</p>
      )}

      {/* Term strip */}
      {academicYear.terms && academicYear.terms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          {academicYear.terms.map(t => {
            const isActive = activeTerm?.id === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-xl px-3 py-2 text-left ${
                  isActive ? 'bg-white text-indigo-700' : 'bg-white/10 text-indigo-50'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t.name}</p>
                <p className="text-xs font-semibold mt-0.5">
                  {formatDate(t.start_date)} – {formatDate(t.end_date)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TONE = {
  indigo: { card: 'bg-white border-indigo-100 hover:border-indigo-300', icon: 'bg-indigo-50 text-indigo-600', value: 'text-indigo-700' },
  emerald: { card: 'bg-white border-emerald-100 hover:border-emerald-300', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  amber: { card: 'bg-white border-amber-100 hover:border-amber-300', icon: 'bg-amber-50 text-amber-600', value: 'text-amber-700' },
  rose: { card: 'bg-white border-rose-100 hover:border-rose-300', icon: 'bg-rose-50 text-rose-600', value: 'text-rose-700' },
} as const;

function KpiCard({
  href, icon, label, value, sub, tone, warning,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  tone: keyof typeof TONE;
  warning?: boolean;
}) {
  const t = TONE[tone];
  return (
    <Link
      href={href}
      className={`block rounded-2xl border ${t.card} p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${t.icon} flex items-center justify-center`}>{icon}</div>
        <ChevronRight size={14} className="text-gray-300 mt-1" />
      </div>
      <p className={`text-3xl font-black ${t.value}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      <p className={`text-xs mt-1 ${warning ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>{sub}</p>
    </Link>
  );
}

function QuickActionsCard({
  hasStudents, hasClasses, hasTutors,
}: { hasStudents: boolean; hasClasses: boolean; hasTutors: boolean }) {
  const actions = [
    { href: '/company/tutors', label: 'Invite tutor', icon: <UserPlus size={16} />, tone: 'indigo' as const, primary: !hasTutors },
    { href: '/company/students', label: 'Add student', icon: <Plus size={16} />, tone: 'emerald' as const, primary: hasTutors && !hasStudents },
    { href: '/company/academic', label: 'Create class', icon: <BookOpen size={16} />, tone: 'amber' as const, primary: hasStudents && !hasClasses },
    { href: '/company/assignments', label: 'New assignment', icon: <ClipboardPlus size={16} />, tone: 'rose' as const, primary: false },
  ];
  const toneClass = (k: 'indigo' | 'emerald' | 'amber' | 'rose', primary: boolean) => {
    const map: Record<string, { primary: string; ghost: string }> = {
      indigo: { primary: 'bg-indigo-600 hover:bg-indigo-700 text-white', ghost: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
      emerald: { primary: 'bg-emerald-600 hover:bg-emerald-700 text-white', ghost: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
      amber: { primary: 'bg-amber-600 hover:bg-amber-700 text-white', ghost: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
      rose: { primary: 'bg-rose-600 hover:bg-rose-700 text-white', ghost: 'bg-rose-50 hover:bg-rose-100 text-rose-700' },
    };
    return primary ? map[k].primary : map[k].ghost;
  };
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Quick actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map(a => (
          <Link
            key={a.label}
            href={a.href}
            className={`${toneClass(a.tone, a.primary)} rounded-xl px-3 py-3 text-sm font-bold flex items-center gap-2 justify-center transition-colors`}
          >
            {a.icon}
            <span className="truncate">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AcademicCard({ year }: { year?: AcademicYear }) {
  if (!year) return null;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Academic year</h3>
        <Link
          href="/company/academic"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          Open <ChevronRight size={12} />
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl font-black text-gray-900">{year.year}</div>
        <div>
          <p className="text-sm font-semibold text-gray-700">{year.state_code} state pack</p>
          <p className="text-xs text-gray-500">
            {(year.terms?.length ?? 0)} terms · status: {year.status ?? 'draft'}
            {year.pack_version ? ` · v${year.pack_version}` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}

function WwccAlertsBanner({
  alerts,
}: { alerts: { tutor: Tutor; severity: 'red' | 'amber'; reason: string }[] }) {
  const hasRed = alerts.some(a => a.severity === 'red');
  const palette = hasRed
    ? { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-700', text: 'text-rose-900', sub: 'text-rose-700' }
    : { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-700', text: 'text-amber-900', sub: 'text-amber-700' };
  const headline = hasRed
    ? `${alerts.length} tutor${alerts.length === 1 ? '' : 's'} need urgent WWCC attention`
    : `${alerts.length} tutor${alerts.length === 1 ? '' : 's'} with WWCC expiring soon`;
  return (
    <section className={`rounded-2xl border ${palette.border} ${palette.bg} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${palette.icon} flex items-center justify-center flex-shrink-0`}>
          <ShieldAlert size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${palette.text}`}>{headline}</p>
          <ul className={`mt-2 space-y-1 text-sm ${palette.sub}`}>
            {alerts.slice(0, 4).map(a => {
              const fn = `${a.tutor.firstName ?? ''} ${a.tutor.lastName ?? ''}`.trim() || a.tutor.email || `Tutor #${a.tutor.id}`;
              return (
                <li key={a.tutor.id}>
                  <span className="font-semibold">{fn}</span> — {a.reason}
                  {a.tutor.wwccExpiry && a.reason.startsWith('expires') && (
                    <span className="opacity-75"> ({formatDate(a.tutor.wwccExpiry)})</span>
                  )}
                </li>
              );
            })}
            {alerts.length > 4 && (
              <li className="opacity-75">+ {alerts.length - 4} more</li>
            )}
          </ul>
        </div>
        <Link
          href="/company/tutors"
          className={`text-xs font-bold ${hasRed ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'} text-white px-3 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0`}
        >
          View staff <ChevronRight size={12} />
        </Link>
      </div>
    </section>
  );
}

function ActivityCard({ entries }: { entries: AuditEntry[] }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Activity size={14} className="text-indigo-600" /> Recent activity
        </h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet — invite a tutor or add a student to get started.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(e => <ActivityRow key={e.id} entry={e} />)}
        </ul>
      )}
    </section>
  );
}

function ActivityRow({ entry }: { entry: AuditEntry }) {
  const { icon, label, tone } = describeEvent(entry);
  const palette = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    gray: 'bg-gray-100 text-gray-600',
  }[tone];
  return (
    <li className="flex items-start gap-3">
      <span className={`w-8 h-8 rounded-xl ${palette} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          {label}
          {entry.actor?.name && (
            <span className="text-gray-500"> · {entry.actor.name}</span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{relativeTime(entry.occurredAt)}</p>
      </div>
    </li>
  );
}

function describeEvent(e: AuditEntry): { icon: React.ReactNode; label: string; tone: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gray' } {
  const email = (e.payload && (e.payload as any).email) as string | undefined;
  switch (e.event) {
    case 'business_invited':
      return { icon: <Mail size={14} />, label: `Business invitation sent${email ? ` to ${email}` : ''}`, tone: 'indigo' };
    case 'owner_password_set':
      return { icon: <UserCheck size={14} />, label: 'Owner accepted invite', tone: 'emerald' };
    case 'tutor_invited':
      return { icon: <UserPlus size={14} />, label: `Tutor invitation sent${email ? ` to ${email}` : ''}`, tone: 'indigo' };
    case 'tutor_activated':
      return { icon: <UserCheck size={14} />, label: 'Tutor activated their account', tone: 'emerald' };
    case 'student_added':
      return { icon: <GraduationCap size={14} />, label: 'Student added', tone: 'emerald' };
    case 'tier_limit_rejected':
      return { icon: <CircleSlash size={14} />, label: 'Tier limit reached — invite blocked', tone: 'rose' };
    case 'term_edited':
      return { icon: <FileEdit size={14} />, label: 'Term dates edited', tone: 'amber' };
    default:
      return { icon: <Activity size={14} />, label: e.event.replace(/_/g, ' '), tone: 'gray' };
  }
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 7 * 86400) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(iso);
}

function ComplianceCard({ tutors }: { tutors: Tutor[] }) {
  const flagged = tutors.filter(
    t => t.complianceStatus === 'pending_compliance' || t.complianceStatus === 'compliance_hold'
  );
  const compliant = tutors.length - flagged.length;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Compliance</h3>
        <Link href="/company/tutors" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
          View staff
        </Link>
      </div>
      {tutors.length === 0 ? (
        <p className="text-sm text-gray-500">No tutors yet — invite one to begin.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
            <ShieldCheck size={18} className="text-emerald-700" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">{compliant} compliant</p>
              <p className="text-xs text-emerald-700">WWCC active</p>
            </div>
          </div>
          {flagged.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
              <ShieldAlert size={18} className="text-amber-700" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">{flagged.length} pending</p>
                <p className="text-xs text-amber-700">WWCC missing or expired</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function GettingStartedCard({
  hasTutors, hasStudents, hasClasses, hasYear,
}: { hasTutors: boolean; hasStudents: boolean; hasClasses: boolean; hasYear: boolean }) {
  const steps = [
    { done: hasYear, label: 'Apply academic calendar' },
    { done: hasTutors, label: 'Invite a tutor' },
    { done: hasStudents, label: 'Add a student' },
    { done: hasClasses, label: 'Create a class' },
  ];
  const completed = steps.filter(s => s.done).length;
  if (completed === steps.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Getting started</h3>
        <span className="text-xs font-bold text-gray-500">{completed}/{steps.length}</span>
      </div>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              s.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s.done ? '✓' : i + 1}
            </span>
            <span className={s.done ? 'text-gray-400 line-through' : 'text-gray-700 font-semibold'}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
