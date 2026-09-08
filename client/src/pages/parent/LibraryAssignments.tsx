import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams } from 'wouter';
import { ChevronLeft, Clock, AlertCircle, FileText } from 'lucide-react';

interface AllocationSummary {
  allocationId: string;
  libraryItem: { id: string; title: string; subjects: string[] } | null;
  dueAt: string;
  status: string;
  isOverdue: boolean;
  currentAttempt: number;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Not yet released', cls: 'bg-gray-100 text-gray-500' },
  assigned: { label: 'Assigned', cls: 'bg-indigo-50 text-indigo-700' },
  in_progress: { label: 'In progress', cls: 'bg-amber-50 text-amber-700' },
  submitted: { label: 'Submitted', cls: 'bg-purple-50 text-purple-700' },
  auto_marked: { label: 'Auto-marked, awaiting review', cls: 'bg-amber-50 text-amber-700' },
  under_review: { label: 'Under review', cls: 'bg-amber-50 text-amber-700' },
  returned: { label: 'Returned', cls: 'bg-emerald-50 text-emerald-700' },
  revoked: { label: 'Revoked', cls: 'bg-gray-100 text-gray-400' },
};

export default function ParentLibraryAssignments() {
  const { user } = useAuth();
  const params = useParams<{ studentId: string }>();

  const { data: allocations = [], isLoading } = useQuery<AllocationSummary[]>({
    queryKey: [`/api/parent/students/${params.studentId}/library-assignments`],
    enabled: !!params.studentId && !!user?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-rose-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/parent" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200">Assignments</p>
            <h1 className="text-xl font-black truncate">Library Assignments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <FileText size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500 font-semibold">No assignments yet.</p>
          </div>
        ) : (
          allocations.map(a => {
            const statusInfo = STATUS_LABELS[a.status] ?? { label: a.status, cls: 'bg-gray-100 text-gray-500' };
            return (
              <Link
                key={a.allocationId}
                href={`/parent/students/${params.studentId}/library-assignments/${a.allocationId}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-rose-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.libraryItem?.title ?? 'Assignment'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(a.libraryItem?.subjects ?? []).join(', ')}</p>
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${a.isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-500'}`}>
                      <Clock size={11} /> Due {new Date(a.dueAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {a.isOverdue && ' (overdue)'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                </div>
                {a.currentAttempt > 1 && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                    <AlertCircle size={11} /> Resubmission — attempt {a.currentAttempt}
                  </p>
                )}
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}
