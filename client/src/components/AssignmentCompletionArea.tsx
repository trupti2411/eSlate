import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Upload
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
          <p className="text-xs text-gray-600 mt-2">Loading file information...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fileUrls.map((url, index) => {
            const metadata = fileMetadata?.[index];
            const displayFilename = getDisplayFilename(url, metadata, index);
            const fileExtension = displayFilename.split('.').pop()?.toLowerCase();
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{displayFilename}</span>
                    {fileExtension && (
                      <span className="text-xs text-gray-500">
                        {fileExtension.toUpperCase()} File
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const objectPath = url.includes('/uploads/') 
                        ? url.split('/uploads/').pop()
                        : url.split('/').pop();
                      window.open(`/objects/uploads/${objectPath}`, '_blank');
                    }}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const objectPath = url.includes('/uploads/') 
                        ? url.split('/uploads/').pop()
                        : url.split('/').pop();
                      const link = document.createElement('a');
                      link.href = `/objects/uploads/${objectPath}`;
                      link.download = displayFilename;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
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
  const [activeTab, setActiveTab] = useState("assignment");
  const [isPDFAnnotatorOpen, setIsPDFAnnotatorOpen] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all submissions for this assignment to check per-document completion
  const { data: allSubmissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/assignments', assignment.id, 'submissions'],
  });

  // Helper function to check if a specific document is completed
  const isDocumentCompleted = (documentUrl: string) => {
    return allSubmissions.some(sub => 
      sub.documentUrl === documentUrl && sub.status === 'submitted'
    );
  };

  // Get submission for a specific document
  const getDocumentSubmission = (documentUrl: string) => {
    return allSubmissions.find(sub => sub.documentUrl === documentUrl);
  };

  // Fetch metadata for assignment files
  const attachmentUrls = assignment.attachmentUrls || [];
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(attachmentUrls);

  // Upload functions
  const getUploadParameters = async () => {
    const response = await apiRequest("/api/objects/upload", "POST");
    console.log("Upload response:", response); // Debug log
    return {
      method: "PUT" as const,
      url: response.uploadURL, // Note: it's uploadURL not uploadUrl
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const newFileUrls = result.successful.map((file: any) => {
        // Extract object key from upload URL
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
        documentUrl: documentUrl || null, // For general assignment submission without specific document
        fileUrls: uploadedFiles,
        textResponse: "",
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      onSubmissionUpdate();
      setUploadedFiles([]); // Clear uploaded files
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignment">Assignment Details</TabsTrigger>
          <TabsTrigger value="completion">Complete Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="assignment" className="space-y-6">
          {/* Assignment Information */}
          <div className={`${eInkStyles.card} p-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <div>
                  <div className="text-xs text-gray-600">Due Date</div>
                  <div className="text-sm font-medium">
                    {format(new Date(assignment.submissionDate), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <div>
                  <div className="text-xs text-gray-600">Total Marks</div>
                  <div className="text-sm font-medium">Assignment</div>
                </div>
              </div>
              <div className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                <div>
                  <div className="text-xs text-gray-600">Status</div>
                  <Badge className={eInkStyles.badge}>
                    {submission?.status === 'submitted' ? 'Submitted' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Description */}
          {assignment.description && (
            <div className={`${eInkStyles.card} p-4`}>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </div>
          )}

          {/* Assignment Instructions */}
          {assignment.instructions && (
            <div className={`${eInkStyles.card} p-4`}>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Assignment Files */}
          {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
            <div className={`${eInkStyles.card} p-4`}>
              <h3 className="font-semibold mb-3">Assignment Materials</h3>
              {isLoadingMetadata ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading file information...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignment.attachmentUrls.map((url, index) => {
                    const metadata = fileMetadata?.[index];
                    const displayFilename = getDisplayFilename(url, metadata, index);
                    const fileExtension = displayFilename.split('.').pop()?.toLowerCase();
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{displayFilename}</span>
                          {fileExtension && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({fileExtension.toUpperCase()})
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const objectPath = url.includes('/uploads/') 
                                ? url.split('/uploads/').pop()
                                : url.split('/').pop();
                              window.open(`/objects/uploads/${objectPath}?edit=true`, '_blank');
                            }}
                            className={eInkStyles.button}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const objectPath = url.includes('/uploads/') 
                                ? url.split('/uploads/').pop()
                                : url.split('/').pop();
                              const link = document.createElement('a');
                              link.href = `/objects/uploads/${objectPath}`;
                              link.download = displayFilename;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className={eInkStyles.button}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          {/* Individual Document Completion Options */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center mb-6">Complete Each Document Individually</h3>
            
            {attachmentUrls.map((url, index) => {
              const metadata = fileMetadata?.[index];
              const filename = getDisplayFilename(url, metadata, index);
              const fileExtension = filename.split('.').pop()?.toLowerCase();
              
              return (
                <div key={index} className={`${eInkStyles.card} p-6`}>
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 mr-3 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-semibold">{filename}</h4>
                        <span className="text-sm text-gray-500">
                          Document {index + 1} of {attachmentUrls.length}
                          {fileExtension && ` (${fileExtension.toUpperCase()})`}
                        </span>
                      </div>
                    </div>
                    <Badge className={eInkStyles.badge}>
                      {isDocumentCompleted(url) ? 'Submitted' : 'Pending'}
                    </Badge>
                  </div>
                  
                  {/* Document Completion Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Complete Online Option */}
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h5 className="font-semibold text-blue-800">Complete Online</h5>
                        <p className="text-xs text-blue-600 mb-3">
                          Annotate with stylus/pen directly in browser
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const objectPath = url.includes('/uploads/') 
                              ? url.split('/uploads/').pop()
                              : url.split('/').pop();
                            window.open(`/objects/uploads/${objectPath}`, '_blank');
                          }}
                          className="flex-1 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Convert URL to accessible format for Google Docs Viewer
                            const objectPath = url.includes('/uploads/') 
                              ? url.split('/uploads/').pop()
                              : url.split('/').pop();
                            
                            // Open full-screen Google Docs Viewer with specific document index in new tab
                            const viewerUrl = `/google-docs-viewer?assignmentId=${assignment.id}&objectPath=${objectPath}&filename=${encodeURIComponent(filename)}&docIndex=${index}`;
                            window.open(viewerUrl, '_blank');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-xs"
                          disabled={isDocumentCompleted(url)}
                        >
                          <PenTool className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Upload Completed Work Option */}
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h5 className="font-semibold text-green-800">Upload Completed</h5>
                        <p className="text-xs text-green-600 mb-3">
                          Download, complete offline, then upload
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const objectPath = url.includes('/uploads/') 
                              ? url.split('/uploads/').pop()
                              : url.split('/').pop();
                            const link = document.createElement('a');
                            link.href = `/objects/uploads/${objectPath}`;
                            link.download = filename;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setSelectedDocumentUrl(url);
                            setActiveTab("offline-upload");
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs"
                          disabled={isDocumentCompleted(url)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* No documents message */}
            {attachmentUrls.length === 0 && (
              <div className={`${eInkStyles.card} p-8 text-center`}>
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Assignment Materials</h4>
                <p className="text-sm text-gray-500">
                  This assignment has no attached documents to complete.
                </p>
              </div>
            )}

            {/* Submission Status */}
            {submission?.status === 'submitted' && (
              <div className={`${eInkStyles.card} p-4 bg-green-50 border-green-200`}>
                <div className="flex items-center text-green-800">
                  <Send className="h-4 w-4 mr-2" />
                  <span className="font-medium">Assignment Successfully Submitted</span>
                </div>
                {submission.submittedAt && (
                  <p className="text-sm text-green-600 mt-1">
                    Submitted on {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>





        {/* Offline Upload Tab */}
        <TabsContent value="offline-upload" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("completion")}
              className={eInkStyles.button}
            >
              ← Back to Options
            </Button>
            <h2 className="text-lg font-semibold">Upload Completed Assignment</h2>
            <div></div>
          </div>

          {/* File Upload Area */}
          <div className={`${eInkStyles.card} p-6`}>
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Upload Your Completed Assignment</h3>
              <p className="text-sm text-gray-600 mb-6">
                Select the completed assignment file(s) from your device
              </p>
              
              {/* File Upload with ObjectUploader */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={31457280} // 30MB
                  onGetUploadParameters={getUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="inline-flex items-center px-6 py-3 border-2 border-black bg-white text-black hover:bg-gray-100 font-medium rounded"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose Files
                </ObjectUploader>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, PNG, JPG (Max 30MB per file)
                </p>
              </div>

              {/* Show uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">Uploaded Files ({uploadedFiles.length}):</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded bg-green-50">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">File {index + 1} uploaded</span>
                            <span className="text-xs text-gray-500">Ready for submission</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show existing submission files if any */}
              {submission?.fileUrls && submission.fileUrls.length > 0 && (
                <SubmittedFilesDisplay fileUrls={submission.fileUrls} eInkStyles={eInkStyles} />
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className={`${eInkStyles.card} p-4 bg-blue-50 border-blue-200`}>
            <h4 className="font-medium text-blue-800 mb-2">Upload Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Complete the assignment in your preferred application (Word, PDF editor, etc.)</li>
              <li>• Save your completed work</li>
              <li>• Upload the file(s) using the upload area above</li>
              <li>• Click "Submit Assignment" when ready</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => submitOfflineUploadMutation.mutate(selectedDocumentUrl)}
              disabled={uploadedFiles.length === 0 || submitOfflineUploadMutation.isPending || (selectedDocumentUrl && isDocumentCompleted(selectedDocumentUrl))}
              className={`${eInkStyles.primaryButton} px-6`}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitOfflineUploadMutation.isPending 
                ? 'Submitting...' 
                : submission?.status === 'submitted' 
                  ? 'Submitted' 
                  : 'Submit Assignment'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* PDF Annotator Modal */}
      {isPDFAnnotatorOpen && selectedPDFUrl && (
        <PDFAnnotator
          pdfUrl={selectedPDFUrl}
          assignmentId={assignment.id}
          onSave={async (annotatedFileUrl: string) => {
            try {
              await submitAssignmentMutation.mutateAsync({ 
                fileUrl: annotatedFileUrl, 
                documentUrl: selectedPDFUrl 
              });
              setIsPDFAnnotatorOpen(false);
              setSelectedPDFUrl("");
            } catch (error) {
              // Error is handled in the mutation
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