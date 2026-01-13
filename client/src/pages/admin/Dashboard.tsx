import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield, Building2, GraduationCap, TrendingUp, Activity, CheckCircle, Clock, ChevronRight, Layers, Bell } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  students: number;
  tutors: number;
  parents: number;
  companyAdmins: number;
  admins: number;
  totalCompanies: number;
  totalAssignments: number;
  totalSubmissions: number;
  completionRate: number;
  systemStatus: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Gradient Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Master Admin Portal</h1>
                <p className="text-blue-100 mt-1">System management and platform oversight</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.systemStatus || 'Online'}
              </Badge>
              <div className="hidden md:flex items-center gap-2 text-sm text-blue-100">
                <Bell className="h-4 w-4" />
                <span>Welcome, {user?.firstName || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link href="/admin/users">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all py-3 px-6 font-semibold">
              <UserPlus className="h-5 w-5 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/companies">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all py-3 px-6 font-semibold">
              <Building2 className="h-5 w-5 mr-2" />
              Companies
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 py-3 px-6 font-semibold shadow-sm">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Vibrant Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-blue-100 text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active accounts
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Companies</p>
                  <div className="text-3xl font-bold">{stats?.totalCompanies || 0}</div>
                  <p className="text-purple-100 text-xs mt-1 flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    Active businesses
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Assignments</p>
                  <div className="text-3xl font-bold">{stats?.totalAssignments || 0}</div>
                  <p className="text-green-100 text-xs mt-1 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Total created
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Completion</p>
                  <div className="text-3xl font-bold">{stats?.completionRate || 0}%</div>
                  <p className="text-orange-100 text-xs mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Submissions done
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Breakdown Card */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                User Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">Students</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats?.students || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">Tutors</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{stats?.tutors || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-700">Parents</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats?.parents || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Layers className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-700">Company Admins</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{stats?.companyAdmins || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Health Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-2xl font-bold text-green-400">{stats?.systemStatus || 'Good'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-slate-400 text-xs mb-1">Submissions</p>
                  <p className="text-xl font-bold">{stats?.totalSubmissions || 0}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-slate-400 text-xs mb-1">Admins</p>
                  <p className="text-xl font-bold">{stats?.admins || 1}</p>
                </div>
              </div>

              <Link href="/admin/companies">
                <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                  View All Companies
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
