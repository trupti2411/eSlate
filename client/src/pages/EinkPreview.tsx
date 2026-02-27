import { useState } from 'react';
import {
  BookOpen, CheckSquare, BarChart2, MessageCircle, Users,
  Clock, AlertCircle, ChevronRight, Bell, Star,
  Play, Pen, Highlighter, Eraser, Type, Save, Send,
  RotateCcw, Check, Info, Calendar, FileText, Award,
  ClipboardList, UserCheck, TrendingUp,
  GraduationCap, ThumbsUp, ThumbsDown, Download, Eye,
  Plus, Filter, Settings, Home, LogOut, ChevronLeft
} from 'lucide-react';

type Role = 'student' | 'parent' | 'tutor' | 'admin';

// ─── E-INK COLOUR PALETTE ─────────────────────────────────────────────────────
// All colours are muted/desaturated to simulate Kaleido 3 e-ink rendering.
// Think "printed on slightly off-white paper with a faded colour inkjet".
const eink = {
  bg: '#f7f7f7',
  surface: '#ffffff',
  border: '#c8c8c8',
  borderStrong: '#888888',
  text: '#111111',
  textMid: '#444444',
  textLight: '#777777',
  // Subject / role accent colours — all heavily desaturated
  blue:   { bg: '#dce8f0', text: '#2a5a7a', border: '#9abcd0' },
  green:  { bg: '#d8ecd8', text: '#2a5a2a', border: '#90c090' },
  red:    { bg: '#f0d8d8', text: '#7a2a2a', border: '#d09090' },
  amber:  { bg: '#ede8d0', text: '#6a5000', border: '#c8b870' },
  teal:   { bg: '#d4e8e4', text: '#1e5248', border: '#80b8b0' },
  violet: { bg: '#e0d8ec', text: '#3a2a5a', border: '#a890c8' },
  gray:   { bg: '#ebebeb', text: '#444444', border: '#c0c0c0' },
};

// ─── DEVICE FRAME ─────────────────────────────────────────────────────────────
function EinkDeviceMockup({ children, label, isLandscape }: { children: React.ReactNode; label: string; isLandscape: boolean }) {
  if (isLandscape) {
    return (
      <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{label} — Landscape</p>
        <div
          className="flex rounded-2xl shadow-2xl overflow-hidden"
          style={{
            height: 544,
            background: '#1a1a1a',
            padding: '14px',
            border: '2px solid #0a0a0a',
            gap: 12,
          }}
        >
          {/* Left — camera / sensor column */}
          <div className="flex flex-col items-center justify-center gap-3 flex-shrink-0" style={{ width: 20 }}>
            <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
            <div className="w-px flex-1 rounded-full bg-gray-800 opacity-40" />
          </div>
          {/* Screen */}
          <div
            className="rounded-lg overflow-hidden flex-1"
            style={{ background: eink.bg, border: '1px solid #555' }}
          >
            {children}
          </div>
          {/* Right — home bar column */}
          <div className="flex flex-col items-center justify-center flex-shrink-0" style={{ width: 20 }}>
            <div className="w-1.5 h-20 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 flex-shrink-0">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{label} — Portrait</p>
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: 560,
          background: '#1a1a1a',
          padding: '18px 14px 28px 14px',
          border: '2px solid #0a0a0a',
        }}
      >
        <div className="flex items-center justify-center mb-3">
          <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-700" />
        </div>
        <div
          className="rounded-lg overflow-hidden"
          style={{ width: '100%', height: 710, background: eink.bg, border: '1px solid #555' }}
        >
          {children}
        </div>
        <div className="flex justify-center mt-4">
          <div className="w-24 h-1.5 rounded-full bg-gray-600" />
        </div>
      </div>
    </div>
  );
}

