import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Edit,
  Plus,
  Upload
} from "lucide-react";

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

interface Tutor {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Student {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TutorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // Fetch assignments, tutors, and students
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  let companyId: string | undefined;
  if (user?.role === 'tutor') {
    // For tutors, we need to get their company ID from their tutor profile
    const { data: tutorProfile } = useQuery({
      queryKey: [`/api/tutors/${user.id}`],
      enabled: !!user && user.role === 'tutor',
    });
    companyId = tutorProfile?.companyId;
  } else if (user?.role === 'company_admin') {
    // For company admins, we need to get their company ID from their admin profile
    const { data: adminProfile } = useQuery({
      queryKey: [`/api/admin/company-admin/${user.id}`],
      enabled: !!user && user.role === 'company_admin',
    });
    companyId = adminProfile?.companyId;
  }

  const { data: tutors = [] } = useQuery<Tutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  // State and mutations for editing tutors
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State and mutation for assignment creation
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
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
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Mutation for updating tutors
  const updateTutorMutation = useMutation({
    mutationFn: async (tutorData: any) => {
      if (!companyId || !selectedTutor) return;
      const response = await apiRequest(`/api/companies/${companyId}/tutors/${selectedTutor.id}`, "PUT", tutorData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tutor",
        variant: "destructive",
      });
    },
  });

