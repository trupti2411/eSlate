import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { ChevronLeft, Download, TrendingUp, DollarSign, AlertTriangle, Clock } from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface Term { id: string; name: string; startDate: string; endDate: string; }
interface CourseRow { courseName: string; expected: number; collected: number; outstanding: number; }
interface InvoiceRow { id: string; invoiceNumber: string; studentName: string; status: string; total: string; amountPaid: number; outstanding: number; dueDate: string; }
interface RevenueData {
  metrics: { expectedRevenue: number; invoicedRevenue: number; collectedRevenue: number; outstandingRevenue: number; overdueRevenue: number; };
  byCourse: CourseRow[];
  invoices: InvoiceRow[];
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700', partially_paid: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700', void: 'bg-gray-200 text-gray-400',
};

export default function Revenue() {
  const { user } = useAuth();
  const [termId, setTermId] = useState('');

  const { data: adminProfile } = useQuery<AdminProfile>({ queryKey: [`/api/admin/company-admin/${user?.id}`], enabled: !!user?.id });
  const companyId = adminProfile?.companyId;

  const { data: terms = [] } = useQuery<Term[]>({ queryKey: [`/api/companies/${companyId}/terms`], enabled: !!companyId });
  const { data, isLoading } = useQuery<RevenueData>({
    queryKey: [`/api/companies/${companyId}/reports/revenue`, termId],
    queryFn: async () => {
      const params = termId ? `?term_id=${termId}` : '';
      const res = await fetch(`/api/companies/${companyId}/reports/revenue${params}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const m = data?.metrics;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Reports</p>
            <h1 className="text-xl font-black">Revenue</h1>
          </div>
          <select value={termId} onChange={e => setTermId(e.target.value)} className="bg-white/15 text-white text-sm font-semibold rounded-xl px-3 py-2 border border-white/20">
            <option value="">All Terms</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <a href={`/api/export/invoices${termId ? `?term_id=${termId}` : ''}`} target="_blank" rel="noopener noreferrer"
            className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2">
            <Download size={14} /> Export CSV
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Expected', value: m?.expectedRevenue, icon: <TrendingUp size={16} />, cls: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'Invoiced',   value: m?.invoicedRevenue,   icon: <DollarSign size={16} />,    cls: 'text-blue-700',    bg: 'bg-blue-50' },
            { label: 'Collected',  value: m?.collectedRevenue,  icon: <DollarSign size={16} />,    cls: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Outstanding',value: m?.outstandingRevenue,icon: <Clock size={16} />,         cls: 'text-amber-700',   bg: 'bg-amber-50' },
            { label: 'Overdue',    value: m?.overdueRevenue,    icon: <AlertTriangle size={16} />, cls: 'text-rose-700',    bg: 'bg-rose-50' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.cls} flex items-center justify-center mb-2`}>{card.icon}</div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
              {isLoading ? <div className="h-7 bg-gray-100 rounded animate-pulse mt-1" /> :
                <p className={`text-2xl font-black ${card.cls}`}>${(card.value ?? 0).toFixed(2)}</p>}
            </div>
          ))}
        </div>

        {/* By course */}
        {data?.byCourse && data.byCourse.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Revenue by Course</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2 text-left">Course</th>
                  <th className="px-5 py-2 text-right">Expected</th>
                  <th className="px-5 py-2 text-right">Collected</th>
                  <th className="px-5 py-2 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byCourse.map(row => (
                  <tr key={row.courseName} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-800">{row.courseName}</td>
                    <td className="px-5 py-3 text-right">${row.expected.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-emerald-700">${row.collected.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-amber-700">${row.outstanding.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoice list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">All Invoices</h3>
            <span className="text-sm text-gray-500">{data?.invoices?.length ?? 0} invoices</span>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : !data?.invoices?.length ? (
            <div className="p-8 text-center text-gray-400">No invoices found for this period.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2 text-left">Invoice #</th>
                  <th className="px-5 py-2 text-left">Student</th>
                  <th className="px-5 py-2 text-left">Due</th>
                  <th className="px-5 py-2 text-right">Total</th>
                  <th className="px-5 py-2 text-right">Paid</th>
                  <th className="px-5 py-2 text-right">Outstanding</th>
                  <th className="px-5 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-indigo-700">
                      <Link href={`/company/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{inv.studentName}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(inv.dueDate).toLocaleDateString('en-AU')}</td>
                    <td className="px-5 py-3 text-right">${parseFloat(inv.total).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-emerald-700">${(inv.amountPaid ?? 0).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-amber-700">${(inv.outstanding ?? 0).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
