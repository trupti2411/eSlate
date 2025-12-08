import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AttendanceStatusBadge, type AttendanceStatus } from "./AttendanceStatusBadge";
import type { CalendarEvent, CalendarSession, CalendarHoliday, CalendarHomeworkDeadline } from "./types";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailsDrawerProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  role: 'company' | 'tutor' | 'student' | 'parent';
}

const sessionStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Scheduled', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

function SessionDetails({ session, role }: { session: CalendarSession; role: string }) {
  const statusConfig = sessionStatusConfig[session.status] || { label: session.status, variant: 'default' };
  const showAttendance = role === 'student' || role === 'parent';

  return (
    <div className="space-y-4" data-testid="session-details">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={statusConfig.variant} data-testid="session-status-badge">
          {statusConfig.label}
        </Badge>
        {showAttendance && session.attendanceStatus && (
          <AttendanceStatusBadge
            status={session.attendanceStatus as AttendanceStatus}
            showLabel
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Subject:</span>
          <span data-testid="session-subject">{session.subject}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span data-testid="session-date">{format(new Date(session.startTime), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Time:</span>
          <span data-testid="session-time">
            {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
          </span>
        </div>

        {session.tutorName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Tutor:</span>
            <span data-testid="session-tutor">{session.tutorName}</span>
          </div>
        )}

        {session.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Location:</span>
            <span data-testid="session-location">{session.location}</span>
          </div>
        )}

        {session.className && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Class:</span>
            <span data-testid="session-class">{session.className}</span>
          </div>
        )}
      </div>

      {session.notes && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground" data-testid="session-notes">
              {session.notes}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function HolidayDetails({ holiday }: { holiday: CalendarHoliday }) {
  return (
    <div className="space-y-4" data-testid="holiday-details">
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" data-testid="holiday-badge">
        Holiday
      </Badge>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span data-testid="holiday-date">{format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        {holiday.description && (
          <div className="text-sm">
            <span className="font-medium">Description:</span>
            <p className="mt-1 text-muted-foreground" data-testid="holiday-description">
              {holiday.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeworkDetails({ homework }: { homework: CalendarHomeworkDeadline }) {
  const isPastDue = new Date(homework.dueDate) < new Date();

  return (
    <div className="space-y-4" data-testid="homework-details">
      <div className="flex items-center gap-2">
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" data-testid="homework-badge">
          Homework
        </Badge>
        {isPastDue && (
          <Badge variant="destructive" data-testid="homework-past-due">
            Past Due
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Subject:</span>
          <span data-testid="homework-subject">{homework.subject}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Due Date:</span>
          <span data-testid="homework-due-date" className={cn(isPastDue && "text-red-600 dark:text-red-400")}>
            {format(new Date(homework.dueDate), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>

        {homework.description && (
          <div className="text-sm">
            <span className="font-medium">Instructions:</span>
            <p className="mt-1 text-muted-foreground" data-testid="homework-description">
              {homework.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EventDetailsDrawer({ event, isOpen, onClose, role }: EventDetailsDrawerProps) {
  const getTitle = () => {
    if (!event) return '';
    switch (event.type) {
      case 'session':
        return (event.data as CalendarSession).subject;
      case 'holiday':
        return (event.data as CalendarHoliday).name;
      case 'homework':
        return (event.data as CalendarHomeworkDeadline).title;
      default:
        return 'Event Details';
    }
  };

  const getDescription = () => {
    if (!event) return '';
    switch (event.type) {
      case 'session':
        return 'Class Session';
      case 'holiday':
        return 'Holiday / School Closure';
      case 'homework':
        return 'Assignment Deadline';
      default:
        return '';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" data-testid="event-details-drawer">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle data-testid="event-title">{getTitle()}</SheetTitle>
              <SheetDescription data-testid="event-description">
                {getDescription()}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {event?.type === 'session' && (
            <SessionDetails session={event.data as CalendarSession} role={role} />
          )}
          {event?.type === 'holiday' && (
            <HolidayDetails holiday={event.data as CalendarHoliday} />
          )}
          {event?.type === 'homework' && (
            <HomeworkDetails homework={event.data as CalendarHomeworkDeadline} />
          )}
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="close-drawer-button"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
