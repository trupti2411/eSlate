import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams } from 'wouter';
import {
  ChevronLeft, Send, DollarSign, XCircle, RefreshCw, CheckCircle,
  AlertTriangle, Clock, FileText, Bell, BellOff,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LineItem { id: string; description: string; sessions?: number; unitPrice: string; total: string; isManual: boolean; }
interface PaymentRow { id: string; amount: string; paymentDate: string; method: string; reference?: string; recordedByName?: string; }
interface InvoiceDetail {
  id: string; invoiceNumber: string; studentId: string; studentName: string; studentRoll?: string;
  parentContact?: { name: string; email: string; phone?: string };
  termId?: string; status: string; invoiceDate: string; dueDate: string;
  subtotal: string; discountAmount?: string; total: string; notes?: string;
  sentAt?: string; sentToEmail?: string; voidReason?: string;
  remindersSuppressed?: boolean; lastOverdueReminderAt?: string;
  lineItems: LineItem[]; payments: PaymentRow[]; amountPaid: number; outstanding: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Draft',          cls: 'bg-gray-100 text-gray-700' },
  sent:           { label: 'Sent',           cls: 'bg-blue-100 text-blue-700' },
  paid:           { label: 'Paid',           cls: 'bg-emerald-100 text-emerald-700' },
  partially_paid: { label: 'Partially Paid', cls: 'bg-amber-100 text-amber-700' },
  overdue:        { label: 'Overdue',        cls: 'bg-rose-100 text-rose-700' },
  void:           { label: 'Void',           cls: 'bg-gray-200 text-gray-500' },
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showVoid, setShowVoid] = useState(false);

  const { data: inv, isLoading } = useQuery<InvoiceDetail>({
    queryKey: [`/api/invoices/${id}`],
    enabled: !!id,
  });

  const resendMutation = useMutation({
    mutationFn: () => apiRequest(`/api/invoices/${id}/resend`, 'POST', {}),
    onSuccess: () => toast({ title: 'Invoice resent' }),
    onError: () => toast({ title: 'Resend failed', variant: 'destructive' }),
  });

  const suppressRemindersMutation = useMutation({
    mutationFn: (suppressed: boolean) => apiRequest(`/api/invoices/${id}/suppress-reminders`, 'PATCH', { suppressed }),
    onSuccess: (_data, suppressed) => {
      toast({ title: suppressed ? 'Overdue reminders paused' : 'Overdue reminders resumed' });
      qc.invalidateQueries({ queryKey: [`/api/invoices/${id}`] });
    },
    onError: () => toast({ title: 'Could not update reminder settings', variant: 'destructive' }),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (!inv) return <div className="min-h-screen flex items-center justify-center text-gray-500">Invoice not found</div>;

  const badge = STATUS_BADGE[inv.status] ?? { label: inv.status, cls: 'bg-gray-100 text-gray-700' };
  const paidPct = parseFloat(inv.total) > 0 ? Math.min(100, Math.round((inv.amountPaid / parseFloat(inv.total)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company/invoices" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Invoice</p>
            <h1 className="text-xl font-black">{inv.invoiceNumber}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black ${badge.cls}`}>{badge.label}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Bill To</p>
            <p className="font-bold text-gray-900">{inv.parentContact?.name ?? '—'}</p>
            <p className="text-sm text-gray-600">{inv.parentContact?.email ?? '—'}</p>
            {inv.parentContact?.phone && <p className="text-sm text-gray-600">{inv.parentContact.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Student</p>
            <p className="font-bold text-gray-900">{inv.studentName}</p>
            {inv.studentRoll && <p className="text-sm text-gray-600">Roll #{inv.studentRoll}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Dates</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">Issued:</span> {new Date(inv.invoiceDate).toLocaleDateString('en-AU')}</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">Due:</span> {new Date(inv.dueDate).toLocaleDateString('en-AU')}</p>
            {inv.sentAt && <p className="text-sm text-gray-500">Sent {new Date(inv.sentAt).toLocaleDateString('en-AU')} → {inv.sentToEmail}</p>}
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Line Items</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-2 text-left">Description</th>
                <th className="px-5 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inv.lineItems.map(li => (
                <tr key={li.id}>
                  <td className="px-5 py-3 text-gray-800">{li.description}{li.sessions ? ` (${li.sessions} sessions)` : ''}</td>
                  <td className="px-5 py-3 text-right font-semibold">${parseFloat(li.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 text-sm font-semibold">
              <tr>
                <td className="px-5 py-2 text-right text-gray-600">Subtotal</td>
                <td className="px-5 py-2 text-right">${parseFloat(inv.subtotal).toFixed(2)}</td>
              </tr>
              {parseFloat(inv.discountAmount ?? '0') > 0 && (
                <tr className="text-rose-600">
                  <td className="px-5 py-2 text-right">Discount</td>
                  <td className="px-5 py-2 text-right">-${parseFloat(inv.discountAmount!).toFixed(2)}</td>
                </tr>
              )}
              <tr className="text-base font-black">
                <td className="px-5 py-3 text-right text-gray-900">Total Due</td>
                <td className="px-5 py-3 text-right text-indigo-700">${parseFloat(inv.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment summary */}
        {inv.status !== 'draft' && inv.status !== 'void' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Payment</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${paidPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${paidPct}%` }} />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{paidPct}% paid</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm mb-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Paid</p>
                <p className="text-xl font-black text-emerald-700">${inv.amountPaid.toFixed(2)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Outstanding</p>
                <p className="text-xl font-black text-amber-700">${inv.outstanding.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total</p>
                <p className="text-xl font-black text-gray-700">${parseFloat(inv.total).toFixed(2)}</p>
              </div>
            </div>
            {inv.payments.length > 0 && (
              <table className="w-full text-sm">
                <thead className="text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="py-1 text-left">Date</th>
                    <th className="py-1 text-left">Method</th>
                    <th className="py-1 text-left">Ref</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inv.payments.map(p => (
                    <tr key={p.id}>
                      <td className="py-1.5 text-gray-700">{new Date(p.paymentDate).toLocaleDateString('en-AU')}</td>
                      <td className="py-1.5 text-gray-600 capitalize">{p.method.replace(/_/g, ' ')}</td>
                      <td className="py-1.5 text-gray-500 text-xs">{p.reference ?? '—'}</td>
                      <td className="py-1.5 text-right font-semibold text-emerald-700">${parseFloat(p.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {inv.status === 'draft' && (
            <button onClick={() => setShowSend(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <Send size={14} /> Send Invoice
            </button>
          )}
          {['sent', 'partially_paid', 'overdue'].includes(inv.status) && (
            <>
              <button onClick={() => setShowPayment(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <DollarSign size={14} /> Record Payment
              </button>
              <button onClick={() => resendMutation.mutate()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <RefreshCw size={14} /> Resend
              </button>
              <button
                onClick={() => suppressRemindersMutation.mutate(!inv.remindersSuppressed)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                title={inv.remindersSuppressed ? 'Overdue reminder emails are paused for this invoice' : 'Pause automatic overdue reminder emails (e.g. payment plan agreed)'}
              >
                {inv.remindersSuppressed ? <BellOff size={14} /> : <Bell size={14} />}
                {inv.remindersSuppressed ? 'Resume Reminders' : 'Pause Reminders'}
              </button>
            </>
          )}
          {inv.status !== 'void' && inv.status !== 'paid' && (
            <button onClick={() => setShowVoid(true)} className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <XCircle size={14} /> Void Invoice
            </button>
          )}
        </div>
      </main>

      {showSend && <SendModal invoiceId={id!} defaultEmail={inv.parentContact?.email} onClose={() => setShowSend(false)}
        onSent={() => { setShowSend(false); qc.invalidateQueries({ queryKey: [`/api/invoices/${id}`] }); }} />}
      {showPayment && <PaymentModal invoiceId={id!} onClose={() => setShowPayment(false)}
        onRecorded={() => { setShowPayment(false); qc.invalidateQueries({ queryKey: [`/api/invoices/${id}`] }); }} />}
      {showVoid && <VoidModal invoiceId={id!} onClose={() => setShowVoid(false)}
        onVoided={() => { setShowVoid(false); qc.invalidateQueries({ queryKey: [`/api/invoices/${id}`] }); }} />}
    </div>
  );
}

function SendModal({ invoiceId, defaultEmail, onClose, onSent }: { invoiceId: string; defaultEmail?: string; onClose: () => void; onSent: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [cc, setCc] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!email) { toast({ title: 'Email required', variant: 'destructive' }); return; }
    setSending(true);
    setError('');
    try {
      const ccEmails = cc.split(',').map(e => e.trim()).filter(Boolean);
      await apiRequest(`/api/invoices/${invoiceId}/send`, 'POST', { recipientEmail: email, ccEmails });
      onSent();
    } catch (e: any) {
      setError(e?.message ?? 'Send failed. Please try again.');
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black">Send Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="p-5 space-y-3">
          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="parent@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CC (optional)</label>
            <input value={cc} onChange={e => setCc(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="comma-separated emails" />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
          <button onClick={send} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
            {sending ? 'Sending…' : 'Confirm & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ invoiceId, onClose, onRecorded }: { invoiceId: string; onClose: () => void; onRecorded: () => void }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!amount || parseFloat(amount) <= 0) { toast({ title: 'Enter a valid amount', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await apiRequest(`/api/invoices/${invoiceId}/payments`, 'POST', { amount, method, reference, paymentDate });
      onRecorded();
    } catch { toast({ title: 'Failed to record payment', variant: 'destructive' }); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount ($)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Date</label>
            <input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reference (optional)</label>
            <input value={reference} onChange={e => setReference(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="TXN-12345" />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
          <button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VoidModal({ invoiceId, onClose, onVoided }: { invoiceId: string; onClose: () => void; onVoided: () => void }) {
  const { toast } = useToast();
  const [reason, setReason] = useState('Other');
  const [voiding, setVoiding] = useState(false);

  async function doVoid() {
    setVoiding(true);
    try {
      await apiRequest(`/api/invoices/${invoiceId}/void`, 'PATCH', { voidReason: reason });
      onVoided();
    } catch { toast({ title: 'Failed to void', variant: 'destructive' }); }
    setVoiding(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-black text-rose-700">Void Invoice</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-700">Voiding will cancel the outstanding amount. This cannot be undone.</p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option>Duplicate</option>
              <option>Error</option>
              <option>Student Withdrew</option>
              <option>Payment Plan</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
          <button onClick={doVoid} disabled={voiding} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
            {voiding ? 'Voiding…' : 'Void Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
