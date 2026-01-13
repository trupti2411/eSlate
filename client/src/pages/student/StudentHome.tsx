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
  LogOut, Tablet, Home
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
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

  const navigationItems = [
    { href: '/student/home', icon: Home, label: 'Dashboard' },
    { href: '/student/portal', icon: BookOpen, label: 'My Worksheets' },
    { href: '/student/assignments', icon: FileText, label: 'Assignments' },
    { href: '/student/dashboard', icon: Calendar, label: 'Calendar' },
  ];

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
      {/* Top Navigation Bar - matching company portal */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/student/home" className="flex items-center space-x-3">
              <Tablet className="h-8 w-8 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">eSlate</h1>
              <span className="text-sm text-gray-500 font-medium">Student Portal</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName || user?.email || 'Student'}
              </span>
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
      </header>

      <div className="flex">
        {/* Sidebar Navigation - matching company portal style */}
        <aside className="w-64 min-h-screen border-r border-gray-200 bg-white p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = window.location.pathname === item.href || 
                (item.href !== '/student/home' && window.location.pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className={`
                  flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Page Header */}
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
                </div>
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

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/student/portal">
              <Button className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm py-2.5 px-5 font-medium">
                <FileText className="h-4 w-4 mr-2" />
                My Worksheets
              </Button>
            </Link>
            <Link href="/student/assignments">
              <Button className="bg-gray-700 hover:bg-gray-800 text-white shadow-sm py-2.5 px-5 font-medium">
                <BookOpen className="h-4 w-4 mr-2" />
                Assignments
              </Button>
            </Link>
            <Link href="/student/dashboard">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 py-2.5 px-5 font-medium shadow-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'grades', label: 'Grades', icon: Award },
                { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

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
                    <Link href="/student/portal">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">Open Portal</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                    <Link href="/student/dashboard">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">View Calendar</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
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
        </div>
        </main>
      </div>
    </div>
  );
}
