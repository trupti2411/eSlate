import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, BookOpen, FileText, Calculator, Globe, Beaker } from "lucide-react";

type Status = "pending" | "submitted" | "graded" | "overdue";

interface Homework {
  id: string;
  title: string;
  subject: string;
  subjectIcon: React.ReactNode;
  givenDate: string;
  dueDate: string;
  status: Status;
  grade?: string;
}

interface Week {
  id: string;
  number: number;
  startDate: string;
  endDate: string;
  homework: Homework[];
}

interface Term {
  id: string;
  name: string;
  dateRange: string;
  weeks: Week[];
}

const TERMS: Term[] = [
  {
    id: "t3",
    name: "Term 3",
    dateRange: "Apr 2025 – Jul 2025",
    weeks: [
      {
        id: "w10",
        number: 10,
        startDate: "7 Apr 2025",
        endDate: "11 Apr 2025",
        homework: [
          { id: "h1", title: "Alphabet Tracing A–Z", subject: "English", subjectIcon: <BookOpen className="w-3.5 h-3.5" />, givenDate: "7 Apr", dueDate: "11 Apr", status: "submitted" },
          { id: "h2", title: "Adding 3 Numbers (up to 200)", subject: "Maths", subjectIcon: <Calculator className="w-3.5 h-3.5" />, givenDate: "7 Apr", dueDate: "11 Apr", status: "graded", grade: "8/10" },
          { id: "h3", title: "Reading Comprehension – Unit 5", subject: "English", subjectIcon: <BookOpen className="w-3.5 h-3.5" />, givenDate: "8 Apr", dueDate: "14 Apr", status: "pending" },
        ],
      },
      {
        id: "w9",
        number: 9,
        startDate: "31 Mar 2025",
        endDate: "4 Apr 2025",
        homework: [
          { id: "h4", title: "Word Problems (up to 50)", subject: "Maths", subjectIcon: <Calculator className="w-3.5 h-3.5" />, givenDate: "31 Mar", dueDate: "4 Apr", status: "graded", grade: "9/10" },
          { id: "h5", title: "Science – Plant Life Cycle", subject: "Science", subjectIcon: <Beaker className="w-3.5 h-3.5" />, givenDate: "1 Apr", dueDate: "5 Apr", status: "graded", grade: "7/10" },
          { id: "h6", title: "Geography – Maps & Directions", subject: "Geography", subjectIcon: <Globe className="w-3.5 h-3.5" />, givenDate: "2 Apr", dueDate: "6 Apr", status: "submitted" },
        ],
      },
    ],
  },
  {
    id: "t2",
    name: "Term 2",
    dateRange: "Jan 2025 – Mar 2025",
    weeks: [
      {
        id: "w8",
        number: 8,
        startDate: "24 Mar 2025",
        endDate: "28 Mar 2025",
        homework: [
          { id: "h7", title: "Creative Writing – Short Story", subject: "English", subjectIcon: <FileText className="w-3.5 h-3.5" />, givenDate: "24 Mar", dueDate: "28 Mar", status: "overdue" },
          { id: "h8", title: "Greater Than & Less Than", subject: "Maths", subjectIcon: <Calculator className="w-3.5 h-3.5" />, givenDate: "24 Mar", dueDate: "28 Mar", status: "graded", grade: "10/10" },
        ],
      },
    ],
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  English: "bg-blue-50 text-blue-700 border-blue-200",
  Maths: "bg-purple-50 text-purple-700 border-purple-200",
  Science: "bg-green-50 text-green-700 border-green-200",
  Geography: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatusBadge({ status, grade }: { status: Status; grade?: string }) {
  if (status === "graded") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
          {grade}
        </span>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
          Graded
        </span>
      </div>
    );
  }
  if (status === "submitted") {
    return (
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
        Submitted
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Overdue
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 flex items-center gap-1">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function HomeworkRow({ hw }: { hw: Homework }) {
  const isDone = hw.status === "submitted" || hw.status === "graded";
  const subjectColor = SUBJECT_COLORS[hw.subject] || "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${isDone ? "bg-gray-50/60" : "bg-white hover:bg-blue-50/30"}`}>
      {/* Done indicator */}
      <div className="shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : hw.status === "overdue" ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
      </div>

      {/* Title + subject */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${isDone ? "text-gray-400" : "text-gray-900"}`}>
          {hw.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-1.5 py-0.5 ${subjectColor}`}>
            {hw.subjectIcon}
            {hw.subject}
          </span>
          <span className="text-[10px] text-gray-400">Due {hw.dueDate}</span>
        </div>
      </div>

      {/* Given date box (right side) */}
      <div className="shrink-0 text-right">
        <div className="inline-block border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white shadow-sm text-center min-w-[68px]">
          <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Given</div>
          <div className={`text-xs font-semibold ${isDone ? "text-gray-400" : "text-gray-700"}`}>{hw.givenDate}</div>
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0 ml-1">
        <StatusBadge status={hw.status} grade={hw.grade} />
      </div>
    </div>
  );
}

function WeekSection({ week }: { week: Week }) {
  const [open, setOpen] = useState(week.id === "w10");
  const doneCount = week.homework.filter(h => h.status === "submitted" || h.status === "graded").length;
  const total = week.homework.length;
  const allDone = doneCount === total;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-2 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
          allDone ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${allDone ? "text-gray-400" : "text-gray-800"}`}>
                Week {week.number}
              </span>
              {allDone && (
                <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                  All done
                </span>
              )}
            </div>
            <div className={`text-[11px] font-mono ${allDone ? "text-gray-400" : "text-gray-500"}`}>
              {week.startDate} – {week.endDate}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {week.homework.map(hw => (
              <div
                key={hw.id}
                className={`w-2 h-2 rounded-full ${
                  hw.status === "graded" ? "bg-indigo-500" :
                  hw.status === "submitted" ? "bg-emerald-400" :
                  hw.status === "overdue" ? "bg-red-400" :
                  "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">
            {doneCount}/{total} done
          </span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {week.homework.map(hw => (
            <HomeworkRow key={hw.id} hw={hw} />
          ))}
        </div>
      )}
    </div>
  );
}

function TermSection({ term }: { term: Term }) {
  const [open, setOpen] = useState(term.id === "t3");
  const allHw = term.weeks.flatMap(w => w.homework);
  const doneCount = allHw.filter(h => h.status === "submitted" || h.status === "graded").length;
  const total = allHw.length;

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white rounded-xl mb-2 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div className="text-left">
            <div className="text-sm font-bold">{term.name}</div>
            <div className="text-[11px] text-gray-400">{term.dateRange}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{doneCount}/{total}</span>
        </div>
      </button>

      {open && (
        <div className="pl-3">
          {term.weeks.map(week => (
            <WeekSection key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeworkList() {
  return (
    <div className="min-h-screen bg-gray-50 p-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Homework</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organised by term and week</p>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-5 text-[11px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Graded</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Submitted</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Overdue</span>
        </div>

        {/* Terms */}
        {TERMS.map(term => (
          <TermSection key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
}
