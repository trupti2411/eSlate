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
      return apiRequest('/api/submissions', submission ? 'PATCH' : 'POST', {
        ...data,
        id: submission?.id,
      });
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
                  <div className="text-sm font-medium">{assignment.totalMarks}</div>
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
              <div className="space-y-2">
                {assignment.attachmentUrls.map((url, index) => {
                  const filename = url.split('/').pop() || `file-${index + 1}`;
                  const fileExtension = filename.split('.').pop()?.toLowerCase();
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium">{filename}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({fileExtension?.toUpperCase()})
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const fileId = url.split('/').pop();
                            window.open(`/api/assignments/${assignment.id}/files/${fileId}`, '_blank');
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
                            const fileId = url.split('/').pop();
                            const link = document.createElement('a');
                            link.href = `/api/assignments/${assignment.id}/files/${fileId}`;
                            link.download = filename;
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          {/* Device Optimization Settings */}
          <div className={`${eInkStyles.card} p-4`}>
            <h3 className="font-semibold mb-3">Device Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Device Type</Label>
                <select 
                  value={deviceType} 
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full p-2 border-2 border-black rounded bg-white text-black mt-1"
                >
                  <option value="e-ink">E-ink Device</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
              <div>
                <Label className="font-medium">Input Method</Label>
                <select 
                  value={inputMethod} 
                  onChange={(e) => setInputMethod(e.target.value)}
                  className="w-full p-2 border-2 border-black rounded bg-white text-black mt-1"
                >
                  <option value="pen">Stylus/Pen</option>
                  <option value="touch">Touch Screen</option>
                  <option value="keyboard">Keyboard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Response Area */}
          <div className={`${eInkStyles.card} p-4 space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Response</h3>
              <div className="flex items-center text-sm text-gray-600">
                {isAutoSaving && <><Save className="h-3 w-3 mr-1" />Saving...</>}
                {lastSaved && !isAutoSaving && (
                  <>Last saved: {format(lastSaved, 'HH:mm:ss')}</>
                )}
              </div>
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your answer here..."
              rows={12}
              className={eInkStyles.textarea}
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: 'serif',
              }}
            />

            {/* Digital Content Area for pen input */}
            {inputMethod === 'pen' && (
              <div>
                <Label className="font-medium">Digital Handwriting</Label>
                <Textarea
                  value={digitalContent}
                  onChange={(e) => setDigitalContent(e.target.value)}
                  placeholder="Digitized handwriting content will appear here..."
                  rows={4}
                  className="w-full p-4 border-2 border-gray-400 rounded bg-gray-50 text-black text-lg leading-relaxed mt-2"
                  readOnly
                />
                <p className="text-sm text-gray-600 mt-1">
                  This field will be automatically populated when using pen input on compatible devices
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t-2 border-black">
            <Button 
              onClick={handleSaveDraft}
              disabled={saveSubmissionMutation.isPending || !content.trim()}
              className={eInkStyles.button}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saveSubmissionMutation.isPending || !content.trim() || submission?.status === 'submitted'}
              className={eInkStyles.primaryButton}
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