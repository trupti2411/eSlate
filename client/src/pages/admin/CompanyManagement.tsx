import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Building2, Users, UserPlus, Power, PowerOff, ArrowLeft, Plus, Mail, Phone, MapPin, Trash2, Pencil, GraduationCap, BookOpen, Settings, CheckCircle, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

interface TutoringCompany {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

interface CompanyTutor {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string;
  isVerified: boolean;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  roles?: string[];
}

export default function CompanyManagement() {
  const { toast } = useToast();
  const params = useParams();
  const companyId = params.id;
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    roles: [] as string[],
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  // Fetch company tutors
  const { data: tutors, isLoading: tutorsLoading } = useQuery<CompanyTutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });

  // Fetch all users within company
  const { data: companyUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [`/api/companies/${companyId}/users`],
    enabled: !!companyId,
  });

  // Fetch students for the company (dedicated endpoint)
  const { data: companyStudents = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,
  });

  // Fetch unassigned tutors
  const { data: unassignedTutors } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/admin/unassigned-tutors"],
    enabled: !!companyId,
  });

  // Get current user to check if master admin
  const { data: currentUser } = useQuery<{ id: string; role: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Transform students data to User format
  const students: User[] = companyStudents.map((s: any) => ({
    id: s.user?.id || s.userId,
    email: s.user?.email || '',
    firstName: s.user?.firstName || '',
    lastName: s.user?.lastName || '',
    role: 'student',
    isActive: s.user?.isActive ?? true,
  }));
  
  // Derived data from companyUsers
  const tutorUsers = companyUsers?.filter(u => u.role === 'tutor') || [];
  const admins = companyUsers?.filter(u => u.role === 'company_admin') || [];
  const parents = companyUsers?.filter(u => u.role === 'parent') || [];

  // Filter users by search
  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Toggle company status
  const toggleCompanyStatus = useMutation({
    mutationFn: async (isActive: boolean) => {
      return await apiRequest(`/api/companies/${companyId}/status`, "PATCH", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    },
  });

  // Assign tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return await apiRequest(`/api/companies/${companyId}/assign-tutor/${tutorId}`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unassigned-tutors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      return await apiRequest("/api/admin/create-user", "POST", {
        ...userData,
        companyId: userData.role === 'tutor' || userData.role === 'company_admin' || userData.role === 'student' ? companyId : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
      setIsCreateUserDialogOpen(false);
      setNewUserData({ email: "", firstName: "", lastName: "", role: "", roles: [] });
    },
    onError: (error: Error) => {
      let errorMessage = "Failed to create user";
      if (error.message.includes("email already exists")) {
        errorMessage = "A user with this email address already exists. Please use a different email.";
      } else if (error.message.includes("duplicate key")) {
        errorMessage = "This email address is already registered. Please use a different email.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      return await apiRequest(`/api/admin/users/${userId}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: typeof editCompanyData) => {
      return await apiRequest(`/api/companies/${companyId}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      setIsEditCompanyDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUserData);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const selectedRole = formData.get('editRole') as string;
    
    updateUserMutation.mutate({
      userId: editingUser.id,
      data: {
        firstName: formData.get('editFirstName') as string,
        lastName: formData.get('editLastName') as string,
        email: formData.get('editEmail') as string,
        role: selectedRole || editingUser.role,
        isActive: (form.elements.namedItem('editIsActive') as HTMLInputElement)?.checked,
      },
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditCompany = () => {
    if (company) {
      setEditCompanyData({
        name: company.name || "",
        description: company.description || "",
        contactEmail: company.contactEmail || "",
        contactPhone: company.contactPhone || "",
        address: company.address || "",
      });
      setIsEditCompanyDialogOpen(true);
    }
  };

  const handleEditCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(editCompanyData);
  };

  if (companyLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading company details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="border border-gray-200">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold mb-4 text-gray-900">Company Not Found</h1>
              <p className="text-gray-600 mb-4">The company you're looking for doesn't exist.</p>
              <Link href="/admin/companies">
                <Button variant="outline">Back to Companies</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // User card component for reuse
  const UserCard = ({ user, showDelete = false }: { user: User; showDelete?: boolean }) => (
    <Card className="border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={user.isActive ? "bg-green-50 text-green-700 border-green-200 text-[10px]" : "bg-gray-100 text-gray-500 border-gray-200 text-[10px]"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => handleEditUser(user)} className="flex-1 text-xs border-gray-200">
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {showDelete && currentUser?.role === 'admin' && user.role !== 'admin' && user.id !== currentUser?.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
              disabled={deleteUserMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/companies">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                      <Badge className={company.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}>
                        {company.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">Company Management</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditCompany}
                  className="border-gray-200"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCompanyStatus.mutate(!company.isActive)}
                  disabled={toggleCompanyStatus.isPending}
                  className="border-gray-200"
                >
                  {company.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2 text-red-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2 text-green-500" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="h-12 bg-transparent border-0 p-0 w-full justify-start gap-1">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="tutors" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Tutors ({tutors?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="students" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Students ({students.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="all-users" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  All Users ({companyUsers?.length || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Tutors</p>
                        <div className="text-2xl font-bold text-gray-900">{tutors?.length || 0}</div>
                      </div>
                      <div className="p-2.5 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Students</p>
                        <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                      </div>
                      <div className="p-2.5 bg-green-50 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Parents</p>
                        <div className="text-2xl font-bold text-gray-900">{parents.length}</div>
                      </div>
                      <div className="p-2.5 bg-purple-50 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Admins</p>
                        <div className="text-2xl font-bold text-gray-900">{admins.length}</div>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-lg">
                        <Settings className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Company Info */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg text-gray-900">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Description</h3>
                      <p className="text-gray-900">{company.description || "No description provided"}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{company.contactEmail || <span className="text-red-500 text-sm">Not set</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{company.contactPhone || <span className="text-red-500 text-sm">Not set</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{company.address || <span className="text-red-500 text-sm">Not set</span>}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="flex flex-wrap gap-3">
                    <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" onClick={() => setActiveTab('tutors')} className="border-gray-200">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Tutors
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('students')} className="border-gray-200">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Manage Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tutors Tab */}
          {activeTab === 'tutors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tutors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800 hover:bg-gray-900 text-white" onClick={() => setNewUserData(prev => ({ ...prev, role: 'tutor' }))}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tutor
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {tutorsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading tutors...</p>
                </div>
              ) : tutors && tutors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutors.filter(t => 
                    !searchQuery || 
                    t.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((tutor) => (
                    <Card key={tutor.id} className="border border-gray-200 bg-white hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                            </h4>
                            {tutor.user?.email && (
                              <p className="text-sm text-gray-500 truncate">{tutor.user.email}</p>
                            )}
                          </div>
                          <Badge className={tutor.isVerified ? "bg-green-50 text-green-700 border-green-200 text-[10px]" : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"}>
                            {tutor.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                        
                        {(tutor.specialization || tutor.qualifications) && (
                          <div className="space-y-1 text-sm mb-3">
                            {tutor.specialization && (
                              <p className="text-gray-600">
                                <span className="font-medium">Subject:</span> {tutor.specialization}
                              </p>
                            )}
                            {tutor.qualifications && (
                              <p className="text-gray-600 line-clamp-2">
                                <span className="font-medium">Qualifications:</span> {tutor.qualifications}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tutors Yet</h3>
                    <p className="text-gray-500 mb-4">Add tutors to this company to get started.</p>
                    <Button onClick={() => { setNewUserData(prev => ({ ...prev, role: 'tutor' })); setIsCreateUserDialogOpen(true); }} className="bg-gray-800 hover:bg-gray-900 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Tutor
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Unassigned Tutors */}
              {unassignedTutors && unassignedTutors.length > 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg text-gray-900">Unassigned Tutors ({unassignedTutors.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unassignedTutors.map((tutor) => (
                        <Card key={tutor.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                                </h4>
                                {tutor.user?.email && (
                                  <p className="text-sm text-gray-500">{tutor.user.email}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => assignTutorMutation.mutate(tutor.id)}
                              disabled={assignTutorMutation.isPending}
                              className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Assign to Company
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800 hover:bg-gray-900 text-white" onClick={() => setNewUserData(prev => ({ ...prev, role: 'student' }))}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {studentsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading students...</p>
                </div>
              ) : filterUsers(students).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterUsers(students).map((student) => (
                    <UserCard key={student.id} user={student} showDelete={true} />
                  ))}
                </div>
              ) : (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {searchQuery ? 'No Students Found' : 'No Students Yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'Add students to this company to get started.'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => { setNewUserData(prev => ({ ...prev, role: 'student' })); setIsCreateUserDialogOpen(true); }} className="bg-gray-800 hover:bg-gray-900 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Student
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'all-users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {usersLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : companyUsers && companyUsers.length > 0 ? (
                <div className="space-y-6">
                  {/* Group by role */}
                  {[
                    { role: 'company_admin', label: 'Business Admins', users: admins },
                    { role: 'tutor', label: 'Tutors', users: tutorUsers },
                    { role: 'student', label: 'Students', users: students },
                    { role: 'parent', label: 'Parents', users: parents },
                  ].filter(g => filterUsers(g.users).length > 0).map(group => (
                    <Card key={group.role} className="bg-white border border-gray-200">
                      <CardHeader className="border-b border-gray-100 pb-3">
                        <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {group.label} ({filterUsers(group.users).length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filterUsers(group.users).map((user) => (
                            <UserCard key={user.id} user={user} showDelete={true} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Yet</h3>
                    <p className="text-gray-500 mb-4">Add users to this company to get started.</p>
                    <Button onClick={() => setIsCreateUserDialogOpen(true)} className="bg-gray-800 hover:bg-gray-900 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First User
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to {company.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="company_admin">Business Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending} className="bg-gray-800 text-white hover:bg-gray-900">
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleEditUserSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      name="editFirstName"
                      defaultValue={editingUser.firstName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      name="editLastName"
                      defaultValue={editingUser.lastName}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    name="editEmail"
                    type="email"
                    defaultValue={editingUser.email}
                    required
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Select name="editRole" defaultValue={editingUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="company_admin">Business Admin</SelectItem>
                      {currentUser?.role === 'admin' && (
                        <SelectItem value="admin">System Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    name="editIsActive"
                    defaultChecked={editingUser.isActive}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="editIsActive">Active User</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending} className="bg-gray-800 text-white hover:bg-gray-900">
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Company Dialog */}
        <Dialog open={isEditCompanyDialogOpen} onOpenChange={setIsEditCompanyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Company Details</DialogTitle>
              <DialogDescription>Update company information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCompanySubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  value={editCompanyData.name}
                  onChange={(e) => setEditCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyDescription">Description</Label>
                <Textarea
                  id="companyDescription"
                  value={editCompanyData.description}
                  onChange={(e) => setEditCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyEmail">Contact Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={editCompanyData.contactEmail}
                    onChange={(e) => setEditCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Contact Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="companyPhone"
                    value={editCompanyData.contactPhone}
                    onChange={(e) => setEditCompanyData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">Address <span className="text-red-500">*</span></Label>
                <Textarea
                  id="companyAddress"
                  value={editCompanyData.address}
                  onChange={(e) => setEditCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditCompanyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCompanyMutation.isPending} className="bg-gray-800 text-white hover:bg-gray-900">
                  {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
