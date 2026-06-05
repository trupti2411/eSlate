import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, X, Save, Loader2 } from 'lucide-react';

/**
 * Reusable standalone course-creation modal (ESLATE-8 / ESLATE-9).
 *
 * Name (required, ≤150), Description (optional, ≤500) and a set of subject
 * checkboxes (≥1 required) sourced from /api/subjects. POSTs to /api/courses —
 * the same endpoint the inline course creator in the Create Class modal uses —
 * and invalidates the /api/courses cache so the new course is immediately
 * available as a Catalogue Parent. Used by the dashboard Quick Actions and the
 * standalone Courses page.
 */
interface SubjectRow { id: number; name: string; code?: string }

const NAME_MAX = 150;
const DESC_MAX = 500;

export default function CreateCourseModal({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated?: (course: { id: number; name: string }) => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectIds, setSubjectIds] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });

  const toggleSubject = (id: number) => {
    setDirty(true);
    setSubjectIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Course name is required';
  else if (name.trim().length > NAME_MAX) errors.name = `Max ${NAME_MAX} characters`;
  if (description.length > DESC_MAX) errors.description = `Max ${DESC_MAX} characters`;
  if (subjectIds.size === 0) errors.subjects = 'Select at least one subject';
  const isValid = Object.keys(errors).length === 0;

  const m = useMutation({
    mutationFn: () =>
      apiRequest('/api/courses', 'POST', {
        name: name.trim(),
        description: description.trim() || null,
        subject_ids: Array.from(subjectIds),
      }),
    onSuccess: (course: any) => {
      toast({ title: 'Course created successfully' });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onCreated?.(course);
      onClose();
    },
    onError: (e: any) =>
      toast({ title: 'Could not create course', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    m.mutate();
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    onClose();
  };

  const err = (k: string) =>
    submitted && errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null;

  const descOver = description.length > DESC_MAX;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Create course
          </h3>
          <button onClick={handleCancel} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Course name <span className="text-rose-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setDirty(true); setName(e.target.value); }}
              placeholder="What's this course called? e.g. WEMT, Foundation, OC Test Prep"
              maxLength={NAME_MAX + 50}
              className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${submitted && errors.name ? 'border-red-300' : 'border-gray-200'}`}
              autoFocus
            />
            {err('name')}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => { setDirty(true); setDescription(e.target.value); }}
              rows={3}
              placeholder="What this course covers — students and parents will see this."
              className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${descOver ? 'border-red-300' : 'border-gray-200'}`}
            />
            <div className="flex items-center justify-between mt-1">
              {err('description') ?? <span />}
              <span className={`text-xs ${descOver ? 'text-red-600' : 'text-gray-400'}`}>{description.length} / {DESC_MAX}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Subjects this course covers <span className="text-rose-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {subjects.map(s => {
                const checked = subjectIds.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-left transition-colors ${checked ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                      {checked && <span className="w-2 h-2 bg-white rounded-sm" />}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Classes in this course can only pick from this set.</p>
            {err('subjects')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={handleCancel} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(submitted && !isValid) || m.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            {m.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {m.isPending ? 'Creating…' : 'Create course'}
          </button>
        </div>
      </div>
    </div>
  );
}
