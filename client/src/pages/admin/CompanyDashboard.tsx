import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import { CompanyCalendarDashboard } from "@/components/calendar";
import AcademicManagement from "./AcademicManagement";
import { AssignmentManagement } from "@/pages/assignments/AssignmentManagement";
import { Building2, Users, Plus, GraduationCap, CheckCircle, UserPlus, Eye, Mail, Phone, MapPin, BookOpen, Calendar, Edit, FileText, ArrowRight, Home, LayoutDashboard, Trash2, X, Clock, TrendingUp, Activity, Target, Award, ChevronDown, ChevronRight, Layers, Settings, Bell, BarChart3, Download, AlertCircle, ClipboardCheck, Pencil } from "lucide-react";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { ReviewerPDFAnnotator } from "@/components/ReviewerPDFAnnotator";
import { WorksheetReviewer } from "@/components/WorksheetReviewer";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend } from "recharts";
import { ESlateHeader } from "@/components/eSlateHeader";
import { ESlateFooter } from "@/components/eSlateFooter";

interface CompanyAdmin {
  id: string;
  userId: string;
  companyId: string;
  permissions: string[];
}

interface TutoringCompany {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
}

interface ClassSchedule {
  className: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface CompanyTutor {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string;
  availability?: string;
  subjectsTeaching?: string[];
  branch?: string;
  isVerified: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
  schedules?: ClassSchedule[];
  studentCount?: number;
}

interface CompanyStudent {
  id: string;
  userId: string;
  gradeLevel: string | null;
  parentId: string | null;
  tutorId: string | null;
  classId: string | null;
  schoolName: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
  class?: {
    id: string;
    name: string;
    academicYearId: string;
  };
  tutor?: {
    id: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface OverviewClass {
  id: string;
  companyId: string;
  termId: string;
  tutorId: string | null;
  name: string;
  subject: string;
  description: string | null;
  maxStudents: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  tutor?: {
    id: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  enrolledCount?: number;
}

interface OverviewTerm {
  id: string;
  academicYearId: string;
  companyId: string;
  name: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  classes: OverviewClass[];
}

interface OverviewYear {
  id: string;
  companyId: string;
  yearNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: OverviewTerm[];
}

interface ReportType {
  id: string;
  name: string;
  description: string;
}

interface ReportRun {
  id: string;
  companyId: string;
  reportType: string;
  name: string;
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultData: any;
  rowCount: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

const reportIcons: Record<string, any> = {
  student_performance: Users,
  attendance_summary: Calendar,
  class_utilization: BookOpen,
  assignment_completion: FileText,
  tutor_workload: Users,
  enrollment_trends: TrendingUp,
};

function ReportsSection({ companyId, company }: { companyId: string; company?: TutoringCompany | null }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportRun | null>(null);

  const { data: reportTypes = [] } = useQuery<ReportType[]>({
    queryKey: ['/api/reports/types'],
  });

  const { data: reportHistory = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery<ReportRun[]>({
    queryKey: ['/api/reports/history', companyId],
    enabled: !!companyId,
  });

  const runReportMutation = useMutation({
    mutationFn: async (data: { companyId: string; reportType: string; name: string; parameters?: any }) => {
      const response = await apiRequest('POST', '/api/reports/run', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Report generated successfully' });
      setSelectedReport(data);
      queryClient.invalidateQueries({ queryKey: ['/api/reports/history', companyId] });
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({ title: 'Failed to generate report', description: error.message, variant: 'destructive' });
    },
  });

  const handleRunReport = () => {
    if (!selectedReportType || !companyId) {
      toast({ title: 'Please select a report type', variant: 'destructive' });
      return;
    }

    const reportType = reportTypes.find(rt => rt.id === selectedReportType);
    runReportMutation.mutate({
      companyId,
      reportType: selectedReportType,
      name: reportName || reportType?.name || 'Report',
      parameters: {},
    });
  };

  const handleExportCSV = (reportRunId: string) => {
    window.open(`/api/reports/export/${reportRunId}/csv`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Clock className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><X className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generate and export business reports</p>
        </div>
        <Button variant="outline" onClick={() => refetchHistory()} className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'builder' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('builder')}
          className={`rounded-b-none border-b-2 ${activeTab === 'builder' ? 'border-black bg-black text-white' : 'border-transparent'}`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Report Builder
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className={`rounded-b-none border-b-2 ${activeTab === 'history' ? 'border-black bg-black text-white' : 'border-transparent'}`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Report History
        </Button>
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((rt) => {
              const Icon = reportIcons[rt.id] || FileText;
              return (
                <Card
                  key={rt.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedReportType === rt.id ? 'ring-2 ring-black dark:ring-white' : ''}`}
                  onClick={() => setSelectedReportType(rt.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{rt.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{rt.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedReportType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="reportName">Report Name (Optional)</Label>
                    <Input
                      id="reportName"
                      placeholder="Enter a custom name for this report"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((rt) => (
                          <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleRunReport} disabled={runReportMutation.isPending} className="bg-black hover:bg-gray-800 text-white">
                    {runReportMutation.isPending ? (
                      <><Clock className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><BarChart3 className="w-4 h-4 mr-2" />Generate Report</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Clock className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : reportHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Use the Report Builder tab to create your first report</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Report Name</th>
                        <th className="text-left py-2 px-3 font-medium">Type</th>
                        <th className="text-left py-2 px-3 font-medium">Status</th>
                        <th className="text-left py-2 px-3 font-medium">Rows</th>
                        <th className="text-left py-2 px-3 font-medium">Generated</th>
                        <th className="text-left py-2 px-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportHistory.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-2 px-3 font-medium">{report.name}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="capitalize">{report.reportType.replace('_', ' ')}</Badge>
                          </td>
                          <td className="py-2 px-3">{getStatusBadge(report.status)}</td>
                          <td className="py-2 px-3">{report.rowCount || '-'}</td>
                          <td className="py-2 px-3">{report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy HH:mm') : '-'}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              {report.status === 'completed' && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>View</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleExportCSV(report.id)}>CSV</Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedReport && selectedReport.status === 'completed' && selectedReport.resultData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedReport.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedReport.resultData.title} - Generated {selectedReport.createdAt ? format(new Date(selectedReport.createdAt), 'MMM d, yyyy HH:mm') : ''}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => handleExportCSV(selectedReport.id)}>Export CSV</Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedReport.resultData.summary && (
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    {Object.entries(selectedReport.resultData.summary).map(([key, value]) => (
                      <Card key={key} className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(value)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {selectedReport.resultData.data && selectedReport.resultData.data.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(selectedReport.resultData.data[0]).map((key) => (
                            <th key={key} className="text-left py-2 px-3 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.resultData.data.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            {Object.values(row).map((value: any, cellIdx) => (
                              <td key={cellIdx} className="py-2 px-3">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedReport.resultData.data.length > 50 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                        Showing first 50 of {selectedReport.resultData.data.length} rows. Export to CSV for full data.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompanyDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCreateTutorOpen, setIsCreateTutorOpen] = useState(false);
  const [isAssignTutorOpen, setIsAssignTutorOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);
  const [mainTab, setMainTab] = useState<'dashboard' | 'overview' | 'calendar' | 'tutors' | 'students' | 'academic' | 'assignments' | 'settings' | 'reports' | 'submissions'>('dashboard');
  const [isEditTutorOpen, setIsEditTutorOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<CompanyTutor | null>(null);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<CompanyStudent | null>(null);
  const [studentSortBy, setStudentSortBy] = useState<'name' | 'email' | 'class' | 'tutor'>('name');
  const [studentSortOrder, setStudentSortOrder] = useState<'asc' | 'desc'>('asc');
  const [studentFilterClass, setStudentFilterClass] = useState<string>('all');
  const [studentFilterTutor, setStudentFilterTutor] = useState<string>('all');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const [tutorSortBy, setTutorSortBy] = useState<'name' | 'email' | 'specialization' | 'status'>('name');
  const [tutorSortOrder, setTutorSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tutorFilterStatus, setTutorFilterStatus] = useState<string>('all');
  const [tutorFilterSpecialization, setTutorFilterSpecialization] = useState<string>('all');
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});

  const [studentFormData, setStudentFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    gradeLevel: "",
    schoolName: "",
    classId: "",
    tutorId: "",
  });

  const [editStudentFormData, setEditStudentFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gradeLevel: "",
    schoolName: "",
    classId: "",
    tutorId: "",
  });

  const [tutorFormData, setTutorFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    specialization: "",
    qualifications: "",
    address: "",
    phoneNumber: "",
    availabilityDays: [] as string[],
    availabilityHours: "",
    employmentType: "",
    position: "",
  });

  const [editTutorFormData, setEditTutorFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialization: "",
    qualifications: "",
    availability: "",
    subjectsTeaching: [] as string[],
    branch: "",
    address: "",
    phoneNumber: "",
    availabilityDays: [] as string[],
    availabilityHours: "",
    employmentType: "",
    position: "",
  });
  const [newTutorSubject, setNewTutorSubject] = useState("");

  const [tutorAssignmentData, setTutorAssignmentData] = useState({
    tutorId: "",
  });

  // Grading state for submissions
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<string>('');
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  
  // Reviewer annotation state
  const [annotatorSubmission, setAnnotatorSubmission] = useState<any>(null);
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(false);
  
  // Worksheet reviewer state
  const [worksheetReviewData, setWorksheetReviewData] = useState<{ worksheetId: string; studentId: string; studentName: string } | null>(null);
  const [isWorksheetReviewOpen, setIsWorksheetReviewOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: companyAdminData, isLoading: companyAdminLoading } = useQuery<CompanyAdmin>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user && user.role === 'company_admin',
  });

  useEffect(() => {
    if (companyAdminData) {
      setCompanyAdmin(companyAdminData);
    }
  }, [companyAdminData]);

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!companyAdmin,
  });

  const company = Array.isArray(companies) ? companies[0] : companies;

  const { data: tutors } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`],
    enabled: !!companyAdmin?.companyId,
  });

  const { data: students } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/students`],
    enabled: !!companyAdmin?.companyId,
  });

  const { data: classes } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/classes`],
    enabled: !!companyAdmin?.companyId,
  });

  const { data: academicHierarchy = [], isLoading: hierarchyLoading } = useQuery<OverviewYear[]>({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/academic-hierarchy`],
    enabled: !!companyAdmin?.companyId && mainTab === 'overview',
  });

  // Fetch submissions for grading (company admins see all, tutors see their own)
  interface CompanySubmission {
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
      assignmentKind?: 'file_upload' | 'worksheet';
      worksheetId?: string;
    };
    class: {
      id: string;
      name: string;
    };
  }

  const { data: companySubmissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery<CompanySubmission[]>({
    queryKey: ['/api/company/submissions'],
    enabled: !!user && user.role === 'company_admin',
  });

  // Mutation for grading a submission (company admin)
  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      const response = await apiRequest(`/api/company/submissions/${submissionId}/grade`, 'PATCH', { score, feedback });
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
        title: "Invalid Score",
        description: "Please enter a score between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    gradeSubmissionMutation.mutate({ submissionId, score, feedback: gradingFeedback });
  };

  // Mutation for saving reviewer annotations
  const saveAnnotationsMutation = useMutation({
    mutationFn: async ({ submissionId, reviewerAnnotations }: { submissionId: string; reviewerAnnotations: string }) => {
      const response = await apiRequest(`/api/submissions/${submissionId}/reviewer-annotations`, 'PATCH', { reviewerAnnotations });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Annotations saved successfully",
      });
      refetchSubmissions();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save annotations",
        variant: "destructive",
      });
    },
  });

  const handleOpenAnnotator = (submission: any) => {
    // Check if this is a worksheet assignment
    if (submission.assignment?.assignmentKind === 'worksheet' && submission.assignment?.worksheetId) {
      const studentName = `${submission.student?.user?.firstName || ''} ${submission.student?.user?.lastName || ''}`.trim();
      setWorksheetReviewData({
        worksheetId: submission.assignment.worksheetId,
        studentId: submission.studentId,
        studentName: studentName || 'Student'
      });
      setIsWorksheetReviewOpen(true);
    } else {
      // Regular file-based assignment - open PDF annotator
      setAnnotatorSubmission(submission);
      setIsAnnotatorOpen(true);
    }
  };

  const handleSaveAnnotations = async (annotations: string) => {
    if (!annotatorSubmission) return;
    await saveAnnotationsMutation.mutateAsync({ 
      submissionId: annotatorSubmission.id, 
      reviewerAnnotations: annotations 
    });
  };

  const toggleYear = (yearId: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [yearId]: !prev[yearId]
    }));
  };

  const toggleTerm = (termId: string) => {
    setExpandedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  };

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateStr: string | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  const totalYears = academicHierarchy.length;
  const totalTerms = academicHierarchy.reduce((sum, year) => sum + (year.terms?.length || 0), 0);
  const totalClasses = academicHierarchy.reduce((sum, year) => 
    sum + (year.terms?.reduce((termSum, term) => termSum + (term.classes?.length || 0), 0) || 0), 0
  );

  const createTutorMutation = useMutation({
    mutationFn: async (tutorData: any) => {
      return await apiRequest("/api/admin/create-tutor", "POST", tutorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      setIsCreateTutorOpen(false);
      setTutorFormData({ email: "", firstName: "", lastName: "", specialization: "", qualifications: "", address: "", phoneNumber: "", availabilityDays: [], availabilityHours: "", employmentType: "", position: "" });
      toast({ title: "Success", description: "Tutor created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create tutor", variant: "destructive" });
    },
  });

  const assignTutorMutation = useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      return await apiRequest(`/api/students/${studentId}`, "PATCH", { tutorId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsAssignTutorOpen(false);
      setSelectedStudentId(null);
      setTutorAssignmentData({ tutorId: "" });
      toast({ title: "Success", description: "Tutor assigned successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to assign tutor", variant: "destructive" });
    },
  });

  const updateTutorMutation = useMutation({
    mutationFn: async ({ tutorId, userId, data }: { tutorId: string; userId: string; data: any }) => {
      await apiRequest(`/api/admin/users/${userId}`, "PATCH", { firstName: data.firstName, lastName: data.lastName, email: data.email });
      return await apiRequest(`/api/tutors/${tutorId}`, "PATCH", { 
        specialization: data.specialization, 
        qualifications: data.qualifications,
        availability: data.availability,
        subjectsTeaching: data.subjectsTeaching,
        branch: data.branch
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      setIsEditTutorOpen(false);
      setEditingTutor(null);
      toast({ title: "Success", description: "Tutor updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update tutor", variant: "destructive" });
    },
  });

  const deleteTutorMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      toast({ title: "Success", description: "Tutor removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove tutor", variant: "destructive" });
    },
  });

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorMutation.mutate({ ...tutorFormData, companyId: companyAdmin?.companyId });
  };

  const handleEditTutor = (tutor: CompanyTutor) => {
    setEditingTutor(tutor);
    setEditTutorFormData({
      firstName: tutor.user?.firstName || "",
      lastName: tutor.user?.lastName || "",
      email: tutor.user?.email || "",
      specialization: tutor.specialization || "",
      qualifications: tutor.qualifications || "",
      availability: tutor.availability || "",
      subjectsTeaching: tutor.subjectsTeaching || [],
      branch: tutor.branch || "",
      address: (tutor as any).address || "",
      phoneNumber: (tutor as any).phoneNumber || "",
      availabilityDays: (tutor as any).availabilityDays || [],
      availabilityHours: (tutor as any).availabilityHours || "",
      employmentType: (tutor as any).employmentType || "",
      position: (tutor as any).position || "",
    });
    setIsEditTutorOpen(true);
  };

  const handleUpdateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTutor && editingTutor.userId) {
      updateTutorMutation.mutate({ tutorId: editingTutor.id, userId: editingTutor.userId, data: editTutorFormData });
    }
  };

  const handleDeleteTutor = (tutor: CompanyTutor) => {
    if (confirm(`Are you sure you want to remove ${tutor.user?.firstName} ${tutor.user?.lastName}?`)) {
      deleteTutorMutation.mutate(tutor.userId);
    }
  };

  const handleAddTutorSubject = () => {
    if (newTutorSubject.trim() && !editTutorFormData.subjectsTeaching.includes(newTutorSubject.trim())) {
      setEditTutorFormData(prev => ({
        ...prev,
        subjectsTeaching: [...prev.subjectsTeaching, newTutorSubject.trim()]
      }));
      setNewTutorSubject("");
    }
  };

  const handleRemoveTutorSubject = (subject: string) => {
    setEditTutorFormData(prev => ({
      ...prev,
      subjectsTeaching: prev.subjectsTeaching.filter(s => s !== subject)
    }));
  };

  // Student CRUD mutations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return await apiRequest("/api/admin/create-student", "POST", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsCreateStudentOpen(false);
      setStudentFormData({ email: "", firstName: "", lastName: "", gradeLevel: "", schoolName: "", classId: "", tutorId: "" });
      toast({ title: "Success", description: "Student created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create student", variant: "destructive" });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ studentId, userId, data }: { studentId: string; userId: string; data: any }) => {
      await apiRequest(`/api/admin/users/${userId}`, "PATCH", { firstName: data.firstName, lastName: data.lastName, email: data.email });
      return await apiRequest(`/api/students/${studentId}`, "PATCH", { gradeLevel: data.gradeLevel, schoolName: data.schoolName, classId: data.classId || null, tutorId: data.tutorId || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsEditStudentOpen(false);
      setEditingStudent(null);
      toast({ title: "Success", description: "Student updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update student", variant: "destructive" });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      toast({ title: "Success", description: "Student removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove student", variant: "destructive" });
    },
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      ...studentFormData,
      companyId: companyAdmin?.companyId,
      classId: studentFormData.classId === "__none__" ? "" : studentFormData.classId,
      tutorId: studentFormData.tutorId === "__none__" ? "" : studentFormData.tutorId,
    };
    createStudentMutation.mutate(formData);
  };

  const handleEditStudent = (student: CompanyStudent) => {
    setEditingStudent(student);
    setEditStudentFormData({
      firstName: student.user?.firstName || "",
      lastName: student.user?.lastName || "",
      email: student.user?.email || "",
      gradeLevel: student.gradeLevel || "",
      schoolName: student.schoolName || "",
      classId: student.classId || "__none__",
      tutorId: student.tutorId || "__none__",
    });
    setIsEditStudentOpen(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && editingStudent.userId) {
      const formData = {
        ...editStudentFormData,
        classId: editStudentFormData.classId === "__none__" ? "" : editStudentFormData.classId,
        tutorId: editStudentFormData.tutorId === "__none__" ? "" : editStudentFormData.tutorId,
      };
      updateStudentMutation.mutate({ studentId: editingStudent.id, userId: editingStudent.userId, data: formData });
    }
  };

  const handleDeleteStudent = (student: CompanyStudent) => {
    if (confirm(`Are you sure you want to remove ${student.user?.firstName} ${student.user?.lastName}?`)) {
      deleteStudentMutation.mutate(student.userId);
    }
  };

  // Sorting and filtering for students
  const getFilteredAndSortedStudents = () => {
    if (!students || !Array.isArray(students)) return [];
    
    let filtered = [...students];
    
    // Apply search filter
    if (studentSearchTerm) {
      const term = studentSearchTerm.toLowerCase();
      filtered = filtered.filter((s: CompanyStudent) => 
        s.user?.firstName?.toLowerCase().includes(term) ||
        s.user?.lastName?.toLowerCase().includes(term) ||
        s.user?.email?.toLowerCase().includes(term)
      );
    }
    
    // Apply class filter
    if (studentFilterClass !== 'all') {
      filtered = filtered.filter((s: CompanyStudent) => s.classId === studentFilterClass);
    }
    
    // Apply tutor filter
    if (studentFilterTutor !== 'all') {
      if (studentFilterTutor === 'unassigned') {
        filtered = filtered.filter((s: CompanyStudent) => !s.tutorId);
      } else {
        filtered = filtered.filter((s: CompanyStudent) => s.tutorId === studentFilterTutor);
      }
    }
    
    // Apply sorting
    filtered.sort((a: CompanyStudent, b: CompanyStudent) => {
      let comparison = 0;
      switch (studentSortBy) {
        case 'name':
          comparison = `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`);
          break;
        case 'email':
          comparison = (a.user?.email || '').localeCompare(b.user?.email || '');
          break;
        case 'class':
          comparison = (a.class?.name || 'zzz').localeCompare(b.class?.name || 'zzz');
          break;
        case 'tutor':
          const aTutor = a.tutor?.user ? `${a.tutor.user.firstName} ${a.tutor.user.lastName}` : 'zzz';
          const bTutor = b.tutor?.user ? `${b.tutor.user.firstName} ${b.tutor.user.lastName}` : 'zzz';
          comparison = aTutor.localeCompare(bTutor);
          break;
      }
      return studentSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Sorting and filtering for tutors
  const getFilteredAndSortedTutors = () => {
    if (!tutors || !Array.isArray(tutors)) return [];
    
    let filtered = [...tutors];
    
    // Apply search filter
    if (tutorSearchTerm) {
      const term = tutorSearchTerm.toLowerCase();
      filtered = filtered.filter((t: CompanyTutor) => 
        t.user?.firstName?.toLowerCase().includes(term) ||
        t.user?.lastName?.toLowerCase().includes(term) ||
        t.user?.email?.toLowerCase().includes(term) ||
        t.specialization?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (tutorFilterStatus !== 'all') {
      if (tutorFilterStatus === 'verified') {
        filtered = filtered.filter((t: CompanyTutor) => t.isVerified);
      } else if (tutorFilterStatus === 'pending') {
        filtered = filtered.filter((t: CompanyTutor) => !t.isVerified);
      }
    }
    
    // Apply specialization filter
    if (tutorFilterSpecialization !== 'all') {
      filtered = filtered.filter((t: CompanyTutor) => t.specialization === tutorFilterSpecialization);
    }
    
    // Apply sorting
    filtered.sort((a: CompanyTutor, b: CompanyTutor) => {
      let comparison = 0;
      switch (tutorSortBy) {
        case 'name':
          comparison = `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`);
          break;
        case 'email':
          comparison = (a.user?.email || '').localeCompare(b.user?.email || '');
          break;
        case 'specialization':
          comparison = (a.specialization || 'zzz').localeCompare(b.specialization || 'zzz');
          break;
        case 'status':
          comparison = (a.isVerified ? 0 : 1) - (b.isVerified ? 0 : 1);
          break;
      }
      return tutorSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Get unique specializations from tutors
  const getUniqueSpecializations = () => {
    if (!tutors || !Array.isArray(tutors)) return [];
    const specs = tutors.map((t: CompanyTutor) => t.specialization).filter(Boolean);
    return specs.filter((value, index, self) => self.indexOf(value) === index);
  };

  const handleAssignTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId && tutorAssignmentData.tutorId) {
      assignTutorMutation.mutate({ studentId: selectedStudentId, tutorId: tutorAssignmentData.tutorId });
    }
  };

  const openTutorAssignmentDialog = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAssignTutorOpen(true);
  };

  const openStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsStudentProfileOpen(true);
  };

  if (isLoading || companyAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!companyAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-black">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* eSlate Branded Header */}
      <ESlateHeader />
      
      {/* Page Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/company">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Business Admin Portal</h1>
                <p className="text-gray-500 text-sm">{company?.name || "Loading..."}</p>
              </div>
            </div>
            {/* Company Contact Info */}
            {company && (
              <div className="hidden md:flex items-center gap-4 text-sm bg-gray-100 px-4 py-2 rounded-lg">
                {company.contactEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{company.contactEmail}</span>
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{company.contactPhone}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 max-w-[250px] truncate">{company.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Button
              variant={mainTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setMainTab('dashboard')}
              className={`rounded-b-none border-b-2 ${mainTab === 'dashboard' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-dashboard"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={mainTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setMainTab('overview')}
              className={`rounded-b-none border-b-2 ${mainTab === 'overview' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-overview"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={mainTab === 'tutors' ? 'default' : 'ghost'}
              onClick={() => setMainTab('tutors')}
              className={`rounded-b-none border-b-2 ${mainTab === 'tutors' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-tutors"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Staff
            </Button>
            <Button
              variant={mainTab === 'students' ? 'default' : 'ghost'}
              onClick={() => setMainTab('students')}
              className={`rounded-b-none border-b-2 ${mainTab === 'students' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-students"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Manage Students
            </Button>
            <Button
              variant={mainTab === 'academic' ? 'default' : 'ghost'}
              onClick={() => setMainTab('academic')}
              className={`rounded-b-none border-b-2 ${mainTab === 'academic' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-academic"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Academic Setup
            </Button>
            <Button
              variant={mainTab === 'assignments' ? 'default' : 'ghost'}
              onClick={() => setMainTab('assignments')}
              className={`rounded-b-none border-b-2 ${mainTab === 'assignments' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-assignments"
            >
              <FileText className="h-4 w-4 mr-2" />
              Assignments
            </Button>
            <Button
              variant={mainTab === 'submissions' ? 'default' : 'ghost'}
              onClick={() => setMainTab('submissions')}
              className={`rounded-b-none border-b-2 ${mainTab === 'submissions' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-submissions"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Grading
            </Button>
            <Button
              variant={mainTab === 'calendar' ? 'default' : 'ghost'}
              onClick={() => setMainTab('calendar')}
              className={`rounded-b-none border-b-2 ${mainTab === 'calendar' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-calendar"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={mainTab === 'reports' ? 'default' : 'ghost'}
              onClick={() => setMainTab('reports')}
              className={`rounded-b-none border-b-2 ${mainTab === 'reports' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-reports"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button
              variant={mainTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setMainTab('settings')}
              className={`rounded-b-none border-b-2 ${mainTab === 'settings' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {mainTab === 'dashboard' && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your organization.</p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1">
            <Activity className="h-3 w-3 mr-1 inline" />
            Live
          </Badge>
        </div>

        {/* Vibrant Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tutors</p>
                  <div className="text-3xl font-bold">{Array.isArray(tutors) ? tutors.length : 0}</div>
                  <p className="text-blue-100 text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active educators
                  </p>
                </div>
                <div className="bg-blue-400/30 p-3 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Students</p>
                  <div className="text-3xl font-bold">{Array.isArray(students) ? students.length : 0}</div>
                  <p className="text-purple-100 text-xs mt-1 flex items-center">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Enrolled learners
                  </p>
                </div>
                <div className="bg-purple-400/30 p-3 rounded-full">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Assigned</p>
                  <div className="text-3xl font-bold">
                    {Array.isArray(students) ? students.filter((s: any) => s.tutorId).length : 0}
                  </div>
                  <p className="text-green-100 text-xs mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    With tutors
                  </p>
                </div>
                <div className="bg-green-400/30 p-3 rounded-full">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending</p>
                  <div className="text-3xl font-bold">
                    {Array.isArray(students) ? students.filter((s: any) => !s.tutorId).length : 0}
                  </div>
                  <p className="text-orange-100 text-xs mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Awaiting assignment
                  </p>
                </div>
                <div className="bg-orange-400/30 p-3 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Distribution Chart */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Student Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Assigned', value: Array.isArray(students) ? students.filter((s: any) => s.tutorId).length : 0, color: '#22c55e' },
                        { name: 'Pending', value: Array.isArray(students) ? students.filter((s: any) => !s.tutorId).length : 0, color: '#f97316' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Assigned', value: Array.isArray(students) ? students.filter((s: any) => s.tutorId).length : 0, color: '#22c55e' },
                        { name: 'Pending', value: Array.isArray(students) ? students.filter((s: any) => !s.tutorId).length : 0, color: '#f97316' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: 'Mon', students: 12, assignments: 8 },
                      { day: 'Tue', students: 19, assignments: 12 },
                      { day: 'Wed', students: 15, assignments: 10 },
                      { day: 'Thu', students: 22, assignments: 15 },
                      { day: 'Fri', students: 25, assignments: 18 },
                      { day: 'Sat', students: 8, assignments: 5 },
                      { day: 'Sun', students: 5, assignments: 3 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="students" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStudents)" name="Active Students" />
                    <Area type="monotone" dataKey="assignments" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAssignments)" name="Assignments" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Bar Chart */}
          <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-500" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { subject: 'Math', score: 85, avg: 72 },
                      { subject: 'English', score: 78, avg: 68 },
                      { subject: 'Science', score: 92, avg: 75 },
                      { subject: 'History', score: 70, avg: 65 },
                      { subject: 'Art', score: 88, avg: 80 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="subject" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Your Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name="Platform Average" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Assignments</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-500 p-2 rounded-full mr-3">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Submissions</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">89%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-full mr-3">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Growth</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">+12%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-orange-500 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Avg. Time</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Per session</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">45m</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: GraduationCap, color: 'bg-purple-500', text: 'New student enrolled: Sarah Johnson', time: '2 minutes ago' },
                { icon: FileText, color: 'bg-blue-500', text: 'Assignment "Math Quiz Week 5" was submitted', time: '15 minutes ago' },
                { icon: Users, color: 'bg-green-500', text: 'Tutor Michael assigned to 3 new students', time: '1 hour ago' },
                { icon: CheckCircle, color: 'bg-yellow-500', text: 'All assignments for Term 1 have been graded', time: '3 hours ago' },
                { icon: Calendar, color: 'bg-pink-500', text: 'New class session scheduled for Monday', time: '5 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <div className={`${activity.color} p-2 rounded-full`}>
                    <activity.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {mainTab === 'overview' && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">View all terms and classes organized by academic year</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <CardContent className="pt-6 pb-5 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Academic Years</p>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{totalYears}</div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">configured periods</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <CardContent className="pt-6 pb-5 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Total Terms</p>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{totalTerms}</div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">across all years</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <Layers className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
            <CardContent className="pt-6 pb-5 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Total Classes</p>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{totalClasses}</div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">active sessions</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/30 p-4 rounded-2xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
                  <BookOpen className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Hierarchy */}
        {hierarchyLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : academicHierarchy.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Academic Years Found</h3>
              <p className="text-gray-600 dark:text-gray-300">Create academic years, terms, and classes in the Academic Setup tab.</p>
              <Button 
                className="mt-4 bg-black text-white hover:bg-gray-800"
                onClick={() => setMainTab('academic')}
              >
                Go to Academic Setup
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {academicHierarchy.map((year) => (
              <Card key={year.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-xl">
                <button
                  onClick={() => toggleYear(year.id)}
                  aria-expanded={expandedYears[year.id] || false}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-850 hover:from-slate-100 hover:to-gray-100 dark:hover:from-gray-750 dark:hover:to-gray-800 transition-all text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-colors ${expandedYears[year.id] ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
                      {expandedYears[year.id] ? (
                        <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{year.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(year.startDate)} - {formatDate(year.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`px-3 py-1 font-medium ${year.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}>
                      {year.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {year.terms?.length || 0} terms
                      </span>
                    </div>
                  </div>
                </button>

                {expandedYears[year.id] && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-850">
                    {!year.terms || year.terms.length === 0 ? (
                      <div className="p-8 text-center">
                        <Layers className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No terms in this academic year</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {year.terms.map((term) => (
                          <div key={term.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                            <button
                              onClick={() => toggleTerm(term.id)}
                              aria-expanded={expandedTerms[term.id] || false}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-md transition-colors ${expandedTerms[term.id] ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-200 dark:bg-gray-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20'}`}>
                                  {expandedTerms[term.id] ? (
                                    <ChevronDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{term.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(term.startDate, 'MMM d')} - {formatDate(term.endDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge className={`px-2.5 py-0.5 text-xs font-medium ${term.isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'}`}>
                                  {term.isActive ? 'Current' : 'Ended'}
                                </Badge>
                                <div className="bg-white dark:bg-gray-700 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {term.classes?.length || 0} classes
                                  </span>
                                </div>
                              </div>
                            </button>

                            {expandedTerms[term.id] && (
                              <div className="bg-white dark:bg-gray-900 p-4 border-t border-gray-100 dark:border-gray-700">
                                {!term.classes || term.classes.length === 0 ? (
                                  <div className="text-center py-6">
                                    <BookOpen className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No classes in this term</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {term.classes.map((classItem) => (
                                      <Card key={classItem.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 group rounded-lg overflow-hidden">
                                        <CardContent className="p-0">
                                          <div className="p-4 pb-3">
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex-1">
                                                <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{classItem.name}</h5>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{classItem.subject}</p>
                                              </div>
                                              <Badge className={`text-xs ${classItem.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                {classItem.isActive ? 'Active' : 'Inactive'}
                                              </Badge>
                                            </div>
                                            <div className="space-y-2 text-sm mt-3">
                                              <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-2">
                                                  <Users className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  {classItem.tutor?.user 
                                                    ? `${classItem.tutor.user.firstName} ${classItem.tutor.user.lastName}`
                                                    : <span className="italic text-gray-400">No tutor assigned</span>
                                                  }
                                                </span>
                                              </div>
                                              <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                                                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  {getDayName(classItem.dayOfWeek)} • {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                                                </span>
                                              </div>
                                              <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                                                  <GraduationCap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  Max {classItem.maxStudents} students
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="w-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                              onClick={() => setMainTab('academic')}
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Details
                                              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      )}

      {mainTab === 'tutors' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Staff</h2>
            <p className="text-gray-600 dark:text-gray-300">Add, edit, or remove team members from your organization</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <CardContent className="pt-4 pb-4 pl-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Total Staff</p>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{Array.isArray(tutors) ? tutors.length : 0}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <CardContent className="pt-4 pb-4 pl-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Verified</p>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{Array.isArray(tutors) ? tutors.filter((t: CompanyTutor) => t.isVerified).length : 0}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              <CardContent className="pt-4 pb-4 pl-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Pending</p>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{Array.isArray(tutors) ? tutors.filter((t: CompanyTutor) => !t.isVerified).length : 0}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                    <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
              <CardContent className="pt-4 pb-4 pl-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Specializations</p>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{getUniqueSpecializations().length}</div>
                  </div>
                  <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
                    <BookOpen className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Team Member Button */}
          <div className="flex justify-end">
            <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all" data-testid="button-add-tutor">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Add New Team Member
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTutor} className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                        <Input id="firstName" value={tutorFormData.firstName} onChange={(e) => setTutorFormData({ ...tutorFormData, firstName: e.target.value })} required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                        <Input id="lastName" value={tutorFormData.lastName} onChange={(e) => setTutorFormData({ ...tutorFormData, lastName: e.target.value })} required className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                      <Input id="email" type="email" value={tutorFormData.email} onChange={(e) => setTutorFormData({ ...tutorFormData, email: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                      <Input id="phoneNumber" type="tel" value={tutorFormData.phoneNumber} onChange={(e) => setTutorFormData({ ...tutorFormData, phoneNumber: e.target.value })} placeholder="e.g., +1 234 567 8900" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                      <Textarea id="address" value={tutorFormData.address} onChange={(e) => setTutorFormData({ ...tutorFormData, address: e.target.value })} placeholder="Full address" className="mt-1" rows={2} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Employment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                        <Input id="position" value={tutorFormData.position} onChange={(e) => setTutorFormData({ ...tutorFormData, position: e.target.value })} placeholder="e.g., Senior Tutor" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="employmentType" className="text-sm font-medium">Employment Type</Label>
                        <Select value={tutorFormData.employmentType} onValueChange={(v) => setTutorFormData({ ...tutorFormData, employmentType: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="parttime">Part-time</SelectItem>
                            <SelectItem value="fulltime">Full-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="specialization" className="text-sm font-medium">Specialization</Label>
                      <Input id="specialization" value={tutorFormData.specialization} onChange={(e) => setTutorFormData({ ...tutorFormData, specialization: e.target.value })} placeholder="e.g., Mathematics" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="qualifications" className="text-sm font-medium">Qualifications</Label>
                      <Input id="qualifications" value={tutorFormData.qualifications} onChange={(e) => setTutorFormData({ ...tutorFormData, qualifications: e.target.value })} placeholder="e.g., B.Sc. Mathematics, M.Ed." className="mt-1" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Availability</h3>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Available Days & Times</Label>
                      <div className="grid gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                          const isSelected = tutorFormData.availabilityDays.includes(day);
                          return (
                            <div key={day} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
                              <Button
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className={`w-20 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                onClick={() => {
                                  const days = isSelected
                                    ? tutorFormData.availabilityDays.filter(d => d !== day)
                                    : [...tutorFormData.availabilityDays, day];
                                  setTutorFormData({ ...tutorFormData, availabilityDays: days });
                                }}
                              >
                                {day.slice(0, 3)}
                              </Button>
                              {isSelected && (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    type="time"
                                    className="w-28 text-sm"
                                    placeholder="Start"
                                    defaultValue="09:00"
                                  />
                                  <span className="text-gray-500 text-sm">to</span>
                                  <Input
                                    type="time"
                                    className="w-28 text-sm"
                                    placeholder="End"
                                    defaultValue="17:00"
                                  />
                                </div>
                              )}
                              {!isSelected && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">Click to add</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" disabled={createTutorMutation.isPending}>
                    {createTutorMutation.isPending ? "Creating..." : "Add Team Member"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Sorting */}
          <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="tutorSearch" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Search</Label>
                  <Input
                    id="tutorSearch"
                    placeholder="Search by name, email, or specialization..."
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    className="mt-1 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</Label>
                  <Select value={tutorFilterStatus} onValueChange={setTutorFilterStatus}>
                    <SelectTrigger className="mt-1 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Specialization</Label>
                  <Select value={tutorFilterSpecialization} onValueChange={setTutorFilterSpecialization}>
                    <SelectTrigger className="mt-1 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {getUniqueSpecializations().map((spec: string) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sort By</Label>
                  <div className="flex gap-1 mt-1">
                    <Select value={tutorSortBy} onValueChange={(v: any) => setTutorSortBy(v)}>
                      <SelectTrigger className="flex-1 border-gray-200 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="specialization">Specialization</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTutorSortOrder(tutorSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="border-gray-200 dark:border-gray-600 px-2"
                    >
                      {tutorSortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-white">All Staff Members</span>
                <Badge variant="secondary" className="ml-2">{getFilteredAndSortedTutors().length} of {Array.isArray(tutors) ? tutors.length : 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {getFilteredAndSortedTutors().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredAndSortedTutors().map((tutor: CompanyTutor) => (
                    <div key={tutor.id} className="relative bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-blue-500"></div>
                      <div className="p-4 pl-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {tutor.user?.firstName?.charAt(0) || ''}{tutor.user?.lastName?.charAt(0) || ''}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleEditTutor(tutor)}
                                className="text-left hover:underline block w-full"
                                data-testid={`tutor-name-${tutor.id}`}
                              >
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {tutor.user?.firstName} {tutor.user?.lastName}
                                </p>
                              </button>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {tutor.user?.email}
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-xs flex-shrink-0 ${tutor.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                            {tutor.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {tutor.specialization && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                              {tutor.specialization}
                            </Badge>
                          )}
                          {tutor.studentCount !== undefined && tutor.studentCount > 0 && (
                            <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 dark:text-violet-400 dark:border-violet-700">
                              {tutor.studentCount} students
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {tutor.schedules && tutor.schedules.length > 0 ? (
                              <span>{tutor.schedules.length} classes</span>
                            ) : (
                              <span>No classes</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTutor(tutor)}
                              className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                              data-testid={`button-edit-tutor-${tutor.id}`}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTutor(tutor)}
                              className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                              data-testid={`button-delete-tutor-${tutor.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tutorSearchTerm || tutorFilterStatus !== 'all' || tutorFilterSpecialization !== 'all'
                      ? "No staff match your filters"
                      : "No staff members yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    {tutorSearchTerm || tutorFilterStatus !== 'all' || tutorFilterSpecialization !== 'all'
                      ? "Try adjusting your filters or search term"
                      : "Get started by adding your first team member"}
                  </p>
                  {!tutorSearchTerm && tutorFilterStatus === 'all' && tutorFilterSpecialization === 'all' && (
                    <Button onClick={() => setIsCreateTutorOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Team Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {mainTab === 'students' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Manage Students</h2>
              <p className="text-gray-600">Add, edit, or remove students from your organization</p>
            </div>
            <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white border-2 border-black hover:bg-gray-800" data-testid="button-add-student">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentFirstName">First Name</Label>
                      <Input id="studentFirstName" value={studentFormData.firstName} onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="studentLastName">Last Name</Label>
                      <Input id="studentLastName" value={studentFormData.lastName} onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="studentEmail">Email</Label>
                    <Input id="studentEmail" type="email" value={studentFormData.email} onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gradeLevel">Year / Grade Level</Label>
                      <Input id="gradeLevel" value={studentFormData.gradeLevel} onChange={(e) => setStudentFormData({ ...studentFormData, gradeLevel: e.target.value })} placeholder="e.g., Year 10" />
                    </div>
                    <div>
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input id="schoolName" value={studentFormData.schoolName} onChange={(e) => setStudentFormData({ ...studentFormData, schoolName: e.target.value })} placeholder="e.g., St. Mary's" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="studentClass">Assign to Class</Label>
                    <Select value={studentFormData.classId} onValueChange={(value) => setStudentFormData({ ...studentFormData, classId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No class</SelectItem>
                        {Array.isArray(classes) && classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studentTutor">Assign Tutor</Label>
                    <Select value={studentFormData.tutorId} onValueChange={(value) => setStudentFormData({ ...studentFormData, tutorId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tutor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No tutor</SelectItem>
                        {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                          <SelectItem key={tutor.id} value={tutor.id}>
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={createStudentMutation.isPending}>
                    {createStudentMutation.isPending ? "Creating..." : "Create Student"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Sorting */}
          <Card className="border-2 border-black mb-6">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="studentSearch" className="text-xs text-gray-600">Search</Label>
                  <Input
                    id="studentSearch"
                    placeholder="Search by name or email..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Class</Label>
                  <Select value={studentFilterClass} onValueChange={setStudentFilterClass}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {Array.isArray(classes) && classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Tutor</Label>
                  <Select value={studentFilterTutor} onValueChange={setStudentFilterTutor}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Tutors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tutors</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Sort By</Label>
                  <div className="flex gap-1">
                    <Select value={studentSortBy} onValueChange={(v: any) => setStudentSortBy(v)}>
                      <SelectTrigger className="border-black flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStudentSortOrder(studentSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="border-black px-2"
                    >
                      {studentSortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="border-2 border-black">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                All Students ({getFilteredAndSortedStudents().length} of {Array.isArray(students) ? students.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedStudents().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getFilteredAndSortedStudents().map((student: CompanyStudent) => (
                    <div key={student.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-gray-500 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-left hover:underline w-full"
                            data-testid={`student-name-${student.id}`}
                          >
                            <p className="font-semibold text-black dark:text-white text-sm truncate">
                              {student.user?.firstName} {student.user?.lastName}
                            </p>
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.user?.email}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="h-7 w-7 p-0"
                            data-testid={`button-edit-student-${student.id}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-student-${student.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.gradeLevel && (
                          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-1.5 py-0">
                            {student.gradeLevel}
                          </Badge>
                        )}
                        {student.schoolName && (
                          <Badge variant="outline" className="border-gray-400 text-[10px] px-1.5 py-0 truncate max-w-[80px]" title={student.schoolName}>
                            {student.schoolName}
                          </Badge>
                        )}
                        {student.class?.name ? (
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 text-[10px] px-1.5 py-0">
                            {student.class.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-400 text-orange-600 text-[10px] px-1.5 py-0">
                            No class
                          </Badge>
                        )}
                      </div>
                      {student.tutor?.user ? (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 truncate">
                          Tutor: {student.tutor.user.firstName} {student.tutor.user.lastName}
                        </p>
                      ) : (
                        <p className="text-[10px] text-red-500 mt-1">No tutor assigned</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {studentSearchTerm || studentFilterClass !== 'all' || studentFilterTutor !== 'all' 
                      ? "No students match your filters" 
                      : "No students added yet"}
                  </p>
                  {!studentSearchTerm && studentFilterClass === 'all' && studentFilterTutor === 'all' && (
                    <Button onClick={() => setIsCreateStudentOpen(true)} className="bg-black text-white hover:bg-gray-800">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Student
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStudentFirstName">First Name</Label>
                <Input id="editStudentFirstName" value={editStudentFormData.firstName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="editStudentLastName">Last Name</Label>
                <Input id="editStudentLastName" value={editStudentFormData.lastName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="editStudentEmail">Email</Label>
              <Input id="editStudentEmail" type="email" value={editStudentFormData.email} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGradeLevel">Year / Grade Level</Label>
                <Input id="editGradeLevel" value={editStudentFormData.gradeLevel} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, gradeLevel: e.target.value })} placeholder="e.g., Year 10" />
              </div>
              <div>
                <Label htmlFor="editSchoolName">School Name</Label>
                <Input id="editSchoolName" value={editStudentFormData.schoolName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, schoolName: e.target.value })} placeholder="e.g., St. Mary's" />
              </div>
            </div>
            <div>
              <Label htmlFor="editStudentClass">Assign to Class</Label>
              <Select value={editStudentFormData.classId} onValueChange={(value) => setEditStudentFormData({ ...editStudentFormData, classId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No class</SelectItem>
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editStudentTutor">Assign Tutor</Label>
              <Select value={editStudentFormData.tutorId} onValueChange={(value) => setEditStudentFormData({ ...editStudentFormData, tutorId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tutor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No tutor</SelectItem>
                  {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 border-black" onClick={() => setIsEditStudentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={updateStudentMutation.isPending}>
                {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Member Dialog */}
      <Dialog open={isEditTutorOpen} onOpenChange={setIsEditTutorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Edit Staff Member
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTutor} className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName" className="text-sm font-medium">First Name *</Label>
                  <Input id="editFirstName" value={editTutorFormData.firstName} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, firstName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="editLastName" className="text-sm font-medium">Last Name *</Label>
                  <Input id="editLastName" value={editTutorFormData.lastName} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, lastName: e.target.value })} required className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail" className="text-sm font-medium">Email *</Label>
                <Input id="editEmail" type="email" value={editTutorFormData.email} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, email: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="editPhoneNumber" className="text-sm font-medium">Phone Number</Label>
                <Input id="editPhoneNumber" type="tel" value={editTutorFormData.phoneNumber} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, phoneNumber: e.target.value })} placeholder="e.g., +1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="editAddress" className="text-sm font-medium">Address</Label>
                <Textarea id="editAddress" value={editTutorFormData.address} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, address: e.target.value })} placeholder="Full address" className="mt-1" rows={2} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPosition" className="text-sm font-medium">Position</Label>
                  <Input id="editPosition" value={editTutorFormData.position} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, position: e.target.value })} placeholder="e.g., Senior Tutor" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="editEmploymentType" className="text-sm font-medium">Employment Type</Label>
                  <Select value={editTutorFormData.employmentType} onValueChange={(v) => setEditTutorFormData({ ...editTutorFormData, employmentType: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editSpecialization" className="text-sm font-medium">Specialization</Label>
                <Input id="editSpecialization" value={editTutorFormData.specialization} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, specialization: e.target.value })} placeholder="e.g., Mathematics" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="editQualifications" className="text-sm font-medium">Qualifications</Label>
                <Input id="editQualifications" value={editTutorFormData.qualifications} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, qualifications: e.target.value })} placeholder="e.g., B.Sc. Mathematics" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="editBranch" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Branch / Location
                </Label>
                <Input id="editBranch" value={editTutorFormData.branch} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, branch: e.target.value })} placeholder="e.g., Downtown Center" className="mt-1" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Availability</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Available Days & Times</Label>
                <div className="grid gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isSelected = editTutorFormData.availabilityDays.includes(day);
                    return (
                      <div key={day} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
                        <Button
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={`w-20 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => {
                            const days = isSelected
                              ? editTutorFormData.availabilityDays.filter(d => d !== day)
                              : [...editTutorFormData.availabilityDays, day];
                            setEditTutorFormData({ ...editTutorFormData, availabilityDays: days });
                          }}
                        >
                          {day.slice(0, 3)}
                        </Button>
                        {isSelected && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              className="w-28 text-sm"
                              placeholder="Start"
                              defaultValue="09:00"
                            />
                            <span className="text-gray-500 text-sm">to</span>
                            <Input
                              type="time"
                              className="w-28 text-sm"
                              placeholder="End"
                              defaultValue="17:00"
                            />
                          </div>
                        )}
                        {!isSelected && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Click to add</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="editAvailability" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Availability Notes
                </Label>
                <Textarea 
                  id="editAvailability" 
                  value={editTutorFormData.availability} 
                  onChange={(e) => setEditTutorFormData({ ...editTutorFormData, availability: e.target.value })} 
                  placeholder="Any additional notes about availability..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Subjects</h3>
              <div>
                <Label className="text-sm font-medium flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Subjects Teaching
                </Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTutorSubject}
                      onChange={(e) => setNewTutorSubject(e.target.value)}
                      placeholder="Add a subject..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTutorSubject())}
                    />
                    <Button type="button" onClick={handleAddTutorSubject} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editTutorFormData.subjectsTeaching.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {subject}
                        <button
                          type="button"
                          onClick={() => handleRemoveTutorSubject(subject)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" className="flex-1 border-gray-300 dark:border-gray-600" onClick={() => setIsEditTutorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" disabled={updateTutorMutation.isPending}>
                {updateTutorMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {mainTab === 'academic' && companyAdmin?.companyId && company && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AcademicManagement 
            companyId={companyAdmin.companyId} 
            companyName={company.name}
          />
        </div>
      )}

      {mainTab === 'assignments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AssignmentManagement />
        </div>
      )}

      {mainTab === 'calendar' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CompanyCalendarDashboard />
        </div>
      )}

      {mainTab === 'settings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotificationSettings userRole="company_admin" />
        </div>
      )}

      {mainTab === 'reports' && companyAdmin?.companyId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReportsSection companyId={companyAdmin.companyId} company={company} />
        </div>
      )}

      {/* Submissions/Grading Tab */}
      {mainTab === 'submissions' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Submissions</h2>
              <p className="text-gray-600">View and grade submitted assignments from students</p>
            </div>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                {submissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : companySubmissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions to review yet</p>
                    <p className="text-sm">Submissions from students will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Pending Grading */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Needs Grading ({companySubmissions.filter(s => s.status === 'submitted').length})
                      </h3>
                      {companySubmissions.filter(s => s.status === 'submitted').length === 0 ? (
                        <p className="text-gray-500 text-sm">All submissions have been graded!</p>
                      ) : (
                        <div className="space-y-3">
                          {companySubmissions
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
                                    
                                    <div className="flex gap-2">
                                      {/* Review Button - show for worksheets OR if there are submission files or assignment attachments */}
                                      {((submission.assignment?.assignmentKind === 'worksheet' && submission.assignment?.worksheetId) ||
                                        (submission.fileUrls && submission.fileUrls.length > 0) || 
                                        (submission.assignment?.attachmentUrls && submission.assignment.attachmentUrls.length > 0)) && (
                                        <Button
                                          variant="outline"
                                          onClick={() => handleOpenAnnotator(submission)}
                                        >
                                          <Pencil className="h-4 w-4 mr-1" />
                                          Review
                                        </Button>
                                      )}
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
                                  </div>
                                  
                                  {/* Grading Form */}
                                  {selectedSubmissionId === submission.id && (
                                    <div className="mt-4 p-4 bg-white border rounded-lg">
                                      <h5 className="font-medium mb-3">Grade Submission</h5>
                                      <div className="space-y-3">
                                        <div>
                                          <Label htmlFor="grading-score">Score (0-100)</Label>
                                          <Input
                                            id="grading-score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={gradingScore}
                                            onChange={(e) => setGradingScore(e.target.value)}
                                            placeholder="Enter score"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="grading-feedback">Feedback</Label>
                                          <Textarea
                                            id="grading-feedback"
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
                        Graded ({companySubmissions.filter(s => s.status === 'graded').length})
                      </h3>
                      {companySubmissions.filter(s => s.status === 'graded').length === 0 ? (
                        <p className="text-gray-500 text-sm">No graded submissions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {companySubmissions
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
                                    
                                    <div className="flex gap-2">
                                      {/* View Submission Button - for graded submissions (worksheets or file uploads) */}
                                      {((submission.assignment?.assignmentKind === 'worksheet' && submission.assignment?.worksheetId) ||
                                        (submission.fileUrls && submission.fileUrls.length > 0) || 
                                        (submission.assignment?.attachmentUrls && submission.assignment.attachmentUrls.length > 0)) && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenAnnotator(submission)}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View
                                        </Button>
                                      )}
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
                                  </div>
                                  
                                  {/* Edit Grading Form */}
                                  {selectedSubmissionId === submission.id && (
                                    <div className="mt-4 p-4 bg-white border rounded-lg">
                                      <h5 className="font-medium mb-3">Edit Grade</h5>
                                      <div className="space-y-3">
                                        <div>
                                          <Label htmlFor="edit-grading-score">Score (0-100)</Label>
                                          <Input
                                            id="edit-grading-score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={gradingScore}
                                            onChange={(e) => setGradingScore(e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-grading-feedback">Feedback</Label>
                                          <Textarea
                                            id="edit-grading-feedback"
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
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isAssignTutorOpen} onOpenChange={setIsAssignTutorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tutor to Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignTutor} className="space-y-4">
            <div>
              <Label htmlFor="tutorSelect">Select Tutor</Label>
              <Select value={tutorAssignmentData.tutorId} onValueChange={(value) => setTutorAssignmentData({ tutorId: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tutor" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown Tutor'}
                      {tutor.specialization && ` - ${tutor.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={assignTutorMutation.isPending}>
              {assignTutorMutation.isPending ? "Assigning..." : "Assign Tutor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {selectedStudentId && companyAdmin?.companyId && (
        <StudentProfileDialog studentId={selectedStudentId} companyId={companyAdmin.companyId} isOpen={isStudentProfileOpen} onClose={() => { setIsStudentProfileOpen(false); setSelectedStudentId(null); }} />
      )}

      {/* Reviewer PDF Annotator Modal */}
      {isAnnotatorOpen && annotatorSubmission && (
        <ReviewerPDFAnnotator
          pdfUrl={annotatorSubmission.fileUrls?.[0] || annotatorSubmission.assignment?.attachmentUrls?.[0] || ''}
          submissionId={annotatorSubmission.id}
          existingAnnotations={annotatorSubmission.reviewerAnnotations}
          isViewOnly={annotatorSubmission.status === 'graded'}
          onSave={handleSaveAnnotations}
          onClose={() => {
            setIsAnnotatorOpen(false);
            setAnnotatorSubmission(null);
          }}
          studentName={`${annotatorSubmission.student?.user?.firstName || ''} ${annotatorSubmission.student?.user?.lastName || ''}`}
          assignmentTitle={annotatorSubmission.assignment?.title}
        />
      )}

      {/* Worksheet Reviewer Modal */}
      {isWorksheetReviewOpen && worksheetReviewData && (
        <WorksheetReviewer
          worksheetId={worksheetReviewData.worksheetId}
          studentId={worksheetReviewData.studentId}
          studentName={worksheetReviewData.studentName}
          onClose={() => {
            setIsWorksheetReviewOpen(false);
            setWorksheetReviewData(null);
          }}
          onGradeComplete={() => {
            refetchSubmissions();
          }}
        />
      )}
      
      {/* eSlate Footer */}
      <ESlateFooter />
    </div>
  );
}
