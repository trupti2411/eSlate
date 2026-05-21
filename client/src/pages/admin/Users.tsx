import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Users as UsersIcon,
  Search,
  Shield,
  Building2,
  GraduationCap,
  User as UserIcon,
  ArrowLeft,
  Filter,
  LogOut,
  Bell,
  Mail,
  AlertCircle,
} from "lucide-react";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "company_admin" | "tutor" | "student" | "parent" | string;
  isActive: boolean;
  createdAt: string | null;
  business?: {
    id: string;
    name: string;
    type: "individual" | "multi_tutor";
    tier: string;
    relationship: "owner" | "tutor";
  } | null;
  tutorStatus?: string | null;
  complianceStatus?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Platform admin",
  company_admin: "Business owner",
  tutor: "Tutor",
  student: "Student",
  parent: "Parent",
};

const ROLE_TONES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  company_admin: "bg-amber-100 text-amber-800 border-amber-200",
  tutor: "bg-blue-100 text-blue-800 border-blue-200",
  student: "bg-emerald-100 text-emerald-800 border-emerald-200",
  parent: "bg-pink-100 text-pink-800 border-pink-200",
};

export default function UsersManagement() {
  const { user: me, logoutMutation } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users = [], isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const counts = useMemo(() => {
    const acc: Record<string, number> = {
      all: users.length, admin: 0, company_admin: 0, tutor: 0, student: 0, parent: 0,
    };
    for (const u of users) acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.business?.name ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, roleFilter, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple admin header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/admin">
                <button className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={16} />
                </button>
              </Link>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <UsersIcon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Admin Portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">User management</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 text-xs text-purple-100">
                <Bell size={14} />
                <span>Welcome, {me?.firstName ?? "Admin"}</span>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-60"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">{logoutMutation.isPending ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="All users" value={counts.all} icon={<UsersIcon size={16} />} tone="purple" active={roleFilter === "all"} onClick={() => setRoleFilter("all")} />
          <StatCard label="Admins" value={counts.admin} icon={<Shield size={16} />} tone="purple-light" active={roleFilter === "admin"} onClick={() => setRoleFilter("admin")} />
          <StatCard label="Business owners" value={counts.company_admin} icon={<Building2 size={16} />} tone="amber" active={roleFilter === "company_admin"} onClick={() => setRoleFilter("company_admin")} />
          <StatCard label="Tutors" value={counts.tutor} icon={<GraduationCap size={16} />} tone="blue" active={roleFilter === "tutor"} onClick={() => setRoleFilter("tutor")} />
          <StatCard label="Students" value={counts.student} icon={<UserIcon size={16} />} tone="emerald" active={roleFilter === "student"} onClick={() => setRoleFilter("student")} />
        </div>

        {/* Search + filter chip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, business"
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {roleFilter !== "all" && (
            <button
              onClick={() => setRoleFilter("all")}
              className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-purple-100"
            >
              <Filter size={11} /> {ROLE_LABELS[roleFilter] ?? roleFilter} · clear
            </button>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {filtered.length} of {users.length}
          </span>
        </div>

        {/* Users table / states */}
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <ErrorState message={(error as Error).message} />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search || roleFilter !== "all"} />
        ) : (
          <UsersTable users={filtered} />
        )}

        {/* Creation hint — canonical creation lives at /admin/companies */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
            <Mail size={16} />
          </div>
          <div className="text-sm text-purple-900 flex-1">
            <p className="font-semibold">Need to add a tutor or tutoring company?</p>
            <p className="text-purple-800/80 mt-0.5">
              All non-admin accounts are created through the invite flow.
              {" "}
              <Link href="/admin/companies" className="font-bold underline hover:text-purple-950">
                Go to Tutor &amp; Company Profiles →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function StatCard({
  label, value, icon, tone, active, onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "purple" | "purple-light" | "amber" | "blue" | "emerald";
  active: boolean;
  onClick: () => void;
}) {
  const tones: Record<string, { bg: string; text: string; border: string; activeRing: string }> = {
    purple:        { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  activeRing: "ring-purple-400" },
    "purple-light": { bg: "bg-purple-50/60", text: "text-purple-600", border: "border-purple-100", activeRing: "ring-purple-400" },
    amber:         { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   activeRing: "ring-amber-400" },
    blue:          { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    activeRing: "ring-blue-400" },
    emerald:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", activeRing: "ring-emerald-400" },
  };
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border ${t.border} shadow-sm p-3 hover:shadow transition-all ${active ? `ring-2 ${t.activeRing} ring-offset-1` : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-2xl font-black ${t.text}`}>{value}</span>
      </div>
      <p className="text-xs font-semibold text-gray-600 mt-2">{label}</p>
    </button>
  );
}

function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        <div className="col-span-4">User</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-3">Business</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Joined</div>
      </div>
      <ul className="divide-y divide-gray-100">
        {users.map((u) => <UserRow key={u.id} u={u} />)}
      </ul>
    </div>
  );
}

function UserRow({ u }: { u: AdminUser }) {
  const displayName = `${u.firstName} ${u.lastName}`.trim() || u.email || `User #${u.id}`;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "?";
  const roleLabel = ROLE_LABELS[u.role] ?? u.role.replace("_", " ");
  const roleTone = ROLE_TONES[u.role] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-AU", { day: "2-digit", month: "short" }) : "—";

  return (
    <li className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-purple-50/40 transition-colors">
      {/* User */}
      <div className="col-span-1 md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center flex-shrink-0 text-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 truncate text-sm">{displayName}</p>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <Mail size={10} /> {u.email}
          </p>
        </div>
      </div>

      {/* Role */}
      <div className="md:col-span-2">
        <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${roleTone}`}>
          {roleLabel}
        </span>
      </div>

      {/* Business */}
      <div className="md:col-span-3 text-sm text-gray-700">
        {u.business ? (
          <div className="min-w-0">
            <p className="font-semibold truncate">{u.business.name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {u.business.type === "individual" ? "Solo tutor" : "Tutoring company"} · {u.business.relationship === "owner" ? "Owner" : "Tutor"}
            </p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      {/* Status */}
      <div className="md:col-span-2">
        {u.role === "tutor" && u.complianceStatus ? (
          <ComplianceBadge status={u.complianceStatus} />
        ) : (
          <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        )}
      </div>

      {/* Joined */}
      <div className="md:col-span-1 text-xs text-gray-500 md:text-right">
        {joined}
      </div>
    </li>
  );
}

function ComplianceBadge({ status }: { status: string }) {
  const tones: Record<string, { bg: string; text: string; border: string; label: string }> = {
    compliant: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Compliant" },
    pending_compliance: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending" },
    compliance_hold: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "On hold" },
  };
  const t = tones[status] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
  return (
    <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${t.bg} ${t.text} ${t.border}`}>
      {t.label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-2 w-48 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
        <UsersIcon size={20} />
      </div>
      <h2 className="text-lg font-black text-gray-900">{hasSearch ? "No users match" : "No users yet"}</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        {hasSearch
          ? "Try a different search or clear the role filter."
          : "Once you invite tutoring companies and solo tutors from the Companies page, they'll show up here."}
      </p>
      {!hasSearch && (
        <Link
          href="/admin/companies"
          className="mt-4 inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
        >
          Go to Companies →
        </Link>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
      <AlertCircle size={18} className="text-rose-700 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-rose-900">
        <p className="font-bold">Couldn't load users</p>
        <p className="text-rose-800/80 mt-1">{message}</p>
      </div>
    </div>
  );
}
