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
  academicYearId: string;
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
    schoolName: "",
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
      console.log("Sending PATCH request with data:", data);
      const response = await apiRequest("PATCH", `/api/students/${studentId}`, data);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", response.status, errorText);
        throw new Error(`Failed to update: ${response.status} ${errorText}`);
      }
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
        schoolName: student.schoolName || "",
        classId: student.classId || "",
      });
    }
  }, [student]);

  const handleSave = () => {
    if (updateStudentMutation.isPending) {
      console.log("Save already in progress, ignoring duplicate request");
      return;
    }
    console.log("Saving student profile with data:", formData);
    updateStudentMutation.mutate(formData);
  };

  const selectedClass = allClasses.find(cls => cls.id === formData.classId);

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
                        schoolName: student.schoolName || "",
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

          {/* Class Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Class Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Assigned Class</Label>
                {editMode ? (
                  <Select 
                    value={formData.classId || "none"} 
                    onValueChange={(value) => setFormData({...formData, classId: value === "none" ? "" : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No class assigned</SelectItem>
                      {allClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.subject} (Tutor: {cls.tutor?.user?.firstName} {cls.tutor?.user?.lastName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={selectedClass ? `${selectedClass.name} - ${selectedClass.subject} (Tutor: ${selectedClass.tutor?.user?.firstName} ${selectedClass.tutor?.user?.lastName})` : "No class assigned"} 
                    disabled 
                  />
                )}
              </div>
              
              {selectedClass && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Class Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>Subject:</strong> {selectedClass.subject}</div>
                    <div><strong>Description:</strong> {selectedClass.description || "No description"}</div>
                    <div><strong>Schedule:</strong> {selectedClass.schedule || "Not specified"}</div>
                    <div><strong>Tutor:</strong> {selectedClass.tutor?.user?.firstName} {selectedClass.tutor?.user?.lastName}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}