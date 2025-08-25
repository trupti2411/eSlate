import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Assignment, type Submission, type AcademicTerm, type Class } from "@shared/schema";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  PenTool, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  Upload,
  Send,
  GraduationCap,
  Users,
  PlayCircle,
  Pause,
  RotateCcw,
  Save
} from "lucide-react";
import { format, isAfter, parseISO, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AssignmentCompletionArea } from "@/components/AssignmentCompletionArea";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function StudentPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Get student profile
  const { data: studentProfile } = useQuery<any>({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student',
  });

  const studentId = studentProfile?.id;

  // Submission mutation for uploading completed assignments
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, fileUrls }: { assignmentId: string; fileUrls: string[] }) => {
      return await apiRequest('/api/submissions', 'POST', {
        assignmentId,
        fileUrls,
        content: '',
        isDraft: false,
        status: 'submitted'
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignment submitted successfully!",
        description: "Your completed assignment has been uploaded and submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'submissions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get student's terms (active and non-active)
  const { data: studentTerms = [], isLoading: isLoadingTerms } = useQuery<AcademicTerm[]>({
    queryKey: ['/api/students', studentId, 'terms'],
    enabled: !!studentId,
  });

  // Get student's classes (active and non-active) 
  const { data: studentClasses = [], isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/students', studentId, 'classes'],
    enabled: !!studentId,
  });

  // Get student's assignments
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/students', studentId, 'assignments'],
    enabled: !!studentId,
  });

  // Get submissions for assignments
  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/students', studentId, 'submissions'],
    enabled: !!studentId,
  });

  const eInkStyles = {
    card: "bg-white border-2 border-black rounded shadow-sm",
    activeCard: "bg-white border-2 border-black rounded shadow-md ring-2 ring-gray-300",
    badge: "border border-black bg-white text-black font-medium",
    activeBadge: "border border-black bg-black text-white font-medium",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 font-medium px-4 py-2",
    primaryButton: "bg-black border-2 border-black text-white hover:bg-gray-800 font-medium px-4 py-2",
    textarea: "border-2 border-black bg-white text-black text-lg leading-relaxed font-serif resize-none",
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find(s => s.assignmentId === assignment.id);
    if (submission && submission.status === 'submitted') return 'submitted';
    if (submission && submission.status === 'draft') return 'draft';
    if (isPast(new Date(assignment.submissionDate))) return 'overdue';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'border-green-500 bg-green-50 text-green-700';
      case 'draft': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'overdue': return 'border-red-500 bg-red-50 text-red-700';
      case 'pending': return 'border-blue-500 bg-blue-50 text-blue-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  // Dashboard Summary
  const renderDashboard = () => {
    const totalAssignments = assignments.length;
    const submittedAssignments = assignments.filter(a => 
      submissions.find(s => s.assignmentId === a.id && s.status === 'submitted')
    ).length;
    const draftAssignments = assignments.filter(a => 
      submissions.find(s => s.assignmentId === a.id && s.status === 'draft')
    ).length;
    const overdueAssignments = assignments.filter(a => 
      isPast(new Date(a.submissionDate)) && !submissions.find(s => s.assignmentId === a.id && s.status === 'submitted')
    ).length;
    const upcomingAssignments = assignments.filter(a => 
      !isPast(new Date(a.submissionDate)) && !submissions.find(s => s.assignmentId === a.id && s.status === 'submitted')
    ).length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Welcome, {studentProfile?.firstName || user?.email}!</h1>
          <p className="text-gray-600 mt-2">Your student portal dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={eInkStyles.card}>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-black">{totalAssignments}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </CardContent>
          </Card>
          <Card className={eInkStyles.card}>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-black">{submittedAssignments}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card className={eInkStyles.card}>
            <CardContent className="p-6 text-center">
              <PenTool className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-black">{draftAssignments}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </CardContent>
          </Card>
          <Card className={eInkStyles.card}>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-black">{overdueAssignments}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-black">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className={eInkStyles.primaryButton} 
              onClick={() => setSelectedTab("assignments")}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Assignments
            </Button>
            <Button 
              className={eInkStyles.button}
              onClick={() => setSelectedTab("classes")}
            >
              <Users className="h-4 w-4 mr-2" />
              View Classes
            </Button>
            <Button 
              className={eInkStyles.button}
              onClick={() => setSelectedTab("terms")}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              View Terms
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTerms = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Academic Terms</h2>
      {isLoadingTerms ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : studentTerms.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No academic terms found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentTerms.map((term) => {
            const isActive = term.isActive ?? true;
            return (
              <Card key={term.id} className={isActive ? eInkStyles.activeCard : eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{term.name}</CardTitle>
                    <Badge className={isActive ? eInkStyles.activeBadge : eInkStyles.badge}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(term.startDate), 'MMM dd, yyyy')} - {format(new Date(term.endDate), 'MMM dd, yyyy')}
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Classes</h2>
      {isLoadingClasses ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : studentClasses.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentClasses.map((cls) => {
            const classAssignments = assignments.filter(a => a.classId === cls.id);
            const isActive = cls.isActive ?? true;
            return (
              <Card key={cls.id} className={isActive ? eInkStyles.activeCard : eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge className={isActive ? eInkStyles.activeBadge : eInkStyles.badge}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {cls.subject} • {cls.daysOfWeek?.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assignments:</span>
                      <Badge className={eInkStyles.badge}>{classAssignments.length}</Badge>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{cls.startTime} - {cls.endTime}</span>
                    </div>
                  </div>
                  {classAssignments.length > 0 && (
                    <Button 
                      className={`${eInkStyles.button} w-full mt-4`}
                      onClick={() => {
                        setSelectedTab("assignments");
                        // You could add filtering here
                      }}
                    >
                      View Assignments
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Assignments</h2>
      {isLoadingAssignments ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : assignments.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            const classInfo = studentClasses.find(c => c.id === assignment.classId);
            
            return (
              <Card key={assignment.id} className={eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {classInfo?.name} • {assignment.subject}
                      </CardDescription>
                    </div>
                    <Badge className={`border ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Assignment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Due: {format(new Date(assignment.submissionDate), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Assignment</span>
                      </div>
                    </div>

                    {assignment.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{assignment.description}</p>
                      </div>
                    )}

                    {assignment.instructions && (
                      <div>
                        <h4 className="font-semibold mb-2">Instructions:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{assignment.instructions}</p>
                      </div>
                    )}

                    {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Assignment Materials:</h4>
                        <div className="bg-gray-100 p-3 border rounded text-sm">
                          <p className="text-gray-700">📄 {assignment.attachmentUrls.length} file(s) attached</p>
                          <p className="text-xs text-gray-500 mt-1">Files will be accessible when you start completing the assignment.</p>
                        </div>
                      </div>
                    )}

                    {/* Submission Info */}
                    {submission && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Your Submission:</h4>
                        <div className="bg-gray-50 p-3 rounded border text-sm">
                          <div className="flex justify-between mb-2">
                            <span>Submitted: {format(new Date(submission.submittedAt!), 'MMM dd, yyyy HH:mm')}</span>

                          </div>
                          {submission.content && (
                            <p className="text-gray-700">{submission.content}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className={eInkStyles.primaryButton}
                            onClick={() => setSelectedAssignment(assignment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {submission ? 'View & Edit' : 'Complete Online'}
                          </Button>
                        </DialogTrigger>
                        
                        {/* Download Assignment Button */}
                        {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                          <Button 
                            className={eInkStyles.button}
                            onClick={() => {
                              // Download all assignment files
                              assignment.attachmentUrls!.forEach((url, index) => {
                                const filename = url.split('/').pop() || `assignment-file-${index + 1}`;
                                const objectPath = url.includes('/uploads/') 
                                  ? url.split('/uploads/').pop()
                                  : url.split('/').pop();
                                
                                const link = document.createElement('a');
                                link.href = `/objects/uploads/${objectPath}`;
                                link.download = filename;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                // Add small delay between downloads
                                if (index < assignment.attachmentUrls!.length - 1) {
                                  setTimeout(() => {}, 100);
                                }
                              });
                            }}
                            data-testid="button-download-assignment"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Assignment
                          </Button>
                        )}

                        {/* Upload Completed Assignment Button */}
                        {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                          <ObjectUploader
                            maxNumberOfFiles={5}
                            maxFileSize={31457280} // 30MB
                            onGetUploadParameters={async () => {
                              const response = await apiRequest('/api/objects/upload', 'POST');
                              return {
                                method: 'PUT' as const,
                                url: response.uploadURL,
                              };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const fileUrls = result.successful.map(file => {
                                  const url = file.uploadURL as string;
                                  return url.replace(/\?.*$/, ''); // Remove query parameters
                                });
                                
                                submitAssignmentMutation.mutate({
                                  assignmentId: assignment.id,
                                  fileUrls: fileUrls
                                });
                              } else {
                                toast({
                                  title: "Upload failed", 
                                  description: result.failed && result.failed.length > 0 
                                    ? `Failed to upload ${result.failed.length} file(s). Please try again.`
                                    : "No files were uploaded successfully. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            buttonClassName={eInkStyles.button}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Completed Assignment
                          </ObjectUploader>
                        )}
                        <DialogContent className="max-w-4xl max-h-[80vh] bg-white border-2 border-black">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
                          </DialogHeader>
                          <AssignmentCompletionArea 
                            assignment={assignment} 
                            submission={submission}
                            onSubmissionUpdate={() => {
                              queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'submissions'] });
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Student role required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-black">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="terms" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
          <TabsTrigger 
            value="classes" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <Users className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          {renderTerms()}
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          {renderClasses()}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          {renderAssignments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}