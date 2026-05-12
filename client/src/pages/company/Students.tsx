import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  GraduationCap, Bell, LogOut, ArrowLeft, Plus, X, Save, Search, School,
  User, Mail, Phone, Star, Trash2,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface ParentRow {
  id?: number;
  name: string;
  relationship?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
}
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
  parents?: ParentRow[];
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
  const parents = s.parents ?? [];
  const primary = parents.find(p => p.is_primary) ?? parents[0];
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
        {primary && (
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <User size={11} className="text-indigo-500" />
              <span className="font-semibold text-gray-700">{primary.name}</span>
              {primary.relationship && <span className="text-gray-400">({primary.relationship})</span>}
            </span>
            {primary.email && <span className="flex items-center gap-1"><Mail size={10} /> {primary.email}</span>}
            {primary.phone && <span className="flex items-center gap-1"><Phone size={10} /> {primary.phone}</span>}
            {parents.length > 1 && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                +{parents.length - 1} more
              </span>
            )}
          </div>
        )}
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

type ParentDraft = { name: string; relationship: string; email: string; phone: string; is_primary: boolean };
const emptyParent = (isPrimary = false): ParentDraft => ({ name: '', relationship: '', email: '', phone: '', is_primary: isPrimary });

function AddStudentModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [yearGroupCode, setYearGroupCode] = useState('');
  const [school, setSchool] = useState('');
  const [dob, setDob] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [parents, setParents] = useState<ParentDraft[]>([emptyParent(true)]);

  const { data: yearGroups = [] } = useQuery<YearGroup[]>({
    queryKey: ['/api/year-groups?state=NSW'],
  });

  const updateParent = (idx: number, patch: Partial<ParentDraft>) => {
    setParents(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const setPrimary = (idx: number) => {
    setParents(prev => prev.map((p, i) => ({ ...p, is_primary: i === idx })));
  };
  const removeParent = (idx: number) => {
    setParents(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      // If we removed the primary, the first remaining becomes primary
      if (!next.some(p => p.is_primary)) next[0] = { ...next[0], is_primary: true };
      return next;
    });
  };

  const cleanedParents = useMemo(
    () => parents.filter(p => p.name.trim()).map(p => ({
      name: p.name.trim(),
      relationship: p.relationship.trim() || null,
      email: p.email.trim() || null,
      phone: p.phone.trim() || null,
      is_primary: p.is_primary,
    })),
    [parents]
  );

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/businesses/${businessId}/students`, 'POST', {
        first_name: firstName,
        last_name: lastName,
        year_group_code: yearGroupCode,
        school: school || null,
        date_of_birth: dob || null,
        learning_goals: learningGoals || null,
        parents: cleanedParents,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Add a student
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto">
          <Section title="About">
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
            <Field label="Date of birth (optional)">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </Section>

          <Section title="Schooling">
            <div className="grid grid-cols-2 gap-3">
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
              <Field label="School (optional)">
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Bondi Public"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Parents / guardians"
            action={
              <button
                type="button"
                onClick={() => setParents(prev => [...prev, emptyParent(false)])}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus size={12} /> Add another
              </button>
            }
          >
            <div className="space-y-3">
              {parents.map((p, idx) => (
                <ParentEditor
                  key={idx}
                  index={idx}
                  parent={p}
                  canRemove={parents.length > 1}
                  onChange={(patch) => updateParent(idx, patch)}
                  onSetPrimary={() => setPrimary(idx)}
                  onRemove={() => removeParent(idx)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add as many parents or guardians as you need. The primary contact gets invoices and progress reports.
            </p>
          </Section>

          <Section title="Notes">
            <Field label="Learning goals (optional)">
              <textarea
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                rows={3}
                placeholder="What is this student working towards?"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </Section>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
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

function ParentEditor({
  index, parent, canRemove, onChange, onSetPrimary, onRemove,
}: {
  index: number;
  parent: ParentDraft;
  canRemove: boolean;
  onChange: (patch: Partial<ParentDraft>) => void;
  onSetPrimary: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`rounded-xl border p-3 ${parent.is_primary ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {parent.is_primary ? 'Primary contact' : `Parent ${index + 1}`}
        </span>
        <div className="flex items-center gap-2">
          {!parent.is_primary && (
            <button
              type="button"
              onClick={onSetPrimary}
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Star size={10} /> Make primary
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-400 hover:text-rose-600"
              aria-label="Remove parent"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={parent.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Name"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
        <select
          value={parent.relationship}
          onChange={(e) => onChange({ relationship: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="">Relationship</option>
          <option value="Mother">Mother</option>
          <option value="Father">Father</option>
          <option value="Step-mother">Step-mother</option>
          <option value="Step-father">Step-father</option>
          <option value="Guardian">Guardian</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Self">Self (adult student)</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="email"
          value={parent.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="Email"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
        <input
          value={parent.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="Phone"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
      </div>
    </div>
  );
}

function Section({
  title, action, children,
}: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h4>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
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
