import { GraduationCap } from 'lucide-react';

export function ESlateFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-xl">
                <GraduationCap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-lg">eSlate</h3>
                <p className="text-xs text-gray-400">Educational Learning Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Empowering students and tutors with modern tools for effective learning and teaching.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Interactive Worksheets</li>
              <li>Real-time Progress Tracking</li>
              <li>AI-Powered Learning Tools</li>
              <li>Calendar & Scheduling</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} eSlate. All rights reserved.</p>
          <p className="mt-1">Designed for e-ink devices and high-contrast displays.</p>
        </div>
      </div>
    </footer>
  );
}
