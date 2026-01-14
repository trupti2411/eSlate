import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { TutorCalendarDashboard } from "@/components/calendar";
import { 
  Users, 
  User,
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
  Upload,
  MapPin,
  X
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
  specialization?: string;
  qualifications?: string;
  availability?: string;
  subjectsTeaching?: string[];
  branch?: string;
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

  // Always call both hooks unconditionally, use enabled flag to control execution
  const { data: tutorProfile, refetch: refetchTutorProfile } = useQuery<{ 
    id: string;
    companyId?: string;
    specialization?: string;
    qualifications?: string;
    availability?: string;
    subjectsTeaching?: string[];
    branch?: string;
  }>({
    queryKey: [`/api/tutors/${user?.id}`],
    enabled: !!user && user.role === 'tutor',
  });

  const { data: adminProfile } = useQuery<{ companyId?: string }>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user && user.role === 'company_admin',
  });

  // Derive companyId from the appropriate profile based on role
  const companyId = user?.role === 'tutor' 
    ? tutorProfile?.companyId 
    : user?.role === 'company_admin' 
      ? adminProfile?.companyId 
      : undefined;

  const { data: tutors = [] } = useQuery<Tutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  // Main tab navigation state
  const [mainTab, setMainTab] = useState<'overview' | 'calendar' | 'profile' | 'submissions'>('overview');
  
  // Grading state
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<string>('');
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    availability: '',
    subjectsTeaching: [] as string[],
    branch: '',
    specialization: '',
    qualifications: ''
  });
  const [newSubject, setNewSubject] = useState('');

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

  // Mutation for updating own profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!tutorProfile?.id) return;
      const response = await apiRequest(`/api/tutors/${tutorProfile.id}`, "PATCH", profileData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      refetchTutorProfile();
      setIsEditingProfile(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Fetch tutor submissions for grading
  interface TutorSubmission {
    id: string;
    assignmentId: string;
    studentId: string;
    content: string;
    digitalContent: any;
    fileUrls: string[];
    status: string;
    isDraft: boolean;
    submittedAt: string;
    isLate: boolean;
    score: number | null;
    feedback: string | null;
    createdAt: string;
    student: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
    assignment: {
      id: string;
      title: string;
      description: string;
      subject: string;
      submissionDate: string;
    };
    class: {
      id: string;
      name: string;
    };
  }

  const { data: tutorSubmissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery<TutorSubmission[]>({
    queryKey: ['/api/tutor/submissions'],
    enabled: !!user && (user.role === 'tutor' || user.role === 'company_admin'),
  });

  // Mutation for grading a submission
  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      const response = await apiRequest(`/api/tutor/submissions/${submissionId}/grade`, 'PATCH', { score, feedback });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      refetchSubmissions();
      setSelectedSubmissionId(null);
      setGradingScore('');
      setGradingFeedback('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive",
      });
    },
  });

  const handleGradeSubmission = (submissionId: string) => {
    const score = parseInt(gradingScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({
        title: "Error",
        description: "Score must be a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    gradeSubmissionMutation.mutate({ submissionId, score, feedback: gradingFeedback });
  };

  // Initialize profile form when tutorProfile loads
  useEffect(() => {
    if (tutorProfile) {
      setProfileForm({
        availability: tutorProfile.availability || '',
        subjectsTeaching: tutorProfile.subjectsTeaching || [],
        branch: tutorProfile.branch || '',
        specialization: tutorProfile.specialization || '',
        qualifications: tutorProfile.qualifications || ''
      });
    }
  }, [tutorProfile]);

  const handleAddSubject = () => {
    if (newSubject.trim() && !profileForm.subjectsTeaching.includes(newSubject.trim())) {
      setProfileForm(prev => ({
        ...prev,
        subjectsTeaching: [...prev.subjectsTeaching, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setProfileForm(prev => ({
      ...prev,
      subjectsTeaching: prev.subjectsTeaching.filter(s => s !== subject)
    }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={mainTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setMainTab('overview')}
            data-testid="tab-overview"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={mainTab === 'calendar' ? 'default' : 'outline'}
            onClick={() => setMainTab('calendar')}
            data-testid="tab-calendar"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          {user?.role === 'tutor' && (
            <Button
              variant={mainTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setMainTab('profile')}
              data-testid="tab-profile"
            >
              <User className="h-4 w-4 mr-2" />
              My Profile
            </Button>
          )}
          <Button
            variant={mainTab === 'submissions' ? 'default' : 'outline'}
            onClick={() => setMainTab('submissions')}
            data-testid="tab-submissions"
          >
            <FileText className="h-4 w-4 mr-2" />
            Student Submissions
            {tutorSubmissions.filter(s => s.status === 'submitted').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {tutorSubmissions.filter(s => s.status === 'submitted').length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Calendar Tab */}
        {mainTab === 'calendar' && (
          <TutorCalendarDashboard />
        )}

        {/* Profile Tab */}
        {mainTab === 'profile' && user?.role === 'tutor' && (
          <div className="max-w-3xl">
            <Card className="eink-card border-2 border-black">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        if (tutorProfile) {
                          setProfileForm({
                            availability: tutorProfile.availability || '',
                            subjectsTeaching: tutorProfile.subjectsTeaching || [],
                            branch: tutorProfile.branch || '',
                            specialization: tutorProfile.specialization || '',
                            qualifications: tutorProfile.qualifications || ''
                          });
                        }
                      }}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <Label className="text-gray-500 text-sm">Name</Label>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <Label className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Availability
                  </Label>
                  {isEditingProfile ? (
                    <Textarea
                      value={profileForm.availability}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                      placeholder="e.g., Mon-Fri 9am-5pm, Weekends 10am-2pm"
                      className="mt-1"
                      data-testid="input-availability"
                    />
                  ) : (
                    <p className="font-medium mt-1">{tutorProfile?.availability || 'Not set'}</p>
                  )}
                </div>

                {/* Subjects Teaching */}
                <div>
                  <Label className="text-gray-500 text-sm flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Subjects Teaching
                  </Label>
                  {isEditingProfile ? (
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Add a subject..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                          data-testid="input-new-subject"
                        />
                        <Button type="button" onClick={handleAddSubject} variant="outline" data-testid="button-add-subject">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profileForm.subjectsTeaching.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(subject)}
                              className="ml-1 hover:text-red-500"
                              data-testid={`button-remove-subject-${index}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tutorProfile?.subjectsTeaching && tutorProfile.subjectsTeaching.length > 0 ? (
                        tutorProfile.subjectsTeaching.map((subject, index) => (
                          <Badge key={index} variant="secondary">{subject}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No subjects set</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <Label className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Branch / Location
                  </Label>
                  {isEditingProfile ? (
                    <Input
                      value={profileForm.branch}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, branch: e.target.value }))}
                      placeholder="e.g., Downtown Center, North Campus"
                      className="mt-1"
                      data-testid="input-branch"
                    />
                  ) : (
                    <p className="font-medium mt-1">{tutorProfile?.branch || 'Not set'}</p>
                  )}
                </div>

                {/* Specialization */}
                <div>
                  <Label className="text-gray-500 text-sm flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Specialization
                  </Label>
                  {isEditingProfile ? (
                    <Input
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="e.g., Advanced Mathematics, SAT Prep"
                      className="mt-1"
                      data-testid="input-specialization"
                    />
                  ) : (
                    <p className="font-medium mt-1">{tutorProfile?.specialization || 'Not set'}</p>
                  )}
                </div>

                {/* Qualifications */}
                <div>
                  <Label className="text-gray-500 text-sm flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Qualifications
                  </Label>
                  {isEditingProfile ? (
                    <Textarea
                      value={profileForm.qualifications}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, qualifications: e.target.value }))}
                      placeholder="e.g., PhD in Mathematics, 10+ years teaching experience"
                      className="mt-1"
                      data-testid="input-qualifications"
                    />
                  ) : (
                    <p className="font-medium mt-1">{tutorProfile?.qualifications || 'Not set'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submissions Tab - View and Grade Student Submissions */}
        {mainTab === 'submissions' && (
          <div className="space-y-6">
            <Card className="eink-card border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Submissions
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  View and grade submitted assignments from your students
                </p>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : tutorSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions to review yet</p>
                    <p className="text-sm">Submissions from your students will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pending Grading */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Needs Grading ({tutorSubmissions.filter(s => s.status === 'submitted').length})
                      </h3>
                      {tutorSubmissions.filter(s => s.status === 'submitted').length === 0 ? (
                        <p className="text-gray-500 text-sm">All submissions have been graded!</p>
                      ) : (
                        <div className="space-y-3">
                          {tutorSubmissions
                            .filter(s => s.status === 'submitted')
                            .map(submission => (
                              <Card key={submission.id} className="border border-orange-200 bg-orange-50">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-medium">{submission.assignment.title}</h4>
                                      <p className="text-sm text-gray-600">
                                        Student: {submission.student.user.firstName} {submission.student.user.lastName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Class: {submission.class.name} | Subject: {submission.assignment.subject}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                                        {submission.isLate && <Badge className="ml-2 bg-red-100 text-red-800">Late</Badge>}
                                      </p>
                                      
                                      {/* File Downloads */}
                                      {submission.fileUrls && submission.fileUrls.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {submission.fileUrls.map((url, index) => (
                                            <Button
                                              key={index}
                                              variant="outline"
                                              size="sm"
                                              onClick={() => window.open(url, '_blank')}
                                            >
                                              <Download className="h-3 w-3 mr-1" />
                                              View File {index + 1}
                                            </Button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <Button
                                      onClick={() => {
                                        setSelectedSubmissionId(submission.id);
                                        setGradingScore(submission.score?.toString() || '');
                                        setGradingFeedback(submission.feedback || '');
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Grade
                                    </Button>
                                  </div>
                                  
                                  {/* Grading Form */}
                                  {selectedSubmissionId === submission.id && (
                                    <div className="mt-4 p-4 bg-white border rounded-lg">
                                      <h5 className="font-medium mb-3">Grade Submission</h5>
                                      <div className="space-y-3">
                                        <div>
                                          <Label htmlFor="score">Score (0-100)</Label>
                                          <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={gradingScore}
                                            onChange={(e) => setGradingScore(e.target.value)}
                                            placeholder="Enter score"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="feedback">Feedback</Label>
                                          <Textarea
                                            id="feedback"
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                            placeholder="Provide feedback to the student..."
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() => handleGradeSubmission(submission.id)}
                                            disabled={gradeSubmissionMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            {gradeSubmissionMutation.isPending ? 'Saving...' : 'Save Grade'}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedSubmissionId(null);
                                              setGradingScore('');
                                              setGradingFeedback('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Already Graded */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Graded ({tutorSubmissions.filter(s => s.status === 'graded').length})
                      </h3>
                      {tutorSubmissions.filter(s => s.status === 'graded').length === 0 ? (
                        <p className="text-gray-500 text-sm">No graded submissions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {tutorSubmissions
                            .filter(s => s.status === 'graded')
                            .map(submission => (
                              <Card key={submission.id} className="border border-green-200 bg-green-50">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{submission.assignment.title}</h4>
                                      <p className="text-sm text-gray-600">
                                        Student: {submission.student.user.firstName} {submission.student.user.lastName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Class: {submission.class.name}
                                      </p>
                                      <div className="mt-2">
                                        <Badge className="bg-green-100 text-green-800">
                                          Score: {submission.score}/100
                                        </Badge>
                                      </div>
                                      {submission.feedback && (
                                        <p className="text-sm text-gray-600 mt-2 italic">
                                          Feedback: {submission.feedback}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Edit Grade Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSubmissionId(submission.id);
                                        setGradingScore(submission.score?.toString() || '');
                                        setGradingFeedback(submission.feedback || '');
                                      }}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  
                                  {/* Edit Grading Form */}
                                  {selectedSubmissionId === submission.id && (
                                    <div className="mt-4 p-4 bg-white border rounded-lg">
                                      <h5 className="font-medium mb-3">Edit Grade</h5>
                                      <div className="space-y-3">
                                        <div>
                                          <Label htmlFor="edit-score">Score (0-100)</Label>
                                          <Input
                                            id="edit-score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={gradingScore}
                                            onChange={(e) => setGradingScore(e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-feedback">Feedback</Label>
                                          <Textarea
                                            id="edit-feedback"
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() => handleGradeSubmission(submission.id)}
                                            disabled={gradeSubmissionMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            {gradeSubmissionMutation.isPending ? 'Saving...' : 'Update Grade'}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedSubmissionId(null);
                                              setGradingScore('');
                                              setGradingFeedback('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overview Tab - Stats Overview */}
        {mainTab === 'overview' && (
          <>
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
        </>
        )}
      </div>
    </Layout>
  );
}