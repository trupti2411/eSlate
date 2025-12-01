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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Admin Portal</h1>
                <p className="text-gray-500 text-sm">System management and platform oversight</p>
              </div>
            </div>
            <Shield className="h-12 w-12 text-black opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/users">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 py-3 px-6 font-semibold">
              <UserPlus className="h-5 w-5 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/companies">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 py-3 px-6 font-semibold">
              <Building2 className="h-5 w-5 mr-2" />
              Companies
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="border-2 border-black hover:bg-gray-100 py-3 px-6 font-semibold">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats?.totalAssignments || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Total created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats?.completionRate || 0}%</div>
              <p className="text-xs text-gray-600 mt-1">Submissions done</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats?.totalCompanies || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Active companies</p>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-2 border-black lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-black font-medium">Students</span>
                  <span className="text-black font-bold">{stats?.students || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-black font-medium">Tutors</span>
                  <span className="text-black font-bold">{stats?.tutors || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-black font-medium">Parents</span>
                  <span className="text-black font-bold">{stats?.parents || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-black font-medium">Company Admins</span>
                  <span className="text-black font-bold">{stats?.companyAdmins || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-600">{stats?.systemStatus || 'Good'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Submissions</p>
                <p className="text-2xl font-bold text-black">{stats?.totalSubmissions || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
