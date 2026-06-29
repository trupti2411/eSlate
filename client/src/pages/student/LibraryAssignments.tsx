import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { ChevronLeft, BookOpen, Clock, AlertCircle, Star, FileText, ChevronRight } from 'lucide-react';

interface Allocation {
  id: string;
  assignmentTitle: string;
  subjects: string[];
  dueDate: string | null;
  status: 'assigned' | 'in_progress' | 'submitted' | 'returned' | 'overdue';
  isLate: boolean;
  score: number | null;
  maxMarks: number | null;
  feedback: string | null;
}

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  assigned:    { cls: 'bg-blue-100 text-blue-700',    label: 'Assigned' },
  in_progress: { cls: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
  submitted:   { cls: 'bg-purple-100 text-purple-700', label: 'Submitted' },
  returned:    { cls: 'bg-green-100 text-green-700',   label: 'Returned' },
  overdue:     { cls: 'bg-red-100 text-red-700',       label: 'Overdue' },
};

export default function LibraryAssignments() {
  const { user } = useAuth();

  const { data: allocations = [], isLoading } = useQuery<Allocation[]>({
    queryKey: ['/api/me/library-assignments'],
    enabled: !!user?.id,
  });

  const active = allocations.filter(a => a.status !== 'returned');
  const returned = allocations.filter(a => a.status === 'returned');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/student" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Student</p>
            <h1 className="text-xl font-black">My Assignments</h1>
          </div>
          <span className="bg-white/15 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
            {active.length} active
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No assignments yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your assignments will appear here when your tutor allocates them.
            </p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Active</h2>
                <div className="space-y-3">
                  {active.map(a => <AllocationCard key={a.id} allocation={a} />)}
                </div>
              </section>
            )}
            {returned.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Returned</h2>
                <div className="space-y-3">
                  {returned.map(a => <AllocationCard key={a.id} allocation={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AllocationCard({ allocation: a }: { allocation: Allocation }) {
  const badge = STATUS_BADGE[a.status] ?? { cls: 'bg-gray-100 text-gray-600', label: a.status };
  const isOverdue = a.status === 'overdue' || (a.isLate && a.status !== 'returned');

  return (
    <Link href={`/student/library-assignments/${a.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-gray-900 leading-snug flex-1">{a.assignmentTitle}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                <AlertCircle size={12} /> Late
              </span>
            )}
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </div>

        {a.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {a.subjects.map(s => (
              <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {a.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
              <Clock size={11} />
              Due {new Date(a.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {a.status === 'returned' && a.score != null && a.maxMarks != null && (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Star size={11} /> {a.score}/{a.maxMarks}
            </span>
          )}
        </div>

        {a.status === 'returned' && a.feedback && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1">
              <FileText size={11} /> Tutor Feedback
            </p>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{a.feedback}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
