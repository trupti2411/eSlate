import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap,
  BookOpen,
  FileText,
  PenTool,
  Video,
  Lightbulb,
  MessageSquare,
  Users,
  ClipboardCheck,
  FolderOpen,
  Award,
  Calendar,
  BarChart3,
  CheckCircle,
  Check,
  X,
  Pencil,
  Highlighter,
  Type,
  Eraser,
  Play,
  Clock,
  Bell,
  Star,
  Heart
} from "lucide-react";
import { Link } from "wouter";

// Student & Parent Scenes
const studentScenes = [
  {
    id: 1,
    title: "Scene 1: Student Dashboard",
    dialogue: "\"I love how I can see all my homework in one place! The deadlines are so clear.\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "dashboard"
  },
  {
    id: 2,
    title: "Scene 2: Assignment List",
    dialogue: "\"No more forgotten homework! Everything is organised and I know exactly what's due.\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "assignments"
  },
  {
    id: 3,
    title: "Scene 3: Completing Worksheet",
    dialogue: "\"The worksheets are so easy to use. I just type my answers and they save automatically!\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "worksheet"
  },
  {
    id: 4,
    title: "Scene 4: PDF Annotation",
    dialogue: "\"I can write directly on my worksheets with my stylus. It's just like paper but better!\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "pdf-annotation"
  },
  {
    id: 5,
    title: "Scene 5: Getting Hints",
    dialogue: "\"When I'm stuck, the hints help me figure it out without giving away the answer.\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "hints"
  },
  {
    id: 6,
    title: "Scene 6: Solution Videos",
    dialogue: "\"After I submit, I can watch videos that explain how to solve the problems. It really helps!\"",
    speaker: "Emma, Student",
    speakerType: "student",
    mockup: "solution-video"
  },
  {
    id: 7,
    title: "Scene 7: Parent Dashboard",
    dialogue: "\"I can see exactly how Emma is doing. Her progress, attendance, everything in one place.\"",
    speaker: "Sarah, Parent",
    speakerType: "parent",
    mockup: "parent-dashboard"
  },
  {
    id: 8,
    title: "Scene 8: Parent Controls",
    dialogue: "\"I love that I can control the AI hints. It ensures Emma is actually learning, not just getting answers.\"",
    speaker: "Sarah, Parent",
    speakerType: "parent",
    mockup: "parent-controls"
  },
  {
    id: 9,
    title: "Scene 9: Messages",
    dialogue: "\"The messaging feature keeps us connected with Emma's tutors. We never miss important updates.\"",
    speaker: "Sarah, Parent",
    speakerType: "parent",
    mockup: "messages"
  },
  {
    id: 10,
    title: "Scene 10: Happy Family",
    dialogue: "\"eSlate has made learning so much easier for our whole family!\"",
    speaker: "Emma & Sarah",
    speakerType: "both",
    mockup: "happy-ending"
  }
];

// Tutor & Centre Manager Scenes
const providerScenes = [
  {
    id: 1,
    title: "Scene 1: Centre Dashboard",
    dialogue: "\"I can see everything at a glance - students, tutors, assignments. Complete oversight.\"",
    speaker: "James, Centre Manager",
    speakerType: "manager",
    mockup: "centre-dashboard"
  },
  {
    id: 2,
    title: "Scene 2: Student Management",
    dialogue: "\"Managing students has never been easier. All their information, progress, and classes in one place.\"",
    speaker: "James, Centre Manager",
    speakerType: "manager",
    mockup: "student-management"
  },
  {
    id: 3,
    title: "Scene 3: Creating Worksheets",
    dialogue: "\"Creating worksheets is so intuitive. Multiple question types, rich formatting - everything I need.\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "create-worksheet"
  },
  {
    id: 4,
    title: "Scene 4: AI Question Generator",
    dialogue: "\"When I'm short on time, the AI generates questions for me. It saves hours of preparation!\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "ai-questions"
  },
  {
    id: 5,
    title: "Scene 5: Assigning Work",
    dialogue: "\"I can assign work to individuals or whole classes with just a few clicks.\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "assign-work"
  },
  {
    id: 6,
    title: "Scene 6: Tracking Submissions",
    dialogue: "\"I always know who's submitted, who's late, and who needs a reminder.\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "track-submissions"
  },
  {
    id: 7,
    title: "Scene 7: Grading Work",
    dialogue: "\"Marking is so much faster with the annotation tools. Ticks, crosses, comments - all right there.\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "grading"
  },
  {
    id: 8,
    title: "Scene 8: AI Grading Assistant",
    dialogue: "\"The AI grading assistant gives me suggestions for essays. It's like having a teaching assistant!\"",
    speaker: "Lisa, Tutor",
    speakerType: "tutor",
    mockup: "ai-grading"
  },
  {
    id: 9,
    title: "Scene 9: Student Reports",
    dialogue: "\"Creating progress reports used to take hours. Now it's quick and parents love them.\"",
    speaker: "James, Centre Manager",
    speakerType: "manager",
    mockup: "reports"
  },
  {
    id: 10,
    title: "Scene 10: Calendar & Attendance",
    dialogue: "\"Scheduling classes and tracking attendance is seamless. No more spreadsheets!\"",
    speaker: "James, Centre Manager",
    speakerType: "manager",
    mockup: "calendar"
  },
  {
    id: 11,
    title: "Scene 11: Happy Team",
    dialogue: "\"eSlate has transformed how we run our education provider. We save hours every week!\"",
    speaker: "James & Lisa",
    speakerType: "both",
    mockup: "happy-team"
  }
];

