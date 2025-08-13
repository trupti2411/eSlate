import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, AlertCircle, Clock, BookOpen } from "lucide-react";

export default function ParentDashboard() {
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

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const verifySubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      await apiRequest("PATCH", `/api/submissions/${submissionId}/verify`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission verified successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to verify submission. Please try again.",
        variant: "destructive",
      });
    },
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

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="page-title">Parent Dashboard</h1>
          <p className="text-gray-600">Monitor your children's progress and verify their work</p>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{students?.length || 0}</div>
              <p className="text-gray-600 text-sm">Under your care</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Active Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{students?.length || 0}</div>
              <p className="text-gray-600 text-sm">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {students?.reduce((acc, student) => 
                  acc + (student.submissions?.filter(s => !s.isVerifiedByParent)?.length || 0), 0) || 0}
              </div>
              <p className="text-gray-600 text-sm">Need your approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Students and Their Progress */}
        <div>
          <h2 className="section-title">Your Children</h2>
          {studentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="eink-card p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : students && students.length > 0 ? (
            <div className="space-y-6">
              {students.map((student) => (
                <Card key={student.id} className="eink-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{student.user?.firstName} {student.user?.lastName}</span>
                      <Badge className="status-badge status-assigned">
                        Grade {student.gradeLevel || 'N/A'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Assignments Overview */}
                      <div className="text-center p-4 border border-gray-200 rounded">
                        <div className="text-2xl font-bold text-black">
                          {student.assignments?.length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Total Assignments</p>
                      </div>

                      {/* Completed Work */}
                      <div className="text-center p-4 border border-gray-200 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {student.assignments?.filter(a => a.status === 'completed')?.length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>

                      {/* Pending Verification */}
                      <div className="text-center p-4 border border-gray-200 rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {student.submissions?.filter(s => !s.isVerifiedByParent)?.length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Need Verification</p>
                      </div>
                    </div>

                    {/* Recent Submissions Needing Verification */}
                    {student.submissions?.filter(s => !s.isVerifiedByParent).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-black mb-3">Submissions Awaiting Verification</h4>
                        <div className="space-y-3">
                          {student.submissions
                            .filter(s => !s.isVerifiedByParent)
                            .slice(0, 3)
                            .map((submission) => (
                            <div key={submission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                              <div>
                                <h5 className="font-medium text-black">Assignment #{submission.assignmentId.slice(-6)}</h5>
                                <p className="text-sm text-gray-600">
                                  Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                onClick={() => verifySubmissionMutation.mutate(submission.id)}
                                disabled={verifySubmissionMutation.isPending}
                                className="eink-button-primary"
                              >
                                {verifySubmissionMutation.isPending ? "Verifying..." : "Verify"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="eink-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-black mb-2">No Students Found</h3>
                <p className="text-gray-600">No children are currently linked to your parent account.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
