import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, GraduationCap, Calendar, BookOpen, Save, X } from "lucide-react";

interface StudentProfileDialogProps {
  studentId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Student {
  id: string;
  userId: string;
  gradeLevel: string;
  schoolName: string;
  yearId: string;
  termId: string;
  classId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface AcademicTerm {
  id: string;
  name: string;
  yearId: string;
  startDate: string;
  endDate: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
  termId: string;
  tutorId: string;
  tutor: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export function StudentProfileDialog({ studentId, companyId, isOpen, onClose }: StudentProfileDialogProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    gradeLevel: "",
    schoolName: "",
    yearId: "",
    termId: "",
    classId: "",
  });

  // Fetch student data
  const { data: student, isLoading: studentLoading } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    enabled: isOpen && !!studentId,
  });

  // Fetch academic years
  const { data: academicYears = [] } = useQuery<AcademicYear[]>({
    queryKey: ["/api/companies", companyId, "academic-years"],
    enabled: isOpen && !!companyId,
  });

  // Fetch academic terms for selected year
  const { data: allAcademicTerms = [] } = useQuery<AcademicTerm[]>({
    queryKey: ["/api/companies", companyId, "academic-terms"],
    enabled: isOpen && !!companyId,
  });

  // Fetch classes for selected term
  const { data: allClasses = [] } = useQuery<Class[]>({
    queryKey: ["/api/companies", companyId, "classes"],
    enabled: isOpen && !!companyId,
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const response = await apiRequest("PATCH", `/api/students/${studentId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "students"] });
      setEditMode(false);
      toast({
        title: "Success",
        description: "Student profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update student profile",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when student data loads
  useEffect(() => {
    if (student) {
      setFormData({
        gradeLevel: student.gradeLevel || "",
        schoolName: student.schoolName || "",
        yearId: student.yearId || "",
        termId: student.termId || "",
        classId: student.classId || "",
      });
    }
  }, [student]);

  const handleSave = () => {
    updateStudentMutation.mutate(formData);
  };

  const selectedYear = academicYears.find(year => year.id === formData.yearId);
  const selectedTerm = allAcademicTerms.find(term => term.id === formData.termId);
  const selectedClass = allClasses.find(cls => cls.id === formData.classId);
  const filteredTerms = allAcademicTerms.filter(term => term.yearId === formData.yearId);
  const filteredClasses = allClasses.filter(cls => cls.termId === formData.termId);

  if (studentLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">Loading student profile...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-red-600">Student not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{student.user?.firstName || 'Unknown'} {student.user?.lastName || 'User'} - Profile</span>
            </div>
            <div className="flex space-x-2">
              {editMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateStudentMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        gradeLevel: student.gradeLevel || "",
                        schoolName: student.schoolName || "",
                        yearId: student.yearId || "",
                        termId: student.termId || "",
                        classId: student.classId || "",
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={student.user?.firstName || ""} disabled />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={student.user?.lastName || ""} disabled />
                </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input value={student.user?.email || ""} disabled />
              </div>
              
              <div>
                <Label>Grade Level (Alternative to Academic Year)</Label>
                {editMode ? (
                  <Select 
                    value={formData.gradeLevel || "none"} 
                    onValueChange={(value) => setFormData({...formData, gradeLevel: value === "none" ? "" : value, yearId: "", termId: "", classId: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level (or use Academic Year below)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Use Academic Year Instead</SelectItem>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="1">Grade 1</SelectItem>
                      <SelectItem value="2">Grade 2</SelectItem>
                      <SelectItem value="3">Grade 3</SelectItem>
                      <SelectItem value="4">Grade 4</SelectItem>
                      <SelectItem value="5">Grade 5</SelectItem>
                      <SelectItem value="6">Grade 6</SelectItem>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={student.gradeLevel || "Not set"} disabled />
                )}
              </div>

              <div>
                <Label>School Name</Label>
                {editMode ? (
                  <Input 
                    value={formData.schoolName} 
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    placeholder="Enter school name"
                  />
                ) : (
                  <Input value={student.schoolName || "Not set"} disabled />
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={student.user?.isActive ? "default" : "destructive"}>
                      {student.user?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Joined Date</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    {student.user?.createdAt ? new Date(student.user.createdAt).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Academic Year (Alternative to Grade Level)</Label>
                {editMode ? (
                  <Select 
                    value={formData.yearId || "none"} 
                    onValueChange={(value) => setFormData({...formData, yearId: value === "none" ? "" : value, termId: "", classId: "", gradeLevel: ""})}
                    disabled={!!formData.gradeLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.gradeLevel ? "Clear Grade Level to use Academic Year" : "Select academic year"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} ({new Date(year.startDate).getFullYear()}-{new Date(year.endDate).getFullYear()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={selectedYear ? `${selectedYear.name} (${new Date(selectedYear.startDate).getFullYear()}-${new Date(selectedYear.endDate).getFullYear()})` : "Not assigned"} 
                    disabled 
                  />
                )}
              </div>

              <div>
                <Label>Academic Term</Label>
                {editMode ? (
                  <Select 
                    value={formData.termId} 
                    onValueChange={(value) => setFormData({...formData, termId: value, classId: ""})}
                    disabled={!formData.yearId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic term" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTerms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name} ({new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={selectedTerm ? `${selectedTerm.name} (${new Date(selectedTerm.startDate).toLocaleDateString()} - ${new Date(selectedTerm.endDate).toLocaleDateString()})` : "Not assigned"} 
                    disabled 
                  />
                )}
              </div>

              <div>
                <Label>Class</Label>
                {editMode ? (
                  <Select 
                    value={formData.classId} 
                    onValueChange={(value) => setFormData({...formData, classId: value})}
                    disabled={!formData.termId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.subject} (Tutor: {cls.tutor?.user?.firstName} {cls.tutor?.user?.lastName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={selectedClass ? `${selectedClass.name} - ${selectedClass.subject} (Tutor: ${selectedClass.tutor?.user?.firstName} ${selectedClass.tutor?.user?.lastName})` : "Not assigned"} 
                    disabled 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}