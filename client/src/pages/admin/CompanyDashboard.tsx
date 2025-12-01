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
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import { Building2, Users, Plus, GraduationCap, CheckCircle, UserPlus, Eye, Mail, Phone, MapPin, BookOpen, Calendar, Edit, FileText, ArrowRight } from "lucide-react";

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

  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const [documentFormData, setDocumentFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    subject: "",
    dueDate: "",
    classId: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: companyAdminData } = useQuery({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user && user.role === 'company_admin',
  });

  useEffect(() => {
    if (companyAdminData) {
      setCompanyAdmin(companyAdminData);
    }
  }, [companyAdminData]);

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!companyAdmin,
  });

  const company = Array.isArray(companies) ? companies[0] : companies;

  const { data: tutors } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`],
    enabled: !!companyAdmin?.companyId,
  });

  const { data: students } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/students`],
    enabled: !!companyAdmin?.companyId,
  });

  const { data: classes } = useQuery({
    queryKey: [`/api/companies/${companyAdmin?.companyId}/classes`],
    enabled: !!companyAdmin?.companyId,
  });

  const createTutorMutation = useMutation({
    mutationFn: async (tutorData: any) => {
      return await apiRequest("/api/admin/create-tutor", "POST", tutorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      setIsCreateTutorOpen(false);
      setTutorFormData({ email: "", firstName: "", lastName: "", specialization: "", qualifications: "" });
      toast({ title: "Success", description: "Tutor created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create tutor", variant: "destructive" });
    },
  });

  const assignTutorMutation = useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      return await apiRequest(`/api/students/${studentId}`, "PATCH", { tutorId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsAssignTutorOpen(false);
      setSelectedStudentId(null);
      setTutorAssignmentData({ tutorId: "" });
      toast({ title: "Success", description: "Tutor assigned successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to assign tutor", variant: "destructive" });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        subject: data.subject,
        companyId: companyAdmin?.companyId,
        submissionDate: new Date(data.dueDate).toISOString(),
      };
      // Only include classId if it has a value
      if (data.classId) {
        payload.classId = data.classId;
      }
      return await apiRequest("/api/assignments", "POST", payload);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document assignment created successfully" });
      setIsCreateDocumentOpen(false);
      setDocumentFormData({ title: "", description: "", instructions: "", subject: "", dueDate: "", classId: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create document assignment", variant: "destructive" });
    },
  });

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorMutation.mutate({ ...tutorFormData, companyId: companyAdmin?.companyId });
  };

  const handleAssignTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId && tutorAssignmentData.tutorId) {
      assignTutorMutation.mutate({ studentId: selectedStudentId, tutorId: tutorAssignmentData.tutorId });
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentFormData.title && documentFormData.subject && documentFormData.dueDate) {
      createDocumentMutation.mutate(documentFormData);
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
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!companyAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-2 border-black">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-black">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black">Business Admin Portal</h1>
              <p className="text-gray-600 mt-2">{company?.name || "Loading..."}</p>
            </div>
            <Building2 className="h-16 w-16 text-black opacity-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 py-3 px-6 font-semibold">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Tutor
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
                    <Input id="firstName" value={tutorFormData.firstName} onChange={(e) => setTutorFormData({ ...tutorFormData, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={tutorFormData.lastName} onChange={(e) => setTutorFormData({ ...tutorFormData, lastName: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={tutorFormData.email} onChange={(e) => setTutorFormData({ ...tutorFormData, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" value={tutorFormData.specialization} onChange={(e) => setTutorFormData({ ...tutorFormData, specialization: e.target.value })} placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input id="qualifications" value={tutorFormData.qualifications} onChange={(e) => setTutorFormData({ ...tutorFormData, qualifications: e.target.value })} placeholder="e.g., B.Sc. Mathematics" />
                </div>
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={createTutorMutation.isPending}>
                  {createTutorMutation.isPending ? "Creating..." : "Create Tutor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Link href="/company/tutors">
            <Button variant="outline" className="border-2 border-black bg-white text-black hover:bg-gray-100 py-3 px-6 font-semibold">
              <Users className="h-5 w-5 mr-2" />
              Manage Tutors
            </Button>
          </Link>

          <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white border-2 border-black hover:bg-gray-800 py-3 px-6 font-semibold">
                <FileText className="h-5 w-5 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Document Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDocument} className="space-y-3">
                <div>
                  <Label htmlFor="docTitle" className="text-xs">Worksheet Title *</Label>
                  <Input id="docTitle" value={documentFormData.title} onChange={(e) => setDocumentFormData({ ...documentFormData, title: e.target.value })} placeholder="e.g., Algebra Worksheet" required />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-xs">Subject *</Label>
                  <Input id="subject" value={documentFormData.subject} onChange={(e) => setDocumentFormData({ ...documentFormData, subject: e.target.value })} placeholder="e.g., Mathematics" required />
                </div>
                <div>
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Input id="description" value={documentFormData.description} onChange={(e) => setDocumentFormData({ ...documentFormData, description: e.target.value })} placeholder="What this worksheet covers" />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-xs">Due Date *</Label>
                  <Input id="dueDate" type="datetime-local" value={documentFormData.dueDate} onChange={(e) => setDocumentFormData({ ...documentFormData, dueDate: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 text-sm" disabled={createDocumentMutation.isPending}>
                  {createDocumentMutation.isPending ? "Creating..." : "Create Worksheet"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Link href="/company/assignments">
            <Button variant="outline" className="border-2 border-black bg-white text-black hover:bg-gray-100 py-3 px-6 font-semibold">
              <FileText className="h-5 w-5 mr-2" />
              View Assignments
            </Button>
          </Link>

          <Link href="/company/academic">
            <Button variant="outline" className="border-2 border-black bg-white text-black hover:bg-gray-100 py-3 px-6 font-semibold">
              <Calendar className="h-5 w-5 mr-2" />
              Academic Setup
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{Array.isArray(tutors) ? tutors.length : 0}</div>
              <p className="text-xs text-gray-600 mt-1">Active staff</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{Array.isArray(students) ? students.length : 0}</div>
              <p className="text-xs text-gray-600 mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {Array.isArray(students) ? students.filter((s: any) => s.tutorId).length : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">With tutors</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {Array.isArray(students) ? students.filter((s: any) => !s.tutorId).length : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Need assignment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info & Students */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            {company && (
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Company</p>
                    <p className="font-semibold text-black">{company.name}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                      <p className="font-medium text-sm text-black">{company.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                      <p className="font-medium text-sm text-black">{company.contactPhone || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</p>
                    <p className="font-medium text-sm text-black">{company.address || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Students */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Students Needing Assignment ({Array.isArray(students) ? students.filter((s: any) => !s.tutorId).length : 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students && Array.isArray(students) && students.filter((s: any) => !s.tutorId).length > 0 ? (
                  <div className="space-y-2">
                    {students.filter((s: any) => !s.tutorId).slice(0, 5).map((student: CompanyStudent) => (
                      <div key={student.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-black transition-colors flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-black">{student.user.firstName} {student.user.lastName}</p>
                          <p className="text-xs text-gray-600">{student.user.email}</p>
                        </div>
                        <Button size="sm" onClick={() => openTutorAssignmentDialog(student.id)} className="bg-black text-white hover:bg-gray-800">
                          Assign
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-600">All students assigned!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/company/students">
                  <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                    <Users className="h-4 w-4 mr-2" />
                    All Students
                  </Button>
                </Link>
                <Link href="/company/tutors">
                  <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                    <Users className="h-4 w-4 mr-2" />
                    All Tutors
                  </Button>
                </Link>
                <Link href="/company/homework">
                  <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-gray-100">
                    <FileText className="h-4 w-4 mr-2" />
                    Submissions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* All Tutors */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-base">Staff Team</CardTitle>
              </CardHeader>
              <CardContent>
                {tutors && Array.isArray(tutors) && tutors.length > 0 ? (
                  <div className="space-y-2">
                    {tutors.slice(0, 4).map((tutor: CompanyTutor) => (
                      <div key={tutor.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                        <p className="font-medium text-sm text-black">
                          {tutor.user?.firstName} {tutor.user?.lastName}
                        </p>
                        {tutor.specialization && <p className="text-xs text-gray-600">{tutor.specialization}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No tutors yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isAssignTutorOpen} onOpenChange={setIsAssignTutorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tutor to Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignTutor} className="space-y-4">
            <div>
              <Label htmlFor="tutorSelect">Select Tutor</Label>
              <Select value={tutorAssignmentData.tutorId} onValueChange={(value) => setTutorAssignmentData({ tutorId: value })} required>
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
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={assignTutorMutation.isPending}>
              {assignTutorMutation.isPending ? "Assigning..." : "Assign Tutor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {selectedStudentId && companyAdmin?.companyId && (
        <StudentProfileDialog studentId={selectedStudentId} companyId={companyAdmin.companyId} isOpen={isStudentProfileOpen} onClose={() => { setIsStudentProfileOpen(false); setSelectedStudentId(null); }} />
      )}
    </div>
  );
}
