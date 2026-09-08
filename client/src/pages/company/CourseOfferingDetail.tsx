import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, LogOut, ArrowLeft, Pencil, X, Save, Archive, RotateCcw, Copy, BookOpen, GraduationCap, AlertTriangle, Clock } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

interface SubjectRow { id: number; code: string; name: string; }
interface CourseData {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | string;
  subjectIds: number[];
  archivedAt: string | null;
  archivedByName: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
  createdAt: string;
}
interface LinkedClass {
  id: string;
  name: string;
  status: string;
  yearGroupCode: string | null;
  level: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scheduleLabel(c: LinkedClass): string {
  const days = (c.daysOfWeek ?? []).map(d => DAY_LABELS[d]).join('/');
  if (!days && !c.startTime) return '';
  return `${days}${c.startTime ? ` ${c.startTime.slice(0, 5)}` : ''}`;
}

export default function CourseOfferingDetail() {
  const [, params] = useRoute('/company/courses/:id');
  const [, navigate] = useLocation();
  const courseId = params?.id;
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const { data: course, isLoading } = useQuery<CourseData>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  const { data: subjects = [] } = useQuery<SubjectRow[]>({ queryKey: ['/api/subjects'] });
  const { data: linkedClasses = [] } = useQuery<LinkedClass[]>({
    queryKey: [`/api/courses/${courseId}/classes`],
    enabled: !!courseId,
  });

  const subjectNames = (course?.subjectIds ?? [])
    .map(id => subjects.find(s => s.id === id)?.name)
    .filter(Boolean) as string[];

  const archiveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/courses/${courseId}/archive`, 'POST', {}),
    onSuccess: () => {
      toast({ title: 'Course archived', description: 'Linked classes were archived too.' });
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/classes`] });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      setArchiveConfirm(false);
    },
    onError: (e: any) => toast({ title: 'Could not archive course', description: e.message, variant: 'destructive' }),
  });

  const restoreMutation = useMutation({
    mutationFn: () => apiRequest(`/api/courses/${courseId}/restore`, 'POST', {}),
    onSuccess: () => {
      toast({ title: 'Course restored' });
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (e: any) => toast({ title: 'Could not restore course', description: e.message, variant: 'destructive' }),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiRequest(`/api/courses/${courseId}/duplicate`, 'POST', {}),
    onSuccess: (data: any) => {
      toast({ title: `Duplicated as "${data.name}"` });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      navigate(`/company/courses/${data.id}`);
    },
    onError: (e: any) => toast({ title: 'Could not duplicate course', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading…</div>;
  }
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Course not found.</p>
          <Link href="/company/courses" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Back to courses</Link>
        </div>
      </div>
    );
  }

  const isArchived = course.status === 'archived';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/company/courses" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center flex-shrink-0">
                <ArrowLeft size={16} />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Trophy size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Course</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">{course.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <NotificationBell />
              <button onClick={() => logoutMutation.mutate()} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center" aria-label="Sign out">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isArchived && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <Archive size={14} /> This course is archived. Restore it to make it active again.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">About</h2>
            {!isArchived && (
              <button
                onClick={() => setEditOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {course.description || <span className="text-gray-400 italic">No description</span>}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {subjectNames.length > 0 ? subjectNames.map(name => (
              <span key={name} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{name}</span>
            )) : <span className="text-xs text-gray-400 italic">No subjects</span>}
          </div>

          <div className="text-xs text-gray-400 pt-3 border-t border-gray-100 space-y-0.5">
            <p>Date created: {formatDate(course.createdAt)}</p>
            {course.updatedByName && <p>Last updated by {course.updatedByName} on {formatDate(course.updatedAt)}</p>}
            {isArchived && course.archivedByName && <p>Archived by {course.archivedByName} on {formatDate(course.archivedAt)}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
            Linked Classes ({linkedClasses.length})
          </h2>
          {linkedClasses.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No classes linked to this course yet.</p>
          ) : (
            <ul className="space-y-2">
              {linkedClasses.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/company/classes/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          {[c.yearGroupCode, c.level, scheduleLabel(c)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      c.status === 'archived' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {c.status === 'archived' ? 'Archived' : 'Active'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 pb-6">
          {!isArchived && (
            <button
              onClick={() => duplicateMutation.mutate()}
              disabled={duplicateMutation.isPending}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <Copy size={14} /> {duplicateMutation.isPending ? 'Duplicating…' : 'Duplicate Course'}
            </button>
          )}
          {isArchived ? (
            <button
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <RotateCcw size={14} /> {restoreMutation.isPending ? 'Restoring…' : 'Restore Course'}
            </button>
          ) : (
            <button
              onClick={() => setArchiveConfirm(true)}
              className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <Archive size={14} /> Archive Course
            </button>
          )}
        </div>
      </main>

      {editOpen && (
        <EditCourseModal
          course={course}
          subjects={subjects}
          onClose={() => setEditOpen(false)}
        />
      )}

      {archiveConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" /> Archive this course?
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {linkedClasses.filter(c => c.status !== 'archived').length > 0
                ? `This will also archive ${linkedClasses.filter(c => c.status !== 'archived').length} linked class${linkedClasses.filter(c => c.status !== 'archived').length === 1 ? '' : 'es'}.`
                : 'This course has no active linked classes.'}
            </p>
            <p className="text-sm text-gray-500 mb-5">Archived courses can be restored at any time — this is not permanent.</p>
            <div className="flex gap-3">
              <button onClick={() => setArchiveConfirm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Archive size={14} /> {archiveMutation.isPending ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditCourseModal({ course, subjects, onClose }: { course: CourseData; subjects: SubjectRow[]; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description ?? '');
  const [pickedSubjectIds, setPickedSubjectIds] = useState<Set<number>>(new Set(course.subjectIds));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [removalWarning, setRemovalWarning] = useState<{ removedSubjects: string[]; affectedClasses: { id: string; name: string }[] } | null>(null);

  const isDirty = name.trim() !== course.name
    || (description.trim() || null) !== (course.description ?? null)
    || pickedSubjectIds.size !== course.subjectIds.length
    || course.subjectIds.some(id => !pickedSubjectIds.has(id));

  const toggleSubject = (id: number) => {
    setPickedSubjectIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: (confirmSubjectRemoval?: boolean) => apiRequest(`/api/courses/${course.id}`, 'PATCH', {
      name: name.trim(),
      description: description.trim() || null,
      subject_ids: Array.from(pickedSubjectIds),
      ...(confirmSubjectRemoval && { confirmSubjectRemoval: true }),
    }),
    onSuccess: () => {
      toast({ title: 'Course updated' });
      qc.invalidateQueries({ queryKey: [`/api/courses/${course.id}`] });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (e: any) => {
      if (e?.body?.message === 'confirm_required') {
        setRemovalWarning({ removedSubjects: e.body.removedSubjects, affectedClasses: e.body.affectedClasses });
        return;
      }
      toast({ title: 'Could not update', description: e.message, variant: 'destructive' });
    },
  });

  const valid = name.trim().length > 0 && pickedSubjectIds.size > 0;

  const handleClose = () => {
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-black flex items-center gap-2"><Pencil size={16} className="text-indigo-600" /> Edit course</h3>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {removalWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5"><AlertTriangle size={12} /> This will affect linked classes</p>
              <p>
                The following classes use a subject you're removing ({removalWarning.removedSubjects.join(', ')}) and will have it removed too:
              </p>
              <ul className="list-disc list-inside">
                {removalWarning.affectedClasses.map(c => <li key={c.id}>{c.name}</li>)}
              </ul>
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Course name <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={150}
              autoFocus
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {submitAttempted && !name.trim() && <p className="text-xs text-rose-600 mt-1">Course name is required.</p>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subjects <span className="text-rose-500">*</span></label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {subjects.map(s => {
                const isOn = pickedSubjectIds.has(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                    className={`text-left rounded-xl border px-3 py-2 text-sm transition-colors ${isOn ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    <span className={`inline-flex w-4 h-4 rounded mr-2 items-center justify-center flex-shrink-0 ${isOn ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`}>
                      {isOn && <span className="text-[10px]">✓</span>}
                    </span>
                    {s.name}
                  </button>
                );
              })}
            </div>
            {submitAttempted && pickedSubjectIds.size === 0 && <p className="text-xs text-rose-600 mt-1">Select at least one subject.</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button onClick={handleClose} className="text-sm font-bold text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl">Cancel</button>
          <button
            onClick={() => {
              setSubmitAttempted(true);
              if (valid) saveMutation.mutate(!!removalWarning);
            }}
            disabled={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={14} /> {saveMutation.isPending ? 'Saving…' : removalWarning ? 'Confirm & Save' : 'Save changes'}
          </button>
        </div>
      </div>

      {confirmDiscard && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-base font-black text-gray-900 mb-2">Discard changes?</h3>
            <p className="text-sm text-gray-600 mb-5">You have unsaved changes. Are you sure you want to discard them?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDiscard(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm">
                Keep editing
              </button>
              <button onClick={onClose} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-sm">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
