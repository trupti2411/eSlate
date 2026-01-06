import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, isToday, isSameDay, parseISO } from "date-fns";
import { RoleCalendar, type CalendarSession, type CalendarHoliday, type CalendarEvent } from "./RoleCalendar";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
  AlertCircle,
  CalendarDays,
  BookOpen,
} from "lucide-react";

type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface TutorSession {
  id: string;
  classId: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  tutorId: string;
  tutorName?: string;
  location?: string;
  notes?: string;
  enrolledCount?: number;
  attendedCount?: number;
}

interface TutorCalendarData {
  sessions: TutorSession[];
  holidays: CalendarHoliday[];
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  studentName?: string;
  firstName?: string;
  lastName?: string;
}

interface StudentRosterItem {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  attendanceSummary?: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
  parentContact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

interface ClassRoster {
  class: {
    id: string;
    name: string;
    subject?: string;
    maxStudents?: number;
  };
  students: StudentRosterItem[];
  capacity: number;
  enrolled: number;
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

export function TutorCalendarDashboard() {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<TutorSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isBatchDetailsModalOpen, setIsBatchDetailsModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isParentContactModalOpen, setIsParentContactModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);
  const [lessonNotes, setLessonNotes] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendanceChanges, setAttendanceChanges] = useState<Record<string, { status: AttendanceStatus; notes?: string }>>({});

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<TutorCalendarData>({
    queryKey: ['/api/calendar/tutor'],
  });

  const { data: rosterData, isLoading: isRosterLoading } = useQuery<ClassRoster[]>({
    queryKey: ['/api/tutor/students-roster'],
  });

