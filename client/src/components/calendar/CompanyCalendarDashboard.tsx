import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, isToday, parseISO } from "date-fns";
import { RoleCalendar, type CalendarSession, type CalendarHoliday, type CalendarEvent, type TermInfo } from "./RoleCalendar";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  CalendarDays,
  Building2,
  UserPlus,
  ShieldCheck,
  Eye,
  RefreshCw,
  Trash2,
  UserX,
  ClipboardCheck,
} from "lucide-react";

type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface ClassEvent {
  id: string;
  classId: string;
  className: string;
  subject: string;
  tutorId?: string;
  tutorName?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  dayOfWeek: number;
  termId: string;
  termName: string;
  type: 'class';
}

interface CompanyCalendarData {
  classes: ClassEvent[];
  holidays: CalendarHoliday[];
  activeTerm?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

interface TodaySessionData {
  session: {
    id: string;
    classId: string;
    tutorId?: string;
    startTime: string;
    endTime: string;
    status: SessionStatus;
    notes?: string;
    attendanceLocked?: boolean;
  };
  class: {
    id: string;
    name: string;
    subject: string;
    maxStudents?: number;
    location?: string;
  };
  tutor?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  attendance: AttendanceRecord[];
  enrolledCount: number;
  attendedCount: number;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy?: string;
  markedAt?: string;
  student?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ClassInfo {
  id: string;
  name: string;
  subject?: string;
  maxStudents?: number;
  tutorId?: string;
  tutorName?: string;
}

interface TutorInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface EnrolledStudent {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel?: string;
}

interface SessionDetailsData {
  session: {
    id: string;
    classId: string;
    tutorId?: string;
    startTime: string;
    endTime: string;
    status: SessionStatus;
    notes?: string;
  };
  class: {
    id: string;
    name: string;
    subject: string;
    maxStudents?: number;
    location?: string;
  };
  tutor?: {
    id: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
  };
  enrolledCount: number;
  enrolledStudents: EnrolledStudent[];
}

export function CompanyCalendarDashboard() {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<TodaySessionData | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isBatchDetailsModalOpen, setIsBatchDetailsModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>("present");
  const [overrideNotes, setOverrideNotes] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [tutorFilter, setTutorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isClassDetailsModalOpen, setIsClassDetailsModalOpen] = useState(false);
  const [selectedClassEvent, setSelectedClassEvent] = useState<ClassEvent | null>(null);
  const [tempStudentToAdd, setTempStudentToAdd] = useState<string>("");

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<CompanyCalendarData>({
    queryKey: ['/api/calendar/company'],
  });

  const { data: todaySessions, isLoading: isTodayLoading, refetch: refetchToday } = useQuery<TodaySessionData[]>({
    queryKey: ['/api/sessions/today'],
  });

  const { data: sessionAttendance, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/sessions', selectedSession?.session.id, 'attendance'],
    enabled: !!selectedSession?.session.id && isAttendanceModalOpen,
  });

  const { data: sessionDetails, isLoading: isSessionDetailsLoading } = useQuery<SessionDetailsData>({
    queryKey: ['/api/sessions', selectedSessionId],
    enabled: !!selectedSessionId && isBatchDetailsModalOpen,
  });

  const { data: classStudents, isLoading: isClassStudentsLoading } = useQuery<{ studentId: string; student: { id: string; userId: string; user?: { firstName?: string; lastName?: string; email?: string } } }[]>({
    queryKey: ['/api/classes', selectedClassEvent?.classId, 'students'],
    enabled: !!selectedClassEvent?.classId && isClassDetailsModalOpen,
  });

  // Get company ID from user context for fetching company data
  const { data: authUser } = useQuery<{ companyAdminProfile?: { companyId: string } }>({
    queryKey: ['/api/auth/user'],
  });
  const companyId = authUser?.companyAdminProfile?.companyId;

  const { data: allCompanyStudents } = useQuery<{ id: string; userId: string; user?: { firstName?: string; lastName?: string; email?: string } }[]>({
    queryKey: ['/api/companies', companyId, 'students'],
    enabled: !!companyId && isClassDetailsModalOpen,
  });

  const { data: companyTutors } = useQuery<{ id: string; userId: string; user?: { firstName?: string; lastName?: string; email?: string } }[]>({
    queryKey: ['/api/companies', companyId, 'tutors'],
    enabled: !!companyId && isClassDetailsModalOpen,
  });

