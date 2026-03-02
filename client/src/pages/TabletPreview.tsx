import { useState } from 'react';
import {
  CheckSquare, BookOpen, BarChart2, Bell, LogOut,
  AlertCircle, Check, ChevronRight, Upload, Send,
  User, Clock, FileText, CheckCircle, Eye,
  ClipboardList, PenLine, ChevronLeft
} from 'lucide-react';

type Tab = 'homework' | 'classes' | 'results';
type DemoView = 'student' | 'marking' | 'assignment';

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
            { key: 'student', label: '🎒 Student dashboard' },
            { key: 'assignment', label: '📚 Assignment page' },
            { key: 'marking', label: '✏️ Marking page' },
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
              {view === 'student' && 'Student Dashboard — sidebar navigation, 2-column cards'}
              {view === 'assignment' && 'Assignment Work Page — instructions left, upload right'}
              {view === 'marking' && 'Tutor Marking Page — submission list left, grading right'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">~1024×768</span>
          </div>

          {/* Simulated tablet screen */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '4/3' }}
          >
            {view === 'student' && <StudentTablet tab={tab} setTab={setTab} />}
            {view === 'assignment' && <AssignmentTablet />}
            {view === 'marking' && <MarkingTablet />}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-gray-400 mt-4">
            This is a live interactive preview — click around to try it out. Say "build it" and I'll apply this layout to the real app.
          </p>
        </div>
      </div>
    </div>
  );
}
