import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
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
  Users,
  Filter
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
  isVerifiedByParent: boolean;
  parentComments: string;
  needsRevision: boolean;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function HomeworkManagement() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("assignments");
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxPoints: 100,
    studentIds: [] as string[],
    attachmentUrls: [] as string[],
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
  });

  // Fetch assignments for the company
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/company/assignments"],
  });

  // Fetch company students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/company/students"],
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: typeof newAssignment) => {
      return await apiRequest("/api/assignments", "POST", assignmentData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/company/assignments"] });
      setIsCreateAssignmentOpen(false);
      setNewAssignment({
        title: "",
        description: "",
        instructions: "",
        dueDate: "",
        maxPoints: 100,
        studentIds: [],
        attachmentUrls: [],
        allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      return await apiRequest(`/api/submissions/${submissionId}/grade`, "POST", { score, feedback });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/company/assignments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
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
    setNewAssignment(prev => ({
      ...prev,
      attachmentUrls: [...prev.attachmentUrls, ...uploadedUrls]
    }));
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

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === "all") return true;
    return assignment.status === statusFilter;
  });

  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="homework-management-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Homework Management</h1>
            <p className="text-muted-foreground mt-1">Create, manage, and grade homework assignments</p>
          </div>
        <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800">
              <BookOpen className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createAssignmentMutation.mutate(newAssignment);
            }} className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the assignment"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Detailed Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Provide detailed instructions for students"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={newAssignment.maxPoints}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, maxPoints: parseInt(e.target.value) }))}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div>
                <Label>Assign to Students</Label>
                <Select onValueChange={(value) => {
                  if (value === "all") {
                    setNewAssignment(prev => ({ ...prev, studentIds: students.map(s => s.id) }));
                  } else {
                    const currentIds = newAssignment.studentIds;
                    const newIds = currentIds.includes(value) 
                      ? currentIds.filter(id => id !== value)
                      : [...currentIds, value];
                    setNewAssignment(prev => ({ ...prev, studentIds: newIds }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students ({students.length})</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                        {newAssignment.studentIds.includes(student.id) && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newAssignment.studentIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {newAssignment.studentIds.length} student(s) selected
                  </p>
                )}
              </div>

              <div>
                <Label>Attach Files (Optional)</Label>
                <ObjectUploader
                  maxNumberOfFiles={5}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Assignment Files
                </ObjectUploader>
                {newAssignment.attachmentUrls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{newAssignment.attachmentUrls.length} file(s) uploaded</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAssignmentMutation.isPending}>
                  {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="border-2 border-black">
          <TabsTrigger value="assignments" data-testid="tab-assignments">All Assignments</TabsTrigger>
          <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions to Grade</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="assigned">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {assignmentsLoading ? (
              <div className="text-center py-8">Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">No assignments found</h3>
                  <p className="text-muted-foreground">Create your first assignment to get started.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="border-2 border-black hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {assignment.maxPoints} points
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {assignment.submissions.length} submission(s)
                        </div>
                      </div>

                      {assignment.submissions.length > 0 && (
                        <div className="pt-3 border-t">
                          <h4 className="font-medium mb-2">Recent Submissions</h4>
                          <div className="space-y-2">
                            {assignment.submissions.slice(0, 3).map((submission) => (
                              <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium">
                                    {submission.student.user.firstName} {submission.student.user.lastName}
                                  </span>
                                  <Badge variant="outline" className={getStatusColor(submission.status)}>
                                    {submission.status}
                                  </Badge>
                                  {submission.isLate && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800">
                                      Late
                                    </Badge>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block w-2 h-2 rounded-full ${
                                      submission.status === 'submitted' ? 'bg-green-500' : 
                                      submission.status === 'graded' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}></span>
                                    <span className="text-sm text-gray-600 capitalize">{submission.status}</span>
                                    {!submission.isVerifiedByParent && (
                                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                        Awaiting Parent Verification
                                      </Badge>
                                    )}
                                    {submission.isVerifiedByParent && (
                                      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                        Parent Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {submission.score && (
                                    <span className="text-sm text-green-600 font-medium">
                                      {submission.score}/{assignment.maxPoints}
                                    </span>
                                  )}
                                  <Button size="sm" variant="outline">
                                    Review
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Submissions Requiring Grading</CardTitle>
              <CardDescription>Review and grade student submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No submissions requiring grading at this time.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle>Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{assignments.length}</div>
                <p className="text-muted-foreground text-sm">Active assignments</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {assignments.reduce((acc, assignment) => 
                    acc + assignment.submissions.filter(s => s.status === 'submitted').length, 0
                  )}
                </div>
                <p className="text-muted-foreground text-sm">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">--</div>
                <p className="text-muted-foreground text-sm">Across all assignments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}