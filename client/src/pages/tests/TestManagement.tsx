import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, FileQuestion, Edit, Trash2, Users, Clock, Target, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import type { Test, TestQuestion, Class, Student } from "@shared/schema";

const testFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject: z.string().optional(),
  classId: z.string().optional(),
  duration: z.number().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  allowRetakes: z.boolean().default(false),
  showResultsImmediately: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  dueDate: z.string().optional(),
});

type TestFormData = z.infer<typeof testFormSchema>;

const questionFormSchema = z.object({
  questionType: z.enum(["multiple_choice", "true_false", "short_answer", "essay", "fill_blank"]),
  questionText: z.string().min(1, "Question text is required"),
  questionNumber: z.number().min(1),
  points: z.number().min(1).default(1),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean(),
  })).optional(),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function TestManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);
  
  // Get company ID for the current user
  const { data: tutorData } = useQuery<{ companyId: string }>({
    queryKey: ['/api/tutors/by-user', user?.id],
    enabled: !!user?.id && user?.role === 'tutor',
  });
  
  const { data: companyAdminData } = useQuery<{ companyId: string }>({
    queryKey: ['/api/company-admins/by-user', user?.id],
    enabled: !!user?.id && user?.role === 'company_admin',
  });
  
  const companyId = tutorData?.companyId || companyAdminData?.companyId;
  
  // Fetch tests for the company
  const { data: tests = [], isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ['/api/companies', companyId, 'tests'],
    enabled: !!companyId,
  });
  
  // Fetch classes for the company
  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/companies', companyId, 'classes'],
    enabled: !!companyId,
  });
  
  // Fetch students for assignment
  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/students'],
    enabled: !!companyId,
  });
  
  const testForm = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      allowRetakes: false,
      showResultsImmediately: true,
      shuffleQuestions: false,
    },
  });
  
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionType: "multiple_choice",
      questionText: "",
      questionNumber: 1,
      points: 1,
      options: [
        { id: "a", text: "", isCorrect: false },
        { id: "b", text: "", isCorrect: false },
        { id: "c", text: "", isCorrect: false },
        { id: "d", text: "", isCorrect: false },
      ],
    },
  });
  
  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (data: TestFormData) => {
      return apiRequest("POST", `/api/companies/${companyId}/tests`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'tests'] });
      setIsTestDialogOpen(false);
      testForm.reset();
      toast({ title: "Test created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create test", description: error.message, variant: "destructive" });
    },
  });
  
  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TestFormData> }) => {
      return apiRequest("PATCH", `/api/tests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'tests'] });
      setIsTestDialogOpen(false);
      setEditingTest(null);
      testForm.reset();
      toast({ title: "Test updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update test", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'tests'] });
      toast({ title: "Test deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete test", description: error.message, variant: "destructive" });
    },
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      return apiRequest("POST", `/api/tests/${selectedTest?.id}/questions`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests', selectedTest?.id] });
      setIsQuestionDialogOpen(false);
      questionForm.reset({
        questionType: "multiple_choice",
        questionText: "",
        questionNumber: 1,
        points: 1,
        options: [
          { id: "a", text: "", isCorrect: false },
          { id: "b", text: "", isCorrect: false },
          { id: "c", text: "", isCorrect: false },
          { id: "d", text: "", isCorrect: false },
        ],
      });
      toast({ title: "Question added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add question", description: error.message, variant: "destructive" });
    },
  });
  
  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuestionFormData> }) => {
      return apiRequest("PATCH", `/api/tests/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests', selectedTest?.id] });
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      toast({ title: "Question updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update question", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tests/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests', selectedTest?.id] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete question", description: error.message, variant: "destructive" });
    },
  });
  
  // Assign test mutation
  const assignTestMutation = useMutation({
    mutationFn: async ({ testId, studentIds, classId, dueDate }: { testId: string; studentIds?: string[]; classId?: string; dueDate?: string }) => {
      return apiRequest("POST", `/api/tests/${testId}/assign`, { studentIds, classId, dueDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests', selectedTest?.id, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'tests'] });
      setIsAssignDialogOpen(false);
      toast({ title: "Test assigned successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to assign test", description: error.message, variant: "destructive" });
    },
  });
  
  const handleOpenTestDialog = (test?: Test) => {
    if (test) {
      setEditingTest(test);
      testForm.reset({
        title: test.title,
        description: test.description || "",
        subject: test.subject || "",
        classId: test.classId || undefined,
        duration: test.duration || undefined,
        passingScore: test.passingScore || undefined,
        allowRetakes: test.allowRetakes || false,
        showResultsImmediately: test.showResultsImmediately ?? true,
        shuffleQuestions: test.shuffleQuestions || false,
        dueDate: test.dueDate ? format(new Date(test.dueDate), "yyyy-MM-dd'T'HH:mm") : undefined,
      });
    } else {
      setEditingTest(null);
      testForm.reset();
    }
    setIsTestDialogOpen(true);
  };
  
  const handleTestSubmit = (data: TestFormData) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };
    
    if (editingTest) {
      updateTestMutation.mutate({ id: editingTest.id, data: formattedData });
    } else {
      createTestMutation.mutate(formattedData);
    }
  };
  
  const handleOpenQuestionDialog = (question?: TestQuestion) => {
    if (question) {
      setEditingQuestion(question);
      questionForm.reset({
        questionType: question.questionType as any,
        questionText: question.questionText,
        questionNumber: question.questionNumber,
        points: question.points || 1,
        correctAnswer: question.correctAnswer || "",
        explanation: question.explanation || "",
        options: question.options as any || [
          { id: "a", text: "", isCorrect: false },
          { id: "b", text: "", isCorrect: false },
          { id: "c", text: "", isCorrect: false },
          { id: "d", text: "", isCorrect: false },
        ],
      });
    } else {
      setEditingQuestion(null);
      const nextQuestionNumber = (selectedTest as any)?.questions?.length + 1 || 1;
      questionForm.reset({
        questionType: "multiple_choice",
        questionText: "",
        questionNumber: nextQuestionNumber,
        points: 1,
        options: [
          { id: "a", text: "", isCorrect: false },
          { id: "b", text: "", isCorrect: false },
          { id: "c", text: "", isCorrect: false },
          { id: "d", text: "", isCorrect: false },
        ],
      });
    }
    setIsQuestionDialogOpen(true);
  };
  
  const handleQuestionSubmit = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" data-testid="badge-status-draft">Draft</Badge>;
      case "published":
        return <Badge variant="default" className="bg-green-500" data-testid="badge-status-published">Published</Badge>;
      case "archived":
        return <Badge variant="secondary" data-testid="badge-status-archived">Archived</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-status-unknown">{status}</Badge>;
    }
  };
  
  const questionType = questionForm.watch("questionType");
  
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen" data-testid="loading-auth">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated || (user?.role !== "tutor" && user?.role !== "company_admin")) {
    return (
      <Layout>
        <div className="p-6" data-testid="unauthorized">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You must be a tutor or company admin to access this page.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="test-management-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">Tests & Exams</h1>
            <p className="text-muted-foreground">Create and manage assessments for your students</p>
          </div>
          <Button onClick={() => handleOpenTestDialog()} data-testid="button-create-test">
            <Plus className="mr-2 h-4 w-4" /> Create Test
          </Button>
        </div>
        
        {testsLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-tests">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <Card data-testid="no-tests">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tests Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first test to get started</p>
              <Button onClick={() => handleOpenTestDialog()} data-testid="button-create-first-test">
                <Plus className="mr-2 h-4 w-4" /> Create Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test.id} className="cursor-pointer hover:border-primary transition-colors" data-testid={`card-test-${test.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    {getStatusBadge(test.status)}
                  </div>
                  {test.subject && <CardDescription>{test.subject}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {test.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{test.totalPoints || 0} points</span>
                    </div>
                    {test.passingScore && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Pass: {test.passingScore}%</span>
                      </div>
                    )}
                  </div>
                  
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTest(test);
                      }}
                      data-testid={`button-manage-questions-${test.id}`}
                    >
                      <FileQuestion className="mr-1 h-4 w-4" /> Questions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTest(test);
                        setIsAssignDialogOpen(true);
                      }}
                      data-testid={`button-assign-${test.id}`}
                    >
                      <Users className="mr-1 h-4 w-4" /> Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenTestDialog(test)}
                      data-testid={`button-edit-${test.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this test?")) {
                          deleteTestMutation.mutate(test.id);
                        }
                      }}
                      data-testid={`button-delete-${test.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Test Creation/Edit Dialog */}
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title">{editingTest ? "Edit Test" : "Create New Test"}</DialogTitle>
              <DialogDescription>
                {editingTest ? "Update your test details" : "Set up a new test or exam for your students"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...testForm}>
              <form onSubmit={testForm.handleSubmit(handleTestSubmit)} className="space-y-4">
                <FormField
                  control={testForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chapter 5 Quiz" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={testForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the test content and instructions..." {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={testForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mathematics" {...field} data-testid="input-subject" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-class">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={testForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 60" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Score (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 70" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-passing-score"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={testForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-due-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormField
                    control={testForm.control}
                    name="allowRetakes"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Retakes</FormLabel>
                          <FormDescription>Students can take this test multiple times</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-retakes" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="showResultsImmediately"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Show Results Immediately</FormLabel>
                          <FormDescription>Students see their score right after submission</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-results" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="shuffleQuestions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Shuffle Questions</FormLabel>
                          <FormDescription>Randomize question order for each student</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-shuffle" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsTestDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTestMutation.isPending || updateTestMutation.isPending}
                    data-testid="button-submit"
                  >
                    {(createTestMutation.isPending || updateTestMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingTest ? "Update Test" : "Create Test"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Question Management Section */}
        {selectedTest && (
          <QuestionManagementSection
            test={selectedTest}
            onAddQuestion={() => handleOpenQuestionDialog()}
            onEditQuestion={handleOpenQuestionDialog}
            onDeleteQuestion={(id) => deleteQuestionMutation.mutate(id)}
            onClose={() => setSelectedTest(null)}
          />
        )}
        
        {/* Question Creation/Edit Dialog */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
              <DialogDescription>
                {editingQuestion ? "Update the question details" : "Add a new question to the test"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...questionForm}>
              <form onSubmit={questionForm.handleSubmit(handleQuestionSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={questionForm.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-question-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                            <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={questionForm.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-points"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={questionForm.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your question..." {...field} data-testid="input-question-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(questionType === "multiple_choice" || questionType === "true_false") && (
                  <div className="space-y-4">
                    <FormLabel>Answer Options</FormLabel>
                    {questionType === "true_false" ? (
                      <div className="space-y-2">
                        {[
                          { id: "true", text: "True" },
                          { id: "false", text: "False" },
                        ].map((option, index) => (
                          <div key={option.id} className="flex items-center gap-2 p-3 border rounded">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={questionForm.watch("options")?.[0]?.isCorrect === (option.id === "true")}
                              onChange={() => {
                                questionForm.setValue("options", [
                                  { id: "true", text: "True", isCorrect: option.id === "true" },
                                  { id: "false", text: "False", isCorrect: option.id === "false" },
                                ]);
                              }}
                              data-testid={`radio-option-${option.id}`}
                            />
                            <span className="flex-1">{option.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {questionForm.watch("options")?.map((option, index) => (
                          <div key={option.id} className="flex items-center gap-2 p-3 border rounded">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={option.isCorrect}
                              onChange={() => {
                                const options = questionForm.getValues("options") || [];
                                const updated = options.map((o, i) => ({
                                  ...o,
                                  isCorrect: i === index,
                                }));
                                questionForm.setValue("options", updated);
                              }}
                              data-testid={`radio-option-${index}`}
                            />
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              value={option.text}
                              onChange={(e) => {
                                const options = questionForm.getValues("options") || [];
                                const updated = [...options];
                                updated[index] = { ...updated[index], text: e.target.value };
                                questionForm.setValue("options", updated);
                              }}
                              className="flex-1"
                              data-testid={`input-option-${index}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {(questionType === "short_answer" || questionType === "fill_blank") && (
                  <FormField
                    control={questionForm.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the correct answer..." {...field} data-testid="input-correct-answer" />
                        </FormControl>
                        <FormDescription>For fill-in-the-blank, this will be used for auto-grading</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={questionForm.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explain why this is the correct answer..." {...field} data-testid="input-explanation" />
                      </FormControl>
                      <FormDescription>Shown to students after grading</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsQuestionDialogOpen(false)} data-testid="button-cancel-question">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                    data-testid="button-submit-question"
                  >
                    {(createQuestionMutation.isPending || updateQuestionMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Assign Test Dialog */}
        <AssignTestDialog
          test={selectedTest}
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          classes={classes}
          onAssign={(data) => {
            if (selectedTest) {
              assignTestMutation.mutate({ testId: selectedTest.id, ...data });
            }
          }}
          isPending={assignTestMutation.isPending}
        />
      </div>
    </Layout>
  );
}

// Question Management Section Component
function QuestionManagementSection({
  test,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onClose,
}: {
  test: Test;
  onAddQuestion: () => void;
  onEditQuestion: (question: TestQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onClose: () => void;
}) {
  const { data: testWithQuestions } = useQuery({
    queryKey: ['/api/tests', test.id],
    enabled: !!test.id,
  });
  
  const questions = (testWithQuestions as any)?.questions || [];
  
  return (
    <Card data-testid="question-management-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Questions for: {test.title}</CardTitle>
          <CardDescription>
            {questions.length} question{questions.length !== 1 ? "s" : ""} - Total: {test.totalPoints || 0} points
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddQuestion} size="sm" data-testid="button-add-question">
            <Plus className="mr-1 h-4 w-4" /> Add Question
          </Button>
          <Button variant="outline" onClick={onClose} size="sm" data-testid="button-close-questions">
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="no-questions">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions yet. Add your first question to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question: TestQuestion, index: number) => (
              <div
                key={question.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                data-testid={`question-item-${question.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Q{question.questionNumber}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.questionType.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.points || 1} pt{(question.points || 1) !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-sm">{question.questionText}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditQuestion(question)}
                    data-testid={`button-edit-question-${question.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this question?")) {
                        onDeleteQuestion(question.id);
                      }
                    }}
                    data-testid={`button-delete-question-${question.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Assign Test Dialog Component
function AssignTestDialog({
  test,
  isOpen,
  onClose,
  classes,
  onAssign,
  isPending,
}: {
  test: Test | null;
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  onAssign: (data: { classId?: string; studentIds?: string[]; dueDate?: string }) => void;
  isPending: boolean;
}) {
  const [assignmentType, setAssignmentType] = useState<"class" | "students">("class");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assignmentType === "class" && selectedClassId) {
      onAssign({ classId: selectedClassId, dueDate: dueDate || undefined });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid="assign-dialog-title">Assign Test: {test?.title}</DialogTitle>
          <DialogDescription>
            Assign this test to a class or individual students
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <Select value={assignmentType} onValueChange={(v) => setAssignmentType(v as any)}>
              <SelectTrigger data-testid="select-assignment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Entire Class</SelectItem>
                <SelectItem value="students" disabled>Individual Students (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {assignmentType === "class" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger data-testid="select-assign-class">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date (Optional)</label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="input-assign-due-date"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-assign">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || (assignmentType === "class" && !selectedClassId)}
              data-testid="button-confirm-assign"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Test
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
