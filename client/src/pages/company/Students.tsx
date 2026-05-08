import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  GraduationCap, Bell, LogOut, ArrowLeft, Plus, X, Save, Search, School,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface Student {
  id: number | string;
  business_id?: number;
  user_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  year_group_code?: string | null;
  date_of_birth?: string | null;
  school?: string | null;
  status?: 'active' | 'inactive' | 'archived' | string;
  // Legacy compat — companyStudents may include a `user` relation
  user?: { firstName?: string; lastName?: string; email?: string };
}
interface YearGroup {
  id: number;
  state_code: string;
  order: number;
  label: string;
  code: string;
}

function fullName(s: Student): string {
  const fn = s.first_name ?? s.user?.firstName ?? '';
  const ln = s.last_name ?? s.user?.lastName ?? '';
  return `${fn} ${ln}`.trim() || s.user?.email || `Student #${s.id}`;
}

function formatDob(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

export default function StudentsPage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      `${fullName(s)} ${s.school ?? ''} ${s.year_group_code ?? ''}`.toLowerCase().includes(q)
    );
  }, [students, search]);

  const counts = useMemo(() => {
    const active = students.filter(s => s.status === 'active' || !s.status).length;
    const archived = students.filter(s => s.status === 'archived').length;
    return { total: students.length, active, archived };
  }, [students]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Students</p>
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
        <div className="grid grid-cols-3 gap-3">
          <KpiTile value={counts.total} label="Total" tone="indigo" />
          <KpiTile value={counts.active} label="Active" tone="emerald" />
          <KpiTile value={counts.archived} label="Archived" tone="rose" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, school, or year"
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> Add student
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : students.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            No students match "{search}".
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(s => <StudentRow key={s.id} s={s} />)}
          </ul>
        )}
      </main>

      {addOpen && companyId && (
        <AddStudentModal
          businessId={companyId}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

const TONE = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
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

function StudentRow({ s }: { s: Student }) {
  const name = fullName(s);
  const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'S';
  const isArchived = s.status === 'archived';
  return (
    <li className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${isArchived ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate">{name}</p>
        <div className="text-xs text-gray-500 truncate flex items-center gap-2 flex-wrap">
          {s.year_group_code && (
            <span className="font-semibold text-gray-700">{s.year_group_code}</span>
          )}
          {s.school && (
            <span className="flex items-center gap-1">
              <School size={11} /> {s.school}
            </span>
          )}
          {s.date_of_birth && <span>· DOB {formatDob(s.date_of_birth)}</span>}
        </div>
      </div>
      {isArchived && (
        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
          Archived
        </span>
      )}
    </li>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
        <GraduationCap size={22} />
      </div>
      <h2 className="text-lg font-black text-gray-900">No students yet</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        Add a student profile to start enrolling them in classes and tracking their work.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
      >
        <Plus size={14} /> Add your first student
      </button>
    </div>
  );
}

function AddStudentModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [yearGroupCode, setYearGroupCode] = useState('');
  const [school, setSchool] = useState('');
  const [dob, setDob] = useState('');

  const { data: yearGroups = [] } = useQuery<YearGroup[]>({
    queryKey: ['/api/year-groups?state=NSW'],
  });

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/businesses/${businessId}/students`, 'POST', {
        first_name: firstName,
        last_name: lastName,
        year_group_code: yearGroupCode,
        school: school || null,
        date_of_birth: dob || null,
      }),
    onSuccess: () => {
      toast({ title: 'Student added' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${businessId}/students`] });
      onClose();
    },
    onError: (e: any) => {
      toast({ title: 'Could not add student', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const valid = firstName.trim() && lastName.trim() && yearGroupCode;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Add a student
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
          <Field label="Year group">
            <select
              value={yearGroupCode}
              onChange={(e) => setYearGroupCode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select year</option>
              {yearGroups.map(y => (
                <option key={y.id} value={y.code}>{y.label}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="School (optional)">
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Bondi Public"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
            <Field label="Date of birth (optional)">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </div>
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
            <Save size={14} /> {m.isPending ? 'Adding…' : 'Add student'}
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
