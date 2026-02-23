import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertAssignmentSchema, type Assignment, type Class } from "@shared/schema";
import { Plus, FileText, Calendar, Users, Edit, Trash2, Upload, FileQuestion, BookOpen, HelpCircle, CheckCircle, ClipboardList, GraduationCap, Lightbulb, Eye } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WorksheetEditor } from "@/components/WorksheetEditor";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useMultipleFileMetadata, getDisplayFilename } from "@/hooks/useFileMetadata";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import TestManagement from "@/pages/tests/TestManagement";
import SubmittedHomework from "@/pages/company/SubmittedHomework";
import { WorksheetManagement } from "@/pages/admin/WorksheetManagement";

const assignmentFormSchema = insertAssignmentSchema.extend({
  submissionDate: z.string(),
  academicYearId: z.string().optional(),
  termId: z.string().optional(),
  week: z.number().optional(),
  assignmentKind: z.enum(['file_upload', 'worksheet']).default('file_upload'),
  worksheetId: z.string().optional(),
  correctAnswer: z.string().optional(),
  helpText: z.string().optional(),
}).omit({
  companyId: true,
  createdBy: true,
}).superRefine((data, ctx) => {
  if (data.assignmentKind === 'worksheet' && !data.worksheetId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select or create a worksheet",
      path: ["worksheetId"],
    });
  }
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

