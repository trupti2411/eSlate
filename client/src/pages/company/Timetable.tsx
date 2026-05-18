import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  CalendarDays, Bell, LogOut, ArrowLeft, Filter, User, MapPin,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; companyName: string; }

interface ClassRow {
  id: number;
  name: string;
  tutor_id: number | null;
  schedule_day_of_week: number | null;
  schedule_start_time: string | null;
  schedule_end_time: string | null;
  location: string | null;
  status: string;
  tutor?: { id: number; user?: { name?: string } };
  course?: { id: number; name: string } | null;
  subject?: { id: number; name: string } | null;
  yearGroup?: { id: number; label: string } | null;
  terms?: { id: number; name: string; academic_year_id?: number }[];
}

interface YearWithTerms {
  id: number;
  year: number;
  terms?: { id: number; name: string; term_number: number; start_date: string; end_date: string }[];
}

const DAY_LABELS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => 7 + i); // 07:00–20:00

function hhmm(s: string | null | undefined): { h: number; m: number } | null {
  if (!s) return null;
  const m = String(s).match(/^(\d{2}):(\d{2})/);
  if (!m) return null;
  return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
}

// Map a tutor_id (or 'unassigned') to a stable colour swatch.
const SWATCHES = [
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900' },
  { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
  { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900' },
  { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-900' },
  { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-900' },
  { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
];
function swatchFor(key: string | number | null): typeof SWATCHES[number] {
  if (key === null || key === undefined) return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' };
  const n = typeof key === 'number' ? key : key.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return SWATCHES[n % SWATCHES.length];
}

export default function TimetablePage() {
  const { user, logoutMutation } = useAuth();
  const [termFilter, setTermFilter] = useState<string>(''); // '' = all, or term_id
  const [tutorFilter, setTutorFilter] = useState<string>(''); // '' = all

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const { data: classes = [] } = useQuery<ClassRow[]>({
    queryKey: ['/api/classes'],
    enabled: !!user,
  });
  const { data: hierarchy } = useQuery<{ years?: YearWithTerms[] } | YearWithTerms[]>({
    queryKey: [`/api/companies/${companyId}/academic-hierarchy`],
    enabled: !!companyId,
  });
  const academicYears: YearWithTerms[] = useMemo(() => {
    if (!hierarchy) return [];
    return Array.isArray(hierarchy) ? hierarchy : (hierarchy.years ?? []);
  }, [hierarchy]);
  const currentYear = academicYears[0];
  const terms = currentYear?.terms ?? [];

  // Unique tutors among scheduled classes (for the filter dropdown).
  const tutorOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const c of classes) {
      if (c.tutor_id && c.tutor?.user?.name) seen.set(c.tutor_id, c.tutor.user.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [classes]);

  const filtered = useMemo(() => {
    return classes.filter(c => {
      if (!c.schedule_day_of_week || !c.schedule_start_time) return false;
      if (c.status === 'archived') return false;
      if (tutorFilter && String(c.tutor_id ?? '') !== tutorFilter) return false;
      if (termFilter) {
        const inTerm = (c.terms ?? []).some(t => String(t.id) === termFilter);
        if (!inTerm) return false;
      }
      return true;
    });
  }, [classes, tutorFilter, termFilter]);

  const totalScheduled = classes.filter(c => c.schedule_day_of_week && c.schedule_start_time).length;
  const totalUnscheduled = classes.filter(c => !c.schedule_day_of_week || !c.schedule_start_time).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Timetable</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{adminProfile?.companyName ?? 'Loading…'}</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="bg-white rounded-xl border border-gray-200 pl-9 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">All terms</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={tutorFilter}
              onChange={(e) => setTutorFilter(e.target.value)}
              className="bg-white rounded-xl border border-gray-200 pl-9 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">All tutors</option>
              {tutorOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{filtered.length}</span> showing · {totalScheduled} scheduled · {totalUnscheduled} unscheduled
          </div>
        </div>

        {/* Grid: time rows × day columns */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
          <div className="min-w-[800px] grid" style={{ gridTemplateColumns: '64px repeat(7, minmax(0, 1fr))' }}>
            {/* header row */}
            <div className="border-b border-r border-gray-100 bg-gray-50 sticky top-0 z-10" />
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <div key={d} className="border-b border-r border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-gray-500 sticky top-0 z-10">
                {DAY_LABELS[d]}
              </div>
            ))}

            {HOURS.map(hour => (
              <HourRow key={hour} hour={hour} classes={filtered} />
            ))}
          </div>
        </div>

        {totalUnscheduled > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
            {totalUnscheduled} class{totalUnscheduled === 1 ? '' : 'es'} {totalUnscheduled === 1 ? 'has' : 'have'} no schedule yet — they won't show in the grid. Open each on /company/classes and set a day/time.
          </div>
        )}
      </main>
    </div>
  );
}

function HourRow({ hour, classes }: { hour: number; classes: ClassRow[] }) {
  const hh = String(hour).padStart(2, '0');
  return (
    <>
      <div className="border-b border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-right">{hh}:00</div>
      {[1, 2, 3, 4, 5, 6, 7].map(day => {
        // Show a class block in the hour cell where it starts.
        const starting = classes.filter(c => {
          if (c.schedule_day_of_week !== day) return false;
          const start = hhmm(c.schedule_start_time);
          return !!start && start.h === hour;
        });
        return (
          <div key={day} className="border-b border-r border-gray-100 p-1 min-h-[60px] relative">
            {starting.map(c => <ClassBlock key={c.id} c={c} />)}
          </div>
        );
      })}
    </>
  );
}

function ClassBlock({ c }: { c: ClassRow }) {
  const start = hhmm(c.schedule_start_time);
  const end = hhmm(c.schedule_end_time) ?? start;
  if (!start || !end) return null;

  // Visually stretch downward proportional to length (cap at 4 hours).
  const minutes = Math.max(15, (end.h * 60 + end.m) - (start.h * 60 + start.m));
  const cappedHours = Math.min(4, minutes / 60);
  const palette = swatchFor(c.tutor_id);

  const startStr = `${String(start.h).padStart(2, '0')}:${String(start.m).padStart(2, '0')}`;
  const endStr = c.schedule_end_time ? `${String(end.h).padStart(2, '0')}:${String(end.m).padStart(2, '0')}` : '';

  return (
    <Link
      href={`/company/classes/${c.id}`}
      className={`block ${palette.bg} ${palette.border} border-l-4 rounded-lg px-2 py-1 text-[11px] ${palette.text} hover:shadow-md transition-shadow overflow-hidden`}
      style={{ minHeight: `${cappedHours * 60 + 4}px` }}
    >
      <p className="font-black truncate">{c.name}</p>
      <p className="font-semibold opacity-80">{startStr}{endStr ? `–${endStr}` : ''}</p>
      {c.tutor?.user?.name && (
        <p className="opacity-70 truncate flex items-center gap-1"><User size={9} /> {c.tutor.user.name}</p>
      )}
      {c.location && (
        <p className="opacity-70 truncate flex items-center gap-1"><MapPin size={9} /> {c.location}</p>
      )}
    </Link>
  );
}
