import { useAuth } from '@/hooks/useAuth';
import { WorksheetManagement } from './WorksheetManagement';
import { useQuery } from '@tanstack/react-query';

interface CompanyAdmin {
  id: string;
  userId: string;
  companyId: string;
}

export function WorksheetManagementPage() {
  const { user } = useAuth();

  const { data: companyAdmin } = useQuery<CompanyAdmin>({
    queryKey: ['/api/admin/company-admin/me'],
    queryFn: () => fetch('/api/admin/company-admin/me', { credentials: 'include' }).then(r => r.json()),
    enabled: user?.role === 'company_admin',
  });

  if (!companyAdmin?.companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <WorksheetManagement companyId={companyAdmin.companyId} />;
}
