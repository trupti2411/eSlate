import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertAssignmentSchema,
  insertSubmissionSchema,
  insertMessageSchema,
  insertProgressSchema,
  insertCalendarEventSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get role-specific data
      let roleData = null;
      switch (user.role) {
        case 'student':
          roleData = await storage.getStudentByUserId(userId);
          break;
        case 'parent':
          roleData = await storage.getParentByUserId(userId);
          break;
        case 'tutor':
          roleData = await storage.getTutorByUserId(userId);
          break;
      }

      res.json({ ...user, roleData });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let assignments: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(userId);
        if (student) {
          assignments = await storage.getAssignmentsByStudent(student.id);
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(userId);
        if (tutor) {
          assignments = await storage.getAssignmentsByTutor(tutor.id);
        }
      }

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'tutor') {
        return res.status(403).json({ message: "Only tutors can create assignments" });
      }

      const tutor = await storage.getTutorByUserId(userId);
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
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let submissions: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(userId);
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

  app.post('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'student') {
        return res.status(403).json({ message: "Only students can create submissions" });
      }

      const student = await storage.getStudentByUserId(userId);
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

  app.patch('/api/submissions/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const submissionId = req.params.id;
      
      if (!user || user.role !== 'parent') {
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
  app.get('/api/messages/:receiverId', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const receiverId = req.params.receiverId;
      
      const messages = await storage.getMessagesBetweenUsers(senderId, receiverId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      
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

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let progress: any[] = [];
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(userId);
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
  app.get('/api/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let events: any[] = [];
      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(userId);
        if (tutor) {
          events = await storage.getCalendarEventsByTutor(tutor.id);
        }
      } else if (user.role === 'student') {
        const student = await storage.getStudentByUserId(userId);
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

  app.post('/api/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'tutor') {
        return res.status(403).json({ message: "Only tutors can create calendar events" });
      }

      const tutor = await storage.getTutorByUserId(userId);
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
  app.get('/api/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let students: any[] = [];
      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(userId);
        if (tutor) {
          students = await storage.getStudentsByTutor(tutor.id);
        }
      } else if (user.role === 'parent') {
        const parent = await storage.getParentByUserId(userId);
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
  app.get('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const companies = await storage.getAllTutoringCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get individual company details
  app.get('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const companyId = req.params.id;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user is company admin for this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
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
  app.get('/api/companies/:id/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const companyId = req.params.id;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user is company admin for this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
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

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
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

  app.get('/api/companies/:id/tutors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const companyId = req.params.id;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is company admin for this company or system admin
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
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
  app.patch('/api/companies/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const companyId = req.params.id;
      const { isActive } = req.body;
      
      if (!user || user.role !== 'admin') {
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
  app.patch('/api/admin/users/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const targetUserId = req.params.id;
      const { isActive } = req.body;
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Company admins can only deactivate tutors in their company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
  app.get('/api/admin/unassigned-tutors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
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
  app.get('/api/admin/company-admin/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;
      
      // Only allow users to fetch their own company admin data or system admins
      if (requestingUserId !== targetUserId) {
        const requestingUser = await storage.getUser(requestingUserId);
        if (!requestingUser || requestingUser.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
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

  // Admin routes for user management
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      console.log("Creating user, admin ID:", userId);
      console.log("Request body:", req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
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

  // Create new user within a company context
  app.post('/api/admin/create-user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedUser = await storage.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/users/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
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

  // Development-only endpoint to grant admin access
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/dev/make-admin', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
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
        const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to all connected clients
        // In a production app, you'd want to filter by user/room
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
