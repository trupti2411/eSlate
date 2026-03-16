import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/useAuth.tsx";
import { useDesignPreference } from "@/hooks/useDesignPreference";
import { DesignSwitchBanner } from "@/components/DesignSwitchBanner";
import AuthPage from "@/pages/auth-page";
import SimpleRegistration from "@/pages/simple-registration";
import StudentDashboard from "@/pages/student/Dashboard";
import StudentHome from "@/pages/student/StudentHome";
import NewStudentDashboard from "@/pages/student/NewStudentDashboard";
import ParentDashboard from "@/pages/parent/Dashboard";
import NewParentDashboard from "@/pages/parent/NewParentDashboard";
import TutorDashboard from "@/pages/tutor/Dashboard";
import CompanyTutorDashboard from "@/pages/company/TutorDashboard";
import NewTutorDashboard from "@/pages/company/NewTutorDashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import Users from "@/pages/admin/Users";
import TestUserCreation from "@/pages/admin/TestUserCreation";
import Companies from "@/pages/admin/Companies";
import CompanyManagement from "@/pages/admin/CompanyManagement";
import CompanyDashboard from "@/pages/admin/CompanyDashboard";
import CompanyStudents from "@/pages/admin/CompanyStudents";
import CompanyAcademicManagement from "@/pages/admin/CompanyAcademicManagement";
import AdminSettings from "@/pages/admin/Settings";
import { AssignmentManagement } from "@/pages/assignments/AssignmentManagement";
import { StudentPortal } from "@/pages/student/StudentPortal";
import { StudentWorksheets } from "@/pages/student/StudentWorksheets";
import { AssignmentWorkPage } from "@/pages/student/AssignmentWorkPage";
import { WorksheetWorkPage } from "@/pages/student/WorksheetWorkPage";
import GoogleDocsViewer from "@/pages/GoogleDocsViewer";
import { PDFAnnotatorPage } from "@/pages/PDFAnnotatorPage";
import SubmittedHomework from "@/pages/company/SubmittedHomework";
import { WorksheetManagementPage } from "@/pages/admin/WorksheetManagementPage";
import { WorksheetEditorPage } from "@/pages/admin/WorksheetEditorPage";
import TestManagement from "@/pages/tests/TestManagement";
import TestGrading from "@/pages/tests/TestGrading";
import Reports from "@/pages/company/Reports";
import { MarkingPage } from "@/pages/company/MarkingPage";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfService from "@/pages/legal/TermsOfService";
import UserAgreement from "@/pages/legal/UserAgreement";
import HomePage from "@/pages/HomePage";
import VideoStoryboard from "@/pages/VideoStoryboard";
import ContactUs from "@/pages/ContactUs";
import DesignPreview from "@/pages/DesignPreview";
import EinkPreview from "@/pages/EinkPreview";
import SwitchPreview from "@/pages/SwitchPreview";
import AssignmentPreview from "@/pages/AssignmentPreview";
import TabletPreview from "@/pages/TabletPreview";
import PitchPage from "@/pages/PitchPage";

import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { design, setDesign, bannerSeen, dismissBanner } = useDesignPreference();

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
      
      {/* Legal pages - always accessible */}
      <Route path="/legal/privacy" component={PrivacyPolicy} />
      <Route path="/legal/terms" component={TermsOfService} />
      <Route path="/legal/agreement" component={UserAgreement} />
      
      {/* Video storyboard - always accessible */}
      <Route path="/storyboard" component={VideoStoryboard} />
      
      {/* Contact page - always accessible */}
      <Route path="/contact" component={ContactUs} />

      {/* Design preview - always accessible */}
      <Route path="/design-preview" component={DesignPreview} />
      <Route path="/eink-preview" component={EinkPreview} />
      <Route path="/switch-preview" component={SwitchPreview} />
      <Route path="/assignment-preview" component={AssignmentPreview} />
      <Route path="/tablet-preview" component={TabletPreview} />

      {/* Marketing pitch page - always accessible */}
      <Route path="/pitch" component={PitchPage} />

      {!isAuthenticated ? (
        <>
          <Route path="/" component={HomePage} />
          {/* Redirect any protected route to auth page when not logged in */}
          <Route path="/company" component={AuthPage} />
          <Route path="/company/:rest*" component={AuthPage} />
          <Route path="/admin" component={AuthPage} />
          <Route path="/admin/:rest*" component={AuthPage} />
          <Route path="/student" component={AuthPage} />
          <Route path="/student/:rest*" component={AuthPage} />
          <Route path="/tutor" component={AuthPage} />
          <Route path="/tutor/:rest*" component={AuthPage} />
          <Route path="/parent" component={AuthPage} />
          <Route path="/parent/:rest*" component={AuthPage} />
        </>
      ) : (
        <>
          {design === 'classic' && (
            <DesignSwitchBanner
              bannerSeen={bannerSeen}
              onDismiss={dismissBanner}
              onSwitch={() => setDesign('new')}
            />
          )}
          <Route path="/">
            {user?.role === 'student' && (
              design === 'new' ? <NewStudentDashboard setDesign={setDesign} /> : <StudentHome />
            )}
            {user?.role === 'parent' && (
              <NewParentDashboard setDesign={setDesign} />
            )}
            {user?.role === 'tutor' && <TutorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'company_admin' && (
              design === 'new' ? <NewTutorDashboard setDesign={setDesign} /> : <CompanyDashboard />
            )}
          </Route>
          <Route path="/student" component={StudentHome} />
          <Route path="/student/home" component={StudentHome} />
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/parent" component={ParentDashboard} />
          <Route path="/tutor" component={TutorDashboard} />
          <Route path="/tutor/tests" component={TestManagement} />
          <Route path="/tutor/tests/:testId/grade/:attemptId" component={TestGrading} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={Users} />
          <Route path="/admin/companies" component={Companies} />
          <Route path="/admin/companies/:id" component={CompanyManagement} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/test" component={TestUserCreation} />
          <Route path="/company" component={CompanyDashboard} />
          <Route path="/company/tutors" component={CompanyTutorDashboard} />
          <Route path="/company/students" component={CompanyStudents} />
          <Route path="/company/academic" component={() => <CompanyAcademicManagement />} />
          <Route path="/company/assignments" component={AssignmentManagement} />
          <Route path="/company/homework" component={SubmittedHomework} />
          <Route path="/company/marking" component={MarkingPage} />
          <Route path="/company/worksheets" component={WorksheetManagementPage} />
          <Route path="/company/worksheet/edit/:worksheetId" component={WorksheetEditorPage} />
          <Route path="/company/tests" component={TestManagement} />
          <Route path="/company/tests/:testId/grade/:attemptId" component={TestGrading} />
          <Route path="/company/reports" component={Reports} />
          <Route path="/student/portal">{() => <StudentPortal />}</Route>
          <Route path="/student/worksheets" component={StudentWorksheets} />
          <Route path="/student/worksheet/:id" component={WorksheetWorkPage} />
          <Route path="/student/assignment/:id" component={AssignmentWorkPage} />
          <Route path="/pdf-annotator" component={PDFAnnotatorPage} />
          <Route path="/google-docs-viewer" component={GoogleDocsViewer} />
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