// Mock screen components
function DashboardMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">eSlate</span>
        <div className="ml-auto flex gap-2">
          <div className="px-3 py-1 bg-gray-100 rounded text-xs">Dashboard</div>
          <div className="px-3 py-1 bg-white border rounded text-xs">Calendar</div>
          <div className="px-3 py-1 bg-white border rounded text-xs">Assignments</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">2</div>
          <div className="text-xs text-gray-600">Due Soon</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm flex-1">Maths Worksheet - Chapter 5</span>
          <span className="text-xs text-amber-600">Due Tomorrow</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
          <FileText className="h-4 w-4 text-purple-500" />
          <span className="text-sm flex-1">English Essay - Shakespeare</span>
          <span className="text-xs text-gray-500">Due in 3 days</span>
        </div>
      </div>
    </div>
  );
}

function AssignmentsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">My Assignments</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Algebra Worksheet</div>
            <div className="text-xs text-gray-500">Worksheet - 10 questions</div>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Pending</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Physics PDF</div>
            <div className="text-xs text-gray-500">PDF Assignment</div>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Submitted</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">History Quiz</div>
            <div className="text-xs text-gray-500">Graded - 85%</div>
          </div>
          <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">85/100</span>
        </div>
      </div>
    </div>
  );
}

function WorksheetMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h3 className="font-bold text-gray-900">Algebra Worksheet</h3>
        <span className="text-sm text-gray-500">Question 3 of 10</span>
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Solve for x:</div>
        <div className="text-lg font-mono bg-gray-50 p-3 rounded mb-3">2x + 5 = 15</div>
        <div className="text-sm text-gray-600 mb-2">Enter your answer:</div>
        <input 
          type="text" 
          className="w-full p-2 border-2 border-blue-300 rounded-lg" 
          value="x = 5"
          readOnly
        />
      </div>
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Answer saved!</span>
      </div>
    </div>
  );
}

function PDFAnnotationMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <div className="flex gap-1">
          <div className="p-1.5 bg-blue-100 rounded"><Pencil className="h-3 w-3 text-blue-600" /></div>
          <div className="p-1.5 bg-yellow-100 rounded"><Highlighter className="h-3 w-3 text-yellow-600" /></div>
          <div className="p-1.5 bg-gray-100 rounded"><Eraser className="h-3 w-3 text-gray-600" /></div>
          <div className="p-1.5 bg-purple-100 rounded"><Type className="h-3 w-3 text-purple-600" /></div>
        </div>
        <span className="ml-auto text-xs text-gray-500">Page 1 of 3</span>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg min-h-[120px] relative">
        <div className="text-sm mb-2 font-medium">Question 1: Solve the equation</div>
        <div className="font-mono text-sm mb-2">3x - 7 = 14</div>
        <div className="text-blue-600 font-handwriting text-lg absolute bottom-8 left-8">x = 7</div>
        <div className="absolute bottom-4 right-4 bg-yellow-200/50 px-2 py-1 rounded text-xs">
          Working shown
        </div>
      </div>
    </div>
  );
}

function HintsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="mb-3">
        <div className="text-sm font-medium mb-2">Question 5:</div>
        <div className="text-sm mb-3">What is the capital of Australia?</div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-800 text-sm">Hint 1 of 3</span>
        </div>
        <p className="text-sm text-amber-700">
          The capital is not the largest city in Australia. Think about a city that was purpose-built to be the capital.
        </p>
      </div>
      <Button size="sm" variant="outline" className="w-full">
        <Lightbulb className="h-4 w-4 mr-2" />
        Get Another Hint
      </Button>
    </div>
  );
}

function SolutionVideoMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="font-medium text-green-700">Assignment Graded - 92%</span>
      </div>
      <div className="bg-gray-900 rounded-lg p-8 flex flex-col items-center justify-center mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
          <Play className="h-6 w-6 text-white" />
        </div>
        <span className="text-white text-sm">Watch Solution Video</span>
      </div>
      <p className="text-sm text-gray-600 text-center">
        Your tutor has provided a video explaining the solutions
      </p>
    </div>
  );
}

function ParentDashboardMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <Heart className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <div className="font-bold text-gray-900">Emma's Progress</div>
          <div className="text-xs text-gray-500">Parent Dashboard</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-green-600">87%</div>
          <div className="text-xs text-gray-600">Average Score</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-blue-600">95%</div>
          <div className="text-xs text-gray-600">Attendance</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>12 assignments completed this month</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>2 assignments due this week</span>
        </div>
      </div>
    </div>
  );
}

function ParentControlsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-4">AI Hint Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">Enable AI Hints</div>
            <div className="text-xs text-gray-500">Allow Emma to use hints</div>
          </div>
          <div className="w-10 h-6 bg-green-500 rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">Max Hints Per Question</div>
            <div className="text-xs text-gray-500">Limit hint usage</div>
          </div>
          <span className="font-bold">2</span>
        </div>
      </div>
    </div>
  );
}

function MessagesMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Messages</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-purple-600">LT</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-2 flex-1">
            <div className="text-xs text-gray-500 mb-1">Lisa (Tutor)</div>
            <div className="text-sm">Emma did great on her maths test! Keep up the good work.</div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[200px]">
            <div className="text-sm">Thank you! She's been working hard.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HappyEndingMockup({ type }: { type: "student" | "provider" }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg p-6 shadow-lg text-center text-white">
      <div className="flex justify-center gap-1 mb-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        {type === "student" ? "Learning Made Simple" : "Teaching Made Easier"}
      </h3>
      <p className="text-white/80 text-sm">
        {type === "student" 
          ? "eSlate helps families succeed together"
          : "eSlate empowers education providers"
        }
      </p>
    </div>
  );
}

function CentreDashboardMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">eSlate - Centre Manager</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">156</div>
          <div className="text-xs text-gray-600">Students</div>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">12</div>
          <div className="text-xs text-gray-600">Tutors</div>
        </div>
        <div className="bg-green-50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">24</div>
          <div className="text-xs text-gray-600">Classes</div>
        </div>
        <div className="bg-amber-50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-amber-600">89%</div>
          <div className="text-xs text-gray-600">Avg Score</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="px-2 py-1 bg-gray-900 text-white rounded text-xs">Dashboard</div>
        <div className="px-2 py-1 bg-gray-100 rounded text-xs">Students</div>
        <div className="px-2 py-1 bg-gray-100 rounded text-xs">Tutors</div>
        <div className="px-2 py-1 bg-gray-100 rounded text-xs">Assignments</div>
      </div>
    </div>
  );
}

function StudentManagementMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">All Students</h3>
      <div className="space-y-2">
        {["Emma Wilson", "James Chen", "Sophie Taylor"].map((name, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-gray-500">Year 10 - Maths, English</div>
            </div>
            <span className="text-xs text-green-600">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateWorksheetMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Worksheet Editor</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500">QUESTIONS</div>
          <div className="p-2 bg-blue-50 border-l-2 border-blue-500 rounded text-sm">Q1: Multiple Choice</div>
          <div className="p-2 bg-gray-50 rounded text-sm">Q2: Short Answer</div>
          <div className="p-2 bg-gray-50 rounded text-sm">Q3: Essay</div>
          <Button size="sm" className="w-full">+ Add Question</Button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-2">EDITOR</div>
          <input className="w-full p-2 border rounded text-sm mb-2" placeholder="Question text..." />
          <div className="flex gap-1 flex-wrap">
            <span className="px-2 py-0.5 bg-white border rounded text-xs">Bold</span>
            <span className="px-2 py-0.5 bg-white border rounded text-xs">Italic</span>
            <span className="px-2 py-0.5 bg-white border rounded text-xs">Table</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIQuestionsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <span className="font-bold text-gray-900">AI Question Generator</span>
      </div>
      <div className="mb-3">
        <div className="text-sm mb-1">Topic:</div>
        <input className="w-full p-2 border rounded text-sm" value="Quadratic Equations" readOnly />
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-green-700 mb-2">Generated Questions:</div>
        <div className="space-y-1 text-sm text-gray-700">
          <div>1. Solve x² - 5x + 6 = 0</div>
          <div>2. Find the roots of 2x² + 3x - 2 = 0</div>
          <div>3. What is the discriminant of...</div>
        </div>
      </div>
      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600">Add All to Worksheet</Button>
    </div>
  );
}

function AssignWorkMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Assign Worksheet</h3>
      <div className="space-y-3">
        <div>
          <div className="text-sm mb-1">Assign to:</div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Year 10 Maths</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Emma Wilson</span>
          </div>
        </div>
        <div>
          <div className="text-sm mb-1">Due Date:</div>
          <input className="w-full p-2 border rounded text-sm" value="25th January 2026" readOnly />
        </div>
        <Button size="sm" className="w-full">Assign to 8 Students</Button>
      </div>
    </div>
  );
}

function TrackSubmissionsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Submission Status</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm flex-1">Emma Wilson</span>
          <span className="text-xs text-green-600">Submitted</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm flex-1">James Chen</span>
          <span className="text-xs text-amber-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
          <Bell className="h-4 w-4 text-red-600" />
          <span className="text-sm flex-1">Sophie Taylor</span>
          <span className="text-xs text-red-600">Overdue</span>
        </div>
      </div>
    </div>
  );
}

function GradingMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <span className="font-bold text-gray-900">Reviewing: Emma Wilson</span>
        <div className="flex gap-1">
          <div className="p-1 bg-green-100 rounded"><Check className="h-3 w-3 text-green-600" /></div>
          <div className="p-1 bg-red-100 rounded"><X className="h-3 w-3 text-red-600" /></div>
          <div className="p-1 bg-blue-100 rounded"><MessageSquare className="h-3 w-3 text-blue-600" /></div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 rounded mb-3">
        <div className="text-sm font-medium mb-1">Q1: Solve 2x + 5 = 15</div>
        <div className="text-sm text-gray-600 mb-2">Student Answer: x = 5</div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Correct!</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Score:</span>
        <input className="w-16 p-1 border rounded text-center" value="92" readOnly />
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function AIGradingMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-purple-500" />
        <span className="font-bold text-gray-900">AI Grading Assistant</span>
      </div>
      <div className="bg-gray-50 p-3 rounded mb-3">
        <div className="text-xs text-gray-500 mb-1">Essay Question</div>
        <div className="text-sm text-gray-700 line-clamp-2">
          "The student provides a comprehensive analysis of the themes in Macbeth..."
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="text-xs font-medium text-purple-700 mb-2">AI Suggestion:</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Suggested Score:</span>
          <span className="font-bold text-purple-600">78/100</span>
        </div>
        <div className="text-xs text-gray-600">
          "Good analysis but could expand on Lady Macbeth's role..."
        </div>
      </div>
    </div>
  );
}

function ReportsMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Student Report: Emma Wilson</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-green-50 p-2 rounded text-center">
          <div className="text-lg font-bold text-green-600">87%</div>
          <div className="text-xs">Average</div>
        </div>
        <div className="bg-blue-50 p-2 rounded text-center">
          <div className="text-lg font-bold text-blue-600">+12%</div>
          <div className="text-xs">Improvement</div>
        </div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-xs text-gray-500 mb-1">Tutor Notes:</div>
        <div className="text-sm">Excellent progress in algebra. Continue focus on geometry.</div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-3">Class Calendar</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="font-medium text-gray-500">{d}</div>
        ))}
        {[20, 21, 22, 23, 24, 25, 26].map((d, i) => (
          <div key={i} className={`p-1 rounded ${d === 22 ? 'bg-blue-500 text-white' : ''}`}>{d}</div>
        ))}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Year 10 Maths - 3:00 PM</span>
          <span className="ml-auto text-xs text-green-600">8/10</span>
        </div>
      </div>
    </div>
  );
}

