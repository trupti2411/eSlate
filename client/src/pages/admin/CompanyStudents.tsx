import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone, UserPlus } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  parentEmail?: string;
  isActive: boolean;
  enrollmentDate: string;
}

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

export default function CompanyStudents() {
  const { user } = useAuth();

  // Fetch company admin data
  const { data: companyAdmin } = useQuery<CompanyAdmin>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id && user?.role === 'company_admin',
  });

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: [`/api/companies/${companyAdmin?.companyId}`],
    enabled: !!companyAdmin?.companyId,
  });

  // Fetch students for this company
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/students`],
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Link href="/company">
              <Button variant="outline" size="sm" className="mb-3 border-black text-black hover:bg-gray-100">
                ← Back to Company
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {company.name} - Students
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage students enrolled with your tutoring company
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {students?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {students?.filter(s => s.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {students?.filter(s => !s.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No students enrolled yet</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Students will appear here once they're enrolled with your company
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div 
                    key={student.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </h3>
                          <Badge variant={student.isActive ? "default" : "secondary"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-4 w-4 mr-2" />
                            {student.email}
                          </div>
                          {student.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="h-4 w-4 mr-2" />
                              {student.phone}
                            </div>
                          )}
                          {student.parentEmail && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Mail className="h-4 w-4 mr-2" />
                              Parent: {student.parentEmail}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}