import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isToday } from "date-fns";
import { RoleCalendar, type CalendarSession, type CalendarHoliday, type CalendarHomeworkDeadline, type CalendarEvent } from "./RoleCalendar";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarDays,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GraduationCap,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StudentSession extends CalendarSession {
  attendanceStatus?: AttendanceStatus;
  durationMinutes?: number;
}

interface StudentCalendarData {
  sessions: StudentSession[];
  holidays: CalendarHoliday[];
  homeworkDeadlines: CalendarHomeworkDeadline[];
}

interface SubjectAttendance {
  subject: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

interface LearningHours {
  subject: string;
  hours: number;
}

interface AttendanceSummary {
  totalClasses: number;
  classesAttended: number;
  attendancePercentage: number;
  subjectBreakdown: SubjectAttendance[];
  learningHours: {
    weekly: number;
    monthly: number;
    bySubject: LearningHours[];
  };
  recentAttendance: {
    date: string;
    subject: string;
    status: AttendanceStatus;
    className?: string;
  }[];
}

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

export function StudentCalendarDashboard() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<StudentSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [hoursView, setHoursView] = useState<"weekly" | "monthly">("weekly");

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<StudentCalendarData>({
    queryKey: ["/api/calendar/student"],
  });

  const { data: attendanceSummary, isLoading: isAttendanceLoading } = useQuery<AttendanceSummary>({
    queryKey: ["/api/attendance/summary/student", user?.id],
    enabled: !!user?.id,
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
      .slice(0, 5);
  }, [calendarData?.homeworkDeadlines]);

