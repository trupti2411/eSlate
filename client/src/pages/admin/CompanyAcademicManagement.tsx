import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Building2, Bell, LogOut, ArrowLeft, CalendarDays, Pencil, Save, X,
  AlertTriangle, ArrowRight, ChevronDown, ChevronUp, FileBadge2, Info,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }

interface Week {
  id: number | string;
  business_id: number;
  academic_term_id: number | string;
  week_number: number;
  start_date: string;
  end_date: string;
  is_partial?: number | boolean;
  start_dow?: number;
  public_holidays?: string[] | null;
  notes?: string | null;
}
interface Term {
  id: number | string;
  academic_year_id: number | string;
  term_number: number;
  name: string;
  start_date: string;
  end_date: string;
  is_manually_edited?: number | boolean;
  weeks?: Week[];
}
interface AcademicYear {
  id: number | string;
  business_id: number;
  state_code: string;
  year: number;
  pack_version?: string;
  status?: string;
  start_date: string;
  end_date: string;
  terms?: Term[];
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}
function dateOnly(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : String(s);
}
function dayDiff(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

export default function CompanyAcademicManagement() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;
  const companyName = adminProfile?.companyName;

  const { data: hierarchy, isLoading } = useQuery<{ years?: AcademicYear[] } | AcademicYear[]>({
    queryKey: [`/api/companies/${companyId}/academic-hierarchy`],
    enabled: !!companyId,
  });

  const academicYears: AcademicYear[] = useMemo(() => {
    if (!hierarchy) return [];
    if (Array.isArray(hierarchy)) return hierarchy;
    return hierarchy.years ?? [];
  }, [hierarchy]);

  const [selectedYearId, setSelectedYearId] = useState<string | number | null>(null);
  useEffect(() => {
    if (!selectedYearId && academicYears.length > 0) setSelectedYearId(academicYears[0].id);
  }, [academicYears, selectedYearId]);
  const year = academicYears.find(y => String(y.id) === String(selectedYearId)) ?? academicYears[0];

  const today = new Date().toISOString().slice(0, 10);
  const activeTerm = useMemo(() => {
    if (!year?.terms) return undefined;
    return year.terms.find(t => dateOnly(t.start_date) <= today && dateOnly(t.end_date) >= today);
  }, [year, today]);

  const applyMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/state-packs/apply', 'POST', { state_code: 'NSW', year: new Date().getFullYear() }),
    onSuccess: () => {
      toast({ title: 'Calendar applied' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
    },
    onError: (e: any) => toast({ title: 'Apply failed', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                  Academic year
                </p>
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
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-500">
            Loading…
          </div>
        )}

        {!isLoading && academicYears.length === 0 && (
          <EmptyYearState onApply={() => applyMutation.mutate()} pending={applyMutation.isPending} />
        )}

        {year && (
          <>
            <CascadeNotice />
            <YearHeader
              year={year}
              years={academicYears}
              onSelect={setSelectedYearId}
              activeTerm={activeTerm}
            />

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Terms</h2>
              <div className="space-y-3">
                {(year.terms ?? []).map(t => (
                  <TermCard
                    key={t.id}
                    term={t}
                    isActive={activeTerm?.id === t.id}
                    isExpanded={String(expandedTermId) === String(t.id)}
                    onToggleExpand={() =>
                      setExpandedTermId(prev => (String(prev) === String(t.id) ? null : t.id))
                    }
                    onEdit={() => setEditingTerm(t)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {editingTerm && (
        <EditTermModal
          term={editingTerm}
          onClose={() => setEditingTerm(null)}
          onSaved={() => {
            setEditingTerm(null);
            qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
          }}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function EmptyYearState({ onApply, pending }: { onApply: () => void; pending: boolean }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h2 className="font-black text-amber-900 text-lg">No academic year yet</h2>
        <p className="text-sm text-amber-800 mt-1">
          Apply the NSW state pack to seed Terms 1–4 with all weeks and public holidays. You can edit any term's dates afterwards.
        </p>
        <button
          onClick={onApply}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl"
        >
          {pending ? 'Applying…' : 'Apply NSW pack'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function CascadeNotice() {
  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-start gap-3">
      <Info size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-indigo-900 leading-relaxed">
        Editing a term updates <strong>only that term's dates</strong> — the others aren't shifted automatically. If your school's sequence differs from the state pack, edit each term you need to change.
      </p>
    </div>
  );
}

function YearHeader({
  year, years, onSelect, activeTerm,
}: {
  year: AcademicYear;
  years: AcademicYear[];
  onSelect: (id: string | number) => void;
  activeTerm?: Term;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const inProgress = activeTerm
    ? (() => {
        const total = dayDiff(dateOnly(activeTerm.start_date), dateOnly(activeTerm.end_date)) || 1;
        const elapsed = Math.max(0, Math.min(total, dayDiff(dateOnly(activeTerm.start_date), today)));
        return Math.round((elapsed / total) * 100);
      })()
    : null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <FileBadge2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
              {year.state_code} state pack {year.pack_version ? `· v${year.pack_version}` : ''}
            </p>
            <h2 className="text-3xl font-black mt-0.5">Academic year {year.year}</h2>
            <p className="text-sm text-indigo-100 mt-0.5">
              {formatDate(year.start_date)} → {formatDate(year.end_date)} · status: {year.status ?? 'draft'}
            </p>
          </div>
        </div>
        {years.length > 1 && (
          <select
            value={String(year.id)}
            onChange={e => onSelect(e.target.value)}
            className="bg-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            {years.map(y => (
              <option key={y.id} value={String(y.id)} className="text-gray-900">
                {y.year}
              </option>
            ))}
          </select>
        )}
      </div>

      {activeTerm && inProgress !== null && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-100 mb-1.5">
            <span>{activeTerm.name} — {inProgress}% through</span>
            <span>{formatDate(activeTerm.start_date)} → {formatDate(activeTerm.end_date)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${inProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function TermCard({
  term, isActive, isExpanded, onToggleExpand, onEdit,
}: {
  term: Term;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  const weeks = term.weeks ?? [];
  return (
    <article
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
        isActive ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'
      }`}
    >
      <header className="p-5 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
            isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {term.term_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-gray-900">{term.name}</h3>
            {isActive && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
            {term.is_manually_edited ? (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Edited
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {formatDate(term.start_date)} → {formatDate(term.end_date)}
            <span className="text-gray-400 mx-2">·</span>
            <span className="font-semibold text-gray-700">{weeks.length} weeks</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onEdit}
            className="text-xs font-bold text-indigo-700 hover:bg-indigo-50 px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Pencil size={12} /> Edit dates
          </button>
          <button
            onClick={onToggleExpand}
            className="text-xs font-bold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl flex items-center gap-1.5"
            aria-label={isExpanded ? 'Collapse weeks' : 'Show weeks'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Weeks
          </button>
        </div>
      </header>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {weeks.length === 0 ? (
            <p className="text-sm text-gray-500">No weeks recorded for this term.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {weeks.map(w => {
                const holidays = (w.public_holidays ?? []).length;
                return (
                  <li
                    key={w.id}
                    className={`rounded-xl px-3 py-2 text-sm border ${
                      w.is_partial ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-gray-800">Week {w.week_number}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(w.start_date)} – {formatDate(w.end_date)}
                      </div>
                    </div>
                    {(w.is_partial || holidays > 0) && (
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        {w.is_partial ? <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Partial</span> : null}
                        {holidays > 0 ? <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">{holidays} holiday{holidays === 1 ? '' : 's'}</span> : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

function EditTermModal({
  term, onClose, onSaved,
}: { term: Term; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [start, setStart] = useState(dateOnly(term.start_date));
  const [end, setEnd] = useState(dateOnly(term.end_date));

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/academic-terms/${term.id}`, 'PATCH', {
        start_date: start,
        end_date: end,
      }),
    onSuccess: () => {
      toast({ title: 'Term updated' });
      onSaved();
    },
    onError: (e: any) => toast({ title: 'Update failed', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const valid = start && end && start <= end;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black">Edit {term.name}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Start date</label>
            <input
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">End date</label>
            <input
              type="date"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500">
            Editing a term marks it as manually-edited — annual pack refresh will skip it.
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
            <Save size={14} /> {m.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
