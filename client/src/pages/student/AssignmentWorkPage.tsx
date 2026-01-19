import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Assignment, Submission } from '@shared/schema';
import { AssignmentCompletionArea } from '@/components/AssignmentCompletionArea';
import { 
  ArrowLeft, FileText, Calendar, BookOpen, Clock, CheckCircle, 
  AlertCircle, Home, X
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

export function AssignmentWorkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute('/student/assignment/:id');
  const assignmentId = params?.id;
  
  const studentDbId = `student-${user?.id}`;

  const { data: assignment, isLoading: isLoadingAssignment, error: assignmentError } = useQuery<Assignment>({
    queryKey: ['/api/assignments', assignmentId],
    enabled: !!assignmentId,
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: [`/api/students/${studentDbId}/submissions`],
    enabled: !!studentDbId,
  });

  const currentSubmission = submissions.find((s: Submission) => s.assignmentId === assignmentId);

  const handleSubmissionUpdate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/students/${studentDbId}/submissions`] });
    toast({
      title: "Success",
      description: "Your work has been saved successfully.",
    });
  };

  const handleClose = () => {
    window.close();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your assignments.</p>
          <Link href="/student">
            <Button className="bg-black text-white">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoadingAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-4">The assignment you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={handleClose} className="bg-black text-white">
            Close Tab
          </Button>
        </Card>
      </div>
    );
  }

  const dueDate = new Date(assignment.submissionDate);
  const isOverdue = isPast(dueDate) && currentSubmission?.status !== 'submitted' && currentSubmission?.status !== 'graded';
  const daysUntilDue = differenceInDays(dueDate, new Date());

  const getStatusBadge = () => {
    if (currentSubmission?.status === 'graded' || currentSubmission?.status === 'parent_verified') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (currentSubmission?.status === 'submitted') {
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntilDue <= 3 && daysUntilDue >= 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
    }
    return <Badge variant="outline">In Progress</Badge>;
  };

  return (
    <div className="min-h-screen max-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b-2 border-black flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClose}
                className="border-2 border-black hover:bg-gray-100 h-8 px-3 text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                Close
              </Button>
              <div className="h-5 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h1 className="text-base font-bold text-black truncate max-w-[300px]">
                  {assignment.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Due: {format(dueDate, 'MMM dd, yyyy')}</span>
              </div>
              {daysUntilDue >= 0 && daysUntilDue <= 7 && (
                <span className={`text-xs font-medium ${daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                  ({daysUntilDue} days left)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <Card className="border-2 border-black sticky top-4">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Subject:</span>
                    <Badge variant="outline" className="ml-2 text-xs">{assignment.subject}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {assignment.assignmentKind === 'worksheet' ? 'Interactive Worksheet' : 'File Upload'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">Due:</span>
                    <span className="font-medium">{format(dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  {assignment.description && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-500 block mb-1">Description:</span>
                      <p className="text-gray-700 text-xs">{assignment.description}</p>
                    </div>
                  )}
                  {currentSubmission && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-500 block mb-1">Status:</span>
                      <div className="flex items-center gap-2">
                        {currentSubmission.status === 'submitted' || currentSubmission.status === 'graded' || currentSubmission.status === 'parent_verified' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="capitalize">{currentSubmission.status}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <AssignmentCompletionArea
                assignment={assignment}
                submission={currentSubmission}
                onSubmissionUpdate={handleSubmissionUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
