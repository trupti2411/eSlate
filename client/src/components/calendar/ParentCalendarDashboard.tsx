import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { RoleCalendar, type CalendarSession, type CalendarHoliday, type CalendarHomeworkDeadline, type CalendarEvent } from "./RoleCalendar";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  BookOpen,
  Users,
  User,
} from "lucide-react";

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

export function ParentCalendarDashboard() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ParentSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const queryEndpoint = selectedChildId === "all" 
    ? "/api/calendar/parent"
    : `/api/calendar/parent?childId=${selectedChildId}`;

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery<ParentCalendarData>({
    queryKey: [queryEndpoint],
  });

  const selectedChild = useMemo(() => {
    if (selectedChildId === "all" || !calendarData?.children) return null;
    return calendarData.children.find(c => c.id === selectedChildId);
  }, [selectedChildId, calendarData?.children]);

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

  if (isCalendarLoading) {
    return (
      <div className="space-y-4" data-testid="parent-calendar-loading">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const hasMultipleChildren = (calendarData?.children?.length || 0) > 1;

  return (
    <div className="space-y-4" data-testid="parent-calendar-dashboard">
      {hasMultipleChildren && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="child-selector-card">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-medium">Viewing:</span>
          <Select value={selectedChildId} onValueChange={handleChildChange}>
            <SelectTrigger className="w-[220px] h-8 text-sm" data-testid="child-selector">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="child-option-all">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  All Children
                </div>
              </SelectItem>
              {calendarData?.children?.map((child) => (
                <SelectItem key={child.id} value={child.id} data-testid={`child-option-${child.id}`}>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    {child.firstName} {child.lastName}
                    {child.gradeLevel && <Badge variant="outline" className="ml-1 text-[10px]">{child.gradeLevel}</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedChild && (
            <span className="text-xs text-slate-400">
              Showing classes for {selectedChild.firstName}
            </span>
          )}
        </div>
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
