import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Assignment, Submission } from '@shared/schema';
import { ObjectUploader } from '@/components/ObjectUploader';
import { AssignmentCompletionArea } from '@/components/AssignmentCompletionArea';
import { useMultipleFileMetadata, getDisplayFilename } from '@/hooks/useFileMetadata';
import {
  ArrowLeft, Upload, CheckCircle, AlertCircle, Send, FileText, Eye, PenLine, ChevronRight, Home
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

export function AssignmentWorkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute('/student/assignment/:id');
  const [, navigate] = useLocation();
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

  // Derive these before any early returns so hooks below are unconditional
  const attachmentUrls: string[] = (assignment as any)?.attachmentUrls ?? [];
  const isSubmitted = ['submitted', 'graded', 'parent_verified'].includes(currentSubmission?.status ?? '');
  const isWorksheet = (assignment as any)?.assignmentKind === 'worksheet' && !!(assignment as any)?.worksheetId;

  const { data: attachmentMetadata } = useMultipleFileMetadata(attachmentUrls);

  useEffect(() => {
    if (!isWorksheet && attachmentUrls.length === 1 && !isSubmitted && assignment) {
      const url = attachmentUrls[0];
      const objectPath = url.includes('/uploads/') ? url.split('/uploads/').pop() : url.split('/').pop();
      const meta = attachmentMetadata?.[0];
      const filename = meta?.originalName || url.split('/').pop() || 'document-1.pdf';
      navigate(`/pdf-annotator?assignmentId=${assignment.id}&objectPath=${objectPath}&filename=${encodeURIComponent(filename)}&docIndex=0`);
    }
  }, [assignment?.id, isSubmitted, isWorksheet, attachmentMetadata]);

  const handleBack = () => navigate('/');

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
  const isOverdue = isPast(dueDate) && !isSubmitted;
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const hasAttachments = attachmentUrls.length > 0;

  const openAnnotator = (url: string, index: number, meta?: any) => {
    const objectPath = url.includes('/uploads/') ? url.split('/uploads/').pop() : url.split('/').pop();
    const filename = meta?.originalName || url.split('/').pop() || `document-${index + 1}.pdf`;
    navigate(`/pdf-annotator?assignmentId=${assignment.id}&objectPath=${objectPath}&filename=${encodeURIComponent(filename)}&docIndex=${index}`);
  };

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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Nav bar */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 text-sm font-semibold flex-shrink-0 transition-colors"
          aria-label="Back to dashboard"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <ChevronRight size={14} className="text-indigo-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">{assignment.title}</p>
          <p className="text-xs text-indigo-200 truncate">{assignment.subject}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-700">
            This was due {format(dueDate, 'd MMM yyyy')} — still submit your work, your tutor will be notified.
          </p>
        </div>
      )}

      {/* Graded result strip */}
      {currentSubmission?.status === 'graded' && currentSubmission.score !== null && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
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
      ) : hasAttachments && isSubmitted ? (
        /* ── SUBMITTED with attachments ── */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Submitted!</h2>
          <p className="text-sm text-gray-500 mb-4">Your annotated work has been sent to your tutor.</p>
          {currentSubmission?.status === 'graded' && currentSubmission.score !== null && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 max-w-xs text-left mb-4">
              <p className="text-xs font-bold text-green-700 mb-1">Your result</p>
              <p className="text-2xl font-black text-green-700">{currentSubmission.score}/20</p>
              {currentSubmission.feedback && (
                <p className="text-sm text-gray-600 mt-2 italic">"{currentSubmission.feedback}"</p>
              )}
            </div>
          )}
          <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-indigo-600">
            <ArrowLeft size={14} /> Back to homework
          </button>
        </div>
      ) : hasAttachments && attachmentUrls.length === 1 ? (
        /* ── SINGLE DOC: auto-redirecting to annotator ── */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Opening worksheet…</p>
          </div>
        </div>
      ) : hasAttachments ? (
        /* ── MULTI-DOC: split-panel with document list ── */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: instructions */}
          <div className="md:w-2/5 md:border-r md:border-gray-100 md:bg-white md:overflow-y-auto p-5 space-y-4 flex-shrink-0">
            {(assignment.description || assignment.instructions) && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Instructions</p>
                <p className="text-sm text-gray-700 leading-relaxed">{assignment.description || assignment.instructions}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due date</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{format(dueDate, 'EEEE d MMMM yyyy')}</p>
            </div>
          </div>
          {/* Right: document list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {attachmentUrls.length} document{attachmentUrls.length > 1 ? 's' : ''} — tap to complete
            </p>
            {attachmentUrls.map((url, i) => {
              const meta = attachmentMetadata?.[i];
              const filename = getDisplayFilename(url, meta, i);
              return (
                <button
                  key={i}
                  onClick={() => openAnnotator(url, i, meta)}
                  className="w-full text-left bg-white rounded-2xl border border-indigo-100 px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{filename}</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                      <PenLine size={10} /> Tap to complete online
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-indigo-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── SIMPLE UPLOAD flow (no pre-attached docs) ── split-panel on tablet ── */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── Left panel: instructions (tablet only shows this as a sidebar) ── */}
          <div className="md:w-2/5 md:border-r md:border-gray-100 md:bg-white md:flex md:flex-col md:overflow-y-auto flex-shrink-0">
            <div className="p-5 space-y-4">

              {/* Mobile-only: show submitted state here if done */}
              {isSubmitted && !submitMutation.isSuccess && (
                <div className="md:hidden flex flex-col items-center py-10 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Already submitted</h2>
                  <p className="text-sm text-gray-500">Your tutor will mark this soon.</p>
                </div>
              )}

              {/* Instructions card */}
              {(assignment.description || assignment.instructions) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Instructions</p>
                  <div className="bg-white md:bg-transparent rounded-2xl border border-gray-100 md:border-0 shadow-sm md:shadow-none p-4 md:p-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {assignment.description || assignment.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Due date */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due date</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{format(dueDate, 'EEEE d MMMM yyyy')}</p>
              </div>

              {/* Graded result (desktop shows here too) */}
              {currentSubmission?.status === 'graded' && currentSubmission.score !== null && (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
                  <p className="text-xs font-bold text-green-700 mb-1">Your result</p>
                  <p className="text-2xl font-black text-green-700">{currentSubmission.score}/20</p>
                  {currentSubmission.feedback && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{currentSubmission.feedback}"</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right panel: upload + submit ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-4">

                {/* Desktop: submitted state */}
                {isSubmitted && !submitMutation.isSuccess ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Already submitted</h2>
                    <p className="text-sm text-gray-500 mb-4">Your tutor will mark this soon.</p>
                    {currentSubmission?.fileUrls && currentSubmission.fileUrls.length > 0 && (
                      <div className="w-full text-left space-y-2 max-w-md">
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
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Submitted!</h2>
                    <p className="text-sm text-gray-500 mb-6">Your tutor will review and mark your work.</p>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 w-full max-w-md text-left">
                      <p className="text-xs font-bold text-green-700 mb-1">What happens next</p>
                      <p className="text-sm text-gray-600">Your tutor will mark it and the grade will appear in your Results tab.</p>
                    </div>
                    <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600">
                      <ArrowLeft size={14} /> Back to homework
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Notes for your tutor <span className="text-gray-300 normal-case font-normal">(optional)</span>
                      </p>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any notes or questions about this assignment…"
                        className="w-full h-16 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400 bg-white"
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
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
                          {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready to submit
                        </p>
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
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
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
                  {submitMutation.isPending
                    ? 'Submitting…'
                    : uploadedFiles.length === 0
                    ? 'Upload your work first'
                    : `Submit ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} to tutor`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
