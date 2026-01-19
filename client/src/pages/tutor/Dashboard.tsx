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
    <div className="min-h-screen max-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Compact for 13.3" screen */}
      <div className="bg-white border-b-2 border-black flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/tutor">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100 h-8 px-3 text-sm">
                  <Home className="h-3 w-3 mr-1" />
                  Home
                </Button>
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-bold text-black">Tutor Portal</h1>
                <p className="text-gray-500 text-xs">Manage students and track progress</p>
              </div>
            </div>
            <BookOpen className="h-8 w-8 text-black opacity-10" />
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable for 13.3" screen */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Quick Actions - Compact */}
        <div className="flex gap-3 mb-4">
          <Link href="/company/assignments">
            <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 h-9 px-4 text-sm font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />
              New Assignment
            </Button>
          </Link>
          <Button className="border-2 border-black hover:bg-gray-100 h-9 px-4 text-sm font-semibold">
            <Calendar className="h-4 w-4 mr-1.5" />
            Schedule Class
          </Button>
        </div>

        {/* Stats Grid - Compact for 13.3" */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="border-2 border-black bg-white">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-black">{students?.length || 0}</div>
              <p className="text-xs text-gray-600">Active</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-black">{assignments?.length || 0}</div>
              <p className="text-xs text-gray-600">Created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-black">{pendingReview.length}</div>
              <p className="text-xs text-gray-600">Need grading</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-black">{todayEvents.length}</div>
              <p className="text-xs text-gray-600">Classes</p>
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
      {/* End of scrollable content */}
    </div>
  );
}
