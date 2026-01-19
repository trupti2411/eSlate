import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tablet, LogOut, User, Home, BookOpen, Users, Settings, Calendar, Shield, FileText, Scale, ClipboardCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { TermsAcceptanceModal } from "./TermsAcceptanceModal";

interface LayoutProps {
  children: React.ReactNode;
}

const CURRENT_TERMS_VERSION = "1.0";

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (user && !user.termsAcceptedAt) {
      const needsTermsAcceptance = ['student', 'parent', 'company_admin'].includes(user.role || '');
      if (needsTermsAcceptance) {
        setShowTermsModal(true);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('authToken');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Force a full page reload to clear all state regardless of response
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage and redirect even if logout request fails
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', icon: Home, label: 'Dashboard' },
    ];

    switch (user?.role) {
      case 'student':
        return [
          { href: '/student/home', icon: Home, label: 'Dashboard' },
          { href: '/student/portal', icon: BookOpen, label: 'My Worksheets' },
          { href: '/student/dashboard', icon: Calendar, label: 'Calendar' },
        ];
      case 'parent':
        return [
          ...baseItems,
          { href: '/children', icon: Users, label: 'Children' },
          { href: '/reports', icon: BookOpen, label: 'Reports' },
        ];
      case 'tutor':
        return [
          ...baseItems,
          { href: '/students', icon: Users, label: 'Students' },
          { href: '/assignments', icon: BookOpen, label: 'Assignments' },
          { href: '/tutor/tests', icon: BookOpen, label: 'Tests & Exams' },
          { href: '/calendar', icon: Settings, label: 'Schedule' },
        ];
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/users', icon: Users, label: 'Users' },
          { href: '/admin/companies', icon: Settings, label: 'Companies' },
        ];
      case 'company_admin':
        return [
          ...baseItems,
          { href: '/company', icon: Settings, label: 'Company Dashboard' },
          { href: '/company/tutors', icon: Users, label: 'Tutors' },
          { href: '/company/students', icon: Users, label: 'Students' },
          { href: '/company/academic', icon: Calendar, label: 'Academic Management' },
          { href: '/company/assignments', icon: BookOpen, label: 'Assignment Management' },
          { href: '/company/tests', icon: BookOpen, label: 'Tests & Exams' },
          { href: '/company/homework', icon: BookOpen, label: 'Submitted Homework' },
          { href: '/company/reports', icon: BookOpen, label: 'Reports' },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-white overflow-hidden">
      {/* Terms Acceptance Modal */}
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onAccepted={() => setShowTermsModal(false)}
        userRole={user?.role}
      />

      {/* Header - Compact for 13.3" screen */}
      <header className="eink-header bg-white">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2 text-decoration-none">
            <Tablet className="h-6 w-6 text-black" />
            <h1 className="text-xl font-bold text-black">eSlate</h1>
            <span className="text-xs text-gray-600 font-medium hidden sm:inline">
              {user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1).replace('_', ' ')}` : ''}
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-black">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="eink-btn eink-btn-secondary h-8 px-3"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="eink-layout" style={{ height: 'calc(100vh - var(--eink-header-height))' }}>
        {/* Sidebar Navigation - Compact for 13.3" screen */}
        <aside className="eink-sidebar bg-white overflow-y-auto">
          <nav className="space-y-1">
            {getNavigationItems().map((item) => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`eink-nav-item ${isActive ? 'eink-nav-item-active' : 'eink-nav-item-inactive'}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Scrollable for 13.3" screen */}
        <main className="eink-main flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          
          {/* Footer - Compact for 13.3" screen */}
          <footer className="eink-footer flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">© 2024 eSlate</span>
                <Link href="/legal/privacy" className="text-xs text-gray-600 hover:text-black" data-testid="link-footer-privacy">
                  Privacy
                </Link>
                <Link href="/legal/terms" className="text-xs text-gray-600 hover:text-black" data-testid="link-footer-terms">
                  Terms
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
                <Tablet className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">E-ink v1.0</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
