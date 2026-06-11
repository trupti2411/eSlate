import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Plus, X, Save, Loader2, School, Star, Trash2, Pencil, AlertTriangle, Calendar as CalendarIcon,
} from 'lucide-react';

/**
 * Shared Add / Edit student form (ESLATE-5 / 7 / 10).
 *
 * Extracted from the company Students page so the SAME validated form is used
 * everywhere a student is created or edited:
 *   - company owner area  → /company/students
 *   - platform admin area → /admin/companies/{id}
 * The ticket persona is "As a Tutoring company AND as an admin", so both the
 * company-owner and the platform-admin accounts must get this exact form.
 *
 * Backend endpoints already authorise admins (assertCanManage bypasses for
 * platform admins), so the same POST/PATCH calls work from either area.
 */

export interface ParentRow {
  id?: number;
  name: string;
  relationship?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
}

export interface StudentRecord {
  id: number | string;
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
  parents?: ParentRow[];
  updated_at?: string | null;
  updatedBy?: { firstName?: string; lastName?: string; name?: string } | null;
}

export interface YearGroup {
  id: number;
  state_code: string;
  order: number;
  label: string;
  code: string;
}

type ParentDraft = { name: string; relationship: string; email: string; phone: string; is_primary: boolean };
const emptyParent = (isPrimary = false): ParentDraft => ({ name: '', relationship: '', email: '', phone: '', is_primary: isPrimary });

