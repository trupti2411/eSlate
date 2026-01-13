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
  ClipboardCheck, Award, Users, XCircle, Activity, Bell, ChevronRight,
  LogOut
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { Assignment, AcademicTerm, Class, Submission } from '@shared/schema';
import { StudentCalendarDashboard } from '@/components/calendar/StudentCalendarDashboard';
import { StudentPortal } from './StudentPortal';

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
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const { data: worksheets = [], isLoading: worksheetsLoading } = useQuery<any[]>({
    queryKey: ['/api/students', studentDbId, 'worksheets'],
    enabled: !!studentDbId
  });

  const { data: tests = [], isLoading: testsLoading } = useQuery<any[]>({
    queryKey: ['/api/students', studentDbId, 'tests'],
    enabled: !!studentDbId
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery<any[]>({
    queryKey: ['/api/progress'],
    enabled: !!user
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery<AttendanceApiResponse>({
    queryKey: ['/api/attendance/summary/student', studentDbId],
    enabled: !!studentDbId
  });

  const isDataLoading = assignmentsLoading || submissionsLoading || worksheetsLoading || testsLoading;

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
    const assignment = ws.assignment || ws;
    const worksheet = ws.worksheet || ws;
    if (!assignment?.id) return null;
    
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : 
                    worksheet.dueDate ? new Date(worksheet.dueDate) : new Date();
    const status = assignment.status || 'assigned';
    const isOverdue = isPast(dueDate) && status !== 'completed' && status !== 'graded';
    
    return {
      id: `ws-${assignment.id}`,
      title: worksheet.title || assignment.title || 'Worksheet',
      subject: worksheet.subject || assignment.subject || 'General',
      dueDate,
      type: 'worksheet',
      status: status === 'completed' ? 'submitted' 
           : status === 'graded' ? 'graded'
           : status === 'in_progress' ? 'in_progress'
           : isOverdue ? 'overdue' : 'pending',
      link: '/student/portal',
    };
  };

  const normalizeTest = (t: any): UnifiedItem | null => {
    const assignment = t.assignment || t;
    const test = t.test || t;
    if (!assignment?.id && !test?.id) return null;
    
    const dueDate = test.availableUntil ? new Date(test.availableUntil) :
                    assignment.dueDate ? new Date(assignment.dueDate) : new Date();
    const attemptStatus = t.attemptStatus || t.status || 'not_started';
    const isOverdue = isPast(dueDate) && attemptStatus === 'not_started';
    
    return {
      id: `test-${assignment.id || test.id}`,
      title: test.title || assignment.title || 'Test',
      subject: test.subject || assignment.subject || 'General',
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
      link: '/student/assignments',
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

  const gradedSubmissions = typedSubmissions.filter(s => s.status === 'graded');
  const submittedCount = typedSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;

  const upcomingDeadlines = allItems
    .filter(i => i.status === 'pending' || i.status === 'in_progress')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const getDaysUntilDue = (dueDate: Date) => {
    const days = differenceInDays(dueDate, new Date());
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Overdue';
    return `${days} days`;
  };

  const getUrgencyColor = (dueDate: Date) => {
    const days = differenceInDays(dueDate, new Date());
    if (days < 0) return 'bg-red-50 text-red-700 border-red-200';
    if (days <= 1) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (days <= 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const totalStudyMinutes = progress.reduce((total: number, p: any) => total + (p.timeSpent || 0), 0);
  const attendancePercentage = attendanceData?.summary?.attendancePercentage ?? 0;
  const totalClasses = attendanceData?.summary?.totalSessions ?? 0;
  const classesAttended = attendanceData?.summary?.present ?? 0;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/';
    } catch (error) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching company portal exactly */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-blue-50 rounded-xl">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.firstName || 'Student'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Bell className="h-4 w-4" />
                <span>{format(new Date(), 'EEEE, MMM d')}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - matching company portal exactly */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className={`rounded-b-none border-b-2 ${activeTab === 'dashboard' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className={`rounded-b-none border-b-2 ${activeTab === 'overview' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'worksheets' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('worksheets')}
              className={`rounded-b-none border-b-2 ${activeTab === 'worksheets' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Worksheets
            </Button>
            <Button
              variant={activeTab === 'assignments' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('assignments')}
              className={`rounded-b-none border-b-2 ${activeTab === 'assignments' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Assignments
            </Button>
            <Button
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('calendar')}
              className={`rounded-b-none border-b-2 ${activeTab === 'calendar' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={activeTab === 'grades' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('grades')}
              className={`rounded-b-none border-b-2 ${activeTab === 'grades' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <Award className="h-4 w-4 mr-2" />
              Grades
            </Button>
            <Button
              variant={activeTab === 'attendance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('attendance')}
              className={`rounded-b-none border-b-2 ${activeTab === 'attendance' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Attendance
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alert Banner for Overdue Items */}
          {overdueItems.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  {overdueItems.length} Overdue Item{overdueItems.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-600">Please submit as soon as possible</p>
              </div>
              <Link href="/student/assignments">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  View All
                </Button>
              </Link>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-600">Welcome back! Here's your learning summary.</p>
                </div>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <Activity className="h-3 w-3 mr-1 inline" />
                  Live
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Pending</p>
                        <div className="text-3xl font-bold">{pendingItems.length}</div>
                        <p className="text-blue-100 text-xs mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Items to complete
                        </p>
                      </div>
                      <div className="bg-blue-400/30 p-3 rounded-full">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Completed</p>
                        <div className="text-3xl font-bold">{completedItems.length}</div>
                        <p className="text-green-100 text-xs mt-1 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted work
                        </p>
                      </div>
                      <div className="bg-green-400/30 p-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Attendance</p>
                        <div className="text-3xl font-bold">{attendancePercentage}%</div>
                        <p className="text-purple-100 text-xs mt-1 flex items-center">
                          <ClipboardCheck className="h-3 w-3 mr-1" />
                          {classesAttended}/{totalClasses} classes
                        </p>
                      </div>
                      <div className="bg-purple-400/30 p-3 rounded-full">
                        <ClipboardCheck className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm font-medium">Overdue</p>
                        <div className="text-3xl font-bold">{overdueItems.length}</div>
                        <p className="text-amber-100 text-xs mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs attention
                        </p>
                      </div>
                      <div className="bg-amber-400/30 p-3 rounded-full">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveTab('worksheets')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">My Worksheets</h3>
                      <p className="text-sm text-gray-500">View and complete worksheets</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                  </CardContent>
                </Card>
                <Card 
                  className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveTab('assignments')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Assignments</h3>
                      <p className="text-sm text-gray-500">View all assignments</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                  </CardContent>
                </Card>
                <Card 
                  className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveTab('calendar')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Calendar</h3>
                      <p className="text-sm text-gray-500">View schedule & classes</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Loading state */}
              {isDataLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 font-medium">Loading data...</span>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Pending</p>
                        <div className="text-3xl font-bold text-gray-900">{pendingItems.length}</div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Items to complete
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Completed</p>
                        <div className="text-3xl font-bold text-gray-900">{completedItems.length}</div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted work
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Classes</p>
                        <div className="text-3xl font-bold text-gray-900">{typedClasses.length}</div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Enrolled classes
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Study Time</p>
                        <div className="text-3xl font-bold text-gray-900">{totalStudyMinutes}m</div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Total minutes
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Deadlines */}
                <Card className="lg:col-span-2 border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {upcomingDeadlines.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No upcoming deadlines</p>
                        <p className="text-gray-400 text-sm mt-1">Great job staying on top of your work!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingDeadlines.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                item.type === 'worksheet' ? 'bg-blue-50' : 
                                item.type === 'test' ? 'bg-purple-50' : 'bg-green-50'
                              }`}>
                                {item.type === 'worksheet' ? <BookOpen className="h-4 w-4 text-blue-600" /> :
                                 item.type === 'test' ? <ClipboardCheck className="h-4 w-4 text-purple-600" /> :
                                 <FileText className="h-4 w-4 text-green-600" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.subject} • Due {format(item.dueDate, 'MMM d')}</p>
                              </div>
                            </div>
                            <Badge className={getUrgencyColor(item.dueDate)}>
                              {getDaysUntilDue(item.dueDate)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                      </div>
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div 
                      onClick={() => setActiveTab('worksheets')}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">My Worksheets</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div 
                      onClick={() => setActiveTab('calendar')}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">View Calendar</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {/* Assignment Type Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-green-50 rounded-xl inline-block mb-3">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{typedAssignments.length}</div>
                    <p className="text-sm text-gray-500">Assignments</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{typedWorksheets.length}</div>
                    <p className="text-sm text-gray-500">Worksheets</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-purple-50 rounded-xl inline-block mb-3">
                      <ClipboardCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{typedTests.length}</div>
                    <p className="text-sm text-gray-500">Tests</p>
                  </CardContent>
                </Card>
              </div>

              {/* Overdue Section */}
              {overdueItems.length > 0 && (
                <Card className="border border-red-200 shadow-sm bg-white">
                  <CardHeader className="bg-red-50 border-b border-red-200">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      Overdue ({overdueItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {overdueItems.map((item, index) => (
                      <div key={item.id} className={`p-4 flex items-center justify-between ${index !== overdueItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'worksheet' ? 'bg-blue-50' : 
                            item.type === 'test' ? 'bg-purple-50' : 'bg-green-50'
                          }`}>
                            {item.type === 'worksheet' ? <BookOpen className="h-4 w-4 text-blue-600" /> :
                             item.type === 'test' ? <ClipboardCheck className="h-4 w-4 text-purple-600" /> :
                             <FileText className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.subject} • Was due {format(item.dueDate, 'MMM d')}</p>
                          </div>
                        </div>
                        <Link href={item.link}>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Submit Now
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Pending Section */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    Pending ({pendingItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">All caught up!</p>
                    </div>
                  ) : (
                    pendingItems.map((item, index) => (
                      <div key={item.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${index !== pendingItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'worksheet' ? 'bg-blue-50' : 
                            item.type === 'test' ? 'bg-purple-50' : 'bg-green-50'
                          }`}>
                            {item.type === 'worksheet' ? <BookOpen className="h-4 w-4 text-blue-600" /> :
                             item.type === 'test' ? <ClipboardCheck className="h-4 w-4 text-purple-600" /> :
                             <FileText className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.subject} • Due {format(item.dueDate, 'MMM d')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getUrgencyColor(item.dueDate)}>
                            {getDaysUntilDue(item.dueDate)}
                          </Badge>
                          <Link href={item.link}>
                            <Button size="sm" variant="outline" className="border-gray-300">
                              Start
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Completed Section */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    Completed ({completedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {completedItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No submissions yet</p>
                    </div>
                  ) : (
                    completedItems.slice(0, 10).map((item, index) => (
                      <div key={item.id} className={`p-4 flex items-center justify-between ${index !== Math.min(completedItems.length, 10) - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'worksheet' ? 'bg-blue-50' : 
                            item.type === 'test' ? 'bg-purple-50' : 'bg-green-50'
                          }`}>
                            {item.type === 'worksheet' ? <BookOpen className="h-4 w-4 text-blue-600" /> :
                             item.type === 'test' ? <ClipboardCheck className="h-4 w-4 text-purple-600" /> :
                             <FileText className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.subject}</p>
                          </div>
                        </div>
                        <Badge className={item.status === 'graded' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
                          {item.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </Badge>
                      </div>
                    ))
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
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-amber-50 rounded-xl inline-block mb-3">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{gradedSubmissions.length}</div>
                    <p className="text-sm text-gray-500">Graded Work</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-green-50 rounded-xl inline-block mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{submittedCount}</div>
                    <p className="text-sm text-gray-500">Total Submitted</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {typedAssignments.length > 0 ? Math.round((submittedCount / typedAssignments.length) * 100) : 0}%
                    </div>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Graded Work List */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    Graded Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {gradedSubmissions.length === 0 ? (
                    <div className="p-8 text-center">
                      <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">No graded work yet</p>
                      <p className="text-gray-400 text-sm mt-1">Grades will appear here once tutors review your submissions</p>
                    </div>
                  ) : (
                    gradedSubmissions.map((submission: any, index) => {
                      const assignment = typedAssignments.find(a => a.id === submission.assignmentId);
                      return (
                        <div key={submission.id} className={`p-4 flex items-center justify-between ${index !== gradedSubmissions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <FileText className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{assignment?.title || 'Assignment'}</p>
                              <p className="text-xs text-gray-500">{assignment?.subject}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            Graded
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Loading state */}
              {attendanceLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 font-medium">Loading attendance...</span>
                </div>
              )}

              {/* Attendance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-green-50 rounded-xl inline-block mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{classesAttended}</div>
                    <p className="text-sm text-gray-500">Classes Attended</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{totalClasses}</div>
                    <p className="text-sm text-gray-500">Total Classes</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="p-3 bg-purple-50 rounded-xl inline-block mb-3">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{attendancePercentage}%</div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Breakdown */}
              {attendanceData?.bySubject && attendanceData.bySubject.length > 0 && (
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      Attendance by Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {attendanceData.bySubject.map((subject, index) => (
                      <div key={index} className={`p-4 ${index !== attendanceData.bySubject.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{subject.subject}</span>
                          <span className="text-xl font-bold text-gray-900">{subject.percentage}%</span>
                        </div>
                        <Progress value={subject.percentage} className="h-2 bg-gray-100" />
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" /> {subject.present} present
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" /> {subject.absent} absent
                          </span>
                          {subject.late > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-500" /> {subject.late} late
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {(!attendanceData || totalClasses === 0) && (
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-12 text-center">
                    <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Attendance Records</h3>
                    <p className="text-gray-500">Attendance will appear here once classes begin</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Worksheets Tab - embedded StudentPortal */}
          {activeTab === 'worksheets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Worksheets</h2>
                  <p className="text-gray-600">View and complete your assigned worksheets</p>
                </div>
              </div>
              <StudentPortal embedded={true} />
            </div>
          )}

          {/* Calendar Tab - embedded StudentCalendarDashboard */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                  <p className="text-gray-600">View your class schedule and attendance</p>
                </div>
              </div>
              <StudentCalendarDashboard />
            </div>
          )}
      </div>
    </div>
  );
}
