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
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";
import { AssignmentCompletionArea } from "@/components/AssignmentCompletionArea";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Component to display submitted files with original filenames in submission area
function SubmittedFilesInSubmission({ fileUrls }: { fileUrls: string[] }) {
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(fileUrls);

  return (
    <div className="mt-3">
      <div className="text-xs text-gray-600 mb-2">Uploaded Files ({fileUrls.length}):</div>
      {isLoadingMetadata ? (
        <div className="text-center py-2">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {fileUrls.map((url, index) => {
            const metadata = fileMetadata?.[index];
            const displayFilename = getDisplayFilename(url, metadata, index);
            const fileExtension = displayFilename.split('.').pop()?.toLowerCase();
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-white border rounded text-xs">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-2 text-blue-600" />
                  <div>
                    <span className="font-medium">{displayFilename}</span>
                    {fileExtension && (
                      <span className="text-gray-500 ml-1">({fileExtension.toUpperCase()})</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const objectPath = url.includes('/uploads/') 
                        ? url.split('/uploads/').pop()
                        : url.split('/').pop();
                      window.open(`/objects/uploads/${objectPath}`, '_blank');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StudentPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // E-ink optimized styles
  const eInkStyles = {
    card: "bg-white border-2 border-black rounded-none",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 rounded-none",
    primaryButton: "bg-black text-white border-2 border-black hover:bg-gray-800 rounded-none",
    badge: "bg-white border border-black text-black rounded-none"
  };

  const studentId = user?.id ? `student-${user.id}` : '';

  // Get student profile to fetch the student-specific ID
  const { data: studentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student'
  });

  const studentDbId = studentProfile?.id || '';

  // Query for student terms
  const { data: studentTerms = [], isLoading: isLoadingTerms } = useQuery({
    queryKey: ['/api/students', studentDbId, 'terms'],
    enabled: !!studentDbId
  });

  // Query for student classes
  const { data: studentClasses = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId
  });

  // Query for student assignments
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['/api/students', studentDbId, 'assignments'],
    enabled: !!studentDbId
  });

  // Query for student submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['/api/students', studentDbId, 'submissions'],
    enabled: !!studentDbId
  });

  // Type assertions for the query data
  const typedStudentTerms = studentTerms as AcademicTerm[];
  const typedStudentClasses = studentClasses as Class[];
  const typedAssignments = assignments as Assignment[];
  const typedSubmissions = submissions as Submission[];

  // Mutation for submitting assignments
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, content, fileUrls }: { assignmentId: string; content?: string; fileUrls?: string[] }) => {
      return apiRequest('/api/submissions', 'POST', {
        assignmentId,
        content: content || '',
        fileUrls: fileUrls || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentDbId, 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentDbId, 'assignments'] });
      toast({
        title: "Assignment submitted successfully",
        description: "Your assignment has been submitted for review.",
      });
    },
    onError: (error) => {
      console.error('Submit assignment error:', error);
      toast({
        title: "Failed to submit assignment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = typedSubmissions.find((s: Submission) => s.assignmentId === assignment.id);
    if (submission) {
      return submission.status;
    }
    
    const now = new Date();
    const submissionDate = new Date(assignment.submissionDate);
    
    if (isPast(submissionDate)) {
      return 'overdue';
    }
    
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'submitted': 'bg-green-100 text-green-800 border-green-300',
      'graded': 'bg-blue-100 text-blue-800 border-blue-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'overdue': 'bg-red-100 text-red-800 border-red-300',
      'needs_revision': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Assignments</h3>
            <p className="text-3xl font-bold text-black">{typedAssignments.length}</p>
            <p className="text-sm text-gray-600 mt-2">Total assignments</p>
          </CardContent>
        </Card>

        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Completed</h3>
            <p className="text-3xl font-bold text-black">
              {typedSubmissions.filter((s: Submission) => s.status === 'submitted' || s.status === 'graded').length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Assignments submitted</p>
          </CardContent>
        </Card>

        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Due Soon</h3>
            <p className="text-3xl font-bold text-black">
              {typedAssignments.filter((assignment: Assignment) => {
                const dueDate = new Date(assignment.submissionDate);
                const now = new Date();
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays > 0;
              }).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">In next 3 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Terms</h2>
      {isLoadingTerms ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : typedStudentTerms.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No terms found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typedStudentTerms.map((term: AcademicTerm) => (
            <Card key={term.id} className={eInkStyles.card}>
              <CardHeader>
                <CardTitle className="text-lg">{term.name}</CardTitle>
                <CardDescription>No description available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Start:</span> {format(new Date(term.startDate), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {format(new Date(term.endDate), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {term.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
      ) : typedStudentClasses.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {typedStudentClasses.map((classItem: Class) => (
            <Card key={classItem.id} className={eInkStyles.card}>
              <CardHeader>
                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                <CardDescription>{classItem.description || 'No description available'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Schedule:</span> {classItem.daysOfWeek?.join(', ') || 'Not specified'}
                  </div>
                  {classItem.startTime && classItem.endTime && (
                    <div className="text-sm">
                      <span className="font-medium">Time:</span> {classItem.startTime} - {classItem.endTime}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {classItem.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
      ) : typedAssignments.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {typedAssignments.map((assignment: Assignment) => {
            const status = getAssignmentStatus(assignment);
            const submission = typedSubmissions.find((s: Submission) => s.assignmentId === assignment.id);
            const classInfo = typedStudentClasses.find((c: Class) => c.id === assignment.classId);
            
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
                            <p className="text-gray-700 mb-3">{submission.content}</p>
                          )}
                          {/* Display uploaded files */}
                          {submission.fileUrls && submission.fileUrls.length > 0 && (
                            <SubmittedFilesInSubmission fileUrls={submission.fileUrls} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {submission ? (
                        // If there's a submission, show dialog with options
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className={eInkStyles.primaryButton}
                              onClick={() => setSelectedAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View & Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] bg-white border-2 border-black">
                            <DialogHeader>
                              <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
                            </DialogHeader>
                            <AssignmentCompletionArea 
                              assignment={selectedAssignment!} 
                              submission={typedSubmissions.find((s: Submission) => s.assignmentId === selectedAssignment?.id)}
                              onSubmissionUpdate={() => {
                                queryClient.invalidateQueries({ queryKey: ['/api/students', studentDbId, 'submissions'] });
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        // If no submission, go directly to editor
                        <Button 
                          className={eInkStyles.primaryButton}
                          onClick={() => {
                            if (assignment.attachmentUrls && assignment.attachmentUrls.length > 0) {
                              const objectPath = assignment.attachmentUrls[0].includes('/uploads/') 
                                ? assignment.attachmentUrls[0].split('/uploads/').pop()
                                : assignment.attachmentUrls[0].split('/').pop();
                              window.open(`/objects/uploads/${objectPath}?edit=true`, '_blank');
                            }
                          }}
                          disabled={!assignment.attachmentUrls || assignment.attachmentUrls.length === 0}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Complete Online
                        </Button>
                      )}
                      
                      {/* Download Assignment Button */}
                      {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                        <Button 
                          className={eInkStyles.button}
                          onClick={() => {
                            // Download all assignment files
                            assignment.attachmentUrls!.forEach((url: string, index: number) => {
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
                          onComplete={async (result) => {
                            if (result.successful && result.successful.length > 0) {
                              try {
                                // Set metadata for each uploaded file
                                const metadataPromises = result.successful.map(async (file: any) => {
                                  const uploadURL = file.uploadURL as string;
                                  const originalFileName = file.data?.name;
                                  
                                  try {
                                    await apiRequest('/api/objects/metadata', 'POST', {
                                      objectPath: uploadURL.includes('/uploads/') 
                                        ? uploadURL.split('/uploads/')[1] 
                                        : uploadURL.split('/').pop(),
                                      metadata: {
                                        originalFilename: originalFileName || 'unknown'
                                      }
                                    });
                                  } catch (error) {
                                    console.warn('Failed to set metadata for file:', originalFileName, error);
                                  }
                                });
                                
                                // Wait for all metadata to be set
                                await Promise.allSettled(metadataPromises);
                                
                                const newFileUrls = result.successful.map((file: any) => {
                                  const url = file.uploadURL as string;
                                  return url.replace(/\?.*$/, ''); // Remove query parameters
                                });
                                
                                // Get existing file URLs from the current submission
                                const existingFileUrls = submission?.fileUrls || [];
                                
                                // Merge existing and new files
                                const allFileUrls = [...existingFileUrls, ...newFileUrls];
                                
                                submitAssignmentMutation.mutate({
                                  assignmentId: assignment.id,
                                  fileUrls: allFileUrls
                                });
                              } catch (error) {
                                console.error('Error processing upload:', error);
                                toast({
                                  title: "Upload processing failed", 
                                  description: "Files uploaded but failed to process. Please contact support.",
                                  variant: "destructive",
                                });
                              }
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

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="terms">
          {renderTerms()}
        </TabsContent>

        <TabsContent value="classes">
          {renderClasses()}
        </TabsContent>

        <TabsContent value="assignments">
          {renderAssignments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}