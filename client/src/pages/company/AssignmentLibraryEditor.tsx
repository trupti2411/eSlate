import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation, useParams } from 'wouter';
import {
  ChevronLeft, Plus, Trash2, Edit2, X, BookOpen, FileText, Clock, Award,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdminProfile { userId: string; companyId: string; }
interface Question {
  id: string;
  questionText: string;
  questionType: 'objective' | 'subjective' | 'mcq' | 'fill_in';
  answerKey: string;
  maxMarks: number;
  orderIndex: number;
}
interface LibraryItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  subjects: string[];
  yearGroups: string[];
  estimatedDuration: number | null;
  maxMarks: number | null;
  fileUrl: string;
  libStatus: 'draft' | 'published' | 'archived';
  questions: Question[];
}

const SUBJECTS = ['English', 'Mathematics', 'Reading', 'Science', 'Writing', 'Thinking Skills'];
const YEAR_GROUPS = ['K', ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
const QUESTION_TYPES: { value: Question['questionType']; label: string }[] = [
  { value: 'objective', label: 'Objective' },
  { value: 'subjective', label: 'Subjective' },
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'fill_in', label: 'Fill in the Blank' },
];

export default function AssignmentLibraryEditor() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const isNew = !params.id || params.id === 'new';
  const queryClient = useQueryClient();

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const { data: item, isLoading: itemLoading } = useQuery<LibraryItem>({
    queryKey: [`/api/assignment-library/${params.id}`],
    enabled: !isNew && !!params.id,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [yearGroups, setYearGroups] = useState<string[]>([]);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (item && !initialised.current) {
      initialised.current = true;
      setTitle(item.title ?? '');
      setDescription(item.description ?? '');
      setInstructions(item.instructions ?? '');
      setSubjects(item.subjects ?? []);
      setYearGroups(item.yearGroups ?? []);
      setEstimatedDuration(item.estimatedDuration != null ? String(item.estimatedDuration) : '');
      setMaxMarks(item.maxMarks != null ? String(item.maxMarks) : '');
      setFileUrl(item.fileUrl ?? '');
      setQuestions(item.questions ?? []);
    }
  }, [item]);

  useEffect(() => {
    if (item?.questions) setQuestions(item.questions);
  }, [item?.questions]);

  const createMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/assignment-library', {
      companyId,
      title: title.trim(),
      description,
      instructions,
      subjects,
      yearGroups,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
      maxMarks: maxMarks ? Number(maxMarks) : undefined,
      fileUrl,
    }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/assignment-library`] });
      navigate(`/company/assignment-library/${data.id}`);
    },
    onError: (e: any) => setFormError(e?.message ?? 'Failed to create assignment.'),
  });

  const updateMutation = useMutation({
    mutationFn: () => apiRequest('PATCH', `/api/assignment-library/${params.id}`, {
      title: title.trim(),
      description,
      instructions,
      subjects,
      yearGroups,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
      maxMarks: maxMarks ? Number(maxMarks) : undefined,
      fileUrl,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
    onError: (e: any) => setFormError(e?.message ?? 'Failed to save.'),
  });

  const publishMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/assignment-library/${params.id}/publish`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] }),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/assignment-library/${params.id}/archive`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] }),
  });

  const addQuestionMutation = useMutation({
    mutationFn: (q: Omit<Question, 'id' | 'orderIndex'>) =>
      apiRequest('POST', `/api/assignment-library/${params.id}/questions`, q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] });
      setShowAddQuestion(false);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (q: Question) =>
      apiRequest('PATCH', `/api/assignment-library/questions/${q.id}`, q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] });
      setEditingQuestion(null);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: string) =>
      apiRequest('DELETE', `/api/assignment-library/questions/${qId}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/assignment-library/${params.id}`] }),
  });

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSaveDraft = () => {
    setFormError('');
    if (!title.trim()) { setFormError('Title is required.'); return; }
    if (isNew) { createMutation.mutate(); } else { updateMutation.mutate(); }
  };

  if (!isNew && itemLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStatus = item?.libStatus ?? 'draft';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company/assignment-library" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Assignment Library</p>
            <h1 className="text-xl font-black truncate">{isNew ? 'New Assignment' : (title || 'Edit Assignment')}</h1>
          </div>
          {!isNew && currentStatus !== 'archived' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {currentStatus === 'draft' && (
                <button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl"
                >
                  {publishMutation.isPending ? 'Publishing…' : 'Publish'}
                </button>
              )}
              {currentStatus === 'published' && (
                <button
                  onClick={() => archiveMutation.mutate()}
                  disabled={archiveMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl"
                >
                  {archiveMutation.isPending ? 'Archiving…' : 'Archive'}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {formError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
            {formError}
          </div>
        )}

        {/* Basic details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <FileText size={14} className="text-indigo-500" /> Assignment Details
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Reading Comprehension — Term 2"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this assignment…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Student Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={3}
              placeholder="Instructions shown to students when working on this assignment…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">File / Resource URL</label>
            <input
              type="url"
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              placeholder="https://…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleMulti(subjects, s, setSubjects)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      subjects.includes(s)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Year Groups</label>
              <div className="flex flex-wrap gap-2">
                {YEAR_GROUPS.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => toggleMulti(yearGroups, y, setYearGroups)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-colors ${
                      yearGroups.includes(y)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
                <Clock size={12} /> Est. Duration (minutes)
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                min={0}
                placeholder="e.g. 45"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
                <Award size={12} /> Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={e => setMaxMarks(e.target.value)}
                min={0}
                placeholder="e.g. 100"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && <span className="text-xs text-green-600 font-semibold">Saved!</span>}
            <button
              onClick={handleSaveDraft}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving…' : 'Save Draft'}
            </button>
          </div>
        </div>

        {/* Questions section — only after creation */}
        {!isNew && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-500" /> Questions ({questions.length})
              </h2>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No questions yet. Add your first question.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{q.questionText}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{q.questionType.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-gray-500">{q.maxMarks} marks</span>
                            {q.answerKey && <span className="text-xs text-gray-400 truncate max-w-[160px]">Key: {q.answerKey}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Delete this question?')) deleteQuestionMutation.mutate(q.id); }}
                          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student preview */}
        {!isNew && questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Student Preview</h2>
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-lg font-black text-gray-900 mb-1">{title}</h3>
              {instructions && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{instructions}</p>}
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Q{i + 1}. {q.questionText}
                      <span className="ml-2 text-xs text-gray-400 font-normal">({q.maxMarks} marks)</span>
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg h-16 flex items-center px-3 text-xs text-gray-400 italic">
                      Student answer area
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {(showAddQuestion || editingQuestion) && (
        <QuestionModal
          question={editingQuestion}
          onClose={() => { setShowAddQuestion(false); setEditingQuestion(null); }}
          onSave={(q) => {
            if (editingQuestion) {
              updateQuestionMutation.mutate({ ...editingQuestion, ...q } as Question);
            } else {
              addQuestionMutation.mutate(q as Omit<Question, 'id' | 'orderIndex'>);
            }
          }}
          isSaving={addQuestionMutation.isPending || updateQuestionMutation.isPending}
        />
      )}
    </div>
  );
}

function QuestionModal({
  question, onClose, onSave, isSaving,
}: {
  question: Question | null;
  onClose: () => void;
  onSave: (q: Partial<Question>) => void;
  isSaving: boolean;
}) {
  const [questionText, setQuestionText] = useState(question?.questionText ?? '');
  const [questionType, setQuestionType] = useState<Question['questionType']>(question?.questionType ?? 'subjective');
  const [answerKey, setAnswerKey] = useState(question?.answerKey ?? '');
  const [maxMarks, setMaxMarks] = useState(question?.maxMarks ? String(question.maxMarks) : '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!questionText.trim()) { setError('Question text is required.'); return; }
    if (!maxMarks || Number(maxMarks) < 1) { setError('Max marks must be at least 1.'); return; }
    onSave({ questionText: questionText.trim(), questionType, answerKey, maxMarks: Number(maxMarks) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">{question ? 'Edit Question' : 'Add Question'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        {error && <p className="text-sm text-rose-600 mb-3 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Question Text *</label>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Enter the question…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Type</label>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value as Question['questionType'])}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Max Marks *</label>
              <input
                type="number"
                value={maxMarks}
                onChange={e => setMaxMarks(e.target.value)}
                min={1}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Answer Key (optional)</label>
            <textarea
              value={answerKey}
              onChange={e => setAnswerKey(e.target.value)}
              rows={2}
              placeholder="Model answer or marking guide…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            {isSaving ? 'Saving…' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
