import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings as SettingsIcon, Bell, LogOut, ArrowLeft, Save, Building2,
  BookOpen, Check, Globe, Hash, Image,
} from 'lucide-react';

interface AdminProfile {
  userId: string;
  companyId: string;
  companyName: string;
  tier?: string;
  businessType?: string;
}
interface BusinessProfile {
  id: number;
  type: 'individual' | 'multi_tutor';
  name: string;
  legal_name?: string | null;
  logo?: string | null;
  abn?: string | null;
  state_code: string;
  timezone?: string | null;
  currency?: string | null;
  tier?: string;
  pack_version?: string | null;
  active_subject_ids: number[];
}
interface SubjectRow { id: number; code: string; name: string; state_code?: string; }

const TIMEZONES = [
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
  'Australia/Adelaide', 'Australia/Perth', 'Australia/Hobart',
  'Australia/Darwin',
];

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: [`/api/businesses/${companyId}`],
    enabled: !!companyId,
  });

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <SettingsIcon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Settings</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{profile?.name ?? 'Loading…'}</h1>
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
        {isLoading || !profile || !companyId ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : (
          <>
            <BusinessProfileSection businessId={companyId} profile={profile} />
            <SubjectsSection businessId={companyId} profile={profile} subjects={subjects} />
            <PlanSection profile={profile} />
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function BusinessProfileSection({
  businessId, profile,
}: { businessId: string; profile: BusinessProfile }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState(profile.name ?? '');
  const [legalName, setLegalName] = useState(profile.legal_name ?? '');
  const [abn, setAbn] = useState(profile.abn ?? '');
  const [logo, setLogo] = useState(profile.logo ?? '');
  const [timezone, setTimezone] = useState(profile.timezone ?? 'Australia/Sydney');
  const [currency, setCurrency] = useState(profile.currency ?? 'AUD');

  useEffect(() => {
    setName(profile.name ?? '');
    setLegalName(profile.legal_name ?? '');
    setAbn(profile.abn ?? '');
    setLogo(profile.logo ?? '');
    setTimezone(profile.timezone ?? 'Australia/Sydney');
    setCurrency(profile.currency ?? 'AUD');
  }, [profile]);

  const isMultiTutor = profile.type === 'multi_tutor';

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/businesses/${businessId}`, 'PATCH', {
        name: name.trim(),
        legal_name: legalName.trim() || null,
        abn: abn.trim() || null,
        logo: logo.trim() || null,
        timezone,
        currency,
      }),
    onSuccess: () => {
      toast({ title: 'Business profile saved' });
      qc.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
      qc.invalidateQueries({ queryKey: [`/api/admin/company-admin/${profile.id}`] });
    },
    onError: (e: any) => {
      toast({ title: 'Could not save', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const valid = name.trim().length >= 2 && (!isMultiTutor || abn.trim().length > 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <SectionHeader icon={<Building2 size={16} className="text-indigo-600" />} title="Business profile" />
      <div className="p-5 space-y-4">
        <Field label="Business name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>
        <Field label="Legal name (optional)" hint="Used on invoices if different from your trading name.">
          <input
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="e.g. Acme Tutoring Pty Ltd"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>
        <Field label={`ABN${isMultiTutor ? '' : ' (optional)'}`} required={isMultiTutor}>
          <IconInput icon={<Hash size={14} />}>
            <input
              value={abn}
              onChange={(e) => setAbn(e.target.value)}
              placeholder="e.g. 12 345 678 901"
              className="w-full bg-transparent focus:outline-none text-sm"
            />
          </IconInput>
        </Field>
        <Field label="Logo URL (optional)" hint="Direct link to your logo image. Uploads come in a later release.">
          <IconInput icon={<Image size={14} />}>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://…"
              className="w-full bg-transparent focus:outline-none text-sm"
            />
          </IconInput>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Timezone">
            <IconInput icon={<Globe size={14} />}>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm"
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </IconInput>
          </Field>
          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="AUD">AUD</option>
              <option value="USD">USD</option>
              <option value="NZD">NZD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </Field>
        </div>
      </div>
      <SectionFooter
        onSave={() => m.mutate()}
        disabled={!valid || m.isPending}
        saving={m.isPending}
      />
    </section>
  );
}

function SubjectsSection({
  businessId, profile, subjects,
}: { businessId: string; profile: BusinessProfile; subjects: SubjectRow[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set(profile.active_subject_ids));

  useEffect(() => {
    setSelected(new Set(profile.active_subject_ids));
  }, [profile.active_subject_ids]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/businesses/${businessId}/subjects`, 'PATCH', {
        active_subject_ids: Array.from(selected),
      }),
    onSuccess: () => {
      toast({ title: 'Subjects updated', description: `${selected.size} active.` });
      qc.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
    },
    onError: (e: any) => {
      toast({ title: 'Could not save', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const dirty = useMemo(() => {
    const orig = new Set(profile.active_subject_ids);
    if (orig.size !== selected.size) return true;
    return Array.from(selected).some(id => !orig.has(id));
  }, [selected, profile.active_subject_ids]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <SectionHeader icon={<BookOpen size={16} className="text-indigo-600" />} title="Subjects offered" />
      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-500">
          Pick the subjects your business offers. These show up in the Create Class dropdown so tutors aren't picking from every subject in the master list.
        </p>
        {subjects.length === 0 ? (
          <p className="text-sm text-gray-500">No master subjects available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map(s => {
              const isOn = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`text-left rounded-xl border px-3 py-2 text-sm transition-all flex items-center gap-2 ${
                    isOn
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    isOn ? 'bg-indigo-600 text-white' : 'border border-gray-300 bg-white'
                  }`}>
                    {isOn && <Check size={10} strokeWidth={3} />}
                  </span>
                  <span className="truncate font-semibold">{s.name}</span>
                </button>
              );
            })}
          </div>
        )}
        <p className="text-xs text-gray-500">
          {selected.size} of {subjects.length} subjects active.
        </p>
      </div>
      <SectionFooter
        onSave={() => m.mutate()}
        disabled={!dirty || m.isPending}
        saving={m.isPending}
        idleLabel={dirty ? 'Save changes' : 'No changes'}
      />
    </section>
  );
}

function PlanSection({ profile }: { profile: BusinessProfile }) {
  const TIER_CAP: Record<string, number | null> = {
    individual: 1, starter: 5, pro: 20, enterprise: null,
  };
  const cap = profile.tier ? TIER_CAP[profile.tier] : undefined;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <SectionHeader icon={<SettingsIcon size={16} className="text-indigo-600" />} title="Plan" />
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReadOnlyTile label="Tier" value={profile.tier ?? '—'} />
        <ReadOnlyTile label="Tutor cap" value={cap === null ? '∞' : cap?.toString() ?? '—'} />
        <ReadOnlyTile label="State" value={profile.state_code} />
        <ReadOnlyTile label="Pack version" value={profile.pack_version ?? '—'} />
      </div>
      <div className="px-5 pb-5">
        <p className="text-xs text-gray-500">
          Plan changes and tier upgrades aren't self-service yet — contact support.
        </p>
      </div>
    </section>
  );
}

function ReadOnlyTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-sm font-black text-gray-900 mt-0.5 capitalize truncate">{value}</p>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</h3>
    </div>
  );
}

function SectionFooter({
  onSave, disabled, saving, idleLabel = 'Save',
}: { onSave: () => void; disabled: boolean; saving: boolean; idleLabel?: string }) {
  return (
    <div className="flex justify-end px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
      <button
        onClick={onSave}
        disabled={disabled}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
      >
        <Save size={14} /> {saving ? 'Saving…' : idleLabel}
      </button>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