// ─── SHARED SIDEBAR ───────────────────────────────────────────────────────────
function Sidebar({
  items, active, onSelect, accent, userName, role,
}: {
  items: { key: string; icon: typeof Home; label: string }[];
  active: string;
  onSelect: (k: string) => void;
  accent: typeof eink.blue;
  userName: string;
  role: string;
}) {
  return (
    <div
      className="flex flex-col h-full border-r"
      style={{ width: 170, background: eink.surface, borderColor: eink.border }}
    >
      {/* Logo / centre name */}
      <div className="px-4 py-4 border-b" style={{ borderColor: eink.border }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: eink.textLight }}>eSlate</p>
        <p className="text-sm font-black mt-0.5" style={{ color: eink.text }}>{userName}</p>
        <p className="text-[11px] mt-0.5" style={{ color: eink.textLight }}>{role}</p>
      </div>
      {/* Nav items */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {items.map(({ key, icon: Icon, label }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              style={{
                background: isActive ? accent.bg : 'transparent',
                border: isActive ? `1px solid ${accent.border}` : '1px solid transparent',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} style={{ color: isActive ? accent.text : eink.textMid }} />
              <span className="text-sm font-semibold" style={{ color: isActive ? accent.text : eink.textMid }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ border: `1px solid ${eink.border}` }}
        >
          <LogOut size={14} style={{ color: eink.textLight }} />
          <span className="text-xs" style={{ color: eink.textLight }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}

// ─── PILL ─────────────────────────────────────────────────────────────────────
function Pill({ label, c }: { label: string; c: typeof eink.blue }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {label}
    </span>
  );
}

// ─── STUDENT SCREEN ───────────────────────────────────────────────────────────
function StudentEink() {
  const [tab, setTab] = useState('homework');
  const [openAssignment, setOpenAssignment] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const svgRef = { current: null as SVGSVGElement | null };

  const navItems = [
    { key: 'homework', icon: CheckSquare, label: 'Homework' },
    { key: 'classes', icon: BookOpen, label: 'My Classes' },
    { key: 'results', icon: BarChart2, label: 'Results' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (submitted) {
    return (
      <div className="flex h-full" style={{ background: eink.bg }}>
        <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.blue} userName="Jacob Citizen" role="Student · Year 5" />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: eink.green.border, background: eink.green.bg }}>
            <Check size={40} strokeWidth={2.5} style={{ color: eink.green.text }} />
          </div>
          <p className="text-2xl font-black mb-2" style={{ color: eink.text }}>Submitted!</p>
          <p className="text-sm text-center mb-6" style={{ color: eink.textMid }}>Mr. Harrison has been notified and will mark your fractions worksheet soon.</p>
          <div className="w-full rounded-xl border p-4 mb-6 space-y-2" style={{ background: eink.surface, borderColor: eink.border }}>
            {[['Assignment', 'Fractions Worksheet'], ['Subject', 'Mathematics'], ['Tutor', 'Mr. Harrison'], ['Status', 'Submitted']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: eink.textLight }}>{k}</span>
                <span className="font-semibold" style={{ color: eink.text }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setAnnotating(false); setOpenAssignment(false); }} className="w-full py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: eink.borderStrong, color: eink.text }}>
            Back to homework
          </button>
        </div>
      </div>
    );
  }

  if (annotating) {
    return (
      <div className="flex flex-col h-full" style={{ background: eink.bg }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ background: eink.surface, borderColor: eink.border }}>
          <button onClick={() => setAnnotating(false)} className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: eink.border }}>
            <ChevronLeft size={16} style={{ color: eink.text }} />
          </button>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: eink.text }}>Fractions Worksheet</p>
            <p className="text-xs" style={{ color: eink.textLight }}>Mathematics · Mr. Harrison</p>
          </div>
          <span className="text-xs px-2 py-1 rounded border" style={{ background: eink.green.bg, color: eink.green.text, borderColor: eink.green.border }}>Auto-saved</span>
        </div>
        {/* Tools */}
        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ background: eink.surface, borderColor: eink.border }}>
          {[{ key: 'pen' as const, icon: Pen, label: 'Pen' }, { key: 'highlighter' as const, icon: Highlighter, label: 'Highlight' }, { key: 'eraser' as const, icon: Eraser, label: 'Eraser' }].map(t => (
            <button key={t.key} onClick={() => setTool(t.key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold" style={{ background: tool === t.key ? eink.text : eink.surface, color: tool === t.key ? eink.surface : eink.text, borderColor: eink.borderStrong }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
          <button onClick={() => setStrokes(s => s.slice(0, -1))} className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold ml-auto" style={{ borderColor: eink.border, color: eink.textMid }}>
            <RotateCcw size={13} /> Undo
          </button>
        </div>
        {/* PDF + drawing */}
        <div className="flex-1 relative overflow-hidden p-3">
          <div className="h-full rounded border overflow-hidden relative" style={{ background: eink.surface, borderColor: eink.border }}>
            <div className="p-4 pointer-events-none select-none">
              <p className="text-center font-bold text-sm mb-0.5" style={{ color: eink.text }}>Year 5 Mathematics — Fractions</p>
              <p className="text-center text-xs mb-4" style={{ color: eink.textLight }}>Adding & Subtracting · Show all working</p>
              {['1.  ½  +  ¼  =', '2.  ¾  −  ⅛  =', '3.  ⅓  +  ⅙  =', '4.  ⅔  −  ⅓  ='].map(q => (
                <div key={q} className="mb-4 pb-3 border-b border-dashed" style={{ borderColor: eink.border }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: eink.text }}>{q}</p>
                  <div className="h-8 rounded" style={{ background: eink.bg }} />
                </div>
              ))}
            </div>
            <svg
              ref={el => { (svgRef as any).current = el; }}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: 'none', cursor: 'crosshair' }}
              onMouseDown={e => { setIsDrawing(true); const r = e.currentTarget.getBoundingClientRect(); setCurrentStroke([{ x: e.clientX - r.left, y: e.clientY - r.top }]); }}
              onMouseMove={e => { if (!isDrawing) return; const r = e.currentTarget.getBoundingClientRect(); setCurrentStroke(s => [...s, { x: e.clientX - r.left, y: e.clientY - r.top }]); }}
              onMouseUp={() => { if (currentStroke.length > 1) setStrokes(s => [...s, currentStroke]); setCurrentStroke([]); setIsDrawing(false); }}
              onMouseLeave={() => { if (isDrawing && currentStroke.length > 1) setStrokes(s => [...s, currentStroke]); setCurrentStroke([]); setIsDrawing(false); }}
            >
              {strokes.map((s, i) => <path key={i} d={`M ${s.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke={tool === 'eraser' ? eink.surface : tool === 'highlighter' ? '#c8b870' : '#111'} strokeWidth={tool === 'highlighter' ? 10 : tool === 'eraser' ? 14 : 2} strokeOpacity={tool === 'highlighter' ? 0.5 : 1} strokeLinecap="round" strokeLinejoin="round" />)}
              {currentStroke.length > 1 && <path d={`M ${currentStroke.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke={tool === 'eraser' ? eink.surface : tool === 'highlighter' ? '#c8b870' : '#111'} strokeWidth={tool === 'highlighter' ? 10 : tool === 'eraser' ? 14 : 2} strokeOpacity={tool === 'highlighter' ? 0.5 : 1} strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </div>
        </div>
        {/* Bottom actions */}
        <div className="flex gap-3 px-4 py-3 border-t" style={{ background: eink.surface, borderColor: eink.border }}>
          <button className="flex-1 py-2.5 rounded border font-semibold text-sm flex items-center justify-center gap-2" style={{ borderColor: eink.border, color: eink.textMid }}>
            <Save size={15} /> Save draft
          </button>
          <button onClick={() => setSubmitted(true)} className="flex-1 py-2.5 rounded border-2 font-bold text-sm flex items-center justify-center gap-2" style={{ borderColor: eink.borderStrong, background: eink.text, color: eink.surface }}>
            <Send size={15} /> Submit
          </button>
        </div>
      </div>
    );
  }

  if (openAssignment) {
    return (
      <div className="flex h-full" style={{ background: eink.bg }}>
        <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.blue} userName="Jacob Citizen" role="Student · Year 5" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
            <button onClick={() => setOpenAssignment(false)} className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: eink.border }}><ChevronLeft size={16} style={{ color: eink.text }} /></button>
            <p className="font-bold text-sm" style={{ color: eink.text }}>Fractions Worksheet — Details</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: eink.red.border }}>
              <div className="px-4 py-1.5" style={{ background: eink.red.bg }}><p className="text-xs font-bold" style={{ color: eink.red.text }}>OVERDUE — Was due Monday</p></div>
              <div className="p-4 flex items-center gap-3" style={{ background: eink.surface }}>
                <div className="w-14 h-14 rounded-xl border flex items-center justify-center text-2xl" style={{ background: eink.blue.bg, borderColor: eink.blue.border }}>➕</div>
                <div>
                  <p className="font-black text-lg" style={{ color: eink.text }}>Fractions Worksheet</p>
                  <p className="text-sm" style={{ color: eink.textMid }}>Mathematics · Mr. Harrison · Year 5</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: eink.textLight }}>Tutor instructions</p>
              <p className="text-sm leading-relaxed" style={{ color: eink.textMid }}>Complete all four questions. Show your working clearly — find a common denominator before adding or subtracting.</p>
            </div>
            <div className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: eink.textLight }}>How to complete</p>
              {[['✏️', 'Write answers directly on the PDF using your stylus'], ['💾', 'Work auto-saves every 30 seconds'], ['📤', 'Tap Submit when done']].map(([i, t]) => (
                <div key={t} className="flex items-start gap-3 mb-2.5"><span className="text-lg">{i}</span><p className="text-sm" style={{ color: eink.textMid }}>{t}</p></div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 border-t" style={{ background: eink.surface, borderColor: eink.border }}>
            <button onClick={() => setAnnotating(true)} className="w-full py-3.5 rounded-xl border-2 font-black text-base flex items-center justify-center gap-3" style={{ borderColor: eink.borderStrong, background: eink.text, color: eink.surface }}>
              <Play size={18} className="fill-white" /> Open worksheet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ background: eink.bg }}>
      <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.blue} userName="Jacob Citizen" role="Student · Year 5" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: eink.surface, borderColor: eink.border }}>
          <p className="font-black text-base" style={{ color: eink.text }}>My Homework</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: eink.red.border, background: eink.red.bg, color: eink.red.text }}>1</div>
            <Bell size={18} style={{ color: eink.textMid }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 mb-1">
            {[{ n: '1', l: 'Overdue', c: eink.red }, { n: '3', l: 'Due soon', c: eink.amber }, { n: '5', l: 'Done', c: eink.green }].map(s => (
              <div key={s.l} className="rounded-xl border p-3 text-center" style={{ background: s.c.bg, borderColor: s.c.border }}>
                <p className="text-2xl font-black" style={{ color: s.c.text }}>{s.n}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: s.c.text }}>{s.l}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: eink.textLight }}>To do</p>
          <button onClick={() => setOpenAssignment(true)} className="w-full rounded-xl border overflow-hidden text-left" style={{ borderColor: eink.red.border }}>
            <div className="px-4 py-1.5" style={{ background: eink.red.bg }}><p className="text-xs font-bold" style={{ color: eink.red.text }}>OVERDUE — Tap to open</p></div>
            <div className="p-4 flex items-center gap-3" style={{ background: eink.surface }}>
              <div className="w-11 h-11 rounded-xl border flex items-center justify-center text-xl" style={{ background: eink.blue.bg, borderColor: eink.blue.border }}>➕</div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: eink.text }}>Fractions Worksheet</p>
                <p className="text-xs" style={{ color: eink.textMid }}>Mathematics · Was due Mon</p>
              </div>
              <ChevronRight size={16} style={{ color: eink.textLight }} />
            </div>
          </button>
          {[{ s: 'Reading Comprehension', i: '📖', d: 'Due Friday', c: eink.blue }, { s: 'Science Report', i: '🔬', d: 'Due Sunday', c: eink.teal }].map(a => (
            <div key={a.s} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
              <div className="w-11 h-11 rounded-xl border flex items-center justify-center text-xl" style={{ background: a.c.bg, borderColor: a.c.border }}>{a.i}</div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: eink.text }}>{a.s}</p>
                <p className="text-xs" style={{ color: eink.amber.text }}>{a.d}</p>
              </div>
              <Pill label="Pending" c={eink.amber} />
            </div>
          ))}
          <div className="rounded-xl border p-4 flex items-center gap-3 opacity-60" style={{ background: eink.surface, borderColor: eink.border }}>
            <div className="w-11 h-11 rounded-xl border flex items-center justify-center text-xl" style={{ background: eink.green.bg, borderColor: eink.green.border }}>✅</div>
            <div className="flex-1"><p className="font-bold text-sm" style={{ color: eink.text }}>Story Writing</p><p className="text-xs" style={{ color: eink.textLight }}>Submitted Tuesday</p></div>
            <Pill label="Done" c={eink.green} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PARENT SCREEN ────────────────────────────────────────────────────────────
