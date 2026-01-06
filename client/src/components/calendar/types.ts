import type { AttendanceStatus } from "./AttendanceStatusBadge";

export type CalendarView = 'weekly' | 'monthly' | 'term';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CalendarSession {
  id: string;
  subject: string;
  className?: string;
  startTime: string | Date;
  endTime: string | Date;
  status: SessionStatus;
  tutorName?: string;
  location?: string;
  notes?: string;
  attendanceStatus?: AttendanceStatus;
  classId?: string;
  date?: string;
}

export interface CalendarHoliday {
  id: string;
  name: string;
  date: string | Date;
  description?: string;
}

export interface CalendarHomeworkDeadline {
  id: string;
  title: string;
  subject: string;
  dueDate: string | Date;
  description?: string;
  assignmentId?: string;
}

export interface CalendarEvent {
  type: 'session' | 'holiday' | 'homework';
  data: CalendarSession | CalendarHoliday | CalendarHomeworkDeadline;
}

export interface TermInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}
