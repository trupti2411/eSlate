import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Assignment, Submission, AcademicTerm, Class } from '@shared/schema';
import { BookOpen, Clock, CheckCircle, GraduationCap, Calendar, FileText, Upload, Download, Edit, Eye } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ObjectUploader } from '@/components/ObjectUploader';
import { useFileMetadata } from '@/hooks/useFileMetadata';
import { PDFAnnotator } from '@/components/PDFAnnotator';

function UploadedFilesList({ fileUrls, className }: { fileUrls: string[], className?: string }) {
  const { data: fileMetadata, isLoading, error } = useFileMetadata(fileUrls[0] || '');

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h4 className="font-medium text-sm">Uploaded Files:</h4>
        <div className="space-y-1">
          {fileUrls.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Loading...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !fileMetadata) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h4 className="font-medium text-sm">Uploaded Files:</h4>
        <div className="space-y-1">
          {fileUrls.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>File {index + 1}</span>
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
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-sm">Uploaded Files:</h4>
      <div className="space-y-1">
        {fileUrls.map((url, index) => {
          const metadata = fileMetadata as any;
          const fileName = metadata?.originalFileName || `File ${index + 1}`;
          
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span title={fileName}>{fileName}</span>
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
    </div>
  );
}

export function StudentPortal() {
  // ALL HOOKS MUST BE DECLARED FIRST - NO EXCEPTIONS!
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [showPDFAnnotator, setShowPDFAnnotator] = useState(false);
  const [annotatingAssignment, setAnnotatingAssignment] = useState<Assignment | null>(null);

  const studentId = user?.id ? `student-${user.id}` : '';

  // Get student profile to fetch the student-specific ID
  const { data: studentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student'
  });

  const studentDbId = (studentProfile as any)?.id || '';

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

  // E-ink optimized styles
  const eInkStyles = {
    card: "bg-white border-2 border-black rounded-none",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 rounded-none",
    primaryButton: "bg-black text-white border-2 border-black hover:bg-gray-800 rounded-none",
    badge: "bg-white border border-black text-black rounded-none"
  };

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

  // NOW we can have conditional returns AFTER all hooks are declared
  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Student role required.</p>
      </div>
    );
  }

  // Show PDF Annotator when annotation mode is active
  if (showPDFAnnotator && annotatingAssignment) {
    return (
      <PDFAnnotator
        pdfUrl={annotatingAssignment.attachmentUrls![0]}
        assignmentId={annotatingAssignment.id}
        onSave={async (annotatedFileUrl: string) => {
          // Submit the annotated file as the assignment
          try {
            submitAssignmentMutation.mutate({
              assignmentId: annotatingAssignment.id,
              fileUrls: [annotatedFileUrl]
            });
            setShowPDFAnnotator(false);
            setAnnotatingAssignment(null);
          } catch (error) {
            console.error('Error submitting annotated assignment:', error);
          }
        }}
        onClose={() => {
          setShowPDFAnnotator(false);
          setAnnotatingAssignment(null);
        }}
      />
    );
  }

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
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typedStudentClasses.map((cls: Class) => (
            <Card key={cls.id} className={eInkStyles.card}>
              <CardHeader>
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <CardDescription>{cls.description || 'No description available'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Days:</span> {cls.daysOfWeek.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {cls.startTime} - {cls.endTime}
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
            const hasAttachments = assignment.attachmentUrls && assignment.attachmentUrls.length > 0;
            const isPDF = hasAttachments && assignment.attachmentUrls!.some((url: string) => 
              url.toLowerCase().includes('.pdf') || url.toLowerCase().endsWith('pdf')
            );

            return (
              <Card key={assignment.id} className={eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(status)} ${eInkStyles.badge}`}>
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Due:</span> {format(new Date(assignment.submissionDate), 'MMM dd, yyyy h:mm a')}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> File Upload
                      </div>
                      <div>
                        <span className="font-medium">Points:</span> Not specified
                      </div>
                    </div>

                    {/* Assignment Materials */}
                    {hasAttachments && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Assignment Materials:</h4>
                        <div className="space-y-1">
                          {assignment.attachmentUrls!.map((url: string, index: number) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const objectPath = url.includes('/uploads/') 
                                  ? url.split('/uploads/').pop()
                                  : url.split('/').pop();
                                window.open(`/objects/uploads/${objectPath}`, '_blank');
                              }}
                              className={`${eInkStyles.button} w-full justify-start text-xs`}
                            >
                              <Download className="h-3 w-3 mr-2" />
                              View Assignment Material {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show uploaded files if submission exists */}
                    {submission && submission.fileUrls && submission.fileUrls.length > 0 && (
                      <UploadedFilesList 
                        fileUrls={submission.fileUrls} 
                        className="border-t pt-3"
                      />
                    )}

                    {/* Assignment Actions */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      {/* Complete Online for PDFs - Always show for testing */}
                      {hasAttachments && !submission && (
                        <Button
                          onClick={() => {
                            console.log('Opening PDF annotator for assignment:', assignment.id);
                            console.log('Assignment attachments:', assignment.attachmentUrls);
                            setAnnotatingAssignment(assignment);
                            setShowPDFAnnotator(true);
                          }}
                          className={eInkStyles.primaryButton}
                          size="sm"
                          data-testid={`button-complete-online-${assignment.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Complete Online
                        </Button>
                      )}

                      {/* Upload Files */}
                      {!submission && (
                        <ObjectUploader
                          onUploadComplete={async (result: any) => {
                            if (result.successful && result.successful.length > 0) {
                              try {
                                // Set original filename metadata for each uploaded file
                                const metadataPromises = result.successful.map(async (file: any) => {
                                  const originalFileName = file.originalName || file.name || 'Unknown file';
                                  const objectPath = file.uploadURL.includes('/uploads/') 
                                    ? file.uploadURL.split('/uploads/').pop().split('?')[0]
                                    : file.uploadURL.split('/').pop().split('?')[0];
                                  
                                  try {
                                    await apiRequest(`/api/objects/uploads/${objectPath}/metadata`, 'POST', {
                                      originalFileName
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
                                const existingFileUrls: string[] = [];
                                
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
            <Calendar className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
          <TabsTrigger 
            value="classes" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
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

        <TabsContent value="dashboard" className="mt-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          {renderTerms()}
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          {renderClasses()}
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          {renderAssignments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}