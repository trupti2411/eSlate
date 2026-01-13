import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Calendar, CheckCircle, Clock, FileText, 
  AlertTriangle, TrendingUp, ArrowRight, GraduationCap,
  ClipboardCheck, Award, Users, XCircle
} from 'lucide-react';
import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import { Assignment, AcademicTerm, Class, Submission } from '@shared/schema';

interface AttendanceApiResponse {
  summary: {
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  };
  bySubject: {
    subject: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    percentage: number;
  }[];
  learningHours: {
    totalMinutes: number;
    bySubject: { subject: string; minutes: number }[];
    byWeek: { week: string; minutes: number }[];
  };
}

export default function StudentHome() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: studentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student'
  });

  const studentDbId = (studentProfile as any)?.id || '';

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/students', studentDbId, 'assignments'],
    enabled: !!studentDbId
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ['/api/students', studentDbId, 'submissions'],
    enabled: !!studentDbId
  });

  const { data: worksheets = [] } = useQuery<any[]>({
    queryKey: ['/api/students', studentDbId, 'worksheets'],
    enabled: !!studentDbId
  });

  const { data: tests = [] } = useQuery<any[]>({
    queryKey: ['/api/students', studentDbId, 'tests'],
    enabled: !!studentDbId
  });

  const { data: terms = [] } = useQuery<AcademicTerm[]>({
    queryKey: ['/api/students', studentDbId, 'terms'],
    enabled: !!studentDbId
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId
  });

  const { data: progress = [] } = useQuery<any[]>({
    queryKey: ['/api/progress'],
    enabled: !!user
  });

  const { data: attendanceData } = useQuery<AttendanceApiResponse>({
    queryKey: ['/api/attendance/summary/student', studentDbId],
    enabled: !!studentDbId
  });

  const typedAssignments = assignments as Assignment[];
  const typedSubmissions = submissions as Submission[];
  const typedClasses = classes as Class[];
  const typedWorksheets = worksheets as any[];
  const typedTests = tests as any[];

  const getSubmissionForAssignment = (assignmentId: string) => {
    return typedSubmissions.find(s => s.assignmentId === assignmentId);
  };

  interface UnifiedItem {
    id: string;
    title: string;
    subject: string;
    dueDate: Date;
    type: 'assignment' | 'worksheet' | 'test';
    status: 'pending' | 'overdue' | 'submitted' | 'graded' | 'in_progress';
    link: string;
  }

  const normalizeWorksheet = (ws: any): UnifiedItem | null => {
    const assignment = ws.assignment;
    const worksheet = ws.worksheet;
    if (!assignment || !worksheet) return null;
    
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : new Date();
    const isOverdue = isPast(dueDate) && assignment.status !== 'completed' && assignment.status !== 'graded';
    
    return {
      id: `ws-${assignment.id}`,
      title: worksheet.title || 'Worksheet',
      subject: worksheet.subject || 'General',
      dueDate,
      type: 'worksheet',
      status: assignment.status === 'completed' ? 'submitted' 
           : assignment.status === 'graded' ? 'graded'
           : assignment.status === 'in_progress' ? 'in_progress'
           : isOverdue ? 'overdue' : 'pending',
      link: '/student/portal',
    };
  };

  const normalizeTest = (t: any): UnifiedItem | null => {
    const assignment = t.assignment;
    const test = t.test;
    if (!assignment || !test) return null;
    
    const dueDate = test.availableUntil ? new Date(test.availableUntil) : new Date();
    const attemptStatus = t.attemptStatus || 'not_started';
    const isOverdue = isPast(dueDate) && attemptStatus === 'not_started';
    
    return {
      id: `test-${assignment.id}`,
      title: test.title || 'Test',
      subject: test.subject || 'General',
      dueDate,
      type: 'test',
      status: attemptStatus === 'graded' ? 'graded'
           : attemptStatus === 'submitted' ? 'submitted'
           : attemptStatus === 'in_progress' ? 'in_progress'
           : isOverdue ? 'overdue' : 'pending',
      link: '/student/portal',
    };
  };

  const normalizeAssignment = (a: Assignment): UnifiedItem => {
    const submission = getSubmissionForAssignment(a.id);
    const dueDate = new Date(a.submissionDate);
    const isOverdue = !submission && isPast(dueDate);
    
    return {
      id: `asg-${a.id}`,
      title: a.title,
      subject: a.subject || 'General',
      dueDate,
      type: 'assignment',
      status: submission?.status === 'graded' ? 'graded'
           : submission ? 'submitted'
           : isOverdue ? 'overdue' : 'pending',
      link: '/student/portal',
    };
  };

  const allItems: UnifiedItem[] = [
    ...typedAssignments.map(normalizeAssignment),
    ...typedWorksheets.map(normalizeWorksheet).filter((x): x is UnifiedItem => x !== null),
    ...typedTests.map(normalizeTest).filter((x): x is UnifiedItem => x !== null),
  ];

  const pendingItems = allItems.filter(i => i.status === 'pending' || i.status === 'in_progress');
  const overdueItems = allItems.filter(i => i.status === 'overdue');
  const completedItems = allItems.filter(i => i.status === 'submitted' || i.status === 'graded');
  const gradedItems = allItems.filter(i => i.status === 'graded');

  const pendingAssignments = typedAssignments.filter(a => {
    const submission = getSubmissionForAssignment(a.id);
    return !submission && !isPast(new Date(a.submissionDate));
  });

  const overdueAssignments = typedAssignments.filter(a => {
    const submission = getSubmissionForAssignment(a.id);
    return !submission && isPast(new Date(a.submissionDate));
  });

  const gradedSubmissions = typedSubmissions.filter(s => s.status === 'graded');
  const submittedCount = typedSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;

  const upcomingDeadlines = allItems
    .filter(i => i.status === 'pending' || i.status === 'in_progress')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const getDaysUntilDue = (dueDate: string | Date) => {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const days = differenceInDays(dateObj, new Date());
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Overdue';
    return `${days} days`;
  };

  const getUrgencyClass = (dueDate: string | Date) => {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const days = differenceInDays(dateObj, new Date());
    if (days < 0) return 'bg-black text-white';
    if (days <= 1) return 'bg-black text-white';
    if (days <= 3) return 'border-2 border-black text-black';
    return 'border border-gray-400 text-gray-700';
  };

  const totalStudyMinutes = progress.reduce((total: number, p: any) => total + (p.timeSpent || 0), 0);
  const attendancePercentage = attendanceData?.summary?.attendancePercentage ?? 0;
  const totalClasses = attendanceData?.summary?.totalSessions ?? 0;
  const classesAttended = attendanceData?.summary?.present ?? 0;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black dark:text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* E-ink optimized header - high contrast */}
      <div className="bg-black dark:bg-white text-white dark:text-black border-b-4 border-black dark:border-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Hello, {user?.firstName}
              </h1>
              <p className="text-gray-300 dark:text-gray-600 mt-1 font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Alert Banner for Overdue - All Types */}
        {overdueItems.length > 0 && (
          <div className="mb-6 p-4 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">
                  {overdueItems.length} Overdue Item{overdueItems.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm opacity-80">Please submit as soon as possible</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs - Large touch targets for e-ink */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'grades', label: 'Grades', icon: Award },
              { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
            ].map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`py-3 px-5 text-base font-bold ${
                  activeTab === tab.id 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white' 
                    : 'bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats - High contrast cards - Unified counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-4 border-black dark:border-white bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-6 w-6 text-black dark:text-white" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">PENDING</span>
                  </div>
                  <div className="text-4xl font-black text-black dark:text-white">{pendingItems.length}</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-6 w-6 text-black dark:text-white" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">COMPLETED</span>
                  </div>
                  <div className="text-4xl font-black text-black dark:text-white">{completedItems.length}</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-black dark:text-white" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">CLASSES</span>
                  </div>
                  <div className="text-4xl font-black text-black dark:text-white">{typedClasses.length}</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-black dark:text-white" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">STUDY TIME</span>
                  </div>
                  <div className="text-4xl font-black text-black dark:text-white">
                    {totalStudyMinutes}<span className="text-lg">m</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Deadlines Widget */}
            <Card className="border-4 border-black dark:border-white">
              <CardHeader className="border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-800">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-black dark:text-white">
                  <AlertTriangle className="h-6 w-6" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-400">No upcoming deadlines</p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-black dark:divide-white">
                    {upcomingDeadlines.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-black dark:text-white">{item.title}</h4>
                            <Badge variant="outline" className="text-xs font-bold border-black dark:border-white">
                              {item.type === 'worksheet' ? 'Worksheet' : item.type === 'test' ? 'Test' : 'Assignment'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.subject}</p>
                        </div>
                        <Badge className={`text-sm font-bold px-3 py-1 ${getUrgencyClass(item.dueDate)}`}>
                          {getDaysUntilDue(item.dueDate)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/student/portal">
                <Card className="border-4 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-black dark:text-white">Open Full Portal</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Complete worksheets & submit work</p>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-black dark:text-white" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/student/dashboard">
                <Card className="border-4 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-black dark:text-white">View Calendar</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Check class schedule</p>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-black dark:text-white" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Assignments Tab - Unified Assignment Hub */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Assignment Type Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-black dark:text-white" />
                  <div className="text-3xl font-black text-black dark:text-white">{typedAssignments.length}</div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Assignments</p>
                </CardContent>
              </Card>
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-black dark:text-white" />
                  <div className="text-3xl font-black text-black dark:text-white">{(worksheets as any[]).length}</div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Worksheets</p>
                </CardContent>
              </Card>
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-4 text-center">
                  <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-black dark:text-white" />
                  <div className="text-3xl font-black text-black dark:text-white">{(tests as any[]).length}</div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Tests</p>
                </CardContent>
              </Card>
            </div>

            {/* Overdue Section - All Types */}
            {overdueItems.length > 0 && (
              <Card className="border-4 border-black dark:border-white">
                <CardHeader className="bg-black dark:bg-white text-white dark:text-black">
                  <CardTitle className="flex items-center gap-2 font-black">
                    <AlertTriangle className="h-5 w-5" />
                    OVERDUE ({overdueItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y-2 divide-gray-200 dark:divide-gray-700">
                  {overdueItems.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-black dark:text-white">{item.title}</h4>
                          <Badge variant="outline" className="text-xs font-bold border-black dark:border-white">
                            {item.type === 'worksheet' ? 'Worksheet' : item.type === 'test' ? 'Test' : 'Assignment'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.subject} • Was due {format(item.dueDate, 'MMM d')}
                        </p>
                      </div>
                      <Link href={item.link}>
                        <Button className="bg-black dark:bg-white text-white dark:text-black font-bold">
                          Submit Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pending Section - All Types */}
            <Card className="border-4 border-black dark:border-white">
              <CardHeader className="border-b-2 border-black dark:border-white">
                <CardTitle className="flex items-center gap-2 font-black text-black dark:text-white">
                  <Clock className="h-5 w-5" />
                  Pending ({pendingItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-bold text-gray-600 dark:text-gray-400">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-black dark:text-white">{item.title}</h4>
                            <Badge variant="outline" className="text-xs font-bold border-black dark:border-white">
                              {item.type === 'worksheet' ? 'Worksheet' : item.type === 'test' ? 'Test' : 'Assignment'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.subject} • Due {format(item.dueDate, 'MMM d')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`font-bold ${getUrgencyClass(item.dueDate)}`}>
                            {getDaysUntilDue(item.dueDate)}
                          </Badge>
                          <Link href={item.link}>
                            <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black font-bold">
                              Start
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Section - All Types */}
            <Card className="border-4 border-black dark:border-white">
              <CardHeader className="border-b-2 border-black dark:border-white">
                <CardTitle className="flex items-center gap-2 font-black text-black dark:text-white">
                  <CheckCircle className="h-5 w-5" />
                  Completed ({completedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {completedItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-bold text-gray-600 dark:text-gray-400">No submissions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {completedItems.slice(0, 10).map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-black dark:text-white">{item.title}</h4>
                            <Badge variant="outline" className="text-xs font-bold border-black dark:border-white">
                              {item.type === 'worksheet' ? 'Worksheet' : item.type === 'test' ? 'Test' : 'Assignment'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.subject}</p>
                        </div>
                        <Badge 
                          className={`font-bold ${
                            item.status === 'graded' 
                              ? 'bg-black dark:bg-white text-white dark:text-black' 
                              : 'border-2 border-black dark:border-white text-black dark:text-white bg-transparent'
                          }`}
                        >
                          {item.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* Grade Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <Award className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {gradedSubmissions.length}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">GRADED WORK</p>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {submittedCount}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">TOTAL SUBMITTED</p>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {typedAssignments.length > 0 ? Math.round((submittedCount / typedAssignments.length) * 100) : 0}%
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">COMPLETION RATE</p>
                </CardContent>
              </Card>
            </div>

            {/* Graded Work List */}
            <Card className="border-4 border-black dark:border-white">
              <CardHeader className="border-b-2 border-black dark:border-white">
                <CardTitle className="font-black text-black dark:text-white">Graded Submissions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {gradedSubmissions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-bold text-gray-600 dark:text-gray-400">No graded work yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Grades will appear here once tutors review your submissions</p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-black dark:divide-white">
                    {gradedSubmissions.map((submission: any) => {
                      const assignment = typedAssignments.find(a => a.id === submission.assignmentId);
                      return (
                        <div key={submission.id} className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-black dark:text-white">{assignment?.title || 'Assignment'}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{assignment?.subject}</p>
                          </div>
                          <Badge className="bg-black dark:bg-white text-white dark:text-black font-bold px-4 py-2">
                            Graded
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {classesAttended}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">CLASSES ATTENDED</p>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {totalClasses}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">TOTAL CLASSES</p>
                </CardContent>
              </Card>

              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 text-black dark:text-white" />
                  <div className="text-5xl font-black text-black dark:text-white mb-2">
                    {attendancePercentage}%
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">ATTENDANCE RATE</p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Breakdown */}
            {attendanceData?.bySubject && attendanceData.bySubject.length > 0 && (
              <Card className="border-4 border-black dark:border-white">
                <CardHeader className="border-b-2 border-black dark:border-white">
                  <CardTitle className="font-black text-black dark:text-white">Attendance by Subject</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y-2 divide-black dark:divide-white">
                  {attendanceData.bySubject.map((subject, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-black dark:text-white">{subject.subject}</h4>
                        <span className="text-2xl font-black text-black dark:text-white">{subject.percentage}%</span>
                      </div>
                      <Progress value={subject.percentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> {subject.present} present
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> {subject.absent} absent
                        </span>
                        {subject.late > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {subject.late} late
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty state if no attendance data */}
            {(!attendanceData || totalClasses === 0) && (
              <Card className="border-4 border-black dark:border-white">
                <CardContent className="p-12 text-center">
                  <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-black text-black dark:text-white mb-2">No Attendance Records</h3>
                  <p className="text-gray-600 dark:text-gray-400">Attendance will appear here once classes begin</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
