import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import {
  FileText, Plus, Send, DollarSign, CheckCircle, AlertTriangle, XCircle,
  Clock, Download, ChevronLeft, Trash2, RefreshCw, Users,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface Term { id: string; name: string; startDate: string; endDate: string; }
interface Student { id: string; firstName?: string; lastName?: string; yearGroupCode?: string; rollNumber?: string; }
interface Invoice {
  id: string; invoiceNumber: string; studentId: string; studentName: string;
  termId?: string; status: string; invoiceDate: string; dueDate: string;
  subtotal: string; total: string; amountPaid: number; outstanding: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Draft',          cls: 'bg-gray-100 text-gray-700' },
  sent:           { label: 'Sent',           cls: 'bg-blue-100 text-blue-700' },
  paid:           { label: 'Paid',           cls: 'bg-emerald-100 text-emerald-700' },
  partially_paid: { label: 'Partial',        cls: 'bg-amber-100 text-amber-700' },
  overdue:        { label: 'Overdue',        cls: 'bg-rose-100 text-rose-700' },
  void:           { label: 'Void',           cls: 'bg-gray-200 text-gray-500 line-through' },
};

export default function Invoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const [statusFilter, setStatusFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const { data: adminProfile } = useQuery<AdminProfile>({ queryKey: [`/api/admin/company-admin/${user?.id}`], enabled: !!user?.id });
  const companyId = adminProfile?.companyId;

  const { data: terms = [] } = useQuery<Term[]>({ queryKey: [`/api/companies/${companyId}/terms`], enabled: !!companyId });
  const { data: invoiceList = [], isLoading } = useQuery<Invoice[]>({
    queryKey: [`/api/companies/${companyId}/invoices`, statusFilter, termFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (termFilter) params.set('term_id', termFilter);
      const res = await fetch(`/api/companies/${companyId}/invoices?${params}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const sendMutation = useMutation({
    mutationFn: (invoiceId: string) => apiRequest('POST', `/api/invoices/${invoiceId}/send`, {}),
    onSuccess: () => { toast({ title: 'Invoice sent' }); qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/invoices`] }); },
    onError: () => toast({ title: 'Failed to send', variant: 'destructive' }),
  });

  const voidMutation = useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason: string }) =>
      apiRequest('PATCH', `/api/invoices/${invoiceId}/void`, { voidReason: reason }),
    onSuccess: () => { toast({ title: 'Invoice voided' }); qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/invoices`] }); },
    onError: () => toast({ title: 'Failed to void invoice', variant: 'destructive' }),
  });

  const total = invoiceList.reduce((s, i) => s + parseFloat(i.total), 0);
  const collected = invoiceList.reduce((s, i) => s + (i.amountPaid ?? 0), 0);
  const outstanding = invoiceList.reduce((s, i) => s + (i.outstanding ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Billing</p>
            <h1 className="text-xl font-black">Invoices</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setShowBulk(true)} className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2">
              <Users size={14} /> Bulk Generate
            </button>
            <button onClick={() => setShowCreate(true)} className="bg-white text-indigo-700 text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2">
              <Plus size={14} /> New Invoice
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Invoiced', value: `$${total.toFixed(2)}`, icon: <FileText size={16} />, cls: 'text-indigo-700' },
            { label: 'Collected',      value: `$${collected.toFixed(2)}`, icon: <CheckCircle size={16} />, cls: 'text-emerald-700' },
            { label: 'Outstanding',    value: `$${outstanding.toFixed(2)}`, icon: <AlertTriangle size={16} />, cls: 'text-amber-700' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`${m.cls} flex items-center gap-2 mb-1`}>{m.icon}<span className="text-xs font-bold uppercase tracking-wide">{m.label}</span></div>
              <p className={`text-2xl font-black ${m.cls}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={termFilter} onChange={e => setTermFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">All terms</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <a href={`/api/export/invoices${termFilter ? `?term_id=${termFilter}` : ''}`} target="_blank" rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl flex items-center gap-1">
              <Download size={14} /> Export CSV
            </a>
          </div>
        </div>

        {/* Invoice list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading invoices…</div>
          ) : invoiceList.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No invoices yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first invoice or use Bulk Generate at the start of a term.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoiceList.map(inv => {
                  const badge = STATUS_BADGE[inv.status] ?? { label: inv.status, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-indigo-700">
                        <Link href={`/company/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="px-4 py-3">{inv.studentName}</td>
                      <td className="px-4 py-3 text-gray-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-AU') : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">${parseFloat(inv.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">${(inv.amountPaid ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          {inv.status === 'draft' && (
                            <button onClick={() => sendMutation.mutate(inv.id)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded" title="Send invoice">
                              <Send size={14} />
                            </button>
                          )}
                          {['sent', 'partially_paid', 'overdue'].includes(inv.status) && (
                            <Link href={`/company/invoices/${inv.id}`} className="text-emerald-600 hover:text-emerald-800 p-1 rounded" title="Record payment">
                              <DollarSign size={14} />
                            </Link>
                          )}
                          {inv.status !== 'void' && (
                            <button onClick={() => { if (window.confirm('Void this invoice?')) voidMutation.mutate({ invoiceId: inv.id, reason: 'Other' }); }}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded" title="Void">
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showCreate && companyId && (
        <CreateInvoiceModal companyId={companyId} terms={terms} onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/invoices`] }); }} />
      )}
      {showBulk && companyId && (
        <BulkInvoiceModal companyId={companyId} terms={terms} onClose={() => setShowBulk(false)}
          onDone={() => { setShowBulk(false); qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/invoices`] }); }} />
      )}
    </div>
  );
}

function CreateInvoiceModal({ companyId, terms, onClose, onCreated }: { companyId: string; terms: Term[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const { data: students = [] } = useQuery<Student[]>({ queryKey: [`/api/companies/${companyId}/students`] });
  const [studentId, setStudentId] = useState('');
  const [termId, setTermId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [lines, setLines] = useState([{ description: '', unitPrice: '', total: '', isManual: true }]);
  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  const subtotal = lines.reduce((s, l) => s + parseFloat(l.total || '0'), 0);
  const disc = parseFloat(discount || '0');
  const total = Math.max(0, subtotal - disc);

  async function handleCreate() {
    if (!studentId) { toast({ title: 'Select a student', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await apiRequest('POST', `/api/companies/${companyId}/invoices`, {
        studentId, termId: termId || undefined,
        dueDate, lineItems: lines.map(l => ({ ...l, unitPrice: l.unitPrice, total: l.total })),
        discountAmount: discount || '0',
      });
      onCreated();
    } catch { toast({ title: 'Failed to create invoice', variant: 'destructive' }); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-lg">Generate Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Student</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="">Select student…</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}{s.rollNumber ? ` (#${s.rollNumber})` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Term</label>
              <select value={termId} onChange={e => setTermId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="">— none —</option>
                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Line Items</label>
              <button onClick={() => setLines([...lines, { description: '', unitPrice: '', total: '', isManual: true }])}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">+ Add line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <input placeholder="Description" value={l.description} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                    className="col-span-3 border border-gray-200 rounded-xl px-2 py-1.5 text-sm" />
                  <input placeholder="Amount" type="number" value={l.unitPrice} onChange={e => { const v = e.target.value; setLines(lines.map((x, j) => j === i ? { ...x, unitPrice: v, total: v } : x)); }}
                    className="border border-gray-200 rounded-xl px-2 py-1.5 text-sm" />
                  <button onClick={() => setLines(lines.filter((_, j) => j !== i))} className="text-gray-400 hover:text-rose-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Discount</label>
            <input placeholder="$0.00" type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-28 border border-gray-200 rounded-xl px-2 py-1.5 text-sm" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {disc > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span>-${disc.toFixed(2)}</span></div>}
            <div className="flex justify-between font-black text-base border-t border-gray-200 pt-1"><span>Total Due</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
            {saving ? 'Creating…' : 'Save as Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkInvoiceModal({ companyId, terms, onClose, onDone }: { companyId: string; terms: Term[]; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [termId, setTermId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const { data: students = [] } = useQuery<any[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  async function handleGenerate() {
    if (!termId) { toast({ title: 'Select a term', variant: 'destructive' }); return; }
    if (selectedStudents.size === 0) { toast({ title: 'Select at least one student', variant: 'destructive' }); return; }
    setGenerating(true);
    try {
      const res = await apiRequest('POST', `/api/companies/${companyId}/invoices/bulk`, {
        termId, studentIds: Array.from(selectedStudents), dueDate, skipExisting: true,
      }) as any;
      setResult({ created: res.created, skipped: res.skipped });
      setStep(3);
    } catch { toast({ title: 'Bulk generation failed', variant: 'destructive' }); }
    setGenerating(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-lg">Bulk Invoice Generation — Step {step} of 3</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600">Select a term to generate invoices for all enrolled students.</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Term</label>
                <select value={termId} onChange={e => setTermId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="">Select term…</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-600">Select students to include. Students already invoiced for this term are excluded by default.</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{selectedStudents.size} of {students.length} selected</span>
                <button onClick={() => setSelectedStudents(new Set(students.map((s: any) => s.id)))} className="text-xs text-indigo-600 font-semibold">Select all</button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2">
                {students.map((s: any) => (
                  <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={selectedStudents.has(s.id)} onChange={e => {
                      const next = new Set(selectedStudents);
                      e.target.checked ? next.add(s.id) : next.delete(s.id);
                      setSelectedStudents(next);
                    }} className="rounded" />
                    <span className="text-sm">{s.firstName} {s.lastName}{s.rollNumber ? ` (#${s.rollNumber})` : ''}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          {step === 3 && result && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-xl font-black text-gray-900">{result.created} invoices generated</p>
              <p className="text-sm text-gray-500 mt-1">{result.skipped} students skipped (already invoiced)</p>
              <p className="text-sm text-gray-600 mt-3">Review and send invoices from the Invoices list.</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          {step < 3 && <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>}
          {step === 1 && <button onClick={() => setStep(2)} disabled={!termId} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">Next: Select Students →</button>}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">← Back</button>
              <button onClick={handleGenerate} disabled={generating || selectedStudents.size === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
                {generating ? 'Generating…' : `Generate ${selectedStudents.size} Invoices`}
              </button>
            </>
          )}
          {step === 3 && <button onClick={onDone} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold">View Invoices</button>}
        </div>
      </div>
    </div>
  );
}
