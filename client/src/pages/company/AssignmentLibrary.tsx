import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import {
  ChevronLeft, Plus, Edit2, BookOpen, Archive, Users, Search, X, CheckCircle,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdminProfile { userId: string; companyId: string; companyName: string; }
interface LibraryItem {
  id: string;
  title: string;
  subjects: string[];
  yearGroups: string[];
  libStatus: 'draft' | 'published' | 'archived';
  maxMarks: number;
  questionCount: number;
  createdByName: string;
  createdAt: string;
}
interface Classroom { id: string; name: string; }

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const SUBJECTS = ['English', 'Mathematics', 'Reading', 'Science', 'Writing', 'Thinking Skills'];

export default function AssignmentLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [allocateItem, setAllocateItem] = useState<LibraryItem | null>(null);

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const buildParams = () => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    if (subjectFilter) p.set('subject', subjectFilter);
    if (search) p.set('search', search);
    return p.toString() ? `?${p.toString()}` : '';
  };

  const { data: items = [], isLoading } = useQuery<LibraryItem[]>({
    queryKey: [`/api/companies/${companyId}/assignment-library`, statusFilter, subjectFilter, search],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/assignment-library${buildParams()}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/assignment-library/${id}/publish`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] }),
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/assignment-library/${id}/archive`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Content</p>
            <h1 className="text-xl font-black">Assignment Library</h1>
          </div>
          <Link
            href="/company/assignment-library/new"
            className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={14} /> New Assignment
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Items grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded mb-3" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No assignments found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first assignment to get started.</p>
            <Link
              href="/company/assignment-library/new"
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              <Plus size={14} /> New Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 leading-snug flex-1">{item.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_BADGE[item.libStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.libStatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.subjects.map(s => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{item.questionCount} questions</span>
                  <span>{item.maxMarks} marks</span>
                  <span>by {item.createdByName}</span>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50">
                  <Link
                    href={`/company/assignment-library/${item.id}`}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </Link>
                  {item.libStatus === 'draft' && (
                    <button
                      onClick={() => publishMutation.mutate(item.id)}
                      disabled={publishMutation.isPending}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Publish
                    </button>
                  )}
                  {item.libStatus === 'published' && (
                    <button
                      onClick={() => archiveMutation.mutate(item.id)}
                      disabled={archiveMutation.isPending}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Archive size={12} /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => setAllocateItem(item)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Users size={12} /> Allocate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {allocateItem && companyId && (
        <AllocateModal
          item={allocateItem}
          companyId={companyId}
          onClose={() => setAllocateItem(null)}
        />
      )}
    </div>
  );
}

function AllocateModal({ item, companyId, onClose }: { item: LibraryItem; companyId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: classes = [] } = useQuery<Classroom[]>({
    queryKey: [`/api/companies/${companyId}/classes`],
    enabled: !!companyId,
  });

  const allocateMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/assignment-library/${item.id}/allocate`, {
      targetType: 'class',
      classId,
      dueAt: dueDate ? `${dueDate}T23:59:00.000Z` : undefined,
    }),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] });
    },
    onError: (e: any) => setError(e?.message ?? 'Failed to allocate. Please try again.'),
  });

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-gray-900">Allocated!</h3>
          <p className="text-sm text-gray-500 mt-2">"{item.title}" has been allocated to the class.</p>
          <button onClick={onClose} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-sm">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">Allocate Assignment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Allocating: <span className="font-semibold text-gray-900">{item.title}</span></p>
        {error && <p className="text-sm text-rose-600 mb-3 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Class</label>
            <select
              value={classId}
              onChange={e => setClassId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select a class…</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={() => allocateMutation.mutate()}
            disabled={!classId || allocateMutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            {allocateMutation.isPending ? 'Allocating…' : 'Allocate'}
          </button>
        </div>
      </div>
    </div>
  );
}
