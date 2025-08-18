import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertAssignmentSchema, type Assignment, type Class } from "@shared/schema";
import { Plus, FileText, Calendar, Users, Edit, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const assignmentFormSchema = insertAssignmentSchema.extend({
  submissionDate: z.string(),
}).omit({
  companyId: true,
  createdBy: true,
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export function AssignmentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [preSelectedClass, setPreSelectedClass] = useState<{ id: string; name: string } | null>(null);

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
      const submissionDate = data.submissionDate ? new Date(data.submissionDate).toISOString() : undefined;
      return apiRequest(`/api/assignments/${id}`, 'PATCH', {
        ...data,
        submissionDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      setEditingAssignment(null);
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/assignments/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assignments'] });
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    },
  });

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      submissionDate: "",
      subject: "",
      totalMarks: 100,
      classId: "",
      attachmentUrls: [],
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg'],
      maxFileSize: 31457280,
      status: 'assigned',
      isActive: true,
    },
  });

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
      updateAssignmentMutation.mutate({ id: editingAssignment.id, data });
    } else {
      console.log("Calling createAssignmentMutation.mutate");
      createAssignmentMutation.mutate(data);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    form.reset({
      title: assignment.title,
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      submissionDate: assignment.submissionDate ? format(new Date(assignment.submissionDate), "yyyy-MM-dd'T'HH:mm") : "",
      classId: assignment.classId || "",
      subject: assignment.subject || "",
      totalMarks: assignment.totalMarks || 100,
    });
  };

  const handleDelete = (assignment: Assignment) => {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      deleteAssignmentMutation.mutate(assignment.id);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for your classes</p>
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
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Assignment title" {...field} />
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
                      <FormLabel>Subject/Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics, English" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <FormLabel>Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Assignment details and instructions" rows={3} {...field} value={field.value || ""} />
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
                      <FormLabel>Instructions/Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional instructions for students" rows={3} {...field} value={field.value || ""} />
                      </FormControl>
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
                        <FormLabel>Submission Date *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Marks</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
        <div className="flex items-center justify-center h-64">
          <p>Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No assignments yet</h3>
              <p className="text-muted-foreground">Create your first assignment to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment: Assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(assignment)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(assignment)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Due: {assignment.submissionDate ? format(new Date(assignment.submissionDate), "MMM d, yyyy") : "No due date"}
                    </span>
                  </div>
                  {assignment.subject && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{assignment.subject}</Badge>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Marks:</span>
                    <span className="font-medium">{assignment.totalMarks || 100}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}