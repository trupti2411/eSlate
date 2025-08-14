import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/useAuth.tsx";
import AuthPage from "@/pages/auth-page";
import SimpleRegistration from "@/pages/simple-registration";
import StudentDashboard from "@/pages/student/Dashboard";
import ParentDashboard from "@/pages/parent/Dashboard";
import TutorDashboard from "@/pages/tutor/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import Users from "@/pages/admin/Users";
import TestUserCreation from "@/pages/admin/TestUserCreation";
import Companies from "@/pages/admin/Companies";
import CompanyManagement from "@/pages/admin/CompanyManagement";
import CompanyDashboard from "@/pages/admin/CompanyDashboard";
import CompanyStudents from "@/pages/admin/CompanyStudents";
import CompanyAcademicManagement from "@/pages/admin/CompanyAcademicManagement";
import HomeworkManagement from "@/pages/company/HomeworkManagement";
import HomeworkSubmissions from "@/pages/student/HomeworkSubmissions";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading eSlate...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Always available auth route for registration */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/register" component={SimpleRegistration} />
      
      {!isAuthenticated ? (
        <Route path="/" component={AuthPage} />
      ) : (
        <>
          <Route path="/">
            {user?.role === 'student' && <StudentDashboard />}
            {user?.role === 'parent' && <ParentDashboard />}
            {user?.role === 'tutor' && <TutorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'company_admin' && <CompanyDashboard />}
          </Route>
          <Route path="/student" component={StudentDashboard} />
          <Route path="/parent" component={ParentDashboard} />
          <Route path="/tutor" component={TutorDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={Users} />
          <Route path="/admin/companies" component={Companies} />
          <Route path="/admin/companies/:id" component={CompanyManagement} />
          <Route path="/admin/test" component={TestUserCreation} />
          <Route path="/company" component={CompanyDashboard} />
          <Route path="/company/tutors" component={CompanyDashboard} />
          <Route path="/company/students" component={CompanyStudents} />
          <Route path="/company/homework" component={HomeworkManagement} />
          <Route path="/company/academic" component={CompanyAcademicManagement} />
          <Route path="/student/homework" component={HomeworkSubmissions} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