// AU phone: +61 / 0 prefix then 9 digits, spaces/dashes allowed. Mirrors the backend rule.
const AU_PHONE = /^(\+?61|0)[\s-]?\d(?:[\s-]?\d){8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTES_MAX = 1000;

export function ageFromDob(iso: string): number | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const md = now.getMonth() - d.getMonth();
  if (md < 0 || (md === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function dobDisplay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

export default function StudentFormModal({
  mode, businessId, student, onClose, onSuccess,
}: {
  mode: 'add' | 'edit';
  businessId: string;
  student?: StudentRecord;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [firstName, setFirstName] = useState(student?.first_name ?? '');
  const [lastName, setLastName] = useState(student?.last_name ?? '');
  const [yearGroupCode, setYearGroupCode] = useState(student?.year_group_code ?? '');
  const [school, setSchool] = useState(student?.school ?? '');
  const [dob, setDob] = useState((student?.date_of_birth ?? '').slice(0, 10));
  const [address, setAddress] = useState(student?.address ?? '');
  const [phone, setPhone] = useState(student?.phone ?? '');
  const [email, setEmail] = useState(student?.email ?? '');
  const [notes, setNotes] = useState(student?.notes ?? '');
  const [learningGoals, setLearningGoals] = useState(student?.learning_goals ?? '');
  const [parents, setParents] = useState<ParentDraft[]>(
    student?.parents?.length
      ? student.parents.map(p => ({
          name: p.name ?? '',
          relationship: p.relationship ?? '',
          email: p.email ?? '',
          phone: p.phone ?? '',
          is_primary: !!p.is_primary,
        }))
      : [emptyParent(true)],
  );
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);

  const { data: yearGroups = [] } = useQuery<YearGroup[]>({
    queryKey: ['/api/year-groups?state=NSW'],
  });

  const updateParent = (idx: number, patch: Partial<ParentDraft>) => {
    touch();
    setParents(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const setPrimary = (idx: number) => {
    touch();
    setParents(prev => prev.map((p, i) => ({ ...p, is_primary: i === idx })));
  };
  const removeParent = (idx: number) => {
    touch();
    setParents(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
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
    [parents],
  );

  // ----- validation -----
  const errors: Record<string, string> = {};
  if (!firstName.trim()) errors.firstName = 'First name is required';
  else if (firstName.trim().length > 100) errors.firstName = 'Max 100 characters';
  if (!lastName.trim()) errors.lastName = 'Last name is required';
  else if (lastName.trim().length > 100) errors.lastName = 'Max 100 characters';
  if (!yearGroupCode) errors.yearGroup = 'Year group is required';
  if (!dob) errors.dob = 'Date of birth is required';   // ESLATE-5 AC-5
  if (!address.trim()) errors.address = 'Address is required';
  if (phone.trim() && !AU_PHONE.test(phone.trim())) errors.phone = 'Enter a valid Australian phone number';
  if (email.trim() && !EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (notes.length > NOTES_MAX) errors.notes = `Notes cannot exceed ${NOTES_MAX} characters`;
  const isValid = Object.keys(errors).length === 0;

  const age = dob ? ageFromDob(dob) : null;
  const showAgeWarning = age !== null && age < 5;

  const buildPayload = () => ({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    year_group_code: yearGroupCode,
    date_of_birth: dob || null,
    address: address.trim(),
    school: school.trim() || null,
    phone: phone.trim() || null,
    email: email.trim() || null,
    notes: notes.trim() || null,
    learning_goals: learningGoals.trim() || null,
    parents: cleanedParents,
  });

  const m = useMutation({
    mutationFn: () =>
      isEdit
        ? apiRequest(`/api/students/${student!.id}`, 'PATCH', buildPayload())
        : apiRequest(`/api/businesses/${businessId}/students`, 'POST', buildPayload()),
    onSuccess: () => {
      toast({ title: isEdit ? 'Student record updated successfully' : 'Student added' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${businessId}/students`] });
      onSuccess?.();
      onClose();
    },
    onError: (e: any) => {
      toast({
        title: isEdit ? 'Could not update student' : 'Could not add student',
        description: e.message ?? 'Try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    m.mutate();
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    onClose();
  };

  const err = (k: string) =>
    submitted && errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null;
  const inputCls = (k?: string) =>
    `w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${k && submitted && errors[k] ? 'border-red-300' : 'border-gray-200'}`;
  const req = <span className="text-red-500">*</span>;

  const updatedByName = student?.updatedBy
    ? (student.updatedBy.name
        ?? `${student.updatedBy.firstName ?? ''} ${student.updatedBy.lastName ?? ''}`.trim())
    : '';

  // DOB bounds: allow ~100 years back, no future dates.
  const today = new Date();
  const maxDob = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const minDob = `${today.getFullYear() - 100}-01-01`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            {isEdit ? <Pencil size={16} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
            {isEdit ? 'Edit student' : 'Add a student'}
          </h3>
          <button onClick={handleCancel} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto">
          <Section title="About">
            <div className="grid grid-cols-2 gap-3">
              <Field label={<>First name {req}</>}>
                <input
                  value={firstName}
                  onChange={(e) => { touch(); setFirstName(e.target.value); }}
                  placeholder="First"
                  className={inputCls('firstName')}
                  autoFocus
                />
                {err('firstName')}
              </Field>
              <Field label={<>Last name {req}</>}>
                <input
                  value={lastName}
                  onChange={(e) => { touch(); setLastName(e.target.value); }}
                  placeholder="Last"
                  className={inputCls('lastName')}
                />
                {err('lastName')}
              </Field>
            </div>
            <Field label={<>Date of birth {req}</>}>
              <DobPicker
                value={dob}
                minDate={minDob}
                maxDate={maxDob}
                invalid={submitted && !!errors.dob}
                onChange={(v) => { touch(); setDob(v); }}
              />
              {err('dob')}
              {dob && <p className="text-xs text-gray-500 mt-1">Selected: {dobDisplay(dob)}</p>}
              {showAgeWarning && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> This student appears to be under 5 years old. You can still continue.
                </p>
              )}
            </Field>
          </Section>

          <Section title="Schooling">
            <div className="grid grid-cols-2 gap-3">
              <Field label={<>Year group {req}</>}>
                <select
                  value={yearGroupCode}
                  onChange={(e) => { touch(); setYearGroupCode(e.target.value); }}
                  className={inputCls('yearGroup')}
                >
                  <option value="">Select year</option>
                  {yearGroups.map(y => (
                    <option key={y.id} value={y.code}>{y.label}</option>
                  ))}
                </select>
                {err('yearGroup')}
              </Field>
              <Field label="School">
                <SchoolAutocomplete value={school} onChange={(v) => { touch(); setSchool(v); }} />
              </Field>
            </div>
          </Section>

          <Section title="Address">
            <Field label={<>Address {req}</>}>
              <textarea
                value={address}
                onChange={(e) => { touch(); setAddress(e.target.value); }}
                rows={2}
                placeholder="Street, suburb, state, postcode"
                className={inputCls('address')}
              />
              {err('address')}
            </Field>
          </Section>

          <Section title="Student contact (optional)">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(e) => { touch(); setPhone(e.target.value); }}
                  placeholder="04XX XXX XXX"
                  className={inputCls('phone')}
                />
                {err('phone')}
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { touch(); setEmail(e.target.value); }}
                  placeholder="student@example.com"
                  className={inputCls('email')}
                />
                {err('email')}
              </Field>
            </div>
          </Section>

          <Section
            title="Parents / guardians"
            action={
              <button
                type="button"
                onClick={() => { touch(); setParents(prev => [...prev, emptyParent(false)]); }}
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
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => { touch(); setNotes(e.target.value); }}
                rows={4}
                maxLength={NOTES_MAX + 200}
                placeholder="Add any general notes about this student..."
                className={inputCls('notes')}
              />
              <div className="flex items-center justify-between mt-1">
                {err('notes') ?? <span />}
                <span className={`text-xs ${notes.length > NOTES_MAX ? 'text-red-600' : 'text-gray-400'}`}>
                  {notes.length} / {NOTES_MAX}
                </span>
              </div>
            </Field>
            <Field label="Learning goals (optional)">
              <textarea
                value={learningGoals}
                onChange={(e) => { touch(); setLearningGoals(e.target.value); }}
                rows={3}
                placeholder="What is this student working towards?"
                className={inputCls()}
              />
            </Field>
          </Section>

          {isEdit && updatedByName && student?.updated_at && (
            <p className="text-xs text-gray-400">
              Last updated by {updatedByName} on {dobDisplay(student.updated_at)}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={handleCancel} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(submitted && !isValid) || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            {m.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {m.isPending ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save changes' : 'Add student')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ESLATE-5 AC-1: Birth-date calendar with quick year navigation.
 *
 * A real calendar (react-day-picker) in a popover — not a plain text input.
 * captionLayout="dropdown-buttons" renders month + year dropdowns in the
 * header, so you can jump back decades in one click (fromYear is 100 years
 * back, well beyond the required 20). The trigger shows the selected date as
 * DD/MM/YYYY. The calendar opens near a typical student age so the common
 * case needs minimal scrolling.
 */
function DobPicker({
  value, minDate, maxDate, invalid, onChange,
}: {
  value: string;
  minDate: string;   // yyyy-mm-dd
  maxDate: string;   // yyyy-mm-dd
  invalid?: boolean;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const fromYear = parseInt(minDate.slice(0, 4), 10);
  const toYear = parseInt(maxDate.slice(0, 4), 10);
  // Default the calendar to ~10 years ago (typical student) when nothing picked.
  const defaultMonth = selected ?? new Date(toYear - 10, 0, 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${invalid ? 'border-red-300' : 'border-gray-200'}`}
        >
          <CalendarIcon size={14} className="text-gray-400 flex-shrink-0" />
          {value
            ? <span className="text-gray-900">{format(selected!, 'dd/MM/yyyy')}</span>
            : <span className="text-gray-400">Select date of birth</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={defaultMonth}
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          disabled={{ before: parse(minDate, 'yyyy-MM-dd', new Date()), after: parse(maxDate, 'yyyy-MM-dd', new Date()) }}
          onSelect={(d: Date | undefined) => {
            if (d) { onChange(format(d, 'yyyy-MM-dd')); setOpen(false); }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * ESLATE-5: Australian schools typeahead. Debounced (300ms), min 2 chars.
 * Always permits free-text entry; if the backend reports the lookup is
 * unavailable (or the request errors) it silently degrades to a text input.
 */
function SchoolAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ name: string; suburb?: string | null; state?: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) { setResults([]); setOpen(false); setUnavailable(false); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiRequest(`/api/schools/search?q=${encodeURIComponent(q)}`, 'GET');
        if (cancelled) return;
        if (res?.available === false) {
          setUnavailable(true); setResults([]); setOpen(false);
        } else {
          const list = res?.schools ?? [];
          setUnavailable(false); setResults(list); setOpen(list.length > 0);
        }
      } catch {
        if (!cancelled) { setUnavailable(true); setResults([]); setOpen(false); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Start typing a school name…"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {loading && <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => { onChange(r.name); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2"
              >
                <School size={12} className="text-indigo-500 flex-shrink-0" />
                <span className="truncate">
                  {r.name}
                  {r.suburb ? <span className="text-gray-400"> — {r.suburb}{r.state ? `, ${r.state}` : ''}</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {unavailable && value.trim().length >= 2 && (
        <p className="text-xs text-gray-400 mt-1">School lookup unavailable — just type the school name.</p>
      )}
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

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
