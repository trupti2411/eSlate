import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Moon, Users, BookOpen, Calendar, AlertTriangle, Clock, Save, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  emailNewAssignment: boolean;
  emailSubmissionGraded: boolean;
  emailNewMessage: boolean;
  emailAttendanceMarked: boolean;
  emailScheduleChanges: boolean;
  emailWeeklyDigest: boolean;
  inAppEnabled: boolean;
  inAppNewAssignment: boolean;
  inAppSubmissionGraded: boolean;
  inAppNewMessage: boolean;
  inAppAttendanceMarked: boolean;
  inAppScheduleChanges: boolean;
  staffNewStudentEnrollment: boolean;
  staffSubmissionReceived: boolean;
  staffLowAttendanceAlert: boolean;
  adminSystemAlerts: boolean;
  adminNewStaffRegistration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationSettingsProps {
  userRole: 'tutor' | 'company_admin' | 'admin';
}

export default function NotificationSettings({ userRole }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences>>({});

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notification-preferences'],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return apiRequest('/api/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
      setHasChanges(false);
      setLocalPrefs({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleTimeChange = (key: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(localPrefs);
  };

  const getValue = (key: keyof NotificationPreferences): boolean | string => {
    if (key in localPrefs) {
      return localPrefs[key] as boolean | string;
    }
    return preferences?.[key] ?? (typeof preferences?.[key] === 'boolean' ? true : '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isStaffOrAdmin = userRole === 'tutor' || userRole === 'company_admin' || userRole === 'admin';
  const isAdmin = userRole === 'company_admin' || userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Preferences
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Notifications
            </CardTitle>
            <CardDescription>Control which emails you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailEnabled" className="flex-1">
                <span className="font-medium">Enable Email Notifications</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Master toggle for all email notifications</p>
              </Label>
              <Switch
                id="emailEnabled"
                checked={getValue('emailEnabled') as boolean}
                onCheckedChange={(v) => handleToggle('emailEnabled', v)}
              />
            </div>

            <Separator />

            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNewAssignment" className="text-sm">New assignments</Label>
                <Switch
                  id="emailNewAssignment"
                  checked={getValue('emailNewAssignment') as boolean}
                  onCheckedChange={(v) => handleToggle('emailNewAssignment', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailSubmissionGraded" className="text-sm">Submission graded</Label>
                <Switch
                  id="emailSubmissionGraded"
                  checked={getValue('emailSubmissionGraded') as boolean}
                  onCheckedChange={(v) => handleToggle('emailSubmissionGraded', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNewMessage" className="text-sm">New messages</Label>
                <Switch
                  id="emailNewMessage"
                  checked={getValue('emailNewMessage') as boolean}
                  onCheckedChange={(v) => handleToggle('emailNewMessage', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailAttendanceMarked" className="text-sm">Attendance updates</Label>
                <Switch
                  id="emailAttendanceMarked"
                  checked={getValue('emailAttendanceMarked') as boolean}
                  onCheckedChange={(v) => handleToggle('emailAttendanceMarked', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailScheduleChanges" className="text-sm">Schedule changes</Label>
                <Switch
                  id="emailScheduleChanges"
                  checked={getValue('emailScheduleChanges') as boolean}
                  onCheckedChange={(v) => handleToggle('emailScheduleChanges', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailWeeklyDigest" className="text-sm">Weekly digest summary</Label>
                <Switch
                  id="emailWeeklyDigest"
                  checked={getValue('emailWeeklyDigest') as boolean}
                  onCheckedChange={(v) => handleToggle('emailWeeklyDigest', v)}
                  disabled={!getValue('emailEnabled')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-emerald-600" />
              In-App Notifications
            </CardTitle>
            <CardDescription>Control notifications within the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppEnabled" className="flex-1">
                <span className="font-medium">Enable In-App Notifications</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Master toggle for all in-app alerts</p>
              </Label>
              <Switch
                id="inAppEnabled"
                checked={getValue('inAppEnabled') as boolean}
                onCheckedChange={(v) => handleToggle('inAppEnabled', v)}
              />
            </div>

            <Separator />

            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppNewAssignment" className="text-sm">New assignments</Label>
                <Switch
                  id="inAppNewAssignment"
                  checked={getValue('inAppNewAssignment') as boolean}
                  onCheckedChange={(v) => handleToggle('inAppNewAssignment', v)}
                  disabled={!getValue('inAppEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppSubmissionGraded" className="text-sm">Submission graded</Label>
                <Switch
                  id="inAppSubmissionGraded"
                  checked={getValue('inAppSubmissionGraded') as boolean}
                  onCheckedChange={(v) => handleToggle('inAppSubmissionGraded', v)}
                  disabled={!getValue('inAppEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppNewMessage" className="text-sm">New messages</Label>
                <Switch
                  id="inAppNewMessage"
                  checked={getValue('inAppNewMessage') as boolean}
                  onCheckedChange={(v) => handleToggle('inAppNewMessage', v)}
                  disabled={!getValue('inAppEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppAttendanceMarked" className="text-sm">Attendance updates</Label>
                <Switch
                  id="inAppAttendanceMarked"
                  checked={getValue('inAppAttendanceMarked') as boolean}
                  onCheckedChange={(v) => handleToggle('inAppAttendanceMarked', v)}
                  disabled={!getValue('inAppEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppScheduleChanges" className="text-sm">Schedule changes</Label>
                <Switch
                  id="inAppScheduleChanges"
                  checked={getValue('inAppScheduleChanges') as boolean}
                  onCheckedChange={(v) => handleToggle('inAppScheduleChanges', v)}
                  disabled={!getValue('inAppEnabled')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isStaffOrAdmin && (
          <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-violet-600" />
                Staff Notifications
                <Badge variant="secondary" className="ml-2 text-xs">Staff Only</Badge>
              </CardTitle>
              <CardDescription>Notifications specific to tutors and staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="staffNewStudentEnrollment" className="flex-1">
                    <span className="text-sm font-medium">New student enrollment</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">When a new student is assigned to you</p>
                  </Label>
                  <Switch
                    id="staffNewStudentEnrollment"
                    checked={getValue('staffNewStudentEnrollment') as boolean}
                    onCheckedChange={(v) => handleToggle('staffNewStudentEnrollment', v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="staffSubmissionReceived" className="flex-1">
                    <span className="text-sm font-medium">Submission received</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">When a student submits homework</p>
                  </Label>
                  <Switch
                    id="staffSubmissionReceived"
                    checked={getValue('staffSubmissionReceived') as boolean}
                    onCheckedChange={(v) => handleToggle('staffSubmissionReceived', v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="staffLowAttendanceAlert" className="flex-1">
                    <span className="text-sm font-medium">Low attendance alerts</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">When a student's attendance drops below threshold</p>
                  </Label>
                  <Switch
                    id="staffLowAttendanceAlert"
                    checked={getValue('staffLowAttendanceAlert') as boolean}
                    onCheckedChange={(v) => handleToggle('staffLowAttendanceAlert', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Admin Notifications
                <Badge variant="secondary" className="ml-2 text-xs">Admin Only</Badge>
              </CardTitle>
              <CardDescription>Administrative alerts and system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminSystemAlerts" className="flex-1">
                    <span className="text-sm font-medium">System alerts</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Important system notifications</p>
                  </Label>
                  <Switch
                    id="adminSystemAlerts"
                    checked={getValue('adminSystemAlerts') as boolean}
                    onCheckedChange={(v) => handleToggle('adminSystemAlerts', v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminNewStaffRegistration" className="flex-1">
                    <span className="text-sm font-medium">New staff registration</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">When a new staff member joins</p>
                  </Label>
                  <Switch
                    id="adminNewStaffRegistration"
                    checked={getValue('adminNewStaffRegistration') as boolean}
                    onCheckedChange={(v) => handleToggle('adminNewStaffRegistration', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden md:col-span-2">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-gray-600" />
              Quiet Hours
            </CardTitle>
            <CardDescription>Set times when you don't want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quietHoursEnabled" className="flex-1">
                <span className="font-medium">Enable Quiet Hours</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pause non-urgent notifications during set hours</p>
              </Label>
              <Switch
                id="quietHoursEnabled"
                checked={getValue('quietHoursEnabled') as boolean}
                onCheckedChange={(v) => handleToggle('quietHoursEnabled', v)}
              />
            </div>

            {getValue('quietHoursEnabled') && (
              <div className="flex items-center gap-4 pt-2 pl-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Label htmlFor="quietHoursStart" className="text-sm">From</Label>
                  <Input
                    id="quietHoursStart"
                    type="time"
                    className="w-32"
                    value={getValue('quietHoursStart') as string || '22:00'}
                    onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="quietHoursEnd" className="text-sm">To</Label>
                  <Input
                    id="quietHoursEnd"
                    type="time"
                    className="w-32"
                    value={getValue('quietHoursEnd') as string || '07:00'}
                    onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
