import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Users, Building2, Bell, LogOut, ArrowLeft, UserPlus, ShieldCheck, ShieldAlert,
  Mail, X, Save, Search,
} from 'lucide-react';

interface AdminProfile {
  userId: string;
  companyId: string;
  companyName: string;
  tier?: string;
  businessType?: string;
}

const TIER_CAP: Record<string, number | null> = {
  individual: 1, starter: 5, pro: 20, enterprise: null,
};
interface Tutor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: 'invited' | 'pending_compliance' | 'active' | string;
  complianceStatus?: 'compliant' | 'pending_compliance' | 'compliance_hold' | string;
  wwccExpiry?: string | null;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function daysUntil(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return null;
  const expiry = new Date(m[1] + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  return Math.round((expiry - today) / 86400000);
}

export default function Staff() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: tutors = [], isLoading } = useQuery<Tutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tutors;
    return tutors.filter(t =>
      `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(q)
    );
  }, [tutors, search]);

  const counts = useMemo(() => {
    const compliant = tutors.filter(t => t.complianceStatus === 'compliant').length;
    const pending = tutors.filter(t => t.complianceStatus === 'pending_compliance').length;
    const hold = tutors.filter(t => t.complianceStatus === 'compliance_hold').length;
    return { total: tutors.length, compliant, pending, hold };
  }, [tutors]);

  const tier = adminProfile?.tier;
  const cap = tier ? TIER_CAP[tier] : undefined;
  const atCap = cap != null && tutors.length >= cap;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Staff</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName ?? 'Loading…'}</h1>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiTile
            value={counts.total}
            label={cap != null ? `of ${cap} · ${tier ?? ''}` : tier ? `${tier} tier` : 'Total'}
            tone={atCap ? 'amber' : 'indigo'}
          />
          <KpiTile value={counts.compliant} label="Compliant" tone="emerald" />
          <KpiTile value={counts.pending} label="Pending" tone="amber" />
          <KpiTile value={counts.hold} label="On hold" tone="rose" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            disabled={atCap}
            title={atCap ? `${tier} tier limit reached (${cap} tutors). Upgrade to invite more.` : undefined}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <UserPlus size={14} /> {atCap ? 'Tier limit reached' : 'Invite tutor'}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : tutors.length === 0 ? (
          <EmptyState onInvite={() => setInviteOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No tutors match "{search}".
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((t) => <TutorRow key={t.id} t={t} />)}
          </ul>
        )}
      </main>

      {inviteOpen && companyId && (
        <InviteModal
          businessId={companyId}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

const TONE = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700' },
} as const;

function KpiTile({ value, label, tone }: { value: number; label: string; tone: keyof typeof TONE }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-2xl border ${t.bg} ${t.border} p-4 text-center`}>
      <p className={`text-2xl sm:text-3xl font-black ${t.text}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${t.text}`}>{label}</p>
    </div>
  );
}

function TutorRow({ t }: { t: Tutor }) {
  const fullName = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email;
  const initials = fullName.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'T';
  const wwccDays = daysUntil(t.wwccExpiry);
  const expiringSoon = t.complianceStatus === 'compliant' && wwccDays !== null && wwccDays <= 30;

  let badge: { label: string; tone: 'green' | 'amber' | 'red' } = { label: 'Active', tone: 'green' };
  if (t.complianceStatus === 'compliance_hold') badge = { label: 'On hold', tone: 'red' };
  else if (t.complianceStatus === 'pending_compliance' || t.status === 'invited') badge = { label: 'Pending', tone: 'amber' };
  else if (expiringSoon) badge = { label: `Expires in ${wwccDays}d`, tone: 'amber' };

  const palette = {
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-rose-100 text-rose-800',
  }[badge.tone];

  const Icon = badge.tone === 'green' ? ShieldCheck : ShieldAlert;

  return (
    <li className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate">{fullName}</p>
        <p className="text-xs text-gray-500 truncate">{t.email}</p>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full inline-flex items-center gap-1 ${palette}`}>
          <Icon size={10} /> {badge.label}
        </span>
        {t.wwccExpiry && (
          <span className="text-[10px] text-gray-500">WWCC {formatDate(t.wwccExpiry)}</span>
        )}
      </div>
    </li>
  );
}

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
        <Users size={22} />
      </div>
      <h2 className="text-lg font-black text-gray-900">No tutors yet</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        Invite a tutor by email — they'll set their password and capture their WWCC in one step.
      </p>
      <button
        onClick={onInvite}
        className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
      >
        <UserPlus size={14} /> Invite your first tutor
      </button>
    </div>
  );
}

function InviteModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/businesses/${businessId}/tutors/invite`, 'POST', {
        first_name: firstName,
        last_name: lastName,
        email,
      }),
    onSuccess: () => {
      toast({ title: 'Invitation sent', description: `${firstName} will receive a setup link.` });
      qc.invalidateQueries({ queryKey: [`/api/companies/${businessId}/tutors`] });
      onClose();
    },
    onError: (e: any) => {
      // Tier-cap rejection comes back as 422 with a message — surface it.
      toast({ title: 'Could not invite', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const valid = firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black flex items-center gap-2">
            <UserPlus size={16} className="text-indigo-600" /> Invite a tutor
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </Field>
            <Field label="Last name">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </div>
          <Field label="Email">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <Mail size={14} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tutor@example.com"
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
            </div>
          </Field>
          <p className="text-xs text-gray-500">
            The invite expires after 7 days. Tutors set their password and capture their WWCC inline.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => m.mutate()}
            disabled={!valid || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {m.isPending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
