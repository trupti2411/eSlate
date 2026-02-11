import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { ParentCalendarDashboard } from "@/components/calendar";
import MessageCenter from "@/components/MessageCenter";
import { 
  Users, CheckCircle, BookOpen, TrendingUp, Home, 
  Calendar, Clock, AlertCircle, GraduationCap, FileText,
  User, Eye, Settings, Sparkles, Lightbulb,
  MapPin, Phone, Mail, MessageCircle, Building2,
  Award, ClipboardList, Timer, Target, Star
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

interface TutorInfo {
  id: string;
  userId: string;
  specialization: string | null;
  qualifications: string | null;
  branch: string | null;
  subjectsTeaching: string[] | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

interface CompanyInfo {
  id: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  daysOfWeek: string[] | null;
  dayOfWeek: number | null;
  maxStudents: number | null;
}

interface TestResult {
  id: string;
  testId: string;
  status: string;
  totalScore: number | null;
  percentageScore: number | null;
  isPassed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  testTitle: string | null;
  testSubject: string | null;
  testTotalPoints: number | null;
  testPassingScore: number | null;
}

interface UpcomingTest {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  dueDate: string | null;
  duration: number | null;
  totalPoints: number | null;
  passingScore: number | null;
}

interface ChildData {
  id: string;
  userId: string;
  gradeLevel: string | null;
  schoolName: string | null;
  parentId: string;
  tutorId: string | null;
  companyId: string | null;
  classId: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
  };
  classInfo: ClassInfo | null;
  tutorInfo: TutorInfo | null;
  companyInfo: CompanyInfo | null;
  assignments: Array<{
    id: string;
    title: string;
    description: string | null;
    subject: string;
    submissionDate: string;
    status: string;
    assignmentKind: string;
    createdAt: string;
    submission: {
      id: string;
      status: string;
      submittedAt: string | null;
      isLate: boolean;
      score: number | null;
      feedback: string | null;
      gradedAt: string | null;
    } | null;
    submissionStatus: string;
  }>;
  submissions: Array<{
    id: string;
    assignmentId: string;
    status: string;
    submittedAt: string | null;
    isLate: boolean;
  }>;
  testResults: TestResult[];
  upcomingTests: UpcomingTest[];
  progress: {
    totalAssignments: number;
    submittedCount: number;
    gradedCount: number;
    pendingCount: number;
    completionRate: number;
  };
}

interface ParentSettings {
  id: string;
  userId: string;
  aiHintsEnabled: boolean;
  maxHintsPerQuestion: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ParentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mainTab, setMainTab] = useState<'overview' | 'calendar' | 'messages'>('overview');
  const { data: children, isLoading: childrenLoading, error } = useQuery<ChildData[]>({
    queryKey: ["/api/parents/children"],
    enabled: !!user && user.role === 'parent',
  });

  const { data: parentSettings } = useQuery<ParentSettings>({
    queryKey: ["/api/parents/settings"],
    enabled: !!user && user.role === 'parent',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<ParentSettings>) => {
      return apiRequest('/api/parents/settings', 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents/settings"] });
      toast({ title: 'Settings updated', description: 'Your preferences have been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update settings', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-black mb-4">Please log in to access the Parent Portal</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-black mb-4">This portal is only accessible to parent accounts.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalChildren = children?.length || 0;
  const totalAssignments = children?.reduce((acc, child) => acc + child.progress.totalAssignments, 0) || 0;
  const totalSubmitted = children?.reduce((acc, child) => acc + child.progress.submittedCount, 0) || 0;
  const totalGraded = children?.reduce((acc, child) => acc + child.progress.gradedCount, 0) || 0;
  const overallCompletionRate = totalAssignments > 0 ? Math.round((totalSubmitted / totalAssignments) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Submitted</Badge>;
      case 'graded':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Graded</Badge>;
      case 'parent_verified':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Verified</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">In Progress</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Late</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeadlineInfo = (submissionDate: string) => {
    const deadline = new Date(submissionDate);
    const now = new Date();
    const daysUntil = differenceInDays(deadline, now);
    
    if (isPast(deadline)) {
      return { text: 'Overdue', color: 'text-red-600' };
    } else if (daysUntil === 0) {
      return { text: 'Due today', color: 'text-orange-600' };
    } else if (daysUntil <= 3) {
      return { text: `Due in ${daysUntil} days`, color: 'text-yellow-600' };
    } else {
      return { text: `Due ${format(deadline, 'MMM d')}`, color: 'text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b-2 border-black sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/parent">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100 h-8 px-3 text-sm" data-testid="button-home">
                  <Home className="h-3 w-3 mr-1" />
                  Home
                </Button>
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <div className="flex items-center gap-0.5">
                <Button
                  variant={mainTab === 'overview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMainTab('overview')}
                  className={`h-8 px-3 text-sm ${mainTab === 'overview' ? 'bg-black text-white' : ''}`}
                  data-testid="tab-overview"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Overview
                </Button>
                <Button
                  variant={mainTab === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMainTab('calendar')}
                  className={`h-8 px-3 text-sm ${mainTab === 'calendar' ? 'bg-black text-white' : ''}`}
                  data-testid="tab-calendar"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Calendar
                </Button>
                <Button
                  variant={mainTab === 'messages' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMainTab('messages')}
                  className={`h-8 px-3 text-sm ${mainTab === 'messages' ? 'bg-black text-white' : ''}`}
                  data-testid="tab-messages"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Messages
                </Button>
              </div>
              <div className="h-5 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-bold text-black">Parent Portal</h1>
                <p className="text-gray-500 text-xs">Monitor your children's progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black hover:bg-gray-100 h-8 px-3 text-sm"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-settings"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Settings
              </Button>
              <Badge className="bg-black text-white px-3 py-1 text-xs" data-testid="text-username">
                {user?.firstName} {user?.lastName}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-gray-50 border-b-2 border-black flex-shrink-0">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <Card className="border-2 border-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Learning Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <div>
                      <Label className="text-sm font-medium">AI Hints</Label>
                      <p className="text-xs text-gray-600">Allow hints when stuck on questions</p>
                    </div>
                  </div>
                  <Switch
                    checked={parentSettings?.aiHintsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      updateSettingsMutation.mutate({ aiHintsEnabled: checked });
                    }}
                    data-testid="switch-ai-hints"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          {mainTab === 'calendar' ? (
            <ParentCalendarDashboard />
          ) : mainTab === 'messages' ? (
            <MessageCenter />
          ) : childrenLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700">Failed to load children data. Please try again.</p>
              </CardContent>
            </Card>
          ) : !children || children.length === 0 ? (
            <Card className="border-2 border-black">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">No Children Linked</h3>
                <p className="text-gray-600 mb-4">
                  No children are currently linked to your account. Please contact your tutoring center to link your children.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow" data-testid="card-children-count">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      Children
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-black">{totalChildren}</div>
                    <p className="text-xs text-gray-500 mt-1">Under your care</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow" data-testid="card-assignments-count">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      Total Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-black">{totalAssignments}</div>
                    <p className="text-xs text-gray-500 mt-1">Across all children</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow" data-testid="card-submitted-count">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      Submitted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{totalSubmitted}</div>
                    <p className="text-xs text-gray-500 mt-1">{totalGraded} graded</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black bg-white hover:shadow-lg transition-shadow" data-testid="card-completion-rate">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-black">{overallCompletionRate}%</div>
                    <Progress value={overallCompletionRate} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue={children[0]?.id} onValueChange={setSelectedChild} className="space-y-4">
                <TabsList className="grid w-full bg-white border-2 border-black rounded-xl p-2 gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(children.length, 4)}, 1fr)` }}>
                  {children.map((child) => (
                    <TabsTrigger 
                      key={child.id}
                      value={child.id}
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md py-2.5 font-medium transition-all"
                      data-testid={`tab-child-${child.id}`}
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>{child.user?.firstName || 'Child'}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {children.map((child) => (
                  <TabsContent key={child.id} value={child.id} className="space-y-4">
                    <ChildOverview 
                      child={child} 
                      getStatusBadge={getStatusBadge}
                      getDeadlineInfo={getDeadlineInfo}
                      onChatWithTutor={() => setMainTab('messages')}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildOverview({ child, getStatusBadge, getDeadlineInfo, onChatWithTutor }: {
  child: ChildData;
  getStatusBadge: (status: string) => JSX.Element;
  getDeadlineInfo: (date: string) => { text: string; color: string };
  onChatWithTutor: () => void;
}) {
  const gradedAssignments = child.assignments.filter(a => a.submission?.score != null);
  const avgScore = gradedAssignments.length > 0 
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.submission?.score || 0), 0) / gradedAssignments.length) 
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-black" data-testid={`card-child-profile-${child.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold shrink-0">
                {child.user?.firstName?.[0]}{child.user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">
                  {child.user?.firstName} {child.user?.lastName}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Grade {child.gradeLevel || 'N/A'} {child.schoolName ? `• ${child.schoolName}` : ''}
                </CardDescription>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-black">{child.progress.completionRate}%</div>
                <p className="text-xs text-gray-600">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-black">{child.progress.totalAssignments}</div>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xl font-bold text-blue-600">{child.progress.submittedCount}</div>
                <p className="text-xs text-gray-600">Submitted</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xl font-bold text-green-600">{child.progress.gradedCount}</div>
                <p className="text-xs text-gray-600">Graded</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-xl font-bold text-yellow-600">{child.progress.pendingCount}</div>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
            {avgScore !== null && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Average Score: {avgScore}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {child.companyInfo && (
            <Card className="border-2 border-black" data-testid="card-company-info">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Coaching Centre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <h3 className="font-semibold text-base">{child.companyInfo.name}</h3>
                {child.companyInfo.description && (
                  <p className="text-xs text-gray-600">{child.companyInfo.description}</p>
                )}
                <div className="space-y-1.5">
                  {child.companyInfo.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-gray-500 shrink-0" />
                      <span className="text-gray-700">{child.companyInfo.address}</span>
                    </div>
                  )}
                  {child.companyInfo.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <a href={`tel:${child.companyInfo.contactPhone}`} className="text-blue-600 hover:underline">
                        {child.companyInfo.contactPhone}
                      </a>
                    </div>
                  )}
                  {child.companyInfo.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <a href={`mailto:${child.companyInfo.contactEmail}`} className="text-blue-600 hover:underline">
                        {child.companyInfo.contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {child.classInfo && (
            <Card className="border-2 border-black" data-testid="card-class-info">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Class Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-base">{child.classInfo.name}</h3>
                {child.classInfo.subject && (
                  <p className="text-xs text-gray-500 mt-0.5">Subject: {child.classInfo.subject}</p>
                )}
                {child.classInfo.description && (
                  <p className="text-xs text-gray-600 mt-1">{child.classInfo.description}</p>
                )}
                <div className="mt-2 space-y-1">
                  {(child.classInfo.startTime || child.classInfo.endTime) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700">
                        {child.classInfo.startTime} - {child.classInfo.endTime}
                      </span>
                    </div>
                  )}
                  {child.classInfo.daysOfWeek && child.classInfo.daysOfWeek.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700">{child.classInfo.daysOfWeek.join(', ')}</span>
                    </div>
                  )}
                  {child.classInfo.dayOfWeek != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700">{DAY_NAMES[child.classInfo.dayOfWeek] || `Day ${child.classInfo.dayOfWeek}`}</span>
                    </div>
                  )}
                  {child.classInfo.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700">{child.classInfo.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {child.tutorInfo && (
        <Card className="border-2 border-black" data-testid="card-tutor-info">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Tutor
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="border-2 border-black h-8 text-sm"
                onClick={onChatWithTutor}
                data-testid="btn-chat-tutor"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Chat with Tutor
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 text-black flex items-center justify-center text-lg font-bold shrink-0">
                {child.tutorInfo.firstName?.[0]}{child.tutorInfo.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base">
                  {child.tutorInfo.firstName} {child.tutorInfo.lastName}
                </h3>
                {child.tutorInfo.specialization && (
                  <p className="text-xs text-gray-600">{child.tutorInfo.specialization}</p>
                )}
                {child.tutorInfo.qualifications && (
                  <p className="text-xs text-gray-500">{child.tutorInfo.qualifications}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                {child.tutorInfo.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${child.tutorInfo.email}`} className="text-blue-600 hover:underline">
                      {child.tutorInfo.email}
                    </a>
                  </div>
                )}
                {child.tutorInfo.subjectsTeaching && child.tutorInfo.subjectsTeaching.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {child.tutorInfo.subjectsTeaching.map((subject, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{subject}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-black" data-testid={`card-child-assignments-${child.id}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Assignments ({child.assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {child.assignments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {child.assignments.map((assignment) => {
                  const deadlineInfo = getDeadlineInfo(assignment.submissionDate);
                  return (
                    <div 
                      key={assignment.id} 
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
                      data-testid={`assignment-row-${assignment.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-sm text-black truncate">{assignment.title}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {assignment.assignmentKind === 'worksheet' ? 'Worksheet' : 'File Upload'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {assignment.subject}
                            </span>
                            <span className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                              <Calendar className="h-3 w-3" />
                              {deadlineInfo.text}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {assignment.submission?.score != null && (
                            <Badge className="bg-green-50 text-green-700 border-green-300 text-xs">
                              {assignment.submission.score}%
                            </Badge>
                          )}
                          {getStatusBadge(assignment.submissionStatus)}
                        </div>
                      </div>
                      {assignment.submission?.feedback && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-200">
                          <span className="font-medium">Feedback:</span> {assignment.submission.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-2 border-black" data-testid="card-test-results">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                Past Test Results ({child.testResults?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!child.testResults || child.testResults.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No test results yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {child.testResults.map((result) => (
                    <div key={result.id} className="p-3 border-2 border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-black truncate">{result.testTitle || 'Test'}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                            {result.testSubject && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {result.testSubject}
                              </span>
                            )}
                            {result.submittedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(result.submittedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {result.percentageScore != null && (
                            <span className={`text-lg font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {result.percentageScore}%
                            </span>
                          )}
                          {result.isPassed != null && (
                            <Badge className={result.isPassed ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}>
                              {result.isPassed ? 'Passed' : 'Failed'}
                            </Badge>
                          )}
                          {result.status === 'submitted' && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Grade</Badge>
                          )}
                        </div>
                      </div>
                      {result.totalScore != null && result.testTotalPoints != null && (
                        <div className="mt-1 text-xs text-gray-500">
                          Score: {result.totalScore}/{result.testTotalPoints}
                          {result.testPassingScore != null && ` (Pass: ${result.testPassingScore})`}
                        </div>
                      )}
                      {result.feedback && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-200">
                          <span className="font-medium">Feedback:</span> {result.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-black" data-testid="card-upcoming-tests">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                Upcoming Tests/Exams ({child.upcomingTests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!child.upcomingTests || child.upcomingTests.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No upcoming tests</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {child.upcomingTests.map((test) => (
                    <div key={test.id} className="p-3 border-2 border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-black truncate">{test.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                            {test.subject && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {test.subject}
                              </span>
                            )}
                            {test.dueDate && (
                              <span className="flex items-center gap-1 text-orange-600 font-medium">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(test.dueDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          {test.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Timer className="h-3 w-3" />
                              {test.duration} min
                            </div>
                          )}
                          {test.totalPoints != null && (
                            <div className="text-xs text-gray-600">
                              {test.totalPoints} pts
                            </div>
                          )}
                        </div>
                      </div>
                      {test.description && (
                        <p className="mt-1 text-xs text-gray-600">{test.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
