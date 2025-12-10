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
import { CompanyCalendarDashboard } from "@/components/calendar";
import AcademicManagement from "./AcademicManagement";
import { WorksheetManagement } from "./WorksheetManagement";
import { AssignmentManagement } from "@/pages/assignments/AssignmentManagement";
import { Building2, Users, Plus, GraduationCap, CheckCircle, UserPlus, Eye, Mail, Phone, MapPin, BookOpen, Calendar, Edit, FileText, ArrowRight, Home, LayoutDashboard, Trash2, X } from "lucide-react";

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

interface ClassSchedule {
  className: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
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
  schedules?: ClassSchedule[];
  studentCount?: number;
}

interface CompanyStudent {
  id: string;
  userId: string;
  gradeLevel: string | null;
  parentId: string | null;
  tutorId: string | null;
  classId: string | null;
  schoolName: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
  class?: {
    id: string;
    name: string;
    academicYearId: string;
  };
  tutor?: {
    id: string;
    user?: {
      firstName: string;
      lastName: string;
    };
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
  const [mainTab, setMainTab] = useState<'overview' | 'calendar' | 'tutors' | 'students' | 'academic' | 'worksheets' | 'assignments'>('overview');
  const [isEditTutorOpen, setIsEditTutorOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<CompanyTutor | null>(null);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<CompanyStudent | null>(null);
  const [studentSortBy, setStudentSortBy] = useState<'name' | 'email' | 'class' | 'tutor'>('name');
  const [studentSortOrder, setStudentSortOrder] = useState<'asc' | 'desc'>('asc');
  const [studentFilterClass, setStudentFilterClass] = useState<string>('all');
  const [studentFilterTutor, setStudentFilterTutor] = useState<string>('all');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const [tutorSortBy, setTutorSortBy] = useState<'name' | 'email' | 'specialization' | 'status'>('name');
  const [tutorSortOrder, setTutorSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tutorFilterStatus, setTutorFilterStatus] = useState<string>('all');
  const [tutorFilterSpecialization, setTutorFilterSpecialization] = useState<string>('all');
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');

  const [studentFormData, setStudentFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    gradeLevel: "",
    schoolName: "",
    classId: "",
    tutorId: "",
  });

  const [editStudentFormData, setEditStudentFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gradeLevel: "",
    schoolName: "",
    classId: "",
    tutorId: "",
  });