  // File upload handlers
  const handleGetUploadParameters = async () => {
    try {
      console.log("Getting upload parameters...");
      const response = await fetch('/api/homework/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log("Server response status:", response.status);
      console.log("Server response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (!data.uploadURL) {
        console.error("No uploadURL in response:", data);
        throw new Error("No uploadURL received from server");
      }

      // Validate the URL format
      if (!data.uploadURL.startsWith('https://')) {
        console.error("Invalid uploadURL format:", data.uploadURL);
        throw new Error(`Invalid upload URL format: ${data.uploadURL}`);
      }

      return data;
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  };

  const handleUploadComplete = (result: any) => {
    console.log("Upload complete result:", result);
    if (result.successful && result.successful.length > 0) {
      const newFileUrls = result.successful.map((file: any) => {
        // Extract file name and create a proper URL
        const fileName = file.name || file.id;
        return `/homework/${fileName}`;
      });
      setUploadedFiles(prev => [...prev, ...newFileUrls]);
      setNewAssignment(prev => ({
        ...prev,
        attachmentUrls: [...prev.attachmentUrls, ...newFileUrls]
      }));
      toast({
        title: "Success",
        description: `${result.successful.length} file(s) uploaded successfully`,
      });
    }
    
    if (result.failed && result.failed.length > 0) {
      console.error("Upload failures:", result.failed);
      toast({
        title: "Upload Error",
        description: `${result.failed.length} file(s) failed to upload`,
        variant: "destructive",
      });
    }
  };

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      // Add the createdBy field from the current user
      const assignmentWithCreator = {
        ...assignmentData,
        createdBy: user?.id,
      };
      return await apiRequest("/api/assignments", "POST", assignmentWithCreator);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      setIsCreateAssignmentOpen(false);
      setUploadedFiles([]);
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
      console.error("Assignment creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
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
            <Link href="/company">
              <Button variant="outline" size="sm" className="mb-3 border-black text-black hover:bg-gray-100">
                ← Back to Company
              </Button>
            </Link>
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

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Company overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="eink-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-gray-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{tutors.length}</p>
                      <p className="text-gray-600 text-sm">Total Tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="eink-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <GraduationCap className="h-8 w-8 text-gray-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{students.length}</p>
                      <p className="text-gray-600 text-sm">Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="eink-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-gray-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{assignments.length}</p>
                      <p className="text-gray-600 text-sm">Assignments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="eink-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-gray-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">
                        {assignments.reduce((total, assignment) => 
                          total + (assignment.submissions?.filter(sub => sub.status === 'submitted' && !sub.score).length || 0), 0
                        )}
                      </p>
                      <p className="text-gray-600 text-sm">Pending Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Assignment Section */}
            <Card className="eink-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Assignment Management
                  </CardTitle>
                  <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>
                          Create a new assignment for your students to complete.
                        </DialogDescription>
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
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={newAssignment.instructions}
                            onChange={(e) => setNewAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                            placeholder="Detailed instructions for students"
                            rows={4}
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
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxPoints">Max Points</Label>
                            <Input
                              id="maxPoints"
                              type="number"
                              value={newAssignment.maxPoints}
                              onChange={(e) => setNewAssignment(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                              min="1"
                              max="1000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Select Students</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="select-all"
                                checked={newAssignment.studentIds.length === students.length && students.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewAssignment(prev => ({ ...prev, studentIds: students.map(s => s.id) }));
                                  } else {
                                    setNewAssignment(prev => ({ ...prev, studentIds: [] }));
                                  }
                                }}
                              />
                              <Label htmlFor="select-all" className="text-sm">
                                All Students ({students.length})
                              </Label>
                            </div>
                            <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                              {students.length === 0 ? (
                                <p className="text-sm text-gray-500">No students available</p>
                              ) : (
                                students.map((student) => (
                                  <div key={student.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`student-${student.id}`}
                                      checked={newAssignment.studentIds.includes(student.id)}
                                      onChange={(e) => {
                                        const currentIds = newAssignment.studentIds;
                                        const newIds = e.target.checked
                                          ? [...currentIds, student.id]
                                          : currentIds.filter(id => id !== student.id);
                                        setNewAssignment(prev => ({ ...prev, studentIds: newIds }));
                                      }}
                                    />
                                    <Label htmlFor={`student-${student.id}`} className="text-sm">
                                      {student.user?.firstName} {student.user?.lastName}
                                    </Label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          {newAssignment.studentIds.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600 mb-1">
                                Selected: {newAssignment.studentIds.length} student(s)
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Assignment Files (Optional)</Label>
                          <ObjectUploader
                            maxNumberOfFiles={5}
                            allowedFileTypes={['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'ppt', 'pptx']}
                            onGetUploadParameters={handleGetUploadParameters}
                            onComplete={handleUploadComplete}
                            buttonClassName="mt-2"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Assignment Files
                          </ObjectUploader>
                          {uploadedFiles.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600 mb-1">Uploaded files:</p>
                              <div className="space-y-1">
                                {uploadedFiles.map((fileUrl, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <FileText className="w-3 h-3 mr-1" />
                                    File {index + 1}
                                  </div>
                                ))}
                              </div>
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
              </CardHeader>
            </Card>
          </div>

          {/* Right column - Recent activity and quick actions */}
          <div className="space-y-6">
            {/* Recent Assignments & Submissions */}
            <Card className="eink-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Recent Assignments & Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No assignments yet</p>
                ) : (
                  assignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{assignment.title}</h4>
                          <p className="text-xs text-gray-500">
                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {assignment.status}
                        </Badge>
                      </div>

                      {assignment.submissions && assignment.submissions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600">Submissions:</p>
                          {assignment.submissions.slice(0, 2).map((submission: any) => (
                            <div key={submission.id} className="flex items-center justify-between text-xs">
                              <span className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                {submission.student?.user?.firstName} {submission.student?.user?.lastName}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    submission.status === 'submitted' && !submission.score ? 'bg-orange-100 text-orange-800' :
                                    submission.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {submission.status === 'submitted' && !submission.score ? 'Needs Grading' : submission.status}
                                </Badge>
                                {submission.score && (
                                  <span className="text-xs font-medium">{submission.score}/{assignment.maxPoints}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {assignment.submissions.length > 2 && (
                            <p className="text-xs text-gray-500">+{assignment.submissions.length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="eink-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite New Tutor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setIsCreateAssignmentOpen(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assignments & Submissions */}
        <div>
          <h2 className="section-title">All Assignments & Submissions</h2>
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