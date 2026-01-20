import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { WorksheetAnswerer } from '@/components/WorksheetAnswerer';
import { AlertCircle, X } from 'lucide-react';

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
  };
}

export function WorksheetWorkPage() {
  const { user } = useAuth();
  const [, params] = useRoute('/student/worksheet/:id');
  const worksheetAssignmentId = params?.id;
  
  const studentDbId = `student-${user?.id}`;

  const { data: worksheets = [], isLoading, error } = useQuery<WorksheetAssignment[]>({
    queryKey: ['/api/students', studentDbId, 'worksheets'],
    queryFn: () => fetch(`/api/students/${studentDbId}/worksheets`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!studentDbId,
  });

  const worksheetAssignment = worksheets.find(w => w.assignment.id === worksheetAssignmentId);

  const handleClose = () => {
    window.close();
  };

  const handleComplete = () => {
    window.close();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your worksheets.</p>
          <Link href="/student">
            <Button className="bg-black text-white">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worksheet...</p>
        </div>
      </div>
    );
  }

  if (error || !worksheetAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Worksheet Not Found</h2>
          <p className="text-gray-600 mb-4">The worksheet you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={handleClose} className="bg-black text-white">
            Close Tab
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorksheetAnswerer
        worksheetId={worksheetAssignment.worksheet.id}
        studentId={studentDbId}
        assignmentId={worksheetAssignment.assignment.id}
        onClose={handleClose}
        onComplete={handleComplete}
      />
    </div>
  );
}
