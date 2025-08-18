import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Class {
  id: string;
  companyId: string;
  termId: string;
  tutorId: string | null;
  name: string;
  subject: string;
  description: string | null;
  maxStudents: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicTerm {
  id: string;
  academicYearId: string;
  companyId: string;
  name: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classes: Class[];
}

interface AcademicYear {
  id: string;
  companyId: string;
  yearNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  terms: AcademicTerm[];
}

interface AcademicManagementProps {
  companyId: string;
  companyName: string;
}

// Form schemas
const academicYearSchema = z.object({
  yearNumber: z.number().min(1).max(12),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const academicTermSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const classSchema = z.object({
  termId: z.string().min(1, "Term is required"),
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  dayOfWeek: z.number().int().min(0).max(6), // Changed from daysOfWeek array to single dayOfWeek number
  maxStudents: z.number().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;
type AcademicTermFormData = z.infer<typeof academicTermSchema>;
type ClassFormData = z.infer<typeof classSchema>;

export default function AcademicManagement({ companyId, companyName }: AcademicManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'years' | 'terms' | 'classes'>('overview');
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  // Dialog states
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [isAddTermOpen, setIsAddTermOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentToClassOpen, setIsAddStudentToClassOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<string | null>(null);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);

  // Form instances
  const yearForm = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      yearNumber: 1,
      name: '',
      description: '',
    },
  });

  const termForm = useForm<AcademicTermFormData>({
    resolver: zodResolver(academicTermSchema),
    defaultValues: {
      academicYearId: '',
      name: '',
      startDate: '',
      endDate: '',
    },
  });

  const classForm = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      termId: '',
      name: '',
      subject: '',
      startTime: '',
      endTime: '',
      dayOfWeek: undefined, // Initialize as undefined or a default day
      maxStudents: 20,
      description: '',
      location: '',
    },
  });

  // Function to handle year selection - switches to terms tab and filters by year
  const handleYearClick = (yearId: string, yearName: string) => {
    setSelectedYearId(yearId);
    setSelectedTermId(null); // Reset term selection
    setActiveTab('terms');
  };

  // Function to handle term selection - switches to classes tab and filters by term
  const handleTermClick = (termId: string, termName: string) => {
    setSelectedTermId(termId);
    setActiveTab('classes');
  };

  // Create mutations
  const createYearMutation = useMutation({
    mutationFn: async (data: AcademicYearFormData) => {
      return await apiRequest(`/api/companies/${companyId}/academic-years`, 'POST', {
        ...data,
        companyId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Academic year created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-years`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setIsAddYearOpen(false);
      yearForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic year",
        variant: "destructive",
      });
    },
  });

  const createTermMutation = useMutation({
    mutationFn: async (data: AcademicTermFormData) => {
      return await apiRequest(`/api/companies/${companyId}/academic-terms`, 'POST', {
        ...data,
        companyId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Academic term created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setIsAddTermOpen(false);
      termForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic term",
        variant: "destructive",
      });
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      // Transform the data to match the expected schema
      const classData = {
        ...data,
        companyId,
        // Convert single dayOfWeek to daysOfWeek array for the backend
        daysOfWeek: data.dayOfWeek !== undefined ? [data.dayOfWeek] : [],
        dayOfWeek: data.dayOfWeek, // Keep for backwards compatibility
      };
      return await apiRequest(`/api/companies/${companyId}/classes`, 'POST', classData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setIsAddClassOpen(false);
      classForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });

  // Assign student to class mutation
  const assignStudentToClassMutation = useMutation({
    mutationFn: async ({ studentId, classId }: { studentId: string; classId: string }) => {
      setAssigningStudentId(studentId);
      return await apiRequest(`/api/students/${studentId}`, 'PATCH', {
        classId,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Student assigned to class successfully",
      });
      // Force refetch of students data to show updated assignments
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      // Force a fresh refetch
      refetchStudents();
      setAssigningStudentId(null);
      setIsAddStudentToClassOpen(false);
      setSelectedClassForStudents(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign student to class",
        variant: "destructive",
      });
      setAssigningStudentId(null);
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      if (!editingClass) throw new Error("No class selected for editing");
      // Transform the data to match the expected schema
      const classData = {
        ...data,
        companyId,
        // Convert single dayOfWeek to daysOfWeek array for the backend
        daysOfWeek: data.dayOfWeek !== undefined ? [data.dayOfWeek] : [],
        dayOfWeek: data.dayOfWeek, // Keep for backwards compatibility
      };
      return await apiRequest(`/api/companies/${companyId}/classes/${editingClass.id}`, 'PUT', classData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setIsEditClassOpen(false);
      setEditingClass(null);
      classForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update class",
        variant: "destructive",
      });
    },
  });

  // Fetch academic years
  const { data: academicYears = [], isLoading: yearsLoading, error: yearsError } = useQuery({
    queryKey: [`/api/companies/${companyId}/academic-years`],
    enabled: !!companyId,
  });

  // Fetch academic terms (with optional year filter)
  const { data: academicTerms = [], isLoading: termsLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/academic-terms`, selectedYearId],
    queryFn: () => {
      const url = selectedYearId 
        ? `/api/companies/${companyId}/academic-terms?yearId=${selectedYearId}`
        : `/api/companies/${companyId}/academic-terms`;
      return fetch(url).then(res => res.json());
    },
    enabled: !!companyId, // Always enabled to populate the dropdown in dialogs
  });

  // Fetch classes (with optional term filter)
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/classes`, selectedTermId],
    queryFn: () => {
      const url = selectedTermId 
        ? `/api/companies/${companyId}/classes?termId=${selectedTermId}`
        : `/api/companies/${companyId}/classes`;
      return fetch(url).then(res => res.json());
    },
    enabled: !!companyId && activeTab === 'classes',
  });

  // Fetch hierarchical structure for overview
  const { data: academicHierarchy = [], isLoading: hierarchyLoading } = useQuery<AcademicYear[]>({
    queryKey: [`/api/companies/${companyId}/academic-hierarchy`],
    enabled: !!companyId && activeTab === 'overview',
  });

  // Fetch active students for the company
  const { data: activeStudents = [], isLoading: studentsLoading, refetch: refetchStudents } = useQuery({
    queryKey: [`/api/companies/${companyId}/students`],
    enabled: !!companyId,  // Enable for all tabs so student assignments are always visible
    staleTime: 0, // Always refetch fresh data
    gcTime: 0, // Don't cache
  });

  // Debug logs after all queries are defined
  console.log('AcademicManagement component loaded with:', { companyId, companyName });
  console.log('Academic terms data:', { academicTerms, termsLoading, isArray: Array.isArray(academicTerms) });

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage academic years, terms, and classes for {companyName}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'years'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Academic Years
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'terms'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Terms
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'classes'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Classes
        </button>
      </div>

      {/* Overview Tab - Hierarchical Structure */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Structure Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hierarchical view: Years → Terms → Classes
            </p>
          </div>

          {hierarchyLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {academicHierarchy.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Academic Structure Found</h3>
                    <p className="text-sm">Create academic years, terms, and classes using the individual tabs above.</p>
                  </div>
                </Card>
              ) : (
                academicHierarchy.map((year) => (
                  <Card key={year.id} className="border-2 border-blue-100 dark:border-blue-900">
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div 
                          className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 p-2 rounded-md transition-colors"
                          onClick={() => handleYearClick(year.id, year.name)}
                          title="Click to view terms for this year"
                        >
                          <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {year.name}
                          </CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-200">
                            Year {year.yearNumber} • {year.terms?.length || 0} Terms • Click to view terms
                          </CardDescription>
                        </div>
                        <Badge variant={year.isActive ? "default" : "secondary"}>
                          {year.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {year.terms && year.terms.length > 0 ? (
                        <div className="space-y-4">
                          {year.terms.map((term) => (
                            <Card key={term.id} className="border border-gray-200 dark:border-gray-700">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors flex-1"
                                    onClick={() => handleTermClick(term.id, term.name)}
                                    title="Click to view classes for this term"
                                  >
                                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {term.name}
                                    </CardTitle>
                                    <CardDescription>
                                      {term.startDate && term.endDate ? (
                                        `${format(new Date(term.startDate), 'MMM dd, yyyy')} - ${format(new Date(term.endDate), 'MMM dd, yyyy')}`
                                      ) : 'Dates not set'} • {term.classes?.length || 0} Classes • Click to view classes
                                    </CardDescription>
                                  </div>
                                  <Badge variant={term.isActive ? "default" : "secondary"}>
                                    {term.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              {term.classes && term.classes.length > 0 && (
                                <CardContent className="pt-0">
                                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {term.classes.map((cls) => (
                                      <Card key={cls.id} className="border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                              <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                                                <BookOpen className="w-3 h-3 mr-1 flex-shrink-0" />
                                                {cls.name}
                                              </h4>
                                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                                {cls.subject}
                                              </p>
                                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                              </div>
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                  {getDayName(cls.dayOfWeek)}
                                                </Badge>
                                              </div>
                                            </div>
                                            <Badge variant={cls.isActive ? "default" : "secondary"} className="text-xs">
                                              {cls.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No terms found for this academic year</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Academic Years Tab */}
      {activeTab === 'years' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Years</h2>
            <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Academic Year
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {yearsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : yearsError ? (
            <div className="flex justify-center py-8">
              <p className="text-red-600 dark:text-red-400">
                Error loading academic years: {(yearsError as Error).message}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(academicYears as AcademicYear[]).map((year: AcademicYear) => (
                <Card key={year.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors flex-1"
                        onClick={() => handleYearClick(year.id, year.name)}
                        title="Click to view terms for this year"
                      >
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                          {year.name}
                        </CardTitle>
                        <CardDescription>
                          Year {year.yearNumber} • Click to view terms
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {year.startDate && year.endDate ? (
                          `${format(new Date(year.startDate), 'MMM dd, yyyy')} - ${format(new Date(year.endDate), 'MMM dd, yyyy')}`
                        ) : 'Dates not set'}
                      </div>
                      <Badge variant={year.isActive ? "default" : "secondary"}>
                        {year.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Academic Terms Tab */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Terms</h2>
              {selectedYearId && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Filtered by academic year • <button 
                    onClick={() => setSelectedYearId(null)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Show all terms
                  </button>
                </p>
              )}
            </div>
            <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Term
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {termsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(academicTerms as AcademicTerm[]).map((term: AcademicTerm) => (
                <Card key={term.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors flex-1"
                        onClick={() => handleTermClick(term.id, term.name)}
                        title="Click to view classes for this term"
                      >
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                          {term.name}
                        </CardTitle>
                        <CardDescription>
                          Term {term.termNumber} • Click to view classes
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {term.startDate && term.endDate ? (
                          `${format(new Date(term.startDate), 'MMM dd')} - ${format(new Date(term.endDate), 'MMM dd, yyyy')}`
                        ) : 'Dates not set'}
                      </div>
                      <Badge variant={term.isActive ? "default" : "secondary"}>
                        {term.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Classes</h2>
              {selectedTermId && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Filtered by academic term • <button 
                    onClick={() => setSelectedTermId(null)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Show all classes
                  </button>
                </p>
              )}
            </div>
            <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {classesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(classes) && classes.map((classItem: Class) => (
                <Card key={classItem.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                          {classItem.name}
                        </CardTitle>
                        <CardDescription>
                          {classItem.subject}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingClass(classItem);
                              setIsEditClassOpen(true);
                              // Pre-populate the edit form
                              classForm.reset({
                                termId: classItem.termId,
                                name: classItem.name,
                                subject: classItem.subject,
                                startTime: classItem.startTime,
                                endTime: classItem.endTime,
                                dayOfWeek: classItem.dayOfWeek, // Use dayOfWeek directly
                                maxStudents: classItem.maxStudents,
                                description: classItem.description || '',
                                location: classItem.location || '',
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedClassForStudents(classItem.id);
                              setIsAddStudentToClassOpen(true);
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Add Student
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          {getDayName(classItem.dayOfWeek)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Users className="w-4 h-4 mr-2" />
                          Max {classItem.maxStudents} students
                        </div>
                        {classItem.location && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {classItem.location}
                          </div>
                        )}
                      </div>
                      {classItem.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {classItem.description}
                        </p>
                      )}
                      <Badge variant={classItem.isActive ? "default" : "secondary"}>
                        {classItem.isActive ? "Active" : "Inactive"}
                      </Badge>

                      {/* Show assigned students */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {(() => {
                          // Ensure activeStudents is an array and handle the filtering safely
                          const studentsArray = Array.isArray(activeStudents) ? activeStudents : [];
                          const assignedStudents = studentsArray.filter((student: any) => student.classId === classItem.id);
                          console.log('Debug - Class ID:', classItem.id);
                          console.log('Debug - All students:', studentsArray);
                          console.log('Debug - Student data structure sample:', studentsArray[0]);
                          console.log('Debug - Student names:', studentsArray.map(s => `${s.user?.firstName} ${s.user?.lastName} (classId: ${s.classId})`));
                          console.log('Debug - Class IDs in students:', studentsArray.map(s => s.classId));
                          console.log('Debug - Assigned students for this class:', assignedStudents);
                          return (
                            <>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <Users className="w-4 h-4 mr-2" />
                                <span>Assigned Students ({assignedStudents.length})</span>
                              </div>
                              <div className="space-y-1">
                                {assignedStudents.slice(0, 3).map((student: any) => (
                                  <div key={student.id} className="text-xs text-gray-500 dark:text-gray-400">
                                    • {student.user?.firstName} {student.user?.lastName} (ID: {student.classId})
                                  </div>
                                ))}
                                {assignedStudents.length > 3 && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    +{assignedStudents.length - 3} more
                                  </div>
                                )}
                                {assignedStudents.length === 0 && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    No students assigned (Debug: Total students: {studentsArray.length}, Class ID: {classItem.id})
                                    <br />
                                    <span>All students: {studentsArray.map(s => `${s.user?.firstName || 'N/A'} ${s.user?.lastName || 'N/A'} (${s.classId || 'no class'})`).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Academic Year Dialog */}
      <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Academic Year</DialogTitle>
            <DialogDescription>
              Create a new academic year for {companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...yearForm}>
            <form onSubmit={yearForm.handleSubmit((data) => createYearMutation.mutate(data))} className="space-y-4">
              <FormField
                control={yearForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Year 1, Grade 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="yearNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="12" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of this academic year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddYearOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createYearMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createYearMutation.isPending ? 'Creating...' : 'Create Year'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Academic Term Dialog */}
      <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Academic Term</DialogTitle>
            <DialogDescription>
              Create a new academic term for {companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...termForm}>
            <form onSubmit={termForm.handleSubmit((data) => createTermMutation.mutate(data))} className="space-y-4">
              <FormField
                control={termForm.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an academic year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(academicYears as AcademicYear[]).map((year) => (
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
                control={termForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Term 1, Fall Semester" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={termForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTermOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTermMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createTermMutation.isPending ? 'Creating...' : 'Create Term'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
            <DialogDescription>
              Create a new class for {companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...classForm}>
            <form onSubmit={classForm.handleSubmit((data) => createClassMutation.mutate(data))} className="space-y-4">
              <FormField
                control={classForm.control}
                name="termId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an academic term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {termsLoading ? (
                          <SelectItem value="" disabled>
                            Loading terms...
                          </SelectItem>
                        ) : Array.isArray(academicTerms) && academicTerms.length > 0 ? (
                          academicTerms.map((term: AcademicTerm) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No terms available - Please create an academic term first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Updated dayOfWeek selection */}
              <FormField
                control={classForm.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the class" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 101, Online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="maxStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="20"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddClassOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Student to Class Dialog */}
      <Dialog open={isAddStudentToClassOpen} onOpenChange={setIsAddStudentToClassOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Student to Class</DialogTitle>
            <DialogDescription>
              Select a student to add to this class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!Array.isArray(activeStudents) || activeStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active students available</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(Array.isArray(activeStudents) ? activeStudents : []).map((student: any) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student.user?.firstName} {student.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.user?.email}
                      </div>
                      {student.schoolName && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {student.schoolName}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedClassForStudents) {
                          assignStudentToClassMutation.mutate({
                            studentId: student.id,
                            classId: selectedClassForStudents,
                          });
                        }
                      }}
                      disabled={assigningStudentId === student.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {assigningStudentId === student.id ? 'Adding...' : 'Add to Class'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddStudentToClassOpen(false);
                  setSelectedClassForStudents(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the class information for {companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...classForm}>
            <form onSubmit={classForm.handleSubmit((data) => updateClassMutation.mutate(data))} className="space-y-4">
              <FormField
                control={classForm.control}
                name="termId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an academic term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(academicTerms as AcademicTerm[]).map((term) => (
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Updated dayOfWeek selection for editing */}
              <FormField
                control={classForm.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the class" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 101, Online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={classForm.control}
                name="maxStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="20"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditClassOpen(false);
                    setEditingClass(null);
                    classForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateClassMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateClassMutation.isPending ? 'Updating...' : 'Update Class'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}