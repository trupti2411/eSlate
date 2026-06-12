import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format, differenceInYears, isValid } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  GraduationCap, Bell, LogOut, ArrowLeft, Plus, X, Save, Search, School,
  User, Mail, Phone, Star, Trash2, CalendarIcon, AlertTriangle, Pencil, Clock,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName?: string; company?: { id: string; name: string } }
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
  notes?: string | null;
  learning_goals?: string | null;
  learningGoals?: string | null;
  status?: 'active' | 'inactive' | 'archived' | string;
  parents?: ParentRow[];
  updated_at?: string | null;
  updated_by_name?: string | null;
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
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: ['/api/company-admin/profile'],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.company?.name ?? adminProfile?.companyName;

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
            {filtered.map(s => <StudentRow key={s.id} s={s} onEdit={() => setEditStudent(s)} />)}
          </ul>
        )}
      </main>

      {addOpen && companyId && (
        <AddStudentModal
          businessId={companyId}
          onClose={() => setAddOpen(false)}
        />
      )}
      {editStudent && companyId && (
        <EditStudentModal
          student={editStudent}
          businessId={companyId}
          onClose={() => setEditStudent(null)}
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

function StudentRow({ s, onEdit }: { s: Student; onEdit: () => void }) {
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
          </div>
        )}
        {s.updated_at && s.updated_by_name && (
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={9} />
            Updated by <span className="font-semibold">{s.updated_by_name}</span> on {formatDob(s.updated_at)}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isArchived && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Archived
          </span>
        )}
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center transition-colors"
          aria-label="Edit student"
        >
          <Pencil size={14} />
        </button>
      </div>
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

type FormErrors = Partial<Record<'firstName' | 'lastName' | 'dob' | 'suburb' | 'yearGroup' | 'school', string>>;

type SchoolResult = { name: string; suburb: string; state: string; postcode?: string };

function SchoolSearchInput({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (school: SchoolResult) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const search = useCallback((q: string) => {
    if (q.length < 2) { setResults([]); setNoResults(false); setOpen(false); return; }
    setLoading(true);
    fetch(`/api/schools/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then((data: SchoolResult[]) => {
        setResults(data);
        setNoResults(data.length === 0);
        setOpen(data.length > 0);
        setApiAvailable(true);
      })
      .catch(() => { setApiAvailable(false); setNoResults(false); setOpen(false); })
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (v: string) => {
    setQuery(v);
    onChange(v);
    setNoResults(false);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 300);
  };

  const handleSelect = (s: SchoolResult) => {
    setQuery(s.name);
    onChange(s.name);
    setOpen(false);
    setNoResults(false);
    onSelect?.(s);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by school name or suburb…"
          className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">…</span>}
      </div>
      {!apiAvailable && (
        <p className="text-xs text-amber-600 mt-1">School search unavailable — type the school name directly.</p>
      )}
      {noResults && query.length >= 2 && (
        <p className="text-xs text-gray-500 mt-1">No schools found — you can type the name directly above.</p>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
          {results.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex flex-col"
              >
                <span className="font-semibold text-gray-800">{s.name}</span>
                {(s.suburb || s.state) && (
                  <span className="text-xs text-gray-500">{[s.suburb, s.state].filter(Boolean).join(', ')}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DOBPicker({ value, onChange }: { value: Date | undefined; onChange: (d: Date | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const fromYear = today.getFullYear() - 25;
  const toYear = today.getFullYear();

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <CalendarIcon size={14} className="text-gray-400 flex-shrink-0" />
        {value && isValid(value) ? (
          <span className="text-gray-800">{format(value, 'dd/MM/yyyy')}</span>
        ) : (
          <span className="text-gray-400">Select date…</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl p-2" style={{ minWidth: 280 }}>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={d => { onChange(d); setOpen(false); }}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            defaultMonth={value ?? new Date(today.getFullYear() - 10, 0, 1)}
            disabled={{ after: today }}
            classNames={{
              caption_dropdowns: 'flex gap-2 justify-center',
              caption_label: 'hidden',
              dropdown: 'rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400',
              nav_button: 'w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center',
              day_selected: 'bg-indigo-600 text-white rounded-lg',
              day_today: 'font-bold text-indigo-600',
            }}
          />
        </div>
      )}
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
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [stateAU, setStateAU] = useState('NSW');
  const [postcode, setPostcode] = useState('');
  const [suburbSchools, setSuburbSchools] = useState<SchoolResult[]>([]);
  const [suburbSuggestOpen, setSuburbSuggestOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [parents, setParents] = useState<ParentDraft[]>([emptyParent(true)]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [ageWarning, setAgeWarning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { data: yearGroups = [] } = useQuery<YearGroup[]>({
    queryKey: ['/api/year-groups?state=NSW'],
  });

  useEffect(() => {
    const s = suburb.trim();
    if (s.length < 2) { setSuburbSchools([]); setSuburbSuggestOpen(false); return; }
    const timer = setTimeout(() => {
      fetch(`/api/schools/by-suburb?suburb=${encodeURIComponent(s)}`)
        .then(r => r.json())
        .then((data: SchoolResult[]) => {
          setSuburbSchools(data);
          if (data.length > 0 && !school) setSuburbSuggestOpen(true);
        })
        .catch(() => { setSuburbSchools([]); setSuburbSuggestOpen(false); });
    }, 400);
    return () => clearTimeout(timer);
  }, [suburb]);

  const handleDobChange = (d: Date | undefined) => {
    setDob(d);
    if (d && isValid(d)) {
      const age = differenceInYears(new Date(), d);
      setAgeWarning(age < 5);
    } else {
      setAgeWarning(false);
    }
    setConfirmed(false);
  };

  const updateParent = (idx: number, patch: Partial<ParentDraft>) =>
    setParents(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  const setPrimary = (idx: number) =>
    setParents(prev => prev.map((p, i) => ({ ...p, is_primary: i === idx })));
  const removeParent = (idx: number) =>
    setParents(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      if (!next.some(p => p.is_primary)) next[0] = { ...next[0], is_primary: true };
      return next;
    });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!dob || !isValid(dob)) e.dob = 'Date of birth is required';
    if (!suburb.trim()) e.suburb = 'Suburb is required';
    if (!yearGroupCode) e.yearGroup = 'Year group is required';
    setErrors(e);
    return Object.keys(e).length === 0;
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
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        year_group_code: yearGroupCode,
        school: school || null,
        date_of_birth: dob ? dob.toISOString() : null,
        address: [street.trim(), suburb.trim(), [stateAU, postcode.trim()].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        notes: notes.trim() || null,
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

  const handleSubmit = () => {
    if (!validate()) return;
    if (ageWarning && !confirmed) return;
    m.mutate();
  };

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
              <Field label="First name *" error={errors.firstName}>
                <input
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: undefined })); }}
                  placeholder="First"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                  autoFocus
                />
              </Field>
              <Field label="Last name *" error={errors.lastName}>
                <input
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: undefined })); }}
                  placeholder="Last"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                />
              </Field>
            </div>
            <Field label="Date of birth *" error={errors.dob}>
              <DOBPicker value={dob} onChange={d => { handleDobChange(d); setErrors(prev => ({ ...prev, dob: undefined })); }} />
            </Field>
            {ageWarning && (
              <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 text-sm ${confirmed ? 'border-gray-200 bg-gray-50' : 'border-amber-300 bg-amber-50'}`}>
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">This student appears to be under 5 years old. Are you sure you want to continue?</p>
                  {!confirmed && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmed(true)}
                        className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"
                      >
                        Yes, continue
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDob(undefined); setAgeWarning(false); }}
                        className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100"
                      >
                        Go back and correct
                      </button>
                    </div>
                  )}
                  {confirmed && <p className="text-xs text-gray-500 mt-1">Confirmed — you may proceed.</p>}
                </div>
              </div>
            )}
          </Section>

          <Section title="Address">
            <Field label="Street (optional)">
              <input
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="e.g. 123 Main Street"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Suburb *" error={errors.suburb}>
                  <input
                    value={suburb}
                    onChange={e => { setSuburb(e.target.value); setErrors(prev => ({ ...prev, suburb: undefined })); }}
                    placeholder="Suburb"
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.suburb ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </Field>
              </div>
              <Field label="Postcode">
                <input
                  value={postcode}
                  onChange={e => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="2000"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Field>
            </div>
            <Field label="State">
              <select
                value={stateAU}
                onChange={e => setStateAU(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {['NSW','VIC','QLD','SA','WA','TAS','NT','ACT'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Schooling">
            {suburbSuggestOpen && suburbSchools.length > 0 && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 mb-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                    <School size={13} /> Schools in {suburb}
                  </span>
                  <button type="button" onClick={() => setSuburbSuggestOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close suggestions">
                    <X size={14} />
                  </button>
                </div>
                <ul className="space-y-0.5">
                  {suburbSchools.slice(0, 8).map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => { setSchool(s.name); setSuburbSuggestOpen(false); setErrors(prev => ({ ...prev, school: undefined })); }}
                        className="w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center justify-between group"
                      >
                        <span className="text-gray-800">{s.name}</span>
                        <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 uppercase tracking-wide">Select</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-gray-400 mt-2">Or search manually below to find a school in a different suburb.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year group *" error={errors.yearGroup}>
                <select
                  value={yearGroupCode}
                  onChange={e => { setYearGroupCode(e.target.value); setErrors(prev => ({ ...prev, yearGroup: undefined })); }}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.yearGroup ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Select year</option>
                  {yearGroups.map(y => (
                    <option key={y.id} value={y.code}>{y.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="School" error={errors.school}>
                <SchoolSearchInput
                  value={school}
                  onChange={v => { setSchool(v); setErrors(prev => ({ ...prev, school: undefined })); }}
                  onSelect={s => {
                    setSchool(s.name);
                    setErrors(prev => ({ ...prev, school: undefined }));
                    if (!suburb.trim()) {
                      setSuburb(s.suburb);
                      if (s.state) setStateAU(s.state);
                      setErrors(prev => ({ ...prev, suburb: undefined }));
                    }
                    setSuburbSuggestOpen(false);
                  }}
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

          <div className="space-y-3">
            <Field label="General notes (optional)">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any general notes about this student…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
              <p className={`text-xs mt-1 text-right ${notes.length > 1000 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {notes.length} / 1000
              </p>
            </Field>
            <Field label="Learning goals (optional)">
              <textarea
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                rows={3}
                placeholder="What is this student working towards?"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={m.isPending || (ageWarning && !confirmed)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {m.isPending ? 'Adding…' : 'Add student'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditStudentModal({ student, businessId, onClose }: { student: Student; businessId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const initFirstName = student.first_name ?? student.user?.firstName ?? '';
  const initLastName = student.last_name ?? student.user?.lastName ?? '';
  const initYearGroup = student.year_group_code ?? '';
  const initSchool = student.school ?? '';
  const initDob: Date | undefined = (() => {
    if (!student.date_of_birth) return undefined;
    const d = new Date(student.date_of_birth);
    return isValid(d) ? d : undefined;
  })();
  const initAddress = student.address ?? '';
  const initNotes = student.notes ?? '';
  const initLearningGoals = (student as any).learningGoals ?? (student as any).learning_goals ?? '';
  const initParents: ParentDraft[] = (student.parents ?? []).length > 0
    ? (student.parents ?? []).map(p => ({
        name: p.name,
        relationship: p.relationship ?? '',
        email: p.email ?? '',
        phone: p.phone ?? '',
        is_primary: !!p.is_primary,
      }))
    : [emptyParent(true)];

  const [firstName, setFirstName] = useState(initFirstName);
  const [lastName, setLastName] = useState(initLastName);
  const [yearGroupCode, setYearGroupCode] = useState(initYearGroup);
  const [school, setSchool] = useState(initSchool);
  const [dob, setDob] = useState<Date | undefined>(initDob);
  const [address, setAddress] = useState(initAddress);
  const [notes, setNotes] = useState(initNotes);
  const [learningGoals, setLearningGoals] = useState(initLearningGoals);
  const [parents, setParents] = useState<ParentDraft[]>(initParents);
  const [errors, setErrors] = useState<FormErrors>({});
  const [ageWarning, setAgeWarning] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const [discardPrompt, setDiscardPrompt] = useState(false);

  const { data: yearGroups = [] } = useQuery<YearGroup[]>({
    queryKey: ['/api/year-groups?state=NSW'],
  });

  const isDirty = useMemo(() => {
    const parentsChanged = JSON.stringify(parents) !== JSON.stringify(initParents);
    return (
      firstName !== initFirstName ||
      lastName !== initLastName ||
      yearGroupCode !== initYearGroup ||
      school !== initSchool ||
      (dob?.toISOString() ?? '') !== (initDob?.toISOString() ?? '') ||
      address !== initAddress ||
      notes !== initNotes ||
      learningGoals !== initLearningGoals ||
      parentsChanged
    );
  }, [firstName, lastName, yearGroupCode, school, dob, address, notes, learningGoals, parents]);

  const handleDobChange = (d: Date | undefined) => {
    setDob(d);
    if (d && isValid(d)) {
      const age = differenceInYears(new Date(), d);
      setAgeWarning(age < 5);
      setConfirmed(false);
    } else {
      setAgeWarning(false);
      setConfirmed(true);
    }
  };

  const updateParent = (idx: number, patch: Partial<ParentDraft>) =>
    setParents(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  const setPrimary = (idx: number) =>
    setParents(prev => prev.map((p, i) => ({ ...p, is_primary: i === idx })));
  const removeParent = (idx: number) =>
    setParents(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      if (!next.some(p => p.is_primary)) next[0] = { ...next[0], is_primary: true };
      return next;
    });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!address.trim()) e.suburb = 'Address is required';
    if (!yearGroupCode) e.yearGroup = 'Year group is required';
    setErrors(e);
    return Object.keys(e).length === 0;
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
      apiRequest(`/api/students/${student.id}`, 'PATCH', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        year_group_code: yearGroupCode,
        school: school || null,
        date_of_birth: dob ? dob.toISOString() : null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        learning_goals: learningGoals.trim() || null,
        parents: cleanedParents,
      }),
    onSuccess: () => {
      toast({ title: 'Student record updated successfully' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${businessId}/students`] });
      onClose();
    },
    onError: (e: any) => {
      toast({ title: 'Could not update student', description: e.message ?? 'Try again.', variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    if (ageWarning && !confirmed) return;
    m.mutate();
  };

  const handleCancel = () => {
    if (isDirty) {
      setDiscardPrompt(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {discardPrompt && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <p className="font-black text-gray-900 text-base">Discard unsaved changes?</p>
            <p className="text-sm text-gray-500 mt-1">Your edits will be lost.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDiscardPrompt(false)}
                className="text-sm font-bold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl"
              >
                Keep editing
              </button>
              <button
                onClick={onClose}
                className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col ${discardPrompt ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Pencil size={16} className="text-indigo-600" /> Edit student
          </h3>
          <button onClick={handleCancel} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto">
          <Section title="About">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *" error={errors.firstName}>
                <input
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: undefined })); }}
                  placeholder="First"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                />
              </Field>
              <Field label="Last name *" error={errors.lastName}>
                <input
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: undefined })); }}
                  placeholder="Last"
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                />
              </Field>
            </div>
            <Field label="Date of birth" error={errors.dob}>
              <DOBPicker value={dob} onChange={d => { handleDobChange(d); setErrors(prev => ({ ...prev, dob: undefined })); }} />
            </Field>
            {ageWarning && (
              <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 text-sm ${confirmed ? 'border-gray-200 bg-gray-50' : 'border-amber-300 bg-amber-50'}`}>
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">This student appears to be under 5 years old. Are you sure you want to continue?</p>
                  {!confirmed && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setConfirmed(true)} className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700">Yes, continue</button>
                      <button type="button" onClick={() => { setDob(undefined); setAgeWarning(false); }} className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100">Go back and correct</button>
                    </div>
                  )}
                  {confirmed && <p className="text-xs text-gray-500 mt-1">Confirmed — you may proceed.</p>}
                </div>
              </div>
            )}
          </Section>

          <Section title="Address">
            <Field label="Address *" error={errors.suburb}>
              <textarea
                value={address}
                onChange={e => { setAddress(e.target.value); setErrors(prev => ({ ...prev, suburb: undefined })); }}
                rows={2}
                placeholder="e.g. 123 Main Street, Suburb NSW 2000"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${errors.suburb ? 'border-red-400' : 'border-gray-200'}`}
              />
            </Field>
          </Section>

          <Section title="Schooling">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year group *" error={errors.yearGroup}>
                <select
                  value={yearGroupCode}
                  onChange={e => { setYearGroupCode(e.target.value); setErrors(prev => ({ ...prev, yearGroup: undefined })); }}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.yearGroup ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Select year</option>
                  {yearGroups.map(y => (
                    <option key={y.id} value={y.code}>{y.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="School">
                <SchoolSearchInput
                  value={school}
                  onChange={v => setSchool(v)}
                  onSelect={s => setSchool(s.name)}
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
          </Section>

          <div className="space-y-3">
            <Field label="General notes (optional)">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any general notes about this student…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
              <p className={`text-xs mt-1 text-right ${notes.length > 1000 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{notes.length} / 1000</p>
            </Field>
            <Field label="Learning goals (optional)">
              <textarea
                value={learningGoals}
                onChange={e => setLearningGoals(e.target.value)}
                rows={2}
                placeholder="What is this student working towards?"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={handleCancel} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={m.isPending || (ageWarning && !confirmed)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {m.isPending ? 'Saving…' : 'Save changes'}
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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
