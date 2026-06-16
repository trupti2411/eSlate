import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { withBase, authHeaders } from '@/lib/queryClient';
import {
  ClipboardList, Bell, LogOut, ArrowLeft, FileText, Clock, Download,
  CheckCircle2, AlertTriangle, GraduationCap,
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
    submitted_at: string | null;
    score: number | null;
    feedback: string | null;
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

export default function StudentAssignmentsPage() {
  const { logoutMutation } = useAuth();

  const { data: assignments = [], isLoading } = useQuery<MyAssignment[]>({
    queryKey: ['/api/me/assignments'],
  });

  const grouped = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const pending: MyAssignment[] = [];
    const submitted: MyAssignment[] = [];
    const overdue: MyAssignment[] = [];

    for (const a of assignments) {
      const subStatus = a.my_submission?.status;
      const isDone = subStatus === 'submitted' || subStatus === 'graded';
      if (isDone) {
        submitted.push(a);
        continue;
      }
      if (a.due_date && String(a.due_date).slice(0, 10) < now) {
        overdue.push(a);
      } else {
        pending.push(a);
      }
    }
    // Sort each group by due date ascending (no due date last)
    const byDue = (x: MyAssignment, y: MyAssignment) => {
      if (!x.due_date && !y.due_date) return 0;
      if (!x.due_date) return 1;
      if (!y.due_date) return -1;
      return x.due_date.localeCompare(y.due_date);
    };
    pending.sort(byDue);
    overdue.sort(byDue);
    return { pending, overdue, submitted };
  }, [assignments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Student portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">My assignments</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {grouped.overdue.length > 0 && (
              <AssignmentGroup
                title={`Overdue (${grouped.overdue.length})`}
                tone="rose"
                items={grouped.overdue}
              />
            )}
            <AssignmentGroup
              title={`To do (${grouped.pending.length})`}
              tone="indigo"
              items={grouped.pending}
              emptyText="Nothing pending — well done!"
            />
            {grouped.submitted.length > 0 && (
              <AssignmentGroup
                title={`Submitted (${grouped.submitted.length})`}
                tone="emerald"
                items={grouped.submitted}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
        <ClipboardList size={22} />
      </div>
      <h2 className="text-lg font-black text-gray-900">No assignments yet</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        Your tutor will post assignments here. Check back soon.
      </p>
    </div>
  );
}

function AssignmentGroup({
  title, tone, items, emptyText,
}: { title: string; tone: 'rose' | 'indigo' | 'emerald'; items: MyAssignment[]; emptyText?: string }) {
  const headerTone = {
    rose: 'text-rose-700',
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
  }[tone];
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className={`text-sm font-bold uppercase tracking-widest ${headerTone}`}>{title}</h3>
      </div>
      <div className="p-5">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyText ?? 'Nothing here.'}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map(a => <AssignmentItem key={a.id} a={a} />)}
          </ul>
        )}
      </div>
    </section>
  );
}

function AssignmentItem({ a }: { a: MyAssignment }) {
  const due = dueStatus(a.due_date);
  const sub = a.my_submission;
  const submitted = sub?.status === 'submitted' || sub?.status === 'graded';

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

  const dueTone = {
    red: 'text-rose-700 bg-rose-50',
    amber: 'text-amber-700 bg-amber-50',
    gray: 'text-gray-500 bg-gray-50',
  }[due.tone];

  return (
    <li className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
        <FileText size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 truncate">{a.title}</p>
        <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
          {a.classroom?.name && (
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <GraduationCap size={11} /> {a.classroom.name}
            </span>
          )}
          {a.classroom?.subject?.name && <span>{a.classroom.subject.name}</span>}
          {!submitted && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${dueTone}`}>
              <Clock size={10} /> {due.text}
            </span>
          )}
          {submitted && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-emerald-700 bg-emerald-50">
              <CheckCircle2 size={10} />
              {sub?.status === 'graded' ? `Graded${sub.score != null ? ` · ${sub.score}` : ''}` : 'Submitted'}
            </span>
          )}
        </div>
        {a.description && (
          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{a.description}</p>
        )}
      </div>
      {a.pdf_path && (
        <button
          onClick={downloadPdf}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0"
          title="Download PDF"
        >
          <Download size={12} /> PDF
        </button>
      )}
    </li>
  );
}
