import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Download, 
  Upload, 
  FileText, 
  Send,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  status: string;
  maxPoints?: number;
  attachmentUrls?: string[];
  allowedFileTypes?: string[];
}

interface AssignmentDetailDialogProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignmentDetailDialog({ 
  assignment, 
  isOpen, 
  onClose 
}: AssignmentDetailDialogProps) {
  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing submission for this assignment
  const { data: existingSubmission } = useQuery<any>({
    queryKey: ["/api/submissions", assignment.id],
    enabled: isOpen,
  });

  // Upload file mutation - using direct upload approach
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        console.log("Starting direct file upload for:", file.name);
        
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload directly to our server
        const response = await fetch('/api/homework/upload-direct', {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include session cookies for authentication
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Direct upload failed:", response.status, errorData);
          throw new Error(`Failed to upload file: ${errorData.error || response.statusText}`);
        }
        
        const result = await response.json();
        console.log("File uploaded successfully:", result);
        return result.fileUrl;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: (fileUrl) => {
      setUploadedFiles(prev => [...prev, fileUrl]);
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit assignment mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      console.log("Submitting assignment with data:", {
        assignmentId: assignment.id,
        content: submissionText,
        fileUrls: uploadedFiles,
        status: 'submitted'
      });

      const submissionData = {
        assignmentId: assignment.id,
        content: submissionText,
        fileUrls: uploadedFiles,
        status: 'submitted',
        isDraft: false,
        submittedAt: new Date().toISOString(),
      };

      if (existingSubmission?.id) {
        // Update existing submission
        console.log("Updating existing submission:", existingSubmission.id);
        const response = await apiRequest(`/api/submissions/${existingSubmission.id}`, "PATCH", submissionData);
        const result = await response.json();
        return result;
      } else {
        // Create new submission
        console.log("Creating new submission");
        console.log("Making POST request to /api/submissions with data:", submissionData);
        const response = await apiRequest("/api/submissions", "POST", submissionData);
        console.log("API request completed, response status:", response.status);
        const result = await response.json();
        console.log("Response data:", result);
        return result;
      }
    },
    onSuccess: (response) => {
      console.log("Assignment submitted successfully:", response);
      toast({
        title: "Assignment submitted successfully!",
        description: "Your submission has been sent for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Submission error details:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast({
        title: "Submission failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const isOverdue = () => {
    if (!assignment.dueDate) return false;
    return new Date() > new Date(assignment.dueDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <div className="text-xs text-gray-600">Due Date</div>
                <div className={`text-sm ${isOverdue() ? 'text-red-600' : 'text-black'}`}>
                  {formatDueDate(assignment.dueDate)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <div>
                <div className="text-xs text-gray-600">Points</div>
                <div className="text-sm text-black">{assignment.maxPoints || 100}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <div>
                <div className="text-xs text-gray-600">Status</div>
                <Badge className={`status-badge status-${assignment.status}`}>
                  {assignment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Assignment Description */}
          {assignment.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{assignment.description}</p>
            </div>
          )}

          {/* Assignment Instructions */}
          {assignment.instructions && (
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>
          )}

          {/* Assignment Files */}
          {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Assignment Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {assignment.attachmentUrls.map((url, index) => {
                  const fileName = url.split('/').pop() || `file-${index + 1}`;
                  const downloadUrl = `/api/assignments/${assignment.id}/attachments/${fileName}`;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start"
                      onClick={() => window.open(downloadUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File {index + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submission Section - Only show if assignment is assigned */}
          {assignment.status === 'assigned' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Your Submission</h3>
              
              {/* Text Response */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Written Response</label>
                <Textarea
                  placeholder="Type your response here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Files</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept={assignment.allowedFileTypes?.map(type => `.${type}`).join(',')}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                  </Button>
                  
                  {assignment.allowedFileTypes && (
                    <p className="text-xs text-gray-600">
                      Allowed types: {assignment.allowedFileTypes.join(', ')}
                    </p>
                  )}
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Uploaded Files:</p>
                    {uploadedFiles.map((fileUrl, index) => (
                      <div key={index} className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        File {index + 1} uploaded successfully
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || (!submissionText.trim() && uploadedFiles.length === 0)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          )}

          {/* Show existing submission if submitted */}
          {existingSubmission && assignment.status !== 'assigned' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Your Submission</h3>
              
              {existingSubmission?.content && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Response</label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {existingSubmission.content}
                  </div>
                </div>
              )}

              {existingSubmission?.fileUrls && existingSubmission.fileUrls.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Files</label>
                  <div className="space-y-1">
                    {existingSubmission.fileUrls.map((url: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Submitted File {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {existingSubmission?.score !== null && existingSubmission?.score !== undefined && (
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Score: {existingSubmission.score}/{assignment.maxPoints}</span>
                    <span className="text-green-600">Graded</span>
                  </div>
                  {existingSubmission?.feedback && (
                    <div className="mt-2">
                      <strong>Feedback:</strong>
                      <p className="text-gray-700 mt-1">{existingSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}