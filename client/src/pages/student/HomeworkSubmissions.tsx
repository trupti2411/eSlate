import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  FileText,
  Download,
  MessageSquare,
  Star,
  Calendar,
  Send,
  Save
} from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  status: string;
  attachmentUrls: string[];
  allowedFileTypes: string[];
  createdAt: string;
  tutor: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  submission?: Submission;
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
  isVerifiedByParent: boolean;
  parentComments: string;
  needsRevision: boolean;
}

export default function HomeworkSubmissions() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionData, setSubmissionData] = useState({
    content: "",
    fileUrls: [] as string[],
    isDraft: true,
  });

  // Fetch student assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/student/assignments"],
  });

  // Submit homework mutation
  const submitHomeworkMutation = useMutation({
    mutationFn: async ({ assignmentId, submissionData }: { assignmentId: string; submissionData: typeof submissionData }) => {
      return await apiRequest(`/api/assignments/${assignmentId}/submit`, "POST", submissionData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: submissionData.isDraft ? "Draft saved successfully" : "Homework submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] });
      setSelectedAssignment(null);
      setSubmissionData({ content: "", fileUrls: [], isDraft: true });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit homework",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("/api/homework/upload", "POST");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const uploadedUrls = result.successful.map(file => file.uploadURL as string);
    setSubmissionData(prev => ({
      ...prev,
      fileUrls: [...prev.fileUrls, ...uploadedUrls]
    }));
  };

  const openSubmissionDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    // Pre-populate with existing submission data if available
    if (assignment.submission) {
      setSubmissionData({
        content: assignment.submission.content || "",
        fileUrls: assignment.submission.fileUrls || [],
        isDraft: assignment.submission.isDraft,
      });
    } else {
      setSubmissionData({ content: "", fileUrls: [], isDraft: true });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'parent_verified': return 'bg-purple-100 text-purple-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 'text-red-600'; // Overdue
    if (hoursUntilDue < 24) return 'text-orange-600'; // Due soon
    if (hoursUntilDue < 72) return 'text-yellow-600'; // Due this week
    return 'text-gray-600'; // Due later
  };

  const pendingAssignments = assignments.filter(a => 
    !a.submission || a.submission.status === 'draft' || a.submission.needsRevision
  );

  const completedAssignments = assignments.filter(a => 
    a.submission && ['submitted', 'graded', 'parent_verified'].includes(a.submission.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Homework</h1>
          <p className="text-gray-600 mt-1">Complete and submit your assignments</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Graded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {assignmentsLoading ? (
              <div className="text-center py-8">Loading assignments...</div>
            ) : pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">You have no pending assignments.</p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.submission && (
                          <Badge variant="outline" className={getStatusColor(assignment.submission.status)}>
                            {assignment.submission.status === 'draft' ? 'Draft Saved' : assignment.submission.status}
                          </Badge>
                        )}
                        {new Date(assignment.dueDate) < new Date() && (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Clock className={`w-4 h-4 mr-1 ${getPriorityColor(assignment.dueDate)}`} />
                          <span className={getPriorityColor(assignment.dueDate)}>
                            Due: {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Star className="w-4 h-4 mr-1" />
                          {assignment.maxPoints} points
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {assignment.tutor.user.firstName} {assignment.tutor.user.lastName}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2">{assignment.instructions}</p>

                      {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Assignment Files:</p>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachmentUrls.map((url, index) => (
                              <Button key={index} variant="outline" size="sm">
                                <Download className="w-3 h-3 mr-1" />
                                File {index + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        {assignment.submission?.needsRevision && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            Revision Required
                          </Badge>
                        )}
                        <Button onClick={() => openSubmissionDialog(assignment)}>
                          <FileText className="w-4 h-4 mr-2" />
                          {assignment.submission ? 'Edit Submission' : 'Start Assignment'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedAssignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed assignments</h3>
                  <p className="text-gray-600">Completed assignments will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completedAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(assignment.submission!.status)}>
                          {assignment.submission!.status}
                        </Badge>
                        {assignment.submission!.score && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {assignment.submission!.score}/{assignment.maxPoints}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Submitted: {new Date(assignment.submission!.submittedAt).toLocaleDateString()}
                        </div>
                        {assignment.submission!.isLate && (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Late Submission
                          </Badge>
                        )}
                      </div>

                      {assignment.submission!.feedback && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900 mb-1">Tutor Feedback:</p>
                          <p className="text-blue-800 text-sm">{assignment.submission!.feedback}</p>
                        </div>
                      )}

                      {assignment.submission!.isVerifiedByParent && (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified by Parent
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="graded">
          <Card>
            <CardHeader>
              <CardTitle>Graded Assignments</CardTitle>
              <CardDescription>View your graded homework and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Graded assignments will appear here once your tutor reviews them.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Dialog */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-6">
              {/* Assignment Instructions */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Due Date Warning */}
              {new Date(selectedAssignment.dueDate) < new Date() && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm font-medium">
                      This assignment is overdue. Late submissions may receive reduced points.
                    </p>
                  </div>
                </div>
              )}

              {/* Revision Required Notice */}
              {selectedAssignment.submission?.needsRevision && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-orange-500 mr-2" />
                    <div>
                      <p className="text-orange-700 text-sm font-medium">Revision Required</p>
                      {selectedAssignment.submission.revisionFeedback && (
                        <p className="text-orange-600 text-sm mt-1">
                          {selectedAssignment.submission.revisionFeedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                submitHomeworkMutation.mutate({
                  assignmentId: selectedAssignment.id,
                  submissionData
                });
              }} className="space-y-4">
                
                {/* Text Response */}
                <div>
                  <Label htmlFor="content">Your Response</Label>
                  <Textarea
                    id="content"
                    value={submissionData.content}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your homework response here..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label>Upload Files</Label>
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    allowedFileTypes={selectedAssignment.allowedFileTypes}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="mt-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </ObjectUploader>
                  {submissionData.fileUrls.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{submissionData.fileUrls.length} file(s) uploaded</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setSubmissionData(prev => ({ ...prev, isDraft: true }));
                      submitHomeworkMutation.mutate({
                        assignmentId: selectedAssignment.id,
                        submissionData: { ...submissionData, isDraft: true }
                      });
                    }}
                    disabled={submitHomeworkMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setSubmissionData(prev => ({ ...prev, isDraft: false }));
                      submitHomeworkMutation.mutate({
                        assignmentId: selectedAssignment.id,
                        submissionData: { ...submissionData, isDraft: false }
                      });
                    }}
                    disabled={submitHomeworkMutation.isPending || (!submissionData.content.trim() && submissionData.fileUrls.length === 0)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitHomeworkMutation.isPending ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}