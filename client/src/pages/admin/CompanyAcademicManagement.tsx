import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import AcademicManagement from './AcademicManagement';

interface CompanyAdmin {
  id: string;
  userId: string;
  companyId: string;
  permissions: string[];
}

interface TutoringCompany {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
}

export default function CompanyAcademicManagement() {
  const { user } = useAuth();
  
  console.log('CompanyAcademicManagement loaded. User:', user);

  // Fetch company admin data
  const { data: companyAdmin, isLoading: companyAdminLoading, error: companyAdminError } = useQuery<CompanyAdmin>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id && user?.role === 'company_admin',
  });
  
  console.log('Company admin query state:', { companyAdmin, companyAdminLoading, companyAdminError });

  // Fetch company details
  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<TutoringCompany>({
    queryKey: [`/api/companies/${companyAdmin?.companyId}`],
    enabled: !!companyAdmin?.companyId,
  });
  
  console.log('Company query state:', { company, companyLoading, companyError });

  if (!user || user.role !== 'company_admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Access denied. Company admin access required.</p>
        </div>
      </Layout>
    );
  }

  if (!companyAdmin || companyLoading) {
    console.log('Loading state triggered:', { companyAdmin, companyAdminLoading, companyLoading });
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading company data...</p>
        </div>
      </Layout>
    );
  }

  if (!company) {
    console.log('Company not found state:', { company, companyLoading, companyError });
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div>
            <p className="text-gray-600 dark:text-gray-300">Company not found.</p>
            {companyError && (
              <p className="text-red-600 text-sm mt-2">
                Error: {(companyError as Error).message}
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Rendering AcademicManagement with:', { 
    companyId: companyAdmin.companyId, 
    companyName: company.name 
  });

  return (
    <Layout>
      <AcademicManagement 
        companyId={companyAdmin.companyId} 
        companyName={company.name}
      />
    </Layout>
  );
}