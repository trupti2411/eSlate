import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, UserPlus, CheckCircle, AlertCircle, ArrowLeft, GraduationCap } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface RegistrationFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function SimpleRegistration() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student"
  });
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest('/api/auth/register', 'POST', data);
      return response.json();
    },
    onSuccess: (data) => {
      setSuccessMessage("Account created successfully! You can now log in.");
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "student"
      });
      toast({
        title: "Success!",
        description: "Account created successfully",
      });
      // If user is authenticated admin, refresh the users list
      if (isAuthenticated && (user?.role === 'admin' || user?.role === 'company_admin')) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      registerMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Back button for authenticated users */}
          {isAuthenticated && (
            <Link href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          )}

          {/* Logo/Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">eSlate</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Educational platform optimized for e-ink devices
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join the eSlate educational platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First and Last Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        disabled={registerMutation.isPending}
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        disabled={registerMutation.isPending}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      disabled={registerMutation.isPending}
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      id="password"
                      placeholder="Create a password (min 8 characters)"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      disabled={registerMutation.isPending}
                      autoComplete="new-password"
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    I am a...
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      disabled={registerMutation.isPending}
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="tutor">Tutor</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?
                </p>
                <Link href="/auth">
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                    Sign in instead
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-blue-600 items-center justify-center p-12">
        <div className="text-center text-white space-y-6">
          <h2 className="text-4xl font-bold">Education Optimized</h2>
          <div className="space-y-4 text-left max-w-md">
            <p className="text-lg">
              eSlate provides a comprehensive learning management system designed specifically for e-ink 
              devices, offering an enhanced educational experience with:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Homework management and progress tracking
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Real-time messaging between tutors and students
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Parent verification and monitoring tools
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Calendar scheduling and deadline management
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}