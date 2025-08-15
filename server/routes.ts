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
import multer from "multer";
import { randomUUID } from "crypto";

// Global declaration for temporary file storage
declare global {
  var tempFiles: Map<string, {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize global temporary file storage
  global.tempFiles = global.tempFiles || new Map();

  // Auth middleware
  setupCustomAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow most common file types for homework submissions
      const allowedTypes = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|xls|xlsx|ppt|pptx)$/i;
      if (allowedTypes.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, PNG, GIF, XLS, XLSX, PPT, or PPTX files.'));
      }
    },
  });

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
        if (tutor && tutor.companyId) {
          assignments = await storage.getAssignmentsByCompany(tutor.companyId);
        }
      } else if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          assignments = await storage.getAssignmentsByCompany(companyAdmin.companyId);
        }
      }

      console.log(`Fetched ${assignments.length} assignments for ${user.role}:`, user.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Get assignments for company (Company admin and tutors)
  app.get('/api/company/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || (user.role !== 'company_admin' && user.role !== 'tutor')) {
        return res.status(403).json({ message: "Company admin or tutor access required" });
      }

      let companyId: string;

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(userId);
        if (!companyAdmin) {
          return res.status(404).json({ message: "Company admin profile not found" });
        }
        companyId = companyAdmin.companyId;
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(userId);
        if (!tutor || !tutor.companyId) {
          return res.status(404).json({ message: "Tutor profile not found or not assigned to company" });
        }
        companyId = tutor.companyId;
      } else {
        return res.status(403).json({ message: "Invalid user role" });
      }

      const assignments = await storage.getAssignmentsByCompany(companyId);
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

  // Test homework upload URL generation
  app.get('/api/homework/upload-test', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Testing homework upload URL generation...");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getHomeworkUploadURL();
      console.log("Test - Generated upload URL:", uploadURL);
      res.json({ success: true, uploadURL, message: "Upload URL generated successfully" });
    } catch (error) {
      console.error("Test - Error getting homework upload URL:", error);
      res.json({ success: false, error: error.message, stack: error.stack });
    }
  });

  // Direct file upload route using multer (simplified approach)
  app.post('/api/homework/upload-direct', isAuthenticated, upload.single('file'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("Direct file upload:", req.file.originalname, "Size:", req.file.size);

      const objectStorageService = new ObjectStorageService();
      
      try {
        // Try to upload to object storage
        const fileUrl = await objectStorageService.uploadHomeworkFile(req.file);
        console.log("File uploaded to object storage:", fileUrl);
        
        res.json({
          success: true,
          fileUrl: fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });
      } catch (storageError) {
        console.error("Object storage upload failed, falling back to local storage:", storageError);
        
        // Fallback: create a temporary file reference
        const fileId = randomUUID();
        const tempFileUrl = `/homework/${req.file.originalname}`;
        
        // Store file metadata in memory for this session (temporary solution)
        global.tempFiles = global.tempFiles || new Map();
        global.tempFiles.set(req.file.originalname, {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });

        console.log("File stored temporarily with name:", req.file.originalname);
        res.json({
          success: true,
          fileUrl: tempFileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });
      }
    } catch (error) {
      console.error("Error uploading file directly:", error);
      res.status(500).json({ error: "Failed to upload file", details: error.message });
    }
  });

  // Original signed URL upload route (keep as fallback)
  app.post('/api/homework/upload', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Getting homework upload URL...");
      console.log("User:", req.user?.id);
      console.log("Environment check - PUBLIC_OBJECT_SEARCH_PATHS:", process.env.PUBLIC_OBJECT_SEARCH_PATHS);
      console.log("Environment check - PRIVATE_OBJECT_DIR:", process.env.PRIVATE_OBJECT_DIR);

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getHomeworkUploadURL();
      console.log("Generated upload URL:", uploadURL);

      // Validate the URL format
      if (!uploadURL) {
        throw new Error("No upload URL generated");
      }
      
      if (!uploadURL.startsWith('https://')) {
        console.warn("Upload URL does not start with https://", uploadURL);
        // For development/testing, allow non-https URLs
        if (process.env.NODE_ENV !== 'production' && uploadURL.startsWith('http://')) {
          console.log("Allowing http URL in development mode");
        } else {
          throw new Error(`Invalid upload URL format: ${uploadURL}`);
        }
      }

      // Generate a unique upload ID for tracking
      const uploadID = randomUUID();
      
      res.json({ 
        url: uploadURL,  // Standard property name for Uppy
        uploadURL,       // Keep for backward compatibility
        uploadID,
        method: "PUT",
        success: true 
      });
    } catch (error) {
      console.error("Error getting homework upload URL:", error);
      console.error("Error stack:", error.stack);
      console.error("Environment variables:", {
        NODE_ENV: process.env.NODE_ENV,
        PRIVATE_OBJECT_DIR: process.env.PRIVATE_OBJECT_DIR ? "SET" : "NOT SET",
        PUBLIC_OBJECT_SEARCH_PATHS: process.env.PUBLIC_OBJECT_SEARCH_PATHS ? "SET" : "NOT SET"
      });
      
      res.status(500).json({ 
        error: "Failed to get upload URL", 
        details: error.message,
        success: false
      });
    }
  });

  // Serve homework files
  app.get('/homework/:filePath(*)', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const filePath = req.params.filePath;
      console.log("Serving homework file:", filePath);

      // First check temporary files (fallback storage)
      const tempFiles = global.tempFiles || new Map();
      
      // Try exact match first
      if (tempFiles.has(filePath)) {
        console.log("Found file in temporary storage:", filePath);
        const tempFile = tempFiles.get(filePath);
        
        // Set proper headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${tempFile.originalname}"`);
        res.setHeader('Content-Type', tempFile.mimetype || 'application/octet-stream');
        res.setHeader('Content-Length', tempFile.size);
        
        // Send the file buffer
        return res.send(tempFile.buffer);
      }

      // Try to find file by original name in temp storage
      for (const [key, tempFile] of tempFiles.entries()) {
        if (tempFile.originalname === filePath || key === tempFile.originalname) {
          console.log("Found file in temporary storage by original name:", tempFile.originalname);
          
          // Set proper headers for download
          res.setHeader('Content-Disposition', `attachment; filename="${tempFile.originalname}"`);
          res.setHeader('Content-Type', tempFile.mimetype || 'application/octet-stream');
          res.setHeader('Content-Length', tempFile.size);
          
          // Send the file buffer
          return res.send(tempFile.buffer);
        }
      }

      // Try object storage if environment is configured
      if (process.env.PRIVATE_OBJECT_DIR || process.env.PUBLIC_OBJECT_SEARCH_PATHS) {
        try {
          const objectStorageService = new ObjectStorageService();

          // Try multiple path variations to find the file
          const possiblePaths = [
            `/homework/${filePath}`,
            filePath,
            `homework/${filePath}`,
            `uploads/${filePath}`,
            `files/${filePath}`,
            // Also try without the leading slash
            filePath.startsWith('/') ? filePath.substring(1) : `/${filePath}`
          ];

          let file = null;
          let foundPath = null;
          
          for (const path of possiblePaths) {
            try {
              console.log("Trying object storage path:", path);
              file = await objectStorageService.getHomeworkFile(path);
              if (file) {
                console.log("Found file at path:", path);
                foundPath = path;
                break;
              }
            } catch (e) {
              console.log("Path not found:", path);
              continue;
            }
          }

          // If not found in homework directory, try public search
          if (!file) {
            console.log("File not found in homework directory, trying public search...");
            try {
              file = await objectStorageService.searchPublicObject(filePath);
              if (file) {
                console.log("Found file in public storage:", filePath);
                foundPath = filePath;
              }
            } catch (e) {
              console.log("File not found in public storage either:", e.message);
            }
          }

          if (file) {
            // Extract filename for proper download header
            const fileName = filePath.split('/').pop() || filePath;
            
            // Set proper headers for download
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'application/octet-stream');

            return objectStorageService.downloadObject(file, res);
          }
        } catch (storageError) {
          console.log("Object storage error:", storageError.message);
        }
      }

      console.error("File not found at any location:", filePath);
      return res.status(404).json({ message: "File not found" });
    } catch (error) {
      console.error("Error downloading homework file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "File not found" });
      }
      return res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Serve assignment attachment files through our server (for authenticated access)
  app.get('/api/assignments/:assignmentId/attachments/:fileName', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { assignmentId, fileName } = req.params;
      console.log(`Looking for assignment attachment: ${fileName} for assignment: ${assignmentId}`);

      // First check temporary files (fallback storage)
      const tempFiles = global.tempFiles || new Map();
      
      // Try exact match first
      if (tempFiles.has(fileName)) {
        console.log("Found attachment in temporary storage:", fileName);
        const tempFile = tempFiles.get(fileName);
        
        // Set proper headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${tempFile.originalname}"`);
        res.setHeader('Content-Type', tempFile.mimetype || 'application/octet-stream');
        res.setHeader('Content-Length', tempFile.size);
        
        // Send the file buffer
        return res.send(tempFile.buffer);
      }

      // Try to find file by original name in temp storage
      for (const [key, tempFile] of tempFiles.entries()) {
        if (tempFile.originalname === fileName || key === tempFile.originalname) {
          console.log("Found attachment in temporary storage by original name:", tempFile.originalname);
          
          // Set proper headers for download
          res.setHeader('Content-Disposition', `attachment; filename="${tempFile.originalname}"`);
          res.setHeader('Content-Type', tempFile.mimetype || 'application/octet-stream');
          res.setHeader('Content-Length', tempFile.size);
          
          // Send the file buffer
          return res.send(tempFile.buffer);
        }
      }

      // Try object storage if environment is configured
      if (process.env.PRIVATE_OBJECT_DIR || process.env.PUBLIC_OBJECT_SEARCH_PATHS) {
        try {
          const objectStorageService = new ObjectStorageService();

          // Assignment attachments are stored in the homework directory under private storage
          // Try to get the file using the homework file method
          try {
            console.log(`Looking for homework file: /homework/${fileName}`);
            const file = await objectStorageService.getHomeworkFile(`/homework/${fileName}`);
            console.log(`Found homework file: ${fileName}`);
            return objectStorageService.downloadObject(file, res);
          } catch (homeworkError) {
            console.log(`File not found in homework directory: ${homeworkError.message}`);
          }

          // Fallback: Try public object paths
          const possiblePaths = [
            fileName,
            `attachments/${fileName}`,
            `assignments/${fileName}`,
            `files/${fileName}`,
            `public/${fileName}`,
            `uploads/${fileName}`
          ];

          for (const filePath of possiblePaths) {
            try {
              const file = await objectStorageService.searchPublicObject(filePath);
              if (file) {
                console.log(`Found file in public storage at path: ${filePath}`);
                return objectStorageService.downloadObject(file, res);
              }
            } catch (e) {
              // Continue to next path
              console.log(`File not found at public path: ${filePath}`);
            }
          }
        } catch (storageError) {
          console.log("Object storage error:", storageError.message);
        }
      }

      // If we can't find the file anywhere, return 404
      console.error(`File ${fileName} not found in any location (private homework or public paths)`);
      res.status(404).json({ message: "File not found" });

    } catch (error) {
      console.error("Error serving assignment attachment:", error);
      res.status(500).json({ message: "Failed to serve attachment" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      console.log("Creating assignment - User:", user.id, "Role:", user.role);
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      if (user.role !== 'tutor' && user.role !== 'company_admin') {
        console.log("Access denied - invalid role:", user.role);
        return res.status(403).json({ message: "Only tutors and company admins can create assignments" });
      }

      let companyId: string;

      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        console.log("Found tutor:", tutor);
        if (!tutor || !tutor.companyId) {
          console.log("Tutor profile not found or not assigned to company");
          return res.status(404).json({ message: "Tutor profile not found or not assigned to company" });
        }
        companyId = tutor.companyId;
      } else if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        console.log("Found company admin:", companyAdmin);
        if (!companyAdmin) {
          console.log("Company admin profile not found");
          return res.status(404).json({ message: "Company admin profile not found" });
        }
        companyId = companyAdmin.companyId;
      } else {
        console.log("Invalid user role:", user.role);
        return res.status(403).json({ message: "Invalid user role" });
      }

      console.log("Using company ID:", companyId);

      // Parse the date string to Date object if provided and add createdBy
      const assignmentData = {
        ...req.body,
        companyId,
        createdBy: user.id, // Add the missing createdBy field
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        visibleFrom: req.body.visibleFrom ? new Date(req.body.visibleFrom) : null,
      };

      console.log("Assignment data before validation:", JSON.stringify(assignmentData, null, 2));

      const validatedData = insertAssignmentSchema.parse(assignmentData);
      console.log("Validated assignment data:", JSON.stringify(validatedData, null, 2));

      const assignment = await storage.createAssignment(validatedData);
      console.log("Created assignment:", assignment.id);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create assignment", details: error.message });
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

  // Get submissions for a specific assignment
  app.get('/api/submissions/:assignmentId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { assignmentId } = req.params;
      const user = req.user!;

      // Verify user has access to this assignment
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check permissions
      if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || !tutor.companyId || assignment.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || assignment.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'student') {
        // Students can only access their own submissions for assignments they're assigned to
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Student profile not found" });
        }
        
        // Check if this student is assigned to this assignment
        const studentAssignments = await storage.getAssignmentsByStudent(student.id);
        const hasAccess = studentAssignments.some(a => a.id === assignmentId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this assignment" });
        }
        
        // Return only the student's own submission
        const submissions = await storage.getSubmissionsByAssignment(assignmentId);
        const studentSubmissions = submissions.filter(s => s.studentId === student.id);
        return res.json(studentSubmissions);
      } else if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const submissions = await storage.getSubmissionsByAssignment(assignmentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      console.log("Creating submission for user:", user.id, "role:", user.role);
      console.log("Submission data received:", req.body);

      if (user.role !== 'student') {
        return res.status(403).json({ message: "Only students can create submissions" });
      }

      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        console.log("Student profile not found for user:", user.id);
        return res.status(404).json({ message: "Student profile not found" });
      }

      console.log("Found student:", student.id);

      const submissionData = {
        ...req.body,
        studentId: student.id,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : new Date(),
      };

      console.log("Prepared submission data:", submissionData);

      const validatedData = insertSubmissionSchema.parse(submissionData);
      console.log("Validated submission data:", validatedData);

      const submission = await storage.createSubmission(validatedData);
      console.log("Created submission:", submission);
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create submission", details: error.message });
    }
  });

  // Grade submission route
  app.post('/api/submissions/:submissionId/grade', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      const user = req.user!;

      if (user.role !== 'tutor' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Only tutors and company admins can grade submissions" });
      }

      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const gradedSubmission = await storage.gradeSubmission(submissionId, score, feedback, user.id);
      res.json(gradedSubmission);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  });



  // Parent acknowledgment route (optional, submissions are immediately visible regardless)
  app.patch('/api/submissions/:submissionId/acknowledge', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user!;

      if (user.role !== 'parent') {
        return res.status(403).json({ message: "Only parents can acknowledge submissions" });
      }

      // Optional acknowledgment - doesn't block anything
      const submission = await storage.updateSubmission(submissionId, {
        parentVerifiedAt: new Date(),
        isVerifiedByParent: true,
        parentComments: req.body.comments || null
      });

      res.json(submission);
    } catch (error) {
      console.error("Error acknowledging submission:", error);
      res.status(500).json({ message: "Failed to acknowledge submission" });
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
      console.log("Student update request:", { studentId, body: req.body, userRole: user.role });

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

      // Clean the request body to only include allowed fields (simplified - direct class assignment)
      const allowedFields = ['schoolName', 'classId'];
      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field] === "" ? null : req.body[field];
        }
      }

      console.log("Cleaned update data:", updateData);
      const updatedStudent = await storage.updateStudent(studentId, updateData);
      console.log("Student updated successfully:", updatedStudent.id);
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
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

    // Clear all assignments and submissions
    app.post('/api/dev/clear-assignments', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
          return res.status(403).json({ message: "Admin access required" });
        }

        console.log("Clearing all assignments and submissions...");

        // Delete all submissions first (due to foreign key constraints)
        await storage.clearAllSubmissions();
        console.log("All submissions cleared");

        // Delete all assignments
        await storage.clearAllAssignments();
        console.log("All assignments cleared");

        // Clear temporary files
        global.tempFiles = new Map();
        console.log("Temporary files cleared");

        res.json({ 
          message: "All assignments and submissions cleared successfully",
          clearedSubmissions: true,
          clearedAssignments: true,
          clearedTempFiles: true
        });
      } catch (error) {
        console.error("Error clearing assignments:", error);
        res.status(500).json({ message: "Failed to clear assignments", error: (error as Error).message });
      }
    });

    // Debug route to list temporary files
    app.get('/api/dev/temp-files', isAuthenticated, async (req: any, res) => {
      try {
        const tempFiles = global.tempFiles || new Map();
        const fileList = Array.from(tempFiles.keys()).map(key => ({
          key,
          originalname: tempFiles.get(key)?.originalname,
          size: tempFiles.get(key)?.size,
          mimetype: tempFiles.get(key)?.mimetype
        }));
        
        res.json({ 
          count: tempFiles.size,
          files: fileList
        });
      } catch (error) {
        console.error("Error listing temp files:", error);
        res.status(500).json({ message: "Failed to list temp files" });
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