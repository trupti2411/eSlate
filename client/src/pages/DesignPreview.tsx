import { useState, useRef, useEffect } from 'react';
import {
  BookOpen, CheckSquare, BarChart2, MessageCircle, Users,
  Clock, AlertCircle, ChevronRight, Bell, Star,
  ArrowRight, Play, ChevronLeft, Pen, Highlighter,
  Eraser, Type, Save, Send, RotateCcw, ZoomIn, ZoomOut,
  Check, X, Info
} from 'lucide-react';

type View = 'student' | 'parent';
type StudentTab = 'classes' | 'assignments' | 'results';
type ParentTab = 'children' | 'messages' | 'homework';
type StudentScreen = 'home' | 'assignment-detail' | 'pdf-annotator' | 'submitted';
type Tool = 'pen' | 'highlighter' | 'eraser' | 'text';

function PhoneMockup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
      <div className="relative w-[390px] rounded-[40px] border-[8px] border-gray-900 shadow-2xl bg-white overflow-hidden" style={{ minHeight: 780 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
        <div className="pt-8 h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {label}
    </span>
  );
}

function PDFAnnotatorScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1e40af');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<{ x: number; y: number; tool: Tool; color: string }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number; tool: Tool; color: string }[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const colors = [
    { value: '#1e40af', label: 'Blue' },
    { value: '#dc2626', label: 'Red' },
    { value: '#16a34a', label: 'Green' },
    { value: '#000000', label: 'Black' },
    { value: '#fbbf24', label: 'Yellow', highlight: true },
  ];

  const tools: { key: Tool; icon: typeof Pen; label: string }[] = [
    { key: 'pen', icon: Pen, label: 'Pen' },
    { key: 'highlighter', icon: Highlighter, label: 'Highlight' },
    { key: 'eraser', icon: Eraser, label: 'Eraser' },
    { key: 'text', icon: Type, label: 'Text' },
  ];

  function getRelativePos(e: React.MouseEvent | React.TouchEvent, el: SVGSVGElement) {
    const rect = el.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) {
    e.preventDefault();
    if (tool === 'text') return;
    setIsDrawing(true);
    const pos = getRelativePos(e, svgRef.current!);
    setCurrentStroke([{ ...pos, tool, color }]);
  }

  function draw(e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getRelativePos(e, svgRef.current!);
    setCurrentStroke(s => [...s, { ...pos, tool, color }]);
  }

  function endDraw(e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes(s => [...s, currentStroke]);
    }
    setCurrentStroke([]);
    // Auto-save
    const now = new Date();
    setSavedAt(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
  }

  function strokeToPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }

  function getStrokeStyle(s: { tool: Tool; color: string }) {
    if (s.tool === 'highlighter') return { stroke: s.color === '#fbbf24' ? '#fde68a' : s.color, strokeWidth: 12, opacity: 0.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (s.tool === 'eraser') return { stroke: '#ffffff', strokeWidth: 16, opacity: 1, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    return { stroke: s.color, strokeWidth: 2.5, opacity: 1, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-3 pt-2 pb-2 flex items-center gap-2">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">Fractions Worksheet</p>
          <p className="text-xs text-gray-400">Mathematics · Mr. Harrison</p>
        </div>
        {savedAt ? (
          <span className="text-[10px] text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1">
            <Check size={10} /> Saved {savedAt}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Auto-saves</span>
        )}
      </div>

      {/* PDF area — simulated worksheet */}
      <div className="flex-1 relative overflow-hidden bg-gray-200">
        {/* Simulated PDF page */}
        <div className="absolute inset-2 bg-white rounded-lg shadow-md overflow-hidden">
          {/* Printed worksheet content */}
          <div className="p-4 pointer-events-none select-none">
            <p className="text-center font-bold text-gray-800 text-sm mb-1">Year 5 Mathematics</p>
            <p className="text-center text-gray-500 text-xs mb-3">Fractions — Adding & Subtracting</p>
            <div className="space-y-4">
              {[
                { q: '1.  ½  +  ¼  =', hint: '' },
                { q: '2.  ¾  −  ⅛  =', hint: '' },
                { q: '3.  ⅓  +  ⅙  =', hint: '' },
                { q: '4.  ⅔  −  ⅓  =', hint: '' },
              ].map(({ q }) => (
                <div key={q} className="border-b border-dashed border-gray-200 pb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{q}</p>
                  <div className="h-7 bg-gray-50 rounded border border-gray-100" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">— Show your working below —</p>
            <div className="mt-2 h-20 bg-gray-50 rounded border border-gray-100" />
          </div>

          {/* Drawing SVG layer */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{ touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          >
            {strokes.map((stroke, i) => (
              <path key={i} d={strokeToPath(stroke)} {...getStrokeStyle(stroke[0])} />
            ))}
            {currentStroke.length > 1 && (
              <path d={strokeToPath(currentStroke)} {...getStrokeStyle(currentStroke[0])} />
            )}
          </svg>
        </div>

        {/* Hint bubble */}
        {strokes.length === 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
            <Pen size={11} /> Draw on the worksheet with your stylus
          </div>
        )}
      </div>

      {/* Tool palette */}
      <div className="bg-white border-t border-gray-100 px-3 pt-2 pb-1">
        {/* Tools row */}
        <div className="flex items-center gap-1 mb-2">
          {tools.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${tool === key ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
            >
              <Icon size={18} strokeWidth={tool === key ? 2.5 : 1.5} />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          ))}
          <div className="w-px h-8 bg-gray-100 mx-1" />
          <button
            onClick={() => setStrokes(s => s.slice(0, -1))}
            className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl text-gray-400"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
            <span className="text-[9px] font-semibold">Undo</span>
          </button>
        </div>

        {/* Colour dots (hidden for eraser/text) */}
        {(tool === 'pen' || tool === 'highlighter') && (
          <div className="flex items-center gap-2 mb-2 px-1">
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.value ? 'scale-125 border-gray-700' : 'border-transparent'}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        )}

        {/* Save / Submit */}
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => { const now = new Date(); setSavedAt(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700"
          >
            <Save size={16} /> Save draft
          </button>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-2xl text-sm font-bold text-white"
          >
            <Send size={16} /> Submit
          </button>
        </div>
      </div>

      {/* Submit confirmation overlay */}
      {showSubmitConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-indigo-600" />
            </div>
            <p className="text-lg font-black text-gray-900 text-center mb-1">Submit worksheet?</p>
            <p className="text-sm text-gray-500 text-center mb-6">Once submitted, Mr. Harrison will be able to see your work and give feedback.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl font-bold text-gray-700">
                Keep editing
              </button>
              <button onClick={onSubmit} className="flex-1 py-3.5 bg-indigo-600 rounded-2xl font-bold text-white">
                Yes, submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentDetailScreen({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-3 pt-2 pb-3 flex items-center gap-2">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <p className="font-bold text-gray-900">Assignment details</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Subject header */}
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
          <div className="bg-red-500 px-4 py-1.5 flex items-center gap-2">
            <AlertCircle size={13} className="text-white" />
            <p className="text-white text-xs font-bold">OVERDUE — Was due Monday</p>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">➕</div>
            <div>
              <p className="font-black text-gray-900 text-lg">Fractions Worksheet</p>
              <p className="text-sm text-gray-500">Mathematics · Mr. Harrison · Year 5</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Instructions from Mr. Harrison</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Complete all four questions on the worksheet. Show your working clearly — remember to find a common denominator before adding or subtracting. If you get stuck, use the hint button.
          </p>
        </div>

        {/* What you'll need */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How to complete</p>
          <div className="space-y-2.5">
            {[
              { icon: '✏️', text: 'Write your answers directly on the PDF using your stylus' },
              { icon: '💾', text: 'Your work auto-saves every 30 seconds' },
              { icon: '📤', text: 'Tap Submit when you\'re done — Mr. Harrison will be notified' },
            ].map((s) => (
              <div key={s.text} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">{s.icon}</span>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI hint note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Smart hints available</p>
            <p className="text-xs text-indigo-600 mt-0.5">If you're stuck, tap the hint button inside the worksheet for a step-by-step clue. Your parent has enabled hints for you.</p>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="bg-white border-t border-gray-100 p-4">
        <button
          onClick={onStart}
          className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 shadow-lg shadow-indigo-200"
        >
          <Play size={20} className="fill-white" />
          Open worksheet
        </button>
      </div>
    </div>
  );
}

function SubmittedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-8">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check size={48} className="text-green-600 stroke-[2.5]" />
      </div>
      <p className="text-2xl font-black text-gray-900 text-center mb-2">Submitted!</p>
      <p className="text-sm text-gray-500 text-center mb-2">
        Great work! Mr. Harrison has been notified and will mark your fractions worksheet soon.
      </p>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 w-full shadow-sm mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Assignment</span>
          <span className="font-semibold text-gray-900">Fractions Worksheet</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Subject</span>
          <span className="font-semibold text-gray-900">Mathematics</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Submitted</span>
          <span className="font-semibold text-gray-900">Just now</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <StatusPill label="Submitted" color="green" />
        </div>
      </div>
      <button
        onClick={onBack}
        className="w-full py-4 bg-gray-900 rounded-2xl font-bold text-white"
      >
        Back to homework
      </button>
    </div>
  );
}

function StudentScreen() {
  const [tab, setTab] = useState<StudentTab>('assignments');
  const [screen, setScreen] = useState<StudentScreen>('home');

  const tabs: { key: StudentTab; icon: typeof BookOpen; label: string }[] = [
    { key: 'classes', icon: BookOpen, label: 'Classes' },
    { key: 'assignments', icon: CheckSquare, label: 'Homework' },
    { key: 'results', icon: BarChart2, label: 'Results' },
  ];

  if (screen === 'assignment-detail') {
    return <AssignmentDetailScreen onBack={() => setScreen('home')} onStart={() => setScreen('pdf-annotator')} />;
  }
  if (screen === 'pdf-annotator') {
    return <PDFAnnotatorScreen onBack={() => setScreen('assignment-detail')} onSubmit={() => setScreen('submitted')} />;
  }
  if (screen === 'submitted') {
    return <SubmittedScreen onBack={() => { setScreen('home'); setTab('assignments'); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Good morning 👋</p>
            <p className="text-xl font-bold text-gray-900">Jacob</p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">
              <Bell size={20} className="text-indigo-600" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">2</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'classes' && (
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Today — Thursday</p>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Mathematics</p>
                  <p className="text-sm text-gray-500">Mr. Harrison · Year 5</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">4:00 PM</p>
                  <StatusPill label="Today" color="blue" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">📖</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">English</p>
                  <p className="text-sm text-gray-500">Ms. Chen · Year 5</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Saturday</p>
                  <StatusPill label="In 2 days" color="gray" />
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 pt-2">Attendance</p>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
                  <span className="font-bold text-green-600 text-lg">92%</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Great attendance!</p>
                  <p className="text-sm text-gray-500">23 of 25 classes attended</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'assignments' && (
          <div className="p-4 space-y-3">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-red-600">1</p>
                <p className="text-[11px] text-red-500 font-semibold mt-0.5">Overdue</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-amber-600">3</p>
                <p className="text-[11px] text-amber-500 font-semibold mt-0.5">Due soon</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-green-600">5</p>
                <p className="text-[11px] text-green-500 font-semibold mt-0.5">Done</p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">To do</p>

            {/* Overdue — tappable */}
            <button
              onClick={() => setScreen('assignment-detail')}
              className="w-full bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden text-left"
            >
              <div className="bg-red-500 px-4 py-1">
                <p className="text-white text-xs font-bold">OVERDUE — Tap to open</p>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Fractions Worksheet</p>
                  <p className="text-sm text-gray-500">Mathematics · Was due Mon</p>
                </div>
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <Play size={16} className="text-white fill-white" />
                </div>
              </div>
            </button>

            {/* Due soon */}
            {[
              { subject: 'Reading Comprehension', icon: '📖', due: 'Due Friday', bg: 'bg-purple-100' },
              { subject: 'Science Report', icon: '🔬', due: 'Due Sunday', bg: 'bg-teal-100' },
            ].map((a) => (
              <div key={a.subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center`}>
                  <span className="text-xl">{a.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{a.subject}</p>
                  <p className="text-sm text-amber-500 font-medium">{a.due}</p>
                </div>
                <button className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <ArrowRight size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'results' && (
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recent marks</p>
            {[
              { subject: 'Mathematics', score: '18/20', grade: 'A', icon: '➕', bg: 'bg-blue-100', color: 'text-blue-600' },
              { subject: 'English', score: '14/20', grade: 'B', icon: '📖', bg: 'bg-purple-100', color: 'text-purple-600' },
              { subject: 'Science', score: '16/20', grade: 'A-', icon: '🔬', bg: 'bg-teal-100', color: 'text-teal-600' },
            ].map((r) => (
              <div key={r.subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}>
                  <span className="text-xl">{r.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{r.subject}</p>
                  <p className="text-sm text-gray-500">{r.score}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}>
                  <span className={`font-black text-lg ${r.color}`}>{r.grade}</span>
                </div>
              </div>
            ))}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mt-2">
              <Star size={24} className="text-indigo-500 fill-indigo-200" />
              <div>
                <p className="font-bold text-indigo-900">Overall average: B+</p>
                <p className="text-sm text-indigo-600">Keep it up — great work this term!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-6">
        <div className="flex justify-around">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${tab === key ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tab === key ? 'bg-indigo-100' : ''}`}>
                <Icon size={24} strokeWidth={tab === key ? 2.5 : 1.5} />
              </div>
              <span className={`text-xs font-semibold ${tab === key ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ParentScreen() {
  const [tab, setTab] = useState<ParentTab>('children');

  const tabs: { key: ParentTab; icon: typeof Users; label: string }[] = [
    { key: 'children', icon: Users, label: 'My Kids' },
    { key: 'homework', icon: CheckSquare, label: 'Homework' },
    { key: 'messages', icon: MessageCircle, label: 'Messages' },
  ];

  const children = [
    { name: 'Jacob', year: 'Year 1', centre: 'Homework & Study', color: 'bg-blue-100', emoji: '👦', pending: 2, overdue: 0 },
    { name: 'Sophie', year: 'Year 3', centre: 'Homework & Study', color: 'bg-pink-100', emoji: '👧', pending: 1, overdue: 1 },
    { name: 'Oliver', year: 'Year 5', centre: 'MathMasters', color: 'bg-amber-100', emoji: '🧒', pending: 3, overdue: 0 },
  ];

  const [selectedChild, setSelectedChild] = useState(0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-3 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Parent dashboard</p>
            <p className="text-xl font-bold text-gray-900">Mary Citizen</p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center">
              <Bell size={20} className="text-rose-500" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'children' && (
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Your children</p>
            {children.map((child) => (
              <div key={child.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full ${child.color} flex items-center justify-center text-2xl`}>
                    {child.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-500">{child.year} · {child.centre}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
                <div className="flex gap-2">
                  {child.overdue > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-xl px-3 py-1.5">
                      <AlertCircle size={13} className="text-red-500" />
                      <span className="text-xs font-bold text-red-600">{child.overdue} overdue</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5">
                    <Clock size={13} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-600">{child.pending} pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'homework' && (
          <div className="p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {children.map((child, i) => (
                <button
                  key={child.name}
                  onClick={() => setSelectedChild(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border whitespace-nowrap text-sm font-semibold transition-all ${selectedChild === i ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  <span>{child.emoji}</span> {child.name}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              {children[selectedChild].name}'s homework
            </p>
            {selectedChild === 1 && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="bg-red-500 px-4 py-1"><p className="text-white text-xs font-bold">OVERDUE</p></div>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl">📖</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Reading Log</p>
                    <p className="text-sm text-gray-500">English · Was due Mon</p>
                  </div>
                  <StatusPill label="Overdue" color="red" />
                </div>
              </div>
            )}
            {[
              { subject: 'Spelling Test Practice', icon: '✏️', bg: 'bg-blue-100', due: 'Due Friday' },
              { subject: 'Number Bonds', icon: '➕', bg: 'bg-green-100', due: 'Due Sunday' },
            ].map((a) => (
              <div key={a.subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center text-xl`}>{a.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{a.subject}</p>
                  <p className="text-sm text-amber-500 font-medium">{a.due}</p>
                </div>
                <StatusPill label="Pending" color="amber" />
              </div>
            ))}
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-3 opacity-70">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">✅</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Story Writing</p>
                <p className="text-sm text-gray-500">Submitted Tuesday</p>
              </div>
              <StatusPill label="Done" color="green" />
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recent messages</p>
            {[
              { from: 'Mr. Harrison', role: "Jacob's Maths tutor", msg: "Jacob did really well today with his fractions — great improvement!", time: '2h ago', unread: true, avatar: '👨‍🏫' },
              { from: 'Ms. Chen', role: "Sophie's English tutor", msg: "Just a reminder Sophie's reading log is overdue.", time: 'Yesterday', unread: true, avatar: '👩‍🏫' },
              { from: 'MathMasters Academy', role: 'Admin · Oliver', msg: "Term 2 timetable is now available.", time: '3 days ago', unread: false, avatar: '🏫' },
            ].map((m) => (
              <div key={m.from} className={`bg-white rounded-2xl border shadow-sm p-4 ${m.unread ? 'border-indigo-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-bold text-gray-900 truncate">{m.from}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">{m.time}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{m.role}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{m.msg}</p>
                  </div>
                  {m.unread && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-6">
        <div className="flex justify-around">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${tab === key ? 'text-rose-500' : 'text-gray-400'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tab === key ? 'bg-rose-100' : ''}`}>
                <Icon size={24} strokeWidth={tab === key ? 2.5 : 1.5} />
              </div>
              <span className={`text-xs font-semibold ${tab === key ? 'text-rose-500' : 'text-gray-400'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DesignPreview() {
  const [view, setView] = useState<View>('student');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">eSlate — Redesign Preview</h1>
            <p className="text-sm text-gray-400">Simplified mobile-first · Tap to interact · Full assignment flow included</p>
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setView('student')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'student' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
              Student view
            </button>
            <button onClick={() => setView('parent')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'parent' ? 'bg-white shadow text-rose-500' : 'text-gray-500'}`}>
              Parent view
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16 items-start justify-center">
          {view === 'student' ? (
            <PhoneMockup label="New simplified student app">
              <StudentScreen />
            </PhoneMockup>
          ) : (
            <PhoneMockup label="New simplified parent app">
              <ParentScreen />
            </PhoneMockup>
          )}

          <div className="flex-1 max-w-md">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              {view === 'student' ? 'Assignment flow' : 'What changed'}
            </h2>
            <div className="space-y-4">
              {view === 'student' ? (
                <>
                  <Change icon="1️⃣" title="Homework tab" desc="Student sees their overdue Fractions Worksheet highlighted in red. Tap it to begin." />
                  <Change icon="2️⃣" title="Assignment details" desc="Clear instructions from the tutor, how to complete it, and a big 'Open worksheet' button." />
                  <Change icon="3️⃣" title="PDF + drawing tools" desc="The worksheet opens with pen, highlighter, eraser and text tools. Students write directly on it with their stylus." />
                  <Change icon="4️⃣" title="Auto-save" desc="Work saves automatically every 30 seconds — shown in the top bar. No lost work." />
                  <Change icon="5️⃣" title="Submit with confirmation" desc="A confirmation sheet appears before submitting so students don't accidentally send incomplete work." />
                  <Change icon="6️⃣" title="Success screen" desc="Clear confirmation with assignment details. Tutor is notified automatically." />
                </>
              ) : (
                <>
                  <Change icon="📱" title="3 tabs only" desc="My Kids, Homework, Messages — everything a parent needs, nothing extra." />
                  <Change icon="👧" title="All children on one screen" desc="Each child shows their status at a glance — overdue work flagged immediately." />
                  <Change icon="🔄" title="Quick child switcher" desc="Tap a child's name on the Homework tab to switch between kids instantly." />
                  <Change icon="💬" title="Messages front and centre" desc="Tutor messages in one clean list — no portal login, no missed notes." />
                  <Change icon="⚠️" title="Overdue alerts are impossible to miss" desc="Red banners highlight overdue work so parents can act immediately." />
                  <Change icon="👆" title="Mobile-first layout" desc="Designed for a phone — works while driving pickup or waiting at school." />
                </>
              )}
            </div>

            {view === 'student' && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <p className="text-sm font-bold text-indigo-800 mb-1">Try the full flow</p>
                <p className="text-sm text-indigo-700">On the Homework tab, tap the red overdue card → read the details → tap "Open worksheet" → draw on the PDF → tap Submit → confirm.</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-bold text-amber-800 mb-1">This is a clickable prototype</p>
              <p className="text-sm text-amber-700">Approve this direction and I'll rebuild the real dashboards to match.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Change({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
