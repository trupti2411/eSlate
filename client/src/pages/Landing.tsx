import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tablet, Shield, Users, GraduationCap, Presentation, Settings } from "lucide-react";

export default function Landing() {
  const handleRoleLogin = (role: string) => {
    // Store role in sessionStorage for post-login redirect
    sessionStorage.setItem('selectedRole', role);
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Tablet className="h-8 w-8 text-black" />
              <h1 className="text-3xl font-bold text-black">eSlate</h1>
              <span className="text-sm text-gray-600 font-medium">E-ink Educational Platform</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-black font-medium transition-colors">Features</a>
              <a href="#roles" className="text-gray-600 hover:text-black font-medium transition-colors">User Roles</a>
              <a href="#login" className="eink-button-primary px-6 py-2 font-medium">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 border-b border-gray-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-black mb-6 leading-tight">
            Secure Educational Platform<br />
            <span className="text-gray-600">Optimized for E-ink Devices</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            eSlate provides a high-contrast, accessible learning environment designed specifically for e-ink displays. 
            Supporting students, parents, and tutors with seamless homework management, real-time collaboration, 
            and comprehensive progress tracking.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.location.href = '#login'} 
              className="eink-button-primary px-8 py-4 text-lg"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '#features'}
              className="eink-button px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-16 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-black mb-4">Multi-Role Access</h3>
            <p className="text-xl text-gray-600">Dedicated portals for students, parents, and tutors with secure authentication</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Portal */}
            <Card className="eink-card p-8 text-center hover:bg-gray-50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-black">Student Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access assignments, submit homework, track progress, and collaborate with tutors and peers.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">✓ Submit assignments</li>
                  <li className="flex items-center">✓ View progress reports</li>
                  <li className="flex items-center">✓ Real-time messaging</li>
                  <li className="flex items-center">✓ Calendar management</li>
                </ul>
                <Button 
                  onClick={() => handleRoleLogin('student')} 
                  className="w-full eink-button-primary"
                >
                  Student Login
                </Button>
              </CardContent>
            </Card>

            {/* Parent Portal */}
            <Card className="eink-card p-8 text-center hover:bg-gray-50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-black">Parent Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Monitor student progress, verify homework submissions, and communicate with tutors.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">✓ Verify submissions</li>
                  <li className="flex items-center">✓ Progress monitoring</li>
                  <li className="flex items-center">✓ Payment management</li>
                  <li className="flex items-center">✓ Communication tools</li>
                </ul>
                <Button 
                  onClick={() => handleRoleLogin('parent')} 
                  className="w-full eink-button-primary"
                >
                  Parent Login
                </Button>
              </CardContent>
            </Card>

            {/* Tutor Portal */}
            <Card className="eink-card p-8 text-center hover:bg-gray-50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                  <Presentation className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-black">Tutor Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create assignments, manage students, track progress, and schedule sessions.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">✓ Assignment creation</li>
                  <li className="flex items-center">✓ Student management</li>
                  <li className="flex items-center">✓ Class scheduling</li>
                  <li className="flex items-center">✓ Reporting tools</li>
                </ul>
                <Button 
                  onClick={() => handleRoleLogin('tutor')} 
                  className="w-full eink-button-primary"
                >
                  Tutor Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <Card className="eink-card p-8">
            <div className="text-center mb-8">
              <Tablet className="h-16 w-16 text-black mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-black mb-2">Access eSlate</h3>
              <p className="text-gray-600">Select your role to continue to the secure login portal</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleRoleLogin('student')}
                className="w-full eink-button py-4 px-6 text-left flex items-center"
              >
                <GraduationCap className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">Student Login</div>
                  <div className="text-sm text-gray-600">Access assignments and coursework</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleLogin('parent')}
                className="w-full eink-button py-4 px-6 text-left flex items-center"
              >
                <Users className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">Parent Login</div>
                  <div className="text-sm text-gray-600">Monitor progress and verify work</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleLogin('tutor')}
                className="w-full eink-button py-4 px-6 text-left flex items-center"
              >
                <Presentation className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">Tutor Login</div>
                  <div className="text-sm text-gray-600">Manage classes and students</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleLogin('admin')}
                className="w-full eink-button py-4 px-6 text-left flex items-center"
              >
                <Settings className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">Admin Login</div>
                  <div className="text-sm text-gray-600">System administration access</div>
                </div>
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-2">
                <Shield className="inline h-4 w-4 mr-1" />
                Secured with authentication
              </p>
              <p className="text-xs text-gray-500">
                All login portals use secure authentication protocols
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-12 px-4">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Tablet className="h-8 w-8 text-black" />
                <h5 className="text-2xl font-bold text-black">eSlate</h5>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                A secure, accessible, and low-power educational platform designed specifically for e-ink devices. 
                Supporting the future of digital learning with optimal readability and extended battery life.
              </p>
            </div>
            
            <div>
              <h6 className="font-bold text-black mb-4">Platform</h6>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Student Portal</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Parent Portal</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Tutor Portal</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Admin Access</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-bold text-black mb-4">Support</h6>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-black transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              &copy; 2024 eSlate Educational Platform. Optimized for e-ink displays and accessible learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
