import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  GraduationCap, Bell, LogOut, ShieldCheck, ShieldAlert, ShieldX,
  ArrowLeft, Mail, Building2, Briefcase, BookOpen, ChevronRight,
  Save, Upload, Download, FileCheck2, X,
} from 'lucide-react';
import { withBase, authHeaders } from '@/lib/queryClient';

type ComplianceStatus = 'compliant' | 'pending_compliance' | 'compliance_hold' | string;

interface TutorProfile {
  id: string;
  business: { id: string; name: string; type: string; tier: string; state_code: string } | null;
  name: string | null;
  email: string | null;
  bio: string | null;
  hourly_rate: number | string | null;
  qualifications: string[] | null;
  delivery_modes: string[] | null;
  year_levels: string[] | null;
  wwcc_number: string | null;
  wwcc_expiry: string | null;
  wwcc_state: string | null;
  wwcc_certificate_uploaded?: boolean;
  wwcc_certificate_original_name?: string | null;
  wwcc_certificate_uploaded_at?: string | null;
  compliance_status: ComplianceStatus;
  status: string;
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

export default function TutorProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<TutorProfile>({
    queryKey: ['/api/me/tutor-profile'],
    enabled: !!user,
  });

  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '');
      setHourlyRate(profile.hourly_rate != null ? String(profile.hourly_rate) : '');
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/me/tutor-profile', 'PATCH', {
        bio: bio || null,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      }),
    onSuccess: () => {
      toast({ title: 'Profile saved' });
      queryClient.invalidateQueries({ queryKey: ['/api/me/tutor-profile'] });
    },
    onError: (e: any) => toast({ title: 'Save failed', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const wwccDays = useMemo(() => daysUntil(profile?.wwcc_expiry), [profile?.wwcc_expiry]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Tutor Portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">My Profile</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/tutor" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
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
        {isLoading || !profile ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading profile…
          </div>
        ) : (
          <>
            {/* Identity card */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-black flex-shrink-0">
                  {(profile.name ?? profile.email ?? 'T').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-gray-900 truncate">{profile.name ?? '—'}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Mail size={14} /> {profile.email}</span>
                    {profile.business && (
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} />
                        {profile.business.name}
                        <span className="text-gray-400">·</span>
                        <span className="text-xs uppercase tracking-wide font-bold text-gray-500">
                          {profile.business.type === 'individual' ? 'Solo' : 'Multi-tutor'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={profile.status} />
              </div>
            </section>

            {/* WWCC compliance */}
            <WwccCard profile={profile} wwccDays={wwccDays} />

            {/* Editable: bio + rate */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Teaching profile</h3>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Save size={12} /> {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    placeholder="A short bio your students and their parents will see."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Hourly rate (AUD)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                      placeholder="e.g. 60"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Read-only summary lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ListCard icon={<Briefcase size={16} />} title="Qualifications" items={profile.qualifications} empty="None added yet" />
              <ListCard icon={<BookOpen size={16} />} title="Year levels" items={profile.year_levels} empty="None set" />
              <ListCard icon={<ChevronRight size={16} />} title="Delivery modes" items={profile.delivery_modes} empty="In-person / online — not set" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function WwccCard({ profile, wwccDays }: { profile: TutorProfile; wwccDays: number | null }) {
  const compliant = profile.compliance_status === 'compliant';
  const onHold = profile.compliance_status === 'compliance_hold';
  const pending = profile.compliance_status === 'pending_compliance';
  const hasCert = !!profile.wwcc_certificate_uploaded;

  const expiringSoon = compliant && wwccDays !== null && wwccDays <= 30;

  let tone: 'green' | 'amber' | 'red' = 'green';
  if (onHold) tone = 'red';
  else if (pending || expiringSoon || !hasCert) tone = 'amber';

  const palette = {
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', sub: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', sub: 'text-amber-700', icon: 'bg-amber-100 text-amber-700' },
    red: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', sub: 'text-rose-700', icon: 'bg-rose-100 text-rose-700' },
  }[tone];

  const Icon = tone === 'green' ? ShieldCheck : tone === 'amber' ? ShieldAlert : ShieldX;
  const headline = onHold
    ? 'WWCC on hold — update required'
    : pending
    ? 'WWCC pending — capture required'
    : !hasCert
    ? 'WWCC certificate missing — please upload'
    : expiringSoon
    ? `WWCC expires in ${wwccDays} day${wwccDays === 1 ? '' : 's'}`
    : 'WWCC active';

  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <section className={`rounded-2xl border ${palette.border} ${palette.bg} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${palette.icon} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Working With Children Check</p>
            <h3 className={`text-lg font-black mt-0.5 ${palette.text}`}>{headline}</h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Number</p>
                <p className={`mt-0.5 font-mono font-semibold ${palette.text}`}>
                  {profile.wwcc_number ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Expiry</p>
                <p className={`mt-0.5 font-semibold ${palette.text}`}>
                  {profile.wwcc_expiry ? formatDate(profile.wwcc_expiry) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Issuing state</p>
                <p className={`mt-0.5 font-semibold ${palette.text}`}>{profile.wwcc_state ?? '—'}</p>
              </div>
            </div>

            {/* Certificate row */}
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Certificate</span>
              {hasCert ? (
                <>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${palette.sub}`}>
                    <FileCheck2 size={14} />
                    {profile.wwcc_certificate_original_name ?? 'on file'}
                    {profile.wwcc_certificate_uploaded_at && (
                      <span className="text-gray-500 font-normal">
                        · uploaded {formatDate(profile.wwcc_certificate_uploaded_at)}
                      </span>
                    )}
                  </span>
                  <a
                    href={withBase('/api/me/wwcc-certificate')}
                    onClick={async (e) => {
                      // Need to send Authorization header — fetch then trigger download.
                      e.preventDefault();
                      const r = await fetch(withBase('/api/me/wwcc-certificate'), { headers: authHeaders() });
                      if (!r.ok) return;
                      const blob = await r.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = profile.wwcc_certificate_original_name ?? 'wwcc-certificate';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg"
                  >
                    <Download size={12} /> Download
                  </a>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <ShieldAlert size={12} /> No certificate on file
                </span>
              )}
              <button
                onClick={() => setShowDialog(true)}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
              >
                <Upload size={12} /> {hasCert ? 'Update WWCC' : 'Upload WWCC'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showDialog && <WwccUpdateDialog profile={profile} onClose={() => setShowDialog(false)} />}
    </>
  );
}

function WwccUpdateDialog({ profile, onClose }: { profile: TutorProfile; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [number, setNumber] = useState(profile.wwcc_number ?? '');
  const [expiry, setExpiry] = useState(profile.wwcc_expiry ?? '');
  const [state, setState] = useState(profile.wwcc_state ?? 'NSW');
  const [file, setFile] = useState<File | null>(null);

  const minExpiry = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const m = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('wwcc_number', number);
      fd.append('wwcc_expiry', expiry);
      fd.append('wwcc_state', state);
      if (file) fd.append('wwcc_certificate', file);
      return apiRequest('/api/me/wwcc', 'POST', fd);
    },
    onSuccess: () => {
      toast({ title: 'WWCC updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/me/tutor-profile'] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const valid = number.trim() && expiry && state.length === 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mt-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Working With Children Check</p>
            <h2 className="text-lg font-black text-gray-900 mt-0.5">Update WWCC</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Number</label>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. WWCC1234567E"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Expiry</label>
              <input
                type="date"
                value={expiry}
                min={minExpiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">≥30 days from today</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">State</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                maxLength={3}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Certificate {profile.wwcc_certificate_uploaded ? '(replace)' : '(upload)'}
            </label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/heic,image/heif,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-bold hover:file:bg-indigo-100"
            />
            <p className="text-[10px] text-gray-500 mt-1">PDF / JPG / PNG / HEIC, max 8 MB. Stored privately.</p>
            {file && (
              <p className="text-xs text-emerald-700 mt-1.5">✓ {file.name} ({Math.round(file.size / 1024)} KB)</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => m.mutate()}
            disabled={!valid || m.isPending}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Save size={12} /> {m.isPending ? 'Saving…' : 'Save WWCC'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListCard({
  icon, title, items, empty,
}: { icon: React.ReactNode; title: string; items: string[] | null; empty: string }) {
  const list = items ?? [];
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</span>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</h3>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {list.map((it, i) => (
            <li key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
              {it}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
