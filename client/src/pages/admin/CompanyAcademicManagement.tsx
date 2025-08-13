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

  // Fetch company admin data
  const { data: companyAdmin } = useQuery<CompanyAdmin>({
    queryKey: [`/api/company-admin/${user?.id}`],
    enabled: !!user?.id && user?.role === 'company_admin',
  });

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: [`/api/companies/${companyAdmin?.companyId}`],
    enabled: !!companyAdmin?.companyId,
  });

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
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Company not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AcademicManagement 
        companyId={companyAdmin.companyId} 
        companyName={company.name}
      />
    </Layout>
  );
}