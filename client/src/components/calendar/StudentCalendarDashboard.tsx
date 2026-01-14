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
    return (calendarData?.sessions || []).map((session: any) => ({
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
      sessionDate: session.sessionDate, // Pass through to avoid timezone issues
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
