import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";
import { type Assignment, type Submission } from "@shared/schema";
import { PDFAnnotator } from "./PDFAnnotator";
import { ObjectUploader } from "./ObjectUploader";
import { 
  FileText, 
  Download, 
  Eye, 
  Send, 
  BookOpen, 
  Calendar,
  PenTool,
  Monitor,
  Upload,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Component to display submitted files with original filenames
function SubmittedFilesDisplay({ fileUrls, eInkStyles }: { fileUrls: string[]; eInkStyles: any }) {
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(fileUrls);

  return (
    <div className="mt-4">
      <Label className="text-sm font-medium mb-2 block">Previously Uploaded Files ({fileUrls.length}):</Label>
      {isLoadingMetadata ? (
        <div className="text-center py-4">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm text-gray-600 mt-2">Loading file information...</div>
        </div>
      ) : (
        <div className="grid gap-2">
          {fileUrls.map((fileUrl, index) => {
            const filename = getDisplayFilename(fileUrl, fileMetadata?.[index]);
            const fileExtension = filename.split('.').pop()?.toLowerCase();
            
            return (
              <div key={index} className={`${eInkStyles.card} p-3 flex items-center justify-between`}>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">
                    {filename}
                    {fileExtension && ` (${fileExtension.toUpperCase()})`}
                  </span>
                </div>
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  View File
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AssignmentCompletionAreaProps {
  assignment: Assignment;
  submission?: Submission | null;
  onSubmissionUpdate: () => void;
}

export function AssignmentCompletionArea({ 
  assignment, 
  submission, 
  onSubmissionUpdate 
}: AssignmentCompletionAreaProps) {
  const [isPDFAnnotatorOpen, setIsPDFAnnotatorOpen] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all submissions for this assignment to check per-document completion
  // Disable while annotator is open to prevent re-renders that clear annotations
  const { data: allSubmissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/assignments', assignment.id, 'submissions'],
    staleTime: 30 * 1000, // Keep data fresh for 30 seconds to prevent constant refetches during annotation
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !isPDFAnnotatorOpen, // Disable query while annotator is open to prevent re-renders
  });

  // Helper function to check if a specific document is completed
  const isDocumentCompleted = (documentUrl: string) => {
    return allSubmissions.some(sub => 
      sub.documentUrl === documentUrl && sub.status === 'submitted'
    );
  };

  // Fetch metadata for assignment files
  const attachmentUrls = assignment.attachmentUrls || [];
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(attachmentUrls);

  // Upload functions
  const getUploadParameters = async () => {
    const response = await apiRequest("/api/objects/upload", "POST");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const newFileUrls = result.successful.map((file: any) => {
        const urlParts = file.uploadURL.split('/');
        const objectKey = urlParts[urlParts.length - 1].split('?')[0];
        return `/objects/uploads/${objectKey}`;
      });
      
      setUploadedFiles(prev => [...prev, ...newFileUrls]);
      
      toast({
        title: "Files uploaded successfully",
        description: `${result.successful.length} file(s) uploaded`,
      });
    }
  };

  // Submit assignment mutation (for PDF annotations)
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ fileUrl, documentUrl }: { fileUrl: string; documentUrl: string }) => {
      return apiRequest('/api/submissions', 'POST', {
        assignmentId: assignment.id,
        documentUrl: documentUrl,
        fileUrls: [fileUrl],
        textResponse: "",
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments', assignment.id, 'submissions'] });
      onSubmissionUpdate();
      toast({
        title: "Assignment Submitted",
        description: "Your annotated assignment has been submitted successfully.",
      });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your assignment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Submit offline uploaded files
  const submitOfflineUploadMutation = useMutation({
    mutationFn: async (documentUrl?: string) => {
      if (uploadedFiles.length === 0) {
        throw new Error("No files uploaded");
      }
      
      return apiRequest('/api/submissions', 'POST', {
        assignmentId: assignment.id,
        documentUrl: documentUrl || null,
        fileUrls: uploadedFiles,
        textResponse: "",
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments', assignment.id, 'submissions'] });
      onSubmissionUpdate();
      setUploadedFiles([]);
      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted successfully."
      });
    },
    onError: (error) => {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const eInkStyles = {
    card: "bg-white border-2 border-black rounded shadow-sm",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 font-medium",
    primaryButton: "bg-black border-2 border-black text-white hover:bg-gray-800 font-medium",
    textarea: "border-2 border-black bg-white text-black text-lg leading-relaxed font-serif resize-none",
    badge: "border border-black bg-white text-black",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Assignment Header */}
      <div className={`${eInkStyles.card} p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">{assignment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {assignment.subject}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Week {assignment.week}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${eInkStyles.badge} text-sm px-3 py-1`}>
              {submission?.status === 'submitted' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </div>

        {/* Assignment Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <Clock className="h-4 w-4 mr-2 text-gray-600" />
            <div>
              <div className="text-gray-600">Due Date</div>
              <div className="font-medium">
                {format(new Date(assignment.submissionDate), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <User className="h-4 w-4 mr-2 text-gray-600" />
            <div>
              <div className="text-gray-600">Assignment Type</div>
              <div className="font-medium">Individual Work</div>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <FileText className="h-4 w-4 mr-2 text-gray-600" />
            <div>
              <div className="text-gray-600">Documents</div>
              <div className="font-medium">{attachmentUrls.length} file(s)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Description & Instructions */}
      {(assignment.description || assignment.instructions) && (
        <div className={`${eInkStyles.card} p-6 space-y-4`}>
          {assignment.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </div>
          )}
          {assignment.instructions && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Instructions</h3>
              <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assignment Documents & Completion */}
      <div className={`${eInkStyles.card} p-6`}>
        <h3 className="font-semibold text-lg mb-4">Assignment Documents</h3>
        
        {isLoadingMetadata ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-gray-600">Loading assignment files...</div>
          </div>
        ) : attachmentUrls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents attached to this assignment.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Complete each document individually. You can work on them in any order.
            </p>
            
            {attachmentUrls.map((url, index) => {
              const filename = getDisplayFilename(url, fileMetadata?.[index]);
              const fileExtension = filename.split('.').pop()?.toLowerCase();
              const isCompleted = isDocumentCompleted(url);
              
              return (
                <div key={index} className={`border-2 border-gray-200 rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}>
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-black">
                          {filename}
                        </h4>
                        <span className="text-sm text-gray-500">
                          Document {index + 1} of {attachmentUrls.length}
                          {fileExtension && ` (${fileExtension.toUpperCase()})`}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${eInkStyles.badge} ${isCompleted ? 'bg-green-100 text-green-800 border-green-300' : ''}`}>
                      {isCompleted ? 'Submitted' : 'Pending'}
                    </Badge>
                  </div>
                  
                  {/* Document Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* View Document */}
                    <Button
                      onClick={() => window.open(url, '_blank')}
                      className={`${eInkStyles.button} text-sm`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    
                    {/* Complete Online */}
                    <Button
                      onClick={() => {
                        const objectPath = url.includes('/uploads/') 
                          ? url.split('/uploads/').pop()
                          : url.split('/').pop();
                        
                        const viewerUrl = `/google-docs-viewer?assignmentId=${assignment.id}&objectPath=${objectPath}&filename=${encodeURIComponent(filename)}&docIndex=${index}`;
                        window.open(viewerUrl, '_blank');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      disabled={isCompleted}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Complete Online
                    </Button>
                    
                    {/* Upload Completed */}
                    <Button
                      onClick={() => {
                        setSelectedDocumentUrl(url);
                        // Show upload area for this specific document
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      disabled={isCompleted}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Completed
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Area */}
        {selectedDocumentUrl && (
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3">Upload Your Completed Work</h4>
            <ObjectUploader
              maxFileSize={assignment.maxFileSize || 30 * 1024 * 1024}
              maxNumberOfFiles={5}
              onGetUploadParameters={getUploadParameters}
              onComplete={handleUploadComplete}
            >
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop your completed assignment files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {assignment.allowedFileTypes ? 
                    `Supported: ${assignment.allowedFileTypes.join(', ')}` : 
                    'Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPEG'
                  }
                </p>
              </div>
            </ObjectUploader>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-2 block">
                  Ready to Submit ({uploadedFiles.length} file(s)):
                </Label>
                <div className="space-y-2 mb-4">
                  {uploadedFiles.map((fileUrl, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      File {index + 1} uploaded successfully
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => submitOfflineUploadMutation.mutate(selectedDocumentUrl)}
                  disabled={submitOfflineUploadMutation.isPending || Boolean(selectedDocumentUrl && isDocumentCompleted(selectedDocumentUrl))}
                  className={`${eInkStyles.primaryButton} px-6`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitOfflineUploadMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission History */}
      {submission?.fileUrls && submission.fileUrls.length > 0 && (
        <div className={`${eInkStyles.card} p-6`}>
          <h3 className="font-semibold text-lg mb-3">Submission History</h3>
          <SubmittedFilesDisplay fileUrls={submission.fileUrls} eInkStyles={eInkStyles} />
          {submission.submittedAt && (
            <div className="mt-3 text-sm text-gray-600">
              Submitted on {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
        </div>
      )}

      {/* PDF Annotator Modal */}
      {isPDFAnnotatorOpen && selectedPDFUrl && (
        <PDFAnnotator
          pdfUrl={selectedPDFUrl}
          assignmentId={assignment.id}
          documentUrl={selectedPDFUrl}
          isSubmitted={isDocumentCompleted(selectedPDFUrl)}
          onSave={async (annotatedFileUrl: string) => {
            try {
              await submitAssignmentMutation.mutateAsync({ 
                fileUrl: annotatedFileUrl, 
                documentUrl: selectedPDFUrl 
              });
              setIsPDFAnnotatorOpen(false);
              setSelectedPDFUrl("");
            } catch (error) {
              console.error('Save failed:', error);
            }
          }}
          onClose={() => {
            setIsPDFAnnotatorOpen(false);
            setSelectedPDFUrl("");
          }}
        />
      )}
    </div>
  );
}