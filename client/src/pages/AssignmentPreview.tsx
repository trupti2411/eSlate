import { useState } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check, X, Upload, FileText,
  BookOpen, Clock, AlertCircle, CheckCircle, Sparkles, Plus,
  Users, Calendar, ClipboardList, ThumbsUp, ThumbsDown, SkipForward,
  Home, Bell, Star, Zap, PenLine, Paperclip, Send
} from 'lucide-react';

type Flow = 'student-list' | 'student-work' | 'tutor-wizard' | 'tutor-marking';
type WizardStep = 1 | 2 | 3;
type WorkState = 'idle' | 'dragging' | 'uploaded' | 'submitted';

const ASSIGNMENTS = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Mathematics', due: 'Yesterday', status: 'overdue' as const },
  { id: '2', title: 'Reading Comprehension', subject: 'English', due: 'Friday', status: 'pending' as const },
  { id: '3', title: 'Solar System Essay', subject: 'Science', due: 'Next week', status: 'pending' as const },
  { id: '4', title: 'Times Tables Worksheet', subject: 'Mathematics', due: '2 days ago', status: 'done' as const },
  { id: '5', title: 'Book Report', subject: 'English', due: '1 week ago', status: 'done' as const },
];

const TO_MARK = [
  { id: 's1', name: 'Jacob T.', assignment: 'Fractions & Decimals', submitted: '2 hours ago', avatar: 'J', content: 'Q1: 3/4 + 1/4 = 1 whole\nQ2: 0.5 + 0.25 = 0.75\nQ3: 2/5 = 0.4\nQ4: I got confused on this one, I think the answer is 0.6 but not sure.' },
  { id: 's2', name: 'Sophie M.', assignment: 'Fractions & Decimals', submitted: '4 hours ago', avatar: 'S', content: 'Q1: 3/4 + 1/4 = 4/4 = 1\nQ2: 0.5 + 0.25 = 0.75\nQ3: 2/5 = 0.40\nQ4: 3/5 = 0.60' },
  { id: 's3', name: 'Oliver K.', assignment: 'Fractions & Decimals', submitted: 'Yesterday', avatar: 'O', content: 'Q1: 1\nQ2: 0.75\nQ3: 0.4\nQ4: 0.6\nBonus: I also worked out that 1/3 = 0.333...' },
];

function NavBar({ title, onBack, color = 'bg-indigo-600' }: { title: string; onBack: () => void; color?: string }) {
  return (
    <div className={`${color} text-white px-4 py-3 flex items-center gap-3`}>
      <button onClick={onBack} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
        <ArrowLeft size={16} />
      </button>
      <span className="font-black text-sm flex-1">{title}</span>
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">JT</div>
    </div>
  );
}

