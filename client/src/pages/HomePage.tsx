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
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  Monitor,
  Lock,
  Eye,
  Zap,
  Battery,
  Sun
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">eSlate</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 -z-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-8">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">Trusted by education providers worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Smarter Way to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Manage Learning</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            A complete platform for education providers to manage students, track progress, and deliver engaging lessons. 
            Simple, beautiful, and designed with learners in mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 shadow-xl shadow-blue-500/25">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Easy to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Works on all devices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Safe & secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From homework to messaging, we've got all the tools to help your education provider run smoothly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Homework & Worksheets</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create assignments, share worksheets, and collect work digitally. Students can complete tasks online or upload their handwritten work.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Messaging</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay connected with students and parents. Send updates, answer questions, and share feedback in real time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Class Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Organise lessons, track attendance, and manage your timetable. Everyone knows where they need to be and when.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Reports</h3>
                <p className="text-gray-600 leading-relaxed">
                  See how students are doing at a glance. Track grades, attendance, and learning milestones with clear, visual reports.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Everyone</h3>
                <p className="text-gray-600 leading-relaxed">
                  Separate spaces for students, parents, tutors, and centre managers. Everyone gets exactly what they need.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-cyan-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Tablet className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Tablet Friendly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Works beautifully on tablets and e-readers. Clear, easy-to-read design that's gentle on the eyes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-slate-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Monitor className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">E-ink Device Ready</h3>
                <p className="text-gray-600 leading-relaxed">
                  Specially designed for e-ink screens with high-contrast displays. Perfect for distraction-free learning on any device.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-red-50 to-white group">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Safe & Secure</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your data is protected with secure logins and privacy controls. Parents can manage what their children can access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* E-ink Focus Section - USP */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full mb-4">
                <Monitor className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Our Focus</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Built for <span className="text-cyan-400">E-ink Devices</span>
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Unlike other platforms, eSlate is designed from the ground up for e-ink screens. 
                High-contrast, distraction-free learning optimised for 13.3" tablets.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Eye className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm">Easy on eyes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm">Fast response</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Battery className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm">Battery friendly</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Sun className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm">Any lighting</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-64 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg border-4 border-gray-700 shadow-2xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Monitor className="h-10 w-10 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-700 font-semibold text-sm">E-ink Optimised</p>
                    <p className="text-gray-500 text-xs mt-1">High contrast</p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-cyan-400 text-gray-900 font-bold px-2 py-0.5 rounded-full text-xs shadow-lg">
                  13.3"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Your Whole Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Whether you're a student, parent, tutor, or managing the team, eSlate has you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                View homework, complete worksheets, watch solution videos, check your grades, and chat with tutors
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Parents</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Stay updated on your child's progress, view attendance, and connect with tutors
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tutors</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create lessons, mark work, write student reports, track attendance, and manage your class schedule
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Centre Managers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Oversee everything - manage staff, students, classes, create student reports, and track progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Why Education Providers Love eSlate
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Easy on the Eyes</h4>
                    <p className="text-gray-600">Clean, clear design that's comfortable for long study sessions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Write on PDFs</h4>
                    <p className="text-gray-600">Students can annotate worksheets with pen, highlighter, and text</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Interactive Quizzes</h4>
                    <p className="text-gray-600">Create multiple choice, short answer, and long answer questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Smart Helpers</h4>
                    <p className="text-gray-600">AI-powered hints for students and grading help for tutors</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Instant Updates</h4>
                    <p className="text-gray-600">Real-time notifications keep everyone in the loop</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">5</div>
                  <div className="text-gray-700 text-lg">Different user types supported</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">6+</div>
                  <div className="text-gray-700 text-lg">Question types for worksheets</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-gray-700 text-lg">Access from anywhere</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="h-6 w-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
            "eSlate has transformed how we run our education provider. Parents love the updates, students find it easy to use, and our tutors save hours every week."
          </p>
          <p className="text-white/80">
            - Happy Centre Manager
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Join education providers using eSlate to manage learning better
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 shadow-xl shadow-blue-500/25">
              Sign In Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">eSlate</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/agreement" className="text-gray-400 hover:text-white transition-colors">
                User Agreement
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} eSlate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
