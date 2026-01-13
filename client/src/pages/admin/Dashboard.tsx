import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield, Building2, Home } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-black dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-2 border-black dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">Admin Portal</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">System management and platform oversight</p>
              </div>
            </div>
            <Shield className="h-12 w-12 text-black dark:text-white opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/users">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 py-3 px-6 font-semibold">
              <UserPlus className="h-5 w-5 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/companies">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 py-3 px-6 font-semibold">
              <Building2 className="h-5 w-5 mr-2" />
              Companies
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="border-2 border-black hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 py-3 px-6 font-semibold">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                <BookOpen className="h-4 w-4" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">{stats?.totalAssignments || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-4 w-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">{stats?.completionRate || 0}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Submissions done</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                <Building2 className="h-4 w-4" />
                Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">{stats?.totalCompanies || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active companies</p>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Users className="h-5 w-5" />
                User Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-black dark:text-white font-medium">Students</span>
                  <span className="text-black dark:text-white font-bold">{stats?.students || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-black dark:text-white font-medium">Tutors</span>
                  <span className="text-black dark:text-white font-bold">{stats?.tutors || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-black dark:text-white font-medium">Parents</span>
                  <span className="text-black dark:text-white font-bold">{stats?.parents || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-black dark:text-white font-medium">Company Admins</span>
                  <span className="text-black dark:text-white font-bold">{stats?.companyAdmins || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.systemStatus || 'Good'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Submissions</p>
                <p className="text-2xl font-bold text-black dark:text-white">{stats?.totalSubmissions || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
