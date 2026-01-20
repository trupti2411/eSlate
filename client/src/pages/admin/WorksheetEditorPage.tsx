import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { WorksheetEditor } from '@/components/WorksheetEditor';
import { queryClient } from '@/lib/queryClient';

export function WorksheetEditorPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ worksheetId?: string }>();
  
  const companyId = (user as any)?.roleData?.companyId;
  const worksheetId = params.worksheetId;

  if (!user || !['company_admin', 'tutor'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">You don't have permission to edit worksheets.</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading company information...</p>
      </div>
    );
  }

  const handleClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
    window.close();
  };

  const handleSave = (savedWorksheetId: string) => {
    queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
    window.close();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorksheetEditor
        worksheetId={worksheetId === 'new' ? undefined : worksheetId}
        companyId={companyId}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
}
