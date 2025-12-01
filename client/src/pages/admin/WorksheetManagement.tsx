import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { WorksheetEditor } from '@/components/WorksheetEditor';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Send, 
  Eye,
  Users,
  Calendar,
  Search,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface Worksheet {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  companyId: string;
  createdBy: string;
  isPublished: boolean;
  dueDate?: string;
  createdAt: string;
}

interface Student {
  id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Class {
  id: string;
  name: string;
  subject: string;
}

interface WorksheetManagementProps {
  companyId: string;
}

export function WorksheetManagement({ companyId }: WorksheetManagementProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editingWorksheetId, setEditingWorksheetId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newWorksheet, setNewWorksheet] = useState({ title: '', description: '', subject: '' });
  const [assignmentData, setAssignmentData] = useState<{
    studentIds: string[];
    classIds: string[];
    dueDate: string;
  }>({ studentIds: [], classIds: [], dueDate: '' });

  const { data: worksheets = [], isLoading } = useQuery<Worksheet[]>({
    queryKey: ['/api/companies', companyId, 'worksheets'],
    queryFn: () => fetch(`/api/companies/${companyId}/worksheets`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!companyId,
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/admin/company-admin', companyId, 'students'],
    queryFn: () => fetch(`/api/admin/company-admin/${companyId}/students`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!companyId,
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/admin/company-admin', companyId, 'classes'],
    queryFn: () => fetch(`/api/admin/company-admin/${companyId}/classes`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!companyId,
  });

  const createWorksheetMutation = useMutation({
    mutationFn: (data: typeof newWorksheet) =>
      apiRequest('POST', `/api/companies/${companyId}/worksheets`, data),
    onSuccess: (worksheet: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
      setShowCreateDialog(false);
      setNewWorksheet({ title: '', description: '', subject: '' });
      setEditingWorksheetId(worksheet.id);
      toast({ title: 'Worksheet created' });
    },
    onError: () => {
      toast({ title: 'Failed to create worksheet', variant: 'destructive' });
    },
  });

  const deleteWorksheetMutation = useMutation({
    mutationFn: (worksheetId: string) => apiRequest('DELETE', `/api/worksheets/${worksheetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
      toast({ title: 'Worksheet deleted' });
    },
  });

  const assignWorksheetMutation = useMutation({
    mutationFn: (data: { worksheetId: string; studentIds: string[]; classIds: string[]; dueDate?: string }) =>
      apiRequest('POST', `/api/worksheets/${data.worksheetId}/assign`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worksheets'] });
      setShowAssignDialog(false);
      setAssignmentData({ studentIds: [], classIds: [], dueDate: '' });
      toast({ title: 'Worksheet assigned successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to assign worksheet', variant: 'destructive' });
    },
  });

  const handleCreateWorksheet = () => {
    if (!newWorksheet.title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }
    createWorksheetMutation.mutate(newWorksheet);
  };

  const handleAssign = () => {
    if (!selectedWorksheet) return;
    if (assignmentData.studentIds.length === 0 && assignmentData.classIds.length === 0) {
      toast({ title: 'Please select at least one student or class', variant: 'destructive' });
      return;
    }
    assignWorksheetMutation.mutate({
      worksheetId: selectedWorksheet.id,
      ...assignmentData,
    });
  };

  const openAssignDialog = (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    setShowAssignDialog(true);
  };

  const filteredWorksheets = worksheets.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingWorksheetId) {
    return (
      <WorksheetEditor
        worksheetId={editingWorksheetId}
        companyId={companyId}
        onClose={() => {
          setEditingWorksheetId(null);
          queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'worksheets'] });
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/company')} data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Worksheet Management</h1>
            <p className="text-muted-foreground">Create and manage worksheets for your students</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-worksheet">
              <Plus className="h-4 w-4 mr-2" /> Create Worksheet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Worksheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newWorksheet.title}
                  onChange={(e) => setNewWorksheet(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter worksheet title"
                  data-testid="input-new-title"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newWorksheet.subject}
                  onChange={(e) => setNewWorksheet(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Mathematics, English"
                  data-testid="input-new-subject"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newWorksheet.description}
                  onChange={(e) => setNewWorksheet(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the worksheet"
                  data-testid="input-new-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateWorksheet} data-testid="button-confirm-create">
                Create & Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search worksheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-worksheets"
          />
        </div>
      </div>

      {/* Worksheets Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading worksheets...</div>
      ) : filteredWorksheets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No worksheets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first worksheet to start assigning work to students
            </p>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-worksheet">
              <Plus className="h-4 w-4 mr-2" /> Create Worksheet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorksheets.map((worksheet) => (
            <Card key={worksheet.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{worksheet.title}</CardTitle>
                    {worksheet.subject && (
                      <p className="text-sm text-muted-foreground">{worksheet.subject}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    worksheet.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {worksheet.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {worksheet.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {worksheet.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {format(new Date(worksheet.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWorksheetId(worksheet.id)}
                    className="flex-1"
                    data-testid={`button-edit-${worksheet.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openAssignDialog(worksheet)}
                    className="flex-1"
                    data-testid={`button-assign-${worksheet.id}`}
                  >
                    <Send className="h-4 w-4 mr-1" /> Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWorksheetMutation.mutate(worksheet.id)}
                    data-testid={`button-delete-${worksheet.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Worksheet: {selectedWorksheet?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={assignmentData.dueDate}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                data-testid="input-due-date"
              />
            </div>

            {/* Select Students */}
            <div>
              <Label className="mb-2 block">Assign to Students</Label>
              <ScrollArea className="h-40 border rounded-md p-2">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={assignmentData.studentIds.includes(student.id)}
                          onCheckedChange={(checked) => {
                            setAssignmentData(prev => ({
                              ...prev,
                              studentIds: checked
                                ? [...prev.studentIds, student.id]
                                : prev.studentIds.filter(id => id !== student.id),
                            }));
                          }}
                          data-testid={`checkbox-student-${student.id}`}
                        />
                        <Label htmlFor={`student-${student.id}`} className="cursor-pointer">
                          {student.user?.firstName} {student.user?.lastName}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({student.user?.email})
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Select Classes */}
            <div>
              <Label className="mb-2 block">Assign to Classes</Label>
              <ScrollArea className="h-40 border rounded-md p-2">
                {classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No classes found</p>
                ) : (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={assignmentData.classIds.includes(cls.id)}
                          onCheckedChange={(checked) => {
                            setAssignmentData(prev => ({
                              ...prev,
                              classIds: checked
                                ? [...prev.classIds, cls.id]
                                : prev.classIds.filter(id => id !== cls.id),
                            }));
                          }}
                          data-testid={`checkbox-class-${cls.id}`}
                        />
                        <Label htmlFor={`class-${cls.id}`} className="cursor-pointer">
                          {cls.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({cls.subject})
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssign} data-testid="button-confirm-assign">
              Assign Worksheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
