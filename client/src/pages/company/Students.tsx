import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import StudentFormModal, { ageFromDob, dobDisplay } from '@/components/StudentFormModal';
import {
  GraduationCap, Bell, LogOut, ArrowLeft, Plus, X, Search, School,
  User, Mail, Phone, Pencil, Calendar, MapPin,
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
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  learning_goals?: string | null;
  status?: 'active' | 'inactive' | 'archived' | string;
  parents?: ParentRow[];
  updated_at?: string | null;
  updatedBy?: { firstName?: string; lastName?: string; name?: string } | null;
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
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);

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
            {filtered.map(s => <StudentRow key={s.id} s={s} onView={() => setViewing(s)} onEdit={() => setEditing(s)} />)}
          </ul>
        )}
      </main>

      {addOpen && companyId && (
        <StudentFormModal
          mode="add"
          businessId={companyId}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editing && companyId && (
        <StudentFormModal
          mode="edit"
          businessId={companyId}
          student={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {viewing && !editing && companyId && (
        <StudentProfileModal
          student={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
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

function StudentRow({ s, onView, onEdit }: { s: Student; onView: () => void; onEdit: () => void }) {
  const name = fullName(s);
  const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'S';
  const isArchived = s.status === 'archived';
  const parents = s.parents ?? [];
  const primary = parents.find(p => p.is_primary) ?? parents[0];
  return (
    <li
      onClick={onView}
      className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-200 hover:shadow-md transition ${isArchived ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
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
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors"
        aria-label={`Edit ${name}`}
      >
        <Pencil size={12} /> Edit
      </button>
    </li>
  );
}

/**
 * Read-only student profile (ESLATE-14). View-by-default; the Edit button
 * hands off to the existing StudentFormModal (DRY — one edit form).
 * Fetches fresh via GET /students/:id so the "Last updated by" footer and
 * full parent list are present even when the list row omitted them.
 */
function StudentProfileModal({
  student, onClose, onEdit,
}: {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { data: full } = useQuery<Student>({
    queryKey: [`/api/students/${student.id}`],
    initialData: student,
  });
  const s = full ?? student;

  const name = fullName(s);
  const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'S';
  const age = s.date_of_birth ? ageFromDob(s.date_of_birth.slice(0, 10)) : null;
  const parents = s.parents ?? [];
  const primary = parents.find(p => p.is_primary) ?? parents[0];
  const others = parents.filter(p => p !== primary);
  const updatedByName = s.updatedBy
    ? (s.updatedBy.name ?? `${s.updatedBy.firstName ?? ''} ${s.updatedBy.lastName ?? ''}`.trim())
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-gray-900 truncate">{name}</h3>
              <p className="text-xs text-gray-500 truncate">
                {[s.year_group_code, s.school].filter(Boolean).join(' · ') || 'Student'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-3 py-2 rounded-xl"
            >
              <Pencil size={14} /> Edit
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          <ProfileSection title="About">
            <ProfileRow icon={<Calendar size={14} />} label="Date of birth"
              value={s.date_of_birth ? `${formatDob(s.date_of_birth)}${age !== null ? `  (Age ${age})` : ''}` : '—'} />
            <ProfileRow icon={<GraduationCap size={14} />} label="Year group" value={s.year_group_code || '—'} />
            <ProfileRow icon={<School size={14} />} label="School" value={s.school || '—'} />
          </ProfileSection>

          <ProfileSection title="Address">
            <ProfileRow icon={<MapPin size={14} />} label="Address" value={s.address || '—'} />
          </ProfileSection>

          <ProfileSection title="Parents / Guardians">
            {parents.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts on record.</p>
            ) : (
              <div className="space-y-3">
                {primary && <ParentCard p={primary} isPrimary />}
                {others.map((p, i) => <ParentCard key={i} p={p} />)}
              </div>
            )}
          </ProfileSection>

          <ProfileSection title="Notes">
            <p className="text-xs font-semibold text-gray-500">General notes</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-0.5">{s.notes || '—'}</p>
            <p className="text-xs font-semibold text-gray-500 mt-3">Learning goals</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-0.5">{s.learning_goals || '—'}</p>
          </ProfileSection>

          {updatedByName && s.updated_at && (
            <p className="text-xs text-gray-400">
              Last updated by {updatedByName} on {dobDisplay(s.updated_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 truncate">{value}</span>
    </div>
  );
}

function ParentCard({ p, isPrimary }: { p: ParentRow; isPrimary?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <User size={13} className="text-indigo-500" />
        <span className="font-bold text-sm text-gray-900">{p.name}</span>
        {p.relationship && <span className="text-xs text-gray-400">({p.relationship})</span>}
        {isPrimary && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Primary</span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
        {p.email && <span className="flex items-center gap-1"><Mail size={11} /> {p.email}</span>}
        {p.phone && <span className="flex items-center gap-1"><Phone size={11} /> {p.phone}</span>}
        {!p.email && !p.phone && <span className="text-gray-400">No contact details</span>}
      </div>
    </div>
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
