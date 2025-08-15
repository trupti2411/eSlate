
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, TrendingUp, Download } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  status: string;
  attachmentUrls: string[];
  createdAt: string;
  submissions: Submission[];
}

interface Submission {
  id: string;
  content: string;
  fileUrls: string[];
  status: string;
  isDraft: boolean;
  submittedAt: string;
  isLate: boolean;
  score: number;
  feedback: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function TutorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not tutor/company_admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'tutor' && user.role !== 'company_admin'))) {
      toast({
        title: "Access Denied",
        description: "Tutor or Company Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch assignments based on user role
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
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

  const pendingReview = assignments.reduce((acc, assignment) => 
    acc + assignment.submissions.filter(s => s.status === 'submitted').length, 0
  );

  const totalSubmissions = assignments.reduce((acc, assignment) => 
    acc + assignment.submissions.length, 0
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="page-title">
              {user?.role === 'company_admin' ? 'Company Homework Dashboard' : 'Tutor Dashboard'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'company_admin' ? 'Monitor all company assignments and submissions' : 'Manage your assignments and student submissions'}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Total Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{assignments.length}</div>
              <p className="text-gray-600 text-sm">Created assignments</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{totalSubmissions}</div>
              <p className="text-gray-600 text-sm">Student submissions</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{pendingReview}</div>
              <p className="text-gray-600 text-sm">Need grading</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {assignments.length > 0 ? Math.round((totalSubmissions / assignments.length) * 100) : 0}%
              </div>
              <p className="text-gray-600 text-sm">Average completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments & Submissions */}
        <div>
          <h2 className="section-title">Assignments & Submissions</h2>
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
            <div className="space-y-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="eink-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-black">{assignment.title}</h3>
                        <p className="text-gray-600">{assignment.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                          <span>Max Points: {assignment.maxPoints}</span>
                          <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`status-badge status-${assignment.status}`}>
                          {assignment.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {assignment.submissions.length} submission(s)
                        </span>
                      </div>
                    </div>

                    {/* Assignment attachments */}
                    {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Assignment Files:</h4>
                        <div className="flex gap-2">
                          {assignment.attachmentUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              download
                            >
                              <Download className="w-3 h-3 mr-1" />
                              File {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show all submissions for this assignment */}
                    {assignment.submissions && assignment.submissions.length > 0 ? (
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Student Submissions ({assignment.submissions.length}):
                        </h4>
                        <div className="space-y-4">
                          {assignment.submissions.map((submission) => (
                            <div key={submission.id} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-black">
                                    {submission.student?.user?.firstName} {submission.student?.user?.lastName}
                                  </span>
                                  <Badge className={`text-xs ${
                                    submission.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                    submission.status === 'graded' ? 'bg-blue-100 text-blue-800' :
                                    submission.isDraft ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {submission.isDraft ? 'draft' : submission.status}
                                  </Badge>
                                  {submission.isLate && (
                                    <Badge className="text-xs bg-red-100 text-red-800">
                                      Late
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  {submission.score !== null && (
                                    <span className="text-blue-600 font-medium">
                                      Score: {submission.score}/{assignment.maxPoints}
                                    </span>
                                  )}
                                  <span>
                                    {submission.submittedAt ? 
                                      new Date(submission.submittedAt).toLocaleString() : 
                                      'Not submitted'}
                                  </span>
                                </div>
                              </div>

                              {/* Student message */}
                              {submission.content && (
                                <div className="mb-3 p-3 bg-white rounded border">
                                  <p className="text-sm text-gray-700">
                                    <strong>Student Message:</strong> {submission.content}
                                  </p>
                                </div>
                              )}

                              {/* Files */}
                              {submission.fileUrls && submission.fileUrls.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</p>
                                  <div className="flex gap-2">
                                    {submission.fileUrls.map((fileUrl, fileIndex) => (
                                      <a
                                        key={fileIndex}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        download
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        File {fileIndex + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Feedback */}
                              {submission.feedback && (
                                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-sm text-blue-700">
                                    <strong>Feedback:</strong> {submission.feedback}
                                  </p>
                                </div>
                              )}

                              {/* Action needed indicators */}
                              {submission.status === 'submitted' && !submission.score && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <p className="text-sm text-yellow-700">⏳ Needs grading</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 italic">No submissions yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="eink-card">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-black mb-2">No Assignments Yet</h3>
                <p className="text-gray-600">
                  {user?.role === 'company_admin' ? 
                    'No assignments have been created yet.' : 
                    'Create your first assignment to get started.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