function Badge({ status }: { status: 'overdue' | 'pending' | 'done' }) {
  const map = {
    overdue: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    done: 'bg-green-100 text-green-700 border-green-200',
  };
  const labels = { overdue: 'Overdue', pending: 'Pending', done: 'Done' };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[status]}`}>{labels[status]}</span>
  );
}

// ─── STUDENT: HOMEWORK LIST ──────────────────────────────────────────────────
function StudentList({ onOpen }: { onOpen: (id: string) => void }) {
  const done = ASSIGNMENTS.filter(a => a.status === 'done').length;
  const total = ASSIGNMENTS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-indigo-600 text-white px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">eS</span>
            </div>
            <span className="font-black text-base">eSlate</span>
            <span className="text-indigo-300 mx-1">·</span>
            <span className="text-sm text-indigo-200">Jacob</span>
          </div>
          <Bell size={16} className="opacity-70" />
        </div>
        <div className="flex gap-1 mb-0">
          {['Homework', 'My Classes', 'Results'].map((t, i) => (
            <button key={t} className={`px-4 py-2.5 text-sm font-bold rounded-t-xl ${i === 0 ? 'bg-gray-50 text-indigo-700' : 'text-indigo-200'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {/* Progress bar — NEW */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">This week's progress</span>
            <span className="text-sm font-black text-indigo-600">{done}/{total} done</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-red-600 font-semibold">1 overdue</span>
            <span className="text-xs text-gray-400">{pct}% complete</span>
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: 1, l: 'Overdue', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
            { n: 2, l: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
            { n: 2, l: 'Done', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
          ].map(s => (
            <div key={s.l} className={`rounded-2xl border ${s.bg} ${s.border} p-3 text-center`}>
              <p className={`text-xl font-black ${s.text}`}>{s.n}</p>
              <p className={`text-xs font-semibold ${s.text}`}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Assignment list */}
        <div className="space-y-2.5">
          {ASSIGNMENTS.map(a => (
            <button
              key={a.id}
              onClick={() => a.status !== 'done' && onOpen(a.id)}
              className={`w-full text-left bg-white rounded-2xl border shadow-sm transition-shadow overflow-hidden ${
                a.status === 'overdue' ? 'border-red-200' : 'border-gray-100'
              } ${a.status !== 'done' ? 'hover:shadow-md active:scale-[0.99]' : 'opacity-55'}`}
            >
              {a.status === 'overdue' && (
                <div className="px-4 py-1 bg-red-50">
                  <p className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertCircle size={10} /> OVERDUE — tap to open</p>
                </div>
              )}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  a.status === 'done' ? 'bg-green-100' : 'bg-indigo-100'
                }`}>
                  {a.status === 'done' ? <Check size={18} className="text-green-600" strokeWidth={3} /> : '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.subject} · {a.status === 'done' ? 'Submitted' : `Due ${a.due}`}</p>
                </div>
                <Badge status={a.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT: WORK PAGE ──────────────────────────────────────────────────────
function StudentWork({ assignment, onBack }: { assignment: typeof ASSIGNMENTS[0]; onBack: () => void }) {
  const [workState, setWorkState] = useState<WorkState>('idle');
  const [notes, setNotes] = useState('');
  const steps: WorkState[] = ['idle', 'dragging', 'uploaded', 'submitted'];

  const advance = () => {
    const idx = steps.indexOf(workState);
    if (idx < steps.length - 1) setWorkState(steps[idx + 1]);
  };

  return (
    <div className="h-full flex flex-col">
      <NavBar title={assignment.title} onBack={onBack} color="bg-indigo-600" />

      {/* Status strip */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            { label: 'Subject', value: assignment.subject },
            { label: 'Due', value: assignment.due },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-400">{f.label}:</span>
              <span className="font-bold text-gray-700">{f.value}</span>
            </div>
          ))}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
          workState === 'submitted' ? 'bg-green-100 text-green-700 border-green-200' :
          assignment.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
          'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {workState === 'submitted' ? '✓ Submitted' : assignment.status === 'overdue' ? 'Overdue' : 'Pending'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {workState !== 'submitted' ? (
          <>
            {/* Instructions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Instructions</p>
              <p className="text-sm text-gray-700">Complete all questions on fractions and decimals. Show your working out clearly. Take a photo of your handwritten work and upload it below.</p>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your notes (optional)</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes for your tutor..."
                className="w-full h-16 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Upload zone — the key improvement */}
            <div
              onClick={advance}
              className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                workState === 'dragging'
                  ? 'border-indigo-400 bg-indigo-50 scale-[1.02]'
                  : workState === 'uploaded'
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
              } p-6 text-center`}
            >
              {workState === 'idle' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} className="text-indigo-600" />
                  </div>
                  <p className="font-black text-gray-800">Tap to upload your work</p>
                  <p className="text-xs text-gray-400 mt-1">Photo · PDF · Any file</p>
                  <div className="mt-3 text-xs text-indigo-600 font-semibold bg-indigo-100 rounded-lg px-3 py-1.5 inline-block">
                    Browse files
                  </div>
                </>
              )}
              {workState === 'dragging' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-200 flex items-center justify-center mx-auto mb-3 animate-bounce">
                    <Upload size={24} className="text-indigo-700" />
                  </div>
                  <p className="font-black text-indigo-700">Drop to upload…</p>
                </>
              )}
              {workState === 'uploaded' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-green-200 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-green-700" />
                  </div>
                  <p className="font-black text-green-800">fractions_work.jpg uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">1 file ready · tap to change</p>
                </>
              )}
            </div>

            {workState === 'uploaded' && (
              <p className="text-xs text-center text-gray-400">
                File looks good? Hit the button below to send it.
              </p>
            )}
          </>
        ) : (
          /* Submitted state */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Submitted!</h2>
            <p className="text-sm text-gray-500 mb-6">Your tutor will review and mark your work.</p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 w-full text-left">
              <p className="text-xs font-bold text-green-700 mb-1">What happens next</p>
              <p className="text-sm text-gray-600">Your tutor will mark it and you'll get your grade here in Results.</p>
            </div>
            <button onClick={onBack} className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600">
              <ArrowLeft size={14} /> Back to homework
            </button>
          </div>
        )}
      </div>

      {/* Sticky submit button */}
      {workState !== 'submitted' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
          <button
            onClick={advance}
            disabled={workState === 'idle'}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              workState === 'idle'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : workState === 'uploaded'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-indigo-200 text-indigo-600'
            }`}
          >
            <Send size={15} />
            {workState === 'idle' ? 'Upload your work first' : workState === 'uploaded' ? 'Submit assignment' : 'Uploading…'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TUTOR: ASSIGNMENT WIZARD ────────────────────────────────────────────────
function TutorWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<WizardStep>(1);
  const [type, setType] = useState<'file' | 'worksheet' | 'test' | null>(null);
  const [subject, setSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const TYPE_OPTIONS = [
    { key: 'file' as const, icon: '📎', label: 'File upload', desc: 'Student uploads a photo or PDF of their work' },
    { key: 'worksheet' as const, icon: '📝', label: 'Worksheet', desc: 'Questions answered directly in eSlate' },
    { key: 'test' as const, icon: '🏆', label: 'Timed test', desc: 'Auto-marked, time-limited assessment' },
  ];

  return (
    <div className="h-full flex flex-col">
      <NavBar title="New assignment" onBack={onBack} color="bg-teal-600" />

      {/* Step indicator */}
      <div className="bg-teal-50 border-b border-teal-100 px-4 py-3">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                step > s ? 'bg-teal-600 border-teal-600 text-white' :
                step === s ? 'border-teal-600 text-teal-700 bg-white' :
                'border-gray-300 text-gray-400 bg-white'
              }`}>
                {step > s ? <Check size={12} strokeWidth={3} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 w-6 ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <span className="text-xs text-teal-600 font-semibold ml-1">
            {step === 1 ? 'Type' : step === 2 ? 'Details' : 'Assign to'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {step === 1 && (
          <>
            <p className="text-sm font-bold text-gray-800">What kind of assignment?</p>
            <div className="space-y-3">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`w-full text-left rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${
                    type === t.key ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-200'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div>
                    <p className="font-black text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  {type === t.key && <Check size={18} className="text-teal-600 ml-auto flex-shrink-0" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Fractions worksheet 3"
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {['Mathematics', 'English', 'Science', 'Other'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        subject === s ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Due date</label>
                <input
                  type="date"
                  value={due}
                  onChange={e => setDue(e.target.value)}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Instructions <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                <textarea
                  placeholder="What should students do? Any tips or reminders..."
                  className="w-full h-20 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm font-bold text-gray-800">Assign to which students?</p>
            <div className="space-y-2">
              {['Year 1 Group', 'Year 3 Group', 'Year 5 Group'].map((g, i) => (
                <label key={g} className={`flex items-center gap-3 bg-white rounded-2xl border-2 px-4 py-3.5 cursor-pointer ${i === 0 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}>
                    {i === 0 && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-bold text-sm text-gray-800">{g}</span>
                  <span className="text-xs text-gray-400 ml-auto">{[3, 4, 2][i]} students</span>
                </label>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Summary</p>
              {[
                { label: 'Type', value: type === 'file' ? 'File upload' : type === 'worksheet' ? 'Worksheet' : 'Timed test' },
                { label: 'Title', value: title || '(not set)' },
                { label: 'Subject', value: subject },
                { label: 'Due', value: due ? new Date(due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '(not set)' },
                { label: 'Assigned to', value: 'Year 1 Group (3 students)' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-teal-600 font-semibold">{r.label}</span>
                  <span className="font-black text-gray-800">{r.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => (s - 1) as WizardStep)} className="px-5 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-700">
            Back
          </button>
        )}
        <button
          onClick={() => { if (step < 3) setStep(s => (s + 1) as WizardStep); }}
          disabled={step === 1 && !type}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            step === 1 && !type ? 'bg-gray-100 text-gray-400' :
            step === 3 ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' :
            'bg-teal-600 text-white'
          }`}
        >
          {step === 3 ? '🎉 Create assignment' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// ─── TUTOR: MARKING SWIPE ────────────────────────────────────────────────────
function TutorMarking({ onBack }: { onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const student = TO_MARK[idx];
  const isLast = idx === TO_MARK.length - 1;
  const grade = grades[student.id];
  const feedback = feedbacks[student.id] || '';
  const isSubmitted = submitted.has(student.id);

  const handleSubmit = () => {
    setSubmitted(s => new Set([...s, student.id]));
    if (!isLast) setTimeout(() => setIdx(i => i + 1), 600);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="font-black text-sm">Marking · Fractions & Decimals</p>
          <p className="text-xs text-teal-200">{submitted.size}/{TO_MARK.length} marked</p>
        </div>
        {/* Mini progress */}
        <div className="flex gap-1">
          {TO_MARK.map((s, i) => (
            <button key={s.id} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${submitted.has(s.id) ? 'bg-green-300' : i === idx ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* Student navigation */}
      <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex items-center justify-between">
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="w-7 h-7 rounded-lg border border-teal-200 flex items-center justify-center disabled:opacity-30">
          <ChevronLeft size={14} className="text-teal-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-black">
            {student.avatar}
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-900">{student.name}</p>
            <p className="text-xs text-gray-400">Submitted {student.submitted}</p>
          </div>
        </div>
        <button onClick={() => setIdx(i => Math.min(TO_MARK.length - 1, i + 1))} disabled={isLast} className="w-7 h-7 rounded-lg border border-teal-200 flex items-center justify-center disabled:opacity-30">
          <ChevronRight size={14} className="text-teal-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {isSubmitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="font-black text-gray-900">Grade submitted for {student.name}</p>
            <p className="text-sm text-gray-400 mt-1">{grade}/20 · sent to student & parent</p>
            {!isLast && (
              <button onClick={() => setIdx(i => i + 1)} className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl">
                Next student <ChevronRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Student's work */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Student's answer</p>
                <span className="text-xs text-gray-400">{student.assignment}</span>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">{student.content}</pre>
              </div>
            </div>

            {/* Grade picker */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Mark out of 20</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 21 }, (_, i) => i).map(g => (
                  <button
                    key={g}
                    onClick={() => setGrades(d => ({ ...d, [student.id]: g }))}
                    className={`w-10 h-10 rounded-xl border-2 font-black text-sm transition-all ${
                      grade === g ? 'bg-teal-600 text-white border-teal-600 scale-110' :
                      grade !== undefined && Math.abs(g - grade) <= 1 ? 'border-teal-200 text-teal-500' :
                      'border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Feedback</p>
              <textarea
                value={feedback}
                onChange={e => setFeedbacks(d => ({ ...d, [student.id]: e.target.value }))}
                placeholder="Great work on Q1–3! For Q4, remember to show your working..."
                className="w-full h-20 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-teal-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Great work!', 'Good effort', 'Check working', 'Almost there'].map(q => (
                  <button
                    key={q}
                    onClick={() => setFeedbacks(d => ({ ...d, [student.id]: q }))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {!isSubmitted && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
          <button className="w-10 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center flex-shrink-0 hover:border-red-300">
            <X size={16} className="text-gray-400" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={grade === undefined}
            className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              grade === undefined ? 'bg-gray-100 text-gray-400' : 'bg-teal-600 text-white shadow-lg shadow-teal-200'
            }`}
          >
            <ThumbsUp size={15} />
            {isLast ? 'Submit & finish' : 'Submit & next →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PREVIEW PAGE ───────────────────────────────────────────────────────
export default function AssignmentPreview() {
  const [flow, setFlow] = useState<Flow>('student-list');
  const [openAssignment, setOpenAssignment] = useState<string | null>(null);

  const FlowButton = ({ f, label, color }: { f: Flow; label: string; color: string }) => (
    <button
      onClick={() => { setFlow(f); setOpenAssignment(null); }}
      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
        flow === f ? `${color} text-white border-transparent` : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const assignment = ASSIGNMENTS.find(a => a.id === openAssignment);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <a href="/" className="hover:text-gray-700">← Back to app</a>
            <span>·</span>
            <span>Assignment workflow preview</span>
          </div>
          <h1 className="font-black text-xl text-gray-900">Cleaner assignment workflow</h1>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-500">Interactive preview</span>
        </div>
      </div>

      {/* Flow switcher */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-2">View:</span>
          <FlowButton f="student-list" label="📋 Student: Homework list" color="bg-indigo-600" />
          <FlowButton f="student-work" label="✏️ Student: Work page" color="bg-indigo-600" />
          <FlowButton f="tutor-wizard" label="➕ Tutor: Create assignment" color="bg-teal-600" />
          <FlowButton f="tutor-marking" label="✅ Tutor: Mark work" color="bg-teal-600" />
        </div>
      </div>

      {/* Device frame */}
      <div className="flex items-start justify-center px-4 py-10 gap-10">
        <div className="flex-shrink-0">
          {/* Phone frame */}
          <div className="relative" style={{ width: 375 }}>
            <div className="absolute inset-0 rounded-[44px] border-[10px] border-gray-800 shadow-2xl pointer-events-none z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-20" />
            <div className="overflow-hidden rounded-[36px] border-[1px] border-gray-700" style={{ height: 720 }}>
              <div className="w-full h-full overflow-hidden flex flex-col">
                {flow === 'student-list' && (
                  <StudentList onOpen={id => { setOpenAssignment(id); setFlow('student-work'); }} />
                )}
                {flow === 'student-work' && (
                  <StudentWork
                    assignment={assignment || ASSIGNMENTS[0]}
                    onBack={() => { setFlow('student-list'); setOpenAssignment(null); }}
                  />
                )}
                {flow === 'tutor-wizard' && <TutorWizard onBack={() => {}} />}
                {flow === 'tutor-marking' && <TutorMarking onBack={() => {}} />}
              </div>
            </div>
          </div>
        </div>

        {/* Annotations */}
        <div className="w-72 space-y-4 pt-4 hidden lg:block">
          {flow === 'student-list' && (
            <>
              <Callout color="indigo" icon={<Zap size={14} />} title="Progress bar">
                Shows at a glance how many assignments are done this week — students can see exactly where they are without counting.
              </Callout>
              <Callout color="indigo" icon={<AlertCircle size={14} />} title="Overdue surface first">
                Overdue items are pushed to the top with a red alert banner. Students can't accidentally miss them.
              </Callout>
              <Callout color="gray" icon={<Check size={14} />} title="Tap any assignment to open it">
                Try tapping an overdue item — it opens the new work page.
              </Callout>
            </>
          )}
          {flow === 'student-work' && (
            <>
              <Callout color="indigo" icon={<ArrowLeft size={14} />} title="Back arrow, not window.close()">
                Old design opened a new browser tab and used window.close() — broken on e-ink devices. Now it's in-app navigation.
              </Callout>
              <Callout color="indigo" icon={<Upload size={14} />} title="One-step upload + submit">
                Old design: upload → wait → hit a separate submit button. New: tap once to pick file, it auto-enables the submit button. Upload and submit are a single user action.
              </Callout>
              <Callout color="gray" icon={<Sparkles size={14} />} title="Try it">
                Tap the upload zone → tap again → tap Submit. Only 3 taps to submit work.
              </Callout>
            </>
          )}
          {flow === 'tutor-wizard' && (
            <>
              <Callout color="teal" icon={<ClipboardList size={14} />} title="3-step wizard">
                Old design: one giant form with every field visible at once — overwhelming. New: 3 focused steps, each with just what's needed.
              </Callout>
              <Callout color="teal" icon={<Users size={14} />} title="Assign to groups">
                Step 3 shows student groups directly — no hunting through dropdowns for individual students.
              </Callout>
              <Callout color="gray" icon={<Star size={14} />} title="Summary before publishing">
                Step 3 shows a full summary card before creating — tutors can catch mistakes before students see it.
              </Callout>
            </>
          )}
          {flow === 'tutor-marking' && (
            <>
              <Callout color="teal" icon={<ChevronRight size={14} />} title="Swipe between students">
                Old design: a list → open dialog → close → next. New: previous/next arrows, stays in one screen per student.
              </Callout>
              <Callout color="teal" icon={<Star size={14} />} title="Visual grade picker">
                Tapping 0–20 is faster than typing, and the selected grade is highlighted clearly. Quick-reply feedback phrases save time for routine comments.
              </Callout>
              <Callout color="gray" icon={<Check size={14} />} title="Auto-advances">
                After submitting a grade, the screen automatically moves to the next student. Submit all 3 and see the progress bar fill.
              </Callout>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Callout({ color, icon, title, children }: { color: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-500',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 font-black text-sm mb-1">
        {icon}{title}
      </div>
      <p className="text-sm leading-relaxed opacity-80">{children}</p>
    </div>
  );
}
