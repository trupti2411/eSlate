import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";
import { type Assignment, type Submission } from "@shared/schema";
import { 
  FileText, 
  Download, 
  Eye, 
  Save, 
  Send, 
  Clock, 
  BookOpen, 
  Calendar,
  PenTool,
  Keyboard,
  Monitor
} from "lucide-react";
import { format } from "date-fns";

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
  const [content, setContent] = useState(submission?.content || "");
  const [digitalContent, setDigitalContent] = useState(submission?.digitalContent || "");
  const [deviceType, setDeviceType] = useState<string>("e-ink");
  const [inputMethod, setInputMethod] = useState<string>("pen");
  const [activeTab, setActiveTab] = useState("assignment");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(submission?.updatedAt ? new Date(submission.updatedAt) : null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch metadata for assignment files
  const attachmentUrls = assignment.attachmentUrls || [];
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(attachmentUrls);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!content.trim()) return;
    
    const autoSaveTimer = setInterval(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [content, digitalContent]);

  const saveSubmissionMutation = useMutation({
    mutationFn: async (data: {
      assignmentId: string;
      content: string;
      digitalContent?: string;
      deviceType: string;
      inputMethod: string;
      isDraft: boolean;
    }) => {
      if (submission) {
        // Update existing submission
        return apiRequest(`/api/submissions/${submission.id}`, 'PATCH', {
          content: data.content,
          digitalContent: data.digitalContent,
          deviceType: data.deviceType,
          inputMethod: data.inputMethod,
          status: data.isDraft ? 'draft' : 'submitted',
          submittedAt: data.isDraft ? undefined : new Date(),
        });
      } else {
        // Create new submission
        return apiRequest('/api/submissions', 'POST', {
          assignmentId: data.assignmentId,
          content: data.content,
          digitalContent: data.digitalContent,
          deviceType: data.deviceType,
          inputMethod: data.inputMethod,
          isDraft: data.isDraft,
        });
      }
    },
    onSuccess: (data) => {
      onSubmissionUpdate();
      setLastSaved(new Date());
      setIsAutoSaving(false);
      if (!data.isDraft) {
        toast({
          title: "Assignment Submitted!",
          description: "Your assignment has been successfully submitted.",
        });
      } else {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved.",
        });
      }
    },
    onError: (error: any) => {
      setIsAutoSaving(false);
      toast({
        title: "Error",
        description: error.message || "Failed to save submission",
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = async () => {
    if (!content.trim()) return;
    
    setIsAutoSaving(true);
    saveSubmissionMutation.mutate({
      assignmentId: assignment.id,
      content,
      digitalContent,
      deviceType,
      inputMethod,
      isDraft: true,
    });
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your response before submitting.",
        variant: "destructive",
      });
      return;
    }

    saveSubmissionMutation.mutate({
      assignmentId: assignment.id,
      content,
      digitalContent,
      deviceType,
      inputMethod,
      isDraft: false,
    });
  };



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
                <Clock className="h-4 w-4 mr-2" />
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
                              window.open(`/objects/uploads/${objectPath}`, '_blank');
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
                    const filename = getDisplayFilename(url, fileMetadata);
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

              <Button
                onClick={() => setActiveTab("online-work")}
                className={`${eInkStyles.primaryButton} w-full`}
                disabled={submission?.status === 'submitted'}
              >
                <PenTool className="h-4 w-4 mr-2" />
                Start Online Completion
              </Button>
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
                    const filename = getDisplayFilename(url, fileMetadata);
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

        {/* Online Work Tab */}
        <TabsContent value="online-work" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("completion")}
              className={eInkStyles.button}
            >
              ← Back to Options
            </Button>
            <h2 className="text-lg font-semibold">Online Assignment Completion</h2>
            <div></div>
          </div>

          {/* Device Settings */}
          <div className={`${eInkStyles.card} p-4`}>
            <Label className="text-base font-semibold mb-4 block">Device Settings</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device-type" className="text-sm">Device Type</Label>
                <select
                  id="device-type"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full mt-1 p-2 border-2 border-black bg-white rounded"
                >
                  <option value="e-ink">E-ink Device</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
              <div>
                <Label htmlFor="input-method" className="text-sm">Input Method</Label>
                <select
                  id="input-method"
                  value={inputMethod}
                  onChange={(e) => setInputMethod(e.target.value)}
                  className="w-full mt-1 p-2 border-2 border-black bg-white rounded"
                >
                  <option value="pen">Stylus/Pen</option>
                  <option value="touch">Touch</option>
                  <option value="keyboard">Keyboard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Text Response Area */}
          <div className={`${eInkStyles.card} p-4`}>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-semibold">Your Response</Label>
              {lastSaved && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last saved: {format(lastSaved, 'HH:mm:ss')}
                </span>
              )}
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your assignment response here..."
              className={`${eInkStyles.textarea} min-h-96 text-lg leading-8`}
              style={{ 
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: 'serif'
              }}
            />
          </div>

          {/* Digital Handwriting Section */}
          <div className={`${eInkStyles.card} p-4`}>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-semibold">Digital Handwriting</Label>
              <Button
                type="button"
                className={eInkStyles.button}
                onClick={() => {
                  // Screenshot functionality placeholder
                  setDigitalContent("Screenshot captured at " + new Date().toISOString());
                }}
              >
                Screenshot
              </Button>
            </div>
            <div className="min-h-32 border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500">
              {digitalContent || "Digitized handwriting content will appear here..."}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={saveSubmissionMutation.isPending || !content.trim() || isAutoSaving}
              className={`${eInkStyles.button} px-6`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isAutoSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saveSubmissionMutation.isPending || !content.trim() || submission?.status === 'submitted'}
              className={`${eInkStyles.primaryButton} px-6`}
            >
              <Send className="h-4 w-4 mr-2" />
              {submission?.status === 'submitted' ? 'Submitted' : 'Submit Assignment'}
            </Button>
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
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">Previously Uploaded Files:</Label>
                  <div className="space-y-2">
                    {submission.fileUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">File {index + 1}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(url, '_blank')}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
              onClick={handleSubmit}
              disabled={saveSubmissionMutation.isPending || submission?.status === 'submitted'}
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