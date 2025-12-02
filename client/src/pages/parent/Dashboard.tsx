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
import { 
  Users, CheckCircle, BookOpen, TrendingUp, Home, 
  Calendar, Clock, AlertCircle, GraduationCap, FileText,
  User, ChevronRight, Eye, Settings, Sparkles, Lightbulb
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

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
  classInfo: {
    id: string;
    name: string;
    subject: string;
  } | null;
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

export default function ParentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  // Calculate overall stats
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

  const activeChild = selectedChild ? children?.find(c => c.id === selectedChild) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/parent">
                <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-100" data-testid="button-home">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-black">Parent Portal</h1>
                <p className="text-gray-500 text-sm">Monitor your children's learning progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black hover:bg-gray-100"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Badge className="bg-black text-white px-4 py-2 text-sm" data-testid="text-username">
                {user?.firstName} {user?.lastName}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b-2 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Learning Features
                </CardTitle>
                <CardDescription>
                  Control AI-powered features for your children's learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <div>
                      <Label className="text-base font-medium">AI Hints</Label>
                      <p className="text-sm text-gray-600">
                        Allow your children to get helpful hints when they're stuck on questions
                      </p>
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
                <p className="text-xs text-gray-500">
                  Hints are provided in 3 progressive levels - from gentle nudges to more detailed guidance. 
                  This helps students learn while still encouraging independent problem-solving.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {childrenLoading ? (
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
            {/* Overview Stats */}
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

            {/* Children Tabs */}
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
                  {/* Child Profile Card */}
                  <Card className="border-2 border-black" data-testid={`card-child-profile-${child.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                            {child.user?.firstName?.[0]}{child.user?.lastName?.[0]}
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {child.user?.firstName} {child.user?.lastName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {child.classInfo?.name || 'No class assigned'} • Grade {child.gradeLevel || 'N/A'}
                            </CardDescription>
                            {child.schoolName && (
                              <p className="text-xs text-gray-500 mt-1">{child.schoolName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-black">{child.progress.completionRate}%</div>
                          <p className="text-sm text-gray-600">Completion</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Progress Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-2xl font-bold text-black">{child.progress.totalAssignments}</div>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{child.progress.submittedCount}</div>
                          <p className="text-xs text-gray-600">Submitted</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{child.progress.gradedCount}</div>
                          <p className="text-xs text-gray-600">Graded</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-2xl font-bold text-yellow-600">{child.progress.pendingCount}</div>
                          <p className="text-xs text-gray-600">Pending</p>
                        </div>
                      </div>
                      <Progress value={child.progress.completionRate} className="h-3" />
                    </CardContent>
                  </Card>

                  {/* Assignments List */}
                  <Card className="border-2 border-black" data-testid={`card-child-assignments-${child.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Assignments ({child.assignments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {child.assignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No assignments yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {child.assignments.map((assignment) => {
                            const deadlineInfo = getDeadlineInfo(assignment.submissionDate);
                            return (
                              <div 
                                key={assignment.id} 
                                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
                                data-testid={`assignment-row-${assignment.id}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-black">{assignment.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {assignment.assignmentKind === 'worksheet' ? 'Worksheet' : 'File Upload'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(assignment.submissionStatus)}
                                  {assignment.submission?.isLate && (
                                    <Badge className="bg-red-100 text-red-800">Late</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
