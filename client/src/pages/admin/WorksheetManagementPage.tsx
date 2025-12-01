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

  const { data: companyAdmin, isLoading } = useQuery<CompanyAdmin>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user && user?.role === 'company_admin',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading worksheets...</p>
        </div>
      </div>
    );
  }

  if (!companyAdmin?.companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center border-2 border-black p-8 rounded-lg">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-gray-600 mt-2">You need to be a business admin to access worksheets.</p>
        </div>
      </div>
    );
  }

  return <WorksheetManagement companyId={companyAdmin.companyId} />;
}
