import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Building2, Users, Plus, GraduationCap, CheckCircle, Clock, UserPlus, Eye, Mail, Phone, MapPin } from "lucide-react";

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

interface CompanyTutor {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string;
  isVerified: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
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

export default function CompanyDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCreateTutorOpen, setIsCreateTutorOpen] = useState(false);
  const [isAssignTutorOpen, setIsAssignTutorOpen] = useState(false);
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);

  const [tutorFormData, setTutorFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    specialization: "",
    qualifications: "",
  });

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

  // Fetch company tutors
  const { data: tutors, isLoading: loadingTutors } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/companies", companyAdmin?.companyId, "tutors"],
    enabled: !!companyAdmin?.companyId,
  });

  // Fetch unassigned tutors for assignment
  const { data: unassignedTutors } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/admin/unassigned-tutors"],
    enabled: !!companyAdmin?.companyId,
  });

  // Fetch company students
  const { data: companyStudents = [], isLoading: studentsLoading } = useQuery<CompanyStudent[]>({
    queryKey: ["/api/companies", companyAdmin?.companyId, "students"],
    enabled: !!companyAdmin?.companyId,
  });

  // Create tutor mutation
  const createTutorMutation = useMutation({
    mutationFn: async (tutorData: typeof tutorFormData) => {
      return await apiRequest("/api/admin/users", "POST", {
        ...tutorData,
        role: "tutor",
        companyId: companyAdmin?.companyId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor created successfully",
      });
      setIsCreateTutorOpen(false);
      setTutorFormData({
        email: "",
        firstName: "",
        lastName: "",
        specialization: "",
        qualifications: "",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/companies", companyAdmin?.companyId, "tutors"] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tutor",
        variant: "destructive",
      });
    },
  });

  // Assign existing tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return await apiRequest(`/api/companies/${companyAdmin?.companyId}/assign-tutor/${tutorId}`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor assigned successfully",
      });
      setIsAssignTutorOpen(false);
      queryClient.invalidateQueries({ 
        queryKey: ["/api/companies", companyAdmin?.companyId, "tutors"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/admin/unassigned-tutors"] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setTutorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorMutation.mutate(tutorFormData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
            <h1 className="page-title">{company.name} - Admin Dashboard</h1>
            <p className="text-gray-600">Manage your tutoring company's staff and operations</p>
          </div>
          
          <div className="flex space-x-2">
            <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
              <DialogTrigger asChild>
                <Button className="eink-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Tutor
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={isAssignTutorOpen} onOpenChange={setIsAssignTutorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="eink-button">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Existing Tutor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Existing Tutor to {company?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {unassignedTutors && unassignedTutors.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Select a tutor to assign to your company:
                      </p>
                      {unassignedTutors.map((tutor) => (
                        <Card key={tutor.id} className="border p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                              </h4>
                              <p className="text-sm text-gray-600">{tutor.user?.email}</p>
                              {tutor.specialization && (
                                <p className="text-sm text-gray-500">
                                  Specialization: {tutor.specialization}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() => assignTutorMutation.mutate(tutor.id)}
                              disabled={assignTutorMutation.isPending}
                            >
                              Assign
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No unassigned tutors available
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Tutor to {company.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={tutorFormData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={tutorFormData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tutorFormData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={tutorFormData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    placeholder="e.g., Mathematics, Science, Language Arts"
                  />
                </div>

                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input
                    id="qualifications"
                    value={tutorFormData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    placeholder="e.g., B.S. Mathematics, Teaching Certificate"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateTutorOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTutorMutation.isPending}>
                    {createTutorMutation.isPending ? "Creating..." : "Create Tutor"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Company Overview */}
        <Card className="eink-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Company Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Building2 className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-semibold">{company.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-semibold">{company.contactEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-semibold">{company.contactPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{company.address || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={company.isActive ? "default" : "destructive"}>
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {company.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Description</p>
                <p className="mt-1">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tutors Section */}
        <Card className="eink-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{company?.name || 'Company'} Tutors ({tutors?.length || 0})</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateTutorOpen(true)}
                  className="text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignTutorOpen(true)}
                  className="text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Existing
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTutors ? (
              <p>Loading tutors...</p>
            ) : tutors && tutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutors.map((tutor) => (
                  <Card key={tutor.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                          </h4>
                        </div>
                        <Badge variant={tutor.isVerified ? "default" : "secondary"}>
                          {tutor.isVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      {tutor.user?.email && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Email:</strong> {tutor.user.email}
                        </p>
                      )}
                      
                      {tutor.specialization && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Specialization:</strong> {tutor.specialization}
                        </p>
                      )}
                      
                      {tutor.qualifications && (
                        <p className="text-sm text-gray-600">
                          <strong>Qualifications:</strong> {tutor.qualifications}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tutors Yet</h3>
                <p className="text-gray-500 mb-4">Add your first tutor to get started.</p>
                <Button onClick={() => setIsCreateTutorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Tutor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card className="eink-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>{company?.name || 'Company'} Students ({companyStudents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <p>Loading students...</p>
            ) : companyStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Email</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Grade Level</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Joined</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="font-medium">
                            {student.user.firstName} {student.user.lastName}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="text-sm text-gray-600">
                            {student.user.email}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="text-sm">
                            {student.gradeLevel || 'Not set'}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Badge 
                            variant={student.user.isActive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {student.user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="text-sm text-gray-600">
                            {new Date(student.user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement student profile view
                              toast({
                                title: "Student Profile",
                                description: `Viewing profile for ${student.user.firstName} ${student.user.lastName}`,
                              });
                            }}
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
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Students Yet</h3>
                <p className="text-gray-500">Students will appear here once they are assigned to your company's tutors.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}