function ParentEink() {
  const [tab, setTab] = useState('children');
  const [selectedChild, setSelectedChild] = useState(0);
  const navItems = [
    { key: 'children', icon: Users, label: 'My Children' },
    { key: 'homework', icon: CheckSquare, label: 'Homework' },
    { key: 'messages', icon: MessageCircle, label: 'Messages' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];
  const children = [
    { name: 'Jacob', year: 'Year 1', centre: 'Homework & Study', emoji: '👦', pending: 2, overdue: 0 },
    { name: 'Sophie', year: 'Year 3', centre: 'Homework & Study', emoji: '👧', pending: 1, overdue: 1 },
    { name: 'Oliver', year: 'Year 5', centre: 'MathMasters', emoji: '🧒', pending: 3, overdue: 0 },
  ];
  return (
    <div className="flex h-full" style={{ background: eink.bg }}>
      <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.violet} userName="Mary Citizen" role="Parent" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: eink.surface, borderColor: eink.border }}>
          <p className="font-black text-base" style={{ color: eink.text }}>
            {tab === 'children' ? 'My Children' : tab === 'homework' ? 'Homework Tracker' : 'Messages'}
          </p>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: eink.red.border, background: eink.red.bg, color: eink.red.text }}>2</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'children' && children.map((c) => (
            <div key={c.name} className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl" style={{ borderColor: eink.border }}>{c.emoji}</div>
                <div className="flex-1">
                  <p className="font-black text-base" style={{ color: eink.text }}>{c.name}</p>
                  <p className="text-xs" style={{ color: eink.textLight }}>{c.year} · {c.centre}</p>
                </div>
                <ChevronRight size={16} style={{ color: eink.textLight }} />
              </div>
              <div className="flex gap-2">
                {c.overdue > 0 && <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border" style={{ background: eink.red.bg, color: eink.red.text, borderColor: eink.red.border }}><AlertCircle size={11} /> {c.overdue} overdue</span>}
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border" style={{ background: eink.amber.bg, color: eink.amber.text, borderColor: eink.amber.border }}><Clock size={11} /> {c.pending} pending</span>
              </div>
            </div>
          ))}
          {tab === 'homework' && (
            <>
              <div className="flex gap-2 mb-1">
                {children.map((c, i) => (
                  <button key={c.name} onClick={() => setSelectedChild(i)} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold" style={{ background: selectedChild === i ? eink.text : eink.surface, color: selectedChild === i ? eink.surface : eink.textMid, borderColor: selectedChild === i ? eink.text : eink.border }}>
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
              {selectedChild === 1 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: eink.red.border }}>
                  <div className="px-4 py-1.5" style={{ background: eink.red.bg }}><p className="text-xs font-bold" style={{ color: eink.red.text }}>OVERDUE</p></div>
                  <div className="p-4 flex items-center gap-3" style={{ background: eink.surface }}>
                    <div className="w-11 h-11 rounded-xl border text-xl flex items-center justify-center" style={{ background: eink.blue.bg, borderColor: eink.blue.border }}>📖</div>
                    <div className="flex-1"><p className="font-bold text-sm" style={{ color: eink.text }}>Reading Log</p><p className="text-xs" style={{ color: eink.textMid }}>English · Was due Mon</p></div>
                    <Pill label="Overdue" c={eink.red} />
                  </div>
                </div>
              )}
              {[{ s: 'Spelling Practice', i: '✏️', d: 'Due Friday' }, { s: 'Number Bonds', i: '➕', d: 'Due Sunday' }].map(a => (
                <div key={a.s} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
                  <div className="w-11 h-11 rounded-xl border text-xl flex items-center justify-center" style={{ background: eink.blue.bg, borderColor: eink.blue.border }}>{a.i}</div>
                  <div className="flex-1"><p className="font-bold text-sm" style={{ color: eink.text }}>{a.s}</p><p className="text-xs" style={{ color: eink.amber.text }}>{a.d}</p></div>
                  <Pill label="Pending" c={eink.amber} />
                </div>
              ))}
            </>
          )}
          {tab === 'messages' && [
            { from: 'Mr. Harrison', role: "Jacob's Maths tutor", msg: "Jacob did really well today — great improvement on fractions!", time: '2h ago', unread: true, avatar: '👨‍🏫' },
            { from: 'Ms. Chen', role: "Sophie's English tutor", msg: "Sophie's reading log is overdue. Please remind her.", time: 'Yesterday', unread: true, avatar: '👩‍🏫' },
            { from: 'MathMasters', role: 'Admin · Oliver', msg: "Term 2 timetable now available.", time: '3 days ago', unread: false, avatar: '🏫' },
          ].map(m => (
            <div key={m.from} className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: m.unread ? eink.blue.border : eink.border }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xl flex-shrink-0" style={{ borderColor: eink.border }}>{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-bold text-sm truncate" style={{ color: eink.text }}>{m.from}</p>
                    <p className="text-xs whitespace-nowrap" style={{ color: eink.textLight }}>{m.time}</p>
                  </div>
                  <p className="text-xs mb-1" style={{ color: eink.textLight }}>{m.role}</p>
                  <p className="text-sm line-clamp-2" style={{ color: eink.textMid }}>{m.msg}</p>
                </div>
                {m.unread && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: eink.blue.text }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TUTOR SCREEN ─────────────────────────────────────────────────────────────
function TutorEink() {
  const [tab, setTab] = useState('today');
  const [rollCall, setRollCall] = useState<Record<string, boolean | null>>({});
  const [marking, setMarking] = useState<string | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [graded, setGraded] = useState(false);
  const navItems = [
    { key: 'today', icon: Calendar, label: 'Today' },
    { key: 'mark', icon: ClipboardList, label: 'To Mark' },
    { key: 'messages', icon: MessageCircle, label: 'Messages' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];
  const students = ['Jacob C.', 'Priya S.', 'Tom W.', 'Aisha M.', 'Leo K.'];
  const emojis: Record<string, string> = { 'Jacob C.': '👦', 'Priya S.': '👧', 'Tom W.': '🧒', 'Aisha M.': '👩', 'Leo K.': '👦' };
  const submissions = [
    { name: 'Jacob Citizen', subject: 'Fractions Worksheet', time: '2h ago', emoji: '👦' },
    { name: 'Priya Singh', subject: 'Reading Comprehension', time: 'Yesterday', emoji: '👧' },
    { name: 'Tom Wright', subject: 'Fractions Worksheet', time: 'Yesterday', emoji: '🧒' },
  ];

  if (graded) {
    return (
      <div className="flex h-full" style={{ background: eink.bg }}>
        <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.teal} userName="Mr. Harrison" role="Tutor · Mathematics" />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: eink.green.border, background: eink.green.bg }}>
            <Award size={40} style={{ color: eink.green.text }} />
          </div>
          <p className="text-2xl font-black mb-2" style={{ color: eink.text }}>Graded!</p>
          <p className="text-sm text-center mb-4" style={{ color: eink.textMid }}>{marking} has been notified with their mark and feedback.</p>
          <div className="w-full rounded-xl border p-4 mb-4 space-y-2" style={{ background: eink.surface, borderColor: eink.border }}>
            {[['Student', marking || ''], ['Mark', `${grade || '17'}/20`], ['Parent notified', 'Yes']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: eink.textLight }}>{k}</span>
                <span className="font-bold" style={{ color: eink.text }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setGraded(false); setMarking(null); setGrade(''); setFeedback(''); }} className="w-full py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: eink.borderStrong, color: eink.text }}>Back to marking</button>
        </div>
      </div>
    );
  }

  if (marking) {
    return (
      <div className="flex h-full" style={{ background: eink.bg }}>
        <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.teal} userName="Mr. Harrison" role="Tutor · Mathematics" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
            <button onClick={() => setMarking(null)} className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: eink.border }}><ChevronLeft size={16} style={{ color: eink.text }} /></button>
            <div className="flex-1"><p className="font-bold text-sm" style={{ color: eink.text }}>{marking}</p><p className="text-xs" style={{ color: eink.textLight }}>Fractions Worksheet</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Student work preview */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: eink.border }}>
              <div className="px-4 py-2 border-b flex items-center justify-between" style={{ background: eink.bg, borderColor: eink.border }}>
                <p className="text-xs font-bold" style={{ color: eink.textLight }}>Student's submitted work</p>
              </div>
              <div className="p-4" style={{ background: eink.surface }}>
                {[{ q: '1.  ½  +  ¼  =', a: '¾', ok: true }, { q: '2.  ¾  −  ⅛  =', a: '⅝', ok: true }, { q: '3.  ⅓  +  ⅙  =', a: '½', ok: true }, { q: '4.  ⅔  −  ⅓  =', a: '⅓ ✗', ok: false }].map(r => (
                  <div key={r.q} className="flex items-center justify-between mb-3 pb-3 border-b border-dashed" style={{ borderColor: eink.border }}>
                    <p className="text-sm font-semibold" style={{ color: eink.text }}>{r.q}</p>
                    <span className="text-sm font-bold px-2 py-0.5 rounded border" style={{ background: r.ok ? eink.green.bg : eink.red.bg, color: r.ok ? eink.green.text : eink.red.text, borderColor: r.ok ? eink.green.border : eink.red.border }}>{r.a}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Grade picker */}
            <div className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: eink.textLight }}>Mark out of 20</p>
              <div className="flex flex-wrap gap-2">
                {['14','15','16','17','18','19','20'].map(g => (
                  <button key={g} onClick={() => setGrade(g)} className="w-11 h-11 rounded-lg border-2 font-bold text-sm" style={{ background: grade === g ? eink.text : eink.surface, color: grade === g ? eink.surface : eink.text, borderColor: grade === g ? eink.text : eink.border }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Feedback */}
            <div className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: eink.textLight }}>Feedback</p>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Great work on Q1–3! For Q4, remember to simplify..." className="w-full h-20 text-sm border rounded-lg p-3 resize-none focus:outline-none" style={{ borderColor: eink.border, color: eink.text, background: eink.bg }} />
              <div className="flex gap-2 mt-2 flex-wrap">
                {['Good effort!', 'Well done!', 'Check working'].map(q => (
                  <button key={q} onClick={() => setFeedback(q)} className="text-xs px-2 py-1 rounded border font-medium" style={{ borderColor: eink.border, color: eink.textMid }}>{q}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 px-4 py-3 border-t" style={{ background: eink.surface, borderColor: eink.border }}>
            <button className="flex-1 py-2.5 rounded border font-semibold text-sm flex items-center justify-center gap-2" style={{ borderColor: eink.border, color: eink.textMid }}>
              <ThumbsDown size={14} /> Needs revision
            </button>
            <button onClick={() => setGraded(true)} className="flex-1 py-2.5 rounded border-2 font-bold text-sm flex items-center justify-center gap-2" style={{ borderColor: eink.borderStrong, background: eink.text, color: eink.surface }}>
              <ThumbsUp size={14} /> Submit grade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ background: eink.bg }}>
      <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.teal} userName="Mr. Harrison" role="Tutor · Mathematics" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: eink.surface, borderColor: eink.border }}>
          <p className="font-black text-base" style={{ color: eink.text }}>
            {tab === 'today' ? 'Today — Thursday' : tab === 'mark' ? 'To Mark' : 'Messages'}
          </p>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: eink.red.border, background: eink.red.bg, color: eink.red.text }}>3</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'today' && (
            <>
              <div className="rounded-xl border p-4" style={{ background: eink.teal.bg, borderColor: eink.teal.border }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: eink.teal.text }}>Next class</p>
                <p className="font-black text-xl mb-0.5" style={{ color: eink.teal.text }}>Mathematics · Year 5</p>
                <p className="text-sm" style={{ color: eink.teal.text }}>Room 3 · 4:00 PM · 5 students</p>
              </div>
              <div className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: eink.textLight }}>Roll call</p>
                  <button onClick={() => { const all: Record<string, boolean | null> = {}; students.forEach(s => { all[s] = true; }); setRollCall(all); }} className="text-xs font-bold px-3 py-1 rounded border" style={{ borderColor: eink.teal.border, background: eink.teal.bg, color: eink.teal.text }}>Mark all present</button>
                </div>
                <div className="space-y-2">
                  {students.map(s => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border flex items-center justify-center text-lg" style={{ borderColor: eink.border }}>{emojis[s]}</div>
                      <p className="flex-1 text-sm font-semibold" style={{ color: eink.text }}>{s}</p>
                      <div className="flex gap-1">
                        <button onClick={() => setRollCall(r => ({ ...r, [s]: true }))} className="w-9 h-9 rounded-lg border-2 flex items-center justify-center" style={{ background: rollCall[s] === true ? eink.green.bg : eink.surface, borderColor: rollCall[s] === true ? eink.green.border : eink.border }}>
                          <Check size={14} style={{ color: rollCall[s] === true ? eink.green.text : eink.textLight }} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setRollCall(r => ({ ...r, [s]: false }))} className="w-9 h-9 rounded-lg border-2 flex items-center justify-center" style={{ background: rollCall[s] === false ? eink.red.bg : eink.surface, borderColor: rollCall[s] === false ? eink.red.border : eink.border }}>
                          <AlertCircle size={14} style={{ color: rollCall[s] === false ? eink.red.text : eink.textLight }} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(rollCall).length > 0 && (
                  <button className="w-full mt-3 py-2.5 rounded-lg border-2 font-bold text-sm" style={{ borderColor: eink.borderStrong, background: eink.text, color: eink.surface }}>Save attendance</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ n: '3', l: 'To mark', c: eink.amber }, { n: '12', l: 'Graded', c: eink.green }, { n: '92%', l: 'Attendance', c: eink.teal }].map(s => (
                  <div key={s.l} className="rounded-xl border p-3 text-center" style={{ background: s.c.bg, borderColor: s.c.border }}>
                    <p className="text-xl font-black" style={{ color: s.c.text }}>{s.n}</p>
                    <p className="text-xs font-semibold" style={{ color: s.c.text }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'mark' && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: eink.textLight }}>Waiting to mark</p>
              {submissions.map(s => (
                <button key={s.name} onClick={() => { setMarking(s.name); setTab('mark'); }} className="w-full rounded-xl border p-4 flex items-center gap-3 text-left" style={{ background: eink.surface, borderColor: eink.amber.border }}>
                  <div className="w-11 h-11 rounded-full border flex items-center justify-center text-xl" style={{ borderColor: eink.border }}>{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: eink.text }}>{s.name}</p>
                    <p className="text-xs" style={{ color: eink.textMid }}>{s.subject}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: eink.amber.text }}>Submitted {s.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pill label="Needs marking" c={eink.amber} />
                    <ChevronRight size={14} style={{ color: eink.textLight }} />
                  </div>
                </button>
              ))}
            </>
          )}
          {tab === 'messages' && [
            { from: 'Mary Citizen', role: "Jacob's parent", msg: "Jacob was unwell — is there catch-up work?", time: '1h ago', unread: true, avatar: '👩' },
            { from: 'Admin', role: 'Company admin', msg: "Please submit your term report by Friday.", time: '3h ago', unread: true, avatar: '🏫' },
            { from: 'Priya Singh', role: 'Student', msg: "I'm stuck on question 3 — can I get a hint?", time: 'Yesterday', unread: false, avatar: '👧' },
          ].map(m => (
            <div key={m.from} className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: m.unread ? eink.teal.border : eink.border }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xl flex-shrink-0" style={{ borderColor: eink.border }}>{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: eink.text }}>{m.from}</p>
                    <p className="text-xs" style={{ color: eink.textLight }}>{m.time}</p>
                  </div>
                  <p className="text-xs mb-1" style={{ color: eink.textLight }}>{m.role}</p>
                  <p className="text-sm" style={{ color: eink.textMid }}>{m.msg}</p>
                </div>
                {m.unread && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: eink.teal.text }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN SCREEN ─────────────────────────────────────────────────────────────
function AdminEink() {
  const [tab, setTab] = useState('overview');
  const navItems = [
    { key: 'overview', icon: TrendingUp, label: 'Overview' },
    { key: 'students', icon: Users, label: 'Students' },
    { key: 'reports', icon: FileText, label: 'Reports' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];
  const students = [
    { name: 'Jacob Citizen', year: 'Year 1', tutor: 'Ms. Chen', emoji: '👦', status: 'ok', att: 95 },
    { name: 'Sophie Citizen', year: 'Year 3', tutor: 'Ms. Chen', emoji: '👧', status: 'overdue', att: 88 },
    { name: 'Oliver Citizen', year: 'Year 5', tutor: 'Mr. Harrison', emoji: '🧒', status: 'ok', att: 92 },
    { name: 'Priya Singh', year: 'Year 5', tutor: 'Mr. Harrison', emoji: '👧', status: 'ok', att: 100 },
    { name: 'Tom Wright', year: 'Year 3', tutor: 'Ms. Chen', emoji: '🧒', status: 'absent', att: 72 },
    { name: 'Aisha Malik', year: 'Year 4', tutor: 'Mr. Harrison', emoji: '👩', status: 'ok', att: 98 },
  ];
  return (
    <div className="flex h-full" style={{ background: eink.bg }}>
      <Sidebar items={navItems} active={tab} onSelect={setTab} accent={eink.violet} userName="Homework & Study" role="Company Admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: eink.surface, borderColor: eink.border }}>
          <p className="font-black text-base" style={{ color: eink.text }}>
            {tab === 'overview' ? 'Centre Overview' : tab === 'students' ? 'All Students' : tab === 'reports' ? 'Reports' : 'Settings'}
          </p>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: eink.red.border, background: eink.red.bg, color: eink.red.text }}>5</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Active students', value: '24', icon: GraduationCap, c: eink.blue },
                  { label: 'Tutors', value: '3', icon: Users, c: eink.teal },
                  { label: 'Pending marking', value: '7', icon: ClipboardList, c: eink.amber },
                  { label: 'Avg attendance', value: '91%', icon: UserCheck, c: eink.green },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border p-4" style={{ background: s.c.bg, borderColor: s.c.border }}>
                    <s.icon size={18} style={{ color: s.c.text }} className="mb-2" />
                    <p className="text-2xl font-black" style={{ color: s.c.text }}>{s.value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: s.c.text }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: eink.textLight }}>Alerts</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: eink.red.border }}>
                <div className="px-4 py-1.5" style={{ background: eink.red.bg }}><p className="text-xs font-bold" style={{ color: eink.red.text }}>ACTION NEEDED</p></div>
                {[
                  { icon: AlertCircle, color: eink.red, msg: "Sophie Citizen has 1 overdue assignment" },
                  { icon: AlertCircle, color: eink.amber, msg: "Tom Wright's attendance below 75%" },
                  { icon: AlertCircle, color: eink.amber, msg: "7 submissions waiting for marking" },
                ].map((a, i) => (
                  <div key={i} className="p-3 flex items-center gap-3 border-t" style={{ background: eink.surface, borderColor: eink.border }}>
                    <a.icon size={15} style={{ color: a.color.text }} />
                    <p className="text-sm" style={{ color: eink.textMid }}>{a.msg}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: eink.textLight }}>Recent activity</p>
              {[
                { text: 'Jacob Citizen submitted Fractions Worksheet', time: '2h ago', c: eink.green },
                { text: 'Mr. Harrison graded Priya S. — 18/20', time: '4h ago', c: eink.blue },
                { text: 'New message from Mary Citizen', time: 'Yesterday', c: eink.violet },
              ].map(a => (
                <div key={a.text} className="rounded-xl border p-3 flex items-start gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.c.text }} />
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: eink.textMid }}>{a.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: eink.textLight }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </>
          )}
          {tab === 'students' && (
            <>
              <div className="flex gap-2">
                <div className="flex-1 border rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: eink.surface, borderColor: eink.border }}>
                  <Filter size={13} style={{ color: eink.textLight }} />
                  <span className="text-sm" style={{ color: eink.textLight }}>Search students...</span>
                </div>
                <button className="w-10 h-10 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: eink.borderStrong, background: eink.text }}>
                  <Plus size={17} style={{ color: eink.surface }} />
                </button>
              </div>
              {students.map(s => (
                <div key={s.name} className="rounded-xl border p-3 flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xl flex-shrink-0" style={{ borderColor: eink.border }}>{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: eink.text }}>{s.name}</p>
                    <p className="text-xs" style={{ color: eink.textLight }}>{s.year} · {s.tutor}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {s.status === 'overdue' && <Pill label="Overdue" c={eink.red} />}
                    {s.status === 'absent' && <Pill label="Low attend." c={eink.amber} />}
                    {s.status === 'ok' && <Pill label="On track" c={eink.green} />}
                    <span className="text-[10px]" style={{ color: eink.textLight }}>{s.att}% attend.</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {tab === 'reports' && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: eink.textLight }}>Quick reports</p>
              {[
                { title: 'Term 1 — All students', sub: 'Grades, attendance & submissions', icon: '📊', ready: true },
                { title: 'Attendance summary', sub: 'February 2026 · All classes', icon: '📅', ready: true },
                { title: 'Outstanding submissions', sub: '7 students · Needs attention', icon: '⚠️', ready: false },
                { title: 'Tutor activity log', sub: 'Marking & messaging activity', icon: '👨‍🏫', ready: true },
              ].map(r => (
                <div key={r.title} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: eink.surface, borderColor: eink.border }}>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0" style={{ background: eink.violet.bg, borderColor: eink.violet.border }}>{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: eink.text }}>{r.title}</p>
                    <p className="text-xs" style={{ color: eink.textLight }}>{r.sub}</p>
                  </div>
                  <button className="w-9 h-9 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: r.ready ? eink.borderStrong : eink.border, background: r.ready ? eink.text : eink.bg }}>
                    {r.ready ? <Download size={14} style={{ color: eink.surface }} /> : <Eye size={14} style={{ color: eink.textMid }} />}
                  </button>
                </div>
              ))}
              <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: eink.violet.bg, borderColor: eink.violet.border }}>
                <Info size={16} style={{ color: eink.violet.text }} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm" style={{ color: eink.violet.text }}>Custom date-range reports are available on the desktop dashboard.</p>
              </div>
            </>
          )}
          {tab === 'settings' && (
            <div className="space-y-3">
              {[{ label: 'Company name', val: 'Homework & Study Academy' }, { label: 'Academic year', val: '2025–2026' }, { label: 'Current term', val: 'Term 1' }, { label: 'Timezone', val: 'AEST (GMT+10)' }].map(s => (
                <div key={s.label} className="rounded-xl border p-4" style={{ background: eink.surface, borderColor: eink.border }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: eink.textLight }}>{s.label}</p>
                  <p className="font-semibold text-sm" style={{ color: eink.text }}>{s.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EinkPreview() {
  const [role, setRole] = useState<Role>('student');
  const [isLandscape, setIsLandscape] = useState(false);

  const roles: { key: Role; label: string; accent: string }[] = [
    { key: 'student', label: 'Student', accent: 'text-blue-700' },
    { key: 'parent', label: 'Parent', accent: 'text-violet-700' },
    { key: 'tutor', label: 'Tutor', accent: 'text-teal-700' },
    { key: 'admin', label: 'Admin', accent: 'text-gray-800' },
  ];

  const descriptions: Record<Role, { title: string; points: string[] }> = {
    student: {
      title: 'What you\'re seeing',
      points: [
        'Colours are muted/desaturated — this is how Kaleido 3 e-ink renders colour. Bright blue becomes a soft slate-blue; red becomes a dusty rose.',
        'Black text on white background looks crisp and sharp — e-ink excels here.',
        'The sidebar navigation replaces the bottom tab bar. Wider screen = room for persistent navigation.',
        'Touch targets are large — important because e-ink has a slight input delay.',
        'The PDF annotator uses real SVG drawing — on the real device this maps to stylus strokes.',
      ],
    },
    parent: {
      title: 'Parent on e-ink',
      points: [
        'Parent is more likely to use the web app on a phone, but if using a shared family tablet this is what they\'d see.',
        'All children visible in a clean list with status at a glance — no colour needed to understand urgency (bold text + borders carry the meaning).',
        'Messages are easy to read — black text on white is ideal for e-ink.',
      ],
    },
    tutor: {
      title: 'Tutor on e-ink tablet',
      points: [
        'Roll call works perfectly on e-ink — tap ✓ or ✗ per student, or mark all present in one tap.',
        'The marking screen shows the student\'s submitted worksheet answers, grade picker, and feedback area — all in high-contrast black and white.',
        'No colours required to understand the interface — bold labels and borders carry the hierarchy.',
      ],
    },
    admin: {
      title: 'Admin on e-ink',
      points: [
        'Stats grid uses very light tinted backgrounds — these will appear as faint washes on a real Kaleido 3 screen.',
        'Alert section uses black text and border-only styling — still obvious without relying on red colour.',
        'Student roster with status pills — colour is a hint, but bold text is the primary indicator.',
        'Reports downloadable with a single tap — no nested menus.',
      ],
    },
  };

  const desc = descriptions[role];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900">eSlate — E-Ink Device Preview</h1>
            <p className="text-sm text-gray-400">ONYX Air 3C · 10.3" · Kaleido 3 colour simulation · Tap to interact</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsLandscape(l => !l)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${isLandscape ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              <span style={{ display: 'inline-block', transform: isLandscape ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>⬜</span>
              {isLandscape ? 'Landscape' : 'Portrait'}
            </button>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {roles.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === r.key ? `bg-white shadow ${r.accent}` : 'text-gray-500'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className={`flex gap-12 items-start justify-center ${isLandscape ? 'flex-col' : 'flex-col xl:flex-row'}`}>
          {/* Device mockup */}
          <EinkDeviceMockup label={`${role.charAt(0).toUpperCase() + role.slice(1)} · ONYX Air 3C`} isLandscape={isLandscape}>
            {role === 'student' && <StudentEink />}
            {role === 'parent'  && <ParentEink />}
            {role === 'tutor'   && <TutorEink />}
            {role === 'admin'   && <AdminEink />}
          </EinkDeviceMockup>

          {/* Description panel */}
          <div className="flex-1 max-w-md">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{desc.title}</h2>
            <p className="text-sm text-gray-500 mb-6">All colours are intentionally muted to simulate Kaleido 3 e-ink rendering.</p>

            <div className="space-y-4 mb-8">
              {desc.points.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>

            {/* Colour comparison */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <p className="text-sm font-bold text-gray-900 mb-4">Colour comparison — LCD vs e-ink</p>
              <div className="space-y-3">
                {[
                  { label: 'Status — OK', lcd: '#16a34a', einkC: eink.green.bg, einkT: eink.green.text, einkB: eink.green.border },
                  { label: 'Status — Overdue', lcd: '#dc2626', einkC: eink.red.bg, einkT: eink.red.text, einkB: eink.red.border },
                  { label: 'Status — Pending', lcd: '#d97706', einkC: eink.amber.bg, einkT: eink.amber.text, einkB: eink.amber.border },
                  { label: 'Accent — Tutor', lcd: '#0d9488', einkC: eink.teal.bg, einkT: eink.teal.text, einkB: eink.teal.border },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 w-28 flex-shrink-0">{c.label}</p>
                    <div className="flex-1 h-7 rounded-lg border" style={{ background: c.lcd }} />
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                    <div className="flex-1 h-7 rounded-lg border" style={{ background: c.einkC, borderColor: c.einkB }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Left = LCD/phone. Right = how it appears on Kaleido 3 e-ink.</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-bold text-amber-800 mb-1">This is a clickable prototype</p>
              <p className="text-sm text-amber-700">Switch roles above to explore all four views. When you're happy with the direction, I'll build the real e-ink optimised dashboards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
