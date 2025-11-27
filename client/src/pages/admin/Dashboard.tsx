import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield, Building2, GraduationCap, UserCheck, Briefcase } from "lucide-react";

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

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, system settings, and platform overview</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/users">
              <Button className="eink-button" data-testid="button-manage-users">
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/companies">
              <Button className="eink-button" data-testid="button-companies">
                <Building2 className="h-4 w-4 mr-2" />
                Companies
              </Button>
            </Link>
            <Button className="eink-button" data-testid="button-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-12 flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black" data-testid="text-total-users">
                    {stats?.totalUsers || 0}
                  </div>
                  <p className="text-gray-600 text-sm">Active users</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-12 flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black" data-testid="text-total-assignments">
                    {stats?.totalAssignments || 0}
                  </div>
                  <p className="text-gray-600 text-sm">Total created</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-12 flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black" data-testid="text-completion-rate">
                    {stats?.completionRate || 0}%
                  </div>
                  <p className="text-gray-600 text-sm">Submissions completed</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" data-testid="text-system-status">
                {stats?.systemStatus || 'Good'}
              </div>
              <p className="text-gray-600 text-sm">System status</p>
            </CardContent>
          </Card>
        </div>

        {/* User Breakdown */}
        <div className="mb-8">
          <h2 className="section-title mb-4">User Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="eink-card">
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-black" data-testid="text-students-count">
                  {statsLoading ? '-' : stats?.students || 0}
                </div>
                <p className="text-gray-600 text-sm">Students</p>
              </CardContent>
            </Card>
            
            <Card className="eink-card">
              <CardContent className="p-4 text-center">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-black" data-testid="text-tutors-count">
                  {statsLoading ? '-' : stats?.tutors || 0}
                </div>
                <p className="text-gray-600 text-sm">Tutors</p>
              </CardContent>
            </Card>
            
            <Card className="eink-card">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-black" data-testid="text-parents-count">
                  {statsLoading ? '-' : stats?.parents || 0}
                </div>
                <p className="text-gray-600 text-sm">Parents</p>
              </CardContent>
            </Card>
            
            <Card className="eink-card">
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-black" data-testid="text-company-admins-count">
                  {statsLoading ? '-' : stats?.companyAdmins || 0}
                </div>
                <p className="text-gray-600 text-sm">Business Admins</p>
              </CardContent>
            </Card>
            
            <Card className="eink-card">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-black" data-testid="text-admins-count">
                  {statsLoading ? '-' : stats?.admins || 0}
                </div>
                <p className="text-gray-600 text-sm">Admins</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="eink-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-black mb-2" data-testid="text-companies-count">
                {statsLoading ? '-' : stats?.totalCompanies || 0}
              </div>
              <p className="text-gray-600">Active tutoring companies</p>
            </CardContent>
          </Card>
          
          <Card className="eink-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-black mb-2" data-testid="text-submissions-count">
                {statsLoading ? '-' : stats?.totalSubmissions || 0}
              </div>
              <p className="text-gray-600">Total assignment submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users">
              <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-user-management">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-black" />
                  <h3 className="text-lg font-semibold text-black mb-2">User Management</h3>
                  <p className="text-gray-600 text-sm">Manage students, parents, and tutors</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/companies">
              <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-company-management">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-black" />
                  <h3 className="text-lg font-semibold text-black mb-2">Company Management</h3>
                  <p className="text-gray-600 text-sm">Manage tutoring companies</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-analytics">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-lg font-semibold text-black mb-2">Analytics</h3>
                <p className="text-gray-600 text-sm">View platform usage statistics</p>
              </CardContent>
            </Card>

            <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-settings">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-lg font-semibold text-black mb-2">System Settings</h3>
                <p className="text-gray-600 text-sm">Configure platform parameters</p>
              </CardContent>
            </Card>

            <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-security">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-lg font-semibold text-black mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Monitor security and access logs</p>
              </CardContent>
            </Card>

            <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors" data-testid="card-onboarding">
              <CardContent className="p-6 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="text-lg font-semibold text-black mb-2">Onboarding</h3>
                <p className="text-gray-600 text-sm">Help new users get started</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
