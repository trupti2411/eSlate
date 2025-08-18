import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import { Building2, Users, Plus, GraduationCap, CheckCircle, Clock, UserPlus, Eye, Mail, Phone, MapPin, BookOpen, Calendar, Edit, FileText } from "lucide-react";

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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);

  const [tutorFormData, setTutorFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    specialization: "",
    qualifications: "",
  });

  const [tutorAssignmentData, setTutorAssignmentData] = useState({
    tutorId: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch company admin data
  const { data: companyAdminData } = useQuery({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user && user.role === 'company_admin',
  });

  useEffect(() => {
    if (companyAdminData) {
      setCompanyAdmin(companyAdminData);
    }
  }, [companyAdminData]);

  // Fetch company data
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!companyAdmin,
  });

  const company = Array.isArray(companies) ? companies[0] : companies;

  // Fetch tutors
  const { data: tutors } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`],
    enabled: !!companyAdmin?.companyId,
  });

  // Fetch students
  const { data: students } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/students`],
    enabled: !!companyAdmin?.companyId,
  });

  // Create tutor mutation
  const createTutorMutation = useMutation({
    mutationFn: async (tutorData: any) => {
      const response = await apiRequest("/api/admin/create-tutor", "POST", tutorData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      setIsCreateTutorOpen(false);
      setTutorFormData({
        email: "",
        firstName: "",
        lastName: "",
        specialization: "",
        qualifications: "",
      });
      toast({
        title: "Success",
        description: "Tutor created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tutor",
        variant: "destructive",
      });
    },
  });

  // Assign tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      const response = await apiRequest(`/api/students/${studentId}`, "PATCH", { tutorId });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsAssignTutorOpen(false);
      setSelectedStudentId(null);
      setTutorAssignmentData({ tutorId: "" });
      toast({
        title: "Success",
        description: "Tutor assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    },
  });

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorMutation.mutate({
      ...tutorFormData,
      companyId: companyAdmin?.companyId,
    });
  };

  const handleAssignTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId && tutorAssignmentData.tutorId) {
      assignTutorMutation.mutate({
        studentId: selectedStudentId,
        tutorId: tutorAssignmentData.tutorId,
      });
    }
  };

  const openTutorAssignmentDialog = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAssignTutorOpen(true);
  };

  const openStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsStudentProfileOpen(true);
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

  if (!companyAdmin) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="page-title">Business Admin Dashboard</h1>
          {company && (
            <p className="text-gray-600">{company.name} Management</p>
          )}
        </div>

        {/* Company Overview */}
        {company && (
          <Card className="eink-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-semibold">{company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {company.contactEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {company.contactPhone || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {company.address || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-semibold">{company.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="dashboard-grid mb-8">
          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Total Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(tutors) ? tutors.length : 0}</div>
              <p className="text-sm text-gray-600">Active tutors</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(students) ? students.length : 0}</div>
              <p className="text-sm text-gray-600">Enrolled students</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-gray-600">Current sessions</p>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-sm text-gray-600">Average progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="eink-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full eink-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Tutor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Tutor</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTutor} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={tutorFormData.firstName}
                          onChange={(e) => setTutorFormData({ ...tutorFormData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={tutorFormData.lastName}
                          onChange={(e) => setTutorFormData({ ...tutorFormData, lastName: e.target.value })}
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
                        onChange={(e) => setTutorFormData({ ...tutorFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={tutorFormData.specialization}
                        onChange={(e) => setTutorFormData({ ...tutorFormData, specialization: e.target.value })}
                        placeholder="e.g., Mathematics, Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qualifications">Qualifications</Label>
                      <Input
                        id="qualifications"
                        value={tutorFormData.qualifications}
                        onChange={(e) => setTutorFormData({ ...tutorFormData, qualifications: e.target.value })}
                        placeholder="e.g., B.Sc. Mathematics, Teaching Certificate"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full eink-button"
                      disabled={createTutorMutation.isPending}
                    >
                      {createTutorMutation.isPending ? "Creating..." : "Create Tutor"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Link href="/company/tutors">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Tutors
                </Button>
              </Link>

              <Link href="/company/students">
                <Button variant="outline" className="w-full">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
              </Link>

              <Link href="/company/academic">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Academic Management
                </Button>
              </Link>

              <Link href="/company/assignments">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Assignment Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="eink-card">
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              {students && Array.isArray(students) && students.length > 0 ? (
                <div className="space-y-2">
                  {students.slice(0, 5).map((student: CompanyStudent) => (
                    <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{student.user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStudentProfile(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTutorAssignmentDialog(student.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No students enrolled yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tutor Assignment Dialog */}
        <Dialog open={isAssignTutorOpen} onOpenChange={setIsAssignTutorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Tutor to Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignTutor} className="space-y-4">
              <div>
                <Label htmlFor="tutorSelect">Select Tutor</Label>
                <Select
                  value={tutorAssignmentData.tutorId}
                  onValueChange={(value) => setTutorAssignmentData({ tutorId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown Tutor'}
                        {tutor.specialization && ` - ${tutor.specialization}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full eink-button"
                disabled={assignTutorMutation.isPending}
              >
                {assignTutorMutation.isPending ? "Assigning..." : "Assign Tutor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Student Profile Dialog */}
        {selectedStudentId && companyAdmin?.companyId && (
          <StudentProfileDialog
            studentId={selectedStudentId}
            companyId={companyAdmin.companyId}
            isOpen={isStudentProfileOpen}
            onClose={() => {
              setIsStudentProfileOpen(false);
              setSelectedStudentId(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}