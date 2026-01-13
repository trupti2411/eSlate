import { cn } from "@/lib/utils";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import type { CalendarSession, CalendarHoliday, CalendarHomeworkDeadline, CalendarEvent } from "./types";
import { format, isSameDay, isToday } from "date-fns";

interface CalendarDayCellProps {
  date: Date;
  sessions: CalendarSession[];
  holidays: CalendarHoliday[];
  homeworkDeadlines: CalendarHomeworkDeadline[];
  role: 'company' | 'tutor' | 'student' | 'parent';
  onEventClick: (event: CalendarEvent) => void;
  isCurrentMonth?: boolean;
  isCompact?: boolean;
}

const sessionStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400',
};

export function CalendarDayCell({
  date,
  sessions,
  holidays,
  homeworkDeadlines,
  role,
  onEventClick,
  isCurrentMonth = true,
  isCompact = false,
}: CalendarDayCellProps) {
  // Use sessionDate if available (for virtual sessions), otherwise fall back to startTime
  const daySessions = sessions.filter(s => {
    if (s.sessionDate) {
      // Compare using the explicit date string to avoid timezone issues
      return format(date, 'yyyy-MM-dd') === s.sessionDate;
    }
    return isSameDay(new Date(s.startTime), date);
  });
  const dayHolidays = holidays.filter(h => {
    const holidayDate = new Date(h.date);
    return isSameDay(holidayDate, date);
  });
  const dayHomework = homeworkDeadlines.filter(hw => isSameDay(new Date(hw.dueDate), date));
  
  const isHoliday = dayHolidays.length > 0;
  const hasEvents = daySessions.length > 0 || dayHomework.length > 0;
  const showAttendance = role === 'student' || role === 'parent';

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  return (
    <div
      className={cn(
        "min-h-[80px] p-1 border border-border bg-background dark:bg-black",
        !isCurrentMonth && "bg-muted/50 dark:bg-gray-900/50",
        isToday(date) && "ring-2 ring-primary ring-inset",
        isHoliday && "bg-red-50 dark:bg-red-950/30",
        isCompact && "min-h-[60px]"
      )}
      data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={cn(
            "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
            isToday(date) && "bg-primary text-primary-foreground",
            !isCurrentMonth && "text-muted-foreground"
          )}
          data-testid={`day-number-${format(date, 'yyyy-MM-dd')}`}
        >
          {format(date, 'd')}
        </span>
        {hasEvents && (
          <div className="flex gap-0.5" data-testid={`event-indicators-${format(date, 'yyyy-MM-dd')}`}>
            {daySessions.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500" title="Sessions" />
            )}
            {dayHomework.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500" title="Homework" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-0.5 overflow-hidden">
        {dayHolidays.map((holiday) => (
          <button
            key={holiday.id}
            onClick={(e) => handleEventClick({ type: 'holiday', data: holiday }, e)}
            className={cn(
              "w-full text-left text-xs px-1 py-0.5 rounded truncate",
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
              "hover:bg-red-200 dark:hover:bg-red-800 transition-colors cursor-pointer"
            )}
            data-testid={`holiday-event-${holiday.id}`}
          >
            🎉 {holiday.name}
          </button>
        ))}

        {!isCompact && daySessions.slice(0, 2).map((session) => (
          <button
            key={session.id}
            onClick={(e) => handleEventClick({ type: 'session', data: session }, e)}
            className={cn(
              "w-full text-left text-xs px-1 py-0.5 rounded truncate flex items-center gap-1",
              "bg-white dark:bg-gray-800 border border-border",
              "hover:bg-muted transition-colors cursor-pointer"
            )}
            data-testid={`session-event-${session.id}`}
          >
            <span
              className={cn("w-2 h-2 rounded-full flex-shrink-0", sessionStatusColors[session.status])}
              data-testid={`session-status-${session.id}`}
            />
            <span className="truncate">{session.subject}</span>
            {showAttendance && session.attendanceStatus && (
              <AttendanceStatusBadge
                status={session.attendanceStatus as AttendanceStatus}
                size="sm"
                className="ml-auto"
              />
            )}
          </button>
        ))}

        {!isCompact && dayHomework.slice(0, 2).map((hw) => (
          <button
            key={hw.id}
            onClick={(e) => handleEventClick({ type: 'homework', data: hw }, e)}
            className={cn(
              "w-full text-left text-xs px-1 py-0.5 rounded truncate",
              "bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
              "hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors cursor-pointer"
            )}
            data-testid={`homework-event-${hw.id}`}
          >
            📝 {hw.title}
          </button>
        ))}

        {(daySessions.length > 2 || dayHomework.length > 2) && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
            onClick={(e) => {
              e.stopPropagation();
              const allEvents: CalendarEvent[] = [
                ...daySessions.map(s => ({ type: 'session' as const, data: s })),
                ...dayHomework.map(hw => ({ type: 'homework' as const, data: hw })),
              ];
              if (allEvents.length > 0) {
                onEventClick(allEvents[0]);
              }
            }}
            data-testid={`more-events-${format(date, 'yyyy-MM-dd')}`}
          >
            +{daySessions.length + dayHomework.length - 4} more
          </button>
        )}
      </div>
    </div>
  );
}
