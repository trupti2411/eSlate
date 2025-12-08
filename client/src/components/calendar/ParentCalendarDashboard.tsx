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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Users,
  User,
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

interface ChildInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gradeLevel?: string;
}

interface ParentSession extends CalendarSession {
  attendanceStatus?: AttendanceStatus;
  durationMinutes?: number;
  tutorRemarks?: string;
  childId?: string;
  childName?: string;
}

interface ParentCalendarData {
  children: ChildInfo[];
  sessions: ParentSession[];
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
  classesMissed: number;
  attendancePercentage: number;
  hoursAttended: number;
  hoursMissed: number;
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
    tutorRemarks?: string;
  }[];
}

interface ChildSummary extends AttendanceSummary {
  childId: string;
  childName: string;
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

export function ParentCalendarDashboard() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ParentSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [hoursView, setHoursView] = useState<"weekly" | "monthly">("weekly");

  const queryEndpoint = selectedChildId === "all" 
    ? "/api/calendar/parent"
    : `/api/calendar/parent?childId=${selectedChildId}`;

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<ParentCalendarData>({
    queryKey: ["/api/calendar/parent", selectedChildId],
    queryFn: async () => {
      const response = await fetch(queryEndpoint, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch calendar data");
      return response.json();
    },
  });

  const selectedChild = useMemo(() => {
    if (selectedChildId === "all" || !calendarData?.children) return null;
    return calendarData.children.find(c => c.id === selectedChildId);
  }, [selectedChildId, calendarData?.children]);

  const { data: attendanceSummary, isLoading: isAttendanceLoading } = useQuery<AttendanceSummary>({
    queryKey: ["/api/attendance/summary/student", selectedChildId],
    queryFn: async () => {
      if (selectedChildId === "all") {
        return null;
      }
      const response = await fetch(`/api/attendance/summary/student/${selectedChildId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch attendance summary");
      return response.json();
    },
    enabled: selectedChildId !== "all",
  });

  const { data: allChildrenSummaries, isLoading: isAllSummariesLoading } = useQuery<ChildSummary[]>({
    queryKey: ["/api/attendance/summary/parent/all-children"],
    queryFn: async () => {
      if (!calendarData?.children || calendarData.children.length === 0) return [];
      const summaries = await Promise.all(
        calendarData.children.map(async (child) => {
          try {
            const response = await fetch(`/api/attendance/summary/student/${child.id}`, { credentials: "include" });
            if (!response.ok) return null;
            const data = await response.json();
            return {
              ...data,
              childId: child.id,
              childName: `${child.firstName} ${child.lastName}`,
            };
          } catch {
            return null;
          }
        })
      );
      return summaries.filter(Boolean) as ChildSummary[];
    },
    enabled: selectedChildId === "all" && !!calendarData?.children && calendarData.children.length > 0,
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

  const handleChildChange = (value: string) => {
    setSelectedChildId(value);
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

  const aggregatedSummary = useMemo(() => {
    if (!allChildrenSummaries || allChildrenSummaries.length === 0) return null;
    
    const totals = allChildrenSummaries.reduce(
      (acc, summary) => ({
        totalClasses: acc.totalClasses + (summary.totalClasses || 0),
        classesAttended: acc.classesAttended + (summary.classesAttended || 0),
        classesMissed: acc.classesMissed + (summary.classesMissed || 0),
        hoursAttended: acc.hoursAttended + (summary.hoursAttended || 0),
        hoursMissed: acc.hoursMissed + (summary.hoursMissed || 0),
      }),
      { totalClasses: 0, classesAttended: 0, classesMissed: 0, hoursAttended: 0, hoursMissed: 0 }
    );

    const attendancePercentage = totals.totalClasses > 0 
      ? (totals.classesAttended / totals.totalClasses) * 100 
      : 0;

    return { ...totals, attendancePercentage };
  }, [allChildrenSummaries]);

  const isLoading = isCalendarLoading || (selectedChildId !== "all" && isAttendanceLoading) || (selectedChildId === "all" && isAllSummariesLoading);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4" data-testid="parent-calendar-loading">
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

  const hasMultipleChildren = (calendarData?.children?.length || 0) > 1;
  const currentSummary = selectedChildId === "all" ? aggregatedSummary : attendanceSummary;

  return (
    <div className="space-y-6" data-testid="parent-calendar-dashboard">
      {hasMultipleChildren && (
        <Card className="border-2 border-black dark:border-white" data-testid="child-selector-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedChildId} onValueChange={handleChildChange}>
                <SelectTrigger className="w-[250px]" data-testid="child-selector">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="child-option-all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Children
                    </div>
                  </SelectItem>
                  {calendarData?.children?.map((child) => (
                    <SelectItem key={child.id} value={child.id} data-testid={`child-option-${child.id}`}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {child.firstName} {child.lastName}
                        {child.gradeLevel && <Badge variant="outline" className="ml-2">{child.gradeLevel}</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChild && (
                <span className="text-sm text-muted-foreground" data-testid="selected-child-info">
                  Viewing calendar for {selectedChild.firstName} {selectedChild.lastName}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              {currentSummary?.totalClasses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedChildId === "all" ? "Classes held for all children" : "Classes held this term"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-hours-attended">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Hours Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="hours-attended-value">
              {currentSummary?.hoursAttended?.toFixed(1) ?? (currentSummary?.classesAttended ?? 0)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSummary?.classesAttended ?? 0} classes attended
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black dark:border-white" data-testid="card-hours-missed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Hours Missed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600" data-testid="hours-missed-value">
              {currentSummary?.hoursMissed?.toFixed(1) ?? (currentSummary?.classesMissed ?? 0)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSummary?.classesMissed ?? 0} classes missed
            </p>
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
              {currentSummary?.attendancePercentage?.toFixed(1) ?? 0}%
            </div>
            <Progress
              value={currentSummary?.attendancePercentage ?? 0}
              className="mt-2 h-2"
              data-testid="attendance-progress"
            />
          </CardContent>
        </Card>
      </div>

      {selectedChildId === "all" && allChildrenSummaries && allChildrenSummaries.length > 0 && (
        <Card className="border-2 border-black dark:border-white" data-testid="per-child-summary-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Per-Child Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allChildrenSummaries.map((childSummary) => (
                <Card 
                  key={childSummary.childId} 
                  className="border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedChildId(childSummary.childId)}
                  data-testid={`child-summary-card-${childSummary.childId}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {childSummary.childName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium" data-testid={`child-attendance-${childSummary.childId}`}>
                        {childSummary.attendancePercentage?.toFixed(1) ?? 0}%
                      </span>
                    </div>
                    <Progress value={childSummary.attendancePercentage ?? 0} className="h-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>{childSummary.hoursAttended?.toFixed(1) ?? childSummary.classesAttended ?? 0}h attended</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span>{childSummary.hoursMissed?.toFixed(1) ?? childSummary.classesMissed ?? 0}h missed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedChildId !== "all" && (
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
      )}

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
                        <p className="font-medium">
                          {session.childName && <span className="text-muted-foreground mr-1">({session.childName})</span>}
                          {session.className || session.subject}
                        </p>
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

      {selectedChildId !== "all" && attendanceSummary?.recentAttendance && attendanceSummary.recentAttendance.length > 0 && (
        <Card className="border-2 border-black dark:border-white" data-testid="card-recent-attendance">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceSummary.recentAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`recent-attendance-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <AttendanceStatusBadge status={record.status} showLabel />
                    <div>
                      <p className="font-medium">{record.className || record.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(record.date), "EEEE, MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {record.tutorRemarks && (
                    <div className="text-sm text-muted-foreground max-w-[200px] truncate" data-testid={`tutor-remarks-${index}`}>
                      <span className="font-medium">Remarks:</span> {record.tutorRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <RoleCalendar
        role="parent"
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
                  {selectedSession.childName && (
                    <span className="mr-2 font-medium">({selectedSession.childName})</span>
                  )}
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
                <span className="text-sm font-medium">Attendance Status</span>
                {selectedSession.attendanceStatus ? (
                  <AttendanceStatusBadge status={selectedSession.attendanceStatus} showLabel />
                ) : (
                  <Badge variant="outline">Not Recorded</Badge>
                )}
              </div>

              {selectedSession.tutorRemarks && (
                <div className="p-3 border rounded-lg" data-testid="session-tutor-remarks">
                  <p className="text-xs text-muted-foreground mb-1">Tutor Remarks</p>
                  <p className="text-sm">{selectedSession.tutorRemarks}</p>
                </div>
              )}

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
