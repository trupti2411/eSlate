import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Calendar, 
  User, 
  BookOpen, 
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  GraduationCap,
  Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { type Submission } from "@shared/schema";
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";

interface SubmissionWithDetails extends Submission {
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  assignment: {
    id: string;
    title: string;
    description: string;
    submissionDate: string;
  };
}

// Component to display submitted files with original filenames
function SubmittedFilesSection({ submission, eInkStyles }: { submission: SubmissionWithDetails; eInkStyles: any }) {
  const fileUrls = submission.fileUrls || [];
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(fileUrls);

  if (!fileUrls.length) return null;

  return (
    <div className={`${eInkStyles.card} p-4`}>
      <h3 className="font-semibold mb-3 flex items-center">
        <Paperclip className="h-4 w-4 mr-2" />
        Submitted Files ({fileUrls.length})
      </h3>
      {isLoadingMetadata ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-3">Loading file information...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fileUrls.map((fileUrl, index) => {
            const metadata = fileMetadata?.[index];
            const displayFilename = getDisplayFilename(fileUrl, metadata, index);
            const fileExtension = displayFilename.split('.').pop()?.toLowerCase();
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{displayFilename}</span>
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
                      const objectPath = fileUrl.includes('/uploads/') 
                        ? fileUrl.split('/uploads/').pop()
                        : fileUrl.split('/').pop();
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
                      const objectPath = fileUrl.includes('/uploads/') 
                        ? fileUrl.split('/uploads/').pop()
                        : fileUrl.split('/').pop();
                      const link = document.createElement('a');
                      link.href = `/objects/uploads/${objectPath}`;
                      link.download = displayFilename; // Use original filename for download
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

export default function SubmittedHomework() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);


  // Fetch all submissions for the company
  const { data: submissions = [], isLoading } = useQuery<SubmissionWithDetails[]>({
    queryKey: ["/api/company/submissions"],
  });

  // Filter submissions based on search and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "submitted" && submission.status === "submitted") ||
      (statusFilter === "pending" && submission.status === "submitted");
    
    return matchesSearch && matchesStatus;
  });

  const eInkStyles = {
    card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm",
    button: "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium",
    primaryButton: "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
  };

  const getStatusColor = (submission: SubmissionWithDetails) => {
    if (submission.status === "submitted") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (submission: SubmissionWithDetails) => {
    if (submission.status === "submitted") return "Submitted";
    return "Draft";
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">Loading submitted homework...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="submitted-homework-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submitted Homework</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Review and grade student submissions</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{submissions.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Submissions</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={eInkStyles.card}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{submissions.length}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={eInkStyles.card}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {submissions.filter(s => s.status === "submitted").length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={eInkStyles.card}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {submissions.length > 0 ? 
                      Math.round((submissions.filter(s => s.status === "submitted").length / submissions.length) * 100) : 0}%
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Submission Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name or assignment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card className={eInkStyles.card}>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {submissions.length === 0 
                    ? "No homework has been submitted yet."
                    : "No submissions match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className={eInkStyles.card}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {submission.assignment.title}
                        </h3>
                        <Badge className={getStatusColor(submission)}>
                          {getStatusText(submission)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{submission.student.user.firstName} {submission.student.user.lastName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {submission.submittedAt ? format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm') : (submission.createdAt ? format(new Date(submission.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown date')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>Assignment</span>
                        </div>
                      </div>

                      {submission.assignment.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                          {submission.assignment.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className={eInkStyles.button}
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>View Submission</DialogTitle>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* Assignment Info */}
                              <div className={`${eInkStyles.card} p-4`}>
                                <h3 className="font-semibold mb-2">{selectedSubmission.assignment.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Student:</span><br />
                                    {selectedSubmission.student.user.firstName} {selectedSubmission.student.user.lastName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Due Date:</span><br />
                                    {format(new Date(selectedSubmission.assignment.submissionDate), 'MMM dd, yyyy HH:mm')}
                                  </div>
                                </div>
                              </div>

                              {/* Student Response */}
                              <div className={`${eInkStyles.card} p-4`}>
                                <h3 className="font-semibold mb-3">Student Response</h3>
                                <div className="bg-gray-50 p-4 rounded border min-h-[200px]">
                                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                    {selectedSubmission.content || "No text response provided"}
                                  </p>
                                </div>
                              </div>

                              {/* Uploaded Files */}
                              {selectedSubmission.fileUrls && selectedSubmission.fileUrls.length > 0 && <SubmittedFilesSection submission={selectedSubmission} eInkStyles={eInkStyles} />}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}