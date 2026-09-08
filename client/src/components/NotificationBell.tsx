import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Trash2, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const HIGH_PRIORITY_TYPES = new Set([
  'wwcc_expiry', 'tutor_wwcc', 'invoice_overdue', 'capacity_exceeded', 'tutor_conflict', 'schedule_conflict',
]);
const MEDIUM_PRIORITY_TYPES = new Set([
  'waitlist_spot_open', 'bulk_invoice_complete', 'capacity_warning', 'duplicate_enrollment',
]);

export type NotificationPriority = 'high' | 'medium' | 'low';

export function getNotificationPriority(type: string): NotificationPriority {
  if (HIGH_PRIORITY_TYPES.has(type)) return 'high';
  if (MEDIUM_PRIORITY_TYPES.has(type)) return 'medium';
  return 'low';
}

const PRIORITY_DOT: Record<NotificationPriority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

type FilterValue = 'all' | NotificationPriority;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 60000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = filter === 'all' ? notifications : notifications.filter(n => getNotificationPriority(n.type) === filter);
  const visible = filtered.slice(0, 20);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}/read`, "PATCH"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest(`/api/notifications/read-all`, "POST"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const dismissMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const clearAllMutation = useMutation({
    mutationFn: () => apiRequest(`/api/notifications`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setConfirmClear(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmClear(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center relative"
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-gray-900">
          <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-[10px] font-bold text-gray-400 hover:text-rose-600"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {confirmClear && (
            <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between gap-2">
              <p className="text-xs text-rose-700 font-semibold">Delete all notifications?</p>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setConfirmClear(false)} className="text-[10px] font-bold text-gray-500 px-2 py-1 rounded-lg hover:bg-white">Cancel</button>
                <button
                  onClick={() => clearAllMutation.mutate()}
                  disabled={clearAllMutation.isPending}
                  className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-lg disabled:opacity-50"
                >
                  {clearAllMutation.isPending ? 'Clearing…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-1.5">
            {(['all', 'high', 'medium', 'low'] as FilterValue[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {visible.map(n => {
                const priority = getNotificationPriority(n.type);
                return (
                  <li
                    key={n.id}
                    className={`px-4 py-3 flex items-start gap-2.5 group ${n.isRead ? "bg-white" : "bg-indigo-50/40"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[priority]}`} />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !n.isRead && markReadMutation.mutate(n.id)}>
                      <p className={`text-xs font-bold ${n.isRead ? "text-gray-600" : "text-gray-900"}`}>{n.title}</p>
                      <p className={`text-xs mt-0.5 ${n.isRead ? "text-gray-400" : "text-gray-600"}`}>{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissMutation.mutate(n.id)}
                      className="text-gray-300 hover:text-rose-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
