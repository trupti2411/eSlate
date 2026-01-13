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

  const { data: studentProfile } = useQuery<{ id: string }>({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student',
  });

  const studentDbId = studentProfile?.id || '';

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<StudentCalendarData>({
    queryKey: ["/api/calendar/student"],
  });

  const { data: attendanceSummary, isLoading: isAttendanceLoading } = useQuery<AttendanceSummary>({
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

  if (isCalendarLoading || isAttendanceLoading) {
    return (
      <div className="space-y-4" data-testid="student-calendar-loading">
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="student-calendar-dashboard">
      <RoleCalendar
        role="student"
        sessions={calendarSessions}
        holidays={calendarData?.holidays || []}
        homeworkDeadlines={calendarData?.homeworkDeadlines || []}
        onEventClick={handleEventClick}
        isLoading={isCalendarLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm" data-testid="card-attendance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" data-testid="attendance-percentage-value">
                {attendanceSummary?.attendancePercentage?.toFixed(0) ?? 0}%
              </span>
              <span className="text-xs text-gray-500">
                ({attendanceSummary?.classesAttended ?? 0}/{attendanceSummary?.totalClasses ?? 0} classes)
              </span>
            </div>
            <Progress
              value={attendanceSummary?.attendancePercentage ?? 0}
              className="mt-2 h-2"
              data-testid="attendance-progress"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm" data-testid="card-today-sessions">
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
              <p className="text-gray-500 text-sm" data-testid="no-today-sessions">
                No classes scheduled today
              </p>
            ) : (
              <ScrollArea className={todaysSessions.length > 3 ? "h-[100px]" : ""}>
                <div className="space-y-1">
                  {todaysSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => {
                        setSelectedSession(session);
                        setIsSessionModalOpen(true);
                      }}
                      data-testid={`today-session-${session.id}`}
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

        <Card className="border border-gray-200 shadow-sm" data-testid="card-upcoming-homework">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upcoming Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingHomework.length === 0 ? (
              <p className="text-gray-500 text-sm" data-testid="no-upcoming-homework">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-1">
                {upcomingHomework.map((hw) => {
                  const dueDate = typeof hw.dueDate === "string" ? parseISO(hw.dueDate) : hw.dueDate;
                  const isTodays = isToday(dueDate);
                  return (
                    <div
                      key={hw.id}
                      className="flex items-center justify-between text-sm"
                      data-testid={`homework-item-${hw.id}`}
                    >
                      <span className="font-medium truncate max-w-[120px]">{hw.title}</span>
                      <Badge
                        variant={isTodays ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {isTodays ? "Today" : format(dueDate, "MMM d")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200 shadow-sm" data-testid="card-learning-hours">
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

        <Card className="border border-gray-200 shadow-sm" data-testid="card-subject-breakdown">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              By Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!attendanceSummary?.learningHours?.bySubject || attendanceSummary.learningHours.bySubject.length === 0) ? (
              <p className="text-gray-500 text-sm" data-testid="no-subject-data">
                No subject data yet
              </p>
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

                {selectedSession.tutorName && (
                  <div className="p-3 border rounded-lg" data-testid="session-tutor">
                    <p className="text-xs text-muted-foreground mb-1">Tutor</p>
                    <p className="font-medium">{selectedSession.tutorName}</p>
                  </div>
                )}
              </div>

              {selectedSession.location && (
                <div className="p-3 border rounded-lg" data-testid="session-location">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{selectedSession.location}</p>
                </div>
              )}

              {selectedSession.notes && (
                <div className="p-3 border rounded-lg" data-testid="session-notes">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
