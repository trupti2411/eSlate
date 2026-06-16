import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { withBase, authHeaders } from '@/lib/queryClient';
import {
  GraduationCap, Bell, LogOut, ClipboardList, Clock, CheckCircle2,
  AlertTriangle, FileText, Download, ChevronRight, BookOpen, Calendar,
} from 'lucide-react';

interface MyAssignment {
  id: number;
  title: string;
  description?: string | null;
  pdf_path?: string | null;
  pdf_original_name?: string | null;
  due_date: string | null;
  status: string;
  class_id?: number | null;
  classroom?: {
    id: number;
    name: string;
    subject?: { id: number; name: string };
    yearGroup?: { id: number; label: string };
  } | null;
  my_submission?: {
    id: number;
    status: string;
    score: number | null;
  } | null;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function dueStatus(s: string | null | undefined): { text: string; tone: 'red' | 'amber' | 'gray' } {
  if (!s) return { text: 'No due date', tone: 'gray' };
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return { text: s, tone: 'gray' };
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const due = new Date(m[1]).getTime();
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, tone: 'red' };
  if (days === 0) return { text: 'Due today', tone: 'red' };
  if (days <= 3) return { text: `Due in ${days} day${days === 1 ? '' : 's'}`, tone: 'amber' };
  return { text: `Due ${formatDate(s)}`, tone: 'gray' };
}

export default function NewStudentHome() {
  const { user, logoutMutation } = useAuth();

  const { data: assignments = [], isLoading } = useQuery<MyAssignment[]>({
    queryKey: ['/api/me/assignments'],
    enabled: !!user,
  });

  const buckets = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const overdue: MyAssignment[] = [];
    const todo: MyAssignment[] = [];
    const submitted: MyAssignment[] = [];
    const graded: MyAssignment[] = [];

    for (const a of assignments) {
      const subStatus = a.my_submission?.status;
      if (subStatus === 'graded') { graded.push(a); continue; }
      if (subStatus === 'submitted') { submitted.push(a); continue; }
      if (a.due_date && String(a.due_date).slice(0, 10) < now) {
        overdue.push(a);
      } else {
        todo.push(a);
      }
    }
    const byDue = (x: MyAssignment, y: MyAssignment) => {
      if (!x.due_date && !y.due_date) return 0;
      if (!x.due_date) return 1;
      if (!y.due_date) return -1;
      return x.due_date.localeCompare(y.due_date);
    };
    overdue.sort(byDue);
    todo.sort(byDue);
    return { overdue, todo, submitted, graded };
  }, [assignments]);

  const classCount = useMemo(() => {
    const seen = new Set<number>();
    for (const a of assignments) {
      if (a.classroom?.id) seen.add(a.classroom.id);
    }
    return seen.size;
  }, [assignments]);

  // Up next = overdue first, then closest-due to-do, capped at 5
  const upNext = useMemo(() => {
    return [...buckets.overdue, ...buckets.todo].slice(0, 5);
  }, [buckets.overdue, buckets.todo]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Student portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">
                  Hi {user?.firstName || 'there'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
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
        {/* Overdue alert banner */}
        {buckets.overdue.length > 0 && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-rose-900">
                {buckets.overdue.length} overdue assignment{buckets.overdue.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Get these in as soon as you can — they're past their due date.
              </p>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            href="/student/assignments"
            icon={<AlertTriangle size={18} />}
            label="Overdue"
            value={buckets.overdue.length}
            sub={buckets.overdue.length === 0 ? 'all caught up' : 'need attention'}
            tone="rose"
          />
          <KpiCard
            href="/student/assignments"
            icon={<Clock size={18} />}
            label="To do"
            value={buckets.todo.length}
            sub={buckets.todo.length === 0 ? 'nothing pending' : 'pending'}
            tone="amber"
          />
          <KpiCard
            href="/student/assignments"
            icon={<CheckCircle2 size={18} />}
            label="Submitted"
            value={buckets.submitted.length + buckets.graded.length}
            sub={buckets.graded.length > 0 ? `${buckets.graded.length} graded` : 'awaiting marks'}
            tone="emerald"
          />
          <KpiCard
            href="/student/assignments"
            icon={<BookOpen size={18} />}
            label="Classes"
            value={classCount}
            sub={classCount === 0 ? 'not enrolled yet' : 'enrolled'}
            tone="indigo"
          />
        </div>

        {/* Up next */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <ClipboardList size={14} className="text-indigo-600" /> Up next
            </h3>
            <Link href="/student/assignments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-5">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : upNext.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-sm font-bold text-gray-900">All caught up!</p>
                <p className="text-xs text-gray-500 mt-1">No pending assignments. Check back later for new ones.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upNext.map(a => <UpNextRow key={a.id} a={a} />)}
              </ul>
            )}
          </div>
        </section>

        {/* Recently submitted */}
        {(buckets.submitted.length > 0 || buckets.graded.length > 0) && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Recently submitted
              </h3>
            </div>
            <div className="p-5">
              <ul className="divide-y divide-gray-100">
                {[...buckets.graded, ...buckets.submitted].slice(0, 4).map(a => <SubmittedRow key={a.id} a={a} />)}
              </ul>
            </div>
          </section>
        )}
      </main>
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
  href, icon, label, value, sub, tone,
}: { href: string; icon: React.ReactNode; label: string; value: number; sub: string; tone: keyof typeof TONE }) {
  const t = TONE[tone];
  return (
    <Link href={href} className={`block rounded-2xl border ${t.card} p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${t.icon} flex items-center justify-center`}>{icon}</div>
        <ChevronRight size={14} className="text-gray-300 mt-1" />
      </div>
      <p className={`text-3xl font-black ${t.value}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs mt-1 text-gray-500">{sub}</p>
    </Link>
  );
}

async function downloadPdf(a: MyAssignment) {
  const res = await fetch(withBase(`/api/assignments/${a.id}/pdf`), { headers: authHeaders() });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = a.pdf_original_name ?? `assignment-${a.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function UpNextRow({ a }: { a: MyAssignment }) {
  const due = dueStatus(a.due_date);
  const dueTone = {
    red: 'text-rose-700 bg-rose-50',
    amber: 'text-amber-700 bg-amber-50',
    gray: 'text-gray-500 bg-gray-50',
  }[due.tone];
  return (
    <li className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
        <FileText size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 truncate">{a.title}</p>
        <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
          {a.classroom?.name && (
            <span className="font-semibold text-gray-700 truncate">{a.classroom.name}</span>
          )}
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${dueTone}`}>
            <Clock size={10} /> {due.text}
          </span>
        </div>
      </div>
      {a.pdf_path && (
        <button
          onClick={() => downloadPdf(a)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0"
        >
          <Download size={12} /> PDF
        </button>
      )}
    </li>
  );
}

function SubmittedRow({ a }: { a: MyAssignment }) {
  const sub = a.my_submission;
  const isGraded = sub?.status === 'graded';
  return (
    <li className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{a.title}</p>
        <p className="text-xs text-gray-500">
          {a.classroom?.name && <span className="font-semibold text-gray-700">{a.classroom.name}</span>}
          {isGraded && sub?.score != null && <span className="ml-2">Grade: <span className="font-bold text-emerald-700">{sub.score}</span></span>}
          {!isGraded && <span className="ml-2 text-amber-700 font-semibold">Awaiting marks</span>}
        </p>
      </div>
    </li>
  );
}
