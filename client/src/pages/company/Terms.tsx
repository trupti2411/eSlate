import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  CalendarDays, Bell, LogOut, ArrowLeft, Plus, X, Trash2, ChevronDown, ChevronRight,
} from 'lucide-react';

interface AdminProfile {
  userId: string;
  companyId: string;
  companyName?: string;
  company?: { id: string; name: string };
}

interface AcademicYear {
  id: string;
  yearNumber: number;
  name: string;
  isActive: boolean;
}

interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function fmt(s: string) {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[3]} ${months[parseInt(m[2],10)-1]} ${m[1]}`;
}

export default function TermsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [showAddYear, setShowAddYear] = useState(false);
  const [addTermForYear, setAddTermForYear] = useState<AcademicYear | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: ['/api/company-admin/profile'],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.company?.id ?? adminProfile?.companyId;
  const companyName = adminProfile?.company?.name ?? adminProfile?.companyName;

  const { data: years = [], isLoading } = useQuery<AcademicYear[]>({
    queryKey: [`/api/companies/${companyId}/academic-years`],
    enabled: !!companyId,
  });

  const { data: allTerms = [] } = useQuery<Term[]>({
    queryKey: [`/api/companies/${companyId}/academic-terms`],
    enabled: !!companyId,
  });

  const termsByYear = (yearId: string) => allTerms.filter(t => t.academicYearId === yearId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const deleteYearMutation = useMutation({
    mutationFn: (yearId: string) => apiRequest(`/api/companies/${companyId}/academic-years/${yearId}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: 'Academic year deleted' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-years`] });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
    },
    onError: (e: any) => toast({ title: 'Could not delete', description: e.message, variant: 'destructive' }),
  });

  const deleteTermMutation = useMutation({
    mutationFn: (termId: string) => apiRequest(`/api/companies/${companyId}/academic-terms/${termId}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: 'Term deleted' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
    },
    onError: (e: any) => toast({ title: 'Could not delete', description: e.message, variant: 'destructive' }),
  });

  const applyNSWMutation = useMutation({
    mutationFn: () => apiRequest('/api/state-packs/apply', 'POST', { state_code: 'NSW', year: 2026 }),
    onSuccess: () => {
      toast({ title: 'NSW 2026 calendar applied', description: 'Terms 1–4 are ready.' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-years`] });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
    },
    onError: (e: any) => toast({ title: 'Could not apply calendar', description: e.message, variant: 'destructive' }),
  });

  const toggleYear = (id: string) =>
    setExpandedYears(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Academic Terms</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl">
                <ArrowLeft size={12} /> Dashboard
              </Link>
              <button className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"><Bell size={16} /></button>
              <button onClick={() => logoutMutation.mutate()} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"><LogOut size={15} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Dependency note */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-bold text-amber-900 mb-1">Setup order</p>
          <div className="flex items-center gap-2 flex-wrap text-xs text-amber-800 font-semibold">
            <span className="bg-amber-100 px-2 py-1 rounded-lg">1. Create Academic Year</span>
            <ChevronRight size={12} className="text-amber-500" />
            <span className="bg-amber-100 px-2 py-1 rounded-lg">2. Add Terms to that year</span>
            <ChevronRight size={12} className="text-amber-500" />
            <span className="bg-amber-100 px-2 py-1 rounded-lg">3. Create Classes</span>
          </div>
          <p className="text-xs text-amber-700 mt-2">Classes must be linked to a term. Subjects and Courses can be set up independently at any time.</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-indigo-50 border-indigo-100 p-4 text-center">
            <p className="text-2xl font-black text-indigo-700">{years.length}</p>
            <p className="text-xs font-semibold text-indigo-700">Academic years</p>
          </div>
          <div className="rounded-2xl border bg-emerald-50 border-emerald-100 p-4 text-center">
            <p className="text-2xl font-black text-emerald-700">{allTerms.length}</p>
            <p className="text-xs font-semibold text-emerald-700">Terms</p>
          </div>
        </div>

        {/* Years + Terms */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Academic years</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyNSWMutation.mutate()}
                disabled={applyNSWMutation.isPending}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1"
                title="Seed NSW 2026 Terms 1–4"
              >
                <CalendarDays size={11} />
                {applyNSWMutation.isPending ? 'Applying…' : 'NSW 2026'}
              </button>
              <span className="text-gray-200">|</span>
              <button onClick={() => setShowAddYear(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Plus size={12} /> Add year
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : years.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
                <CalendarDays size={18} />
              </div>
              <p className="text-sm text-gray-500">No academic years yet.</p>
              <button
                onClick={() => applyNSWMutation.mutate()}
                disabled={applyNSWMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                <CalendarDays size={13} />
                {applyNSWMutation.isPending ? 'Applying…' : 'Apply NSW 2026 calendar'}
              </button>
              <p className="text-xs text-gray-400">Seeds Terms 1–4 with official NSW dates. You can edit them afterwards.</p>
              <div className="pt-1">
                <button
                  onClick={() => setShowAddYear(true)}
                  className="text-xs font-bold text-gray-500 hover:text-indigo-600 underline"
                >
                  Or add a custom academic year
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {years.map(yr => {
                const terms = termsByYear(yr.id);
                const isOpen = expandedYears.has(yr.id);
                return (
                  <li key={yr.id} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 group">
                      <button onClick={() => toggleYear(yr.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                        {isOpen ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                          {yr.yearNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm">{yr.name}</p>
                          <p className="text-xs text-gray-500">{terms.length} term{terms.length !== 1 ? 's' : ''}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setAddTermForYear(yr)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-indigo-50"
                      >
                        <Plus size={11} /> Add term
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${yr.name} and all its terms?`)) deleteYearMutation.mutate(yr.id); }}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 text-gray-300 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {terms.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-xs text-gray-400">No terms yet.</p>
                            <button onClick={() => setAddTermForYear(yr)} className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto">
                              <Plus size={11} /> Add first term
                            </button>
                          </div>
                        ) : terms.map(t => (
                          <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 group/term hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500">{fmt(t.startDate)} → {fmt(t.endDate)}</p>
                            </div>
                            <button
                              onClick={() => { if (confirm(`Delete ${t.name}? Classes linked to this term will also be removed.`)) deleteTermMutation.mutate(t.id); }}
                              className="w-6 h-6 rounded-lg hover:bg-rose-50 text-gray-200 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover/term:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {showAddYear && companyId && (
        <AddYearModal companyId={companyId} onClose={() => setShowAddYear(false)} />
      )}
      {addTermForYear && companyId && (
        <AddTermModal year={addTermForYear} companyId={companyId} onClose={() => setAddTermForYear(null)} />
      )}
    </div>
  );
}

