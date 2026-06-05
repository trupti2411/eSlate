import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { X, Save, Loader2, Pencil, GraduationCap, AlertTriangle } from 'lucide-react';

/**
 * View + edit a Course (ESLATE-15). View-by-default; Edit reuses the same
 * name/description/subject-checkbox form as Create Course (ESLATE-8/9).
 *
 * Removing a subject is destructive — it cascades to every linked class that
 * uses it. We warn (listing affected classes) before saving; the server does
 * the actual cascade in a transaction and returns an impact summary we surface
 * as a post-save notice.
 */
interface SubjectRow { id: number; name: string; code?: string }
interface LinkedClass { id: string; name: string; yearGroup?: string | null; subjects: string[]; subjectIds: number[] }
interface CourseDetail {
  id: number;
  name: string;
  description?: string | null;
  subjects?: { id: number; name: string; code?: string }[];
  classes?: LinkedClass[];
  created_at?: string | null;
  updated_at?: string | null;
  updatedBy?: { name?: string } | null;
}

const NAME_MAX = 150;
const DESC_MAX = 500;

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

export default function CourseDetailModal({
  courseId, onClose,
}: {
  courseId: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: course } = useQuery<CourseDetail>({ queryKey: [`/api/courses/${courseId}`] });
  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectIds, setSubjectIds] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Seed the form from the loaded course (and re-seed when leaving edit mode).
  useEffect(() => {
    if (!course || editing) return;
    setName(course.name ?? '');
    setDescription(course.description ?? '');
    setSubjectIds(new Set((course.subjects ?? []).map(s => s.id)));
  }, [course, editing]);

  const originalSubjectIds = useMemo(
    () => new Set((course?.subjects ?? []).map(s => s.id)),
    [course],
  );

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

  // Subjects being removed, and which linked classes currently use them.
  const removedIds = useMemo(
    () => Array.from(originalSubjectIds).filter(id => !subjectIds.has(id)),
    [originalSubjectIds, subjectIds],
  );
  const affectedClasses = useMemo(() => {
    if (!removedIds.length) return [];
    return (course?.classes ?? []).filter(c => c.subjectIds.some(id => removedIds.includes(id)));
  }, [course, removedIds]);

  const m = useMutation({
    mutationFn: () =>
      apiRequest(`/api/courses/${courseId}`, 'PATCH', {
        name: name.trim(),
        description: description.trim() || null,
        subject_ids: Array.from(subjectIds),
      }),
    onSuccess: (res: any) => {
      const empties: string[] = res?.impact?.classesLeftEmpty ?? [];
      const affected: any[] = res?.impact?.affectedClasses ?? [];
      toast({ title: 'Course updated successfully' });
      if (affected.length) {
        toast({
          title: 'Subject changes affected linked classes',
          description:
            `${affected.map(a => a.name).join(', ')} had subjects removed.` +
            (empties.length ? ` ${empties.join(', ')} now has no subjects — please review.` : '') +
            ' Notify students or parents if required.',
          variant: 'destructive',
        });
      }
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      qc.invalidateQueries({ queryKey: ['/api/course-offerings'] });
      setEditing(false);
      setDirty(false);
      setSubmitted(false);
    },
    onError: (e: any) =>
      toast({ title: 'Could not update course', description: e.message ?? 'Try again.', variant: 'destructive' }),
  });

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    if (affectedClasses.length) {
      const lines = affectedClasses.map(c => `• ${c.name}`).join('\n');
      const emptied = affectedClasses.filter(c => c.subjectIds.every(id => removedIds.includes(id)));
      const emptyWarn = emptied.length
        ? `\n\nThis will leave ${emptied.map(c => c.name).join(', ')} with no subjects assigned. Please review after saving.`
        : '';
      const ok = window.confirm(
        `The following classes are using subjects you're removing:\n\n${lines}\n\n` +
        `Removing these subjects will also remove them from those classes. Do you want to continue?${emptyWarn}`,
      );
      if (!ok) return;
    }
    m.mutate();
  };

  const handleClose = () => {
    if (editing && dirty && !window.confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    onClose();
  };

  const cancelEdit = () => {
    if (dirty && !window.confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    setEditing(false);
    setDirty(false);
    setSubmitted(false);
  };

  const err = (k: string) => (submitted && errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null);
  const descOver = description.length > DESC_MAX;
  const updatedByName = course?.updatedBy?.name ?? '';
  const classes = course?.classes ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
              {(course?.name ?? 'C').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-gray-900 truncate">{course?.name ?? 'Loading…'}</h3>
              <p className="text-xs text-gray-500">
                {classes.length} linked class{classes.length === 1 ? '' : 'es'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editing && course && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-3 py-2 rounded-xl"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
            <button onClick={handleClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          {!course ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : !editing ? (
            <>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">About</h4>
                <p className="text-xs font-semibold text-gray-500">Description</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap mt-0.5">{course.description || '—'}</p>
                <p className="text-xs font-semibold text-gray-500 mt-3">Subjects</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(course.subjects ?? []).length === 0
                    ? <span className="text-sm text-gray-400">—</span>
                    : (course.subjects ?? []).map(s => (
                      <span key={s.id} className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">{s.name}</span>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Linked classes ({classes.length})
                </h4>
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-400">No classes are linked to this course yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {classes.map(c => (
                      <li key={c.id} className="rounded-xl border border-gray-100 p-3 flex items-start gap-3">
                        <GraduationCap size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs text-gray-500">
                            {[c.yearGroup, c.subjects.join(', ') || 'No subjects'].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {updatedByName && course.updated_at && (
                <p className="text-xs text-gray-400">
                  {course.created_at ? `Created ${formatDate(course.created_at)} · ` : ''}
                  Last updated by {updatedByName} on {formatDate(course.updated_at)}
                </p>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Course name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => { setDirty(true); setName(e.target.value); }}
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

              {affectedClasses.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Removing these subjects will also remove them from{' '}
                    <span className="font-bold">{affectedClasses.map(c => c.name).join(', ')}</span>.
                    You'll be asked to confirm before saving.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {editing && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button onClick={cancelEdit} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={(submitted && !isValid) || m.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              {m.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {m.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
