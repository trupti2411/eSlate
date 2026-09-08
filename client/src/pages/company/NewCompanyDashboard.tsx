import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Building2, Users, GraduationCap, BookOpen, ShieldCheck, ShieldAlert,
  CalendarDays, FileBarChart, LogOut, ArrowRight, UserPlus,
  ClipboardPlus, Plus, AlertTriangle, ChevronRight, Activity, Mail,
  UserCheck, FileEdit, CircleSlash, Settings as SettingsIcon, Trophy,
  DollarSign, BarChart2, Search,
} from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

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

interface EnrolmentSummary {
  termId: string | null;
  metrics: { totalStudents: number; totalClasses: number; totalEnrolments: number; availableSpots: number; waitlisted: number; };
  byClass: { id: string; name: string; courseName?: string; yearGroup?: string; tutorName?: string; enrolled: number; capacity?: number; attendancePct?: number }[];
  byCourse: { courseId: string; courseName: string; classes: number; students: number }[];
  byYearGroup: { yearGroup: string; count: number }[];
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

export default function NewCompanyDashboard() {
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


  const [enrolmentTermId, setEnrolmentTermId] = useState('');
  const { data: terms = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: [`/api/companies/${companyId}/terms`],
    enabled: !!companyId,
  });
  const { data: enrolmentSummary } = useQuery<EnrolmentSummary>({
    queryKey: [`/api/companies/${companyId}/enrolment-summary`, enrolmentTermId],
    queryFn: async () => {
      const params = enrolmentTermId ? `?term_id=${enrolmentTermId}` : '';
      const res = await fetch(`/api/companies/${companyId}/enrolment-summary${params}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: courseOfferings = [] } = useQuery<{ id: number; status: string }[]>({
    queryKey: ['/api/course-offerings'],
    enabled: !!user,
  });
  const activeCourseCount = courseOfferings.filter(o => o.status === 'active').length;

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
              <Link
                href="/company/settings"
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"
                aria-label="Settings"
              >
                <SettingsIcon size={16} />
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active term banner */}
        <TermBanner
          academicYear={currentYear}
          activeTerm={activeTerm}
          progress={termProgress}
        />

        {/* Status strip — every headline number in one scannable row */}
        <StatusStrip
          items={[
            { href: '/company/tutors', label: 'Staff', value: tutors.length, sub: staffSub, warning: complianceFlags > 0 || (cap != null && tutors.length >= cap) },
            { href: '/company/students', label: 'Students', value: students.length, sub: students.length === 0 ? 'add your first' : 'enrolled' },
            { href: '/company/classes', label: 'Classes', value: classes.length, sub: classes.length === 0 ? 'create a class' : 'active' },
            { href: '/company/courses', label: 'Test-prep', value: courseOfferings.length, sub: courseOfferings.length === 0 ? 'OC, Selective, NAPLAN' : `${activeCourseCount} active` },
          ]}
        />

        {/* Needs attention — every alert and setup nudge, as one actionable feed */}
        <NeedsAttentionCard
          hasYear={!!currentYear}
          wwccAlerts={wwccAlerts}
          compliantCount={tutors.length - wwccAlerts.length}
          totalTutors={tutors.length}
          hasTutors={tutors.length > 0}
          hasStudents={students.length > 0}
          hasClasses={classes.length > 0}
        />

        <QuickActionsCard hasStudents={students.length > 0} hasClasses={classes.length > 0} hasTutors={tutors.length > 0} />
        <EnrolmentSummaryCard summary={enrolmentSummary} terms={terms} termId={enrolmentTermId} onTermChange={setEnrolmentTermId} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AcademicCard year={currentYear} />
          <ActivityCard entries={auditLog} />
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

function StatusStrip({
  items,
}: { items: { href: string; label: string; value: number | string; sub: string; warning?: boolean }[] }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 overflow-hidden">
      {items.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className="px-5 py-4 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
            <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1 leading-none">{item.value}</p>
          <p className={`text-xs mt-1 ${item.warning ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>{item.sub}</p>
        </Link>
      ))}
    </section>
  );
}

function QuickActionsCard({
  hasStudents, hasClasses, hasTutors,
}: { hasStudents: boolean; hasClasses: boolean; hasTutors: boolean }) {
  const [query, setQuery] = useState('');
  const actions = [
    { href: '/company/tutors', label: 'Invite tutor', icon: <UserPlus size={16} />, tone: 'indigo' as const, primary: !hasTutors },
    { href: '/company/students', label: 'Add student', icon: <Plus size={16} />, tone: 'emerald' as const, primary: hasTutors && !hasStudents },
    { href: '/company/classes', label: 'Create class', icon: <BookOpen size={16} />, tone: 'amber' as const, primary: hasStudents && !hasClasses },
    { href: '/company/courses?create=1', label: 'Create course', icon: <Trophy size={16} />, tone: 'teal' as const, primary: false },
    { href: '/company/invoices', label: 'Invoices', icon: <DollarSign size={16} />, tone: 'rose' as const, primary: false },
    { href: '/company/revenue', label: 'Revenue', icon: <BarChart2 size={16} />, tone: 'violet' as const, primary: false },
    { href: '/company/assignment-library', label: 'Assignment Library', icon: <BookOpen size={16} />, tone: 'teal' as const, primary: false },
    { href: '/company/library-marking', label: 'Marking Queue', icon: <FileEdit size={16} />, tone: 'indigo' as const, primary: false },
    { href: '/company/timetable', label: 'Timetable', icon: <CalendarDays size={16} />, tone: 'indigo' as const, primary: false },
    { href: '/company/terms', label: 'Terms', icon: <CalendarDays size={16} />, tone: 'indigo' as const, primary: false },
  ];
  const toneClass = (k: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal' | 'gray', primary: boolean) => {
    const map: Record<string, { primary: string; ghost: string }> = {
      indigo:  { primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',  ghost: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
      emerald: { primary: 'bg-emerald-600 hover:bg-emerald-700 text-white', ghost: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
      amber:   { primary: 'bg-amber-600 hover:bg-amber-700 text-white',   ghost: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
      rose:    { primary: 'bg-rose-600 hover:bg-rose-700 text-white',    ghost: 'bg-rose-50 hover:bg-rose-100 text-rose-700' },
      violet:  { primary: 'bg-violet-600 hover:bg-violet-700 text-white',  ghost: 'bg-violet-50 hover:bg-violet-100 text-violet-700' },
      teal:    { primary: 'bg-teal-600 hover:bg-teal-700 text-white',    ghost: 'bg-teal-50 hover:bg-teal-100 text-teal-700' },
      gray:    { primary: 'bg-gray-600 hover:bg-gray-700 text-white',    ghost: 'bg-gray-50 hover:bg-gray-100 text-gray-700' },
    };
    return primary ? map[k].primary : map[k].ghost;
  };
  const filtered = query.trim()
    ? actions.filter(a => a.label.toLowerCase().includes(query.trim().toLowerCase()))
    : actions;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Quick actions</h3>
      </div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools — try “invoice” or “timetable”"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-colors"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No tools match “{query}”.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filtered.map(a => (
            <Link
              key={a.label}
              href={a.href}
              className={`${toneClass(a.tone as any, a.primary)} rounded-xl px-3 py-3 text-sm font-bold flex items-center gap-2 justify-center transition-colors`}
            >
              {a.icon}
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>
      )}
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

interface AttentionRow {
  key: string;
  tone: 'critical' | 'warning' | 'info' | 'good';
  icon: React.ReactNode;
  title: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
}

const ATTENTION_TONE = {
  critical: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bg-white text-rose-600', title: 'text-rose-900', sub: 'text-rose-700', cta: 'bg-rose-600 hover:bg-rose-700 text-white' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-white text-amber-600', title: 'text-amber-900', sub: 'text-amber-700', cta: 'bg-amber-600 hover:bg-amber-700 text-white' },
  info: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'bg-white text-indigo-600', title: 'text-indigo-900', sub: 'text-indigo-700', cta: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  good: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-white text-emerald-600', title: 'text-emerald-900', sub: 'text-emerald-700', cta: 'bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200' },
} as const;

function NeedsAttentionCard({
  hasYear, wwccAlerts, compliantCount, totalTutors, hasTutors, hasStudents, hasClasses,
}: {
  hasYear: boolean;
  wwccAlerts: { tutor: Tutor; severity: 'red' | 'amber'; reason: string }[];
  compliantCount: number;
  totalTutors: number;
  hasTutors: boolean;
  hasStudents: boolean;
  hasClasses: boolean;
}) {
  const rows: AttentionRow[] = [];

  const redAlerts = wwccAlerts.filter(a => a.severity === 'red');
  const amberAlerts = wwccAlerts.filter(a => a.severity === 'amber');
  if (redAlerts.length > 0) {
    rows.push({
      key: 'wwcc-red',
      tone: 'critical',
      icon: <ShieldAlert size={16} />,
      title: `${redAlerts.length} tutor${redAlerts.length === 1 ? '' : 's'} need urgent WWCC attention`,
      sub: redAlerts.slice(0, 3).map(a => `${a.tutor.firstName ?? a.tutor.email ?? 'Tutor'} — ${a.reason}`).join(' · ') + (redAlerts.length > 3 ? ` +${redAlerts.length - 3} more` : ''),
      ctaLabel: 'View staff', ctaHref: '/company/tutors',
    });
  }
  if (amberAlerts.length > 0) {
    rows.push({
      key: 'wwcc-amber',
      tone: 'warning',
      icon: <ShieldAlert size={16} />,
      title: `${amberAlerts.length} tutor${amberAlerts.length === 1 ? '' : 's'} with WWCC expiring soon`,
      sub: amberAlerts.slice(0, 3).map(a => `${a.tutor.firstName ?? a.tutor.email ?? 'Tutor'} — ${a.reason}`).join(' · ') + (amberAlerts.length > 3 ? ` +${amberAlerts.length - 3} more` : ''),
      ctaLabel: 'View staff', ctaHref: '/company/tutors',
    });
  }
  if (!hasYear) {
    rows.push({
      key: 'no-year',
      tone: 'warning',
      icon: <AlertTriangle size={16} />,
      title: 'No academic year set up',
      sub: 'Apply your state’s academic calendar to start scheduling classes.',
      ctaLabel: 'Set up', ctaHref: '/onboarding',
    });
  }
  if (hasYear && !hasTutors) {
    rows.push({ key: 'no-tutors', tone: 'info', icon: <UserPlus size={16} />, title: 'No tutors yet', sub: 'Invite your first tutor to start building classes.', ctaLabel: 'Invite tutor', ctaHref: '/company/tutors' });
  }
  if (hasYear && hasTutors && !hasStudents) {
    rows.push({ key: 'no-students', tone: 'info', icon: <GraduationCap size={16} />, title: 'No students yet', sub: 'Add your first student to start enrolling them in classes.', ctaLabel: 'Add student', ctaHref: '/company/students' });
  }
  if (hasYear && hasStudents && !hasClasses) {
    rows.push({ key: 'no-classes', tone: 'info', icon: <BookOpen size={16} />, title: 'No classes yet', sub: 'Create a class to start enrolling and timetabling students.', ctaLabel: 'Create class', ctaHref: '/company/classes' });
  }

  if (rows.length === 0) {
    rows.push({
      key: 'all-good',
      tone: 'good',
      icon: <ShieldCheck size={16} />,
      title: `${compliantCount} of ${totalTutors} staff compliant`,
      sub: 'WWCC active for everyone — nothing needs attention right now.',
      ctaLabel: 'View staff', ctaHref: '/company/tutors',
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Needs attention</h3>
        {rows.length > 0 && rows[0].key !== 'all-good' && (
          <span className="text-xs font-bold text-gray-400">{rows.length}</span>
        )}
      </div>
      <div className="space-y-2">
        {rows.map(row => {
          const t = ATTENTION_TONE[row.tone];
          return (
            <div key={row.key} className={`flex items-center gap-3 rounded-xl border ${t.border} ${t.bg} px-4 py-3`}>
              <div className={`w-8 h-8 rounded-lg ${t.icon} flex items-center justify-center flex-shrink-0`}>{row.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${t.title} truncate`}>{row.title}</p>
                <p className={`text-xs ${t.sub} truncate`}>{row.sub}</p>
              </div>
              <Link href={row.ctaHref} className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 flex-shrink-0 ${t.cta}`}>
                {row.ctaLabel} <ChevronRight size={12} />
              </Link>
            </div>
          );
        })}
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

function EnrolmentSummaryCard({
  summary, terms, termId, onTermChange,
}: {
  summary?: EnrolmentSummary;
  terms: { id: string; name: string }[];
  termId: string;
  onTermChange: (id: string) => void;
}) {
  const m = summary?.metrics;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <BarChart2 size={14} className="text-indigo-600" /> Enrolment Summary
        </h3>
        <select value={termId} onChange={e => onTermChange(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-1 text-xs font-semibold text-gray-600">
          <option value="">Current Term</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {!summary?.termId && !summary?.metrics ? (
        <p className="text-sm text-gray-400">No active term found. Set up your academic calendar to see enrolment data.</p>
      ) : (
        <>
          {/* Metrics row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {[
              { label: 'Students', value: m?.totalStudents ?? 0, cls: 'text-indigo-700' },
              { label: 'Classes',  value: m?.totalClasses ?? 0,  cls: 'text-amber-700' },
              { label: 'Enrolments', value: m?.totalEnrolments ?? 0, cls: 'text-emerald-700' },
              { label: 'Spots Left',  value: m?.availableSpots ?? 0, cls: 'text-gray-700' },
              { label: 'Waitlisted', value: m?.waitlisted ?? 0, cls: 'text-rose-600' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={`text-xl font-black ${item.cls}`}>{item.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* By class */}
          {summary?.byClass && summary.byClass.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">By Class</p>
              <div className="space-y-1.5">
                {summary.byClass.slice(0, 5).map(c => {
                  const pct = c.capacity ? Math.min(100, Math.round((c.enrolled / c.capacity) * 100)) : null;
                  return (
                    <div key={c.id} className="flex items-center gap-2 text-xs">
                      <Link href={`/company/classes/${c.id}`} className="font-semibold text-gray-800 hover:text-indigo-700 truncate flex-1">{c.name}</Link>
                      <span className="text-gray-500 whitespace-nowrap">{c.enrolled}{c.capacity ? `/${c.capacity}` : ''}</span>
                      {pct !== null && (
                        <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {summary.byClass.length > 5 && (
                  <Link href="/company/classes" className="text-xs text-indigo-600 font-semibold hover:underline">+ {summary.byClass.length - 5} more classes</Link>
                )}
              </div>
            </div>
          )}

          {/* By year group */}
          {summary?.byYearGroup && summary.byYearGroup.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">By Year Group</p>
              <div className="space-y-1">
                {summary.byYearGroup.map(yg => {
                  const maxCount = Math.max(...summary.byYearGroup.map(y => y.count), 1);
                  const pct = Math.round((yg.count / maxCount) * 100);
                  return (
                    <div key={yg.yearGroup} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 w-16 flex-shrink-0">{yg.yearGroup}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-500 w-8 text-right">{yg.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
