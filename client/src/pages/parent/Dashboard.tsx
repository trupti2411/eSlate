import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, BookOpen, TrendingUp, Home } from "lucide-react";

export default function ParentDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const verifySubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      await apiRequest(`/api/submissions/${submissionId}/verify`, 'PATCH', {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Submission verified!" });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to verify submission.", variant: "destructive" });
    }
  });

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

  const completedCount = students?.reduce((acc: number, s: any) => 
    acc + (s.submissions?.filter((sub: any) => sub.status === 'submitted').length || 0), 0) || 0;
  const totalSubmissions = students?.reduce((acc: number, s: any) => 
    acc + (s.submissions?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/parent">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Parent Portal</h1>
                <p className="text-gray-500 text-sm">Monitor children's progress and verify work</p>
              </div>
            </div>
            <Users className="h-12 w-12 text-black opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{students?.length || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Under your care</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{totalSubmissions}</div>
              <p className="text-xs text-gray-600 mt-1">Submitted items</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              <p className="text-xs text-gray-600 mt-1">Reviewed submissions</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {totalSubmissions > 0 ? Math.round((completedCount / totalSubmissions) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Children List */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : !students || students.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No children linked to your account</p>
            ) : (
              <div className="space-y-4">
                {students.map((student: any) => (
                  <div key={student.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-black text-lg">
                          {student.user?.firstName} {student.user?.lastName}
                        </h4>
                        <p className="text-xs text-gray-600">Grade {student.gradeLevel || 'N/A'}</p>
                      </div>
                      <Badge className="border-black text-black bg-white">
                        {student.submissions?.length || 0} submissions
                      </Badge>
                    </div>
                    
                    {student.submissions && student.submissions.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {student.submissions.slice(0, 3).map((sub: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{sub.assignmentTitle || `Assignment ${idx + 1}`}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={sub.status === 'submitted' ? 'default' : 'outline'}>
                                {sub.status}
                              </Badge>
                              {sub.status === 'submitted' && !sub.verified && (
                                <Button 
                                  size="sm" 
                                  onClick={() => verifySubmissionMutation.mutate(sub.id)}
                                  disabled={verifySubmissionMutation.isPending}
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  Verify
                                </Button>
                              )}
                              {sub.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
