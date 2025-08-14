import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupCustomAuth, isAuthenticated, type AuthenticatedRequest } from "./customAuth";
import { 
  insertAssignmentSchema,
  insertSubmissionSchema,
  insertMessageSchema,
  insertProgressSchema,
  insertCalendarEventSchema,
  insertAcademicYearSchema,
  insertAcademicTermSchema,
  insertClassSchema,
  insertStudentClassAssignmentSchema
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupCustomAuth(app);

  // Note: Auth routes are now handled by setupCustomAuth

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      let assignments: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          assignments = await storage.getAssignmentsByStudent(student.id);
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor) {
          assignments = await storage.getAssignmentsByTutor(tutor.id);
        }
      } else if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          assignments = await storage.getAssignmentsByCompanyId(companyAdmin.companyId);
        }
      }

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Company assignments route
  app.get('/api/company/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      let assignments: any[] = [];

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          assignments = await storage.getAssignmentsByCompanyId(companyAdmin.companyId);
        }
      }

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching company assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Company students route
  app.get('/api/company/students', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      let students: any[] = [];

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          students = await storage.getCompanyStudentsByCompanyId(companyAdmin.companyId);
        }
      }

      res.json(students);
    } catch (error) {
      console.error("Error fetching company students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Student assignments route  
  app.get('/api/student/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      let assignments: any[] = [];

      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          assignments = await storage.getAssignmentsByStudent(student.id);
        }
      }

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Homework file upload route
  app.post('/api/homework/upload', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getHomeworkUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting homework upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve homework files
  app.get('/homework/:filePath(*)', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.getHomeworkFile(`/homework/${req.params.filePath}`);
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error downloading homework file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'tutor') {
        return res.status(403).json({ message: "Only tutors can create assignments" });
      }

      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }

      const validatedData = insertAssignmentSchema.parse({
        ...req.body,
        tutorId: tutor.id,
      });

      const assignment = await storage.createAssignment(validatedData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Submission routes
  app.get('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;

      let submissions: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          submissions = await storage.getSubmissionsByStudent(student.id);
        }
      }

      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Only students can create submissions" });
      }

      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        studentId: student.id,
      });

      const submission = await storage.createSubmission(validatedData);
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch('/api/submissions/:id/verify', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const submissionId = req.params.id;
      
      if (user.role !== 'parent') {
        return res.status(403).json({ message: "Only parents can verify submissions" });
      }

      const submission = await storage.verifySubmissionByParent(submissionId);
      res.json(submission);
    } catch (error) {
      console.error("Error verifying submission:", error);
      res.status(500).json({ message: "Failed to verify submission" });
    }
  });

  // Message routes
  app.get('/api/messages/:receiverId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const senderId = user.id;
      const receiverId = req.params.receiverId;
      
      const messages = await storage.getMessagesBetweenUsers(senderId, receiverId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const senderId = user.id;
      
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });

      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Student profile routes
  app.get("/api/students/:studentId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const { studentId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });

    try {
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
      
      // Check permissions - only allow company admins, tutors from same company, or the student themselves
      if (user.role === 'student' && student.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      } else if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || student.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || student.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update student profile
  app.patch("/api/students/:studentId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const { studentId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });

    try {
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
      
      // Check permissions - only allow company admins, tutors from same company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || student.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || student.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedStudent = await storage.updateStudent(studentId, req.body);
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;

      let progress: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          progress = await storage.getProgressByStudent(student.id);
        }
      }

      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Calendar routes
  app.get('/api/calendar', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;

      let events: any[] = [];
      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor) {
          events = await storage.getCalendarEventsByTutor(tutor.id);
        }
      } else if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          events = await storage.getCalendarEventsByStudent(student.id);
        }
      }

      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'tutor') {
        return res.status(403).json({ message: "Only tutors can create calendar events" });
      }

      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }

      const validatedData = insertCalendarEventSchema.parse({
        ...req.body,
        tutorId: tutor.id,
      });

      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  // Students route for tutors and parents
  app.get('/api/students', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;

      let students: any[] = [];
      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor) {
          students = await storage.getStudentsByTutor(tutor.id);
        }
      } else if (user.role === 'parent') {
        const parent = await storage.getParentByUserId(user.id);
        if (parent) {
          students = await storage.getStudentsByParent(parent.id);
        }
      }

      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Company management routes
  // Get all companies - accessible for registration
  app.get('/api/companies', async (req: any, res) => {
    try {
      const companies = await storage.getAllTutoringCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get individual company details
  app.get('/api/companies/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const companyId = req.params.id;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user is company admin for this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }

      const company = await storage.getTutoringCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Get all users within a company
  app.get('/api/companies/:id/users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const companyId = req.params.id;
      
      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user is company admin for this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }

      const users = await storage.getUsersByCompany(companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const companyData = {
        name: req.body.name,
        description: req.body.description,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        address: req.body.address,
      };

      const newCompany = await storage.createTutoringCompany(companyData);
      res.json(newCompany);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company", error: (error as Error).message });
    }
  });

  app.get('/api/companies/:id/tutors', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const companyId = req.params.id;

      // Check if user is company admin for this company or system admin
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await storage.getTutorsByCompany(companyId);
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching company tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  // Deactivate/activate company
  app.patch('/api/companies/:id/status', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const companyId = req.params.id;
      const { isActive } = req.body;
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.updateCompanyStatus(companyId, isActive);
      res.json({ success: true, message: `Company ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error("Error updating company status:", error);
      res.status(500).json({ message: "Failed to update company status" });
    }
  });

  // Deactivate/activate user
  app.patch('/api/admin/users/:id/status', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const targetUserId = req.params.id;
      const { isActive } = req.body;
      
      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Company admins can only deactivate tutors in their company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        const targetUser = await storage.getUser(targetUserId);
        
        if (!companyAdmin || !targetUser || targetUser.role !== 'tutor') {
          return res.status(403).json({ message: "Can only manage tutors in your company" });
        }

        const tutor = await storage.getTutorByUserId(targetUserId);
        if (!tutor || tutor.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Tutor not in your company" });
        }
      }

      await storage.updateUserStatus(targetUserId, isActive);
      res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Assign existing tutor to company
  app.patch('/api/companies/:companyId/assign-tutor/:tutorId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { companyId, tutorId } = req.params;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Company admins can only assign tutors to their own company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Can only assign tutors to your own company" });
        }
      }

      // Check if tutor exists and is not already assigned
      const tutor = await storage.getTutor(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      if (tutor.companyId) {
        return res.status(400).json({ message: "Tutor is already assigned to a company" });
      }

      // Assign tutor to company
      await storage.assignTutorToCompany(tutorId, companyId);
      
      res.json({ success: true, message: "Tutor assigned to company successfully" });
    } catch (error) {
      console.error("Error assigning tutor to company:", error);
      res.status(500).json({ message: "Failed to assign tutor to company" });
    }
  });

  // Unassign tutor from company
  app.patch('/api/companies/:companyId/unassign-tutor/:tutorId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { companyId, tutorId } = req.params;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Company admins can only unassign tutors from their own company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Can only manage tutors in your own company" });
        }
      }

      // Check if tutor exists and is assigned to this company
      const tutor = await storage.getTutor(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      if (tutor.companyId !== companyId) {
        return res.status(400).json({ message: "Tutor is not assigned to this company" });
      }

      // Unassign tutor from company
      await storage.unassignTutorFromCompany(tutorId);
      
      res.json({ success: true, message: "Tutor removed from company successfully" });
    } catch (error) {
      console.error("Error unassigning tutor from company:", error);
      res.status(500).json({ message: "Failed to remove tutor from company" });
    }
  });

  // Get unassigned tutors (for assignment)
  app.get('/api/admin/unassigned-tutors', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await storage.getUnassignedTutors();
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching unassigned tutors:", error);
      res.status(500).json({ message: "Failed to fetch unassigned tutors" });
    }
  });

  // Company admin specific route
  app.get('/api/admin/company-admin/:userId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const requestingUser = req.user!;
      const targetUserId = req.params.userId;
      
      // Allow users to fetch their own company admin data or system admins
      if (requestingUser.id !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const companyAdmin = await storage.getCompanyAdminByUserId(targetUserId);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin profile not found" });
      }

      res.json(companyAdmin);
    } catch (error) {
      console.error("Error fetching company admin:", error);
      res.status(500).json({ message: "Failed to fetch company admin data" });
    }
  });

  // Update tutor profile
  app.put('/api/companies/:companyId/tutors/:tutorId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, tutorId } = req.params;
      const user = req.user!;

      // Check permissions
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Update tutor profile
      const tutorData = {
        specialization: req.body.specialization,
        qualifications: req.body.qualifications,
        isVerified: req.body.isVerified,
      };

      const updatedTutor = await storage.updateTutor(tutorId, tutorData);

      // Update user information if provided
      if (req.body.firstName || req.body.lastName || req.body.email) {
        const tutor = await storage.getTutor(tutorId);
        if (tutor) {
          const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
          };
          await storage.updateUser(tutor.userId, userData);
        }
      }

      res.json(updatedTutor);
    } catch (error) {
      console.error("Error updating tutor:", error);
      res.status(500).json({ message: "Failed to update tutor" });
    }
  });

  // Update student profile
  app.put('/api/companies/:companyId/students/:studentId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, studentId } = req.params;
      const user = req.user!;

      // Check permissions
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Update student profile
      const studentData = {
        gradeLevel: req.body.gradeLevel,
        schoolName: req.body.schoolName,
        parentId: req.body.parentId,
        tutorId: req.body.tutorId,
      };

      const updatedStudent = await storage.updateStudent(studentId, studentData);

      // Update user information if provided
      if (req.body.firstName || req.body.lastName || req.body.email) {
        const student = await storage.getStudent(studentId);
        if (student) {
          const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
          };
          await storage.updateUser(student.userId, userData);
        }
      }

      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Update company admin profile
  app.put('/api/admin/company-admin/:adminId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { adminId } = req.params;
      const user = req.user!;

      // Only system admins can update company admin profiles
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "System admin access required" });
      }

      // Update company admin profile
      const adminData = {
        permissions: req.body.permissions,
        companyId: req.body.companyId,
      };

      const updatedAdmin = await storage.updateCompanyAdmin(adminId, adminData);

      // Update user information if provided
      if (req.body.firstName || req.body.lastName || req.body.email) {
        const companyAdmin = await storage.getCompanyAdmin(adminId);
        if (companyAdmin) {
          const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
          };
          await storage.updateUser(companyAdmin.userId, userData);
        }
      }

      res.json(updatedAdmin);
    } catch (error) {
      console.error("Error updating company admin:", error);
      res.status(500).json({ message: "Failed to update company admin" });
    }
  });

  // Get company students 
  app.get('/api/companies/:id/students', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const requestingUser = req.user!;
      const companyId = req.params.id;
      
      // Check if user has access to this company
      if (requestingUser.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(requestingUser.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const students = await storage.getCompanyStudentsByCompanyId(companyId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching company students:", error);
      res.status(500).json({ message: "Failed to fetch company students" });
    }
  });

  // Admin routes for user management
  // Get deleted users
  app.get('/api/admin/deleted-users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deletedUsers = await storage.getDeletedUsers();
      res.json(deletedUsers);
    } catch (error) {
      console.error("Error fetching deleted users:", error);
      res.status(500).json({ message: "Failed to fetch deleted users" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/parents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const parents = await storage.getUsersByRole('parent');
      res.json(parents);
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Failed to fetch parents" });
    }
  });

  app.get('/api/admin/tutors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await storage.getUsersByRole('tutor');
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Creating user, admin ID:", userId);
      console.log("Request body:", req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        console.log("Access denied - user:", user);
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create the user first
      const userData = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        isActive: true,
      };

      console.log("Creating user with data:", userData);
      const newUser = await storage.createUserWithRole(userData);
      console.log("Created user:", newUser);

      // Create role-specific records
      if (req.body.role === 'student') {
        console.log("Creating student profile");
        const studentData = {
          userId: newUser.id,
          gradeLevel: req.body.gradeLevel || null,
          parentId: req.body.parentId || null,
          tutorId: req.body.tutorId || null,
          companyId: req.body.companyId || null, // Add company assignment
        };
        await storage.createStudent(studentData);
      } else if (req.body.role === 'parent') {
        console.log("Creating parent profile");
        await storage.createParent({
          userId: newUser.id,
          phoneNumber: req.body.phoneNumber || null,
        });
      } else if (req.body.role === 'tutor') {
        console.log("Creating tutor profile");
        await storage.createTutor({
          userId: newUser.id,
          companyId: req.body.companyId || null,
          specialization: req.body.specialization || null,
          qualifications: req.body.qualifications || null,
          isVerified: false,
        });
      } else if (req.body.role === 'company_admin') {
        console.log("Creating company admin profile");
        await storage.createCompanyAdmin({
          userId: newUser.id,
          companyId: req.body.companyId,
          permissions: req.body.permissions || ['manage_tutors', 'view_reports'],
        });
      }

      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user", error: (error as Error).message });
    }
  });

  // Get student info for editing (including company assignment)
  app.get('/api/admin/users/:userId/student-info', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { userId } = req.params;
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        companyId: student.companyId,
        tutorId: student.tutorId,
        gradeLevel: student.gradeLevel,
        parentId: student.parentId
      });
    } catch (error) {
      console.error("Error fetching student info:", error);
      res.status(500).json({ message: "Failed to fetch student info" });
    }
  });

  // Create new user within a company context
  app.post('/api/admin/create-user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role, email, firstName, lastName, companyId } = req.body;
      
      if (!role || !email) {
        return res.status(400).json({ message: "Role and email are required" });
      }

      // If company admin, verify they can only create for their company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
        if (!companyAdmin || (companyId && companyAdmin.companyId !== companyId)) {
          return res.status(403).json({ message: "Can only create users for your company" });
        }
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      const userData = {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role,
        isActive: true,
      };

      const newUser = await storage.createUserWithRole(userData);
      
      // Create role-specific records
      if (role === 'student') {
        await storage.createStudent({
          userId: newUser.id,
          gradeLevel: null,
          parentId: null,
          tutorId: null,
        });
      } else if (role === 'parent') {
        await storage.createParent({
          userId: newUser.id,
          phoneNumber: null,
        });
      } else if (role === 'tutor') {
        await storage.createTutor({
          userId: newUser.id,
          companyId: companyId || null,
          specialization: null,
          qualifications: null,
          isVerified: false,
        });
      } else if (role === 'company_admin' && companyId) {
        await storage.createCompanyAdmin({
          userId: newUser.id,
          companyId,
          permissions: ['manage_tutors', 'view_reports'],
        });
      }
      
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user", error: (error as Error).message });
    }
  });

  app.patch('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { companyId, ...updateData } = req.body;
      
      // Update basic user data
      const updatedUser = await storage.updateUser(req.params.id, updateData);
      
      // If user is a student and companyId is provided, create/update student record
      if (updatedUser.role === 'student' && companyId !== undefined) {
        let student = await storage.getStudentByUserId(req.params.id);
        if (!student) {
          // Create student record if it doesn't exist
          student = await storage.createStudent({
            userId: req.params.id,
            companyId: companyId || null,
            tutorId: null,
            gradeLevel: null,
            parentId: null,
          });
        } else {
          // Update existing student record
          await storage.updateStudent(student.id, {
            companyId: companyId || null
          });
        }
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/users/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deactivating master admins
      if (targetUser.role === 'admin') {
        return res.status(403).json({ message: "Cannot deactivate master admin accounts" });
      }

      const updatedUser = await storage.updateUser(req.params.id, {
        isActive: req.body.isActive,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Delete user (Master Admin only)
  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const targetUserId = req.params.id;
      
      // Only allow master admins (system admins) to delete users
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Master admin access required to delete users" });
      }

      // Prevent self-deletion
      if (userId === targetUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deletion of master admins
      if (targetUser.role === 'admin') {
        return res.status(403).json({ message: "Cannot delete master admin accounts" });
      }

      // Delete user and all related records
      await storage.deleteUser(targetUserId, userId);
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Development-only endpoint to grant admin access
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/dev/make-admin', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await storage.updateUser(userId, { role: 'admin' });
        res.json({ message: "Admin access granted", user: updatedUser });
      } catch (error) {
        console.error("Error granting admin access:", error);
        res.status(500).json({ message: "Failed to grant admin access" });
      }
    });

    // Test endpoint to create a user directly
    app.post('/api/dev/test-create-user', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
        }

        // Create a test student user
        const testUserData = {
          email: `test${Date.now()}@example.com`,
          firstName: "Test",
          lastName: "Student",
          role: "student" as const,
          isActive: true,
        };

        const newUser = await storage.createUserWithRole(testUserData);
        
        // Create student profile
        const studentData = {
          userId: newUser.id,
          gradeLevel: "5th Grade",
          parentId: null,
          tutorId: null,
        };
        
        const studentProfile = await storage.createStudent(studentData);

        res.json({ user: newUser, studentProfile });
      } catch (error) {
        console.error("Error in test create user:", error);
        res.status(500).json({ message: "Test failed", error: (error as Error).message });
      }
    });
  }

  // Academic Management Routes
  
  // Get academic years for a company
  app.get('/api/companies/:companyId/academic-years', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      let academicYears = await storage.getAcademicYearsByCompany(companyId);
      
      // Create sample data if none exists
      if (academicYears.length === 0) {
        const sampleYears = [
          { companyId, yearNumber: 1, name: "Year 1", description: "Foundation Year", startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30') },
          { companyId, yearNumber: 2, name: "Year 2", description: "Building Skills", startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30') },
          { companyId, yearNumber: 3, name: "Year 3", description: "Advanced Learning", startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30') }
        ];
        
        for (const yearData of sampleYears) {
          await storage.createAcademicYear(yearData);
        }
        
        academicYears = await storage.getAcademicYearsByCompany(companyId);
      }
      
      res.json(academicYears);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      res.status(500).json({ message: "Failed to fetch academic years" });
    }
  });

  // Create academic year
  app.post('/api/companies/:companyId/academic-years', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const academicYearData = {
        ...req.body,
        companyId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      const academicYear = await storage.createAcademicYear(academicYearData);
      res.json(academicYear);
    } catch (error) {
      console.error("Error creating academic year:", error);
      res.status(500).json({ message: "Failed to create academic year" });
    }
  });

  // Get academic terms
  app.get('/api/companies/:companyId/academic-terms', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const { yearId } = req.query;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      let academicTerms = yearId 
        ? await storage.getAcademicTermsByYear(yearId as string)
        : await storage.getAcademicTermsByCompany(companyId);
        
      // Create sample data if none exists
      if (academicTerms.length === 0 && !yearId) {
        const academicYears = await storage.getAcademicYearsByCompany(companyId);
        if (academicYears.length > 0) {
          const sampleTerms = [
            { companyId, academicYearId: academicYears[0].id, name: "Autumn Term", startDate: new Date('2024-09-01'), endDate: new Date('2024-12-20') },
            { companyId, academicYearId: academicYears[0].id, name: "Spring Term", startDate: new Date('2025-01-07'), endDate: new Date('2025-04-04') },
            { companyId, academicYearId: academicYears[0].id, name: "Summer Term", startDate: new Date('2025-04-21'), endDate: new Date('2025-06-30') }
          ];
          
          for (const termData of sampleTerms) {
            await storage.createAcademicTerm(termData);
          }
          
          academicTerms = await storage.getAcademicTermsByCompany(companyId);
        }
      }
      
      res.json(academicTerms);
    } catch (error) {
      console.error("Error fetching academic terms:", error);
      res.status(500).json({ message: "Failed to fetch academic terms" });
    }
  });

  // Create academic term
  app.post('/api/companies/:companyId/academic-terms', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const academicTermData = {
        ...req.body,
        companyId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      const academicTerm = await storage.createAcademicTerm(academicTermData);
      res.json(academicTerm);
    } catch (error) {
      console.error("Error creating academic term:", error);
      res.status(500).json({ message: "Failed to create academic term" });
    }
  });

  // Get classes
  app.get('/api/companies/:companyId/classes', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const { termId } = req.query;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      let classes = termId 
        ? await storage.getClassesByTerm(termId as string)
        : await storage.getClassesByCompany(companyId);
        
      // Create sample data if none exists
      if (classes.length === 0 && !termId) {
        const academicTerms = await storage.getAcademicTermsByCompany(companyId);
        if (academicTerms.length > 0) {
          const sampleClasses = [
            { 
              companyId, 
              termId: academicTerms[0].id, 
              name: "Mathematics 101", 
              subject: "Mathematics",
              description: "Basic mathematics for beginners",
              capacity: 15,
              startTime: "09:00",
              endTime: "10:00",
              daysOfWeek: ["Monday", "Wednesday", "Friday"]
            },
            { 
              companyId, 
              termId: academicTerms[0].id, 
              name: "English Literature", 
              subject: "English",
              description: "Introduction to classic literature",
              capacity: 12,
              startTime: "10:30",
              endTime: "11:30",
              daysOfWeek: ["Tuesday", "Thursday"]
            },
            { 
              companyId, 
              termId: academicTerms[0].id, 
              name: "Science Lab", 
              subject: "Science",
              description: "Hands-on science experiments",
              capacity: 10,
              startTime: "14:00",
              endTime: "15:30",
              daysOfWeek: ["Wednesday"]
            }
          ];
          
          for (const classData of sampleClasses) {
            await storage.createClass(classData);
          }
          
          classes = await storage.getClassesByCompany(companyId);
        }
      }
      
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  // Create class
  app.post('/api/companies/:companyId/classes', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const classData = {
        ...req.body,
        companyId,
        // Ensure arrays are properly handled
        daysOfWeek: Array.isArray(req.body.daysOfWeek) ? req.body.daysOfWeek : [req.body.daysOfWeek].filter(Boolean),
      };

      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  // Update academic year
  app.put('/api/companies/:companyId/academic-years/:yearId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, yearId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const academicYearData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      const updatedYear = await storage.updateAcademicYear(yearId, academicYearData);
      res.json(updatedYear);
    } catch (error) {
      console.error("Error updating academic year:", error);
      res.status(500).json({ message: "Failed to update academic year" });
    }
  });

  // Update academic term
  app.put('/api/companies/:companyId/academic-terms/:termId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, termId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const academicTermData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      const updatedTerm = await storage.updateAcademicTerm(termId, academicTermData);
      res.json(updatedTerm);
    } catch (error) {
      console.error("Error updating academic term:", error);
      res.status(500).json({ message: "Failed to update academic term" });
    }
  });

  // Update class
  app.put('/api/companies/:companyId/classes/:classId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const classData = {
        ...req.body,
        daysOfWeek: Array.isArray(req.body.daysOfWeek) ? req.body.daysOfWeek : [req.body.daysOfWeek].filter(Boolean),
      };

      const updatedClass = await storage.updateClass(classId, classData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  // Delete academic year
  app.delete('/api/companies/:companyId/academic-years/:yearId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, yearId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteAcademicYear(yearId);
      res.json({ message: "Academic year deleted successfully" });
    } catch (error) {
      console.error("Error deleting academic year:", error);
      res.status(500).json({ message: "Failed to delete academic year" });
    }
  });

  // Delete academic term
  app.delete('/api/companies/:companyId/academic-terms/:termId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, termId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteAcademicTerm(termId);
      res.json({ message: "Academic term deleted successfully" });
    } catch (error) {
      console.error("Error deleting academic term:", error);
      res.status(500).json({ message: "Failed to delete academic term" });
    }
  });

  // Delete class
  app.delete('/api/companies/:companyId/classes/:classId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteClass(classId);
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Get hierarchical academic structure: Years -> Terms -> Classes
  app.get('/api/companies/:companyId/academic-hierarchy', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all academic years for the company
      const academicYears = await storage.getAcademicYearsByCompany(companyId);
      
      // Build hierarchical structure
      const hierarchy = await Promise.all(
        academicYears.map(async (year) => {
          const terms = await storage.getAcademicTermsByYear(year.id);
          const termsWithClasses = await Promise.all(
            terms.map(async (term) => {
              const classes = await storage.getClassesByTerm(term.id);
              return {
                ...term,
                classes
              };
            })
          );
          return {
            ...year,
            terms: termsWithClasses
          };
        })
      );
      
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching academic hierarchy:", error);
      res.status(500).json({ message: "Failed to fetch academic hierarchy" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging - disabled to prevent connection errors
  // TODO: Re-enable WebSocket when proper authentication and URL handling is implemented
  // const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Logout route for custom auth (already handled by setupCustomAuth)
  // This is redundant - setupCustomAuth already creates a logout route

  return httpServer;
}
