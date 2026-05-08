import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Building2, GraduationCap, Mail, Lock, User, ShieldCheck, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type Kind = 'business_owner' | 'tutor';

interface AcceptInviteResponse {
  token: string;
  user: { id: number | string; email: string; name: string; role: string };
  business_id?: number;
  tutor?: { id: number; business_id: number; status: string; compliance_status: string };
}

export default function AcceptInvitePage({ kind }: { kind: Kind }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Token comes from ?token=... in the URL
  const token = useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get('token') ?? '';
  }, []);

  // Owner fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Shared
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tutor fields
  const [wwccNumber, setWwccNumber] = useState('');
  const [wwccExpiry, setWwccExpiry] = useState('');
  const [wwccState, setWwccState] = useState('NSW');

  const minExpiry = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const m = useMutation({
    mutationFn: async (): Promise<AcceptInviteResponse> => {
      if (kind === 'business_owner') {
        return apiRequest('/api/onboarding/accept-business-invite', 'POST', {
          token, password, first_name: firstName, last_name: lastName,
        });
      }
      return apiRequest('/api/onboarding/accept-tutor-invite', 'POST', {
        token, password, wwcc_number: wwccNumber, wwcc_expiry: wwccExpiry, wwcc_state: wwccState,
      });
    },
    onSuccess: (data) => {
      if (data?.token) localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['/api/me'], data.user);
      if (kind === 'business_owner') {
        toast({ title: 'Welcome', description: 'Account ready. Next: apply your academic calendar.' });
        setLocation('/onboarding');
      } else {
        toast({ title: 'Welcome', description: 'WWCC captured — you’re ready to teach.' });
        setLocation('/tutor');
      }
    },
    onError: (err: any) => {
      toast({ title: 'Could not accept invite', description: err.message ?? 'Invalid or expired link.', variant: 'destructive' });
    },
  });

  const valid =
    !!token &&
    password.length >= 8 &&
    (kind !== 'business_owner' || (firstName.trim() && lastName.trim())) &&
    (kind !== 'tutor' || (wwccNumber.trim() && wwccExpiry && wwccState.length === 3));

  const isOwner = kind === 'business_owner';
  const eyebrow = isOwner ? 'Business Portal' : 'Tutor Portal';
  const title = isOwner ? 'Set up your account' : 'Activate your tutor account';
  const sub = isOwner
    ? 'Set a password to take ownership of your tutoring business.'
    : 'Set a password and capture your Working With Children Check to start teaching.';
  const Icon = isOwner ? Building2 : GraduationCap;

  if (!token) {
    return <MissingTokenState kind={kind} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{eyebrow}</p>
              <h1 className="text-xl sm:text-2xl font-black truncate">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-gray-600 mb-6">{sub}</p>

        <form
          onSubmit={(e) => { e.preventDefault(); if (valid) m.mutate(); }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          {isOwner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name">
                <IconInput icon={<User size={14} />}>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-transparent focus:outline-none text-sm"
                    autoFocus
                  />
                </IconInput>
              </Field>
              <Field label="Last name">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
          )}

          <Field label="Password" hint="Minimum 8 characters">
            <IconInput icon={<Lock size={14} />} trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full bg-transparent focus:outline-none text-sm"
                autoFocus={!isOwner}
              />
            </IconInput>
          </Field>

          {kind === 'tutor' && (
            <>
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Working With Children Check
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Required before you can be assigned to classes involving minors. Stored encrypted at rest.
                </p>
                <div className="space-y-4">
                  <Field label="WWCC number">
                    <input
                      value={wwccNumber}
                      onChange={(e) => setWwccNumber(e.target.value)}
                      placeholder="e.g. WWCC1234567E"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" hint="Must be ≥30 days from today">
                      <input
                        type="date"
                        value={wwccExpiry}
                        min={minExpiry}
                        onChange={(e) => setWwccExpiry(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </Field>
                    <Field label="Issuing state">
                      <input
                        value={wwccState}
                        onChange={(e) => setWwccState(e.target.value.toUpperCase())}
                        maxLength={3}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!valid || m.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {m.isPending ? 'Activating…' : (isOwner ? 'Create account' : 'Activate account')}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth" className="text-sm text-gray-500 hover:text-gray-700">
            Already have an account? Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function IconInput({
  icon, trailing, children,
}: { icon: React.ReactNode; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <div className="flex-1">{children}</div>
      {trailing && <span className="flex-shrink-0">{trailing}</span>}
    </div>
  );
}

function MissingTokenState({ kind }: { kind: Kind }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle size={22} />
        </div>
        <h1 className="text-xl font-black text-gray-900">Invitation link missing</h1>
        <p className="text-sm text-gray-600">
          This page needs a token in the URL. Open the link from your invitation email — it should look like
          <code className="block mt-2 text-xs bg-gray-50 rounded-lg px-2 py-1 break-all">
            /accept-invite/{kind === 'business_owner' ? 'business' : 'tutor'}?token=…
          </code>
        </p>
        <Link href="/auth" className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
