import { useState } from 'react';
import {
  CheckSquare, BookOpen, BarChart2, Bell, LogOut,
  AlertCircle, Check, ChevronRight, Upload, Send,
  User, Clock, FileText, CheckCircle, Eye,
  ClipboardList, PenLine, ChevronLeft, Pen,
  Highlighter, Eraser, Type, Undo2, Save, Paperclip
} from 'lucide-react';

type Tab = 'homework' | 'classes' | 'results';
type DemoView = 'student' | 'marking' | 'assignment' | 'flow' | 'pdf-flow';

const SAMPLE_HOMEWORK = [
  { id: 1, title: 'Algebra — Quadratic Equations', subject: 'Maths', due: 'Tomorrow', kind: 'assignment', status: 'overdue' },
  { id: 2, title: 'Shakespeare Essay Draft', subject: 'English', due: 'Mon 10 Mar', kind: 'assignment', status: 'pending' },
  { id: 3, title: 'Periodic Table Quiz', subject: 'Chemistry', due: 'Wed 12 Mar', kind: 'worksheet', status: 'pending' },
  { id: 4, title: 'Fractions Practice', subject: 'Maths', due: 'Submitted', kind: 'worksheet', status: 'done' },
  { id: 5, title: 'Reading Comprehension', subject: 'English', due: 'Submitted', kind: 'assignment', status: 'done' },
];

const SAMPLE_CLASSES = [
  { id: 1, name: 'Year 5 Maths', subject: 'Mathematics', days: 'Mon, Wed', time: '4:00 – 5:00 PM' },
  { id: 2, name: 'Year 5 English', subject: 'English', days: 'Tue, Thu', time: '3:30 – 4:30 PM' },
  { id: 3, name: 'Year 5 Science', subject: 'Chemistry', days: 'Fri', time: '4:00 – 5:30 PM' },
];

const SAMPLE_RESULTS = [
  { id: 1, title: 'Fractions Practice', score: 18, max: 20, feedback: 'Excellent work! Just review improper fractions.', date: '28 Feb' },
  { id: 2, title: 'Reading Comprehension', score: 15, max: 20, feedback: 'Good effort. Try to support answers with quotes from the text.', date: '21 Feb' },
];

const SAMPLE_SUBMISSIONS = [
  { id: 1, student: 'Jacob Chen', assignment: 'Algebra — Quadratic Equations', subject: 'Maths', submitted: '2h ago', fileCount: 2 },
  { id: 2, student: 'Sophie Williams', assignment: 'Shakespeare Essay Draft', subject: 'English', submitted: '4h ago', fileCount: 1 },
  { id: 3, student: 'Oliver Brown', assignment: 'Periodic Table Quiz', subject: 'Chemistry', submitted: '1d ago', fileCount: 3 },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'overdue') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Overdue</span>;
  if (status === 'pending') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Done</span>;
}

