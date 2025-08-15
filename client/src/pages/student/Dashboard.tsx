import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import HomeworkCard from "@/components/HomeworkCard";
import ProgressChart from "@/components/ProgressChart";
import MessageCenter from "@/components/MessageCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
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

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/submissions"],
    enabled: !!user,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

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

  const pendingAssignments = assignments?.filter(a => a.status === 'assigned') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
  const unverifiedSubmissions = submissions?.filter(s => !s.isVerifiedByParent) || [];

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="page-title">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Student'}!</p>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{assignments?.length || 0}</div>
              <p className="text-gray-600 text-sm">Total assignments</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{pendingAssignments.length}</div>
              <p className="text-gray-600 text-sm">Need to complete</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {assignments?.filter(a => a.status === 'completed').length || 0}
              </div>
              <p className="text-gray-600 text-sm">Assignments done</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div>
            <h2 className="section-title">Recent Assignments</h2>
            {assignmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="eink-card p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                  <HomeworkCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <Card className="eink-card">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-black mb-2">No Assignments Yet</h3>
                  <p className="text-gray-600">Your tutor hasn't assigned any work yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Progress Overview */}
          <div>
            <h2 className="section-title">Progress Overview</h2>
            {progressLoading ? (
              <div className="eink-card p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <ProgressChart data={progress || []} />
            )}
          </div>
        </div>

        {/* Message Center */}
        <div className="mt-8">
          <h2 className="section-title">Messages</h2>
          <MessageCenter />
        </div>
      </div>
    </Layout>
  );
}