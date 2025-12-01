import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, CheckCircle, Clock, FileText, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Assignment, AcademicTerm, Class } from '@shared/schema';

export default function StudentHome() {
  const { user } = useAuth();

  const { data: studentProfile } = useQuery({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student'
  });

  const studentDbId = (studentProfile as any)?.id || '';

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['/api/students', studentDbId, 'assignments'],
    enabled: !!studentDbId
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/students', studentDbId, 'submissions'],
    enabled: !!studentDbId
  });

  const { data: progress = [] } = useQuery<any[]>({
    queryKey: ['/api/progress'],
    enabled: !!user
  });

  const { data: terms = [] } = useQuery<AcademicTerm[]>({
    queryKey: ['/api/students', studentDbId, 'terms'],
    enabled: !!studentDbId
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/students', studentDbId, 'classes'],
    enabled: !!studentDbId
  });

  const pendingAssignments = (assignments as Assignment[]).filter(a => 
    !submissions.some((s: any) => s.assignmentId === a.id && s.status === 'submitted')
  );

  const completedAssignments = submissions.filter((s: any) => s.status === 'submitted').length;
  const completionRate = assignments.length > 0 
    ? Math.round((completedAssignments / assignments.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black">Welcome, {user?.firstName}!</h1>
              <p className="text-gray-600 mt-2">Your personalized learning dashboard</p>
            </div>
            <BookOpen className="h-16 w-16 text-black opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{pendingAssignments.length}</div>
              <p className="text-xs text-gray-600 mt-1">Waiting to submit</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{completedAssignments}</div>
              <p className="text-xs text-gray-600 mt-1">{completionRate}% completion</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{(classes as Class[]).length}</div>
              <p className="text-xs text-gray-600 mt-1">Enrolled in classes</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Study Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {progress.reduce((total: number, p: any) => total + (p.timeSpent || 0), 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Minutes studied</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Assignments */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pending Assignments ({pendingAssignments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-600">All assignments completed!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAssignments.slice(0, 5).map((assignment: Assignment) => (
                      <div key={assignment.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-black transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-black">{assignment.title}</h4>
                            <p className="text-xs text-gray-600">{assignment.subject} • Week {assignment.week}</p>
                          </div>
                          <Badge variant="outline" className="border-black text-black">
                            Due {format(new Date(assignment.submissionDate), 'MMM dd')}
                          </Badge>
                        </div>
                        <Link href="/student/portal">
                          <Button size="sm" className="mt-2 bg-black text-white hover:bg-gray-800">
                            Start Assignment
                            <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Classes Overview */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Classes ({(classes as Class[]).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(classes as Class[]).length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No classes enrolled yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(classes as Class[]).slice(0, 4).map((cls: Class) => (
                      <div key={cls.id} className="p-3 bg-gray-50 rounded border-2 border-gray-200">
                        <h4 className="font-semibold text-black text-sm">{cls.name}</h4>
                        <p className="text-xs text-gray-600">Grade {cls.grade}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Main Portal Button */}
            <Link href="/student/portal">
              <Button className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 py-6 text-base font-semibold">
                <BookOpen className="h-5 w-5 mr-2" />
                Open Full Portal
              </Button>
            </Link>

            {/* Quick Links */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-base">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/student/portal">
                  <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                    <FileText className="h-4 w-4 mr-2" />
                    All Assignments
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Study Progress */}
            {progress.length > 0 && (
              <Card className="border-2 border-black bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Study Sessions</p>
                      <p className="text-2xl font-bold text-black">{progress.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Study Time</p>
                      <p className="text-2xl font-bold text-black">
                        {Math.round(progress.reduce((t: number, p: any) => t + (p.timeSpent || 0), 0) / 60)}h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
