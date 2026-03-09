import { useState } from 'react';
import {
  BookOpen, CheckCircle, Clock, FileText, MessageSquare,
  BarChart2, Calendar, Users, Zap, TrendingDown, Printer,
  UserCheck, Star, ArrowRight, Sparkles, PenLine, Bell,
  GraduationCap, Shield, Laptop, ChevronDown, ChevronUp
} from 'lucide-react';

const SAVINGS = [
  {
    icon: Printer,
    label: 'Printing & Materials',
    before: '£1,500–£3,000 / year',
    after: '£0',
    detail: 'Assignments, worksheets and feedback sheets are all digital. No printer cartridges, paper, or laminating.',
    saving: '100% saving',
    color: 'bg-rose-50 border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Clock,
    label: 'Admin & Scheduling',
    before: '10+ hours / week',
    after: '~2 hours / week',
    detail: 'Attendance, scheduling, progress tracking and parent updates are automated — no spreadsheets or manual records.',
    saving: '~8 hrs/week saved',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    icon: PenLine,
    label: 'Marking & Feedback',
    before: '15+ hours / week',
    after: '~6 hours / week',
    detail: 'AI-assisted grading suggests scores and feedback drafts. Tutors review and approve — not start from scratch.',
    saving: '~60% time reduction',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    icon: MessageSquare,
    label: 'Parent Communication',
    before: '5+ hours / week',
    after: 'Built in — zero overhead',
    detail: 'Messaging, progress updates and assignment status are visible to parents in real time — no WhatsApp chasing.',
    saving: 'Full elimination',
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    icon: UserCheck,
    label: 'Tutor Resourcing',
    before: 'Higher headcount needed',
    after: 'Same team, more students',
    detail: 'AI tools, automated tracking and digital workflows let each tutor handle more students without burnout.',
    saving: 'Scale without hiring',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Homework & Assignment Management',
    desc: 'Create, assign and track homework digitally. Set due dates, attach PDFs or worksheets, and see submission status in real time — all from one screen.',
    color: 'indigo',
    mockup: <AssignmentMockup />,
  },
  {
    icon: PenLine,
    title: 'PDF Annotation — No Printing Required',
    desc: 'Students annotate assignment PDFs directly on their device using a stylus or finger. Work is submitted digitally, marked digitally, and stored securely.',
    color: 'teal',
    mockup: <PDFMockup />,
  },
  {
    icon: Sparkles,
    title: 'AI Grading Assistant',
    desc: 'For essay and short-answer questions, the AI suggests a score and draft feedback based on the student\'s response. Tutors review and approve — slashing marking time.',
    color: 'purple',
    mockup: <GradingMockup />,
  },
  {
    icon: Zap,
    title: 'AI Question Generator',
    desc: 'Generate a full set of questions on any topic in seconds. The AI creates varied question types — multiple choice, short answer, fill in the blank — ready to publish as a worksheet.',
    color: 'amber',
    mockup: <WorksheetMockup />,
  },
  {
    icon: MessageSquare,
    title: 'Unified Messaging',
    desc: 'Students, parents and tutors communicate through one secure platform. No more WhatsApp groups, missed emails or lost messages.',
    color: 'rose',
    mockup: <MessagingMockup />,
  },
  {
    icon: BarChart2,
    title: 'Progress Reports & Analytics',
    desc: 'Live dashboards show every student\'s homework completion rate, scores and attendance — visible to tutors, parents and the company admin.',
    color: 'green',
    mockup: <ProgressMockup />,
  },
  {
    icon: Calendar,
    title: 'Calendar & Attendance',
    desc: 'Digital roll-call at the start of every session. Attendance records are stored automatically, and parents can see summaries in their dashboard.',
    color: 'blue',
    mockup: <CalendarMockup />,
  },
  {
    icon: Users,
    title: 'Multi-Role Platform',
    desc: 'One system for your whole operation — Company Admin, Tutors, Students and Parents each have their own tailored dashboard and permissions.',
    color: 'slate',
    mockup: <RolesMockup />,
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50' },
  teal:   { bg: 'bg-teal-600',   text: 'text-teal-700',   border: 'border-teal-200',   light: 'bg-teal-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' },
  amber:  { bg: 'bg-amber-500',  text: 'text-amber-700',  border: 'border-amber-200',  light: 'bg-amber-50' },
  rose:   { bg: 'bg-rose-600',   text: 'text-rose-700',   border: 'border-rose-200',   light: 'bg-rose-50' },
  green:  { bg: 'bg-green-600',  text: 'text-green-700',  border: 'border-green-200',  light: 'bg-green-50' },
  blue:   { bg: 'bg-blue-600',   text: 'text-blue-700',   border: 'border-blue-200',   light: 'bg-blue-50' },
  slate:  { bg: 'bg-slate-700',  text: 'text-slate-700',  border: 'border-slate-200',  light: 'bg-slate-50' },
};

function AssignmentMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-indigo-600 text-white px-3 py-2 flex items-center gap-2">
        <BookOpen className="h-3 w-3" /> <span className="font-semibold">Assignment Management</span>
      </div>
      <div className="p-3 space-y-2">
        {[
          { name: 'Year 6 Maths — Fractions', due: 'Due Mon', status: 'bg-green-100 text-green-700', label: '12/14 submitted' },
          { name: 'English Writing Prompts', due: 'Due Wed', status: 'bg-amber-100 text-amber-700', label: '5/14 submitted' },
          { name: 'Science: Forces Quiz', due: 'Due Fri', status: 'bg-blue-100 text-blue-700', label: 'Assigned' },
        ].map((a, i) => (
          <div key={i} className="flex items-center justify-between border border-gray-100 rounded px-2 py-1.5">
            <div>
              <div className="font-medium text-gray-800">{a.name}</div>
              <div className="text-gray-400">{a.due}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status}`}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PDFMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-teal-600 text-white px-3 py-2 flex items-center gap-2">
        <PenLine className="h-3 w-3" /> <span className="font-semibold">PDF Annotator</span>
        <div className="ml-auto flex gap-1.5">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Eraser</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Save</span>
          <span className="bg-white px-2 py-0.5 rounded text-teal-700 font-semibold text-[10px]">Submit</span>
        </div>
      </div>
      <div className="flex gap-0">
        <div className="flex-1 bg-gray-50 p-2 border-r border-gray-200">
          <div className="text-[10px] text-gray-500 mb-1">Assignment</div>
          <div className="h-2 bg-gray-200 rounded mb-1 w-4/5" />
          <div className="h-2 bg-gray-200 rounded mb-1 w-3/5" />
          <div className="h-2 bg-gray-200 rounded mb-1 w-4/5" />
          <div className="h-2 bg-gray-200 rounded mb-3 w-2/5" />
          <div className="text-[10px] text-gray-400 italic">Writing mode: stylus auto-detected</div>
        </div>
        <div className="flex-1 bg-white p-2 relative">
          <div className="text-[10px] text-gray-500 mb-1">Student work</div>
          <svg viewBox="0 0 80 50" className="w-full h-12">
            <path d="M5,20 Q15,10 25,22 Q35,34 45,18 Q55,8 70,20" stroke="#4f46e5" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5,35 Q20,28 40,35 Q55,40 70,33" stroke="#4f46e5" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="text-[10px] text-teal-600 font-medium">✓ Submitted digitally</div>
        </div>
      </div>
    </div>
  );
}

function GradingMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-purple-600 text-white px-3 py-2 flex items-center gap-2">
        <Sparkles className="h-3 w-3" /> <span className="font-semibold">AI Grading Assistant</span>
      </div>
      <div className="p-3">
        <div className="text-gray-500 text-[10px] mb-1">Student response:</div>
        <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2 text-gray-700 text-[10px] leading-relaxed">
          "Forces can be pushes or pulls. A contact force needs touching..."
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span className="text-purple-700 font-semibold text-[10px]">AI Suggestion</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="text-[10px] text-gray-600">Score:</span>
            <span className="text-[10px] font-bold text-purple-700">16 / 20</span>
          </div>
          <div className="text-[10px] text-gray-600 leading-relaxed">"Good understanding of contact vs non-contact forces. Add examples to score full marks."</div>
          <div className="flex gap-1.5 mt-2">
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px]">Accept</span>
            <span className="border border-purple-300 text-purple-700 px-2 py-0.5 rounded text-[10px]">Edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorksheetMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-amber-500 text-white px-3 py-2 flex items-center gap-2">
        <Zap className="h-3 w-3" /> <span className="font-semibold">AI Question Generator</span>
      </div>
      <div className="p-3">
        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2">
          <div className="text-[10px] text-amber-700 font-semibold mb-1">Topic: Year 6 Fractions</div>
          <div className="flex gap-1.5">
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px]">Generate 5 Questions</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {['What is ½ + ¼?', 'Simplify 6/8 to its lowest terms.', 'Order these fractions: ⅔, ½, ¾'].map((q, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-gray-50 border border-gray-100 rounded p-1.5">
              <span className="text-amber-600 font-bold text-[10px]">{i + 1}.</span>
              <span className="text-gray-700 text-[10px]">{q}</span>
            </div>
          ))}
          <div className="text-[10px] text-gray-400 italic">+ 2 more generated...</div>
        </div>
      </div>
    </div>
  );
}

function MessagingMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-rose-600 text-white px-3 py-2 flex items-center gap-2">
        <MessageSquare className="h-3 w-3" /> <span className="font-semibold">Messages</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">P</div>
          <div className="bg-gray-100 rounded-lg px-2 py-1.5 flex-1">
            <div className="text-[10px] font-semibold text-gray-700">Parent (Mrs. Ahmed)</div>
            <div className="text-[10px] text-gray-600">How did Sara do on the maths test?</div>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-700 flex-shrink-0">T</div>
          <div className="bg-rose-50 rounded-lg px-2 py-1.5 flex-1">
            <div className="text-[10px] font-semibold text-rose-700">Tutor (Mr. Khan)</div>
            <div className="text-[10px] text-gray-600">She scored 18/20 — excellent improvement!</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">P</div>
          <div className="bg-gray-100 rounded-lg px-2 py-1.5 flex-1">
            <div className="text-[10px] text-gray-600">That's brilliant, thank you!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-green-600 text-white px-3 py-2 flex items-center gap-2">
        <BarChart2 className="h-3 w-3" /> <span className="font-semibold">Student Progress</span>
      </div>
      <div className="p-3 space-y-2">
        {[
          { name: 'Sara Ahmed', sub: 'Maths', score: 90, color: 'bg-green-500' },
          { name: 'James Li', sub: 'English', score: 74, color: 'bg-amber-400' },
          { name: 'Aisha Khan', sub: 'Science', score: 62, color: 'bg-orange-400' },
        ].map((s, i) => (
          <div key={i}>
            <div className="flex justify-between mb-0.5">
              <span className="text-gray-700 font-medium">{s.name}</span>
              <span className="text-gray-500">{s.sub} · {s.score}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }} />
            </div>
          </div>
        ))}
        <div className="text-[10px] text-gray-400 mt-1">Updated in real time · Visible to parents</div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-blue-600 text-white px-3 py-2 flex items-center gap-2">
        <Calendar className="h-3 w-3" /> <span className="font-semibold">Attendance & Calendar</span>
      </div>
      <div className="p-3">
        <div className="text-[10px] text-gray-500 font-semibold mb-1.5">Monday 9 March — Maths Group A</div>
        <div className="space-y-1">
          {[
            { name: 'Sara Ahmed', status: 'Present', color: 'bg-green-100 text-green-700' },
            { name: 'James Li', status: 'Present', color: 'bg-green-100 text-green-700' },
            { name: 'Aisha Khan', status: 'Late', color: 'bg-amber-100 text-amber-700' },
            { name: 'Tom Brady', status: 'Absent', color: 'bg-red-100 text-red-700' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700">{s.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.color}`}>{s.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-blue-600 font-medium">✓ Parents notified automatically</div>
      </div>
    </div>
  );
}

function RolesMockup() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="bg-slate-700 text-white px-3 py-2 flex items-center gap-2">
        <Users className="h-3 w-3" /> <span className="font-semibold">Platform Roles</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {[
          { role: 'Company Admin', icon: Shield, color: 'bg-slate-100 text-slate-700', desc: 'Full oversight, reports, user management' },
          { role: 'Tutor', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700', desc: 'Assignments, marking, messaging' },
          { role: 'Student', icon: BookOpen, color: 'bg-teal-100 text-teal-700', desc: 'Homework, worksheets, hints' },
          { role: 'Parent', icon: Users, color: 'bg-rose-100 text-rose-700', desc: 'Progress, attendance, messaging' },
        ].map((r, i) => (
          <div key={i} className={`rounded p-2 ${r.color}`}>
            <r.icon className="h-3 w-3 mb-1 opacity-70" />
            <div className="font-semibold text-[10px]">{r.role}</div>
            <div className="text-[10px] opacity-70 leading-tight mt-0.5">{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{a}</div>}
    </div>
  );
}

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">eSlate</span>
          <span className="text-xs text-gray-400 ml-1">for Tutoring Companies</span>
        </div>
        <a
          href="/"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Back to App
        </a>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-teal-600 text-white px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span>The digital platform built for tutoring companies</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Run a Smarter<br />Tutoring Business
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            eSlate replaces paper worksheets, WhatsApp groups and manual admin with one secure platform — saving your company thousands of pounds and dozens of hours every year.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              See it live <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-gray-50 border-b border-gray-200 px-6 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '£3,000+', label: 'Saved on printing per year', icon: Printer },
            { value: '8 hrs', label: 'Admin time saved weekly', icon: Clock },
            { value: '60%', label: 'Reduction in marking time', icon: PenLine },
            { value: '4 roles', label: 'One platform for everyone', icon: Users },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center">
              <m.icon className="h-6 w-6 text-indigo-500 mb-2" />
              <div className="text-3xl font-extrabold text-indigo-700">{m.value}</div>
              <div className="text-sm text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Savings Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-3">
              <TrendingDown className="h-4 w-4" /> COST SAVINGS
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Clear, Measurable Savings</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every feature in eSlate was designed to eliminate a real cost from your business. Here's exactly where the savings come from.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SAVINGS.map((s, i) => (
              <div key={i} className={`border rounded-xl p-5 ${s.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <s.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-bold text-gray-800">{s.label}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Before</div>
                    <div className="text-sm font-semibold text-gray-700 line-through">{s.before}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">With eSlate</div>
                    <div className="text-sm font-bold text-gray-900">{s.after}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{s.detail}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badge}`}>{s.saving}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-indigo-700 text-white rounded-2xl p-6 text-center">
            <div className="text-2xl font-extrabold mb-1">Total potential saving: £5,000–£10,000+ per year</div>
            <div className="text-indigo-200 text-sm">Based on an average tutoring company with 5 tutors and 50–100 students</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm mb-3">
              <Star className="h-4 w-4" /> FEATURES
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything Your Company Needs</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              eSlate covers every part of your tutoring workflow — from creating a worksheet to delivering feedback to a parent.
            </p>
          </div>
          <div className="space-y-10">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col md:flex-row ${isEven ? '' : 'md:flex-row-reverse'} gap-8 items-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm`}>
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 ${c.light} ${c.text} text-sm font-semibold px-3 py-1 rounded-full mb-4`}>
                      <f.icon className="h-4 w-4" />
                      Feature
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="w-full md:w-72 flex-shrink-0">
                    {f.mockup}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Optimised for E-Ink */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-slate-600 font-semibold text-sm mb-3">
              <Laptop className="h-4 w-4" /> DEVICE SUPPORT
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Built for Any Device</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              eSlate is optimised for <strong>e-ink tablets</strong> (such as the ONYX Air 3C) for a natural, paper-like writing experience — and works equally well on iPads, Android tablets and desktop browsers.
            </p>
            <ul className="space-y-2">
              {[
                'Stylus auto-detected — write without pressing any buttons',
                'Finger scroll and pinch-to-zoom built in',
                'High-contrast display optimised for e-ink screens',
                'Works offline for student work, syncs when connected',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 w-64">
            <div className="bg-gray-900 rounded-2xl p-3 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="bg-indigo-600 px-3 py-2 text-white text-xs font-semibold flex items-center gap-1">
                  <PenLine className="h-3 w-3" /> eSlate · Writing mode
                </div>
                <div className="p-3 bg-gray-50">
                  <div className="h-2 bg-gray-200 rounded mb-1.5 w-4/5" />
                  <div className="h-2 bg-gray-200 rounded mb-1.5 w-3/5" />
                  <div className="h-2 bg-gray-200 rounded mb-3 w-4/5" />
                  <svg viewBox="0 0 100 40" className="w-full h-10">
                    <path d="M5,25 Q20,10 35,22 Q50,34 65,15 Q80,5 95,20" stroke="#4f46e5" fill="none" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div className="text-[9px] text-teal-600 font-medium mt-1">✓ Stylus detected automatically</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-6 py-12 bg-indigo-50 border-t border-indigo-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-3">
            <Shield className="h-4 w-4" /> SECURITY & COMPLIANCE
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Secure by Design</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Student data is protected at every level. eSlate is built with schools and tutoring companies in mind.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Role-Based Permissions', desc: 'Students only see their own work. Parents see their child. Admins control everything.' },
              { label: 'Rate-Limited Login', desc: 'Accounts lock after repeated failed attempts — protection against brute force.' },
              { label: 'Audit Logging', desc: 'Every mutating action is logged with user, IP and timestamp for compliance.' },
              { label: 'Secure File Storage', desc: 'All uploaded files are stored in private cloud storage — never publicly accessible.' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-indigo-100 text-left">
                <CheckCircle className="h-5 w-5 text-indigo-500 mb-2" />
                <div className="font-semibold text-gray-800 text-sm mb-1">{s.label}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Common Questions</h2>
          <div className="space-y-3">
            <FAQItem
              q="Do students need a special device?"
              a="No. eSlate works in any modern web browser — Chrome, Safari, Edge. It's optimised for e-ink tablets like the ONYX Air 3C for the best writing experience, but students can also use iPads, Android tablets or a desktop."
            />
            <FAQItem
              q="How does PDF annotation work without printing?"
              a="Tutors attach a PDF to an assignment. Students open it on their device and write directly on it using a stylus (or their finger). When finished, they submit digitally. The tutor sees the annotated work in their marking queue."
            />
            <FAQItem
              q="Can parents see their child's progress?"
              a="Yes. Parents have their own dashboard showing their child's homework status, scores, attendance, and tutor messages — all in real time."
            />
            <FAQItem
              q="How does the AI grading work?"
              a="For short-answer and essay questions, the AI reads the student's response and suggests a score and a feedback comment. The tutor sees this suggestion and can accept, edit, or ignore it. The AI never submits grades — tutors are always in control."
            />
            <FAQItem
              q="Is our student data safe?"
              a="Yes. All data is stored in a private PostgreSQL database and files in private cloud storage. No student data is shared publicly or used to train AI models. Role-based access ensures students only see their own work."
            />
            <FAQItem
              q="How quickly can we get started?"
              a="Setup takes minutes. Create your company account, add your tutors and students, and you're ready to assign your first piece of homework. No installation required."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-700 to-teal-600 text-white px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <Bell className="h-10 w-10 mx-auto mb-4 text-indigo-200" />
          <h2 className="text-3xl font-extrabold mb-3">Ready to Transform Your Tutoring Business?</h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join tutoring companies already saving time, cutting costs and delivering better outcomes with eSlate.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition-colors"
          >
            Get Started with eSlate <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-6 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <BookOpen className="h-3 w-3 text-white" />
          </div>
          <span className="font-semibold text-white">eSlate</span>
        </div>
        <p>The educational platform built for modern tutoring companies.</p>
      </footer>
    </div>
  );
}
