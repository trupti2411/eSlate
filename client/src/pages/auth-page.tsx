import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, UserPlus, LogIn, AlertCircle, CheckCircle, GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { registerSchema, loginSchema, waitlistSchema, AU_STATES, type RegisterData, type LoginData, type WaitlistData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Selected state drives whether we show the NSW register form or the waitlist form.
  // Default to NSW so the standard flow renders by default.
  const [selectedState, setSelectedState] = useState<typeof AU_STATES[number]>("NSW");

  // Registration form (NSW only — non-NSW AU users go through the waitlist form below)
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: "AU",
      state: "NSW",
      suburb: "",
      postcode: "",
      accountType: "individual",
      businessName: "",
    },
    mode: "onChange",
  });

  const watchedAccountType = registerForm.watch("accountType");

  // Waitlist form (non-NSW Australian states)
  const waitlistForm = useForm<WaitlistData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      state: "VIC",
      intendedRole: "individual_tutor",
    },
    mode: "onChange",
  });



  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest('/api/login', 'POST', data);
    },
    onSuccess: (data) => {
      // Store the JWT token if needed
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      // Update user data in cache
      queryClient.setQueryData(['/api/me'], data.user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Redirect to dashboard
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Registration mutation — converts camelCase to the snake_case the Laravel API expects
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const payload: Record<string, unknown> = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        country: data.country,
        state: data.state,
        suburb: data.suburb,
        postcode: data.postcode,
        account_type: data.accountType,
      };
      if (data.accountType === "multi_tutor" && data.businessName) {
        payload.business_name = data.businessName;
      }
      return await apiRequest('/api/register', 'POST', payload);
    },
    onSuccess: (data) => {
      if (data?.token) localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['/api/me'], data?.user);
      toast({
        title: "Welcome to eSlate!",
        description: "Account created. Next: capture your WWCC and apply your state's academic calendar.",
      });
      window.location.href = '/onboarding';
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Waitlist mutation — non-NSW Australian users
  const waitlistMutation = useMutation({
    mutationFn: async (data: WaitlistData) => {
      const payload = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        state: data.state,
        intended_role: data.intendedRole,
      };
      return await apiRequest('/api/waitlist', 'POST', payload);
    },
    onSuccess: (data) => {
      setSuccessMessage(data?.message ?? "You're on the waitlist — we'll be in touch.");
      waitlistForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Could not join waitlist",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('/api/auth/forgot-password', 'POST', { email });
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const handleWaitlist = (data: WaitlistData) => {
    waitlistMutation.mutate(data);
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(forgotPasswordEmail);
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

          {/* Authentication Form */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {showForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center">
                {showForgotPassword 
                  ? "Enter your email to receive reset instructions"
                  : isLogin 
                    ? "Welcome back to eSlate" 
                    : "Join the eSlate educational platform"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="forgot-password-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="relative mt-1">
                      <Input
                        id="forgot-password-email"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                {...field}
                              />
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10"
                                {...field}
                              />
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword((s) => !s)}
                                aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  {/* Country is locked to AU in v1 — international signups are blocked. */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mb-2">
                    Currently available in Australia only.
                  </div>

                  {/* State selector — gates between NSW register form and waitlist form */}
                  <div>
                    <label className="text-sm font-medium leading-none">State</label>
                    <Select
                      value={selectedState}
                      onValueChange={(v) => {
                        const s = v as typeof AU_STATES[number];
                        setSelectedState(s);
                        if (s === "NSW") {
                          registerForm.setValue("state", "NSW");
                        } else {
                          waitlistForm.setValue("state", s as Exclude<typeof AU_STATES[number], "NSW">);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {AU_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedState === "NSW" ? (
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="accountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I'm signing up as a…</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="individual">Solo tutor (just me)</SelectItem>
                                  <SelectItem value="multi_tutor">Tutoring company (multiple tutors)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchedAccountType === "multi_tutor" && (
                          <FormField
                            control={registerForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Acme Tutoring" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input placeholder="First name" className="pl-10" {...field} />
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type="email" placeholder="Enter your email" className="pl-10" {...field} />
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showRegisterPassword ? "text" : "password"}
                                    placeholder="Create a password (min 8 characters)"
                                    className="pl-10 pr-10"
                                    {...field}
                                  />
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <button
                                    type="button"
                                    onClick={() => setShowRegisterPassword((s) => !s)}
                                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="suburb"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Suburb</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Bondi" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="postcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postcode</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 2026" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {watchedAccountType === "multi_tutor"
                            ? "We'll create your business and seed the NSW academic calendar. Then you can invite tutors and toggle active subjects."
                            : "You'll start as a solo tutor. After signup we'll capture your Working With Children Check and seed your NSW academic calendar (Terms 1–4 + weeks)."}
                        </p>
                        <Button
                          type="submit"
                          disabled={registerMutation.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...waitlistForm}>
                      <form onSubmit={waitlistForm.handleSubmit(handleWaitlist)} className="space-y-4">
                        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800 dark:text-amber-200">
                            We're launching in NSW first — leave your details and we'll let you know when {selectedState} is ready.
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={waitlistForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="First name" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={waitlistForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last name" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={waitlistForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type="email" placeholder="Enter your email" className="pl-10" {...field} />
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={waitlistForm.control}
                          name="intendedRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I'm planning to...</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="individual_tutor">Tutor on my own</SelectItem>
                                  <SelectItem value="multi_tutor_owner">Run a tutoring business</SelectItem>
                                  <SelectItem value="other">Something else</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={waitlistMutation.isPending}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          {waitlistMutation.isPending ? "Joining..." : `Join the ${selectedState} waitlist`}
                        </Button>
                      </form>
                    </Form>
                  )}
                </div>
              )}

              {!showForgotPassword && !isLogin && (
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Already have an account?
                  </p>
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    Sign in instead
                  </button>
                </div>
              )}

              {!showForgotPassword && isLogin && (
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Don't have an account?
                  </p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    Create one
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-blue-50 dark:bg-blue-950 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Learning, Simplified
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            eSlate brings students, parents, and tutors together on one platform — making it easy to manage assignments, track progress, and stay connected.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Homework and assignment management</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Real-time messaging</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Progress tracking</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Calendar scheduling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}