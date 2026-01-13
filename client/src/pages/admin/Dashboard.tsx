import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield, Building2, GraduationCap, TrendingUp, Activity, CheckCircle, ChevronRight, Layers, Bell } from "lucide-react";

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
      {/* Light Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Master Admin Portal</h1>
                <p className="text-gray-500 mt-1">System management and platform oversight</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.systemStatus || 'Online'}
              </Badge>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Bell className="h-4 w-4" />
                <span>Welcome, {user?.firstName || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/admin/users">
            <Button className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm py-2.5 px-5 font-medium">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/companies">
            <Button className="bg-gray-700 hover:bg-gray-800 text-white shadow-sm py-2.5 px-5 font-medium">
              <Building2 className="h-4 w-4 mr-2" />
              Companies
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 py-2.5 px-5 font-medium shadow-sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active accounts
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Companies</p>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalCompanies || 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    Active businesses
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Assignments</p>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalAssignments || 0}</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Total created
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completion</p>
                  <div className="text-3xl font-bold text-gray-900">{stats?.completionRate || 0}%</div>
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Submissions done
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Breakdown Card */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                User Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">Students</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.students || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">Tutors</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.tutors || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-700">Parents</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.parents || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Layers className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-medium text-gray-700">Company Admins</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.companyAdmins || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div>
                <p className="text-gray-500 text-sm mb-1">Health Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-xl font-bold text-green-600">{stats?.systemStatus || 'Good'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 text-xs mb-1">Submissions</p>
                  <p className="text-xl font-bold text-gray-900">{stats?.totalSubmissions || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 text-xs mb-1">Admins</p>
                  <p className="text-xl font-bold text-gray-900">{stats?.admins || 1}</p>
                </div>
              </div>

              <Link href="/admin/companies">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700">
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
