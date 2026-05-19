import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  Users, BookOpen, GraduationCap, Bell, LogOut, ChevronRight, CalendarDays,
  Trophy, Settings as SettingsIcon, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface TutorProfile {
  id: string;
  business: { id: string; name: string; type: string; tier: string; state_code: string } | null;
  name: string | null;
  compliance_status: string;
  status: string;
}
interface ClassRow {
  id: number;
  name: string;
  status: string;
  schedule_day_of_week: number | null;
  schedule_start_time: string | null;
}
interface StudentRow { id: number }
interface CourseRow { id: number; name: string }

export default function TutorDashboard() {
  const { user, isAuthenticated, isLoading, logoutMutation } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  // Tutor profile gives us business id + type (works for both solo and invited tutors).
  const { data: profile } = useQuery<TutorProfile>({
    queryKey: ['/api/me/tutor-profile'],
    enabled: !!user,
  });
  const businessId = profile?.business?.id;
  const businessName = profile?.business?.name;
  const businessType = profile?.business?.type;
  const isSoloTutor = businessType === 'individual';

  // Classes the tutor runs (backend scopes by tutor_id).
  const { data: classes = [] } = useQuery<ClassRow[]>({
    queryKey: ['/api/classes'],
    enabled: !!user,
  });
  const { data: students = [] } = useQuery<StudentRow[]>({
    queryKey: [`/api/companies/${businessId}/students`],
    enabled: !!businessId,
  });
  const { data: courses = [] } = useQuery<CourseRow[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });

  const scheduledClasses = classes.filter(c => c.schedule_day_of_week && c.schedule_start_time);
  const compliancePending = profile?.compliance_status && profile.compliance_status !== 'compliant';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — matches Business Portal indigo theme for visual consistency */}
      <header className="bg-indigo-700 text-white shadow-lg flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                  {isSoloTutor ? 'Solo tutor portal' : 'Tutor portal'}
                </p>
                <h1 className="text-xl sm:text-2xl font-black truncate">
                  {isSoloTutor ? (businessName ?? 'My tutoring') :
                    (user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Tutor')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/tutor/profile" className="hidden md:inline text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
                My profile
              </Link>
              {isSoloTutor && (
                <Link
                  href="/company/settings"
                  className="hidden md:flex w-9 h-9 rounded-xl hover:bg-white/10 items-center justify-center"
                  aria-label="Business settings"
                  title="Business settings"
                >
                  <SettingsIcon size={16} />
                </Link>
              )}
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Compliance warning if WWCC pending or on hold */}
        {compliancePending && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-amber-900">WWCC compliance: {profile?.compliance_status}</p>
              <p className="text-xs text-amber-800 mt-0.5">
                You won't be assigned to classes with minors until WWCC is captured and active.
              </p>
            </div>
            <Link href="/tutor/profile" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0">
              Update profile
            </Link>
          </div>
        )}

        {/* KPI cards — clickable. Backend scopes data by tutor_id automatically. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            href="/company/classes"
            icon={<BookOpen size={18} />}
            label="My classes"
            value={classes.length}
            sub={scheduledClasses.length > 0 ? `${scheduledClasses.length} scheduled` : 'create your first'}
            tone="indigo"
          />
          <KpiCard
            href={businessId ? `/company/students` : '#'}
            icon={<Users size={18} />}
            label={isSoloTutor ? 'My students' : 'Business students'}
            value={students.length}
            sub={students.length === 0 ? 'add a student' : 'enrolled'}
            tone="emerald"
          />
          <KpiCard
            href="/company/courses"
            icon={<Trophy size={18} />}
            label="Courses"
            value={courses.length}
            sub={courses.length === 0 ? 'set up your catalogue' : 'in catalogue'}
            tone="amber"
          />
          <KpiCard
            href="/company/timetable"
            icon={<CalendarDays size={18} />}
            label="Timetable"
            value={scheduledClasses.length}
            sub="this week"
            tone="rose"
          />
        </div>

        {/* Two-column body: My classes + Quick links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">My classes</h3>
              <Link href="/company/classes" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Manage all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-5">
              {classes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No classes yet.</p>
                  <Link href="/company/classes" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    Create your first class <ChevronRight size={12} />
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {classes.slice(0, 6).map(c => {
                    const dayName = c.schedule_day_of_week ? ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][c.schedule_day_of_week] : null;
                    const time = c.schedule_start_time ? c.schedule_start_time.slice(0, 5) : null;
                    return (
                      <li key={c.id}>
                        <Link
                          href={`/company/classes/${c.id}`}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-lg -mx-2 px-2 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                            <BookOpen size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                            <p className="text-xs text-gray-500">
                              {dayName && time ? `${dayName} ${time}` : 'No schedule yet'} · status: {c.status}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Set up</h3>
            </div>
            <div className="p-3 space-y-1">
              <NavLink href="/company/academic" icon={<CalendarDays size={14} />} label="Academic terms" hint="Apply state pack, edit term dates" />
              <NavLink href="/company/courses" icon={<Trophy size={14} />} label="Courses" hint="Foundation, OC, Selective, custom" />
              <NavLink href="/company/classes" icon={<BookOpen size={14} />} label="Classes" hint="Schedule, roster, assignments" />
              <NavLink href="/company/students" icon={<GraduationCap size={14} />} label="Students" hint="Add, edit, parent contacts" />
              <NavLink href="/company/timetable" icon={<CalendarDays size={14} />} label="Timetable" hint="Week × hour grid" />
              {isSoloTutor && (
                <NavLink href="/company/settings" icon={<SettingsIcon size={14} />} label="Business settings" hint="Name, ABN, logo, subjects" />
              )}
              <NavLink href="/tutor/profile" icon={<Users size={14} />} label="My profile" hint="Bio, rate, WWCC" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const TONE = {
  indigo: { bg: 'bg-white border-indigo-100 hover:border-indigo-300', icon: 'bg-indigo-50 text-indigo-600', value: 'text-indigo-700' },
  emerald: { bg: 'bg-white border-emerald-100 hover:border-emerald-300', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  amber: { bg: 'bg-white border-amber-100 hover:border-amber-300', icon: 'bg-amber-50 text-amber-600', value: 'text-amber-700' },
  rose: { bg: 'bg-white border-rose-100 hover:border-rose-300', icon: 'bg-rose-50 text-rose-600', value: 'text-rose-700' },
} as const;

function KpiCard({
  href, icon, label, value, sub, tone,
}: { href: string; icon: React.ReactNode; label: string; value: number | string; sub: string; tone: keyof typeof TONE }) {
  const t = TONE[tone];
  return (
    <Link href={href} className={`block rounded-2xl border ${t.bg} p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${t.icon} flex items-center justify-center`}>{icon}</div>
        <ChevronRight size={14} className="text-gray-300 mt-1" />
      </div>
      <p className={`text-3xl font-black ${t.value}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs mt-1 text-gray-500">{sub}</p>
    </Link>
  );
}

function NavLink({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-500 truncate">{hint}</p>
      </div>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
    </Link>
  );
}
