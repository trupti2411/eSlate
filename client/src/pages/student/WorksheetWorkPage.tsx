import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { WorksheetAnswerer } from '@/components/WorksheetAnswerer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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

  const handleBack = () => window.history.back();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h2 className="font-black text-lg mb-2">Not logged in</h2>
          <a href="/" className="text-indigo-600 font-semibold text-sm">Go to login →</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading worksheet…</p>
        </div>
      </div>
    );
  }

  if (error || !worksheetAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h2 className="font-black text-lg mb-2">Worksheet not found</h2>
          <button onClick={handleBack} className="text-indigo-600 font-semibold text-sm">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">{worksheetAssignment.worksheet.title}</p>
          <p className="text-xs text-indigo-200 truncate">{worksheetAssignment.worksheet.subject || 'Worksheet'}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <WorksheetAnswerer
          worksheetId={worksheetAssignment.worksheet.id}
          studentId={studentDbId}
          assignmentId={worksheetAssignment.assignment.id}
          onClose={handleBack}
          onComplete={handleBack}
        />
      </div>
    </div>
  );
}
