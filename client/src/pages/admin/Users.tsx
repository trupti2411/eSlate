import { useState } from "react";
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
import { Users, UserPlus, Power, PowerOff, Trash2, Filter } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
}

export default function UsersManagement() {
  const { toast } = useToast();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [newUserData, setNewUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
  });

  // Get current user to check if master admin
  const { data: currentUser } = useQuery<{ id: string; role: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch deleted users
  const { data: deletedUsers = [], isLoading: deletedUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/deleted-users"],
  });

  // Filter users by role
  const filteredUsers = users.filter(user => 
    selectedRole === "all" || user.role === selectedRole
  );

  // Group users by role
  const usersByRole = users.reduce((acc: Record<string, User[]>, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      return await apiRequest("/api/admin/users", "POST", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

  // Toggle user status mutation
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/status`, "PATCH", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and will delete all related data.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <span>User Management</span>
            </h1>
            <p className="text-gray-600">Manage all system users and permissions</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
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

                  <div className="space-y-3">
                    <Label>User Roles</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'student', label: 'Student' },
                        { value: 'parent', label: 'Parent' },
                        { value: 'tutor', label: 'Tutor' },
                        { value: 'company_admin', label: 'Business Admin' },
                        { value: 'admin', label: 'System Admin' }
                      ].map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`users-role-${role.value}`}
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
                            htmlFor={`users-role-${role.value}`}
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
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles ({users.length})</SelectItem>
              <SelectItem value="admin">System Admins ({usersByRole.admin?.length || 0})</SelectItem>
              <SelectItem value="company_admin">Company Admins ({usersByRole.company_admin?.length || 0})</SelectItem>
              <SelectItem value="tutor">Tutors ({usersByRole.tutor?.length || 0})</SelectItem>
              <SelectItem value="student">Students ({usersByRole.student?.length || 0})</SelectItem>
              <SelectItem value="parent">Parents ({usersByRole.parent?.length || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          <Card className="eink-card">
            <CardHeader>
              <CardTitle>
                {selectedRole === "all" ? "All Users" : `${selectedRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}s`} 
                ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
            {usersLoading ? (
              <p>Loading users...</p>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user.role.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-end items-center pt-2 border-t space-x-2">
                          {/* Only show activate/deactivate for non-master admins */}
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus.mutate({ userId: user.id, isActive: !user.isActive })}
                              disabled={toggleUserStatus.isPending}
                            >
                              {user.isActive ? (
                                <>
                                  <PowerOff className="w-3 h-3 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-3 h-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          )}
                          
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
            ) : (
              <p className="text-center text-gray-500 py-8">
                {selectedRole === "all" ? "No users found." : `No ${selectedRole.replace('_', ' ')}s found.`}
              </p>
            )}
          </CardContent>
          </Card>

          {/* Recently Deleted Users Section */}
          <Card className="eink-card border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Recently Deleted Users ({deletedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Users deleted by master admins. All their associated data has been permanently removed.
              </p>
              
              {deletedUsersLoading ? (
                <p className="text-sm text-gray-500">Loading deleted users...</p>
              ) : deletedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deletedUsers.map((user) => (
                    <Card key={user.id} className="border border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-800">
                                {user.firstName} {user.lastName}
                              </h4>
                              <p className="text-xs text-red-600 capitalize">
                                {user.role.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge variant="destructive">Deleted</Badge>
                          </div>
                          
                          <div className="pt-2 border-t border-red-200">
                            <p className="text-xs text-red-600">
                              Deleted: {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      No users have been deleted recently.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}