import { useState } from 'react';
import { Sparkles, X, LayoutDashboard } from 'lucide-react';
import type { Design } from '@/hooks/useDesignPreference';

interface Props {
  bannerSeen: boolean;
  onDismiss: () => void;
  onSwitch: () => void;
}

export function DesignSwitchBanner({ bannerSeen, onDismiss, onSwitch }: Props) {
  const [hidden, setHidden] = useState(false);

  const handleDismiss = () => {
    setHidden(true);
    onDismiss();
  };

  const handleSwitch = () => {
    onDismiss();
    onSwitch();
  };

  if (hidden) return null;

  if (!bannerSeen) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="flex items-center gap-3 bg-indigo-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl shadow-indigo-400/30">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">New simplified design available</p>
            <p className="text-xs text-indigo-200 mt-0.5">Faster, cleaner — built for touch &amp; stylus</p>
          </div>
          <button
            onClick={handleSwitch}
            className="flex-shrink-0 bg-white text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Try it
          </button>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={handleSwitch}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-full shadow-xl shadow-indigo-300/40 transition-all hover:scale-105"
      >
        <Sparkles size={14} />
        New design
      </button>
    </div>
  );
}

interface NavToggleProps {
  design: Design;
  onSwitch: (d: Design) => void;
  accentClass?: string;
}

export function DesignNavToggle({ design, onSwitch, accentClass = 'bg-indigo-600' }: NavToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-black/10 rounded-xl p-1">
      <button
        onClick={() => onSwitch('classic')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          design === 'classic' ? 'bg-white text-gray-800 shadow-sm' : 'text-white/70 hover:text-white'
        }`}
      >
        <LayoutDashboard size={12} />
        Classic
      </button>
      <button
        onClick={() => onSwitch('new')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          design === 'new' ? 'bg-white text-gray-800 shadow-sm' : 'text-white/70 hover:text-white'
        }`}
      >
        <Sparkles size={12} />
        New
      </button>
    </div>
  );
}
