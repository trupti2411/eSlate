import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 60000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recent = notifications.slice(0, 10);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}/read`, "PATCH"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
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
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {recent.map(n => (
                <li
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-3 ${n.isRead ? "bg-white" : "bg-indigo-50/40"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex-shrink-0 mt-0.5 disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
