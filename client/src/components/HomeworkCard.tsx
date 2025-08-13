import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  maxPoints?: number;
}

interface HomeworkCardProps {
  assignment: Assignment;
}

export default function HomeworkCard({ assignment }: HomeworkCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'status-assigned';
      case 'submitted':
        return 'status-submitted';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-assigned';
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <Card className="eink-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-black">{assignment.title}</CardTitle>
            {assignment.description && (
              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
            )}
          </div>
          <Badge className={`status-badge ${getStatusColor(assignment.status)}`}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDueDate(assignment.dueDate)}</span>
          </div>
          {assignment.maxPoints && (
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{assignment.maxPoints} points</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {assignment.status === 'assigned' && (
            <Button className="eink-button-primary flex-1">
              Start Assignment
            </Button>
          )}
          {assignment.status === 'submitted' && (
            <Button className="eink-button flex-1" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Under Review
            </Button>
          )}
          {assignment.status === 'completed' && (
            <Button className="eink-button flex-1">
              View Results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