  const [tutorFormData, setTutorFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    specialization: "",
    qualifications: "",
  });

  const [editTutorFormData, setEditTutorFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialization: "",
    qualifications: "",
  });

  const [tutorAssignmentData, setTutorAssignmentData] = useState({
    tutorId: "",
  });


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: companyAdminData, isLoading: companyAdminLoading } = useQuery<CompanyAdmin>({
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

  const updateTutorMutation = useMutation({
    mutationFn: async ({ tutorId, userId, data }: { tutorId: string; userId: string; data: any }) => {
      await apiRequest(`/api/admin/users/${userId}`, "PATCH", { firstName: data.firstName, lastName: data.lastName, email: data.email });
      return await apiRequest(`/api/tutors/${tutorId}`, "PATCH", { specialization: data.specialization, qualifications: data.qualifications });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      setIsEditTutorOpen(false);
      setEditingTutor(null);
      toast({ title: "Success", description: "Tutor updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update tutor", variant: "destructive" });
    },
  });

  const deleteTutorMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/tutors`] });
      toast({ title: "Success", description: "Tutor removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove tutor", variant: "destructive" });
    },
  });

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorMutation.mutate({ ...tutorFormData, companyId: companyAdmin?.companyId });
  };

  const handleEditTutor = (tutor: CompanyTutor) => {
    setEditingTutor(tutor);
    setEditTutorFormData({
      firstName: tutor.user?.firstName || "",
      lastName: tutor.user?.lastName || "",
      email: tutor.user?.email || "",
      specialization: tutor.specialization || "",
      qualifications: tutor.qualifications || "",
    });
    setIsEditTutorOpen(true);
  };

  const handleUpdateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTutor && editingTutor.userId) {
      updateTutorMutation.mutate({ tutorId: editingTutor.id, userId: editingTutor.userId, data: editTutorFormData });
    }
  };

  const handleDeleteTutor = (tutor: CompanyTutor) => {
    if (confirm(`Are you sure you want to remove ${tutor.user?.firstName} ${tutor.user?.lastName}?`)) {
      deleteTutorMutation.mutate(tutor.userId);
    }
  };

  // Student CRUD mutations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return await apiRequest("/api/admin/create-student", "POST", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsCreateStudentOpen(false);
      setStudentFormData({ email: "", firstName: "", lastName: "", gradeLevel: "", schoolName: "", classId: "", tutorId: "" });
      toast({ title: "Success", description: "Student created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create student", variant: "destructive" });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ studentId, userId, data }: { studentId: string; userId: string; data: any }) => {
      await apiRequest(`/api/admin/users/${userId}`, "PATCH", { firstName: data.firstName, lastName: data.lastName, email: data.email });
      return await apiRequest(`/api/students/${studentId}`, "PATCH", { gradeLevel: data.gradeLevel, schoolName: data.schoolName, classId: data.classId || null, tutorId: data.tutorId || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      setIsEditStudentOpen(false);
      setEditingStudent(null);
      toast({ title: "Success", description: "Student updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update student", variant: "destructive" });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyAdmin?.companyId}/students`] });
      toast({ title: "Success", description: "Student removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove student", variant: "destructive" });
    },
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    createStudentMutation.mutate({ ...studentFormData, companyId: companyAdmin?.companyId });
  };

  const handleEditStudent = (student: CompanyStudent) => {
    setEditingStudent(student);
    setEditStudentFormData({
      firstName: student.user?.firstName || "",
      lastName: student.user?.lastName || "",
      email: student.user?.email || "",
      gradeLevel: student.gradeLevel || "",
      schoolName: student.schoolName || "",
      classId: student.classId || "",
      tutorId: student.tutorId || "",
    });
    setIsEditStudentOpen(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && editingStudent.userId) {
      updateStudentMutation.mutate({ studentId: editingStudent.id, userId: editingStudent.userId, data: editStudentFormData });
    }
  };

  const handleDeleteStudent = (student: CompanyStudent) => {
    if (confirm(`Are you sure you want to remove ${student.user?.firstName} ${student.user?.lastName}?`)) {
      deleteStudentMutation.mutate(student.userId);
    }
  };

  // Sorting and filtering for students
  const getFilteredAndSortedStudents = () => {
    if (!students || !Array.isArray(students)) return [];
    
    let filtered = [...students];
    
    // Apply search filter
    if (studentSearchTerm) {
      const term = studentSearchTerm.toLowerCase();
      filtered = filtered.filter((s: CompanyStudent) => 
        s.user?.firstName?.toLowerCase().includes(term) ||
        s.user?.lastName?.toLowerCase().includes(term) ||
        s.user?.email?.toLowerCase().includes(term)
      );
    }
    
    // Apply class filter
    if (studentFilterClass !== 'all') {
      filtered = filtered.filter((s: CompanyStudent) => s.classId === studentFilterClass);
    }
    
    // Apply tutor filter
    if (studentFilterTutor !== 'all') {
      if (studentFilterTutor === 'unassigned') {
        filtered = filtered.filter((s: CompanyStudent) => !s.tutorId);
      } else {
        filtered = filtered.filter((s: CompanyStudent) => s.tutorId === studentFilterTutor);
      }
    }
    
    // Apply sorting
    filtered.sort((a: CompanyStudent, b: CompanyStudent) => {
      let comparison = 0;
      switch (studentSortBy) {
        case 'name':
          comparison = `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`);
          break;
        case 'email':
          comparison = (a.user?.email || '').localeCompare(b.user?.email || '');
          break;
        case 'class':
          comparison = (a.class?.name || 'zzz').localeCompare(b.class?.name || 'zzz');
          break;
        case 'tutor':
          const aTutor = a.tutor?.user ? `${a.tutor.user.firstName} ${a.tutor.user.lastName}` : 'zzz';
          const bTutor = b.tutor?.user ? `${b.tutor.user.firstName} ${b.tutor.user.lastName}` : 'zzz';
          comparison = aTutor.localeCompare(bTutor);
          break;
      }
      return studentSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Sorting and filtering for tutors
  const getFilteredAndSortedTutors = () => {
    if (!tutors || !Array.isArray(tutors)) return [];
    
    let filtered = [...tutors];
    
    // Apply search filter
    if (tutorSearchTerm) {
      const term = tutorSearchTerm.toLowerCase();
      filtered = filtered.filter((t: CompanyTutor) => 
        t.user?.firstName?.toLowerCase().includes(term) ||
        t.user?.lastName?.toLowerCase().includes(term) ||
        t.user?.email?.toLowerCase().includes(term) ||
        t.specialization?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (tutorFilterStatus !== 'all') {
      if (tutorFilterStatus === 'verified') {
        filtered = filtered.filter((t: CompanyTutor) => t.isVerified);
      } else if (tutorFilterStatus === 'pending') {
        filtered = filtered.filter((t: CompanyTutor) => !t.isVerified);
      }
    }
    
    // Apply specialization filter
    if (tutorFilterSpecialization !== 'all') {
      filtered = filtered.filter((t: CompanyTutor) => t.specialization === tutorFilterSpecialization);
    }
    
    // Apply sorting
    filtered.sort((a: CompanyTutor, b: CompanyTutor) => {
      let comparison = 0;
      switch (tutorSortBy) {
        case 'name':
          comparison = `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`);
          break;
        case 'email':
          comparison = (a.user?.email || '').localeCompare(b.user?.email || '');
          break;
        case 'specialization':
          comparison = (a.specialization || 'zzz').localeCompare(b.specialization || 'zzz');
          break;
        case 'status':
          comparison = (a.isVerified ? 0 : 1) - (b.isVerified ? 0 : 1);
          break;
      }
      return tutorSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Get unique specializations from tutors
  const getUniqueSpecializations = () => {
    if (!tutors || !Array.isArray(tutors)) return [];
    const specs = tutors.map((t: CompanyTutor) => t.specialization).filter(Boolean);
    return [...new Set(specs)];
  };

  const handleAssignTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId && tutorAssignmentData.tutorId) {
      assignTutorMutation.mutate({ studentId: selectedStudentId, tutorId: tutorAssignmentData.tutorId });
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

  if (isLoading || companyAdminLoading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/company">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Business Admin Portal</h1>
                <p className="text-gray-500 text-sm">{company?.name || "Loading..."}</p>
              </div>
            </div>
            <Building2 className="h-12 w-12 text-black opacity-10" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Button
              variant={mainTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setMainTab('overview')}
              className={`rounded-b-none border-b-2 ${mainTab === 'overview' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-overview"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={mainTab === 'tutors' ? 'default' : 'ghost'}
              onClick={() => setMainTab('tutors')}
              className={`rounded-b-none border-b-2 ${mainTab === 'tutors' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-tutors"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Tutors
            </Button>
            <Button
              variant={mainTab === 'students' ? 'default' : 'ghost'}
              onClick={() => setMainTab('students')}
              className={`rounded-b-none border-b-2 ${mainTab === 'students' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-students"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Manage Students
            </Button>
            <Button
              variant={mainTab === 'academic' ? 'default' : 'ghost'}
              onClick={() => setMainTab('academic')}
              className={`rounded-b-none border-b-2 ${mainTab === 'academic' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-academic"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Academic Setup
            </Button>
            <Button
              variant={mainTab === 'worksheets' ? 'default' : 'ghost'}
              onClick={() => setMainTab('worksheets')}
              className={`rounded-b-none border-b-2 ${mainTab === 'worksheets' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-worksheets"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Worksheets
            </Button>
            <Button
              variant={mainTab === 'assignments' ? 'default' : 'ghost'}
              onClick={() => setMainTab('assignments')}
              className={`rounded-b-none border-b-2 ${mainTab === 'assignments' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-assignments"
            >
              <FileText className="h-4 w-4 mr-2" />
              Assignments
            </Button>
            <Button
              variant={mainTab === 'calendar' ? 'default' : 'ghost'}
              onClick={() => setMainTab('calendar')}
              className={`rounded-b-none border-b-2 ${mainTab === 'calendar' ? 'border-black bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}
              data-testid="tab-calendar"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {mainTab === 'overview' && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        </div>
      </div>
      )}

      {mainTab === 'tutors' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Manage Tutors</h2>
              <p className="text-gray-600">Add, edit, or remove tutors from your organization</p>
            </div>
            <Dialog open={isCreateTutorOpen} onOpenChange={setIsCreateTutorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white border-2 border-black hover:bg-gray-800" data-testid="button-add-tutor">
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
          </div>

          {/* Filters and Sorting for Tutors */}
          <Card className="border-2 border-black mb-6">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="tutorSearch" className="text-xs text-gray-600">Search</Label>
                  <Input
                    id="tutorSearch"
                    placeholder="Search by name, email, or specialization..."
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    className="border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Status</Label>
                  <Select value={tutorFilterStatus} onValueChange={setTutorFilterStatus}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Specialization</Label>
                  <Select value={tutorFilterSpecialization} onValueChange={setTutorFilterSpecialization}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {getUniqueSpecializations().map((spec: string) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Sort By</Label>
                  <div className="flex gap-1">
                    <Select value={tutorSortBy} onValueChange={(v: any) => setTutorSortBy(v)}>
                      <SelectTrigger className="border-black flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="specialization">Specialization</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTutorSortOrder(tutorSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="border-black px-2"
                    >
                      {tutorSortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors List */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Tutors ({getFilteredAndSortedTutors().length} of {Array.isArray(tutors) ? tutors.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedTutors().length > 0 ? (
                <div className="space-y-3">
                  {getFilteredAndSortedTutors().map((tutor: CompanyTutor) => (
                    <div key={tutor.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-black transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <button
                            onClick={() => handleEditTutor(tutor)}
                            className="text-left hover:underline"
                            data-testid={`tutor-name-${tutor.id}`}
                          >
                            <p className="font-semibold text-black text-lg">
                              {tutor.user?.firstName} {tutor.user?.lastName}
                            </p>
                          </button>
                          <p className="text-sm text-gray-600">{tutor.user?.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tutor.specialization && (
                              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                                {tutor.specialization}
                              </Badge>
                            )}
                            {tutor.qualifications && (
                              <Badge variant="outline" className="border-gray-400">
                                {tutor.qualifications}
                              </Badge>
                            )}
                            <Badge variant={tutor.isVerified ? "default" : "secondary"} className={tutor.isVerified ? "bg-green-100 text-green-800 border-green-500" : "border-orange-400 text-orange-600"}>
                              {tutor.isVerified ? "Verified" : "Pending Verification"}
                            </Badge>
                            {tutor.studentCount !== undefined && tutor.studentCount > 0 && (
                              <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
                                {tutor.studentCount} student{tutor.studentCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          {tutor.schedules && tutor.schedules.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">Class Schedule:</p>
                              <div className="flex flex-wrap gap-2">
                                {tutor.schedules.slice(0, 4).map((schedule, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300">
                                    <span className="font-medium">{schedule.className}</span>
                                    <span className="text-gray-500"> - {schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}</span>
                                  </span>
                                ))}
                                {tutor.schedules.length > 4 && (
                                  <span className="text-xs text-gray-500 px-2 py-1">
                                    +{tutor.schedules.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTutor(tutor)}
                            className="border-black"
                            data-testid={`button-edit-tutor-${tutor.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTutor(tutor)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            data-testid={`button-delete-tutor-${tutor.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {tutorSearchTerm || tutorFilterStatus !== 'all' || tutorFilterSpecialization !== 'all'
                      ? "No tutors match your filters"
                      : "No tutors added yet"}
                  </p>
                  {!tutorSearchTerm && tutorFilterStatus === 'all' && tutorFilterSpecialization === 'all' && (
                    <Button onClick={() => setIsCreateTutorOpen(true)} className="bg-black text-white hover:bg-gray-800">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Tutor
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {mainTab === 'students' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Manage Students</h2>
              <p className="text-gray-600">Add, edit, or remove students from your organization</p>
            </div>
            <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white border-2 border-black hover:bg-gray-800" data-testid="button-add-student">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentFirstName">First Name</Label>
                      <Input id="studentFirstName" value={studentFormData.firstName} onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="studentLastName">Last Name</Label>
                      <Input id="studentLastName" value={studentFormData.lastName} onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="studentEmail">Email</Label>
                    <Input id="studentEmail" type="email" value={studentFormData.email} onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gradeLevel">Year / Grade Level</Label>
                      <Input id="gradeLevel" value={studentFormData.gradeLevel} onChange={(e) => setStudentFormData({ ...studentFormData, gradeLevel: e.target.value })} placeholder="e.g., Year 10" />
                    </div>
                    <div>
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input id="schoolName" value={studentFormData.schoolName} onChange={(e) => setStudentFormData({ ...studentFormData, schoolName: e.target.value })} placeholder="e.g., St. Mary's" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="studentClass">Assign to Class</Label>
                    <Select value={studentFormData.classId} onValueChange={(value) => setStudentFormData({ ...studentFormData, classId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No class</SelectItem>
                        {Array.isArray(classes) && classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studentTutor">Assign Tutor</Label>
                    <Select value={studentFormData.tutorId} onValueChange={(value) => setStudentFormData({ ...studentFormData, tutorId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tutor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No tutor</SelectItem>
                        {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                          <SelectItem key={tutor.id} value={tutor.id}>
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={createStudentMutation.isPending}>
                    {createStudentMutation.isPending ? "Creating..." : "Create Student"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Sorting */}
          <Card className="border-2 border-black mb-6">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="studentSearch" className="text-xs text-gray-600">Search</Label>
                  <Input
                    id="studentSearch"
                    placeholder="Search by name or email..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Class</Label>
                  <Select value={studentFilterClass} onValueChange={setStudentFilterClass}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {Array.isArray(classes) && classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Filter by Tutor</Label>
                  <Select value={studentFilterTutor} onValueChange={setStudentFilterTutor}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="All Tutors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tutors</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Sort By</Label>
                  <div className="flex gap-1">
                    <Select value={studentSortBy} onValueChange={(v: any) => setStudentSortBy(v)}>
                      <SelectTrigger className="border-black flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStudentSortOrder(studentSortOrder === 'asc' ? 'desc' : 'asc')}
                      className="border-black px-2"
                    >
                      {studentSortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                All Students ({getFilteredAndSortedStudents().length} of {Array.isArray(students) ? students.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedStudents().length > 0 ? (
                <div className="space-y-3">
                  {getFilteredAndSortedStudents().map((student: CompanyStudent) => (
                    <div key={student.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-black transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-left hover:underline"
                            data-testid={`student-name-${student.id}`}
                          >
                            <p className="font-semibold text-black text-lg">
                              {student.user?.firstName} {student.user?.lastName}
                            </p>
                          </button>
                          <p className="text-sm text-gray-600">{student.user?.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {student.gradeLevel && (
                              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                                {student.gradeLevel}
                              </Badge>
                            )}
                            {student.schoolName && (
                              <Badge variant="outline" className="border-gray-400">
                                {student.schoolName}
                              </Badge>
                            )}
                            {student.class?.name ? (
                              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                                {student.class.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-400 text-orange-600">
                                No class
                              </Badge>
                            )}
                            {student.tutor?.user ? (
                              <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
                                Tutor: {student.tutor.user.firstName} {student.tutor.user.lastName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-400 text-red-600">
                                No tutor
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="border-black"
                            data-testid={`button-edit-student-${student.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            data-testid={`button-delete-student-${student.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {studentSearchTerm || studentFilterClass !== 'all' || studentFilterTutor !== 'all' 
                      ? "No students match your filters" 
                      : "No students added yet"}
                  </p>
                  {!studentSearchTerm && studentFilterClass === 'all' && studentFilterTutor === 'all' && (
                    <Button onClick={() => setIsCreateStudentOpen(true)} className="bg-black text-white hover:bg-gray-800">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Student
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStudentFirstName">First Name</Label>
                <Input id="editStudentFirstName" value={editStudentFormData.firstName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="editStudentLastName">Last Name</Label>
                <Input id="editStudentLastName" value={editStudentFormData.lastName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="editStudentEmail">Email</Label>
              <Input id="editStudentEmail" type="email" value={editStudentFormData.email} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGradeLevel">Year / Grade Level</Label>
                <Input id="editGradeLevel" value={editStudentFormData.gradeLevel} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, gradeLevel: e.target.value })} placeholder="e.g., Year 10" />
              </div>
              <div>
                <Label htmlFor="editSchoolName">School Name</Label>
                <Input id="editSchoolName" value={editStudentFormData.schoolName} onChange={(e) => setEditStudentFormData({ ...editStudentFormData, schoolName: e.target.value })} placeholder="e.g., St. Mary's" />
              </div>
            </div>
            <div>
              <Label htmlFor="editStudentClass">Assign to Class</Label>
              <Select value={editStudentFormData.classId} onValueChange={(value) => setEditStudentFormData({ ...editStudentFormData, classId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No class</SelectItem>
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editStudentTutor">Assign Tutor</Label>
              <Select value={editStudentFormData.tutorId} onValueChange={(value) => setEditStudentFormData({ ...editStudentFormData, tutorId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tutor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No tutor</SelectItem>
                  {Array.isArray(tutors) && tutors.map((tutor: CompanyTutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 border-black" onClick={() => setIsEditStudentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={updateStudentMutation.isPending}>
                {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tutor Dialog */}
      <Dialog open={isEditTutorOpen} onOpenChange={setIsEditTutorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tutor Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTutor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input id="editFirstName" value={editTutorFormData.firstName} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input id="editLastName" value={editTutorFormData.lastName} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input id="editEmail" type="email" value={editTutorFormData.email} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="editSpecialization">Specialization</Label>
              <Input id="editSpecialization" value={editTutorFormData.specialization} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, specialization: e.target.value })} placeholder="e.g., Mathematics" />
            </div>
            <div>
              <Label htmlFor="editQualifications">Qualifications</Label>
              <Input id="editQualifications" value={editTutorFormData.qualifications} onChange={(e) => setEditTutorFormData({ ...editTutorFormData, qualifications: e.target.value })} placeholder="e.g., B.Sc. Mathematics" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 border-black" onClick={() => setIsEditTutorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={updateTutorMutation.isPending}>
                {updateTutorMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {mainTab === 'academic' && companyAdmin?.companyId && company && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AcademicManagement 
            companyId={companyAdmin.companyId} 
            companyName={company.name}
          />
        </div>
      )}

      {mainTab === 'worksheets' && companyAdmin?.companyId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorksheetManagement companyId={companyAdmin.companyId} />
        </div>
      )}

      {mainTab === 'assignments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AssignmentManagement />
        </div>
      )}

      {mainTab === 'calendar' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CompanyCalendarDashboard />
        </div>
      )}

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
