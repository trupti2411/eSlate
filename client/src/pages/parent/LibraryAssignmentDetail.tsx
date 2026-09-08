import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams } from 'wouter';
import { ChevronLeft, Clock, FileText, Star, Pen, Eye } from 'lucide-react';
import { LibraryAnnotator } from '@/components/LibraryAnnotator';

interface QuestionRow {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  maxMarks: number;
}
interface MarkRow {
  questionId: string;
  finalScore: number | null;
  provisionalScore: number | null;
  tutorComments: string | null;
}
interface AllocationDetail {
  allocation: {
    id: string;
    dueAt: string;
    releaseAt: string | null;
    allocStatus: string;
    currentAttempt: number;
    studentNote: string | null;
  };
  libraryItem: {
    title: string;
    description: string | null;
    instructions: string | null;
    maxMarks: number | null;
    questions: QuestionRow[];
  };
  submission: {
    enteredAnswers: Record<string, string> | null;
    answerImages: Record<string, string> | null;
    isLate: boolean;
    finalScore: number | null;
    provisionalScore: number | null;
    tutorFeedback: string | null;
    tutorAnnotations: string | null;
  } | null;
  marks: MarkRow[];
}

const PRE_START_STATUSES = ['scheduled', 'assigned', 'in_progress'];

export default function ParentLibraryAssignmentDetail() {
  const { user } = useAuth();
  const params = useParams<{ studentId: string; allocationId: string }>();
  const [showAnnotations, setShowAnnotations] = useState(false);

  const { data, isLoading } = useQuery<AllocationDetail>({
    queryKey: [`/api/parent/library-assignments/${params.allocationId}`],
    enabled: !!params.allocationId && !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Assignment not found.</p>
          <Link href={`/parent/students/${params.studentId}/library-assignments`} className="mt-3 inline-block text-rose-600 text-sm font-semibold hover:underline">
            Back to assignments
          </Link>
        </div>
      </div>
    );
  }

  const { allocation, libraryItem, submission, marks } = data;
  const isPreStart = PRE_START_STATUSES.includes(allocation.allocStatus) && !submission;
  const isReturned = allocation.allocStatus === 'returned';
  const marksByQuestion: Record<string, MarkRow> = {};
  for (const m of marks) marksByQuestion[m.questionId] = m;

  const questionsWithImages = libraryItem.questions
    .map(q => ({ questionId: q.id, questionNumber: q.questionNumber, imageUrl: submission?.answerImages?.[q.id] }))
    .filter((q): q is { questionId: string; questionNumber: number; imageUrl: string } => !!q.imageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-rose-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href={`/parent/students/${params.studentId}/library-assignments`} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200">Assignment</p>
            <h1 className="text-xl font-black truncate">{libraryItem.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm flex items-center gap-1.5 mb-2 text-gray-500">
            <Clock size={13} /> Due {new Date(allocation.dueAt).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {libraryItem.description && <p className="text-sm text-gray-600 mb-2">{libraryItem.description}</p>}
          {libraryItem.instructions && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{libraryItem.instructions}</p>}

          {isReturned && (submission?.finalScore != null) && libraryItem.maxMarks != null && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-center bg-emerald-50 rounded-xl px-4 py-3">
                <p className="text-2xl font-black text-emerald-700">{submission.finalScore}/{libraryItem.maxMarks}</p>
                <p className="text-xs text-emerald-600 font-semibold">Score</p>
              </div>
              {questionsWithImages.length > 0 && submission?.tutorAnnotations && (
                <button
                  onClick={() => setShowAnnotations(true)}
                  className="bg-gray-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                >
                  <Pen size={14} /> View Marked-Up Work
                </button>
              )}
            </div>
          )}
          {isReturned && submission?.tutorFeedback && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Tutor Feedback
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{submission.tutorFeedback}</p>
            </div>
          )}
        </div>

        {isPreStart ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <Eye size={22} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">
              {allocation.allocStatus === 'scheduled' ? 'This assignment hasn’t been released to your child yet.' : 'Your child hasn’t started this assignment yet.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">You can see the assignment brief above. Questions will be visible here once your child begins.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {libraryItem.questions.map(q => {
              const mark = marksByQuestion[q.id];
              const score = mark?.finalScore ?? mark?.provisionalScore ?? null;
              const answer = submission?.enteredAnswers?.[q.id];
              const hasImage = !!submission?.answerImages?.[q.id];
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                        {q.questionNumber}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{q.questionText}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isReturned && score != null && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <Star size={11} /> {score}/{q.maxMarks}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{q.maxMarks} marks</span>
                    </div>
                  </div>
                  {hasImage ? (
                    <img
                      src={submission!.answerImages![q.id]}
                      alt={`Answer to question ${q.questionNumber}`}
                      className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[60px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {answer || <span className="text-gray-400 italic">No answer yet</span>}
                      </p>
                    </div>
                  )}
                  {isReturned && mark?.tutorComments && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
                        <FileText size={11} /> Tutor Comment
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">{mark.tutorComments}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showAnnotations && submission?.tutorAnnotations && (
        <LibraryAnnotator
          images={questionsWithImages}
          existingAnnotations={submission.tutorAnnotations}
          isViewOnly
          assignmentTitle={libraryItem.title}
          onClose={() => setShowAnnotations(false)}
        />
      )}
    </div>
  );
}