// Component to display uploaded files with metadata
function UploadedFilesList({ 
  attachmentUrls, 
  onRemoveFile 
}: { 
  attachmentUrls: string[]; 
  onRemoveFile: (index: number) => void; 
}) {
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(attachmentUrls);

  if (attachmentUrls.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Uploaded Files:</p>
      <div className="space-y-1">
        {attachmentUrls.map((url: string, index: number) => {
          const metadata = fileMetadata?.[index];
          const displayFilename = getDisplayFilename(url, metadata, index);
          
          return (
            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
              <span className="text-sm">
                {isLoadingMetadata ? `Loading file ${index + 1}...` : displayFilename}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Convert uploaded URL to viewable path
                    const objectPath = url.includes('/uploads/') 
                      ? url.split('/uploads/').pop()
                      : url.split('/').pop();
                    window.open(`/objects/uploads/${objectPath}`, '_blank');
                  }}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Component to display assignments organized by academic hierarchy
function AssignmentHierarchy({ 
  assignments, 
  academicYears, 
  academicTerms, 
  onEdit, 
  onDelete,
  onManageSolution 
}: {
  assignments: Assignment[];
  academicYears: any[];
  academicTerms: any[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onManageSolution: (assignment: Assignment) => void;
}) {
  // Group assignments by academic year, term, subject, and week
  const groupedAssignments = React.useMemo(() => {
    const groups: { [key: string]: { [key: string]: { [key: string]: { [key: string]: Assignment[] } } } } = {};

    assignments.forEach((assignment: any) => {
      const year = assignment.academicYearId || 'Unassigned';
      const term = assignment.termId || 'Unassigned';
      const subject = assignment.subject || 'No Subject';
      const week = assignment.week?.toString() || 'No Week';

      if (!groups[year]) groups[year] = {};
      if (!groups[year][term]) groups[year][term] = {};
      if (!groups[year][term][subject]) groups[year][term][subject] = {};
      if (!groups[year][term][subject][week]) groups[year][term][subject][week] = [];

      groups[year][term][subject][week].push(assignment);
    });

    return groups;
  }, [assignments]);

  const getYearName = (yearId: string) => {
    if (yearId === 'Unassigned') return 'Unassigned Year';
    const year = academicYears.find(y => y.id === yearId);
    return year?.name || yearId;
  };

  const getTermName = (termId: string) => {
    if (termId === 'Unassigned') return 'Unassigned Term';
    const term = academicTerms.find(t => t.id === termId);
    return term?.name || termId;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {Object.entries(groupedAssignments).map(([yearId, yearGroup]) => (
          Object.entries(yearGroup).map(([termId, termGroup]) => (
            Object.entries(termGroup).map(([subject, subjectGroup]) => (
              Object.entries(subjectGroup).map(([week, weekAssignments]) => (
                weekAssignments.map((assignment: Assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <CardDescription className="text-sm">{assignment.description}</CardDescription>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="secondary" className="text-xs">
                              {getYearName(yearId)} - {getTermName(termId)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Week {week}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => onManageSolution(assignment)} title="Manage Solution">
                            <Lightbulb className={`w-4 h-4 ${(assignment as any).solutionText || ((assignment as any).solutionFileUrls && (assignment as any).solutionFileUrls.length > 0) ? 'text-amber-500' : ''}`} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onEdit(assignment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDelete(assignment)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Due: {assignment.submissionDate ? format(new Date(assignment.submissionDate), "MMM d, yyyy") : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Class Assignment</span>
                        </div>
                      </div>
                      {assignment.instructions && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">Instructions:</p>
                          <p className="text-sm">{assignment.instructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ))
            ))
          ))
        ))}
      </div>
    </div>
  );
}

function SolutionManager({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyId = (assignment as any).companyId;
  const [solutionText, setSolutionText] = useState((assignment as any).solutionText || '');
  const [solutionFileUrls, setSolutionFileUrls] = useState<string[]>((assignment as any).solutionFileUrls || []);
  const { data: fileMetadata, isLoading: isLoadingMetadata } = useMultipleFileMetadata(solutionFileUrls);

  const saveSolutionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/assignments/${assignment.id}`, 'PATCH', {
        solutionText: solutionText || null,
        solutionFileUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      toast({ title: "Solution saved", description: "The solution has been saved successfully." });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to save solution", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Solution Text / Explanation
        </label>
        <Textarea
          placeholder="Enter the solution explanation, worked examples, or answer key..."
          rows={6}
          value={solutionText}
          onChange={(e) => setSolutionText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Visible to tutors, business admins, and parents. Not visible to students.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Solution Files</label>
        <p className="text-xs text-muted-foreground mb-2">
          Upload solution PDFs, documents, or images. Accepted formats: PDF, DOC, DOCX, PNG, JPEG (Max 30MB)
        </p>
        <ObjectUploader
          maxNumberOfFiles={5}
          maxFileSize={31457280}
          onGetUploadParameters={async () => {
            const response = await apiRequest('/api/objects/upload', 'POST');
            return { method: 'PUT' as const, url: response.uploadURL };
          }}
          onComplete={async (result) => {
            if (result.successful && result.successful.length > 0) {
              for (const file of result.successful) {
                try {
                  await apiRequest('/api/objects/metadata', 'POST', {
                    uploadURL: file.uploadURL,
                    originalFileName: file.name
                  });
                } catch (error) {
                  console.error("Failed to set file metadata:", error);
                }
              }
              const uploadedUrls = result.successful.map((file: any) => file.uploadURL);
              setSolutionFileUrls(prev => [...prev, ...uploadedUrls]);
              toast({ title: "Uploaded", description: `${result.successful.length} solution file(s) uploaded` });
            }
          }}
          buttonClassName="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Solution Files
        </ObjectUploader>

        {solutionFileUrls.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-sm font-medium">Uploaded Solution Files:</p>
            {solutionFileUrls.map((url, index) => {
              const metadata = fileMetadata?.[index];
              const displayFilename = getDisplayFilename(url, metadata, index);
              return (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">
                    {isLoadingMetadata ? `Loading file ${index + 1}...` : displayFilename}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const objectPath = url.includes('/uploads/')
                          ? url.split('/uploads/').pop()
                          : url.split('/').pop();
                        window.open(`/objects/uploads/${objectPath}`, '_blank');
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSolutionFileUrls(prev => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => saveSolutionMutation.mutate()} disabled={saveSolutionMutation.isPending}>
          {saveSolutionMutation.isPending ? 'Saving...' : 'Save Solution'}
        </Button>
      </div>
    </div>
  );
}

export function AssignmentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [preSelectedClass, setPreSelectedClass] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [showWorksheetEditor, setShowWorksheetEditor] = useState(false);
  const [editingWorksheetId, setEditingWorksheetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'worksheets' | 'tests' | 'homework'>('assignments');
  const [solutionAssignment, setSolutionAssignment] = useState<Assignment | null>(null);

  // Get user's company ID from roleData
  const companyId = (user as any)?.roleData?.companyId;

  // Fetch assignments for the company
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/companies', companyId, 'assignments'],
    enabled: !!companyId,
  });

  // Fetch classes for assignment creation
  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/companies', companyId, 'classes'],
    enabled: !!companyId,
  });

  // Fetch academic years and terms for the new organization structure
  const { data: academicYears = [] } = useQuery<any[]>({
    queryKey: ['/api/companies', companyId, 'academic-years'],
    enabled: !!companyId,
  });

  const { data: academicTerms = [] } = useQuery<any[]>({
    queryKey: ['/api/companies', companyId, 'academic-terms'],
    enabled: !!companyId,
  });

  // Fetch worksheets for worksheet assignment type
  const { data: worksheets = [] } = useQuery<any[]>({
    queryKey: ['/api/companies', companyId, 'worksheets'],
    enabled: !!companyId,
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      return apiRequest(`/api/assignments/${assignmentId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      console.log("Creating assignment with data:", data);
      console.log("Using company ID:", companyId);
      const submissionDate = new Date(data.submissionDate);
      const payload = {
        ...data,
        submissionDate: submissionDate.toISOString(),
        companyId,
      };
      console.log("Assignment payload:", payload);
      return apiRequest(`/api/assignments`, 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Assignment creation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssignmentFormData> }) => {
      console.log("Update mutation data before processing:", data);
      const payload = { ...data };
      if (data.submissionDate) {
        payload.submissionDate = new Date(data.submissionDate).toISOString();
      }
      console.log("Update mutation payload:", payload);
      return apiRequest(`/api/assignments/${id}`, 'PATCH', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      setEditingAssignment(null);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Assignment update error:", error);
      toast({
        title: "Error", 
        description: error?.message || "Failed to update assignment",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      correctAnswer: "",
      helpText: "",
      submissionDate: "",
      subject: "",
      academicYearId: "",
      termId: "",
      week: undefined,
      classId: "",
      assignmentKind: 'file_upload',
      worksheetId: "",
      attachmentUrls: [],
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg'],
      maxFileSize: 31457280,
      status: 'assigned',
      isActive: true,
    },
  });

  const assignmentKind = form.watch('assignmentKind');

  const onSubmit = (data: AssignmentFormData) => {
    console.log("Form submission triggered!");
    console.log("Form submission data:", data);
    console.log("Company ID:", companyId);
    console.log("Form errors:", form.formState.errors);
    
    if (!companyId) {
      console.error("No company ID available!");
      toast({
        title: "Error",
        description: "Company information not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    if (editingAssignment) {
      console.log("Calling updateAssignmentMutation.mutate with:", { id: editingAssignment.id, data });
      updateAssignmentMutation.mutate({ id: editingAssignment.id, data });
    } else {
      console.log("Calling createAssignmentMutation.mutate");
      createAssignmentMutation.mutate(data);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    console.log("Editing assignment:", assignment);
    setEditingAssignment(assignment);
    setIsCreateDialogOpen(true);
    
    const formData = {
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      correctAnswer: (assignment as any).correctAnswer || '',
      helpText: (assignment as any).helpText || '',
      subject: assignment.subject || '',
      academicYearId: (assignment as any).academicYearId || '',
      termId: (assignment as any).termId || '',
      week: (assignment as any).week || undefined,
      classId: assignment.classId,
      submissionDate: assignment.submissionDate 
        ? new Date(assignment.submissionDate).toISOString().slice(0, 16) 
        : '',

      attachmentUrls: assignment.attachmentUrls || [],
      allowedFileTypes: assignment.allowedFileTypes || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg'],
      maxFileSize: assignment.maxFileSize || 31457280,
      status: assignment.status || 'assigned',
      isActive: assignment.isActive ?? true,
    };
    
    console.log("Form data for editing:", formData);
    form.reset(formData);
  };

  const handleDelete = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingAssignment(null);
    setPreSelectedClass(null);
  };

  // Handle URL parameters for pre-selecting class
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId');
    const className = urlParams.get('className');
    
    if (classId && className) {
      // Store pre-selected class info
      setPreSelectedClass({ id: classId, name: decodeURIComponent(className) });
      // Pre-populate form with class and open dialog
      form.setValue('classId', classId);
      setIsCreateDialogOpen(true);
      
      // Clear URL parameters after handling
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [form]);

  if (!user || !['company_admin', 'tutor'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">You don't have permission to manage assignments.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="assignment-management-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage worksheets, assignments, tests, and submitted homework
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tests'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Tests & Exams
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'homework'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Submitted Homework
        </button>
        <button
          onClick={() => setActiveTab('worksheets')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'worksheets'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Worksheets
        </button>
      </div>

      {/* Worksheets Tab */}
      {activeTab === 'worksheets' && companyId && (
        <WorksheetManagement companyId={companyId} />
      )}

      {/* Tests & Exams Tab */}
      {activeTab === 'tests' && (
        <TestManagement />
      )}

      {/* Submitted Homework Tab */}
      {activeTab === 'homework' && (
        <SubmittedHomework />
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create and Manage Assignments</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create and manage assignments for your classes</p>
          </div>
        <Dialog open={isCreateDialogOpen || !!editingAssignment} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
              <DialogDescription>
                {editingAssignment ? 'Update the assignment details below.' : 'Fill in the assignment details and set a submission deadline.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Form submission failed with errors:", errors);
              })} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-title">Title *</FormLabel>
                      <FormControl>
                        <Input 
                          id="assignment-title"
                          placeholder="Assignment title" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-subject">Subject/Topic *</FormLabel>
                      <FormControl>
                        <Input 
                          id="assignment-subject"
                          placeholder="e.g., Mathematics, English" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assignment Type Selector */}
                <FormField
                  control={form.control}
                  name="assignmentKind"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Assignment Type *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="file_upload" id="type-file" />
                            <label htmlFor="type-file" className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-muted">
                              <Upload className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">File Upload</p>
                                <p className="text-xs text-muted-foreground">Students upload documents</p>
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="worksheet" id="type-worksheet" />
                            <label htmlFor="type-worksheet" className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-muted">
                              <BookOpen className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">Interactive Worksheet</p>
                                <p className="text-xs text-muted-foreground">Students answer questions online</p>
                              </div>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Academic Organization Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="academicYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="assignment-academic-year">Academic Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger id="assignment-academic-year">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((year: any) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="assignment-term">Term</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger id="assignment-term">
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicTerms.map((term: any) => (
                              <SelectItem key={term.id} value={term.id}>
                                {term.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="assignment-week">Week</FormLabel>
                        <FormControl>
                          <Input 
                            id="assignment-week"
                            type="number"
                            placeholder="e.g., 1, 2, 3" 
                            {...field} 
                            value={field.value?.toString() || ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {preSelectedClass ? (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <div className="flex items-center p-3 bg-gray-50 border rounded-md">
                        <span className="font-medium">{preSelectedClass.name}</span>
                        <Badge variant="secondary" className="ml-2">Pre-selected</Badge>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This assignment will be created for the selected class.
                    </FormDescription>
                  </FormItem>
                ) : (
                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="assignment-class">Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger id="assignment-class">
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls: Class) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} - {cls.subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-description">Description</FormLabel>
                      <FormDescription>
                        Use the rich text editor to format text, add tables, and highlight content.
                      </FormDescription>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Assignment details and instructions"
                          minHeight="150px"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-instructions">Instructions/Notes</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Additional instructions for students"
                          minHeight="120px"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Correct Answer field - visible only to tutors */}
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-correct-answer" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Correct Answer (Tutor Only)
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          id="assignment-correct-answer"
                          placeholder="Enter the correct answer for grading reference (not shown to students)" 
                          rows={3} 
                          {...field} 
                          value={field.value || ""} 
                          data-testid="input-correct-answer"
                        />
                      </FormControl>
                      <FormDescription>
                        This answer is for your reference when grading. Students will not see this.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Help Text field - shown to students via help icon */}
                <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="assignment-help-text" className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                        Help/Hints for Students
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          id="assignment-help-text"
                          placeholder="Enter hints or guidance that students can access via the help icon" 
                          rows={3} 
                          {...field} 
                          value={field.value || ""} 
                          data-testid="input-help-text"
                        />
                      </FormControl>
                      <FormDescription>
                        Students can click a help icon to view this guidance while working on the assignment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="assignment-submission-date">Submission Date *</FormLabel>
                        <FormControl>
                          <Input 
                            id="assignment-submission-date"
                            type="datetime-local" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                </div>

                {/* Conditional: File Upload OR Worksheet Selection */}
                {assignmentKind === 'file_upload' ? (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-medium">Upload Files (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload assignment files for students. Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPEG (Max 30MB)
                    </p>
                    
                    <ObjectUploader
                      maxNumberOfFiles={5}
                      maxFileSize={31457280} // 30MB
                      onGetUploadParameters={async () => {
                        const response = await apiRequest('/api/objects/upload', 'POST');
                        return {
                          method: 'PUT' as const,
                          url: response.uploadURL,
                        };
                      }}
                      onComplete={async (result) => {
                        console.log("Files uploaded:", result);
                        if (result.successful && result.successful.length > 0) {
                          for (const file of result.successful) {
                            try {
                              await apiRequest('/api/objects/metadata', 'POST', {
                                uploadURL: file.uploadURL,
                                originalFileName: file.name
                              });
                            } catch (error) {
                              console.error("Failed to set file metadata:", error);
                            }
                          }
                          
                          const uploadedUrls = result.successful.map((file: any) => file.uploadURL);
                          const currentUrls = form.getValues('attachmentUrls') || [];
                          form.setValue('attachmentUrls', [...currentUrls, ...uploadedUrls]);
                          toast({
                            title: "Success",
                            description: `${result.successful.length} file(s) uploaded successfully`,
                          });
                        }
                      }}
                      buttonClassName="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Assignment Files
                    </ObjectUploader>

                    <UploadedFilesList 
                      attachmentUrls={form.watch('attachmentUrls') || []}
                      onRemoveFile={(index: number) => {
                        const currentUrls = form.getValues('attachmentUrls') || [];
                        const newUrls = currentUrls.filter((_: string, i: number) => i !== index);
                        form.setValue('attachmentUrls', newUrls);
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-medium">Select Worksheet *</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose an existing worksheet or create a new one for students to complete.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="worksheetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Worksheet</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a worksheet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {worksheets.filter((w: any) => w.isPublished).map((worksheet: any) => (
                                <SelectItem key={worksheet.id} value={worksheet.id}>
                                  {worksheet.title} {worksheet.subject ? `- ${worksheet.subject}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowWorksheetEditor(true);
                          setEditingWorksheetId(null);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Worksheet
                      </Button>
                      {form.watch('worksheetId') && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowWorksheetEditor(true);
                            setEditingWorksheetId(form.getValues('worksheetId') || null);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Selected Worksheet
                        </Button>
                      )}
                    </div>

                    {worksheets.filter((w: any) => w.isPublished).length === 0 && (
                      <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                        No published worksheets available. Create and publish a worksheet first.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
                    onClick={() => {
                      console.log("Submit button clicked!");
                      console.log("Form state:", form.formState);
                      console.log("Form errors:", form.formState.errors);
                      console.log("Form values:", form.getValues());
                      // Force form validation check
                      const isValid = form.trigger();
                      console.log("Form validation result:", isValid);
                    }}
                  >
                    {createAssignmentMutation.isPending ? 'Creating...' : 
                     updateAssignmentMutation.isPending ? 'Updating...' :
                     editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingAssignments ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
            <p className="text-sm">Create your first assignment to get started</p>
          </div>
        </Card>
      ) : (
        <AssignmentHierarchy 
          assignments={assignments}
          academicYears={academicYears}
          academicTerms={academicTerms}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageSolution={(assignment) => setSolutionAssignment(assignment)}
        />
      )}
      </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{assignmentToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (assignmentToDelete) {
                  deleteAssignmentMutation.mutate(assignmentToDelete.id);
                }
              }}
              disabled={deleteAssignmentMutation.isPending}
            >
              {deleteAssignmentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Solution Manager Dialog */}
      <Dialog open={!!solutionAssignment} onOpenChange={(open) => { if (!open) setSolutionAssignment(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Manage Solution - {solutionAssignment?.title}
            </DialogTitle>
            <DialogDescription>
              Add or update the solution for this assignment. Solutions are visible to tutors, business admins, and parents only.
            </DialogDescription>
          </DialogHeader>
          {solutionAssignment && (
            <SolutionManager 
              assignment={solutionAssignment} 
              onClose={() => setSolutionAssignment(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Worksheet Editor Modal */}
      <Dialog open={showWorksheetEditor} onOpenChange={setShowWorksheetEditor}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWorksheetId ? 'Edit Worksheet' : 'Create New Worksheet'}</DialogTitle>
            <DialogDescription>
              Create interactive questions for students to complete online.
            </DialogDescription>
          </DialogHeader>
          <WorksheetEditor
            worksheetId={editingWorksheetId || undefined}
            companyId={companyId}
            onSave={(worksheetId: string) => {
              form.setValue('worksheetId', worksheetId);
              queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
              setShowWorksheetEditor(false);
              setEditingWorksheetId(null);
              toast({
                title: "Worksheet saved",
                description: "The worksheet has been saved successfully.",
              });
            }}
            onClose={() => {
              setShowWorksheetEditor(false);
              setEditingWorksheetId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}