  const updateTutorMutation = useMutation({
    mutationFn: async ({ classId, tutorId }: { classId: string; tutorId: string | null }) => {
      return apiRequest(`/api/classes/${classId}/tutor`, "PATCH", { tutorId });
    },
    onSuccess: () => {
      toast({ title: "Tutor updated", description: "The class tutor has been changed successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/company'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/today'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const enrollStudentMutation = useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      const result = await apiRequest(`/api/classes/${classId}/students`, "POST", { studentId });
      return { result, classId };
    },
    onSuccess: (_, variables) => {
      toast({ title: "Student enrolled", description: "Student has been added to the class." });
      queryClient.invalidateQueries({ queryKey: ['/api/classes', variables.classId, 'students'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      await apiRequest(`/api/classes/${classId}/students/${studentId}`, "DELETE");
      return { classId };
    },
    onSuccess: (_, variables) => {
      toast({ title: "Student removed", description: "Student has been removed from the class." });
      queryClient.invalidateQueries({ queryKey: ['/api/classes', variables.classId, 'students'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const enrollAllStudentsMutation = useMutation({
    mutationFn: async ({ classId, studentIds }: { classId: string; studentIds: string[] }) => {
      let successCount = 0;
      const failedStudents: string[] = [];
      for (const studentId of studentIds) {
        try {
          await apiRequest(`/api/classes/${classId}/students`, "POST", { studentId });
          successCount++;
        } catch {
          failedStudents.push(studentId);
        }
      }
      return { successCount, failedCount: failedStudents.length, classId };
    },
    onSuccess: ({ successCount, failedCount, classId }) => {
      if (failedCount > 0) {
        toast({ 
          title: "Partial enrollment", 
          description: `${successCount} students enrolled, ${failedCount} failed (may already be enrolled).`,
          variant: failedCount > successCount ? "destructive" : "default"
        });
      } else {
        toast({ title: "Students enrolled", description: `${successCount} students have been added to the class.` });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/classes', classId, 'students'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const overrideAttendanceMutation = useMutation({
    mutationFn: async ({ attendanceId, status, notes }: { attendanceId: string; status: string; notes?: string }) => {
      return apiRequest(`/api/attendance/${attendanceId}/override`, "POST", { status, notes });
    },
    onSuccess: () => {
      toast({ title: "Attendance overridden", description: "Attendance has been updated by admin." });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', selectedSession?.session.id, 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/company'] });
      setIsOverrideModalOpen(false);
      refetchAttendance();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uniqueClasses = useMemo(() => {
    if (!calendarData?.classes) return [];
    const classMap = new Map<string, ClassInfo>();
    calendarData.classes.forEach((c) => {
      if (!classMap.has(c.classId)) {
        classMap.set(c.classId, {
          id: c.classId,
          name: c.className,
          subject: c.subject,
          tutorId: c.tutorId,
        });
      }
    });
    return Array.from(classMap.values());
  }, [calendarData?.classes]);

  const uniqueTutors = useMemo(() => {
    if (!calendarData?.classes) return [];
    const tutorMap = new Map<string, TutorInfo & { tutorName?: string }>();
    calendarData.classes.forEach((c) => {
      if (c.tutorId && !tutorMap.has(c.tutorId)) {
        const nameParts = c.tutorName?.split(' ') || [];
        tutorMap.set(c.tutorId, {
          id: c.tutorId,
          firstName: nameParts[0] || c.tutorName || 'Unknown',
          lastName: nameParts.slice(1).join(' ') || '',
        });
      }
    });
    return Array.from(tutorMap.values());
  }, [calendarData?.classes]);

  const filteredClasses = useMemo(() => {
    if (!calendarData?.classes) return [];
    return calendarData.classes.filter((c) => {
      const matchesClass = classFilter === "all" || c.classId === classFilter;
      const matchesTutor = tutorFilter === "all" || c.tutorId === tutorFilter;
      return matchesClass && matchesTutor;
    });
  }, [calendarData?.classes, classFilter, tutorFilter]);

  const filteredTodaySessions = useMemo(() => {
    if (!todaySessions) return [];
    return todaySessions.filter((s) => {
      const matchesClass = classFilter === "all" || s.class.id === classFilter;
      const matchesTutor = tutorFilter === "all" || s.session.tutorId === tutorFilter;
      const matchesStatus = statusFilter === "all" || s.session.status === statusFilter;
      return matchesClass && matchesTutor && matchesStatus;
    });
  }, [todaySessions, classFilter, tutorFilter, statusFilter]);

  const calendarSessions: CalendarSession[] = useMemo(() => {
    return filteredClasses.map((c) => ({
      id: c.id,
      subject: c.subject,
      className: c.className,
      startTime: c.startTime,
      endTime: c.endTime,
      status: 'scheduled' as SessionStatus,
      location: c.location,
      date: c.date,
      tutorName: c.tutorName,
      classId: c.classId,
    }));
  }, [filteredClasses]);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'session') {
      const sessionData = event.data as CalendarSession & { classId?: string; date?: string; tutorName?: string };
      // Find the corresponding class event from calendar data
      let matchingEvent = calendarData?.classes.find(c => c.id === sessionData.id);
      
      // Fallback: try to find by classId and date
      if (!matchingEvent && sessionData.classId && sessionData.date) {
        matchingEvent = calendarData?.classes.find(
          c => c.classId === sessionData.classId && c.date === sessionData.date
        );
      }
      
      if (matchingEvent) {
        setSelectedClassEvent(matchingEvent);
        setIsClassDetailsModalOpen(true);
      }
    }
  };

  const handleViewAttendance = (session: TodaySessionData) => {
    setSelectedSession(session);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenOverride = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setOverrideStatus(attendance.status);
    setOverrideNotes(attendance.notes || "");
    setIsOverrideModalOpen(true);
  };

  const handleOverrideSubmit = () => {
    if (!selectedAttendance) return;
    overrideAttendanceMutation.mutate({
      attendanceId: selectedAttendance.id,
      status: overrideStatus,
      notes: overrideNotes,
    });
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getCapacityBadgeVariant = (enrolled: number, max: number | undefined): "default" | "secondary" | "destructive" => {
    if (!max) return "secondary";
    if (enrolled >= max) return "destructive";
    if (enrolled >= max * 0.8) return "default";
    return "secondary";
  };

  const isClassFull = (enrolled: number, max: number | undefined): boolean => {
    return max !== undefined && enrolled >= max;
  };

  const getAttendanceSummary = (attendance: AttendanceRecord[] | undefined, enrolledCount: number) => {
    if (!attendance) return { present: 0, absent: 0, late: 0, excused: 0, unmarked: enrolledCount };
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    const unmarked = enrolledCount - (present + absent + late + excused);
    return { present, absent, late, excused, unmarked };
  };

  const filters = (
    <div className="flex flex-wrap gap-2">
      <Select value={classFilter} onValueChange={setClassFilter}>
        <SelectTrigger className="w-[160px]" data-testid="filter-class">
          <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {uniqueClasses.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tutorFilter} onValueChange={setTutorFilter}>
        <SelectTrigger className="w-[160px]" data-testid="filter-tutor">
          <SelectValue placeholder="All Tutors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tutors</SelectItem>
          {uniqueTutors.map((tutor) => (
            <SelectItem key={tutor.id} value={tutor.id}>
              {tutor.firstName} {tutor.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[160px]" data-testid="filter-status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (isCalendarLoading) {
    return (
      <div className="space-y-4 p-4" data-testid="company-calendar-loading">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="company-calendar-dashboard">
      {/* Active Term Banner */}
      {calendarData?.activeTerm && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Current Term: {calendarData.activeTerm.name}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                    ({format(new Date(calendarData.activeTerm.startDate), 'MMM d, yyyy')} - {format(new Date(calendarData.activeTerm.endDate), 'MMM d, yyyy')})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <RoleCalendar
        role="company"
        sessions={calendarSessions}
        holidays={calendarData?.holidays || []}
        onEventClick={handleEventClick}
        filters={filters}
        isLoading={isCalendarLoading}
        initialView="monthly"
        termInfo={calendarData?.activeTerm ? {
          id: calendarData.activeTerm.id,
          name: calendarData.activeTerm.name,
          startDate: new Date(calendarData.activeTerm.startDate),
          endDate: new Date(calendarData.activeTerm.endDate),
        } : undefined}
      />

      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="attendance-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Attendance - {selectedSession?.class.name}
            </DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <span className="text-sm">
                  {format(parseISO(selectedSession.session.startTime), 'EEEE, MMMM d, yyyy')} at {format(parseISO(selectedSession.session.startTime), 'h:mm a')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {selectedSession && (
                <>
                  <Badge variant="outline" data-testid="attendance-enrolled-count">
                    {selectedSession.enrolledCount} enrolled
                  </Badge>
                  {selectedSession.tutor && (
                    <Badge variant="secondary" data-testid="attendance-tutor">
                      Tutor: {selectedSession.tutor.firstName} {selectedSession.tutor.lastName}
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Admin can override attendance
            </div>
          </div>

          <Separator className="my-2" />

          <ScrollArea className="h-[400px] pr-4">
            {isAttendanceLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !sessionAttendance || sessionAttendance.length === 0 ? (
              <div className="py-8 text-center" data-testid="no-attendance-data">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No attendance records found.</p>
                <p className="text-xs text-muted-foreground mt-1">Tutor has not submitted attendance yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionAttendance.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`attendance-row-${attendance.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <AttendanceStatusBadge status={attendance.status} />
                      <div>
                        <p className="font-medium" data-testid={`student-name-${attendance.id}`}>
                          {attendance.student?.firstName} {attendance.student?.lastName}
                        </p>
                        {attendance.notes && (
                          <p className="text-xs text-muted-foreground">{attendance.notes}</p>
                        )}
                        {attendance.markedAt && (
                          <p className="text-xs text-muted-foreground">
                            Marked: {format(parseISO(attendance.markedAt), 'h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenOverride(attendance)}
                      data-testid={`btn-override-${attendance.id}`}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Override
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAttendanceModalOpen(false)}
              data-testid="btn-close-attendance"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOverrideModalOpen} onOpenChange={setIsOverrideModalOpen}>
        <DialogContent data-testid="override-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Override Attendance
            </DialogTitle>
            <DialogDescription>
              {selectedAttendance?.student && (
                <span>
                  Overriding attendance for {selectedAttendance.student.firstName} {selectedAttendance.student.lastName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <AttendanceStatusBadge status={selectedAttendance?.status || 'unknown'} showLabel />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={overrideStatus} onValueChange={(v) => setOverrideStatus(v as AttendanceStatus)}>
                <SelectTrigger data-testid="select-override-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Override Notes (Optional)</label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                placeholder="Reason for override..."
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                data-testid="input-override-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOverrideModalOpen(false)}
              data-testid="btn-cancel-override"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverrideSubmit}
              disabled={overrideAttendanceMutation.isPending}
              data-testid="btn-confirm-override"
            >
              {overrideAttendanceMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Override
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Details Modal */}
      <Dialog open={isBatchDetailsModalOpen} onOpenChange={setIsBatchDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="batch-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Batch Details
            </DialogTitle>
            {sessionDetails && (
              <DialogDescription>
                {sessionDetails.class.name} - {sessionDetails.class.subject}
              </DialogDescription>
            )}
          </DialogHeader>

          {isSessionDetailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : sessionDetails ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="flex items-center gap-2" data-testid="batch-time">
                    <Clock className="w-4 h-4" />
                    {format(parseISO(sessionDetails.session.startTime), 'h:mm a')} - {format(parseISO(sessionDetails.session.endTime), 'h:mm a')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p data-testid="batch-date">
                    {format(parseISO(sessionDetails.session.startTime), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p data-testid="batch-subject">{sessionDetails.class.subject}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tutor</p>
                  <p data-testid="batch-tutor">
                    {sessionDetails.tutor 
                      ? `${sessionDetails.tutor.firstName || ''} ${sessionDetails.tutor.lastName || ''}`.trim()
                      : 'Not assigned'}
                  </p>
                </div>
              </div>

              {sessionDetails.class.location && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p data-testid="batch-location">{sessionDetails.class.location}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Enrolled Students
                  </p>
                  <Badge variant="outline" data-testid="batch-enrolled-count">
                    {sessionDetails.enrolledCount} students
                  </Badge>
                </div>
                
                <ScrollArea className="h-[200px] pr-4">
                  {sessionDetails.enrolledStudents.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No students enrolled in this batch.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessionDetails.enrolledStudents.map((student, index) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                          data-testid={`enrolled-student-${student.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {index + 1}.
                            </span>
                            <span className="font-medium">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                          {student.gradeLevel && (
                            <Badge variant="secondary" className="text-xs">
                              Grade {student.gradeLevel}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Failed to load session details.</p>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBatchDetailsModalOpen(false)}
              data-testid="btn-close-batch-details"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                const todaySession = todaySessions?.find(s => s.session.id === selectedSessionId);
                if (todaySession) {
                  setSelectedSession(todaySession);
                  setIsBatchDetailsModalOpen(false);
                  setIsAttendanceModalOpen(true);
                }
              }}
              disabled={!todaySessions?.find(s => s.session.id === selectedSessionId)}
              data-testid="btn-view-attendance"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              View Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Modal */}
      <Dialog open={isClassDetailsModalOpen} onOpenChange={setIsClassDetailsModalOpen}>
        <DialogContent className="max-w-md" data-testid="class-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {selectedClassEvent?.className}
            </DialogTitle>
            <DialogDescription>
              {selectedClassEvent?.date && format(new Date(selectedClassEvent.date), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p data-testid="class-subject">{selectedClassEvent?.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tutor</p>
                <Select 
                  value={selectedClassEvent?.tutorId || "__unassigned__"} 
                  onValueChange={(value) => {
                    if (selectedClassEvent?.classId) {
                      updateTutorMutation.mutate({ 
                        classId: selectedClassEvent.classId, 
                        tutorId: value === "__unassigned__" ? null : value 
                      });
                    }
                  }}
                  disabled={updateTutorMutation.isPending}
                >
                  <SelectTrigger className="w-full" data-testid="select-class-tutor">
                    <SelectValue placeholder="Select tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">Unassigned</SelectItem>
                    {companyTutors?.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.user?.firstName || ''} {tutor.user?.lastName || tutor.user?.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p data-testid="class-time" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedClassEvent?.startTime && format(new Date(selectedClassEvent.startTime), 'h:mm a')} - {selectedClassEvent?.endTime && format(new Date(selectedClassEvent.endTime), 'h:mm a')}
                </p>
              </div>
              {selectedClassEvent?.location && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p data-testid="class-location">{selectedClassEvent.location}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enrolled Students
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" data-testid="class-student-count">
                    {classStudents?.length || 0} students
                  </Badge>
                  {(() => {
                    const unenrolledStudents = allCompanyStudents?.filter(s => 
                      !classStudents?.some(cs => cs.studentId === s.id)
                    ) || [];
                    return unenrolledStudents.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (selectedClassEvent?.classId) {
                            enrollAllStudentsMutation.mutate({
                              classId: selectedClassEvent.classId,
                              studentIds: unenrolledStudents.map(s => s.id)
                            });
                          }
                        }}
                        disabled={enrollAllStudentsMutation.isPending}
                        data-testid="btn-enroll-all-students"
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Enroll All ({unenrolledStudents.length})
                      </Button>
                    );
                  })()}
                </div>
              </div>
              
              {isClassStudentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ScrollArea className="h-[150px] pr-4">
                  {!classStudents || classStudents.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No students enrolled in this class.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classStudents.map((enrollment, index) => (
                        <div
                          key={enrollment.studentId}
                          className="flex items-center justify-between p-2 border rounded-lg"
                          data-testid={`class-student-${enrollment.studentId}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {index + 1}.
                            </span>
                            <span className="font-medium">
                              {enrollment.student?.user?.firstName || ''} {enrollment.student?.user?.lastName || enrollment.student?.user?.email || 'Unknown'}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (selectedClassEvent?.classId) {
                                removeStudentMutation.mutate({
                                  classId: selectedClassEvent.classId,
                                  studentId: enrollment.studentId
                                });
                              }
                            }}
                            disabled={removeStudentMutation.isPending}
                            data-testid={`btn-remove-student-${enrollment.studentId}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Student to Class
              </p>
              <div className="flex gap-2">
                <Select value={tempStudentToAdd} onValueChange={setTempStudentToAdd}>
                  <SelectTrigger className="flex-1" data-testid="select-add-student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCompanyStudents?.filter(s => 
                      !classStudents?.some(cs => cs.studentId === s.id)
                    ).map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user?.firstName || ''} {student.user?.lastName || student.user?.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!tempStudentToAdd || enrollStudentMutation.isPending}
                  onClick={() => {
                    if (selectedClassEvent?.classId && tempStudentToAdd) {
                      enrollStudentMutation.mutate({
                        classId: selectedClassEvent.classId,
                        studentId: tempStudentToAdd
                      });
                      setTempStudentToAdd("");
                    }
                  }}
                  data-testid="btn-add-student"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Roll Call
              </p>
              {classStudents && classStudents.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Take attendance for today's class session. This will create or update attendance records.
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Roll Call",
                        description: `Starting roll call for ${classStudents.length} students in ${selectedClassEvent?.className}`,
                      });
                    }}
                    data-testid="btn-start-roll-call"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Start Roll Call ({classStudents.length} students)
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No students enrolled. Add students to enable roll call.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsClassDetailsModalOpen(false);
                setSelectedClassEvent(null);
                setTempStudentToAdd("");
              }}
              data-testid="btn-close-class-details"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
