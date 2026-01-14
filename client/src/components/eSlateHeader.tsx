import { GraduationCap } from 'lucide-react';

interface ESlateHeaderProps {
  showNav?: boolean;
  children?: React.ReactNode;
}

export function ESlateHeader({ showNav = false, children }: ESlateHeaderProps) {
  return (
    <header className="bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl">
              <GraduationCap className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">eSlate</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Educational Learning Platform</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
