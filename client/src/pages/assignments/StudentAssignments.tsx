import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { type Assignment, type Submission, type AcademicTerm, type Class } from "@shared/schema";
import { BookOpen, Calendar, Clock, FileText, PenTool, Upload, CheckCircle, AlertCircle, Eye, Download } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { format, isAfter, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function StudentAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [digitalContent, setDigitalContent] = useState("");
  const [deviceType, setDeviceType] = useState<string>("e-ink");
  const [inputMethod, setInputMethod] = useState<string>("pen");

  // Get student profile
  const { data: studentProfile } = useQuery<any>({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student',
  });

  const studentId = studentProfile?.id;

  // Get student's terms and classes
  const { data: studentTerms = [] } = useQuery<AcademicTerm[]>({
    queryKey: ['/api/students', studentId, 'terms'],
    enabled: !!studentId,
  });

  const { data: studentClasses = [] } = useQuery<Class[]>({
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

  // Create/update submission mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async (data: {
      assignmentId: string;
      content: string;
      digitalContent?: string;
      deviceType: string;
      inputMethod: string;
      submissionFiles?: string[];
    }) => {
      return apiRequest('/api/submissions', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'submissions'] });
      setSelectedAssignment(null);
      setSubmissionContent('');
      setDigitalContent('');
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully!',
      });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // File upload state
  const [submissionFiles, setSubmissionFiles] = useState<string[]>([]);

  // Helper function to get assignment status
  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find((s: Submission) => s.assignmentId === assignment.id);
    const now = new Date();
    const dueDate = assignment.submissionDate ? new Date(assignment.submissionDate) : null;
    
    if (submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        return {
          label: 'Graded',
          variant: 'default' as const,
          icon: CheckCircle
        };
      }
      return {
        label: 'Submitted',
        variant: 'secondary' as const,
        icon: CheckCircle
      };
    }
    
    if (dueDate && now > dueDate) {
      return {
        label: 'Overdue',
        variant: 'destructive' as const,
        icon: AlertCircle
      };
    }
    
    return {
      label: 'Active',
      variant: 'outline' as const,
      icon: Clock
    };
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s: Submission) => s.assignmentId === assignmentId);
  };

  const handleFileUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedUrl = result.successful[0].uploadURL;
      setSubmissionFiles(prev => [...prev, uploadedUrl]);
      toast({
        title: "Success", 
        description: "File uploaded successfully",
      });
    }
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/objects/upload', 'POST');
      return {
        method: 'PUT' as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return;

    submitAssignmentMutation.mutate({
      assignmentId: selectedAssignment.id,
      content: submissionContent,
      digitalContent,
      deviceType,
      inputMethod,
      submissionFiles,
    });
  };

  const isAssignmentOverdue = (assignment: Assignment) => {
    if (!assignment.submissionDate) return false;
    return isAfter(new Date(), parseISO(assignment.submissionDate));
  };



  const handleAssignmentSubmit = (isDraft: boolean) => {
    if (!selectedAssignment) return;
    
    submitAssignmentMutation.mutate({
      assignmentId: selectedAssignment.id,
      content: submissionContent,
      digitalContent: digitalContent || undefined,
      deviceType,
      inputMethod,
      isDraft,
    });
  };

  const openAssignmentDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = getSubmissionForAssignment(assignment.id);
    if (existingSubmission) {
      setSubmissionContent(existingSubmission.content || "");
      setDigitalContent(existingSubmission.digitalContent || "");
      setDeviceType(existingSubmission.deviceType || "e-ink");
      setInputMethod(existingSubmission.inputMethod || "pen");
    } else {
      setSubmissionContent("");
      setDigitalContent("");
    }
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">This page is only accessible to students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/student/home">
              <Button variant="outline" size="sm" className="border-black text-black hover:bg-gray-100">
                ← Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <p className="text-muted-foreground">View and complete your assignments</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Terms</TabsTrigger>
          <TabsTrigger value="archived">Archived Terms</TabsTrigger>
          <TabsTrigger value="all-assignments">All Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {studentTerms
              .filter((term: AcademicTerm) => term.isActive)
              .map((term: AcademicTerm) => (
                <Card key={term.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{term.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {format(parseISO(term.startDate), "MMM d, yyyy")} - {format(parseISO(term.endDate), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentClasses
                        .filter((cls: any) => cls.termId === term.id)
                        .map((cls: Class) => (
                          <div key={cls.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{cls.name} - {cls.subject}</h4>
                            <p className="text-sm text-muted-foreground">{cls.description}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="grid gap-4">
            {studentTerms
              .filter((term: AcademicTerm) => !term.isActive)
              .map((term: AcademicTerm) => (
                <Card key={term.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{term.name}</span>
                      <Badge variant="secondary">Archived</Badge>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all-assignments" className="space-y-4">
          {isLoadingAssignments ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">No assignments yet</h3>
                  <p className="text-muted-foreground">Your teachers haven't assigned any work yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment: Assignment) => {
                const status = getAssignmentStatus(assignment);
                const StatusIcon = status.icon;
                
                return (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                          {assignment.subject && (
                            <Badge variant="outline">{assignment.subject}</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={status.variant} className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            <span>{status.label}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Due: {assignment.submissionDate ? format(parseISO(assignment.submissionDate), "MMM d, yyyy 'at' h:mm a") : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Marks:</span>
                          <span className="font-medium">{assignment.totalMarks || 100}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Assignment #{assignment.id.slice(-6)}</span>
                        </div>
                      </div>
                      
                      {assignment.instructions && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Instructions:</p>
                          <p className="text-sm">{assignment.instructions}</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{assignment.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                              </div>
                              {assignment.instructions && (
                                <div>
                                  <h4 className="font-medium mb-2">Instructions</h4>
                                  <p className="text-sm">{assignment.instructions}</p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Due Date:</span>
                                  <p>{assignment.submissionDate ? format(parseISO(assignment.submissionDate), "PPP 'at' p") : "No due date"}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Marks:</span>
                                  <p>{assignment.totalMarks || 100}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          onClick={() => openAssignmentDialog(assignment)}
                          disabled={status.status === 'submitted'}
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          {status.status === 'submitted' ? 'Completed' : 
                           status.status === 'draft' ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assignment Completion Dialog - Optimized for e-ink devices */}
      <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-black">
          <DialogHeader className="border-b-2 border-black pb-4">
            <DialogTitle className="text-2xl font-bold text-black">
              {selectedAssignment?.title}
            </DialogTitle>
            <p className="text-lg text-gray-700">{selectedAssignment?.description}</p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Assignment Details */}
            <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded">
              <h3 className="text-lg font-bold mb-2 text-black">Assignment Details</h3>
              {selectedAssignment?.instructions && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Instructions:</p>
                  <p className="text-black">{selectedAssignment.instructions}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>
                  <p className="text-black">
                    {selectedAssignment?.submissionDate ? 
                      format(parseISO(selectedAssignment.submissionDate), "PPP 'at' p") : 
                      "No due date"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Marks:</span>
                  <p className="text-black">{selectedAssignment?.totalMarks || 100}</p>
                </div>
              </div>
            </div>

            {/* Device Settings for e-ink optimization */}
            <div className="p-4 border-2 border-gray-300 rounded bg-white">
              <h3 className="text-lg font-bold mb-3 text-black">Device Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black font-medium">Device Type</Label>
                  <select 
                    value={deviceType} 
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded bg-white text-black"
                  >
                    <option value="e-ink">E-ink Device</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
                <div>
                  <Label className="text-black font-medium">Input Method</Label>
                  <select 
                    value={inputMethod} 
                    onChange={(e) => setInputMethod(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded bg-white text-black"
                  >
                    <option value="pen">Stylus/Pen</option>
                    <option value="touch">Touch Screen</option>
                    <option value="keyboard">Keyboard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Text Response Area - Optimized for e-ink */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-bold text-black">Your Response</Label>
                <Textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full p-4 border-2 border-black rounded bg-white text-black text-lg leading-relaxed font-mono resize-none"
                  style={{
                    fontSize: '18px',
                    lineHeight: '1.8',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Digital Content Area for pen input */}
              {inputMethod === 'pen' && (
                <div>
                  <Label className="text-lg font-bold text-black">Digital Handwriting</Label>
                  <Textarea
                    value={digitalContent}
                    onChange={(e) => setDigitalContent(e.target.value)}
                    placeholder="Digitized handwriting content will appear here..."
                    rows={4}
                    className="w-full p-4 border-2 border-gray-400 rounded bg-gray-50 text-black text-lg leading-relaxed"
                    readOnly
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This field will be automatically populated when using pen input on compatible devices
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons - High contrast for e-ink */}
            <div className="flex justify-end space-x-4 pt-4 border-t-2 border-black">
              <Button 
                variant="outline" 
                onClick={() => setSelectedAssignment(null)}
                className="border-2 border-black text-black bg-white hover:bg-gray-100 px-6 py-3 text-lg"
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleAssignmentSubmit(true)}
                disabled={submitAssignmentMutation.isPending}
                className="border-2 border-gray-500 text-gray-700 bg-white hover:bg-gray-50 px-6 py-3 text-lg"
              >
                Save Draft
              </Button>
              <Button 
                onClick={() => handleAssignmentSubmit(false)}
                disabled={submitAssignmentMutation.isPending || !submissionContent.trim()}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black px-6 py-3 text-lg"
              >
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}