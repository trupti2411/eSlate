import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { ChevronLeft, AlertCircle, CheckCircle, Edit2 } from 'lucide-react';

interface MarkingItem {
  id: string;
  studentName: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  isLate: boolean;
  provisionalScore: number | null;
  maxMarks: number | null;
  status: 'submitted' | 'auto_marked' | 'under_review';
}

const STATUS_BADGE: Record<string, string> = {
  submitted:    'bg-blue-100 text-blue-700',
  auto_marked:  'bg-amber-100 text-amber-700',
  under_review: 'bg-purple-100 text-purple-700',
};

export default function LibraryMarkingQueue() {
  const { user } = useAuth();

  const { data: items = [], isLoading } = useQuery<MarkingItem[]>({
    queryKey: ['/api/me/marking-queue'],
    enabled: !!user?.id,
  });

  const submitted = items.filter(i => i.status === 'submitted').length;
  const autoMarked = items.filter(i => i.status === 'auto_marked').length;
  const inReview = items.filter(i => i.status === 'under_review').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Marking</p>
            <h1 className="text-xl font-black">Marking Queue</h1>
          </div>
          <span className="bg-white/15 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
            {items.length} submission{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary strip */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Awaiting Mark', value: submitted, cls: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'AI Pre-marked', value: autoMarked, cls: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'In Review', value: inReview, cls: 'text-purple-700', bg: 'bg-purple-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            Loading submissions…
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCircle size={40} className="text-green-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">All clear!</p>
            <p className="text-sm text-gray-400 mt-1">No submissions awaiting review.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Assignment</th>
                  <th className="px-5 py-3 text-left">Class</th>
                  <th className="px-5 py-3 text-left">Submitted</th>
                  <th className="px-5 py-3 text-center">Timing</th>
                  <th className="px-5 py-3 text-right">Score</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{item.studentName}</td>
                    <td className="px-5 py-3 text-gray-700 max-w-[200px]">
                      <span className="block truncate">{item.assignmentTitle}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{item.className}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(item.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {item.isLate ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-semibold">
                          <AlertCircle size={12} /> Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <CheckCircle size={12} /> On time
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {item.provisionalScore != null ? (
                        <span className="text-amber-700">
                          {item.provisionalScore}{item.maxMarks != null ? `/${item.maxMarks}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/company/library-marking/${item.id}`}
                        className="inline-flex bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg items-center gap-1.5 transition-colors"
                      >
                        <Edit2 size={11} /> Mark
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
