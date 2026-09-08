import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Laptop, Smartphone, Tablet, ChevronLeft, Circle, LogOut, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Device {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  lastActiveAt: string | null;
  lastSyncAt: string | null;
  isOnline: boolean;
  isCurrentDevice: boolean;
}

const DEVICE_ICON: Record<string, any> = { mobile: Smartphone, tablet: Tablet, desktop: Laptop };

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MyDevices() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ['/api/me/devices'],
  });

  const unlinkMutation = useMutation({
    mutationFn: (deviceId: string) => apiRequest(`/api/me/devices/${deviceId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me/devices'] });
      setConfirmId(null);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Account</p>
            <h1 className="text-xl font-black">My Devices</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-sm text-gray-500 mb-4">
          Devices you're signed in on. Your work follows your account, so anything you start on one device is available on the others.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 text-sm">
            No devices found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map(d => {
              const Icon = DEVICE_ICON[d.deviceType ?? ''] ?? Laptop;
              return (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm truncate">{d.deviceName ?? 'Unknown device'}</p>
                      {d.isCurrentDevice && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full flex-shrink-0">This device</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Circle size={7} className={d.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-gray-300 fill-gray-300'} />
                        {d.isOnline ? 'Online' : `Last active ${timeAgo(d.lastActiveAt)}`}
                      </span>
                      <span>Synced {timeAgo(d.lastSyncAt)}</span>
                    </div>
                  </div>
                  {!d.isCurrentDevice && (
                    confirmId === d.id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setConfirmId(null)} className="text-xs font-bold text-gray-500 px-2 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                        <button
                          onClick={() => unlinkMutation.mutate(d.id)}
                          disabled={unlinkMutation.isPending}
                          className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {unlinkMutation.isPending ? 'Signing out…' : 'Confirm'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(d.id)}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0"
                      >
                        <LogOut size={12} /> Sign out
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">Signing out a device ends its session immediately and clears cached data there next time it connects.</p>
        </div>
      </main>
    </div>
  );
}
