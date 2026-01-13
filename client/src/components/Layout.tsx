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
          { href: '/student/assignments', icon: FileText, label: 'Assignments' },
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

  // E-ink optimized styling for students
  const isStudent = user?.role === 'student';
  const borderClass = isStudent ? 'border-4' : 'border-2';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Terms Acceptance Modal */}
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onAccepted={() => setShowTermsModal(false)}
        userRole={user?.role}
      />

      {/* Header */}
      <header className={`${borderClass} border-b border-black dark:border-white bg-white dark:bg-gray-900`}>
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 text-decoration-none">
              <Tablet className="h-8 w-8 text-black" />
              <h1 className="text-3xl font-bold text-black">eSlate</h1>
              <span className="text-sm text-gray-600 font-medium">
                {user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Portal` : 'Portal'}
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-black">
                  {user?.firstName || user?.email || 'User'}
                </span>
              </div>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="eink-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`w-64 min-h-screen ${borderClass} border-r border-black dark:border-white bg-white dark:bg-gray-900 p-4`}>
          <nav className={isStudent ? 'space-y-3' : 'space-y-2'}>
            {getNavigationItems().map((item) => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className={`
                  flex items-center space-x-3 px-4 ${isStudent ? 'py-4 text-base' : 'py-3 text-sm'} font-${isStudent ? 'bold' : 'medium'} rounded ${borderClass} transition-colors
                  ${isActive 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'bg-white dark:bg-gray-900 text-black dark:text-white border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}>
                  <Icon className={isStudent ? 'h-6 w-6' : 'h-5 w-5'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="min-h-[calc(100vh-200px)]">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="border-t-2 border-black bg-white mt-8">
            <div className="container py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About */}
                <div>
                  <h3 className="font-bold text-black mb-3">About eSlate</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    A secure educational platform designed for e-ink devices, focusing on accessibility and learning excellence.
                  </p>
                  <p className="text-xs text-gray-500">
                    Optimized for high contrast displays and simplified interfaces.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="font-bold text-black mb-3">Quick Links</h3>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/" className="text-gray-600 hover:text-black">Dashboard</Link></li>
                    {user?.role === 'admin' && (
                      <>
                        <li><Link href="/admin/users" className="text-gray-600 hover:text-black">User Management</Link></li>
                        <li><Link href="/admin/companies" className="text-gray-600 hover:text-black">Companies</Link></li>
                      </>
                    )}
                    {user?.role === 'company_admin' && (
                      <>
                        <li><Link href="/company" className="text-gray-600 hover:text-black">Company Dashboard</Link></li>
                        <li><Link href="/company/tutors" className="text-gray-600 hover:text-black">Tutors</Link></li>
                        <li><Link href="/company/students" className="text-gray-600 hover:text-black">Students</Link></li>
                      </>
                    )}
                  </ul>
                </div>

                {/* User Info */}
                <div>
                  <h3 className="font-bold text-black mb-3">Account</h3>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">Logged in as:</p>
                    <p className="font-medium">{user?.firstName || user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role?.replace('_', ' ')} Account
                    </p>
                  </div>
                </div>

                {/* System Status */}
                <div>
                  <h3 className="font-bold text-black mb-3">System</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">System Online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tablet className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-600">E-ink Optimized</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Version 1.0.0
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Links */}
              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  <Link href="/legal/privacy" className="text-xs text-gray-600 hover:text-black flex items-center gap-1" data-testid="link-footer-privacy">
                    <Shield className="w-3 h-3" /> Privacy Policy
                  </Link>
                  <Link href="/legal/terms" className="text-xs text-gray-600 hover:text-black flex items-center gap-1" data-testid="link-footer-terms">
                    <Scale className="w-3 h-3" /> Terms of Service
                  </Link>
                  <Link href="/legal/agreement" className="text-xs text-gray-600 hover:text-black flex items-center gap-1" data-testid="link-footer-agreement">
                    <FileText className="w-3 h-3" /> User Agreement
                  </Link>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-xs text-gray-500 mb-2 md:mb-0">
                    © 2024 eSlate Educational Platform. Designed for accessibility and learning.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">Built with</span>
                    <div className="flex items-center space-x-1">
                      <Tablet className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-500">E-ink Technology</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
