import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { GraduationCap, LogOut, ArrowLeft, Plus, X, Trash2, BookOpen, Lock } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

interface Subject {
  id: number | string;
  code: string;
  name: string;
  description?: string | null;
  type: 'builtin' | 'custom';
}

interface AdminProfile {
  userId: string;
  companyId: string;
  companyName?: string;
  company?: { id: string; name: string };
}

const BUILTIN_DESCRIPTIONS: Record<string, string> = {
  English:          'Grammar, comprehension, vocabulary, and language conventions.',
  Mathematics:      'Number, algebra, measurement, space, statistics, and probability.',
  Reading:          'Comprehension strategies, inference, and critical reading skills.',
  Science:          'Scientific concepts, inquiry skills, and experimental thinking.',
  'Thinking Skills':'Logical reasoning, pattern recognition, and problem-solving.',
  Writing:          'Creative writing, persuasive writing, and structured composition.',
};

export default function SubjectsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Subject | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: ['/api/company-admin/profile'],
    enabled: !!user?.id,
  });
  const companyName = adminProfile?.company?.name ?? adminProfile?.companyName;

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
    enabled: !!user,
  });

  const builtIn = subjects.filter(s => s.type === 'builtin');
  const custom   = subjects.filter(s => s.type === 'custom');

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/subjects/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: 'Subject removed' });
      qc.invalidateQueries({ queryKey: ['/api/subjects'] });
      setConfirmDelete(null);
    },
    onError: (e: any) =>
      toast({ title: 'Could not delete subject', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-200">Subjects</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName ?? 'Loading…'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl">
                <ArrowLeft size={12} /> Dashboard
              </Link>
              <NotificationBell />
              <button
                onClick={() => logoutMutation.mutate()}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-teal-50 border-teal-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-teal-700">{builtIn.length}</p>
            <p className="text-xs font-semibold mt-0.5 text-teal-700">Built-in</p>
          </div>
          <div className="rounded-2xl border bg-indigo-50 border-indigo-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">{custom.length}</p>
            <p className="text-xs font-semibold mt-0.5 text-indigo-700">Custom</p>
          </div>
          <div className="rounded-2xl border bg-gray-50 border-gray-200 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-gray-700">{subjects.length}</p>
            <p className="text-xs font-semibold mt-0.5 text-gray-700">Total</p>
          </div>
        </div>

        {/* Built-in subjects */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Lock size={12} /> Built-in subjects
            </h2>
            <span className="text-xs text-gray-400">Standard NSW curriculum subjects</span>
          </div>
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {builtIn.map(s => (
                <li key={s.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black flex-shrink-0 text-xs">
                    {s.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {BUILTIN_DESCRIPTIONS[s.name] ?? ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                    Built-in
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Custom subjects */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <BookOpen size={12} /> Custom subjects
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus size={12} /> Add subject
            </button>
          </div>

          {custom.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-400 flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={18} />
              </div>
              <p className="text-sm text-gray-500">No custom subjects yet.</p>
              <p className="text-xs text-gray-400 mt-1">Add subjects specific to your tutoring programme.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl"
              >
                <Plus size={12} /> Add your first subject
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {custom.map(s => (
                <li key={s.id} className="rounded-xl border border-gray-100 p-3 flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0 text-xs">
                    {s.code.slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.description}</p>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-0.5 inline-block">
                      Custom
                    </span>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(s)}
                    className="w-7 h-7 rounded-lg hover:bg-rose-50 text-gray-300 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    aria-label="Delete subject"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {showCreate && <CreateSubjectModal onClose={() => setShowCreate(false)} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-black text-gray-900">Remove subject?</h3>
            <p className="text-sm text-gray-500 mt-2">
              <span className="font-semibold text-gray-700">{confirmDelete.name}</span> will be removed from your subject list. Existing courses and classes that reference it won't be affected.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-sm font-bold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(String(confirmDelete.id))}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl"
              >
                {deleteMutation.isPending ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateSubjectModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const m = useMutation({
    mutationFn: () =>
      apiRequest('/api/subjects', 'POST', {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
      }),
    onSuccess: () => {
      toast({ title: 'Subject created' });
      qc.invalidateQueries({ queryKey: ['/api/subjects'] });
      onClose();
    },
    onError: (e: any) =>
      toast({ title: 'Could not create subject', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const valid = name.trim().length >= 2 && code.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-teal-600" /> New subject
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Subject name <span className="text-rose-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Creative Arts, Drama, Chinese"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Short code <span className="text-rose-500">*</span>
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 20))}
              placeholder="e.g. ART, DRAMA, CHN"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">2–20 uppercase characters. Used as a label on timetables and reports.</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What this subject covers (optional)"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => m.mutate()}
            disabled={!valid || m.isPending}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={14} /> {m.isPending ? 'Creating…' : 'Create subject'}
          </button>
        </div>
      </div>
    </div>
  );
}
