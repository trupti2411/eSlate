import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Building2, Users, UserPlus, Power, PowerOff, ArrowLeft, Plus, Mail, Phone, MapPin, Trash2 } from "lucide-react";
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

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  // Fetch company tutors
  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery<CompanyTutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });

  // Fetch all users within company
  const { data: companyUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [`/api/companies/${companyId}/users`],
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
        companyId: userData.role === 'tutor' || userData.role === 'company_admin' ? companyId : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
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

  // Delete user mutation (Master Admin only)
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Verify tutor mutation
  const verifyTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return await apiRequest(`/api/tutors/${tutorId}/verify`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor verified successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify tutor",
        variant: "destructive",
      });
    },
  });

  // Update user mutation  
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; firstName: string; lastName: string; email: string; role: string; roles?: string[]; isActive: boolean }) => {
      return await apiRequest(`/api/admin/users/${userData.id}`, "PATCH", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updatedUser = {
      id: editingUser.id,
      firstName: formData.get('editFirstName') as string,
      lastName: formData.get('editLastName') as string,
      email: formData.get('editEmail') as string,
      role: formData.get('editRole') as string,
      isActive: formData.get('editIsActive') === 'on',
    };

    updateUserMutation.mutate(updatedUser);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.firstName || !newUserData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Email, First Name, and Role are required)",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUserData);
  };

  if (companyLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Loading company details...</div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Company not found</div>
        </div>
      </Layout>
    );
  }

  const usersByRole = companyUsers?.reduce((acc: Record<string, User[]>, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {}) || {};

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
            <div>
              <h1 className="page-title flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <span>{company.name}</span>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Active" : "Inactive"}
                </Badge>
              </h1>
              <p className="text-gray-600">Business Management Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User for {company.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>User Roles</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'student', label: 'Student' },
                        { value: 'parent', label: 'Parent' },
                        { value: 'tutor', label: 'Tutor' },
                        { value: 'company_admin', label: 'Business Admin' }
                      ].map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`create-role-${role.value}`}
                            checked={newUserData.role === role.value}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUserData(prev => ({ ...prev, role: role.value }));
                              } else {
                                setNewUserData(prev => ({ ...prev, role: '' }));
                              }
                            }}
                            className="rounded border-gray-300 h-4 w-4"
                          />
                          <label
                            htmlFor={`create-role-${role.value}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Select the primary role for this user. Only one role can be selected at a time.
                    </p>
                  </div>



                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
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
                  <DialogTitle>Edit User: {editingUser?.firstName} {editingUser?.lastName}</DialogTitle>
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

                    <div className="space-y-3">
                      <Label>User Roles</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'student', label: 'Student' },
                          { value: 'parent', label: 'Parent' },
                          { value: 'tutor', label: 'Tutor' },
                          { value: 'company_admin', label: 'Business Admin' },
                          ...(currentUser?.role === 'admin' ? [{ value: 'admin', label: 'System Admin' }] : [])
                        ].map((roleOption) => (
                          <div key={roleOption.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-role-${roleOption.value}`}
                              name="editRole"
                              value={roleOption.value}
                              defaultChecked={editingUser.role === roleOption.value}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Uncheck other role checkboxes
                                  const roleCheckboxes = document.querySelectorAll('input[name="editRole"]') as NodeListOf<HTMLInputElement>;
                                  roleCheckboxes.forEach(checkbox => {
                                    if (checkbox !== e.target) checkbox.checked = false;
                                  });
                                }
                              }}
                              className="rounded border-gray-300 h-4 w-4"
                            />
                            <label
                              htmlFor={`edit-role-${roleOption.value}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {roleOption.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Select the primary role for this user. Only one role can be selected at a time.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="editIsActive"
                        name="editIsActive"
                        defaultChecked={editingUser.isActive}
                      />
                      <Label htmlFor="editIsActive">Active User</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => toggleCompanyStatus.mutate(!company.isActive)}
              disabled={toggleCompanyStatus.isPending}
            >
              {company.isActive ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2 text-red-600" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2 text-green-600" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Company Details */}
        <Card className="eink-card">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Description</h3>
                <p>{company.description || "No description provided"}</p>
              </div>
              <div className="space-y-2">
                {company.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{company.contactEmail}</span>
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{company.contactPhone}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">All Users ({companyUsers?.length || 0})</TabsTrigger>
            <TabsTrigger value="tutors">Current Tutors ({tutors?.length || 0})</TabsTrigger>
            <TabsTrigger value="assign">Assign Tutors ({unassignedTutors?.length || 0})</TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {usersLoading ? (
              <p>Loading users...</p>
            ) : companyUsers && companyUsers.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(usersByRole).map(([role, users]) => (
                  <Card key={role} className="eink-card">
                    <CardHeader>
                      <CardTitle className="capitalize flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>{role.replace('_', ' ')}s ({users.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((user) => (
                          <Card key={user.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold">
                                    {user.firstName} {user.lastName}
                                  </h4>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditUser(user)}
                                      title="Edit User"
                                    >
                                      <span className="text-xs">Edit</span>
                                    </Button>
                                    {/* Only show delete for non-master admins and non-self */}
                                    {currentUser?.role === 'admin' && user.role !== 'admin' && user.id !== currentUser?.id && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                        disabled={deleteUserMutation.isPending}
                                        title="Delete User (Master Admin Only)"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No users found in this company.</p>
            )}
          </TabsContent>

          {/* Current Tutors Tab */}
          <TabsContent value="tutors" className="space-y-6">
            {tutorsLoading ? (
              <div className="text-center py-8">
                <p>Loading tutors...</p>
              </div>
            ) : tutorsError ? (
              <div className="text-center text-red-500 py-8">
                <h3 className="text-lg font-semibold mb-2">Error Loading Tutors</h3>
                <p>Error: {(tutorsError as Error).message}</p>
              </div>
            ) : tutors && tutors.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600">Debug: Found {tutors.length} tutors</p>
                  <p className="text-xs text-gray-500">Tutors data: {JSON.stringify(tutors, null, 2)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutors.map((tutor) => (
                  <Card key={tutor.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                          </h4>
                          {tutor.user?.email && (
                            <p className="text-sm text-gray-600">{tutor.user.email}</p>
                          )}
                        </div>
                        <Badge variant={tutor.isVerified ? "default" : "secondary"}>
                          {tutor.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      
                      {tutor.specialization && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Specialization:</strong> {tutor.specialization}
                        </p>
                      )}
                      
                      {tutor.qualifications && (
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Qualifications:</strong> {tutor.qualifications}
                        </p>
                      )}
                      
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">
                          Debug: isVerified = {String(tutor.isVerified)}
                        </p>
                        {!tutor.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => verifyTutorMutation.mutate(tutor.id)}
                            disabled={verifyTutorMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {verifyTutorMutation.isPending ? 'Verifying...' : 'Verify Tutor'}
                          </Button>
                        )}
                        {tutor.isVerified && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">✓ Tutors Section Working</h3>
                  <p className="text-gray-600 mb-4">This business currently has no tutors assigned.</p>
                  <p className="text-sm text-blue-600 mb-2">API Status: Successfully loaded (200) - {Array.isArray(tutors) ? tutors.length : 0} tutors found</p>
                  <div className="text-xs text-gray-500">
                    <p>• API endpoint: /api/companies/{companyId}/tutors</p>
                    <p>• Response: {JSON.stringify(tutors)}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">To add tutors:</p>
                    <ul className="text-xs text-gray-500 mt-2">
                      <li>1. Create users with "Tutor" role in the "All Users" tab</li>
                      <li>2. Or assign existing tutors from the "Assign Tutors" tab</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Assign Tutors Tab */}
          <TabsContent value="assign" className="space-y-6">
            {unassignedTutors && unassignedTutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedTutors.map((tutor) => (
                  <Card key={tutor.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                          </h4>
                          {tutor.user?.email && (
                            <p className="text-sm text-gray-600">{tutor.user.email}</p>
                          )}
                        </div>
                        <Badge variant={tutor.isVerified ? "default" : "secondary"}>
                          {tutor.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      
                      {tutor.specialization && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Specialization:</strong> {tutor.specialization}
                        </p>
                      )}
                      
                      {tutor.qualifications && (
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Qualifications:</strong> {tutor.qualifications}
                        </p>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => assignTutorMutation.mutate(tutor.id)}
                        disabled={assignTutorMutation.isPending}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign to Company
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No unassigned tutors available.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}