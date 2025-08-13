import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TestUserCreation() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "student",
    gradeLevel: "",
    phoneNumber: "",
    specialization: "",
    qualifications: "",
  });

  // Test user creation mutation
  const testCreateUser = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/dev/test-create-user", "POST", {});
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Test user created successfully",
      });
      console.log("Test user created:", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create test user",
        variant: "destructive",
      });
      console.error("Test user creation failed:", error);
    },
  });

  // Manual user creation mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      return await apiRequest("/api/admin/users", "POST", userData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      console.log("User created:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      // Reset form
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "student",
        gradeLevel: "",
        phoneNumber: "",
        specialization: "",
        qualifications: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
      console.error("User creation failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test User Creation</h1>
      
      {/* Quick Test Button */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => testCreateUser.mutate()}
            disabled={testCreateUser.isPending}
          >
            {testCreateUser.isPending ? "Creating..." : "Create Test Student User"}
          </Button>
        </CardContent>
      </Card>

      {/* Manual User Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Manual User Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "student" && (
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level</label>
                <Input
                  value={formData.gradeLevel}
                  onChange={(e) => handleInputChange("gradeLevel", e.target.value)}
                  placeholder="e.g., 5th Grade"
                />
              </div>
            )}

            {formData.role === "parent" && (
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>
            )}

            {formData.role === "tutor" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Qualifications</label>
                  <Input
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    placeholder="e.g., B.S. Mathematics, Teaching Certificate"
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}