import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { ParentCalendarDashboard } from "@/components/calendar";
import MessageCenter from "@/components/MessageCenter";
import { 
  Users, CheckCircle, BookOpen, TrendingUp, Home, 
  Calendar, Clock, AlertCircle, GraduationCap, FileText,
  User, Settings, Sparkles, Lightbulb, LogOut,
  MapPin, Phone, Mail, MessageCircle, Building2,
  Award, ClipboardList, Timer, Target, Star, ShieldAlert,
  ExternalLink, Download, ChevronDown, ChevronUp, Eye, Link2, Paperclip
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

interface TutorInfo {
  id: string;
  userId: string;
  specialization: string | null;
  qualifications: string | null;
  branch: string | null;
  subjectsTeaching: string[] | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

interface CompanyInfo {
  id: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  tutorChatEnabled?: boolean;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  daysOfWeek: string[] | null;
  dayOfWeek: number | null;
  maxStudents: number | null;
}

interface TestResult {
  id: string;
  testId: string;
  status: string;
  totalScore: number | null;
  percentageScore: number | null;
  isPassed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  testTitle: string | null;
  testSubject: string | null;
  testTotalPoints: number | null;
  testPassingScore: number | null;
}

interface UpcomingTest {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  dueDate: string | null;
  duration: number | null;
  totalPoints: number | null;
  passingScore: number | null;
}

interface ChildData {
  id: string;
  userId: string;
  gradeLevel: string | null;
  schoolName: string | null;
  parentId: string;
  tutorId: string | null;
  companyId: string | null;
  classId: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
  };
  classInfo: ClassInfo | null;
  tutorInfo: TutorInfo | null;
  companyInfo: CompanyInfo | null;
  assignments: Array<{
    id: string;
    title: string;
    description: string | null;
    subject: string;
    submissionDate: string;
    status: string;
    assignmentKind: string;
    solutionText: string | null;
    solutionNotes: string | null;
    solutionFileUrls: string[] | null;
    createdAt: string;
    submission: {
      id: string;
      status: string;
      submittedAt: string | null;
      isLate: boolean;
      score: number | null;
      feedback: string | null;
      gradedAt: string | null;
      fileUrls: string[] | null;
    } | null;
    submissionStatus: string;
  }>;
  submissions: Array<{
    id: string;
    assignmentId: string;
    status: string;
    submittedAt: string | null;
    isLate: boolean;
  }>;
  testResults: TestResult[];
  upcomingTests: UpcomingTest[];
  progress: {
    totalAssignments: number;
    submittedCount: number;
    gradedCount: number;
    pendingCount: number;
    completionRate: number;
  };
}

interface ParentSettings {
  id: string;
  userId: string;
  aiHintsEnabled: boolean;
  maxHintsPerQuestion: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function FormattedSolutionText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const lines = text.split('\n');
  
  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

        const isUrl = urlRegex.test(trimmed);
        urlRegex.lastIndex = 0;

        if (isUrl && trimmed.match(/^https?:\/\//)) {
          return (
            <a
              key={lineIdx}
              href={trimmed}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-100/60 hover:bg-amber-200/80 rounded-md text-amber-800 transition-colors group"
            >
              <Link2 className="h-3 w-3 shrink-0 text-amber-500" />
              <span className="truncate flex-1">{trimmed}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        }

        const parts = trimmed.split(urlRegex);
        urlRegex.lastIndex = 0;
        
        const isHeading = /^(Question \d+|Answer:|Video Link:|Materials|Solutions|URL Links|Homework Help|Writing Homework)/i.test(trimmed);

        return (
          <p key={lineIdx} className={isHeading ? 'font-semibold text-amber-800 mt-1' : 'text-amber-700'}>
            {parts.map((part, partIdx) => {
              if (urlRegex.test(part)) {
                urlRegex.lastIndex = 0;
                return (
                  <a
                    key={partIdx}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 inline-flex items-center gap-0.5"
                  >
                    {part.length > 50 ? part.slice(0, 50) + '...' : part}
                    <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>
                );
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function CollapsibleSolution({ assignment }: { assignment: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSolution = assignment.solutionText || assignment.solutionNotes || (assignment.solutionFileUrls && assignment.solutionFileUrls.length > 0);
  
  if (!hasSolution) return null;

  return (
    <div className="bg-amber-50 rounded-lg border border-amber-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 p-2.5 hover:bg-amber-100/50 transition-colors text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          Solution & Resources
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-amber-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="px-2.5 pb-2.5 text-xs space-y-2">
          {assignment.solutionText && (
            <FormattedSolutionText text={assignment.solutionText} />
          )}
          {assignment.solutionNotes && (
            <div className="p-2 bg-amber-100/40 rounded-md">
              <span className="font-semibold text-amber-700 text-[11px] uppercase tracking-wide">Notes</span>
              <p className="text-amber-600 mt-0.5 italic">{assignment.solutionNotes}</p>
            </div>
          )}
          {assignment.solutionFileUrls && assignment.solutionFileUrls.length > 0 && (
            <div>
              <span className="font-semibold text-amber-700 text-[11px] uppercase tracking-wide">Attached Files</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {assignment.solutionFileUrls.map((url: string, idx: number) => {
                  const filename = url.split('/').pop() || `Solution ${idx + 1}`;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        const objectPath = url.includes('/uploads/')
                          ? url.split('/uploads/').pop()
                          : url.split('/').pop();
                        window.open(`/objects/uploads/${objectPath}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors"
                      title={filename}
                    >
                      <Eye className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[180px]">{filename}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentTableRow({ assignment, index, deadlineInfo, hasSolution, hasSubmission, hasFiles, getStatusBadge }: {
  assignment: any;
  index: number;
  deadlineInfo: { text: string; color: string };
  hasSolution: boolean;
  hasSubmission: boolean;
  hasFiles: boolean;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = hasSolution || hasSubmission || hasFiles || assignment.submission?.feedback;

  return (
    <>
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
        data-testid={`assignment-row-${assignment.id}`}
      >
        <td className="py-2.5 px-3">
          <span className="font-medium text-slate-800 text-sm">{assignment.title}</span>
        </td>
        <td className="py-2.5 px-3">
          <span className="text-slate-600 text-xs flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {assignment.subject}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <span className={`text-xs flex items-center gap-1 ${deadlineInfo.color}`}>
            <Calendar className="h-3 w-3" />
            {assignment.submissionDate ? format(new Date(assignment.submissionDate), 'dd/MM/yyyy') : '-'}
          </span>
        </td>
        <td className="py-2.5 px-3 text-center">
          {getStatusBadge(assignment.submissionStatus)}
        </td>
        <td className="py-2.5 px-3 text-center">
          {assignment.submission?.score != null ? (
            <span className="text-sm font-bold text-emerald-600">{assignment.submission.score}%</span>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center justify-center gap-1">
            {hasSolution && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="h-7 w-7 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors border border-amber-200"
                title="View Solution"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              </button>
            )}
            {hasFiles && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="h-7 w-7 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors border border-blue-200"
                title="View Submission"
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
              </button>
            )}
            {hasDetails && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors border border-slate-200"
                title={expanded ? "Collapse" : "Expand Details"}
              >
                <ChevronDown className={`h-3.5 w-3.5 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && hasDetails && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 space-y-2">
              {assignment.submission?.feedback && (
                <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <MessageCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-blue-700">Tutor Feedback</span>
                    <p className="text-blue-600 mt-0.5">{assignment.submission.feedback}</p>
                  </div>
                </div>
              )}

              {hasFiles && (
                <div className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-100">
                  <FileText className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div className="text-xs flex-1 min-w-0">
                    <span className="font-semibold text-slate-700">Submitted Work</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {assignment.submission!.fileUrls!.map((url: string, idx: number) => {
                        const filename = url.split('/').pop() || `File ${idx + 1}`;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              const objectPath = url.includes('/uploads/')
                                ? url.split('/uploads/').pop()
                                : url.split('/').pop();
                              window.open(`/objects/uploads/${objectPath}`, '_blank');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-md transition-colors text-xs"
                            title={filename}
                          >
                            <Download className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[180px]">{filename}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {hasSolution && (
                <CollapsibleSolution assignment={assignment} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ParentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mainTab, setMainTab] = useState<'overview' | 'calendar' | 'messages'>('overview');
  const { data: children, isLoading: childrenLoading, error } = useQuery<ChildData[]>({
    queryKey: ["/api/parents/children"],
    enabled: !!user && user.role === 'parent',
  });

  const { data: parentSettings } = useQuery<ParentSettings>({
    queryKey: ["/api/parents/settings"],
    enabled: !!user && user.role === 'parent',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<ParentSettings>) => {
      return apiRequest('/api/parents/settings', 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents/settings"] });
      toast({ title: 'Settings updated', description: 'Your preferences have been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update settings', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-sm w-full mx-4 shadow-lg border-0">
          <CardContent className="py-10 text-center">
            <p className="text-slate-700 mb-4">Please log in to access the Parent Portal</p>
            <Button onClick={() => window.location.href = "/api/login"} className="bg-blue-600 hover:bg-blue-700 text-white">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-sm w-full mx-4 shadow-lg border-0">
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-700 mb-4">This portal is only accessible to parent accounts.</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalChildren = children?.length || 0;
  const totalAssignments = children?.reduce((acc, child) => acc + child.progress.totalAssignments, 0) || 0;
  const totalSubmitted = children?.reduce((acc, child) => acc + child.progress.submittedCount, 0) || 0;
  const totalGraded = children?.reduce((acc, child) => acc + child.progress.gradedCount, 0) || 0;
  const overallCompletionRate = totalAssignments > 0 ? Math.round((totalSubmitted / totalAssignments) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium">Submitted</Badge>;
      case 'graded':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Graded</Badge>;
      case 'parent_verified':
        return <Badge className="bg-violet-50 text-violet-700 border border-violet-200 font-medium">Verified</Badge>;
      case 'draft':
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">In Progress</Badge>;
      case 'late':
        return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium">Late</Badge>;
      case 'not_started':
        return <Badge className="bg-slate-50 text-slate-600 border border-slate-200 font-medium">Not Started</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{status}</Badge>;
    }
  };

  const getDeadlineInfo = (submissionDate: string) => {
    const deadline = new Date(submissionDate);
    const now = new Date();
    const daysUntil = differenceInDays(deadline, now);
    
    if (isPast(deadline)) {
      return { text: 'Overdue', color: 'text-red-500' };
    } else if (daysUntil === 0) {
      return { text: 'Due today', color: 'text-orange-500' };
    } else if (daysUntil <= 3) {
      return { text: `Due in ${daysUntil} days`, color: 'text-amber-500' };
    } else {
      return { text: `Due ${format(deadline, 'MMM d')}`, color: 'text-slate-500' };
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col overflow-hidden">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex-shrink-0 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/parent">
                <div className="flex items-center gap-2 cursor-pointer" data-testid="button-home">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-800 hidden sm:block">eSlate</span>
                </div>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMainTab('overview')}
                  className={`h-8 px-3 text-sm rounded-md transition-all ${mainTab === 'overview' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-800'}`}
                  data-testid="tab-overview"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Overview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMainTab('calendar')}
                  className={`h-8 px-3 text-sm rounded-md transition-all ${mainTab === 'calendar' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-800'}`}
                  data-testid="tab-calendar"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Calendar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMainTab('messages')}
                  className={`h-8 px-3 text-sm rounded-md transition-all ${mainTab === 'messages' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-800'}`}
                  data-testid="tab-messages"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Messages
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 px-3 text-sm"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-settings"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <div className="flex items-center gap-2 bg-slate-100 rounded-full pl-1 pr-3 py-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.[0]}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block" data-testid="text-username">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-3 text-sm"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                  } catch (e) {}
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/auth';
                }}
                data-testid="button-logout"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white/90 backdrop-blur border-b border-slate-200 flex-shrink-0">
          <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-4">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <User className="h-4 w-4 text-blue-500" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Name</p>
                    <p className="text-sm font-medium text-slate-800">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {children && children.length > 0 && (
              <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Children ({children.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div key={child.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                              {child.user.firstName?.[0]}{child.user.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{child.user.firstName} {child.user.lastName}</p>
                              <p className="text-xs text-slate-500">{child.user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">{child.gradeLevel || 'N/A'}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div className="text-xs">
                            <span className="text-slate-400">School</span>
                            <p className="font-medium text-slate-700 mt-0.5">{child.schoolName || '-'}</p>
                          </div>
                          {child.classInfo && (
                            <div className="text-xs">
                              <span className="text-slate-400">Class</span>
                              <p className="font-medium text-slate-700 mt-0.5">{child.classInfo.name}</p>
                            </div>
                          )}
                          {child.tutorInfo && (
                            <div className="text-xs">
                              <span className="text-slate-400">Tutor</span>
                              <p className="font-medium text-slate-700 mt-0.5">{child.tutorInfo.firstName} {child.tutorInfo.lastName}</p>
                            </div>
                          )}
                          {child.companyInfo && (
                            <div className="text-xs">
                              <span className="text-slate-400">Centre</span>
                              <p className="font-medium text-slate-700 mt-0.5">{child.companyInfo.name}</p>
                            </div>
                          )}
                        </div>
                        {child.progress && (
                          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {child.progress.totalAssignments ?? 0} assignments
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              {child.progress.submittedCount ?? 0} submitted
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-blue-500" />
                              {child.progress.completionRate ?? 0}% complete
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  AI Learning Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <div>
                      <Label className="text-sm font-medium text-slate-800">AI Hints</Label>
                      <p className="text-xs text-slate-500">Allow hints when stuck on questions</p>
                    </div>
                  </div>
                  <Switch
                    checked={parentSettings?.aiHintsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      updateSettingsMutation.mutate({ aiHintsEnabled: checked });
                    }}
                    data-testid="switch-ai-hints"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          {mainTab === 'calendar' ? (
            <ParentCalendarDashboard />
          ) : mainTab === 'messages' ? (
            <MessageCenter />
          ) : childrenLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your children's progress...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border border-red-200 bg-red-50/50 shadow-sm">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">Failed to load children data. Please try again.</p>
              </CardContent>
            </Card>
          ) : !children || children.length === 0 ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Children Linked</h3>
                <p className="text-slate-500 mb-4">
                  No children are currently linked to your account. Please contact your tutoring center to link your children.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid="card-children-count">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{totalChildren}</div>
                        <p className="text-xs text-slate-500">Children</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid="card-assignments-count">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{totalAssignments}</div>
                        <p className="text-xs text-slate-500">Assignments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid="card-submitted-count">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{totalSubmitted}</div>
                        <p className="text-xs text-slate-500">Submitted</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid="card-completion-rate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{overallCompletionRate}%</div>
                        <p className="text-xs text-slate-500">Complete</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue={children[0]?.id} onValueChange={setSelectedChild} className="space-y-4">
                <TabsList className="grid w-full bg-white shadow-sm border border-slate-200 rounded-xl p-1.5 gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(children.length, 4)}, 1fr)` }}>
                  {children.map((child) => (
                    <TabsTrigger 
                      key={child.id}
                      value={child.id}
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5 font-medium transition-all text-slate-600"
                      data-testid={`tab-child-${child.id}`}
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>{child.user?.firstName || 'Child'}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {children.map((child) => (
                  <TabsContent key={child.id} value={child.id} className="space-y-4">
                    <ChildOverview 
                      child={child} 
                      getStatusBadge={getStatusBadge}
                      getDeadlineInfo={getDeadlineInfo}
                      onChatWithTutor={() => setMainTab('messages')}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildOverview({ child, getStatusBadge, getDeadlineInfo, onChatWithTutor }: {
  child: ChildData;
  getStatusBadge: (status: string) => JSX.Element;
  getDeadlineInfo: (date: string) => { text: string; color: string };
  onChatWithTutor: () => void;
}) {
  const gradedAssignments = child.assignments.filter(a => a.submission?.score != null);
  const avgScore = gradedAssignments.length > 0 
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.submission?.score || 0), 0) / gradedAssignments.length) 
    : null;

  const tutorChatEnabled = child.companyInfo?.tutorChatEnabled !== false;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-slate-200 shadow-sm bg-white" data-testid={`card-child-profile-${child.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
                {child.user?.firstName?.[0]}{child.user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg text-slate-800">
                  {child.user?.firstName} {child.user?.lastName}
                </CardTitle>
                <CardDescription className="mt-0.5 text-slate-500">
                  Grade {child.gradeLevel || 'N/A'} {child.schoolName ? `at ${child.schoolName}` : ''}
                </CardDescription>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-blue-600">{child.progress.completionRate}%</div>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                <div className="text-lg font-bold text-slate-800">{child.progress.totalAssignments}</div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total</p>
              </div>
              <div className="text-center p-2.5 bg-blue-50 rounded-xl">
                <div className="text-lg font-bold text-blue-600">{child.progress.submittedCount}</div>
                <p className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">Sent</p>
              </div>
              <div className="text-center p-2.5 bg-emerald-50 rounded-xl">
                <div className="text-lg font-bold text-emerald-600">{child.progress.gradedCount}</div>
                <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wide">Graded</p>
              </div>
              <div className="text-center p-2.5 bg-amber-50 rounded-xl">
                <div className="text-lg font-bold text-amber-600">{child.progress.pendingCount}</div>
                <p className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">Pending</p>
              </div>
            </div>
            {avgScore !== null && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl">
                <Star className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Average Score: {avgScore}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {child.companyInfo && (
            <Card className="border border-slate-200 shadow-sm bg-white" data-testid="card-company-info">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  Coaching Centre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <h3 className="font-semibold text-base text-slate-800">{child.companyInfo.name}</h3>
                {child.companyInfo.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{child.companyInfo.description}</p>
                )}
                <div className="space-y-1.5">
                  {child.companyInfo.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                      <span className="text-slate-600">{child.companyInfo.address}</span>
                    </div>
                  )}
                  {child.companyInfo.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${child.companyInfo.contactPhone}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                        {child.companyInfo.contactPhone}
                      </a>
                    </div>
                  )}
                  {child.companyInfo.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${child.companyInfo.contactEmail}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                        {child.companyInfo.contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {child.classInfo && (
            <Card className="border border-slate-200 shadow-sm bg-white" data-testid="card-class-info">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <div className="h-6 w-6 rounded-lg bg-violet-50 flex items-center justify-center">
                    <GraduationCap className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  Class Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-base text-slate-800">{child.classInfo.name}</h3>
                {child.classInfo.subject && (
                  <p className="text-xs text-slate-500 mt-0.5">Subject: {child.classInfo.subject}</p>
                )}
                {child.classInfo.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{child.classInfo.description}</p>
                )}
                <div className="mt-2 space-y-1">
                  {(child.classInfo.startTime || child.classInfo.endTime) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600">
                        {child.classInfo.startTime} - {child.classInfo.endTime}
                      </span>
                    </div>
                  )}
                  {child.classInfo.daysOfWeek && child.classInfo.daysOfWeek.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600">{child.classInfo.daysOfWeek.join(', ')}</span>
                    </div>
                  )}
                  {child.classInfo.dayOfWeek != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600">{DAY_NAMES[child.classInfo.dayOfWeek] || `Day ${child.classInfo.dayOfWeek}`}</span>
                    </div>
                  )}
                  {child.classInfo.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600">{child.classInfo.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {child.tutorInfo && (
        <Card className="border border-slate-200 shadow-sm bg-white" data-testid="card-tutor-info">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <div className="h-6 w-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-teal-600" />
                </div>
                Tutor
              </CardTitle>
              {tutorChatEnabled ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm shadow-sm"
                  onClick={onChatWithTutor}
                  data-testid="btn-chat-tutor"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Chat with Tutor
                </Button>
              ) : (
                <Badge className="bg-slate-100 text-slate-500 border border-slate-200 font-normal text-xs">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Chat unavailable
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                {child.tutorInfo.firstName?.[0]}{child.tutorInfo.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-slate-800">
                  {child.tutorInfo.firstName} {child.tutorInfo.lastName}
                </h3>
                {child.tutorInfo.specialization && (
                  <p className="text-xs text-slate-500">{child.tutorInfo.specialization}</p>
                )}
                {child.tutorInfo.qualifications && (
                  <p className="text-xs text-slate-400">{child.tutorInfo.qualifications}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                {child.tutorInfo.email && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <a href={`mailto:${child.tutorInfo.email}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                      {child.tutorInfo.email}
                    </a>
                  </div>
                )}
                {child.tutorInfo.subjectsTeaching && child.tutorInfo.subjectsTeaching.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {child.tutorInfo.subjectsTeaching.map((subject, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-slate-200 text-slate-600">{subject}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!tutorChatEnabled && child.companyInfo && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Tutor chat is currently not available</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Please contact the coaching centre directly:
                      {child.companyInfo.contactPhone && (
                        <span className="block mt-0.5">
                          Phone: <a href={`tel:${child.companyInfo.contactPhone}`} className="text-blue-600 hover:underline">{child.companyInfo.contactPhone}</a>
                        </span>
                      )}
                      {child.companyInfo.contactEmail && (
                        <span className="block mt-0.5">
                          Email: <a href={`mailto:${child.companyInfo.contactEmail}`} className="text-blue-600 hover:underline">{child.companyInfo.contactEmail}</a>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-sm bg-white" data-testid={`card-child-assignments-${child.id}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
            <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
            </div>
            Assignments ({child.assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {child.assignments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No assignments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700 text-white text-xs">
                    <th className="text-left py-2.5 px-3 font-semibold rounded-tl-lg">TITLE</th>
                    <th className="text-left py-2.5 px-3 font-semibold">SUBJECT</th>
                    <th className="text-left py-2.5 px-3 font-semibold">DUE DATE</th>
                    <th className="text-center py-2.5 px-3 font-semibold">STATUS</th>
                    <th className="text-center py-2.5 px-3 font-semibold">SCORE</th>
                    <th className="text-center py-2.5 px-3 font-semibold rounded-tr-lg">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {child.assignments.map((assignment, index) => {
                    const deadlineInfo = getDeadlineInfo(assignment.submissionDate);
                    const hasSolution = !!(assignment.solutionText || assignment.solutionNotes || (assignment.solutionFileUrls && assignment.solutionFileUrls.length > 0));
                    const hasSubmission = !!(assignment.submission && assignment.submission.status !== 'draft');
                    const hasFiles = !!(assignment.submission?.fileUrls && assignment.submission.fileUrls.length > 0);

                    return (
                      <AssignmentTableRow
                        key={assignment.id}
                        assignment={assignment}
                        index={index}
                        deadlineInfo={deadlineInfo}
                        hasSolution={hasSolution}
                        hasSubmission={hasSubmission}
                        hasFiles={hasFiles}
                        getStatusBadge={getStatusBadge}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm bg-white" data-testid="card-test-results">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                </div>
                Past Test Results ({child.testResults?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!child.testResults || child.testResults.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No test results yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {child.testResults.map((result) => (
                    <div key={result.id} className="p-3 border border-slate-100 rounded-xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">{result.testTitle || 'Test'}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {result.testSubject && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {result.testSubject}
                              </span>
                            )}
                            {result.submittedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(result.submittedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {result.percentageScore != null && (
                            <span className={`text-lg font-bold ${result.isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                              {result.percentageScore}%
                            </span>
                          )}
                          {result.isPassed != null && (
                            <Badge className={result.isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}>
                              {result.isPassed ? 'Passed' : 'Failed'}
                            </Badge>
                          )}
                          {result.status === 'submitted' && (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Pending Grade</Badge>
                          )}
                        </div>
                      </div>
                      {result.totalScore != null && result.testTotalPoints != null && (
                        <div className="mt-1 text-xs text-slate-400">
                          Score: {result.totalScore}/{result.testTotalPoints}
                          {result.testPassingScore != null && ` (Pass: ${result.testPassingScore})`}
                        </div>
                      )}
                      {result.feedback && (
                        <div className="mt-2 p-2.5 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100">
                          <span className="font-medium">Feedback:</span> {result.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white" data-testid="card-upcoming-tests">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-6 w-6 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-orange-600" />
                </div>
                Upcoming Tests/Exams ({child.upcomingTests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!child.upcomingTests || child.upcomingTests.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No upcoming tests</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {child.upcomingTests.map((test) => (
                    <div key={test.id} className="p-3 border border-orange-100 bg-orange-50/50 rounded-xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">{test.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {test.subject && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {test.subject}
                              </span>
                            )}
                            {test.dueDate && (
                              <span className="flex items-center gap-1 text-orange-600 font-medium">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(test.dueDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          {test.duration && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Timer className="h-3 w-3" />
                              {test.duration} min
                            </div>
                          )}
                          {test.totalPoints != null && (
                            <div className="text-xs text-slate-500">
                              {test.totalPoints} pts
                            </div>
                          )}
                        </div>
                      </div>
                      {test.description && (
                        <p className="mt-1 text-xs text-slate-500">{test.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
