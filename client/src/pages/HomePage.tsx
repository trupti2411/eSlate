import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Users, 
  CheckCircle,
  Tablet,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-black dark:text-white" />
              <span className="text-2xl font-bold text-black dark:text-white">eSlate</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="outline" className="border-black dark:border-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-6">
            Education Optimized for
            <br />
            <span className="text-gray-600 dark:text-gray-400">E-ink Devices</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            A comprehensive learning management system designed specifically for tutoring companies. 
            Manage students, assignments, and progress with a clean, high-contrast interface perfect for e-ink displays.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-lg px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-4">
            Everything You Need to Manage Education
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Built for tutoring companies, designed for clarity and efficiency
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Assignment Management</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create, assign, and track homework with PDF annotations and interactive worksheets. Support for file uploads and in-app question types.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <MessageSquare className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Real-time Messaging</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Instant communication between students, parents, and tutors. WebSocket-powered for immediate updates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <Calendar className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Calendar & Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage class sessions, track attendance, and schedule lessons. Role-specific calendar views for everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <BarChart3 className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor student performance with detailed analytics. Track grades, attendance, and learning milestones.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Multi-Role Support</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Dedicated portals for students, parents, tutors, and administrators. Each role gets a tailored experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <Tablet className="h-12 w-12 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">E-ink Optimized</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  High-contrast design with pure black and white colors. Perfect for 13.3" e-ink tablets and displays.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-12">
            Designed for Everyone in Education
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-white dark:text-black" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Students</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                View assignments, complete worksheets, track progress, and communicate with tutors
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-white dark:text-black" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Parents</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monitor children's progress, view attendance, and stay connected with tutors
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white dark:text-black" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Tutors</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create assignments, grade work, track attendance, and manage class schedules
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-white dark:text-black" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Administrators</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage users, classes, academic years, and oversee all company operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
                Why Choose eSlate?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">Eye-Friendly Design</h4>
                    <p className="text-gray-600 dark:text-gray-400">High contrast interface reduces eye strain during long study sessions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">PDF Annotation Tools</h4>
                    <p className="text-gray-600 dark:text-gray-400">Students can annotate assignments with pen, highlighter, and text tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">Interactive Worksheets</h4>
                    <p className="text-gray-600 dark:text-gray-400">Create multiple question types with auto-grading support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">AI-Powered Features</h4>
                    <p className="text-gray-600 dark:text-gray-400">Smart hints for students and grading assistance for tutors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">Real-time Updates</h4>
                    <p className="text-gray-600 dark:text-gray-400">Instant notifications and live messaging keep everyone connected</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-black dark:text-white">5</div>
                  <div className="text-gray-600 dark:text-gray-400">User roles supported</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-black dark:text-white">6+</div>
                  <div className="text-gray-600 dark:text-gray-400">Question types for worksheets</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-black dark:text-white">100%</div>
                  <div className="text-gray-600 dark:text-gray-400">E-ink compatible design</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black dark:bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white dark:text-black mb-4">
            Ready to Transform Your Tutoring Business?
          </h2>
          <p className="text-gray-300 dark:text-gray-700 mb-8">
            Join eSlate and experience education management designed for the modern era
          </p>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black dark:border-black dark:text-black dark:hover:bg-black dark:hover:text-white text-lg px-8">
              Sign In Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-black dark:text-white" />
              <span className="text-lg font-bold text-black dark:text-white">eSlate</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/legal/privacy" className="hover:text-black dark:hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="hover:text-black dark:hover:text-white">
                Terms of Service
              </Link>
              <Link href="/legal/agreement" className="hover:text-black dark:hover:text-white">
                User Agreement
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} eSlate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
