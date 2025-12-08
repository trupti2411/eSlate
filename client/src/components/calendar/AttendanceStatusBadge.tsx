import { cn } from "@/lib/utils";

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'unknown';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<AttendanceStatus, { color: string; label: string; bgColor: string }> = {
  present: {
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900',
    label: 'Present',
  },
  absent: {
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900',
    label: 'Absent',
  },
  late: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    label: 'Late',
  },
  excused: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    label: 'Excused',
  },
  unknown: {
    color: 'bg-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Unknown',
  },
};

const sizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function AttendanceStatusBadge({
  status,
  showLabel = false,
  size = 'md',
  className,
}: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        showLabel && cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bgColor),
        className
      )}
      data-testid={`attendance-badge-${status}`}
    >
      <span
        className={cn(
          "rounded-sm flex-shrink-0",
          config.color,
          sizeConfig[size]
        )}
        data-testid={`attendance-indicator-${status}`}
      />
      {showLabel && (
        <span className="text-foreground" data-testid={`attendance-label-${status}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function AttendanceStatusLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)} data-testid="attendance-legend">
      {(Object.keys(statusConfig) as AttendanceStatus[])
        .filter(status => status !== 'unknown')
        .map((status) => (
          <AttendanceStatusBadge
            key={status}
            status={status}
            showLabel
            size="sm"
          />
        ))}
    </div>
  );
}
