import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Settings, BarChart3, UserPlus, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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
            <Button className="eink-button">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button className="eink-button">
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
              <div className="text-3xl font-bold text-black">247</div>
              <p className="text-gray-600 text-sm">Active users</p>
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
              <div className="text-3xl font-bold text-black">1,432</div>
              <p className="text-gray-600 text-sm">Total created</p>
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
              <div className="text-3xl font-bold text-black">87%</div>
              <p className="text-gray-600 text-sm">Average completion</p>
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
              <div className="text-3xl font-bold text-green-600">Good</div>
              <p className="text-gray-600 text-sm">System status</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">Manage students, parents, and tutors</p>
            </CardContent>
          </Card>

          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">Content Management</h3>
              <p className="text-gray-600 text-sm">Oversee assignments and resources</p>
            </CardContent>
          </Card>

          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View platform usage statistics</p>
            </CardContent>
          </Card>

          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">System Settings</h3>
              <p className="text-gray-600 text-sm">Configure platform parameters</p>
            </CardContent>
          </Card>

          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">Security</h3>
              <p className="text-gray-600 text-sm">Monitor security and access logs</p>
            </CardContent>
          </Card>

          <Card className="eink-card hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold text-black mb-2">Onboarding</h3>
              <p className="text-gray-600 text-sm">Help new users get started</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="section-title">Recent Activity</h2>
          <Card className="eink-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-black">New tutor registered</p>
                    <p className="text-sm text-gray-600">John Smith joined as Mathematics tutor</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-black">System maintenance completed</p>
                    <p className="text-sm text-gray-600">Database optimization finished successfully</p>
                  </div>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-black">New feature deployed</p>
                    <p className="text-sm text-gray-600">Enhanced progress tracking now available</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
