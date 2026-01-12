import { useState, useMemo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { CalendarDayCell } from "./CalendarDayCell";
import { EventDetailsDrawer } from "./EventDetailsDrawer";
import { AttendanceStatusLegend } from "./AttendanceStatusBadge";
import type {
  CalendarView,
  CalendarSession,
  CalendarHoliday,
  CalendarHomeworkDeadline,
  CalendarEvent,
  TermInfo,
  SessionStatus,
} from "./types";

export type {
  CalendarView,
  SessionStatus,
  CalendarSession,
  CalendarHoliday,
  CalendarHomeworkDeadline,
  CalendarEvent,
  TermInfo,
};

export interface RoleCalendarProps {
  role: 'company' | 'tutor' | 'student' | 'parent';
  sessions: CalendarSession[];
  holidays: CalendarHoliday[];
  homeworkDeadlines?: CalendarHomeworkDeadline[];
  onEventClick: (event: CalendarEvent) => void;
  onViewChange?: (view: CalendarView) => void;
  filters?: ReactNode;
  termInfo?: TermInfo;
  initialView?: CalendarView;
  initialDate?: Date;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RoleCalendar({
  role,
  sessions,
  holidays,
  homeworkDeadlines = [],
  onEventClick,
  onViewChange,
  filters,
  termInfo,
  initialView = 'weekly',
  initialDate = new Date(),
  isLoading = false,
}: RoleCalendarProps) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showAttendanceLegend = role === 'student' || role === 'parent';

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    onViewChange?.(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
    onEventClick(event);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  const navigatePrevious = () => {
    if (view === 'weekly') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'monthly') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'term' && termInfo) {
      setCurrentDate(termInfo.startDate);
    }
  };

  const navigateNext = () => {
    if (view === 'weekly') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'monthly') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'term' && termInfo) {
      setCurrentDate(termInfo.endDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dateRange = useMemo(() => {
    if (view === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return { start, end, days: eachDayOfInterval({ start, end }) };
    } else if (view === 'monthly') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const start = startOfWeek(monthStart, { weekStartsOn: 0 });
      const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return { start, end, days: eachDayOfInterval({ start, end }), monthStart, monthEnd };
    } else if (view === 'term' && termInfo) {
      const start = startOfWeek(termInfo.startDate, { weekStartsOn: 0 });
      const end = endOfWeek(termInfo.endDate, { weekStartsOn: 0 });
      return { start, end, days: eachDayOfInterval({ start, end }) };
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return { start, end, days: eachDayOfInterval({ start, end }) };
  }, [view, currentDate, termInfo]);

  const getHeaderText = () => {
    if (view === 'weekly') {
      return `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
    } else if (view === 'monthly') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'term' && termInfo) {
      return termInfo.name;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let currentWeek: Date[] = [];
    
    dateRange.days.forEach((day, index) => {
      currentWeek.push(day);
      if ((index + 1) % 7 === 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }, [dateRange.days]);

  return (
    <Card className="w-full bg-white dark:bg-gray-900 border-0 shadow-md rounded-xl overflow-hidden" data-testid="role-calendar">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white" data-testid="calendar-title">Calendar</CardTitle>
          </div>

          <Tabs value={view} onValueChange={(v) => handleViewChange(v as CalendarView)}>
            <TabsList className="bg-gray-100 dark:bg-gray-700" data-testid="view-switcher">
              <TabsTrigger value="weekly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm" data-testid="view-weekly">Week</TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm" data-testid="view-monthly">Month</TabsTrigger>
              <TabsTrigger value="term" disabled={!termInfo} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm" data-testid="view-term">Term</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={navigatePrevious}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              data-testid="navigate-previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700"
              data-testid="navigate-today"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={navigateNext}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              data-testid="navigate-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="font-bold text-gray-900 dark:text-white ml-3" data-testid="date-range-header">
              {getHeaderText()}
            </span>
          </div>

          {filters && (
            <div className="flex items-center gap-2" data-testid="calendar-filters">
              {filters}
            </div>
          )}
        </div>

        {showAttendanceLegend && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Attendance Legend:</span>
            </div>
            <AttendanceStatusLegend />
          </div>
        )}

        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Legend</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">Cancelled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">Homework</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
              <span className="text-gray-700 dark:text-gray-300">Holiday</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center" data-testid="calendar-loading">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-500 dark:text-gray-400">Loading calendar...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={cn("grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700", view === 'term' && "text-xs")}>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="bg-gray-100 dark:bg-gray-800 p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                  data-testid={`day-header-${day.toLowerCase()}`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700" data-testid="calendar-grid">
              {weeks.map((week, weekIndex) => (
                week.map((day) => (
                  <CalendarDayCell
                    key={day.toISOString()}
                    date={day}
                    sessions={sessions}
                    holidays={holidays}
                    homeworkDeadlines={homeworkDeadlines}
                    role={role}
                    onEventClick={handleEventClick}
                    isCurrentMonth={view === 'monthly' ? isSameMonth(day, currentDate) : true}
                    isCompact={view === 'term'}
                  />
                ))
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <EventDetailsDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        role={role}
      />
    </Card>
  );
}
