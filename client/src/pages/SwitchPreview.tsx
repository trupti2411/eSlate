import { useState } from 'react';
import { Sparkles, LayoutDashboard, X, ChevronRight, Settings, User, Bell, LogOut, ArrowLeftRight } from 'lucide-react';

type Option = 'A' | 'B' | 'C';

export default function SwitchPreview() {
  const [selected, setSelected] = useState<Option>('A');
  const [isNew, setIsNew] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Design switch — 3 options</h1>
            <p className="text-sm text-gray-400">Pick the style you prefer, then I'll build it into the real dashboards</p>
          </div>
          <div className="flex gap-2">
            {(['A', 'B', 'C'] as Option[]).map(o => (
              <button
                key={o}
                onClick={() => setSelected(o)}
                className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selected === o ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                Option {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* ── OPTION A — Floating pill button ─────────────────────────────── */}
        {selected === 'A' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Option A — Floating pill button</h2>
              <p className="text-gray-500">A small persistent button fixed to the bottom-right corner of every page after login. Always accessible, never in the way.</p>
            </div>

            {/* Simulated dashboard — Classic */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white" style={{ height: 500 }}>
              {/* Fake top nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-black">eS</span>
                  </div>
                  <span className="font-black text-gray-900">eSlate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell size={14} className="text-gray-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-bold">JC</span>
                  </div>
                </div>
              </div>
              {/* Fake page content */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Classic Dashboard</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Assignments', 'Messages', 'Progress'].map(c => (
                    <div key={c} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 mb-2" />
                      <p className="font-bold text-sm text-gray-800">{c}</p>
                      <p className="text-xs text-gray-400">3 items</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-40 mb-1" />
                        <div className="h-2.5 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE SWITCH — floating pill */}
              <div className="absolute bottom-5 right-5">
                <button
                  onClick={() => setIsNew(n => !n)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl font-bold text-sm transition-all border-2 ${
                    isNew
                      ? 'bg-white text-gray-800 border-gray-200 shadow-gray-200'
                      : 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-300'
                  }`}
                >
                  {isNew
                    ? <><LayoutDashboard size={15} /> Classic design</>
                    : <><Sparkles size={15} /> Try new design</>
                  }
                </button>
              </div>

              {isNew && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <p className="font-black text-lg text-gray-900">New design active</p>
                    <p className="text-sm text-gray-500 mt-1">The new simplified dashboard is loaded</p>
                    <button onClick={() => setIsNew(false)} className="mt-4 text-sm text-indigo-600 font-semibold">← Switch back to Classic</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900 mb-3">How it works</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">✓</span> The button sits in the bottom-right corner — never blocks content</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> One tap switches design instantly; preference auto-saved</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Label changes to tell you which design you're switching <em>to</em></li>
                <li className="flex gap-2"><span className="text-amber-500">→</span> Works on both mobile and tablet; always visible without scrolling</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── OPTION B — Top banner (first login prompt) ───────────────────── */}
        {selected === 'B' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Option B — Welcome banner + nav toggle</h2>
              <p className="text-gray-500">A one-time welcome banner after first login inviting them to try the new design. Once dismissed, a compact toggle lives in the top nav permanently.</p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white" style={{ height: 500 }}>
              {/* Banner */}
              {!bannerDismissed && (
                <div className="bg-indigo-600 text-white px-6 py-3 flex items-center gap-4">
                  <Sparkles size={18} className="flex-shrink-0" />
                  <p className="flex-1 text-sm font-semibold">
                    We have a new simplified design — faster, cleaner, built for touch and stylus.
                    <button onClick={() => setIsNew(true)} className="ml-2 underline font-bold">Try it now</button>
                  </p>
                  <button onClick={() => setBannerDismissed(true)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Nav with toggle */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-black">eS</span>
                  </div>
                  <span className="font-black text-gray-900">eSlate</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* THE SWITCH — in nav */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setIsNew(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isNew ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => setIsNew(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${isNew ? 'bg-indigo-600 shadow text-white' : 'text-gray-500'}`}
                    >
                      <Sparkles size={11} /> New
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-bold">JC</span>
                  </div>
                </div>
              </div>

              {/* Fake content */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{isNew ? 'New Design — Student' : 'Classic Dashboard'}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Assignments', 'Messages', 'Progress'].map(c => (
                    <div key={c} className={`rounded-xl border p-4 ${isNew ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-8 h-8 rounded-lg mb-2 ${isNew ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                      <p className="font-bold text-sm text-gray-800">{c}</p>
                      <p className="text-xs text-gray-400">3 items</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className={`rounded-xl border p-3 flex items-center gap-3 ${isNew ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-10 h-10 rounded-lg flex-shrink-0 ${isNew ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-40 mb-1" />
                        <div className="h-2.5 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900 mb-3">How it works</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Banner appears once after first login — easy to dismiss, not annoying</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Classic / New toggle always visible in the top navigation bar</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> The toggle matches the role colour (indigo for student, teal for tutor, etc.)</li>
                <li className="flex gap-2"><span className="text-amber-500">→</span> Slightly more prominent than Option A — users are more likely to discover it</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── OPTION C — Settings / profile menu ───────────────────────────── */}
        {selected === 'C' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Option C — Profile menu preference</h2>
              <p className="text-gray-500">The design choice lives inside the profile/settings menu. A subtle badge on the profile icon hints that a new design is available.</p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white" style={{ height: 500 }}>
              {/* Nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-black">eS</span>
                  </div>
                  <span className="font-black text-gray-900">eSlate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell size={14} className="text-gray-500" />
                  </div>
                  {/* Profile with badge */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer" onClick={() => setBannerDismissed(d => !d)}>
                      <span className="text-indigo-700 text-xs font-bold">JC</span>
                    </div>
                    {!isNew && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />}
                  </div>
                </div>
              </div>

              {/* Fake content */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{isNew ? 'New Design — Student' : 'Classic Dashboard'}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Assignments', 'Messages', 'Progress'].map(c => (
                    <div key={c} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 mb-2" />
                      <p className="font-bold text-sm text-gray-800">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE SWITCH — profile dropdown (always shown for demo) */}
              <div className="absolute top-16 right-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                <div className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-700 font-bold">JC</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Jacob Citizen</p>
                      <p className="text-xs text-gray-500">Student · Year 5</p>
                    </div>
                  </div>
                </div>
                {/* Design toggle inside menu */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Interface</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight size={14} className="text-gray-500" />
                      <span className="text-sm font-semibold text-gray-800">Design</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                      <button onClick={() => setIsNew(false)} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${!isNew ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Classic</button>
                      <button onClick={() => setIsNew(true)} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${isNew ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>New</button>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  {[{ i: User, l: 'My profile' }, { i: Settings, l: 'Settings' }, { i: LogOut, l: 'Sign out' }].map(({ i: Icon, l }) => (
                    <button key={l} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                      <Icon size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900 mb-3">How it works</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Least obtrusive — no floating buttons, no banners</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> A small blue dot on the profile icon hints the new design exists (disappears once switched)</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Toggle is inside the profile dropdown alongside other preferences</li>
                <li className="flex gap-2"><span className="text-amber-500">→</span> Less discoverable — users who don't open the profile menu may never find it</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Summary comparison ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="font-black text-gray-900 mb-4 text-lg">Quick comparison</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              { opt: 'A', name: 'Floating pill', disc: '★★★★', intru: '★★☆☆', note: 'Best balance — visible but unobtrusive' },
              { opt: 'B', name: 'Nav toggle', disc: '★★★★★', intru: '★★★☆', note: 'Most prominent — great if you want users to actually switch' },
              { opt: 'C', name: 'Profile menu', disc: '★★☆☆', intru: '★☆☆☆', note: 'Most minimal — suits power users, less for first-timers' },
            ].map(r => (
              <div key={r.opt} className={`rounded-xl border p-4 ${selected === r.opt as Option ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100'}`}>
                <p className="font-black text-base text-gray-900 mb-1">Option {r.opt} — {r.name}</p>
                <div className="space-y-1 mb-2">
                  <p className="text-gray-500">Discoverable: {r.disc}</p>
                  <p className="text-gray-500">Intrusive: {r.intru}</p>
                </div>
                <p className="text-xs text-gray-600 italic">{r.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">My recommendation: <strong>Option A or B</strong>. A is subtle and clean; B ensures every user discovers the new design on day one.</p>
        </div>

      </div>
    </div>
  );
}
