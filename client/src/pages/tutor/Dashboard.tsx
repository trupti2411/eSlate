import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, TrendingUp, Plus, ArrowRight, Home } from "lucide-react";
import { format } from "date-fns";

export default function TutorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: calendarEvents, isLoading: calendarLoading } = useQuery({
    queryKey: ["/api/calendar"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  const todayEvents = calendarEvents?.filter(event => {
    const eventDate = new Date(event.startTime).toDateString();
    return eventDate === new Date().toDateString();
  }) || [];

  const pendingReview = assignments?.filter((a: any) => a.status === 'submitted') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tutor">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Tutor Portal</h1>
                <p className="text-gray-500 text-sm">Manage students and track their progress</p>
              </div>
            </div>
            <BookOpen className="h-12 w-12 text-black opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/company/assignments">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 py-3 px-6 font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              New Assignment
            </Button>
          </Link>
          <Button className="border-2 border-black hover:bg-gray-100 py-3 px-6 font-semibold">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Class
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{students?.length || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Active students</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{assignments?.length || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Total created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{pendingReview.length}</div>
              <p className="text-xs text-gray-600 mt-1">Need grading</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{todayEvents.length}</div>
              <p className="text-xs text-gray-600 mt-1">Classes scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students */}
          <Card className="border-2 border-black lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : !students || students.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No students assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 6).map((student: any) => (
                    <div key={student.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-black transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-black">
                          {student.user?.firstName} {student.user?.lastName}
                        </h4>
                        <p className="text-xs text-gray-600">Grade {student.gradeLevel || 'N/A'}</p>
                      </div>
                      <Badge variant="outline" className="border-black text-black">
                        {student.assignments?.length || 0} tasks
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today & Pending */}
          <div className="space-y-6">
            <Card className="border-2 border-black bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-gray-600 text-sm">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {todayEvents.slice(0, 3).map((event: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white rounded border border-blue-200">
                        <p className="font-medium text-sm text-black">{event.title}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(event.startTime), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReview.length === 0 ? (
                  <p className="text-gray-600 text-sm">All caught up!</p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold text-lg text-black">{pendingReview.length}</p>
                    <p className="text-xs text-gray-600">submissions waiting</p>
                    <Link href="/company/homework">
                      <Button size="sm" className="w-full bg-black text-white mt-3 hover:bg-gray-800">
                        Review Now
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
