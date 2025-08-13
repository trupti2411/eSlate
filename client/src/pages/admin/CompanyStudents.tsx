import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { GraduationCap, Eye, Mail, User, Calendar } from "lucide-react";

interface CompanyAdmin {
  id: string;
  userId: string;
  companyId: string;
  permissions: string[];
  createdAt: string;
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

interface CompanyStudent {
  id: string;
  userId: string;
  gradeLevel: string | null;
  parentId: string | null;
  tutorId: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
}

export default function CompanyStudents() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);

  // Redirect if not authenticated or not company admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'company_admin'))) {
      toast({
        title: "Access Denied",
        description: "Company admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch company admin details
  useEffect(() => {
    const fetchCompanyAdmin = async () => {
      if (user && user.role === 'company_admin') {
        try {
          const response = await fetch(`/api/admin/company-admin/${user.id}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const adminData = await response.json();
            setCompanyAdmin(adminData);
          }
        } catch (error) {
          console.error("Failed to fetch company admin data:", error);
        }
      }
    };

    fetchCompanyAdmin();
  }, [user]);

  // Fetch company details
  const { data: company } = useQuery<TutoringCompany>({
    queryKey: ["/api/companies", companyAdmin?.companyId],
    enabled: !!companyAdmin?.companyId,
  });

  // Fetch company students
  const { data: companyStudents = [], isLoading: studentsLoading } = useQuery<CompanyStudent[]>({
    queryKey: ["/api/companies", companyAdmin?.companyId, "students"],
    enabled: !!companyAdmin?.companyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading students...</p>
        </div>
      </div>
    );
  }

  if (!company || !companyAdmin) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Loading Company Data...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="page-title">{company.name} - Students</h1>
            <p className="text-gray-600">View and manage all students in your company</p>
          </div>
        </div>

        {/* Students Section */}
        <Card className="eink-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>{company.name} Students ({companyStudents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading students...</p>
              </div>
            ) : companyStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Student</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Contact</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Grade Level</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Joined Date</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-black">
                                {student.user.firstName} {student.user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {student.user.id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-700">{student.user.email}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm font-medium">
                            {student.gradeLevel || (
                              <span className="text-gray-500 italic">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <Badge 
                            variant={student.user.isActive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {student.user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-700">
                              {new Date(student.user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Student Profile",
                                description: `Viewing profile for ${student.user.firstName} ${student.user.lastName}`,
                              });
                            }}
                            className="eink-button"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Students Yet</h3>
                <p className="text-gray-500 mb-4">
                  Students will appear here once they are assigned to your company's tutors.
                </p>
                <p className="text-sm text-gray-400">
                  Contact system administrators to assign students to your tutors.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}