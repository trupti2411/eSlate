import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tablet, LogOut, User, Home, BookOpen, Users, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', icon: Home, label: 'Dashboard' },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          { href: '/assignments', icon: BookOpen, label: 'Assignments' },
          { href: '/progress', icon: Users, label: 'Progress' },
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
          { href: '/company/reports', icon: BookOpen, label: 'Reports' },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
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
        <aside className="w-64 min-h-screen border-r-2 border-black bg-white p-4">
          <nav className="space-y-2">
            {getNavigationItems().map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a className={`
                    flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded border-2 transition-colors
                    ${isActive 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border-black hover:bg-gray-50'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
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

              {/* Bottom Bar */}
              <div className="border-t border-gray-200 mt-6 pt-4">
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
