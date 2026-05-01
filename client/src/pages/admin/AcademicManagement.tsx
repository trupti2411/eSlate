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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Trash2,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Archive,
  Zap,
  ChevronDown,
  ChevronRight,
  MapPin,
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
  const [isViewEnrolledStudentsOpen, setIsViewEnrolledStudentsOpen] = useState(false);
  const [selectedClassForViewing, setSelectedClassForViewing] = useState<Class | null>(null);
  const [enrollmentConflict, setEnrollmentConflict] = useState<{
    studentId: string;
    classId: string;
    message: string;
    conflicts: string[];
  } | null>(null);

  // Auto-setup state
  const [isAutoSetupOpen, setIsAutoSetupOpen] = useState(false);
  const [autoSetupYearId, setAutoSetupYearId] = useState('');
  const [autoSetupDivision, setAutoSetupDivision] = useState<'Eastern' | 'Western'>('Eastern');
  const [termWeeks, setTermWeeks] = useState<Record<string, any[]>>({});
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  const [loadingWeeks, setLoadingWeeks] = useState<Record<string, boolean>>({});

  // Search, filter, and sort states for Academic Years
  const [yearSearch, setYearSearch] = useState('');
  const [yearStatusFilter, setYearStatusFilter] = useState<string>('all');
  const [yearSortBy, setYearSortBy] = useState<'name' | 'yearNumber'>('yearNumber');
  const [yearSortOrder, setYearSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search, filter, and sort states for Terms
  const [termSearch, setTermSearch] = useState('');
  const [termStatusFilter, setTermStatusFilter] = useState<string>('all');
  const [termSortBy, setTermSortBy] = useState<'name' | 'termNumber' | 'startDate'>('termNumber');
  const [termSortOrder, setTermSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search, filter, and sort states for Classes
  const [classSearch, setClassSearch] = useState('');
  const [classStatusFilter, setClassStatusFilter] = useState<string>('all');
  const [classDayFilter, setClassDayFilter] = useState<string>('all');
  const [classSortBy, setClassSortBy] = useState<'name' | 'subject' | 'dayOfWeek'>('name');
  const [classSortOrder, setClassSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const deleteYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      return await apiRequest(`/api/companies/${companyId}/academic-years/${yearId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Academic year deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-years`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete academic year",
        variant: "destructive",
      });
    },
  });

  const handleDeleteYear = (yearId: string, yearName: string) => {
    if (confirm(`Are you sure you want to delete "${yearName}"? This will also delete all terms and classes under this year.`)) {
      deleteYearMutation.mutate(yearId);
    }
  };

  // Auto-setup mutation
  const autoSetupMutation = useMutation({
    mutationFn: async (data: { yearId: string; state: string; division: string }) => {
      return await apiRequest(`/api/companies/${companyId}/academic-auto-setup`, 'POST', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Calendar Created",
        description: data.message || "NSW 2026 academic calendar set up successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setIsAutoSetupOpen(false);
      setAutoSetupYearId('');
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to auto-setup academic calendar",
        variant: "destructive",
      });
    },
  });

  // Fetch weeks for a term (lazy load on expand)
  const fetchTermWeeks = async (termId: string) => {
    if (termWeeks[termId]) {
      setExpandedTerms(prev => ({ ...prev, [termId]: !prev[termId] }));
      return;
    }
    setLoadingWeeks(prev => ({ ...prev, [termId]: true }));
    try {
      const res = await fetch(`/api/companies/${companyId}/academic-weeks?termId=${termId}`, { credentials: 'include' });
      const data = await res.json();
      setTermWeeks(prev => ({ ...prev, [termId]: data }));
      setExpandedTerms(prev => ({ ...prev, [termId]: true }));
    } catch {
      // silently fail
    } finally {
      setLoadingWeeks(prev => ({ ...prev, [termId]: false }));
    }
  };

  // NSW 2026 preview data (for dialog preview)
  const NSW_2026_PREVIEW = {
    Eastern: [
      { name: "Term 1", start: "27 Jan", end: "1 Apr", weeks: 10 },
      { name: "Term 2", start: "28 Apr", end: "4 Jul", weeks: 10 },
      { name: "Term 3", start: "21 Jul", end: "26 Sep", weeks: 10 },
      { name: "Term 4", start: "13 Oct", end: "19 Dec", weeks: 10 },
    ],
    Western: [
      { name: "Term 1", start: "3 Feb", end: "1 Apr", weeks: 9 },
      { name: "Term 2", start: "28 Apr", end: "4 Jul", weeks: 10 },
      { name: "Term 3", start: "21 Jul", end: "26 Sep", weeks: 10 },
      { name: "Term 4", start: "13 Oct", end: "19 Dec", weeks: 10 },
    ],
  };

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

  // Assign student to class mutation (uses new enrollment API)
  const assignStudentToClassMutation = useMutation({
    mutationFn: async ({ studentId, classId, ignoreConflicts }: { studentId: string; classId: string; ignoreConflicts?: boolean }) => {
      setAssigningStudentId(studentId);
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId, ignoreConflicts }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409 && data.requiresConfirmation) {
          throw { isConflict: true, studentId, classId, ...data };
        }
        throw new Error(data.message || 'Failed to enroll student');
      }
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Student enrolled in class successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/enrollments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/classes/${variables.classId}/students`] });
      refetchStudents();
      setAssigningStudentId(null);
      setEnrollmentConflict(null);
      setIsAddStudentToClassOpen(false);
    },
    onError: (error: any) => {
      setAssigningStudentId(null);
      if (error.isConflict) {
        setEnrollmentConflict({
          studentId: error.studentId,
          classId: error.classId,
          message: error.message,
          conflicts: error.conflicts || [],
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to enroll student in class",
        variant: "destructive",
      });
    },
  });

  const handleEnrollWithConflictOverride = () => {
    if (enrollmentConflict) {
      assignStudentToClassMutation.mutate({
        studentId: enrollmentConflict.studentId,
        classId: enrollmentConflict.classId,
        ignoreConflicts: true,
      });
    }
  };

  // Remove student from class mutation
  const removeStudentFromClassMutation = useMutation({
    mutationFn: async ({ studentId, classId }: { studentId: string; classId: string }) => {
      return await apiRequest(`/api/classes/${classId}/students/${studentId}`, 'DELETE');
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Student removed from class successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/students`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/enrollments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/classes/${variables.classId}/students`] });
      refetchStudents();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove student from class",
        variant: "destructive",
      });
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

  // State for archive/delete confirmations
  const [termToArchive, setTermToArchive] = useState<AcademicTerm | null>(null);
  const [termToDelete, setTermToDelete] = useState<AcademicTerm | null>(null);
  const [classToArchive, setClassToArchive] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Archive term mutation
  const archiveTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      return await apiRequest(`/api/companies/${companyId}/academic-terms/${termId}/archive`, 'PATCH');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Term archived successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setTermToArchive(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive term",
        variant: "destructive",
      });
    },
  });

  // Delete term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      return await apiRequest(`/api/companies/${companyId}/academic-terms/${termId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Term deleted permanently",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-terms`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setTermToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete term",
        variant: "destructive",
      });
    },
  });

  // Archive class mutation
  const archiveClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      return await apiRequest(`/api/companies/${companyId}/classes/${classId}/archive`, 'PATCH');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class archived successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setClassToArchive(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive class",
        variant: "destructive",
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      return await apiRequest(`/api/companies/${companyId}/classes/${classId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class deleted permanently",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/classes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/academic-hierarchy`] });
      setClassToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
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

  // Fetch enrolled students for a specific class (for dialog)
  const { data: enrolledStudents = [], isLoading: enrolledStudentsLoading } = useQuery({
    queryKey: [`/api/classes/${selectedClassForViewing?.id}/students`],
    enabled: !!selectedClassForViewing?.id && isViewEnrolledStudentsOpen,
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch all class enrollments for the company (for class cards)
  const { data: allEnrollments = {}, isLoading: enrollmentsLoading } = useQuery<Record<string, any[]>>({
    queryKey: [`/api/companies/${companyId}/enrollments`],
    enabled: !!companyId && activeTab === 'classes',
    staleTime: 30000, // Cache for 30 seconds
  });

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

  // Filter and sort functions for Academic Years
  const getFilteredAndSortedYears = () => {
    if (!Array.isArray(academicYears)) return [];
    
    let filtered = (academicYears as AcademicYear[]).filter((year) => {
      const matchesSearch = year.name.toLowerCase().includes(yearSearch.toLowerCase());
      const matchesStatus = yearStatusFilter === 'all' || 
        (yearStatusFilter === 'active' && year.isActive) ||
        (yearStatusFilter === 'inactive' && !year.isActive);
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (yearSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (yearSortBy === 'yearNumber') {
        comparison = a.yearNumber - b.yearNumber;
      }
      return yearSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Filter and sort functions for Terms
  const getFilteredAndSortedTerms = () => {
    if (!Array.isArray(academicTerms)) return [];
    
    let filtered = (academicTerms as AcademicTerm[]).filter((term) => {
      const matchesSearch = term.name.toLowerCase().includes(termSearch.toLowerCase());
      const matchesStatus = termStatusFilter === 'all' || 
        (termStatusFilter === 'active' && term.isActive) ||
        (termStatusFilter === 'inactive' && !term.isActive);
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (termSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (termSortBy === 'termNumber') {
        comparison = a.termNumber - b.termNumber;
      } else if (termSortBy === 'startDate') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return termSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Filter and sort functions for Classes
  const getFilteredAndSortedClasses = () => {
    if (!Array.isArray(classes)) return [];
    
    let filtered = (classes as Class[]).filter((classItem) => {
      const matchesSearch = classItem.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        classItem.subject.toLowerCase().includes(classSearch.toLowerCase());
      const matchesStatus = classStatusFilter === 'all' || 
        (classStatusFilter === 'active' && classItem.isActive) ||
        (classStatusFilter === 'inactive' && !classItem.isActive);
      const matchesDay = classDayFilter === 'all' || classItem.dayOfWeek === parseInt(classDayFilter);
      return matchesSearch && matchesStatus && matchesDay;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (classSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (classSortBy === 'subject') {
        comparison = a.subject.localeCompare(b.subject);
      } else if (classSortBy === 'dayOfWeek') {
        comparison = a.dayOfWeek - b.dayOfWeek;
      }
      return classSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
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
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {academicHierarchy.map((year) => (
                  <Card key={year.id} className="border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3 px-3 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-start justify-between gap-1">
                        <div 
                          className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors flex-1 min-w-0"
                          onClick={() => handleYearClick(year.id, year.name)}
                          title="Click to view terms for this year"
                        >
                          <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center truncate">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            {year.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-blue-700 dark:text-blue-200">
                            Year {year.yearNumber} • {year.terms?.length || 0} Terms
                          </CardDescription>
                        </div>
                        <Badge variant={year.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {year.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-2">
                      {year.terms && year.terms.length > 0 ? (
                        <div className="space-y-2">
                          {year.terms.slice(0, 3).map((term) => (
                            <div key={term.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-start justify-between gap-1">
                                <div 
                                  className="cursor-pointer flex-1 min-w-0"
                                  onClick={() => handleTermClick(term.id, term.name)}
                                  title="Click to view classes for this term"
                                >
                                  <p className="text-xs font-medium text-gray-900 dark:text-white flex items-center truncate">
                                    <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {term.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {term.classes?.length || 0} classes
                                  </p>
                                </div>
                                <Badge variant={term.isActive ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                                  {term.isActive ? "Active" : "Off"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {year.terms.length > 3 && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                              +{year.terms.length - 3} more terms
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                          <p className="text-[10px]">No terms</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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

          {/* Search, Filter, Sort Controls */}
          <Card className="border-2 border-black">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name..."
                      value={yearSearch}
                      onChange={(e) => setYearSearch(e.target.value)}
                      className="pl-9 border-black"
                      data-testid="input-year-search"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-sm font-medium mb-1 block">Status</Label>
                  <Select value={yearStatusFilter} onValueChange={setYearStatusFilter}>
                    <SelectTrigger className="border-black" data-testid="select-year-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="min-w-[120px]">
                    <Label className="text-sm font-medium mb-1 block">Sort By</Label>
                    <Select value={yearSortBy} onValueChange={(v) => setYearSortBy(v as 'name' | 'yearNumber')}>
                      <SelectTrigger className="border-black" data-testid="select-year-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearNumber">Year Number</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setYearSortOrder(yearSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="mt-5 px-2 border-black"
                    data-testid="button-year-sort-order"
                  >
                    {yearSortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing {getFilteredAndSortedYears().length} of {Array.isArray(academicYears) ? academicYears.length : 0} years
              </p>
            </CardContent>
          </Card>

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
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredAndSortedYears().map((year: AcademicYear) => (
                <Card key={year.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex justify-between items-start gap-1">
                      <div 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex-1 min-w-0"
                        onClick={() => handleYearClick(year.id, year.name)}
                        title="Click to view terms for this year"
                      >
                        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {year.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Year {year.yearNumber} • Click to view terms
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteYear(year.id, year.name)}
                            disabled={deleteYearMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        {year.startDate && year.endDate ? (
                          `${format(new Date(year.startDate), 'MMM d')} - ${format(new Date(year.endDate), 'MMM d, yyyy')}`
                        ) : 'Dates not set'}
                      </div>
                      <Badge variant={year.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => setIsAutoSetupOpen(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto-Setup NSW 2026
              </Button>
              <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Term
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>

          {/* Search, Filter, Sort Controls */}
          <Card className="border-2 border-black">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name..."
                      value={termSearch}
                      onChange={(e) => setTermSearch(e.target.value)}
                      className="pl-9 border-black"
                      data-testid="input-term-search"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-sm font-medium mb-1 block">Status</Label>
                  <Select value={termStatusFilter} onValueChange={setTermStatusFilter}>
                    <SelectTrigger className="border-black" data-testid="select-term-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="min-w-[130px]">
                    <Label className="text-sm font-medium mb-1 block">Sort By</Label>
                    <Select value={termSortBy} onValueChange={(v) => setTermSortBy(v as 'name' | 'termNumber' | 'startDate')}>
                      <SelectTrigger className="border-black" data-testid="select-term-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="termNumber">Term Number</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="startDate">Start Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTermSortOrder(termSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="mt-5 px-2 border-black"
                    data-testid="button-term-sort-order"
                  >
                    {termSortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing {getFilteredAndSortedTerms().length} of {Array.isArray(academicTerms) ? academicTerms.length : 0} terms
              </p>
            </CardContent>
          </Card>

          {termsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredAndSortedTerms().map((term: AcademicTerm) => (
                <Card key={term.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex justify-between items-start gap-1">
                      <div 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex-1 min-w-0"
                        onClick={() => handleTermClick(term.id, term.name)}
                        title="Click to view classes for this term"
                      >
                        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {term.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Term {term.termNumber} • Click to view classes
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTermToArchive(term)}
                            className="text-orange-600"
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setTermToDelete(term)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        {term.startDate && term.endDate ? (
                          `${format(new Date(term.startDate), 'MMM d')} - ${format(new Date(term.endDate), 'MMM d, yyyy')}`
                        ) : 'Dates not set'}
                      </div>
                      <Badge variant={term.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {term.isActive ? "Active" : "Archived"}
                      </Badge>
                      {/* Weeks toggle */}
                      <button
                        onClick={() => fetchTermWeeks(term.id)}
                        className="flex items-center text-[10px] text-blue-600 hover:text-blue-700 mt-1 gap-0.5"
                      >
                        {loadingWeeks[term.id] ? (
                          <span className="animate-pulse">Loading weeks…</span>
                        ) : expandedTerms[term.id] ? (
                          <><ChevronDown className="w-3 h-3" />Hide weeks</>
                        ) : (
                          <><ChevronRight className="w-3 h-3" />Show weeks</>
                        )}
                      </button>
                      {expandedTerms[term.id] && termWeeks[term.id] && (
                        <div className="mt-1.5 border rounded-md divide-y text-[10px] max-h-36 overflow-y-auto">
                          {termWeeks[term.id].length === 0 ? (
                            <p className="px-2 py-1 text-gray-400 italic">No weeks set up</p>
                          ) : termWeeks[term.id].map((w: any) => (
                            <div key={w.id} className="flex justify-between px-2 py-0.5">
                              <span className="font-medium text-gray-700">{w.name}</span>
                              <span className="text-gray-500">
                                {format(new Date(w.startDate), 'MMM d')} – {format(new Date(w.endDate), 'MMM d')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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

          {/* Search, Filter, Sort Controls */}
          <Card className="border-2 border-black">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or subject..."
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      className="pl-9 border-black"
                      data-testid="input-class-search"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-sm font-medium mb-1 block">Status</Label>
                  <Select value={classStatusFilter} onValueChange={setClassStatusFilter}>
                    <SelectTrigger className="border-black" data-testid="select-class-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-sm font-medium mb-1 block">Day</Label>
                  <Select value={classDayFilter} onValueChange={setClassDayFilter}>
                    <SelectTrigger className="border-black" data-testid="select-class-day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Days</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="min-w-[120px]">
                    <Label className="text-sm font-medium mb-1 block">Sort By</Label>
                    <Select value={classSortBy} onValueChange={(v) => setClassSortBy(v as 'name' | 'subject' | 'dayOfWeek')}>
                      <SelectTrigger className="border-black" data-testid="select-class-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="subject">Subject</SelectItem>
                        <SelectItem value="dayOfWeek">Day of Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClassSortOrder(classSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="mt-5 px-2 border-black"
                    data-testid="button-class-sort-order"
                  >
                    {classSortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing {getFilteredAndSortedClasses().length} of {Array.isArray(classes) ? classes.length : 0} classes
              </p>
            </CardContent>
          </Card>

          {classesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredAndSortedClasses().map((classItem: Class) => (
                <Card key={classItem.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {classItem.name}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">
                          {classItem.subject}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingClass(classItem);
                              setIsEditClassOpen(true);
                              classForm.reset({
                                termId: classItem.termId,
                                name: classItem.name,
                                subject: classItem.subject,
                                startTime: classItem.startTime,
                                endTime: classItem.endTime,
                                dayOfWeek: classItem.dayOfWeek,
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
                              setSelectedClassForViewing(classItem);
                              setIsViewEnrolledStudentsOpen(true);
                            }}
                            data-testid={`btn-manage-students-${classItem.id}`}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Manage Students
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              window.location.href = `/company/assignments?classId=${classItem.id}&className=${encodeURIComponent(classItem.name)}`;
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Create Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setClassToArchive(classItem)}
                            className="text-orange-600"
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setClassToDelete(classItem)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {getDayName(classItem.dayOfWeek)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(classItem.startTime)}-{formatTime(classItem.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>Max {classItem.maxStudents}</span>
                        {classItem.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{classItem.location}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={classItem.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {classItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {(() => {
                          const count = (allEnrollments[classItem.id] || []).length;
                          return count > 0 ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300">
                              {count} enrolled
                            </Badge>
                          ) : null;
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

      {/* Dialogs */}
      {/* Add Year Dialog */}
      <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Academic Year</DialogTitle>
            <DialogDescription>
              Create a new academic year for {companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...yearForm}>
            <form onSubmit={yearForm.handleSubmit((data) => createYearMutation.mutate(data))} className="space-y-4">
              <FormField
                control={yearForm.control}
                name="yearNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-year-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Year 7 - 2024" {...field} data-testid="input-year-name" />
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
                      <Input placeholder="Brief description..." {...field} data-testid="input-year-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddYearOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createYearMutation.isPending} data-testid="button-create-year">
                  {createYearMutation.isPending ? 'Creating...' : 'Create Year'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Term Dialog */}
      <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Academic Term</DialogTitle>
            <DialogDescription>
              Create a new term within an academic year.
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
                      <Input placeholder="e.g., Term 1, Spring Semester" {...field} data-testid="input-term-name" />
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
                        <Input type="date" {...field} data-testid="input-term-start-date" />
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
                        <Input type="date" {...field} data-testid="input-term-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddTermOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTermMutation.isPending} data-testid="button-create-term">
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
            <DialogTitle>Create Class</DialogTitle>
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
                        {!Array.isArray(academicTerms) ? (
                          <SelectItem value="loading" disabled>Loading terms...</SelectItem>
                        ) : Array.isArray(academicTerms) && academicTerms.length > 0 ? (
                          academicTerms.map((term: AcademicTerm) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No terms available</SelectItem>
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
                        <Input placeholder="e.g., Mathematics A" {...field} data-testid="input-class-name" />
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
                        <Input placeholder="e.g., Mathematics" {...field} data-testid="input-class-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={classForm.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
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
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-class-start-time" />
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
                        <Input type="time" {...field} data-testid="input-class-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          data-testid="input-class-max-students"
                        />
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
                        <Input placeholder="e.g., Room 101" {...field} data-testid="input-class-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={classForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief class description..." {...field} data-testid="input-class-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddClassOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createClassMutation.isPending} data-testid="button-create-class">
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
                        <Input placeholder="e.g., Mathematics A" {...field} />
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
              <FormField
                control={classForm.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={classForm.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
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
                        <Input placeholder="e.g., Room 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={classForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief class description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditClassOpen(false);
                  setEditingClass(null);
                  classForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateClassMutation.isPending}>
                  {updateClassMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Archive Term Confirmation */}
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
                          <SelectItem value="__loading__" disabled>
                            Loading terms...
                          </SelectItem>
                        ) : Array.isArray(academicTerms) && academicTerms.length > 0 ? (
                          academicTerms.map((term: AcademicTerm) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__none__" disabled>
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

      {/* Archive Term Confirmation */}
      <AlertDialog open={!!termToArchive} onOpenChange={() => setTermToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Term</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{termToArchive?.name}"? 
              The term will be marked as inactive but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => termToArchive && archiveTermMutation.mutate(termToArchive.id)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {archiveTermMutation.isPending ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Term Confirmation */}
      <AlertDialog open={!!termToDelete} onOpenChange={() => setTermToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Term Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{termToDelete?.name}"? 
              This will also delete all classes associated with this term. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => termToDelete && deleteTermMutation.mutate(termToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTermMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Class Confirmation */}
      <AlertDialog open={!!classToArchive} onOpenChange={() => setClassToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{classToArchive?.name}"? 
              The class will be marked as inactive but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => classToArchive && archiveClassMutation.mutate(classToArchive.id)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {archiveClassMutation.isPending ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Class Confirmation */}
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{classToDelete?.name}"? 
              This will also remove all student assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => classToDelete && deleteClassMutation.mutate(classToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteClassMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enrollment Conflict Warning */}
      <AlertDialog open={!!enrollmentConflict} onOpenChange={() => setEnrollmentConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-600">Schedule Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{enrollmentConflict?.message}</p>
              {enrollmentConflict?.conflicts && enrollmentConflict.conflicts.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-2">
                  <p className="font-medium text-orange-800 dark:text-orange-200 mb-2">Conflicting classes:</p>
                  <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-300">
                    {enrollmentConflict.conflicts.map((conflict, i) => (
                      <li key={i}>{conflict}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Do you want to proceed with enrollment anyway?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEnrollmentConflict(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnrollWithConflictOverride}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {assignStudentToClassMutation.isPending ? 'Enrolling...' : 'Proceed Anyway'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Enrolled Students Dialog */}
      <Dialog open={isViewEnrolledStudentsOpen} onOpenChange={setIsViewEnrolledStudentsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students in {selectedClassForViewing?.name}
            </DialogTitle>
            <DialogDescription>
              View and manage students enrolled in this class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {enrolledStudentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !Array.isArray(enrolledStudents) || enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No students enrolled in this class yet.</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (selectedClassForViewing) {
                      setSelectedClassForStudents(selectedClassForViewing.id);
                      setIsViewEnrolledStudentsOpen(false);
                      setIsAddStudentToClassOpen(true);
                    }
                  }}
                  data-testid="btn-add-first-student"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Students
                </Button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {enrolledStudents.map((enrollment: any) => (
                  <div 
                    key={enrollment.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid={`enrolled-student-${enrollment.student?.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {enrollment.student?.user?.email}
                      </div>
                      {enrollment.student?.gradeLevel && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Grade {enrollment.student.gradeLevel}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (selectedClassForViewing) {
                          removeStudentFromClassMutation.mutate({
                            studentId: enrollment.studentId,
                            classId: selectedClassForViewing.id,
                          });
                        }
                      }}
                      disabled={removeStudentFromClassMutation.isPending}
                      data-testid={`btn-remove-student-${enrollment.student?.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedClassForViewing) {
                    setSelectedClassForStudents(selectedClassForViewing.id);
                    setIsAddStudentToClassOpen(true);
                  }
                }}
                data-testid="btn-add-more-students"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Students
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewEnrolledStudentsOpen(false);
                  setSelectedClassForViewing(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Setup NSW 2026 Dialog */}
      <Dialog open={isAutoSetupOpen} onOpenChange={setIsAutoSetupOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Auto-Setup NSW 2026 Academic Calendar
            </DialogTitle>
            <DialogDescription>
              Creates Term 1–4 with official NSW Department of Education dates, plus weekly breakdowns for each term.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Year Level Selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Apply to Year Level</Label>
              <Select value={autoSetupYearId} onValueChange={setAutoSetupYearId}>
                <SelectTrigger className="border-black">
                  <SelectValue placeholder="Select a year level…" />
                </SelectTrigger>
                <SelectContent>
                  {(academicYears as AcademicYear[]).map((year) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-500">Terms will be created under this year level.</p>
            </div>

            {/* Division Selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                NSW Division
              </Label>
              <div className="flex gap-2">
                {(['Eastern', 'Western'] as const).map((div) => (
                  <button
                    key={div}
                    onClick={() => setAutoSetupDivision(div)}
                    className={`flex-1 py-1.5 text-sm rounded-md border font-medium transition-colors ${
                      autoSetupDivision === div
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {div} Division
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                {autoSetupDivision === 'Western'
                  ? 'Western Division: Term 1 starts Tue 3 Feb (one week later than Eastern).'
                  : 'Eastern Division: Term 1 starts Tue 27 Jan. Most Sydney/coastal schools.'}
              </p>
            </div>

            {/* Preview Table */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">What will be created</Label>
              <div className="border rounded-lg overflow-hidden text-sm">
                <div className="grid grid-cols-3 bg-gray-50 font-medium text-gray-600 text-xs px-3 py-1.5 border-b">
                  <span>Term</span>
                  <span>Dates</span>
                  <span>Weeks</span>
                </div>
                {NSW_2026_PREVIEW[autoSetupDivision].map((t) => (
                  <div key={t.name} className="grid grid-cols-3 px-3 py-1.5 border-b last:border-0 text-xs">
                    <span className="font-semibold text-gray-800">{t.name}</span>
                    <span className="text-gray-600">{t.start} – {t.end}</span>
                    <span className="text-green-700 font-medium">{t.weeks} weeks</span>
                  </div>
                ))}
                <div className="px-3 py-1.5 bg-green-50 text-xs text-green-800 font-medium">
                  Total: 4 terms · ~{NSW_2026_PREVIEW[autoSetupDivision].reduce((s, t) => s + t.weeks, 0)} weeks created
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Source: NSW Department of Education — education.nsw.gov.au/schooling/calendars/2026
              </p>
            </div>

            {!autoSetupYearId && (
              <p className="text-xs text-amber-600 font-medium">⚠ Select a year level to continue.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsAutoSetupOpen(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!autoSetupYearId || autoSetupMutation.isPending}
              onClick={() => autoSetupMutation.mutate({ yearId: autoSetupYearId, state: 'NSW', division: autoSetupDivision })}
            >
              {autoSetupMutation.isPending ? (
                <span className="flex items-center gap-1.5"><span className="animate-spin">⏳</span> Creating…</span>
              ) : (
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Create NSW 2026 Calendar</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}