/* ── STUDENT DASHBOARD ── */
function StudentTablet({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const overdue = SAMPLE_HOMEWORK.filter(h => h.status === 'overdue');
  const pending = SAMPLE_HOMEWORK.filter(h => h.status === 'pending');
  const done = SAMPLE_HOMEWORK.filter(h => h.status === 'done');
  const allWork = SAMPLE_HOMEWORK;
  const donePct = Math.round((done.length / allWork.length) * 100);

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
      {/* Sidebar */}
      <div className="w-52 bg-indigo-600 flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm font-black">eS</span>
            </div>
            <span className="font-black text-white text-base">eSlate</span>
          </div>
          <p className="text-xs text-indigo-300 pl-10">Oliver · Year 5</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {([
            { key: 'homework', label: 'Homework', icon: CheckSquare },
            { key: 'classes', label: 'My Classes', icon: BookOpen },
            { key: 'results', label: 'Results', icon: BarChart2 },
          ] as { key: Tab; label: string; icon: any }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.key === 'homework' && overdue.length > 0 && (
                <span className="ml-auto text-xs font-black bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {overdue.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">
            <Bell size={15} /> Alerts
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'homework' && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-gray-900">Homework</h2>
              <p className="text-sm text-gray-500 mt-0.5">Here's what's on your plate</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: overdue.length, l: 'Overdue', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                { n: pending.length, l: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                { n: done.length, l: 'Done', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
              ].map(s => (
                <div key={s.l} className={`rounded-2xl border ${s.bg} ${s.border} p-4 text-center`}>
                  <p className={`text-3xl font-black ${s.text}`}>{s.n}</p>
                  <p className={`text-xs font-bold mt-0.5 ${s.text}`}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Term progress</span>
                <span className="text-xs font-bold text-gray-700">{done.length} / {allWork.length} complete</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${donePct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{donePct}% submitted this term</p>
            </div>

            {/* Two-column list on tablet */}
            <div className="grid grid-cols-2 gap-3">
              {overdue.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-1.5 bg-red-50">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                      <AlertCircle size={10} /> OVERDUE
                    </p>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                      {a.kind === 'worksheet' ? '📝' : '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.subject}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
              {pending.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                    {a.kind === 'worksheet' ? '📝' : '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.due}</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))}
              {done.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 opacity-60 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check size={18} className="text-green-600" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500">Submitted</p>
                  </div>
                  <StatusBadge status="done" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'classes' && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900">My Classes</h2>
            <div className="grid grid-cols-2 gap-4">
              {SAMPLE_CLASSES.map(cls => (
                <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">📖</div>
                    <div>
                      <p className="font-bold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{cls.subject}</p>
                      <p className="text-xs text-gray-400 mt-1">{cls.days} · {cls.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'results' && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900">Results</h2>
            <div className="grid grid-cols-2 gap-4">
              {SAMPLE_RESULTS.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400">Graded {r.date}</p>
                      {r.feedback && <p className="text-sm text-gray-600 mt-2 italic">"{r.feedback}"</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-black text-indigo-700">{r.score}</p>
                      <p className="text-xs text-gray-400">/{r.max}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ASSIGNMENT WORK PAGE (TABLET) ── */
function AssignmentTablet() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
      {/* Left: instructions */}
      <div className="w-2/5 flex flex-col bg-white border-r border-gray-100">
        {/* Nav */}
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft size={16} />
          </div>
          <div>
            <p className="font-black text-sm">Algebra — Quadratics</p>
            <p className="text-xs text-indigo-200">Maths · Due Mon 10 Mar</p>
          </div>
          <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Pending</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Instructions</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Complete questions 1–10 from Chapter 4. Show all working out. 
              You may use graph paper. Take a clear photo or scan and upload below.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-700 mb-1">💡 Hint from tutor</p>
            <p className="text-xs text-amber-700">Remember to use the discriminant (b²−4ac) to check if real solutions exist before solving.</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-xs font-bold text-indigo-700 mb-1">📎 Resources</p>
            <p className="text-xs text-indigo-600 underline cursor-pointer">Chapter 4 Notes.pdf</p>
          </div>
        </div>
      </div>

      {/* Right: upload + submit */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-xl font-black text-gray-900">Your work</p>
            <p className="text-sm text-gray-500 mt-0.5">Upload your completed assignment</p>
          </div>

          {!uploaded ? (
            <div
              onClick={() => setUploaded(true)}
              className="rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 p-10 text-center cursor-pointer transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <Upload size={28} className="text-indigo-600" />
              </div>
              <p className="font-black text-gray-800">Tap to upload your work</p>
              <p className="text-xs text-gray-400 mt-1">Photo · PDF · Any file · Up to 5 files</p>
              <div className="mt-3 text-xs text-indigo-600 font-semibold bg-indigo-100 rounded-lg px-3 py-1.5 inline-block">Browse files</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-white rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1">algebra_homework.jpg</span>
                <Eye size={15} className="text-gray-400" />
              </div>
              <div className="bg-white rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1">working_out_page2.jpg</span>
                <Eye size={15} className="text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Note for tutor <span className="normal-case font-normal text-gray-300">(optional)</span></p>
            <textarea
              className="w-full h-20 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400 bg-white"
              placeholder="Any questions or comments…"
            />
          </div>
        </div>

        {/* Submit bar */}
        <div className="bg-white border-t border-gray-100 px-5 py-4">
          <button
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              uploaded
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
            {uploaded ? 'Submit 2 files to tutor' : 'Upload your work first'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MARKING PAGE (TABLET) ── */
function MarkingTablet() {
  const [subIdx, setSubIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const sub = SAMPLE_SUBMISSIONS[subIdx];

  const QUICK = [
    { label: 'Excellent', score: 20, color: 'bg-green-100 text-green-800 border-green-200' },
    { label: 'Good', score: 16, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { label: 'OK', score: 12, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { label: 'Needs work', score: 8, color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
      {/* Left panel: submission list + student info */}
      <div className="w-2/5 flex flex-col bg-white border-r border-gray-100">
        {/* Teal nav */}
        <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <PenLine size={15} />
          </div>
          <div>
            <p className="font-black text-sm">Mark Submissions</p>
            <p className="text-xs text-teal-200">{SAMPLE_SUBMISSIONS.length} pending</p>
          </div>
        </div>

        {/* Submission list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {SAMPLE_SUBMISSIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setSubIdx(i); setScore(null); setFeedback(''); }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                i === subIdx ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{s.student}</p>
                <p className="text-xs text-gray-500 truncate">{s.assignment}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.submitted} · {s.fileCount} file{s.fileCount > 1 ? 's' : ''}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel: grading */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-xl font-black text-gray-900">{sub.student}</p>
            <p className="text-sm text-gray-500">{sub.assignment} · {sub.subject}</p>
          </div>

          {/* Files */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Submitted files</p>
            {Array.from({ length: sub.fileCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 mb-2">
                <FileText size={15} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 flex-1">homework_page{i + 1}.jpg</span>
                <button className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                  <Eye size={12} /> View
                </button>
              </div>
            ))}
          </div>

          {/* Grading */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Grade out of 20</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK.map(q => (
                <button
                  key={q.label}
                  onClick={() => setScore(q.score)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    score === q.score
                      ? `${q.color} ring-2 ring-offset-1 ring-teal-500 scale-105`
                      : `${q.color} hover:scale-105`
                  }`}
                >
                  <span className="block text-lg font-black">{q.score}</span>
                  {q.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 flex-1">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={score ?? ''}
                  onChange={e => setScore(Number(e.target.value))}
                  placeholder="0–20"
                  className="w-full bg-transparent text-gray-900 font-black text-xl focus:outline-none"
                />
                <span className="text-sm text-gray-400 font-semibold">/ 20</span>
              </div>
              {score !== null && (
                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-black">{Math.round(score / 20 * 100)}%</span>
                </div>
              )}
            </div>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Feedback for the student…"
              className="w-full h-20 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
          <button
            onClick={() => setSubIdx(i => Math.max(0, i - 1))}
            disabled={subIdx === 0}
            className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => { setSubIdx(i => Math.min(SAMPLE_SUBMISSIONS.length - 1, i + 1)); setScore(null); setFeedback(''); }}
            disabled={score === null}
            className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              score !== null
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={15} />
            {score !== null ? `Save ${score}/20 & next →` : 'Enter score first'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FULL ASSIGNMENT FLOW ── */
const FLOW_STEPS = [
  { id: 1, label: 'Homework list',    desc: 'Student sees assignments' },
  { id: 2, label: 'Assignment opens', desc: 'Instructions on left' },
  { id: 3, label: 'Upload files',     desc: 'Student picks work to upload' },
  { id: 4, label: 'Ready to submit',  desc: 'Files uploaded, submit active' },
  { id: 5, label: 'Submitted!',       desc: 'Confirmation + back to list' },
];

function AssignmentFlow() {
  const [step, setStep] = useState(1);

  const homework = [
    { id: 1, title: 'Algebra — Quadratic Equations', subject: 'Maths', due: 'Overdue', kind: 'assignment', status: step === 5 ? 'done' : 'overdue', active: step >= 2 && step <= 5 },
    { id: 2, title: 'Shakespeare Essay Draft',        subject: 'English',   due: 'Mon 10 Mar', kind: 'assignment', status: 'pending', active: false },
    { id: 3, title: 'Periodic Table Quiz',           subject: 'Chemistry', due: 'Wed 12 Mar', kind: 'worksheet', status: 'pending', active: false },
    { id: 4, title: 'Fractions Practice',            subject: 'Maths',     due: 'Submitted',  kind: 'worksheet', status: 'done', active: false },
  ];

  const done = homework.filter(h => h.status === 'done' || (h.id === 1 && step === 5)).length;
  const total = homework.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex h-full bg-gray-50">
      {/* ── Left panel: always the sidebar / list ── */}
      <div className="w-52 bg-indigo-600 flex flex-col flex-shrink-0">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">eS</span>
            </div>
            <span className="font-black text-white">eSlate</span>
          </div>
          <p className="text-xs text-indigo-300 pl-9">Oliver · Year 5</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[
            { label: 'Homework', icon: CheckSquare, active: true, badge: step < 5 ? 1 : 0 },
            { label: 'My Classes', icon: BookOpen, active: false },
            { label: 'Results', icon: BarChart2, active: false },
          ].map(t => (
            <div
              key={t.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                t.active ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-300'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.badge ? (
                <span className="ml-auto text-xs font-black bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="px-3 pb-4 text-indigo-300">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"><LogOut size={14} /> Sign out</div>
        </div>
      </div>

      {/* ── Right area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Step 1: Homework list */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Homework</h2>
              <p className="text-sm text-gray-400">Tap an assignment to open it</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Term progress</span>
                <span className="text-xs font-bold text-gray-700">{done} / {total} complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {homework.map(a => (
                <button
                  key={a.id}
                  onClick={() => a.id === 1 && setStep(2)}
                  className={`text-left bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                    a.id === 1 ? 'border-red-300 ring-2 ring-indigo-400 ring-offset-1 hover:shadow-md cursor-pointer' : 'border-gray-100'
                  }`}
                >
                  {a.status === 'overdue' && (
                    <div className="px-3 py-1 bg-red-50 flex items-center gap-1">
                      <AlertCircle size={10} className="text-red-600" />
                      <span className="text-xs font-bold text-red-700">OVERDUE — tap to open</span>
                    </div>
                  )}
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                      {a.kind === 'worksheet' ? '📝' : '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.subject}</p>
                    </div>
                    {a.status === 'done' && <Check size={14} className="text-green-500 flex-shrink-0" strokeWidth={3} />}
                    {a.status === 'overdue' && <ChevronRight size={14} className="text-indigo-500 flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-indigo-500 font-bold animate-pulse">👆 Tap "Algebra — Quadratics" to continue</p>
          </div>
        )}

        {/* Steps 2–4: Split assignment view */}
        {step >= 2 && step <= 4 && (
          <div className="flex flex-1 overflow-hidden">
            {/* Instructions panel */}
            <div className="w-2/5 flex flex-col border-r border-gray-100 bg-white">
              <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center gap-2">
                <button onClick={() => setStep(1)} className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs truncate">Algebra — Quadratic Equations</p>
                  <p className="text-xs text-indigo-200">Maths · Overdue</p>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Instructions</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Complete questions 1–10 from Chapter 4. Show all working out clearly. 
                    Take a clear photo or scan your pages and upload below.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">💡 Tutor hint</p>
                  <p className="text-xs text-amber-700">Use the discriminant (b²−4ac) first to check for real solutions.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                  <p className="text-xs font-bold text-gray-600 mb-1">📎 Resources</p>
                  <p className="text-xs text-indigo-600 underline cursor-pointer">Chapter 4 Notes.pdf</p>
                  <p className="text-xs text-indigo-600 underline cursor-pointer mt-0.5">Formula Sheet.pdf</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-2.5">
                  <p className="text-xs font-bold text-gray-500 mb-0.5">Due date</p>
                  <p className="text-xs font-bold text-red-700">Yesterday — please submit ASAP</p>
                </div>
              </div>
            </div>

            {/* Upload panel */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <p className="text-base font-black text-gray-900">Upload your work</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {step === 2 && 'Tap the area below to pick your files'}
                    {step === 3 && 'Selecting file…'}
                    {step === 4 && '2 files ready — hit Submit!'}
                  </p>
                </div>

                {step === 2 && (
                  <button
                    onClick={() => setStep(3)}
                    className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 p-8 text-center cursor-pointer transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <Upload size={24} className="text-indigo-600" />
                    </div>
                    <p className="font-black text-gray-700 text-sm">Tap to upload your work</p>
                    <p className="text-xs text-gray-400 mt-1">Photo · PDF · Up to 5 files</p>
                    <div className="mt-2 text-xs text-indigo-600 font-bold bg-indigo-100 rounded-lg px-3 py-1 inline-block">Browse files</div>
                  </button>
                )}

                {step === 3 && (
                  <div className="space-y-2">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-indigo-700 mb-2">📂 File picker open…</p>
                      {['algebra_page1.jpg', 'algebra_page2.jpg'].map((f, i) => (
                        <button
                          key={f}
                          onClick={() => setStep(4)}
                          className="w-full flex items-center gap-2 bg-white rounded-xl px-3 py-2 mb-1.5 border border-indigo-100 hover:border-indigo-400 transition-all"
                        >
                          <FileText size={14} className="text-indigo-500" />
                          <span className="text-xs font-semibold text-gray-700 flex-1 text-left">{f}</span>
                          <span className="text-xs text-indigo-500 font-bold">Select</span>
                        </button>
                      ))}
                      <p className="text-center text-xs text-indigo-400 mt-1">👆 Tap a file to select it</p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-2">
                    {['algebra_page1.jpg', 'algebra_page2.jpg'].map((f, i) => (
                      <div key={f} className="bg-white rounded-xl border border-green-200 px-3 py-2.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700">{f}</p>
                          <p className="text-xs text-gray-400">Uploaded ✓</p>
                        </div>
                        <Eye size={13} className="text-gray-400" />
                      </div>
                    ))}
                    <button onClick={() => setStep(3)} className="text-xs text-indigo-500 font-semibold ml-1">+ Add more files</button>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Note for tutor</p>
                      <textarea
                        className="w-full h-14 text-xs border border-gray-200 rounded-xl p-2.5 resize-none focus:outline-none focus:border-indigo-400 bg-white"
                        defaultValue="Sorry for the late submission, I was ill this week."
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit bar */}
              <div className="bg-white border-t border-gray-100 px-4 py-3">
                <button
                  onClick={() => step === 4 && setStep(5)}
                  disabled={step !== 4}
                  className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    step === 4
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={14} />
                  {step === 4 ? 'Submit 2 files to tutor →' : 'Upload your work first'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success + back to list */}
        {step === 5 && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: updated homework list */}
            <div className="w-2/5 overflow-y-auto p-4 space-y-3 border-r border-gray-100 bg-white">
              <p className="text-sm font-black text-gray-700">Homework</p>
              <div className="bg-white rounded-2xl border border-gray-100 px-3 py-2 shadow-sm">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Term progress</span>
                  <span className="text-xs font-bold text-gray-700">2 / 4 done</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: '50%' }} />
                </div>
              </div>
              <div className="space-y-2">
                {homework.map(a => (
                  <div
                    key={a.id}
                    className={`bg-white rounded-xl border px-3 py-2.5 flex items-center gap-2.5 shadow-sm ${
                      a.id === 1 ? 'border-green-200 bg-green-50' : 'border-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.id === 1 || a.status === 'done' ? 'bg-green-100' : 'bg-indigo-100'
                    }`}>
                      {a.id === 1 || a.status === 'done'
                        ? <Check size={14} className="text-green-600" strokeWidth={3} />
                        : <span className="text-sm">{a.kind === 'worksheet' ? '📝' : '📚'}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${a.id === 1 || a.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400">{a.id === 1 ? 'Submitted ✓' : a.due}</p>
                    </div>
                    {a.id === 1 && <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 flex-shrink-0">Done</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: success */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Submitted! 🎉</h2>
              <p className="text-sm text-gray-500 mb-2">Your tutor will mark it soon.</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left max-w-xs mb-6">
                <p className="text-xs font-bold text-green-700 mb-1">What happens next</p>
                <p className="text-xs text-gray-600">Your tutor will review your 2 files and add a grade + feedback. You'll see it in your Results tab.</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <ChevronLeft size={14} /> Back to homework
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PDF / COMPLETE-ONLINE FLOW ── */
const PDF_FLOW_STEPS = [
  { id: 1, label: 'Homework list',     desc: 'PDF assignment visible' },
  { id: 2, label: 'Assignment opens',  desc: 'Attached worksheet shown' },
  { id: 3, label: 'Annotator opens',   desc: 'PDF loads with tools' },
  { id: 4, label: 'Student annotates', desc: 'Writing on PDF' },
  { id: 5, label: 'Submitted!',        desc: 'Annotated PDF sent' },
];

const TOOL_PALETTE = [
  { id: 'pen',    Icon: Pen,         label: 'Pen',    color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'hi',     Icon: Highlighter, label: 'Yellow', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { id: 'erase',  Icon: Eraser,      label: 'Erase',  color: 'text-gray-700',   bg: 'bg-gray-50',   border: 'border-gray-200' },
  { id: 'text',   Icon: Type,        label: 'Text',   color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200' },
];

function SimPDF({ annotated }: { annotated: boolean }) {
  return (
    <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-inner border border-gray-200">
      {/* Fake PDF content */}
      <div className="absolute inset-0 p-4 space-y-2 pointer-events-none">
        <div className="text-center mb-3">
          <p className="text-xs font-black text-gray-800">Year 5 English — Essay Worksheet</p>
          <p className="text-xs text-gray-400">Shakespeare's Use of Language</p>
        </div>
        {[
          { w: 'full', t: 'Read the extract below and answer the questions.' },
          { w: '11/12', t: '' },
          { w: 'full', t: '1.  Identify two examples of personification in the extract.' },
          { w: '3/4',  t: '' },
          { w: '1/2',  t: '' },
          { w: 'full', t: '2.  Explain how Shakespeare creates tension in Act III.' },
          { w: '5/6',  t: '' },
          { w: '2/3',  t: '' },
          { w: 'full', t: '3.  In your own words, describe the character of Macbeth.' },
          { w: '3/4',  t: '' },
          { w: '1/2',  t: '' },
        ].map((l, i) => (
          l.t
            ? <p key={i} className="text-xs text-gray-700 font-semibold">{l.t}</p>
            : <div key={i} className={`h-3 bg-gray-100 rounded w-${l.w}`} />
        ))}
      </div>

      {/* Annotation overlay — only shown when annotated */}
      {annotated && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
          {/* Q1 answer — pen strokes */}
          <path d="M 80 95 Q 90 90 110 93 Q 130 96 150 92 Q 160 90 175 94" stroke="#4338ca" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 80 103 Q 100 100 130 103 Q 155 105 180 102" stroke="#4338ca" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Q1 highlight */}
          <rect x="74" y="62" width="220" height="9" fill="#fde68a" opacity="0.5" rx="2" />
          {/* Q2 answer text */}
          <text x="80" y="155" fontSize="8" fill="#0f766e" fontStyle="italic">Shakespeare uses dramatic irony and short sentences to build tension…</text>
          <text x="80" y="165" fontSize="8" fill="#0f766e" fontStyle="italic">The witches' prophecy creates a sense of inevitable doom.</text>
          {/* Q3 arrow / tick mark */}
          <text x="80" y="215" fontSize="8" fill="#4338ca">Macbeth is ambitious but conflicted — driven by power yet haunted</text>
          <text x="80" y="225" fontSize="8" fill="#4338ca">by guilt. He transforms from hero to tyrant.</text>
          {/* Small check on Q1 */}
          <text x="356" y="75" fontSize="11" fill="#16a34a" fontWeight="bold">✓</text>
        </svg>
      )}
    </div>
  );
}

function PDFFlow() {
  const [step, setStep] = useState(1);
  const [activeTool, setActiveTool] = useState('pen');

  const homework = [
    { id: 1, title: 'Shakespeare Essay Worksheet', subject: 'English', due: 'Tomorrow', kind: 'worksheet', hasPdf: true, status: step === 5 ? 'done' : 'pending' },
    { id: 2, title: 'Algebra — Quadratic Equations', subject: 'Maths', due: 'Overdue', kind: 'assignment', hasPdf: false, status: 'overdue' },
    { id: 3, title: 'Periodic Table Quiz', subject: 'Chemistry', due: 'Wed 12 Mar', kind: 'worksheet', hasPdf: false, status: 'pending' },
    { id: 4, title: 'Fractions Practice', subject: 'Maths', due: 'Done', kind: 'worksheet', hasPdf: false, status: 'done' },
  ];
  const done = homework.filter(h => h.status === 'done').length;

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-52 bg-indigo-600 flex flex-col flex-shrink-0">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">eS</span>
            </div>
            <span className="font-black text-white">eSlate</span>
          </div>
          <p className="text-xs text-indigo-300 pl-9">Oliver · Year 5</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[
            { label: 'Homework', Icon: CheckSquare, active: true },
            { label: 'My Classes', Icon: BookOpen, active: false },
            { label: 'Results', Icon: BarChart2, active: false },
          ].map(t => (
            <div key={t.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${t.active ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-300'}`}>
              <t.Icon size={15} />
              {t.label}
            </div>
          ))}
        </nav>
        <div className="px-3 pb-4 text-indigo-300">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"><LogOut size={14} /> Sign out</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Step 1: Homework list */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Homework</h2>
              <p className="text-sm text-gray-400">Assignments with a PDF can be completed online</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Term progress</span>
                <span className="text-xs font-bold text-gray-700">{done} / {homework.length} complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.round(done / homework.length * 100)}%` }} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {homework.map(a => (
                <button
                  key={a.id}
                  onClick={() => a.id === 1 && setStep(2)}
                  className={`text-left bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                    a.id === 1 ? 'border-indigo-300 ring-2 ring-indigo-400 ring-offset-1 hover:shadow-md cursor-pointer' : 'border-gray-100'
                  }`}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                      {a.kind === 'worksheet' ? '📝' : '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-xs text-gray-900 truncate">{a.title}</p>
                        {a.hasPdf && <Paperclip size={9} className="text-indigo-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400">{a.subject}</p>
                    </div>
                    {a.status === 'done'    && <Check size={14} className="text-green-500 flex-shrink-0" strokeWidth={3} />}
                    {a.status === 'overdue' && <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                    {a.id === 1            && <ChevronRight size={14} className="text-indigo-500 flex-shrink-0" />}
                  </div>
                  {a.id === 1 && (
                    <div className="bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 border-t border-indigo-100 flex items-center gap-1">
                      <Paperclip size={9} /> PDF attached — tap to complete online
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-indigo-500 font-bold animate-pulse">👆 Tap "Shakespeare Essay Worksheet" to open it</p>
          </div>
        )}

        {/* Step 2: Assignment with PDF preview + action buttons */}
        {step === 2 && (
          <div className="flex flex-1 overflow-hidden">
            {/* Instructions */}
            <div className="w-2/5 flex flex-col border-r border-gray-100 bg-white">
              <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center gap-2">
                <button onClick={() => setStep(1)} className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs truncate">Shakespeare Essay Worksheet</p>
                  <p className="text-xs text-indigo-200">English · Due Tomorrow</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Instructions</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Read each question carefully and write your answers directly on the worksheet. 
                  Use full sentences where asked.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">💡 Tip</p>
                  <p className="text-xs text-amber-700">You can use the pen or type — your choice. Use the highlighter to mark key phrases first.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Paperclip size={11} className="text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-700">Attached worksheet</p>
                  </div>
                  <p className="text-xs text-indigo-600">ShakespeareEssay_Y5.pdf</p>
                  <p className="text-xs text-gray-400 mt-0.5">4 pages · 320 KB</p>
                </div>
              </div>
            </div>
            {/* PDF preview + buttons */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-white flex items-center gap-2">
                <p className="text-sm font-black text-gray-800 flex-1">ShakespeareEssay_Y5.pdf</p>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-black px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                >
                  <PenLine size={13} /> Complete Online
                </button>
                <button className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                  <Upload size={12} /> Upload instead
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-3 bg-gray-100">
                <SimPDF annotated={false} />
              </div>
              <p className="text-center text-xs text-indigo-500 font-bold p-2 animate-pulse">👆 Tap "Complete Online" to open the annotator</p>
            </div>
          </div>
        )}

        {/* Steps 3 + 4: PDF annotator */}
        {(step === 3 || step === 4) && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-800">
            {/* Annotator toolbar */}
            <div className="bg-indigo-700 px-3 py-2 flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setStep(2)} className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <ChevronLeft size={13} className="text-white" />
              </button>
              <span className="text-white text-xs font-black flex-1 truncate">ShakespeareEssay_Y5.pdf — Page 1 of 4</span>
              {/* Tools */}
              <div className="flex items-center gap-1 bg-indigo-800 rounded-xl p-1">
                {TOOL_PALETTE.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      activeTool === t.id
                        ? `${t.bg} ${t.color} shadow-sm`
                        : 'text-indigo-300 hover:text-white'
                    }`}
                    title={t.label}
                  >
                    <t.Icon size={13} />
                  </button>
                ))}
                <div className="w-px h-5 bg-indigo-600 mx-1" />
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-300 hover:text-white">
                  <Undo2 size={13} />
                </button>
              </div>
              {/* Colour dots */}
              <div className="flex gap-1">
                {['#4338ca','#dc2626','#16a34a','#000000'].map(c => (
                  <div key={c} className="w-5 h-5 rounded-full border-2 border-white/40 cursor-pointer" style={{ background: c }} />
                ))}
              </div>
              {/* Save/submit */}
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Save size={12} /> Save
              </button>
              <button
                onClick={() => step === 4 && setStep(5)}
                className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition-all ${
                  step === 4
                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-800/40'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <Send size={12} /> {step === 4 ? 'Submit →' : 'Annotate first'}
              </button>
            </div>

            {/* PDF page */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div className="bg-white rounded shadow-2xl overflow-hidden" style={{ height: '100%', aspectRatio: '0.77' }}>
                <SimPDF annotated={step === 4} />
              </div>
            </div>

            {step === 3 && (
              <div className="bg-indigo-900/80 text-center py-1.5">
                <p className="text-xs text-indigo-200 font-bold animate-pulse">✏️ Write answers with your stylus — tap "Save" when done</p>
              </div>
            )}
            {step === 4 && (
              <div className="bg-green-900/80 text-center py-1.5">
                <p className="text-xs text-green-200 font-bold">✅ Saved! Tap "Submit →" to send your work to the tutor</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="flex flex-1 overflow-hidden">
            {/* Updated list */}
            <div className="w-2/5 overflow-y-auto p-4 space-y-3 border-r border-gray-100 bg-white">
              <p className="text-sm font-black text-gray-700">Homework</p>
              <div className="space-y-2">
                {homework.map(a => (
                  <div key={a.id} className={`bg-white rounded-xl border px-3 py-2.5 flex items-center gap-2.5 shadow-sm ${a.id === 1 ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.id === 1 || a.status === 'done' ? 'bg-green-100' : 'bg-indigo-100'}`}>
                      {a.id === 1 || a.status === 'done' ? <Check size={14} className="text-green-600" strokeWidth={3} /> : <span className="text-sm">{a.kind === 'worksheet' ? '📝' : '📚'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${a.id === 1 || a.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{a.title}</p>
                      <p className="text-xs text-gray-400">{a.id === 1 ? 'Submitted ✓' : a.due}</p>
                    </div>
                    {a.id === 1 && <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 flex-shrink-0">Done</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Success */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Submitted! 🎉</h2>
              <p className="text-sm text-gray-500 mb-4">Your annotated worksheet has been sent to your tutor.</p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-left max-w-xs mb-6">
                <p className="text-xs font-bold text-indigo-700 mb-1">📄 Sent: ShakespeareEssay_Y5.pdf</p>
                <p className="text-xs text-gray-600">Your tutor will mark your annotations and give feedback in the Results tab.</p>
              </div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                <ChevronLeft size={14} /> Back to homework
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN PREVIEW PAGE ── */
export default function TabletPreview() {
  const [view, setView] = useState<DemoView>('student');
  const [tab, setTab] = useState<Tab>('homework');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-black">eS</span>
          </div>
          <span className="font-black text-gray-900">eSlate Tablet Design Preview</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500">Showing how the app looks on a 10–13" tablet (landscape)</span>
        <div className="ml-auto flex gap-2">
          {[
            { key: 'flow',       label: '▶ Upload flow' },
            { key: 'pdf-flow',   label: '✏️ Complete online' },
            { key: 'student',    label: '🎒 Dashboard' },
            { key: 'assignment', label: '📚 Assignment page' },
            { key: 'marking',    label: '📋 Marking page' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key as DemoView)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablet frame */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Screen label */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {view === 'flow'       && 'Upload flow — student photographs/scans their work and submits'}
              {view === 'pdf-flow'   && 'Complete Online flow — student writes on PDF with stylus'}
              {view === 'student'    && 'Student Dashboard — sidebar navigation, 2-column cards'}
              {view === 'assignment' && 'Assignment Work Page — instructions left, upload right'}
              {view === 'marking'    && 'Tutor Marking Page — submission list left, grading right'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">~1024×768</span>
          </div>

          {/* Step tracker (flow views only) */}
          {(view === 'flow' || view === 'pdf-flow') && (
            <div className="flex items-center gap-1 mb-3">
              {(view === 'flow' ? FLOW_STEPS : PDF_FLOW_STEPS).map((s, i) => (
                <div key={s.id} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                      s.id < 1 ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}>
                      {s.id}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 text-center leading-tight">{s.label}</p>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="h-px bg-gray-200 flex-1 mb-4" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Simulated tablet screen */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '4/3' }}
          >
            {view === 'flow'       && <AssignmentFlow />}
            {view === 'pdf-flow'   && <PDFFlow />}
            {view === 'student'    && <StudentTablet tab={tab} setTab={setTab} />}
            {view === 'assignment' && <AssignmentTablet />}
            {view === 'marking'    && <MarkingTablet />}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-gray-400 mt-4">
            {(view === 'flow' || view === 'pdf-flow')
              ? 'Interactive walkthrough — tap the highlighted elements to progress through each step.'
              : 'Live interactive preview — click around to try it out. Say "build it" and I\'ll apply this to the real app.'}
          </p>
        </div>
      </div>
    </div>
  );
}
