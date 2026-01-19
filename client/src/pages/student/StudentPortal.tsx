import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Assignment, Submission, AcademicTerm, Class } from '@shared/schema';
import { 
  BookOpen, Clock, CheckCircle, GraduationCap, Calendar, FileText, 
  Upload, Download, Edit, Eye, Home, AlertCircle, TrendingUp, 
  Star, ArrowRight, CalendarDays, Users, MapPin, CalendarIcon
} from 'lucide-react';
import { StudentCalendarDashboard } from '@/components/calendar/StudentCalendarDashboard';
import { format, isPast, differenceInDays, isWithinInterval, parseISO, isToday } from 'date-fns';
import { ObjectUploader } from '@/components/ObjectUploader';
import { useFileMetadata } from '@/hooks/useFileMetadata';
import { PDFAnnotator } from '@/components/PDFAnnotator';
import { AssignmentCompletionArea } from '@/components/AssignmentCompletionArea';

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

interface StudentPortalProps {
  embedded?: boolean;
}

export function StudentPortal({ embedded = false }: StudentPortalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [showPDFAnnotator, setShowPDFAnnotator] = useState(false);
  const [annotatingAssignment, setAnnotatingAssignment] = useState<Assignment | null>(null);
  
  const studentId = user?.id ? `student-${user.id}` : '';

  const { data: studentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student'
  });

  const studentDbId = (studentProfile as any)?.id || '';

  const { data: studentTerms = [], isLoading: isLoadingTerms } = useQuery({
    queryKey: ['/api/students', studentDbId, 'terms'],
    enabled: !!studentDbId
  });

  const { data: studentClasses = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId
  });

  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['/api/students', studentDbId, 'assignments'],
    enabled: !!studentDbId
  });

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['/api/students', studentDbId, 'submissions'],
    enabled: !!studentDbId
  });

  interface CalendarHomeworkDeadline {
    id: string;
    title: string;
    dueDate: string | Date;
    subject?: string;
  }

  interface StudentCalendarData {
    sessions: any[];
    holidays: any[];
    homeworkDeadlines: CalendarHomeworkDeadline[];
  }

  interface LearningHours {
    subject: string;
    hours: number;
  }

  interface AttendanceSummary {
    totalClasses: number;
    classesAttended: number;
    attendancePercentage: number;
    learningHours: {
      weekly: number;
      monthly: number;
      bySubject: LearningHours[];
    };
  }

  const { data: calendarData } = useQuery<StudentCalendarData>({
    queryKey: ["/api/calendar/student"],
  });

  const { data: attendanceSummary } = useQuery<AttendanceSummary>({
    queryKey: ["/api/attendance/summary/student", studentDbId],
    enabled: !!studentDbId,
  });

  const todaysSessions = useMemo(() => {
    if (!calendarData?.sessions) return [];
    return calendarData.sessions.filter((session) => {
      const sessionDate = typeof session.startTime === "string" ? parseISO(session.startTime) : session.startTime;
      return isToday(sessionDate);
    });
  }, [calendarData?.sessions]);

  const upcomingHomework = useMemo(() => {
    if (!calendarData?.homeworkDeadlines) return [];
    const now = new Date();
    return calendarData.homeworkDeadlines
      .filter((hw) => {
        const dueDate = typeof hw.dueDate === "string" ? parseISO(hw.dueDate) : hw.dueDate;
        return dueDate >= now;
      })
      .sort((a, b) => {
        const dateA = typeof a.dueDate === "string" ? parseISO(a.dueDate) : a.dueDate;
        const dateB = typeof b.dueDate === "string" ? parseISO(b.dueDate) : b.dueDate;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [calendarData?.homeworkDeadlines]);

  const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "#3b82f6",
    English: "#10b981",
    Science: "#f59e0b",
    History: "#8b5cf6",
    Geography: "#ec4899",
    Art: "#06b6d4",
    Music: "#f97316",
    "Physical Education": "#84cc16",
    default: "#6b7280",
  };

  const getSubjectColor = (subject: string): string => {
    return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
  };

  const typedStudentTerms = studentTerms as AcademicTerm[];
  const typedStudentClasses = studentClasses as Class[];
  const typedAssignments = assignments as Assignment[];
  const typedSubmissions = submissions as Submission[];

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

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Student role required.</p>
      </div>
    );
  }

  if (showPDFAnnotator && annotatingAssignment) {
    return (
      <PDFAnnotator
        pdfUrl={(() => {
          const url = annotatingAssignment.attachmentUrls![0];
          if (url.includes('/uploads/')) {
            const objectPath = url.split('/uploads/').pop()?.split('?')[0];
            return `/objects/uploads/${objectPath}`;
          }
          return url;
        })()}
        assignmentId={annotatingAssignment.id}
        onSave={async (annotatedFileUrl: string) => {
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

  // Calculate stats
  const completedCount = typedSubmissions.filter((s: Submission) => s.status === 'submitted' || s.status === 'graded').length;
  const pendingCount = typedAssignments.filter((a: Assignment) => {
    const submission = typedSubmissions.find((s: Submission) => s.assignmentId === a.id);
    return !submission && !isPast(new Date(a.submissionDate));
  }).length;
  const overdueCount = typedAssignments.filter((a: Assignment) => {
    const submission = typedSubmissions.find((s: Submission) => s.assignmentId === a.id);
    return !submission && isPast(new Date(a.submissionDate));
  }).length;
  const dueSoonCount = typedAssignments.filter((assignment: Assignment) => {
    const dueDate = new Date(assignment.submissionDate);
    const now = new Date();
    const diffDays = differenceInDays(dueDate, now);
    return diffDays <= 3 && diffDays >= 0;
  }).length;
  const progressPercentage = typedAssignments.length > 0 
    ? Math.round((completedCount / typedAssignments.length) * 100) 
    : 0;

  // Find active term
  const activeTerm = typedStudentTerms.find((term: AcademicTerm) => term.isActive);

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Welcome Banner - Compact for 13.3" */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">Welcome back, {user?.firstName}!</h2>
            <p className="text-gray-300 text-sm">
              {activeTerm ? `Current Term: ${activeTerm.name}` : 'No active term'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Compact grid for 13.3" */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-2 border-black">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs px-1.5 py-0">Total</Badge>
            </div>
            <div className="text-2xl font-bold text-black">{typedAssignments.length}</div>
            <p className="text-xs text-gray-500">Assignments</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0">Done</Badge>
            </div>
            <div className="text-2xl font-bold text-black">{completedCount}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0">Soon</Badge>
            </div>
            <div className="text-2xl font-bold text-black">{dueSoonCount}</div>
            <p className="text-xs text-gray-500">Due in 3 days</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <Badge variant="destructive" className="text-xs px-1.5 py-0">Alert</Badge>
            </div>
            <div className="text-2xl font-bold text-black">{overdueCount}</div>
            <p className="text-xs text-gray-500">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance & Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-black hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {attendanceSummary?.attendancePercentage?.toFixed(0) ?? 0}%
              </span>
              <span className="text-xs text-gray-500">
                ({attendanceSummary?.classesAttended ?? 0}/{attendanceSummary?.totalClasses ?? 0} classes)
              </span>
            </div>
            <Progress
              value={attendanceSummary?.attendancePercentage ?? 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-black hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Today's Classes
              </CardTitle>
              {todaysSessions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {todaysSessions.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {todaysSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No classes scheduled today</p>
            ) : (
              <ScrollArea className={todaysSessions.length > 3 ? "h-[100px]" : ""}>
                <div className="space-y-1">
                  {todaysSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between text-sm p-1 rounded"
                    >
                      <span className="font-medium truncate">{session.className || session.subject}</span>
                      <span className="text-gray-500 text-xs">
                        {format(
                          typeof session.startTime === "string" ? parseISO(session.startTime) : session.startTime,
                          "h:mm a"
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-black hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upcoming Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingHomework.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-1">
                {upcomingHomework.map((hw) => {
                  const dueDate = typeof hw.dueDate === "string" ? parseISO(hw.dueDate) : hw.dueDate;
                  const isTodaysDue = isToday(dueDate);
                  return (
                    <div
                      key={hw.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium truncate max-w-[120px]">{hw.title}</span>
                      <Badge
                        variant={isTodaysDue ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {isTodaysDue ? "Today" : format(dueDate, "MMM d")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Hours & Subject Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-black hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Learning Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-2xl font-bold">{attendanceSummary?.learningHours?.weekly ?? 0}h</span>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="text-2xl font-bold">{attendanceSummary?.learningHours?.monthly ?? 0}h</span>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              By Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!attendanceSummary?.learningHours?.bySubject || attendanceSummary.learningHours.bySubject.length === 0) ? (
              <p className="text-gray-500 text-sm">No subject data yet</p>
            ) : (
              <div className="space-y-2">
                {attendanceSummary.learningHours.bySubject.slice(0, 3).map((item) => (
                  <div key={item.subject} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getSubjectColor(item.subject) }}
                    />
                    <span className="text-sm flex-1 truncate">{item.subject}</span>
                    <span className="text-sm font-medium">{item.hours}h</span>
                  </div>
                ))}
                {attendanceSummary.learningHours.bySubject.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{attendanceSummary.learningHours.bySubject.length - 3} more subjects
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="border-2 border-black hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => setSelectedTab('calendar')}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Calendar</h3>
                <p className="text-sm text-gray-500">Classes & attendance</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-black hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => setSelectedTab('assignments')}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Assignments</h3>
                <p className="text-sm text-gray-500">{pendingCount} pending tasks</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      {typedAssignments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-black">Recent Assignments</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedTab('assignments')}
              className="border-black"
            >
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-3">
            {typedAssignments.slice(0, 3).map((assignment: Assignment) => {
              const status = getAssignmentStatus(assignment);
              const daysLeft = differenceInDays(new Date(assignment.submissionDate), new Date());
              
              return (
                <Card key={assignment.id} className="border-2 border-gray-200 hover:border-black transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{assignment.title}</h4>
                          <p className="text-sm text-gray-500">
                            Due: {format(new Date(assignment.submissionDate), 'MMM dd, yyyy')}
                            {daysLeft >= 0 && daysLeft <= 3 && (
                              <span className="text-yellow-600 ml-2">({daysLeft} days left)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(status)} capitalize`}>
                        {status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Academic Terms</h2>
          <p className="text-gray-500 mt-1">Your enrolled academic terms and schedules</p>
        </div>
        <Badge variant="outline" className="text-xs px-2 py-1">
          {typedStudentTerms.length}
        </Badge>
      </div>

      {isLoadingTerms ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : typedStudentTerms.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-semibold text-gray-600 mb-1">No Terms</h3>
            <p className="text-xs text-gray-400">You haven't been enrolled in any academic terms yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
          {typedStudentTerms.map((term: AcademicTerm) => {
            const isCurrentTerm = term.isActive;
            const startDate = new Date(term.startDate);
            const endDate = new Date(term.endDate);
            const now = new Date();
            const totalDays = differenceInDays(endDate, startDate);
            const daysElapsed = differenceInDays(now, startDate);
            const termProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
            
            return (
              <div 
                key={term.id}
                className="px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-black">{term.name}</h4>
                      {isCurrentTerm && (
                        <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderClasses = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const getDayName = (day: string | number): string => {
      if (typeof day === 'number') {
        return dayNames[day] || String(day);
      }
      return String(day);
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">My Classes</h2>
            <p className="text-gray-500 mt-1">Your enrolled classes and schedules</p>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-1">
            {typedStudentClasses.length}
          </Badge>
        </div>

        {isLoadingClasses ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : typedStudentClasses.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-sm font-semibold text-gray-600 mb-1">No Classes</h3>
              <p className="text-xs text-gray-400">You haven't been enrolled in any classes yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
            {typedStudentClasses.map((cls: Class) => {
              const daysList = cls.daysOfWeek.map(getDayName);
              const sortedDays = [...daysList].sort((a, b) => 
                dayOrder.indexOf(a) - dayOrder.indexOf(b)
              );
              
              return (
                <div 
                  key={cls.id}
                  className="px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-black">{cls.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                        <span>{sortedDays.slice(0, 2).join(', ')}{sortedDays.length > 2 ? '...' : ''}</span>
                        <span className="text-gray-300">•</span>
                        <span>{cls.startTime} - {cls.endTime}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="font-medium">Tutor:</span> {(cls as any).tutorName || (cls as any).instructor || 'Not assigned'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAssignments = () => {
    const groupedAssignments = typedAssignments.reduce((acc: any, assignment: any) => {
      const term = assignment.termId || 'Unassigned Term';
      const subject = assignment.subject || 'General';

      if (!acc[term]) acc[term] = {};
      if (!acc[term][subject]) acc[term][subject] = [];

      acc[term][subject].push(assignment);
      return acc;
    }, {});

    const getTermName = (termId: string) => {
      if (termId === 'Unassigned Term') return 'Unassigned Term';
      const term = typedStudentTerms.find((t: AcademicTerm) => t.id === termId);
      return term?.name || 'Unknown Term';
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Assignments</h2>
            <p className="text-gray-500 mt-1">View and complete your assignments</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              {pendingCount} Pending
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
              {completedCount} Completed
            </Badge>
          </div>
        </div>

        {isLoadingAssignments ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : typedAssignments.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-sm font-semibold text-gray-600 mb-1">No Assignments</h3>
              <p className="text-xs text-gray-400">You don't have any assignments yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedAssignments).map(([termId, termGroup]: [string, any]) => (
              <div key={termId} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Term Header */}
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <h3 className="text-sm font-bold text-black">{getTermName(termId)}</h3>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {Object.values(termGroup as Record<string, any[]>).flat().length}
                    </Badge>
                  </div>
                </div>

                {/* Subject Groups */}
                <div className="divide-y divide-gray-200">
                  {Object.entries(termGroup).map(([subject, subjectAssignments]: [string, any]) => (
                    <div key={subject}>
                      {/* Subject Header */}
                      <div className="px-3 py-1.5 bg-white flex items-center gap-2 border-b border-gray-100">
                        <Badge variant="outline" className="text-xs px-1.5 py-0 font-medium">
                          {subject}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {subjectAssignments.length}
                        </span>
                      </div>

                      {/* Assignments */}
                      <div className="divide-y divide-gray-100">
                        {subjectAssignments.map((assignment: Assignment) => {
                          const submission = typedSubmissions.find((s: Submission) => s.assignmentId === assignment.id);
                          const status = submission?.status || (isPast(new Date(assignment.submissionDate)) ? 'overdue' : 'pending');
                          const daysLeft = differenceInDays(new Date(assignment.submissionDate), new Date());

                          return (
                            <div key={assignment.id}>
                              <div 
                                className="px-3 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-medium text-black truncate">
                                        {assignment.title}
                                      </h4>
                                      <Badge 
                                        className={`text-xs px-1.5 py-0 ${getStatusColor(status)} whitespace-nowrap`}
                                      >
                                        {status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                      <span>
                                        Due: {format(new Date(assignment.submissionDate), 'MMM dd')}
                                      </span>
                                      {daysLeft >= 0 && daysLeft <= 3 && (
                                        <span className="text-yellow-600 font-medium">
                                          ({daysLeft} days)
                                        </span>
                                      )}
                                      {daysLeft < 0 && (
                                        <span className="text-red-600 font-medium">
                                          ({Math.abs(daysLeft)} days overdue)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="h-7 px-3 text-xs whitespace-nowrap flex-shrink-0 bg-black text-white hover:bg-gray-800"
                                    onClick={() => {
                                      window.open(`/student/assignment/${assignment.id}`, '_blank');
                                    }}
                                  >
                                    {submission?.status === 'submitted' || submission?.status === 'graded' ? 'View' : 'Work on it'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (embedded) {
    return (
      <div className="bg-gray-50">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-2 mb-6 gap-2">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md py-2 font-medium transition-all"
            >
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md py-2 font-medium transition-all"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md py-2 font-medium transition-all"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Assignments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <StudentCalendarDashboard />
          </TabsContent>

          <TabsContent value="assignments" className="mt-0">
            {renderAssignments()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Header - Compact for 13.3" screen */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/student/home">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100 h-8 px-3 text-sm">
                  <Home className="h-3 w-3 mr-1" />
                  Home
                </Button>
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-black">Student Portal</h1>
            </div>
            <Badge className="bg-black text-white px-3 py-1 text-xs">
              {user?.firstName} {user?.lastName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable for 13.3" screen */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-black rounded-lg p-1.5 mb-4 gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center justify-center gap-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded py-1.5 text-sm font-medium transition-all"
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center justify-center gap-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded py-1.5 text-sm font-medium transition-all"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Calendar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assignments" 
                className="flex items-center justify-center gap-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded py-1.5 text-sm font-medium transition-all"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Assignments</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              {renderDashboard()}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <StudentCalendarDashboard />
            </TabsContent>

            <TabsContent value="assignments" className="mt-0">
              {renderAssignments()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