function AddYearModal({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [yearNumber, setYearNumber] = useState(new Date().getFullYear());
  const [name, setName] = useState('');

  const m = useMutation({
    mutationFn: () => apiRequest(`/api/companies/${companyId}/academic-years`, 'POST', {
      yearNumber,
      name: name.trim() || String(yearNumber),
      isActive: true,
    }),
    onSuccess: () => {
      toast({ title: 'Academic year created' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-years`] });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Could not create year', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black flex items-center gap-2"><Plus size={16} className="text-indigo-600" /> New academic year</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Year <span className="text-rose-500">*</span></label>
            <input
              type="number"
              value={yearNumber}
              onChange={e => setYearNumber(Number(e.target.value))}
              min={2020} max={2035}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Label</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`${yearNumber} (leave blank to use year)`}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">Cancel</button>
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> {m.isPending ? 'Creating…' : 'Create year'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTermModal({ year, companyId, onClose }: { year: AcademicYear; companyId: string; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const m = useMutation({
    mutationFn: () => apiRequest(`/api/companies/${companyId}/academic-terms`, 'POST', {
      academicYearId: year.id,
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive: true,
    }),
    onSuccess: () => {
      toast({ title: 'Term added' });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      qc.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Could not add term', description: e.message, variant: 'destructive' }),
  });

  const valid = name.trim().length >= 1 && startDate && endDate && endDate > startDate;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black flex items-center gap-2"><Plus size={16} className="text-indigo-600" /> Add term</h3>
            <p className="text-xs text-gray-500 mt-0.5">Under: <span className="font-semibold">{year.name}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Term name <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Term 1, Spring Semester"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Start date <span className="text-rose-500">*</span></label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">End date <span className="text-rose-500">*</span></label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">Cancel</button>
          <button
            onClick={() => m.mutate()}
            disabled={!valid || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> {m.isPending ? 'Adding…' : 'Add term'}
          </button>
        </div>
      </div>
    </div>
  );
}
