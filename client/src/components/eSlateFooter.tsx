import { GraduationCap } from 'lucide-react';

export function ESlateFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-lg">
              <GraduationCap className="h-4 w-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-sm">eSlate</span>
              <span className="text-xs text-gray-400 ml-2">Educational Learning Platform</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span>Interactive Worksheets</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Progress Tracking</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">AI-Powered Tools</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Calendar</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/legal/privacy" className="hover:text-white">Privacy</a>
            <a href="/legal/terms" className="hover:text-white">Terms</a>
            <span>&copy; {currentYear} eSlate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