  const { data: sessionAttendance, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/sessions', selectedSession?.id, 'attendance'],
    enabled: !!selectedSession?.id && isAttendanceModalOpen,
  });

  const { data: sessionDetails, isLoading: isSessionDetailsLoading } = useQuery<SessionDetailsData>({
    queryKey: ['/api/sessions', selectedSessionId],
    enabled: !!selectedSessionId && isBatchDetailsModalOpen,
  });

  const bulkMarkAttendanceMutation = useMutation({
    mutationFn: async ({ sessionId, attendanceList }: { sessionId: string; attendanceList: { studentId: string; status: string; notes?: string }[] }) => {
      return apiRequest(`/api/sessions/${sessionId}/attendance/bulk`, "POST", { attendanceList });
    },
    onSuccess: () => {
      toast({ title: "Attendance saved", description: "Attendance has been recorded successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', selectedSession?.id, 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/tutor'] });
      setAttendanceChanges({});
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markAllPresentMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest(`/api/sessions/${sessionId}/attendance/mark-all-present`, "POST");
    },
    onSuccess: () => {
      toast({ title: "All marked present", description: "All students have been marked as present." });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', selectedSession?.id, 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/tutor'] });
      refetchAttendance();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSessionNotesMutation = useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: string; notes: string }) => {
      return apiRequest(`/api/sessions/${sessionId}`, "PATCH", { notes });
    },
    onSuccess: () => {
      toast({ title: "Notes saved", description: "Lesson notes have been saved." });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/tutor'] });
      setIsNotesModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uniqueClasses = useMemo(() => {
    if (!calendarData?.sessions) return [];
    const classMap = new Map<string, { id: string; name: string }>();
    calendarData.sessions.forEach((session) => {
      if (session.classId && session.className && !classMap.has(session.classId)) {
        classMap.set(session.classId, { id: session.classId, name: session.className });
      }
    });
    return Array.from(classMap.values());
  }, [calendarData?.sessions]);

  const filteredSessions = useMemo(() => {
    if (!calendarData?.sessions) return [];
    return calendarData.sessions.filter((session) => {
      const matchesClass = classFilter === "all" || session.classId === classFilter;
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      return matchesClass && matchesStatus;
    });
  }, [calendarData?.sessions, classFilter, statusFilter]);

  const todaysSessions = useMemo(() => {
    return filteredSessions.filter((session) => {
      const sessionDate = typeof session.startTime === 'string' ? parseISO(session.startTime) : session.startTime;
      return isToday(sessionDate);
    });
  }, [filteredSessions]);

  const calendarSessions: CalendarSession[] = useMemo(() => {
    return filteredSessions.map((session) => ({
      id: session.id,
      subject: session.subject,
      className: session.className,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      tutorName: session.tutorName,
      location: session.location,
      notes: session.notes,
    }));
  }, [filteredSessions]);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'session') {
      const sessionData = event.data as CalendarSession;
      setSelectedSessionId(sessionData.id);
      setIsBatchDetailsModalOpen(true);
    }
  };

  const handleOpenRoster = (classId: string) => {
    const classRoster = rosterData?.find((r) => r.class.id === classId);
    if (classRoster) {
      setIsRosterModalOpen(true);
    }
  };

  const handleOpenNotes = (session: TutorSession) => {
    setSelectedSession(session);
    setLessonNotes(session.notes || "");
    setIsNotesModalOpen(true);
  };

  const handleShowParentContact = (student: StudentRosterItem) => {
    setSelectedStudent(student);
    setIsParentContactModalOpen(true);
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, notes?: string) => {
    setAttendanceChanges((prev) => ({
      ...prev,
      [studentId]: { status, notes },
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSession) return;
    const attendanceList = Object.entries(attendanceChanges).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      notes: data.notes,
    }));
    if (attendanceList.length > 0) {
      bulkMarkAttendanceMutation.mutate({ sessionId: selectedSession.id, attendanceList });
    }
  };

  const handleMarkAllPresent = () => {
    if (!selectedSession) return;
    markAllPresentMutation.mutate(selectedSession.id);
  };

  const handleSaveNotes = () => {
    if (!selectedSession) return;
    updateSessionNotesMutation.mutate({ sessionId: selectedSession.id, notes: lessonNotes });
  };

  const currentClassRoster = useMemo(() => {
    if (!selectedSession || !rosterData) return null;
    return rosterData.find((r) => r.class.id === selectedSession.classId);
  }, [selectedSession, rosterData]);

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
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

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[160px]" data-testid="filter-status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="scheduled">Upcoming</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (isCalendarLoading) {
    return (
      <div className="space-y-4 p-4" data-testid="tutor-calendar-loading">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tutor-calendar-dashboard">
      <Card className="border-2 border-black dark:border-white" data-testid="daily-agenda-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="w-5 h-5" />
              Today's Agenda
            </CardTitle>
            <Badge variant="outline" data-testid="today-session-count">
              {todaysSessions.length} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todaysSessions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4" data-testid="no-sessions-today">
              No sessions scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {todaysSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`agenda-session-${session.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                    <div>
                      <p className="font-medium">{session.className}</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {format(parseISO(session.startTime), 'h:mm a')} - {format(parseISO(session.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.enrolledCount !== undefined && (
                      <Badge variant="secondary" data-testid={`session-capacity-${session.id}`}>
                        <Users className="w-3 h-3 mr-1" />
                        {session.attendedCount ?? 0}/{session.enrolledCount}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSession(session);
                        setAttendanceChanges({});
                        setIsAttendanceModalOpen(true);
                      }}
                      data-testid={`btn-roll-call-${session.id}`}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Roll Call
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenNotes(session)}
                      data-testid={`btn-notes-${session.id}`}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RoleCalendar
        role="tutor"
        sessions={calendarSessions}
        holidays={calendarData?.holidays || []}
        onEventClick={handleEventClick}
        filters={filters}
        isLoading={isCalendarLoading}
        initialView="monthly"
      />

      <Card className="border-2 border-black dark:border-white" data-testid="class-roster-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" />
            Class Rosters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRosterLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !rosterData || rosterData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4" data-testid="no-classes">
              No classes assigned.
            </p>
          ) : (
            <div className="space-y-3">
              {rosterData.map((classRoster) => (
                <div
                  key={classRoster.class.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleOpenRoster(classRoster.class.id)}
                  data-testid={`roster-class-${classRoster.class.id}`}
                >
                  <div>
                    <p className="font-medium">{classRoster.class.name}</p>
                    {classRoster.class.subject && (
                      <p className="text-sm text-muted-foreground">{classRoster.class.subject}</p>
                    )}
                  </div>
                  <Badge
                    variant={classRoster.enrolled >= classRoster.capacity ? "destructive" : "secondary"}
                    data-testid={`roster-capacity-${classRoster.class.id}`}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {classRoster.enrolled}/{classRoster.capacity} seats
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="attendance-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Attendance - {selectedSession?.className}
            </DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <span className="text-sm">
                  {format(parseISO(selectedSession.startTime), 'EEEE, MMMM d, yyyy')} at {format(parseISO(selectedSession.startTime), 'h:mm a')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentClassRoster && (
                <Badge variant="outline" data-testid="attendance-capacity">
                  {currentClassRoster.enrolled}/{currentClassRoster.capacity} students
                </Badge>
              )}
            </div>
            <Button
              onClick={handleMarkAllPresent}
              disabled={markAllPresentMutation.isPending}
              data-testid="btn-mark-all-present"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {markAllPresentMutation.isPending ? "Marking..." : "Mark All Present"}
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isAttendanceLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {currentClassRoster?.students.map((student) => {
                  const existingAttendance = sessionAttendance?.find((a) => a.studentId === student.id);
                  const currentStatus = attendanceChanges[student.id]?.status || existingAttendance?.status || 'unknown';

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`attendance-row-${student.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <AttendanceStatusBadge status={currentStatus as AttendanceStatus} />
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.attendanceSummary && (
                            <p className="text-xs text-muted-foreground">
                              Attendance: {student.attendanceSummary.present}/{student.attendanceSummary.total} present
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={currentStatus}
                          onValueChange={(value) => handleAttendanceChange(student.id, value as AttendanceStatus)}
                        >
                          <SelectTrigger className="w-[120px]" data-testid={`select-attendance-${student.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowParentContact(student)}
                          data-testid={`btn-parent-contact-${student.id}`}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAttendanceModalOpen(false)}
              data-testid="btn-cancel-attendance"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={Object.keys(attendanceChanges).length === 0 || bulkMarkAttendanceMutation.isPending}
              data-testid="btn-save-attendance"
            >
              {bulkMarkAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRosterModalOpen} onOpenChange={setIsRosterModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="roster-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Roster
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {classFilter !== "all" && rosterData ? (
              <div className="space-y-3">
                {rosterData
                  .filter((r) => r.class.id === classFilter)
                  .flatMap((r) => r.students)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`roster-student-${student.id}`}
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.email && (
                          <p className="text-sm text-muted-foreground">
                            <Mail className="w-3 h-3 inline mr-1" />
                            {student.email}
                          </p>
                        )}
                        {student.attendanceSummary && (
                          <div className="flex gap-2 mt-1 text-xs">
                            <span className="text-green-600">Present: {student.attendanceSummary.present}</span>
                            <span className="text-red-600">Absent: {student.attendanceSummary.absent}</span>
                            <span className="text-orange-600">Late: {student.attendanceSummary.late}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowParentContact(student)}
                        data-testid={`btn-roster-parent-${student.id}`}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Parent Contact
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">
                Select a class from the filters to view roster.
              </p>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setIsRosterModalOpen(false)} data-testid="btn-close-roster">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent data-testid="notes-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lesson Notes - {selectedSession?.className}
            </DialogTitle>
            <DialogDescription>
              Add notes for this session to help with tracking and review.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={lessonNotes}
            onChange={(e) => setLessonNotes(e.target.value)}
            placeholder="Enter lesson notes, topics covered, student progress..."
            className="min-h-[200px]"
            data-testid="input-lesson-notes"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotesModalOpen(false)}
              data-testid="btn-cancel-notes"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={updateSessionNotesMutation.isPending}
              data-testid="btn-save-notes"
            >
              {updateSessionNotesMutation.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isParentContactModalOpen} onOpenChange={setIsParentContactModalOpen}>
        <DialogContent data-testid="parent-contact-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Parent Contact Info
            </DialogTitle>
            <DialogDescription>
              Contact information for {selectedStudent?.firstName} {selectedStudent?.lastName}'s parent/guardian
            </DialogDescription>
          </DialogHeader>

          {selectedStudent?.parentContact ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">
                  {selectedStudent.parentContact.firstName} {selectedStudent.parentContact.lastName}
                </p>
                {selectedStudent.parentContact.email && (
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`mailto:${selectedStudent.parentContact.email}`}
                      className="text-blue-600 hover:underline"
                      data-testid="parent-email-link"
                    >
                      {selectedStudent.parentContact.email}
                    </a>
                  </div>
                )}
                {selectedStudent.parentContact.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`tel:${selectedStudent.parentContact.phoneNumber}`}
                      className="text-blue-600 hover:underline"
                      data-testid="parent-phone-link"
                    >
                      {selectedStudent.parentContact.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <p className="text-muted-foreground">No parent contact information available.</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsParentContactModalOpen(false)} data-testid="btn-close-parent-contact">
              Close
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
                const fullSession = calendarData?.sessions.find(s => s.id === selectedSessionId);
                if (fullSession) {
                  setSelectedSession(fullSession);
                  setAttendanceChanges({});
                  setIsBatchDetailsModalOpen(false);
                  setIsAttendanceModalOpen(true);
                }
              }}
              data-testid="btn-take-attendance"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Take Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
