import { useState, useEffect } from "react";
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
  Sun,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
  PenTool,
  ClipboardCheck,
  Bell,
  Video,
  Lightbulb,
  UserCheck,
  Settings,
  FolderOpen,
  Award
} from "lucide-react";

const studentParentFeatures = [
  {
    id: 1,
    title: "Dashboard Overview",
    description: "Students see all their assignments, upcoming deadlines, and progress at a glance. Parents can monitor their child's learning journey.",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
    features: ["Assignment tracking", "Due date reminders", "Progress overview"]
  },
  {
    id: 2,
    title: "Complete Worksheets",
    description: "Interactive worksheets with multiple question types. Students answer directly in the app with instant feedback on their work.",
    icon: FileText,
    color: "from-purple-500 to-purple-600",
    features: ["Multiple choice", "Short & long answers", "Auto-save progress"]
  },
  {
    id: 3,
    title: "Annotate PDFs",
    description: "Write directly on PDF assignments using pen, highlighter, and text tools. Perfect for showing your working on e-ink tablets.",
    icon: PenTool,
    color: "from-pink-500 to-pink-600",
    features: ["Pen & highlighter", "Text annotations", "E-ink optimised"]
  },
  {
    id: 4,
    title: "Watch Solution Videos",
    description: "After submission, students can watch tutor-provided solution videos to understand concepts better and learn from mistakes.",
    icon: Video,
    color: "from-red-500 to-red-600",
    features: ["Step-by-step solutions", "Learn from mistakes", "Tutor explanations"]
  },
  {
    id: 5,
    title: "Get Smart Hints",
    description: "Stuck on a problem? AI-powered hints guide students toward the answer without giving it away. Parents can control hint access.",
    icon: Lightbulb,
    color: "from-amber-500 to-amber-600",
    features: ["Progressive hints", "Parent controls", "Encourages thinking"]
  },
  {
    id: 6,
    title: "Real-time Messages",
    description: "Stay connected with tutors through instant messaging. Ask questions, get feedback, and never miss important updates.",
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
    features: ["Direct tutor chat", "Instant notifications", "File sharing"]
  }
];

const providerTutorFeatures = [
  {
    id: 1,
    title: "Student Management",
    description: "Centre managers have complete oversight of all students, tutors, and classes. Easily organise and track your entire education provider.",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    features: ["Student profiles", "Class organisation", "Tutor assignments"]
  },
  {
    id: 2,
    title: "Create Worksheets",
    description: "Build interactive worksheets with our easy editor. Add multiple choice, short answer, essay questions, and rich formatting.",
    icon: ClipboardCheck,
    color: "from-purple-500 to-purple-600",
    features: ["6+ question types", "Rich text editor", "Page organisation"]
  },
  {
    id: 3,
    title: "Assign & Track",
    description: "Assign work to individual students or entire classes. Track who's submitted, who's late, and who needs a reminder.",
    icon: FolderOpen,
    color: "from-pink-500 to-pink-600",
    features: ["Bulk assignments", "Deadline tracking", "Submission status"]
  },
  {
    id: 4,
    title: "Grade with AI Help",
    description: "Review student work with AI-assisted grading suggestions. Mark PDFs with ticks, crosses, and comments. Save hours every week.",
    icon: Award,
    color: "from-amber-500 to-amber-600",
    features: ["AI grading assist", "Annotation tools", "Feedback comments"]
  },
  {
    id: 5,
    title: "Student Reports",
    description: "Tutors and centre managers create detailed progress reports for students and parents. Track improvement over time.",
    icon: FileText,
    color: "from-green-500 to-green-600",
    features: ["Progress tracking", "Performance insights", "Parent sharing"]
  },
  {
    id: 6,
    title: "Calendar & Attendance",
    description: "Manage class schedules, track attendance, and keep everyone organised. Students and parents see their upcoming classes.",
    icon: Calendar,
    color: "from-cyan-500 to-cyan-600",
    features: ["Class scheduling", "Attendance tracking", "Holiday management"]
  }
];

function FeatureCarousel({ 
  features, 
  title, 
  subtitle, 
  gradientFrom, 
  gradientTo 
}: { 
  features: typeof studentParentFeatures;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const currentFeature = features[currentIndex];
  const IconComponent = currentFeature.icon;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-white`}>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/80">{subtitle}</p>
      </div>
      
      <div className="p-8">
        <div className="flex items-start gap-6 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${currentFeature.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{currentFeature.title}</h4>
            <p className="text-gray-600 leading-relaxed">{currentFeature.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {currentFeature.features.map((feature, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-gray-600" /> : <Play className="h-4 w-4 text-gray-600" />}
            </button>
            <button onClick={goToPrev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button onClick={goToNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-2">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-gray-800 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <div className="flex items-center gap-6">
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Contact Us
              </Link>
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
            <span className="text-sm font-medium text-gray-600">Where learning meets simplicity</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Reimagining education</span>
            {" "}for the next generation.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Building the future of education — combining trusted teaching principles with modern technology to help educators manage students, track progress, and deliver engaging learning at scale.
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
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-slate-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full mb-6">
              <Monitor className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Our Unique Focus</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Purpose-Built for <span className="text-cyan-400">E-ink Learning</span>
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              While others adapt their apps for e-ink, we built eSlate specifically for it. 
              Every feature is designed to work perfectly on e-ink displays.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Easy on Eyes</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pure black and white design eliminates eye strain. Students can study for hours without fatigue.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Optimised Speed</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No flashy animations or transitions. Every interaction is tuned for e-ink refresh rates.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <Battery className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">All-Day Battery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lightweight design means your e-ink tablet lasts all day on a single charge.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Any Lighting</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                High-contrast display works beautifully in bright sunlight or dim classrooms.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Optimised for E-ink Tablets
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Every button, every text field, every layout is designed with e-ink displays in mind. 
                  Students get a distraction-free learning environment that feels natural on any screen size.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">Compact, readable layouts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">Large touch targets</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">Stylus-friendly annotation</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">Distraction-free interface</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-40 h-56 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg border-4 border-gray-700 shadow-2xl flex items-center justify-center">
                    <div className="text-center p-3">
                      <Monitor className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-700 font-semibold text-xs">E-ink Ready</p>
                    </div>
                  </div>
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

      {/* Interactive Feature Tour Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
              <Play className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Interactive Feature Tour</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See eSlate in Action
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore how different users experience eSlate - from students completing homework to centre managers overseeing everything
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <FeatureCarousel
              features={studentParentFeatures}
              title="For Students & Parents"
              subtitle="Learning made simple and engaging"
              gradientFrom="from-blue-500"
              gradientTo="to-purple-600"
            />
            <FeatureCarousel
              features={providerTutorFeatures}
              title="For Tutors & Centre Managers"
              subtitle="Powerful tools to manage learning"
              gradientFrom="from-purple-500"
              gradientTo="to-pink-600"
            />
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
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
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
