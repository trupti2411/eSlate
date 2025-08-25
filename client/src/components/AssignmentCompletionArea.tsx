import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";
import { type Assignment, type Submission } from "@shared/schema";
import { 
  FileText, 
  Download, 
  Eye, 
  Send, 
  BookOpen, 
  Calendar,
  PenTool,
  Monitor
} from "lucide-react";
import { format } from "date-fns";

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

  // Fetch metadata for assignment files
  const attachmentUrls = assignment.attachmentUrls || [];
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(attachmentUrls);





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

          {/* Student's Submitted Files */}
          {submission?.fileUrls && submission.fileUrls.length > 0 && (
            <div className={`${eInkStyles.card} p-4`}>
              <h3 className="font-semibold mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-green-600" />
                Your Submitted Files ({submission.fileUrls.length})
              </h3>
              <SubmittedFilesDisplay fileUrls={submission.fileUrls} eInkStyles={eInkStyles} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          {/* Assignment Completion Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Complete Online */}
            <div className={`${eInkStyles.card} p-6`}>
              <div className="text-center mb-4">
                <Monitor className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Complete Online</h3>
                <p className="text-sm text-gray-600 mb-4">
                  View and complete the assignment directly in your browser with stylus/pen input
                </p>
              </div>
              
              {/* Show assignment files for online completion */}
              {attachmentUrls.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Assignment Files:</Label>
                  {attachmentUrls.map((url, index) => {
                    const metadata = fileMetadata?.[index];
                    const filename = getDisplayFilename(url, metadata, index);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">{filename}</span>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Open the editor directly without intermediate dialog
                    if (attachmentUrls.length > 0) {
                      const objectPath = attachmentUrls[0].includes('/uploads/') 
                        ? attachmentUrls[0].split('/uploads/').pop()
                        : attachmentUrls[0].split('/').pop();
                      window.open(`/objects/uploads/${objectPath}?edit=true`, '_blank');
                    }
                  }}
                  className={`${eInkStyles.primaryButton} flex-1`}
                  disabled={submission?.status === 'submitted' || attachmentUrls.length === 0}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Complete Online
                </Button>
                
                <Button
                  onClick={() => {
                    // Download all assignment files
                    attachmentUrls.forEach((url, index) => {
                      const metadata = fileMetadata?.[index];
                      const filename = getDisplayFilename(url, metadata, index);
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
                      
                      // Add small delay between downloads to prevent browser blocking
                      if (index < attachmentUrls.length - 1) {
                        setTimeout(() => {}, 100);
                      }
                    });
                  }}
                  className={`${eInkStyles.button} flex-shrink-0`}
                  disabled={submission?.status === 'submitted' || attachmentUrls.length === 0}
                  data-testid="button-download-assignment"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Assignment
                </Button>
              </div>
            </div>

            {/* Option 2: Complete Offline */}
            <div className={`${eInkStyles.card} p-6`}>
              <div className="text-center mb-4">
                <Download className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Complete Offline</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download assignment files, complete externally, then upload your completed work
                </p>
              </div>

              {/* Download assignment files */}
              {attachmentUrls.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Download Files:</Label>
                  {attachmentUrls.map((url, index) => {
                    const metadata = fileMetadata?.[index];
                    const filename = getDisplayFilename(url, metadata, index);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">{filename}</span>
                        </div>
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
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={() => setActiveTab("offline-upload")}
                className={`${eInkStyles.button} w-full`}
                disabled={submission?.status === 'submitted'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Completed Work
              </Button>
            </div>
          </div>

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
              
              {/* File Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  id="assignment-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Handle file upload logic here
                    console.log("Files selected:", files);
                  }}
                />
                <label
                  htmlFor="assignment-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-black bg-white text-black hover:bg-gray-100 font-medium rounded"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, PNG, JPG (Max 30MB per file)
                </p>
              </div>

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
              onClick={() => {
                // Placeholder for submission logic
                console.log("Submit assignment - offline upload");
              }}
              disabled={submission?.status === 'submitted'}
              className={`${eInkStyles.primaryButton} px-6`}
            >
              <Send className="h-4 w-4 mr-2" />
              {submission?.status === 'submitted' ? 'Submitted' : 'Submit Assignment'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}