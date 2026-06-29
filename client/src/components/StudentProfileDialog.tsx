import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User, GraduationCap, BookOpen, Save, X, Archive, RotateCcw,
  FileText, TrendingUp, Star, AlertTriangle, CheckCircle, Clock, Plus, Trash2
} from "lucide-react";

interface StudentProfileDialogProps {
  studentId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Student {
  id: string;
  userId: string;
  schoolName: string;
  rollNumber: string;
  yearId: string;
  termId: string;
  classId: string;
  status: 'active' | 'archived';
  archivedAt?: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
}

interface AcademicTerm {
  id: string;
  name: string;
  academicYearId: string;
}

interface ProgressReport {
  id: string;
  subject: string;
  grade: string | null;
  overallComment: string | null;
  strengths: string | null;
  areasForImprovement: string | null;
  attendancePercentage: number | null;
  status: 'draft' | 'published' | 'shared_with_parent';
  sharedWithParentAt: string | null;
  createdByName: string | null;
  termName?: string | null;
  createdAt: string;
}

interface AttendanceSummary {
  summary: {
    totalSessions: number;
    attendedSessions: number;
    attendancePercentage: number;
  };
  bySubject: Array<{ subject: string; total: number; attended: number; percentage: number }>;
}

interface Enrolment {
  id: string;
  classId: string;
  isActive: boolean;
  class?: { name: string; subject: string; term?: { name: string } };
}

type ActiveTab = 'profile' | 'classes' | 'reports';

export function StudentProfileDialog({ studentId, companyId, isOpen, onClose }: StudentProfileDialogProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [formData, setFormData] = useState({ schoolName: "", rollNumber: "" });
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    subject: "", termId: "", grade: "", overallComment: "", strengths: "", areasForImprovement: "", status: "draft" as const,
  });

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    enabled: isOpen && !!studentId,
  });

  const { data: terms = [] } = useQuery<AcademicTerm[]>({
    queryKey: ["/api/companies", companyId, "academic-terms"],
    enabled: isOpen && !!companyId,
  });

  const { data: progressReports = [], refetch: refetchReports } = useQuery<ProgressReport[]>({
    queryKey: [`/api/students/${studentId}/progress-reports`],
    enabled: isOpen && !!studentId && activeTab === 'reports',
  });

  const { data: attendance } = useQuery<AttendanceSummary>({
    queryKey: [`/api/attendance/summary/student/${studentId}`],
    enabled: isOpen && !!studentId && activeTab === 'classes',
  });

  const { data: enrolments = [] } = useQuery<Enrolment[]>({
    queryKey: [`/api/students/${studentId}/enrollments`],
    enabled: isOpen && !!studentId && activeTab === 'classes',
  });

  useEffect(() => {
    if (student) {
      setFormData({ schoolName: student.schoolName || "", rollNumber: student.rollNumber || "" });
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/students/${studentId}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "students"] });
      setEditMode(false);
      toast({ title: "Profile updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/students/${studentId}/archive`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "students"] });
      toast({ title: "Student archived" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => apiRequest(`/api/students/${studentId}/reactivate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "students"] });
      toast({ title: "Student reactivated" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/students/${studentId}/progress-reports`, "POST", data),
    onSuccess: () => {
      refetchReports();
      setShowNewReport(false);
      setReportForm({ subject: "", termId: "", grade: "", overallComment: "", strengths: "", areasForImprovement: "", status: "draft" });
      toast({ title: "Report created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: any }) =>
      apiRequest(`/api/progress-reports/${reportId}`, "PATCH", data),
    onSuccess: () => { refetchReports(); toast({ title: "Report updated" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => apiRequest(`/api/progress-reports/${reportId}`, "DELETE"),
    onSuccess: () => { refetchReports(); toast({ title: "Report deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const isArchived = student?.status === 'archived';
  const attendancePct = attendance?.summary?.attendancePercentage ?? null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8 text-gray-500">Loading…</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8 text-red-600">Student not found</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{student.user?.firstName} {student.user?.lastName}</span>
              {isArchived && <Badge variant="destructive">Archived</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {!isArchived ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`Archive ${student.user?.firstName} ${student.user?.lastName}? They will be hidden from active lists.`)) {
                      archiveMutation.mutate();
                    }
                  }}
                  disabled={archiveMutation.isPending}
                >
                  <Archive className="w-4 h-4 mr-1" /> Archive
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => reactivateMutation.mutate()}
                  disabled={reactivateMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reactivate
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {([
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'classes', label: 'Classes & Attendance', icon: GraduationCap },
            { key: 'reports', label: 'Progress Reports', icon: FileText },
          ] as { key: ActiveTab; label: string; icon: any }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> Basic Information</div>
                  {editMode ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateMutation.mutate({ school: formData.schoolName, roll_number: formData.rollNumber || null })} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setFormData({ schoolName: student.schoolName || "", rollNumber: student.rollNumber || "" }); }}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>Edit</Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name</Label><Input value={student.user?.firstName || ""} disabled className="mt-1" /></div>
                  <div><Label>Last Name</Label><Input value={student.user?.lastName || ""} disabled className="mt-1" /></div>
                </div>
                <div><Label>Email</Label><Input value={student.user?.email || ""} disabled className="mt-1" /></div>
                <div>
                  <Label>School Name</Label>
                  {editMode
                    ? <Input value={formData.schoolName} onChange={e => setFormData(p => ({ ...p, schoolName: e.target.value }))} className="mt-1" placeholder="School name" />
                    : <Input value={student.schoolName || "Not set"} disabled className="mt-1" />
                  }
                </div>
                <div>
                  <Label>Roll Number</Label>
                  {editMode
                    ? <Input value={formData.rollNumber} onChange={e => setFormData(p => ({ ...p, rollNumber: e.target.value }))} className="mt-1" placeholder="e.g. 2024-001" />
                    : <Input value={student.rollNumber || "Not set"} disabled className="mt-1" />
                  }
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={isArchived ? "destructive" : "default"}>
                        {isArchived ? "Archived" : "Active"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Joined</Label>
                    <div className="mt-1 text-sm text-gray-600">
                      {student.user?.createdAt ? new Date(student.user.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CLASSES & ATTENDANCE TAB */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            {/* Attendance summary */}
            {attendancePct !== null && (
              <>
                {attendancePct < 80 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Low attendance: {attendancePct}% — 80% minimum required
                  </div>
                )}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4" /> Attendance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={attendancePct >= 80 ? '#10b981' : attendancePct >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="3"
                            strokeDasharray={`${attendancePct} ${100 - attendancePct}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-extrabold text-gray-900">{attendancePct}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {attendance?.summary?.attendedSessions ?? 0} of {attendance?.summary?.totalSessions ?? 0} sessions attended
                        </p>
                        <Badge className={attendancePct >= 80 ? 'bg-green-100 text-green-800' : attendancePct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                          {attendancePct >= 80 ? 'On track' : attendancePct >= 60 ? 'Needs improvement' : 'At risk'}
                        </Badge>
                      </div>
                    </div>
                    {attendance?.bySubject && attendance.bySubject.length > 0 && (
                      <div className="space-y-2">
                        {attendance.bySubject.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">{s.subject}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${s.percentage >= 80 ? 'bg-green-500' : s.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${s.percentage}%` }}
                                />
                              </div>
                              <span className="text-gray-500 w-10 text-right">{s.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Enrolled classes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4" /> Enrolled Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrolments.length === 0 ? (
                  <p className="text-sm text-gray-500">Not enrolled in any classes yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {enrolments.map(e => (
                      <li key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{e.class?.name || 'Unknown class'}</p>
                          <p className="text-gray-500">{e.class?.subject}{e.class?.term?.name ? ` · ${e.class.term.name}` : ''}</p>
                        </div>
                        <Badge variant={e.isActive ? "default" : "outline"}>{e.isActive ? 'Active' : 'Inactive'}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PROGRESS REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{progressReports.length} report{progressReports.length !== 1 ? 's' : ''}</p>
              <Button size="sm" onClick={() => setShowNewReport(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Report
              </Button>
            </div>

            {showNewReport && (
              <Card className="border-indigo-200 bg-indigo-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">New Progress Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Subject *</Label>
                      <Input value={reportForm.subject} onChange={e => setReportForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" className="mt-1" />
                    </div>
                    <div>
                      <Label>Grade</Label>
                      <Input value={reportForm.grade} onChange={e => setReportForm(p => ({ ...p, grade: e.target.value }))} placeholder="e.g. A, 85%, Merit" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Term</Label>
                    <Select value={reportForm.termId} onValueChange={v => setReportForm(p => ({ ...p, termId: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select term (optional)" /></SelectTrigger>
                      <SelectContent>
                        {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Overall Comment</Label>
                    <Textarea value={reportForm.overallComment} onChange={e => setReportForm(p => ({ ...p, overallComment: e.target.value }))} placeholder="Overall assessment…" rows={3} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Strengths</Label>
                      <Textarea value={reportForm.strengths} onChange={e => setReportForm(p => ({ ...p, strengths: e.target.value }))} placeholder="What they do well…" rows={2} className="mt-1" />
                    </div>
                    <div>
                      <Label>Areas to Improve</Label>
                      <Textarea value={reportForm.areasForImprovement} onChange={e => setReportForm(p => ({ ...p, areasForImprovement: e.target.value }))} placeholder="Focus areas…" rows={2} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setShowNewReport(false)}>Cancel</Button>
                    <Button size="sm" variant="outline" onClick={() => createReportMutation.mutate({ ...reportForm, status: 'draft' })} disabled={!reportForm.subject || createReportMutation.isPending}>Save Draft</Button>
                    <Button size="sm" onClick={() => createReportMutation.mutate({ ...reportForm, status: 'published' })} disabled={!reportForm.subject || createReportMutation.isPending}>Publish</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {progressReports.length === 0 && !showNewReport && (
              <div className="text-center py-10 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No progress reports yet. Click "New Report" to create one.</p>
              </div>
            )}

            {progressReports.map(r => (
              <Card key={r.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{r.subject}</p>
                      {r.termName && <p className="text-xs text-gray-500">{r.termName}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.grade && <Badge className="bg-indigo-100 text-indigo-800"><Star className="w-3 h-3 mr-1" />{r.grade}</Badge>}
                      <Badge variant={r.status === 'shared_with_parent' ? 'default' : r.status === 'published' ? 'secondary' : 'outline'}>
                        {r.status === 'shared_with_parent' ? '✓ Shared' : r.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  {r.overallComment && <p className="text-sm text-gray-700 mb-2">{r.overallComment}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">{r.createdByName ? `By ${r.createdByName}` : ''} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      {r.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => updateReportMutation.mutate({ reportId: r.id, data: { status: 'published' } })}>
                          Publish
                        </Button>
                      )}
                      {r.status === 'published' && (
                        <Button size="sm" variant="outline" onClick={() => updateReportMutation.mutate({ reportId: r.id, data: { status: 'shared_with_parent' } })}>
                          Share with Parent
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
                        if (confirm('Delete this report?')) deleteReportMutation.mutate(r.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