  const calendarSessions: CalendarSession[] = useMemo(() => {
    return (calendarData?.sessions || []).map((session) => ({
      id: session.id,
      subject: session.subject,
      className: session.className,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      tutorName: session.tutorName,
      location: session.location,
      notes: session.notes,
      attendanceStatus: session.attendanceStatus,
    }));
  }, [calendarData?.sessions]);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "session") {
      const sessionData = event.data as CalendarSession;
      const fullSession = calendarData?.sessions.find((s) => s.id === sessionData.id);
      if (fullSession) {
        setSelectedSession(fullSession);
        setIsSessionModalOpen(true);
      }
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "late":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "excused":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const attendanceChartData = useMemo(() => {
    if (!attendanceSummary?.subjectBreakdown) return [];
    return attendanceSummary.subjectBreakdown.map((subject) => ({
      name: subject.subject,
      percentage: subject.percentage,
      color: getSubjectColor(subject.subject),
    }));
  }, [attendanceSummary?.subjectBreakdown]);

  const learningHoursData = useMemo(() => {
    if (!attendanceSummary?.learningHours?.bySubject) return [];
    return attendanceSummary.learningHours.bySubject.map((item) => ({
      name: item.subject,
      hours: item.hours,
      color: getSubjectColor(item.subject),
    }));
  }, [attendanceSummary?.learningHours?.bySubject]);

  if (isCalendarLoading || isAttendanceLoading) {
    return (
      <div className="space-y-4 p-4" data-testid="student-calendar-loading">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="student-calendar-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-black dark:border-white" data-testid="card-total-classes">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="total-classes-value">
              {attendanceSummary?.totalClasses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Classes held this term</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-classes-attended">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Classes Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="classes-attended-value">
              {attendanceSummary?.classesAttended ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Present or late arrivals</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-attendance-percentage">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="attendance-percentage-value">
              {attendanceSummary?.attendancePercentage?.toFixed(1) ?? 0}%
            </div>
            <Progress
              value={attendanceSummary?.attendancePercentage ?? 0}
              className="mt-2 h-2"
              data-testid="attendance-progress"
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-learning-hours">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Learning Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="learning-hours-value">
              {hoursView === "weekly"
                ? attendanceSummary?.learningHours?.weekly ?? 0
                : attendanceSummary?.learningHours?.monthly ?? 0}
              h
            </div>
            <Tabs value={hoursView} onValueChange={(v) => setHoursView(v as "weekly" | "monthly")} className="mt-2">
              <TabsList className="h-7">
                <TabsTrigger value="weekly" className="text-xs px-2 py-1" data-testid="hours-weekly-tab">
                  Week
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-2 py-1" data-testid="hours-monthly-tab">
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-black dark:border-white" data-testid="card-subject-attendance">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Attendance by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceChartData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center" data-testid="no-subject-data">
                No attendance data available yet.
              </p>
            ) : (
              <div className="h-64" data-testid="subject-attendance-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Attendance"]} />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {attendanceSummary?.subjectBreakdown?.map((subject) => (
                <div
                  key={subject.subject}
                  className="flex items-center justify-between text-sm"
                  data-testid={`subject-breakdown-${subject.subject}`}
                >
                  <span className="font-medium">{subject.subject}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="text-green-600">{subject.present} present</span>
                    <span className="text-red-600">{subject.absent} absent</span>
                    <span className="text-orange-600">{subject.late} late</span>
                    <span className="text-blue-600">{subject.excused} excused</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-learning-hours-subject">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Learning Hours by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningHoursData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center" data-testid="no-hours-data">
                No learning hours data available yet.
              </p>
            ) : (
              <div className="h-64" data-testid="learning-hours-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningHoursData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${v}h`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)} hours`, "Time Spent"]} />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {learningHoursData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-black dark:border-white" data-testid="card-today-sessions">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Today's Classes
              </CardTitle>
              <Badge variant="outline" data-testid="today-session-count">
                {todaysSessions.length} classes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todaysSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4" data-testid="no-today-sessions">
                No classes scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todaysSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSession(session);
                      setIsSessionModalOpen(true);
                    }}
                    data-testid={`today-session-${session.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {session.attendanceStatus && (
                        <AttendanceStatusBadge status={session.attendanceStatus} size="sm" />
                      )}
                      <div>
                        <p className="font-medium">{session.className || session.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {format(
                            typeof session.startTime === "string" ? parseISO(session.startTime) : session.startTime,
                            "h:mm a"
                          )}{" "}
                          -{" "}
                          {format(
                            typeof session.endTime === "string" ? parseISO(session.endTime) : session.endTime,
                            "h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    {session.tutorName && (
                      <span className="text-sm text-muted-foreground">{session.tutorName}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white lg:col-span-2" data-testid="card-upcoming-homework">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upcoming Homework
              </CardTitle>
              <Badge variant="outline" data-testid="upcoming-homework-count">
                {upcomingHomework.length} due
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingHomework.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4" data-testid="no-upcoming-homework">
                No upcoming homework deadlines.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingHomework.map((hw) => {
                  const dueDate = typeof hw.dueDate === "string" ? parseISO(hw.dueDate) : hw.dueDate;
                  const isTodays = isToday(dueDate);
                  return (
                    <div
                      key={hw.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`homework-item-${hw.id}`}
                    >
                      <div>
                        <p className="font-medium">{hw.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {hw.subject}
                          {hw.description && ` - ${hw.description.substring(0, 50)}...`}
                        </p>
                      </div>
                      <Badge
                        variant={isTodays ? "destructive" : "secondary"}
                        data-testid={`homework-due-${hw.id}`}
                      >
                        {isTodays ? "Due Today" : format(dueDate, "MMM d")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RoleCalendar
        role="student"
        sessions={calendarSessions}
        holidays={calendarData?.holidays || []}
        homeworkDeadlines={calendarData?.homeworkDeadlines || []}
        onEventClick={handleEventClick}
        isLoading={isCalendarLoading}
      />

      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="max-w-lg" data-testid="session-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedSession?.className || selectedSession?.subject}
            </DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <span className="text-sm">
                  {format(
                    typeof selectedSession.startTime === "string"
                      ? parseISO(selectedSession.startTime)
                      : selectedSession.startTime,
                    "EEEE, MMMM d, yyyy"
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="session-attendance-status">
                <span className="text-sm font-medium">Your Attendance</span>
                {selectedSession.attendanceStatus ? (
                  <AttendanceStatusBadge status={selectedSession.attendanceStatus} showLabel />
                ) : (
                  <Badge variant="outline">Not Recorded</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg" data-testid="session-time">
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="font-medium">
                    {format(
                      typeof selectedSession.startTime === "string"
                        ? parseISO(selectedSession.startTime)
                        : selectedSession.startTime,
                      "h:mm a"
                    )}{" "}
                    -{" "}
                    {format(
                      typeof selectedSession.endTime === "string"
                        ? parseISO(selectedSession.endTime)
                        : selectedSession.endTime,
                      "h:mm a"
                    )}
                  </p>
                </div>

                <div className="p-3 border rounded-lg" data-testid="session-subject">
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium">{selectedSession.subject}</p>
                </div>

                {selectedSession.tutorName && (
                  <div className="p-3 border rounded-lg" data-testid="session-tutor">
                    <p className="text-xs text-muted-foreground mb-1">Tutor</p>
                    <p className="font-medium">{selectedSession.tutorName}</p>
                  </div>
                )}

                {selectedSession.location && (
                  <div className="p-3 border rounded-lg" data-testid="session-location">
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{selectedSession.location}</p>
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div className="p-3 border rounded-lg" data-testid="session-notes">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <ScrollArea className="max-h-32">
                    <p className="text-sm">{selectedSession.notes}</p>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
