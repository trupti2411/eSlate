import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, TrendingUp, Plus } from "lucide-react";

export default function TutorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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
          <p className="text-black">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayEvents = calendarEvents?.filter(event => {
    const eventDate = new Date(event.startTime).toDateString();
    return eventDate === new Date().toDateString();
  }) || [];

  const pendingReview = assignments?.filter(a => a.status === 'submitted') || [];
  const activeStudents = students?.length || 0;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="page-title">Tutor Dashboard</h1>
            <p className="text-gray-600">Manage your students and track their progress</p>
          </div>
          <div className="flex space-x-3">
            <Button className="eink-button">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
            <Button className="eink-button">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{activeStudents}</div>
              <p className="text-gray-600 text-sm">Active students</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{assignments?.length || 0}</div>
              <p className="text-gray-600 text-sm">Total created</p>
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
              <div className="text-3xl font-bold text-black">{pendingReview.length}</div>
              <p className="text-gray-600 text-sm">Need grading</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{todayEvents.length}</div>
              <p className="text-gray-600 text-sm">Scheduled today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Students */}
          <div>
            <h2 className="section-title">Your Students</h2>
            {studentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="eink-card p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <div className="space-y-4">
                {students.slice(0, 5).map((student) => (
                  <Card key={student.id} className="eink-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-black">
                            {student.user?.firstName} {student.user?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">Grade {student.gradeLevel || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="status-badge status-assigned">
                            {student.assignments?.length || 0} assignments
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="eink-card">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-black mb-2">No Students Yet</h3>
                  <p className="text-gray-600">You haven't been assigned any students yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Assignments */}
          <div>
            <h2 className="section-title">Recent Assignments</h2>
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
              <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                  <Card key={assignment.id} className="eink-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-black">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">
                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                        <Badge className={`status-badge status-${assignment.status}`}>
                          {assignment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="eink-card">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-black mb-2">No Assignments Yet</h3>
                  <p className="text-gray-600">Create your first assignment to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        {todayEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="section-title">Today's Schedule</h2>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <Card key={event.id} className="eink-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-black">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className="status-badge status-assigned">
                        {event.eventType}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}