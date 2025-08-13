import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function AcademicManagement({ companyId, companyName }: AcademicManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'years' | 'terms' | 'classes'>('overview');
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  // Debug log
  console.log('AcademicManagement component loaded with:', { companyId, companyName });

  // Fetch academic years
  const { data: academicYears = [], isLoading: yearsLoading, error: yearsError } = useQuery({
    queryKey: [`/api/companies/${companyId}/academic-years`],
    enabled: !!companyId,
  });

  // Fetch academic terms
  const { data: academicTerms = [], isLoading: termsLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/academic-terms`],
    enabled: !!companyId && activeTab === 'terms',
  });

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/classes`],
    enabled: !!companyId && activeTab === 'classes',
  });

  // Fetch hierarchical structure for overview
  const { data: academicHierarchy = [], isLoading: hierarchyLoading } = useQuery<AcademicYear[]>({
    queryKey: [`/api/companies/${companyId}/academic-hierarchy`],
    enabled: !!companyId && activeTab === 'overview',
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
                        <div>
                          <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {year.name}
                          </CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-200">
                            Year {year.yearNumber} • {year.terms?.length || 0} Terms
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
                                  <div>
                                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {term.name}
                                    </CardTitle>
                                    <CardDescription>
                                      {term.startDate && term.endDate ? (
                                        `${format(new Date(term.startDate), 'MMM dd, yyyy')} - ${format(new Date(term.endDate), 'MMM dd, yyyy')}`
                                      ) : 'Dates not set'} • {term.classes?.length || 0} Classes
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
                                              {cls.daysOfWeek && cls.daysOfWeek.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                  {cls.daysOfWeek.map((day) => (
                                                    <Badge key={day} variant="outline" className="text-xs px-1 py-0">
                                                      {day.slice(0, 3)}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              )}
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Academic Year
            </Button>
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
                      <div>
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                          {year.name}
                        </CardTitle>
                        <CardDescription>
                          Year {year.yearNumber}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Terms</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Term
            </Button>
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
                      <div>
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                          {term.name}
                        </CardTitle>
                        <CardDescription>
                          Term {term.termNumber}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Classes</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>

          {classesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {(classes as Class[]).map((classItem: Class) => (
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
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            Manage Students
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}