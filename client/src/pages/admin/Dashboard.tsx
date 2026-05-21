import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield, Building2, GraduationCap, TrendingUp, Activity, CheckCircle, ChevronRight, Layers, Bell, LogOut } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  students: number;
  tutors: number;
  parents: number;
  companyAdmins: number;
  admins: number;
  totalCompanies: number;
  individualBusinesses?: number;
  multiTutorBusinesses?: number;
  totalClasses?: number;
  pendingInvites?: number;
  totalAssignments?: number;
  totalSubmissions?: number;
  completionRate?: number;
  systemStatus: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, logoutMutation } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple admin header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Shield size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Admin Portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">eSlate platform</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/25 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.systemStatus || 'Online'}
              </Badge>
              <div className="hidden md:flex items-center gap-2 text-xs text-purple-100">
                <Bell size={14} />
                <span>Welcome, {user?.firstName || 'Admin'}</span>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-60"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">{logoutMutation.isPending ? 'Signing out…' : 'Sign out'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/admin/users">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm py-2.5 px-5 font-medium">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/companies">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white shadow-sm py-2.5 px-5 font-medium">
              <Building2 className="h-4 w-4 mr-2" />
              Tutors & Companies
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 py-2.5 px-5 font-medium shadow-sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total users</p>
                  <div className="text-3xl font-bold text-purple-700">{stats?.totalUsers || 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All accounts
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Businesses</p>
                  <div className="text-3xl font-bold text-purple-700">{stats?.totalCompanies || 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    {(stats?.individualBusinesses ?? 0)} solo · {(stats?.multiTutorBusinesses ?? 0)} multi
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Classes</p>
                  <div className="text-3xl font-bold text-purple-700">{stats?.totalClasses ?? 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Across all businesses
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending invites</p>
                  <div className="text-3xl font-bold text-purple-700">{stats?.pendingInvites ?? 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Awaiting accept
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Breakdown Card */}
          <Card className="lg:col-span-2 border border-purple-100 shadow-sm bg-white">
            <CardHeader className="border-b border-purple-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                User breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-700" />
                    </div>
                    <span className="font-medium text-gray-700">Platform admins</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-700">{stats?.admins ?? 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Layers className="h-5 w-5 text-amber-700" />
                    </div>
                    <span className="font-medium text-gray-700">Business owners</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-700">{stats?.companyAdmins || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <span className="font-medium text-gray-700">Tutors</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">{stats?.tutors || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-emerald-700" />
                    </div>
                    <span className="font-medium text-gray-700">Students</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">{stats?.students || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border border-purple-100 shadow-sm bg-white">
            <CardHeader className="border-b border-purple-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                System status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div>
                <p className="text-gray-500 text-sm mb-1">Health</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-xl font-bold text-green-600">{stats?.systemStatus || 'Online'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-gray-500 text-xs mb-1">Pending invites</p>
                  <p className="text-xl font-bold text-purple-700">{stats?.pendingInvites ?? 0}</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-gray-500 text-xs mb-1">Classes</p>
                  <p className="text-xl font-bold text-purple-700">{stats?.totalClasses ?? 0}</p>
                </div>
              </div>

              <Link href="/admin/companies">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  View all profiles
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
