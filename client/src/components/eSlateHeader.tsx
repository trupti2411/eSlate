import { GraduationCap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface ESlateHeaderProps {
  showNav?: boolean;
  children?: React.ReactNode;
}

export function ESlateHeader({ showNav = false, children }: ESlateHeaderProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  };

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
          <div className="flex items-center gap-4">
            {children}
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 hover:text-black font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
