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
  });

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch company tutors
  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery<CompanyTutor[]>({
    queryKey: [`/api/companies/${companyId}/tutors`],
    enabled: !!companyId,
  });

  // Fetch all users within company
  const { data: companyUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/companies", companyId, "users"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId] });
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
      setNewUserData({ email: "", firstName: "", lastName: "", role: "" });
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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
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
              <p className="text-gray-600">Company Management Dashboard</p>
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
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutor">Tutor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="company_admin">Company Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
              <p>Loading tutors...</p>
            ) : tutorsError ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading tutors: {(tutorsError as Error).message}</p>
                <p className="text-sm mt-2">Check console for details</p>
              </div>
            ) : tutors && tutors.length > 0 ? (
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No tutors assigned to this company yet.</p>
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