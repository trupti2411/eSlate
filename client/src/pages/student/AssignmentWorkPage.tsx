import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Assignment, Submission } from '@shared/schema';
import { AssignmentCompletionArea } from '@/components/AssignmentCompletionArea';
import { ObjectUploader } from '@/components/ObjectUploader';
import {
  ArrowLeft, Upload, CheckCircle, AlertCircle, Send, FileText, Eye
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

export function AssignmentWorkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute('/student/assignment/:id');
  const assignmentId = params?.id;
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const studentDbId = `student-${user?.id}`;

  const { data: assignment, isLoading, error } = useQuery<Assignment>({
    queryKey: ['/api/assignments', assignmentId],
    enabled: !!assignmentId,
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: [`/api/students/${studentDbId}/submissions`],
    enabled: !!studentDbId,
  });

  const currentSubmission = submissions.find((s: Submission) => s.assignmentId === assignmentId);

  const handleBack = () => window.history.back();

  const getUploadParameters = async (file?: { name: string; type?: string }) => {
    const response = await apiRequest('/api/objects/upload', 'POST', { contentType: file?.type });
    return { method: 'PUT' as const, url: response.uploadURL };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful?.length > 0) {
      const newUrls = result.successful.map((f: any) => {
        const key = f.uploadURL.split('/').pop()?.split('?')[0];
        return `/objects/uploads/${key}`;
      });
      setUploadedFiles(prev => [...prev, ...newUrls]);
      toast({ title: `${result.successful.length} file(s) ready`, description: 'Tap Submit to send to your tutor.' });
    }
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/submissions', 'POST', {
        assignmentId: assignment!.id,
        fileUrls: uploadedFiles,
        textResponse: notes,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentDbId}/submissions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentDbId}/assignments`] });
      toast({ title: 'Submitted!', description: 'Your tutor will review and mark your work.' });
      setUploadedFiles([]);
    },
    onError: () => {
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  const handleSubmissionUpdate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/students/${studentDbId}/submissions`] });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h2 className="font-black text-lg mb-2">Not logged in</h2>
          <a href="/" className="text-indigo-600 font-semibold text-sm">Go to login →</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading assignment…</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h2 className="font-black text-lg mb-2">Assignment not found</h2>
          <button onClick={handleBack} className="text-indigo-600 font-semibold text-sm">← Go back</button>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.submissionDate);
  const isOverdue = isPast(dueDate) && !['submitted', 'graded', 'parent_verified'].includes(currentSubmission?.status ?? '');
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isSubmitted = ['submitted', 'graded', 'parent_verified'].includes(currentSubmission?.status ?? '');
  const hasAttachments = (assignment.attachmentUrls || []).length > 0;
  const isWorksheet = assignment.assignmentKind === 'worksheet' && assignment.worksheetId;

  const statusColor = isSubmitted
    ? 'bg-green-100 text-green-700 border-green-200'
    : isOverdue
    ? 'bg-red-100 text-red-700 border-red-200'
    : daysUntilDue <= 2
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  const statusLabel = isSubmitted
    ? '✓ Submitted'
    : isOverdue
    ? 'Overdue'
    : daysUntilDue <= 2
    ? `Due in ${daysUntilDue}d`
    : `Due ${format(dueDate, 'd MMM')}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Nav bar */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">{assignment.title}</p>
          <p className="text-xs text-indigo-200 truncate">{assignment.subject}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Overdue warning strip */}
      {isOverdue && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-700">
            This was due {format(dueDate, 'd MMM yyyy')} — still submit your work, your tutor will be notified.
          </p>
        </div>
      )}

      {/* Graded result strip */}
      {currentSubmission?.status === 'graded' && currentSubmission.score !== null && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-3">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-green-700">
            Marked: {currentSubmission.score}/20
            {currentSubmission.feedback ? ` · "${currentSubmission.feedback}"` : ''}
          </p>
        </div>
      )}

      {/* ── WORKSHEET type ── */}
      {isWorksheet ? (
        <div className="flex-1 overflow-y-auto">
          <AssignmentCompletionArea
            assignment={assignment}
            submission={currentSubmission}
            onSubmissionUpdate={handleSubmissionUpdate}
          />
        </div>
      ) : hasAttachments ? (
        /* ── FILE UPLOAD with pre-attached docs (PDF annotation flow) ── */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <AssignmentCompletionArea
              assignment={assignment}
              submission={currentSubmission}
              onSubmissionUpdate={handleSubmissionUpdate}
            />
          </div>
        </div>
      ) : (
        /* ── SIMPLE FILE UPLOAD (no pre-attached docs) ── */
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

              {/* Instructions */}
              {(assignment.description || assignment.instructions) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Instructions</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {assignment.description || assignment.instructions}
                  </p>
                </div>
              )}

              {/* Already submitted state */}
              {isSubmitted && !submitMutation.isSuccess ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Already submitted</h2>
                  <p className="text-sm text-gray-500 mb-4">Your tutor will mark this soon.</p>
                  {currentSubmission?.fileUrls && currentSubmission.fileUrls.length > 0 && (
                    <div className="w-full text-left space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Files you submitted</p>
                      {currentSubmission.fileUrls.map((url, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3">
                          <FileText size={15} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 flex-1">File {i + 1}</span>
                          <button
                            onClick={() => {
                              const objectPath = url.includes('/uploads/') ? url.split('/uploads/').pop() : url.split('/').pop();
                              window.open(`/objects/uploads/${objectPath}`, '_blank');
                            }}
                            className="text-xs text-indigo-600 font-semibold"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : submitMutation.isSuccess ? (
                /* Post-submit success */
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Submitted!</h2>
                  <p className="text-sm text-gray-500 mb-6">Your tutor will review and mark your work.</p>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 w-full text-left">
                    <p className="text-xs font-bold text-green-700 mb-1">What happens next</p>
                    <p className="text-sm text-gray-600">Your tutor will mark it and the grade will appear in your Results tab.</p>
                  </div>
                  <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600">
                    <ArrowLeft size={14} /> Back to homework
                  </button>
                </div>
              ) : (
                /* Upload zone */
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Notes for your tutor <span className="text-gray-300 normal-case font-normal">(optional)</span></p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Any notes or questions about this assignment…"
                      className="w-full h-16 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  {uploadedFiles.length === 0 ? (
                    <ObjectUploader
                      maxFileSize={assignment.maxFileSize || 31457280}
                      maxNumberOfFiles={5}
                      onGetUploadParameters={getUploadParameters}
                      onComplete={handleUploadComplete}
                      allowedFileTypes={(assignment.allowedFileTypes || []).map(t => `.${t}`)}
                    >
                      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 p-8 text-center cursor-pointer transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                          <Upload size={24} className="text-indigo-600" />
                        </div>
                        <p className="font-black text-gray-800 text-base">Tap to upload your work</p>
                        <p className="text-xs text-gray-400 mt-1">Photo · PDF · Any file · Up to 5 files</p>
                        <div className="mt-3 text-xs text-indigo-600 font-semibold bg-indigo-100 rounded-lg px-3 py-1.5 inline-block">
                          Browse files
                        </div>
                      </div>
                    </ObjectUploader>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready to submit</p>
                      {uploadedFiles.map((url, i) => (
                        <div key={i} className="bg-white rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={16} className="text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 flex-1">File {i + 1} uploaded</span>
                        </div>
                      ))}
                      <ObjectUploader
                        maxFileSize={assignment.maxFileSize || 31457280}
                        maxNumberOfFiles={5}
                        onGetUploadParameters={getUploadParameters}
                        onComplete={handleUploadComplete}
                        allowedFileTypes={(assignment.allowedFileTypes || []).map(t => `.${t}`)}
                      >
                        <div className="text-center py-2 cursor-pointer text-xs text-indigo-600 font-semibold">+ Add more files</div>
                      </ObjectUploader>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sticky submit bar */}
          {!isSubmitted && !submitMutation.isSuccess && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <button
                onClick={() => submitMutation.mutate()}
                disabled={uploadedFiles.length === 0 || submitMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  uploadedFiles.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                <Send size={15} />
                {submitMutation.isPending ? 'Submitting…' : uploadedFiles.length === 0 ? 'Upload your work first' : `Submit ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
