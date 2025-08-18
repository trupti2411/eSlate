import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Assignment, type Submission, type AcademicTerm, type Class } from "@shared/schema";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  PenTool, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  GraduationCap,
  Users,
  PlayCircle,
  Pause,
  RotateCcw,
  Save
} from "lucide-react";
import { format, isAfter, parseISO, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function StudentPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Get student profile
  const { data: studentProfile } = useQuery<any>({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user.role === 'student',
  });

  const studentId = studentProfile?.id;

  // Get student's terms (active and non-active)
  const { data: studentTerms = [], isLoading: isLoadingTerms } = useQuery<AcademicTerm[]>({
    queryKey: ['/api/students', studentId, 'terms'],
    enabled: !!studentId,
  });

  // Get student's classes (active and non-active) 
  const { data: studentClasses = [], isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/students', studentId, 'classes'],
    enabled: !!studentId,
  });

  // Get student's assignments
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/students', studentId, 'assignments'],
    enabled: !!studentId,
  });

  // Get submissions for assignments
  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/students', studentId, 'submissions'],
    enabled: !!studentId,
  });

  // E-ink optimized colors and styling
  const eInkStyles = {
    card: "bg-white border-2 border-black shadow-none",
    activeCard: "bg-gray-100 border-2 border-black shadow-none",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 shadow-none",
    primaryButton: "bg-black text-white border-2 border-black hover:bg-gray-800 shadow-none",
    badge: "bg-white border border-black text-black shadow-none",
    activeBadge: "bg-black text-white border border-black shadow-none",
    textarea: "border-2 border-black bg-white text-black text-lg leading-relaxed min-h-[200px]"
  };

  // Helper functions
  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find(s => s.assignmentId === assignment.id);
    if (submission) {
      return submission.status || 'submitted';
    }
    return isPast(new Date(assignment.submissionDate)) ? 'overdue' : 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800 border-green-800';
      case 'graded': return 'bg-blue-100 text-blue-800 border-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-800';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 p-6 border-2 border-black bg-white">
        <h1 className="text-3xl font-bold text-black">Student Portal</h1>
        <p className="text-lg text-gray-700">Welcome back, {user?.firstName || 'Student'}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={eInkStyles.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentTerms.length}</div>
            <p className="text-sm text-gray-600">Academic terms</p>
          </CardContent>
        </Card>

        <Card className={eInkStyles.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentClasses.length}</div>
            <p className="text-sm text-gray-600">Enrolled classes</p>
          </CardContent>
        </Card>

        <Card className={eInkStyles.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-sm text-gray-600">Total assignments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Academic Terms</h2>
      {isLoadingTerms ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : studentTerms.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No academic terms found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentTerms.map((term) => {
            const isActive = new Date() >= new Date(term.startDate) && new Date() <= new Date(term.endDate);
            return (
              <Card key={term.id} className={isActive ? eInkStyles.activeCard : eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{term.name}</CardTitle>
                    <Badge className={isActive ? eInkStyles.activeBadge : eInkStyles.badge}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(term.startDate), 'MMM dd, yyyy')} - {format(new Date(term.endDate), 'MMM dd, yyyy')}
                    </div>
                    {term.description && (
                      <p className="text-gray-600 mt-2">{term.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Classes</h2>
      {isLoadingClasses ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : studentClasses.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentClasses.map((cls) => {
            const classAssignments = assignments.filter(a => a.classId === cls.id);
            const isActive = cls.isActive ?? true;
            return (
              <Card key={cls.id} className={isActive ? eInkStyles.activeCard : eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge className={isActive ? eInkStyles.activeBadge : eInkStyles.badge}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {cls.subject} • {cls.daysOfWeek?.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assignments:</span>
                      <Badge className={eInkStyles.badge}>{classAssignments.length}</Badge>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{cls.startTime} - {cls.endTime}</span>
                    </div>
                  </div>
                  {classAssignments.length > 0 && (
                    <Button 
                      className={`${eInkStyles.button} w-full mt-4`}
                      onClick={() => {
                        setSelectedTab("assignments");
                        // You could add filtering here
                      }}
                    >
                      View Assignments
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Assignments</h2>
      {isLoadingAssignments ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : assignments.length === 0 ? (
        <Card className={eInkStyles.card}>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            const classInfo = studentClasses.find(c => c.id === assignment.classId);
            
            return (
              <Card key={assignment.id} className={eInkStyles.card}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {classInfo?.name} • {assignment.subject}
                      </CardDescription>
                    </div>
                    <Badge className={`border ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Assignment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Due: {format(new Date(assignment.submissionDate), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Total Marks: {assignment.totalMarks}</span>
                      </div>
                    </div>

                    {assignment.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{assignment.description}</p>
                      </div>
                    )}

                    {assignment.instructions && (
                      <div>
                        <h4 className="font-semibold mb-2">Instructions:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{assignment.instructions}</p>
                      </div>
                    )}

                    {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Files:</h4>
                        <div className="space-y-1">
                          {assignment.attachmentUrls.map((url, index) => (
                            <div key={index} className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Assignment File {index + 1}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission Info */}
                    {submission && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Your Submission:</h4>
                        <div className="bg-gray-50 p-3 rounded border text-sm">
                          <div className="flex justify-between mb-2">
                            <span>Submitted: {format(new Date(submission.submittedAt!), 'MMM dd, yyyy HH:mm')}</span>
                            {submission.grade && <span>Grade: {submission.grade}/{assignment.totalMarks}</span>}
                          </div>
                          {submission.content && (
                            <p className="text-gray-700">{submission.content}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className={eInkStyles.primaryButton}
                            onClick={() => setSelectedAssignment(assignment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {submission ? 'View & Edit' : 'Complete Online'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] bg-white border-2 border-black">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
                          </DialogHeader>
                          <AssignmentCompletionArea 
                            assignment={assignment} 
                            submission={submission}
                            onSubmissionUpdate={() => {
                              // Refetch submissions
                              // queryClient.invalidateQueries...
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Student role required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-black">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="terms" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
          <TabsTrigger 
            value="classes" 
            className="data-[state=active]:bg-black data-[state=active]:text-white border-r border-black"
          >
            <Users className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          {renderTerms()}
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          {renderClasses()}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          {renderAssignments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Assignment Completion Component optimized for e-ink/pen input
function AssignmentCompletionArea({ 
  assignment, 
  submission, 
  onSubmissionUpdate 
}: { 
  assignment: Assignment; 
  submission?: Submission;
  onSubmissionUpdate: () => void; 
}) {
  const [content, setContent] = useState(submission?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // E-ink optimized styling for writing area
  const writingAreaStyles = {
    fontSize: "18px",
    lineHeight: "1.8",
    fontFamily: "serif",
    padding: "24px",
    border: "2px solid black",
    backgroundColor: "white",
    minHeight: "400px",
    resize: "vertical" as const
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write your answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would make the API call to submit/update the assignment
      console.log("Submitting assignment:", { assignmentId: assignment.id, content });
      
      toast({
        title: "Success", 
        description: submission ? "Answer updated successfully!" : "Assignment submitted successfully!",
      });
      onSubmissionUpdate();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <div className="border-2 border-black bg-gray-50 p-4">
        <h3 className="font-bold text-lg mb-2">{assignment.title}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>Subject: {assignment.subject}</div>
          <div>Total Marks: {assignment.totalMarks}</div>
          <div>Due: {format(new Date(assignment.submissionDate), 'MMM dd, yyyy HH:mm')}</div>
          <div>Status: {submission ? 'Submitted' : 'Not submitted'}</div>
        </div>
        {assignment.instructions && (
          <div>
            <h4 className="font-semibold mb-1">Instructions:</h4>
            <p className="text-gray-700">{assignment.instructions}</p>
          </div>
        )}
      </div>

      {/* Writing Area - Optimized for pen/touchscreen input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Answer:</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Optimized for pen/touchscreen input</span>
            <PenTool className="h-4 w-4" />
          </div>
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer here... This area is optimized for pen and touchscreen input on e-ink devices."
          style={writingAreaStyles}
          className="w-full font-serif text-lg leading-relaxed"
        />
        
        <div className="text-sm text-gray-600">
          Character count: {content.length} • Word count: {content.trim().split(/\s+/).filter(w => w.length > 0).length}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="bg-black text-white border-2 border-black hover:bg-gray-800 px-6"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {submission ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {submission ? 'Update Answer' : 'Submit Assignment'}
            </>
          )}
        </Button>
        
        <Button
          onClick={() => setContent("")}
          variant="outline"
          className="border-2 border-black bg-white text-black hover:bg-gray-100"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}