// Render the appropriate mockup based on scene
function SceneMockup({ mockup, videoType }: { mockup: string; videoType: "student" | "provider" }) {
  const mockups: Record<string, JSX.Element> = {
    "dashboard": <DashboardMockup />,
    "assignments": <AssignmentsMockup />,
    "worksheet": <WorksheetMockup />,
    "pdf-annotation": <PDFAnnotationMockup />,
    "hints": <HintsMockup />,
    "solution-video": <SolutionVideoMockup />,
    "parent-dashboard": <ParentDashboardMockup />,
    "parent-controls": <ParentControlsMockup />,
    "messages": <MessagesMockup />,
    "happy-ending": <HappyEndingMockup type="student" />,
    "centre-dashboard": <CentreDashboardMockup />,
    "student-management": <StudentManagementMockup />,
    "create-worksheet": <CreateWorksheetMockup />,
    "ai-questions": <AIQuestionsMockup />,
    "assign-work": <AssignWorkMockup />,
    "track-submissions": <TrackSubmissionsMockup />,
    "grading": <GradingMockup />,
    "ai-grading": <AIGradingMockup />,
    "reports": <ReportsMockup />,
    "calendar": <CalendarMockup />,
    "happy-team": <HappyEndingMockup type="provider" />
  };
  
  return mockups[mockup] || <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">Scene mockup</div>;
}

export default function VideoStoryboard() {
  const [activeVideo, setActiveVideo] = useState<"student" | "provider">("student");
  const [currentScene, setCurrentScene] = useState(0);
  
  const scenes = activeVideo === "student" ? studentScenes : providerScenes;
  const scene = scenes[currentScene];

  const goToPrev = () => setCurrentScene((prev) => Math.max(0, prev - 1));
  const goToNext = () => setCurrentScene((prev) => Math.min(scenes.length - 1, prev + 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-gray-800">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Video Storyboard & Script</h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Video Toggle */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => { setActiveVideo("student"); setCurrentScene(0); }}
            className={activeVideo === "student" 
              ? "bg-gradient-to-r from-blue-500 to-purple-600" 
              : "bg-gray-700 hover:bg-gray-600"
            }
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Students & Parents Video
          </Button>
          <Button
            onClick={() => { setActiveVideo("provider"); setCurrentScene(0); }}
            className={activeVideo === "provider" 
              ? "bg-gradient-to-r from-purple-500 to-pink-600" 
              : "bg-gray-700 hover:bg-gray-600"
            }
          >
            <Users className="h-4 w-4 mr-2" />
            Tutors & Centre Managers Video
          </Button>
        </div>

        {/* Scene Display */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mockup Side */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-400">Screen Preview</span>
            </div>
            <div className="transform scale-100">
              <SceneMockup mockup={scene.mockup} videoType={activeVideo} />
            </div>
          </div>

          {/* Script Side */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-400">Scene {currentScene + 1} of {scenes.length}</span>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">{scene.title}</h2>
                
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      scene.speakerType === "student" ? "bg-blue-500" :
                      scene.speakerType === "parent" ? "bg-pink-500" :
                      scene.speakerType === "tutor" ? "bg-purple-500" :
                      scene.speakerType === "manager" ? "bg-amber-500" :
                      "bg-gradient-to-r from-blue-500 to-pink-500"
                    }`}>
                      {scene.speakerType === "student" && <GraduationCap className="h-5 w-5 text-white" />}
                      {scene.speakerType === "parent" && <Heart className="h-5 w-5 text-white" />}
                      {scene.speakerType === "tutor" && <BookOpen className="h-5 w-5 text-white" />}
                      {scene.speakerType === "manager" && <Users className="h-5 w-5 text-white" />}
                      {scene.speakerType === "both" && <Star className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{scene.speaker}</div>
                      <div className="text-xs text-gray-400 capitalize">{scene.speakerType}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-lg text-white italic leading-relaxed">
                      {scene.dialogue}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrev}
                    disabled={currentScene === 0}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {scenes.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentScene(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentScene ? 'bg-white w-4' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNext}
                    disabled={currentScene === scenes.length - 1}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Scenes Overview */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-white mb-4">All Scenes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentScene(idx)}
                className={`p-3 rounded-lg text-left transition-all ${
                  idx === currentScene 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-xs opacity-70">Scene {idx + 1}</div>
                <div className="font-medium text-sm truncate">{s.title.replace(`Scene ${idx + 1}: `, '')}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
