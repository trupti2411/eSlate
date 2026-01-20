import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle2,
  ChevronLeft,
  BookOpen,
  Send,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

interface WorksheetAssignment {
  assignment: {
    id: string;
    worksheetId: string;
    studentId: string;
    dueDate?: string;
    createdAt: string;
    status: 'assigned' | 'in_progress' | 'submitted' | 'graded';
    submittedAt?: string;
  };
  worksheet: {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    isPublished: boolean;
    createdAt: string;
  };
}

interface Student {
  id: string;
  userId: string;
}

export function StudentWorksheets() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: student, isLoading: studentLoading } = useQuery<Student>({
    queryKey: ['/api/auth/student-profile'],
    enabled: !!user && user?.role === 'student',
  });

  const { data: assignments = [], isLoading } = useQuery<WorksheetAssignment[]>({
    queryKey: ['/api/students', student?.id, 'worksheets'],
    queryFn: () => fetch(`/api/students/${student?.id}/worksheets`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!student?.id,
  });

  const openWorksheetInNewTab = (worksheetAssignmentId: string) => {
    window.open(`/student/worksheet/${worksheetAssignmentId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/student/portal')} data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Worksheets</h1>
            <p className="text-muted-foreground">View and complete your assigned worksheets</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading worksheets...</div>
        ) : assignments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No worksheets assigned</h3>
              <p className="text-muted-foreground">
                Your tutor hasn't assigned any worksheets yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map(({ assignment, worksheet }) => {
              const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
              const isGraded = assignment.status === 'graded';
              const isInProgress = assignment.status === 'in_progress';
              
              const getStatusBadge = () => {
                if (isGraded) return <Badge className="bg-green-100 text-green-800 border-green-200">Graded</Badge>;
                if (isSubmitted) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
                if (isInProgress) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
                return <Badge variant="outline">Pending</Badge>;
              };
              
              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{worksheet.title}</h3>
                          {getStatusBadge()}
                        </div>
                        {worksheet.subject && (
                          <p className="text-sm text-muted-foreground mb-2">{worksheet.subject}</p>
                        )}
                        {worksheet.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {worksheet.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Assigned {format(new Date(assignment.createdAt), 'MMM d, yyyy')}
                          </span>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                            </span>
                          )}
                          {assignment.submittedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Submitted {format(new Date(assignment.submittedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => openWorksheetInNewTab(assignment.id)}
                        variant={isSubmitted ? "outline" : "default"}
                        data-testid={`button-open-worksheet-${worksheet.id}`}
                      >
                        {isSubmitted ? (
                          <><Eye className="h-4 w-4 mr-2" /> View Worksheet</>
                        ) : (
                          <><Send className="h-4 w-4 mr-2" /> Open Worksheet</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
