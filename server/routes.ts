import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { setupCustomAuth, isAuthenticated, type AuthenticatedRequest } from "./customAuth";
import {
  insertMessageSchema,
  insertProgressSchema,
  insertCalendarEventSchema,
  insertAcademicYearSchema,
  insertAcademicTermSchema,
  insertClassSchema,
  insertStudentClassAssignmentSchema,
  insertAssignmentSchema,
  insertSubmissionSchema
} from "@shared/schema";
import multer from "multer";
import { randomUUID } from "crypto";
import { db } from "./db";
import { assignments, submissions } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";

// Global declaration for file storage
declare global {
  var uploadedFiles: Map<string, {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
  }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize global file storage
  global.uploadedFiles = global.uploadedFiles || new Map();
  
  // Add some sample files for testing (only if storage is empty)
  if (global.uploadedFiles.size === 0) {
    // Create a sample PDF file for testing
    const samplePDF = Buffer.from(`%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT
/F1 12 Tf
100 700 Td
(Sample Assignment File) Tj
ET
endstream
endobj
trailer<</Size 5/Root 1 0 R>>
%%EOF`);

    global.uploadedFiles.set('01514bf6-31ed-4ecf-914a-8833926cd594', {
      buffer: samplePDF,
      originalname: 'sample-assignment.pdf',
      mimetype: 'application/pdf',
      size: samplePDF.length,
      uploadedAt: new Date()
    });

    // Create a sample text file
    const sampleText = Buffer.from('Sample assignment instructions:\n\n1. Read the material carefully\n2. Answer all questions\n3. Submit before the deadline\n\nGood luck!');
    global.uploadedFiles.set('sample-text-file-id', {
      buffer: sampleText,
      originalname: 'instructions.txt',
      mimetype: 'text/plain',
      size: sampleText.length,
      uploadedAt: new Date()
    });

    console.log('Initialized sample files for testing assignment completion');
  }

  // Auth middleware
  setupCustomAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow most common file types
      const allowedTypes = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|xls|xlsx|ppt|pptx)$/i;
      if (allowedTypes.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, PNG, GIF, XLS, XLSX, PPT, or PPTX files.'));
      }
    },
  });

  // ===== ASSIGNMENT SYSTEM ROUTES =====
  
  // Company Portal - Assignment Management (Company Admin & Tutor access)
  
  // Get assignments by company
  app.get('/api/companies/:companyId/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const companyId = req.params.companyId;
      
      // Verify user has access to this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignments = await storage.getAssignmentsByCompany(companyId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Get assignments by class
  app.get('/api/classes/:classId/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const classId = req.params.classId;
      const assignments = await storage.getAssignmentsByClass(classId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching class assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // ===== STUDENT PORTAL ROUTES =====
  
  // Get student's terms
  app.get('/api/students/:studentId/terms', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      
      // Verify student access
      if (user.role === 'student') {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const terms = await storage.getStudentTerms(studentId);
      res.json(terms);
    } catch (error) {
      console.error("Error fetching student terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  // Get student's classes
  app.get('/api/students/:studentId/classes', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      
      // Verify student access
      if (user.role === 'student') {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const classes = await storage.getStudentClasses(studentId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching student classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  // Get student's assignments
  app.get('/api/students/:studentId/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      
      // Verify student access
      if (user.role === 'student') {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const assignments = await storage.getStudentAssignments(studentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Get student's submissions
  app.get('/api/students/:studentId/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      
      // Verify student access
      if (user.role === 'student') {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const submissions = await storage.getStudentSubmissions(studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Create assignment
  app.post('/api/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      console.log("Assignment creation request received:", {
        body: req.body,
        userId: user.id,
        userRole: user.role
      });
      
      // Only company_admin and tutor can create assignments
      if (!['company_admin', 'tutor'].includes(user.role)) {
        console.log("Access denied for role:", user.role);
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignmentData = {
        ...req.body,
        createdBy: user.id,
        submissionDate: new Date(req.body.submissionDate) // Convert string to Date
      };
      console.log("Processing assignment data:", assignmentData);
      
      const validatedData = insertAssignmentSchema.parse(assignmentData);
      console.log("Validated assignment data:", validatedData);
      
      const assignment = await storage.createAssignment(validatedData);
      console.log("Assignment created successfully:", assignment.id);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create assignment" });
      }
    }
  });

  // Update assignment
  app.patch('/api/assignments/:id', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.id;
      
      // Verify user created this assignment or is company admin
      const existingAssignment = await storage.getAssignment(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      if (user.role === 'tutor' && existingAssignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== existingAssignment.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Convert submissionDate string to Date if present
      const updateData = { ...req.body };
      if (updateData.submissionDate && typeof updateData.submissionDate === 'string') {
        updateData.submissionDate = new Date(updateData.submissionDate);
      }
      
      const validatedData = insertAssignmentSchema.partial().parse(updateData);
      const updatedAssignment = await storage.updateAssignment(assignmentId, validatedData);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  // Delete assignment
  app.delete('/api/assignments/:id', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.id;
      
      // Verify user created this assignment or is company admin
      const existingAssignment = await storage.getAssignment(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      if (user.role === 'tutor' && existingAssignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== existingAssignment.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      await storage.deleteAssignment(assignmentId);
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // File upload for assignments
  app.post('/api/assignments/:id/upload', isAuthenticated, upload.array('files', 10), async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // Verify user has access to this assignment
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      if (user.role === 'tutor' && assignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Store files in memory
      const fileUrls: string[] = [];
      for (const file of files) {
        const fileId = randomUUID();
        global.uploadedFiles.set(fileId, {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date()
        });
        fileUrls.push(`/api/files/${fileId}`);
      }
      
      // Update assignment with file URLs
      const currentUrls = assignment.attachmentUrls || [];
      const updatedAssignment = await storage.updateAssignment(assignmentId, {
        attachmentUrls: [...currentUrls, ...fileUrls]
      });
      
      res.json({ 
        message: "Files uploaded successfully", 
        fileUrls,
        assignment: updatedAssignment 
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Student Portal - Assignment Viewing and Submission
  
  // Get student's assignments
  app.get('/api/students/:studentId/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const studentId = req.params.studentId;
      
      // Verify user is the student or has access
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      if (user.role === 'student' && student.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get assignments for student's classes
      const studentClasses = await storage.getClassesByStudent(studentId);
      const assignments: any[] = [];
      
      for (const classAssignment of studentClasses) {
        const classAssignments = await storage.getAssignmentsByClass(classAssignment.classId);
        assignments.push(...classAssignments);
      }
      
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Create or update submission (unified endpoint)
  app.post('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      
      // Only students can create submissions
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const submissionData = {
        ...req.body,
        studentId: student.id,
        submittedAt: req.body.isDraft ? undefined : new Date(),
        status: req.body.isDraft ? 'draft' : 'submitted'
      };
      
      const validatedData = insertSubmissionSchema.parse(submissionData);
      
      // Check if submission already exists
      const existingSubmissions = await storage.getStudentSubmissions(student.id);
      const existingSubmission = existingSubmissions.find(s => s.assignmentId === req.body.assignmentId);
      
      let submission;
      if (existingSubmission) {
        // Update existing submission
        submission = await storage.updateSubmission(existingSubmission.id, validatedData);
      } else {
        // Create new submission
        submission = await storage.createSubmission(validatedData);
      }
      
      res.status(existingSubmission ? 200 : 201).json(submission);
    } catch (error) {
      console.error("Error creating/updating submission:", error);
      res.status(500).json({ message: "Failed to save submission" });
    }
  });

  // Legacy create submission endpoint
  app.post('/api/assignments/:assignmentId/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.assignmentId;
      
      // Only students can create submissions
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        assignmentId,
        studentId: student.id
      });
      
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Update submission
  app.patch('/api/submissions/:id', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const submissionId = req.params.id;
      
      const existingSubmission = await storage.getSubmission(submissionId);
      if (!existingSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Students can only update their own submissions
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (!student || existingSubmission.studentId !== student.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const validatedData = insertSubmissionSchema.partial().parse(req.body);
      const updatedSubmission = await storage.updateSubmission(submissionId, validatedData);
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Get submissions for assignment (for tutors/admins)
  app.get('/api/assignments/:assignmentId/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.assignmentId;
      
      // Verify user has access to this assignment
      if (!['company_admin', 'tutor'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const submissions = await storage.getSubmissionsByAssignment(assignmentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Assignment file serving route
  app.get('/api/assignments/:assignmentId/files/:filename', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { assignmentId, filename } = req.params;
      const user = req.user!;
      
      // Verify user has access to this assignment
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Students can only access assignments for their classes
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        // Check if student is enrolled in the class for this assignment
        const studentClasses = await storage.getStudentClasses(student.id);
        const hasAccess = studentClasses.some(c => c.id === assignment.classId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // The filename parameter is actually the file ID
      const fileId = filename;
      console.log(`Looking for assignment file with ID: ${fileId}`);
      console.log("Available files in memory:", Array.from((global.uploadedFiles || new Map()).keys()));
      
      // First try to find the file in memory storage
      const uploadedFiles = global.uploadedFiles || new Map();
      const fileData = uploadedFiles.get(fileId);
      
      if (fileData) {
        console.log("Found assignment file in memory:", fileData.originalname);
        res.setHeader('Content-Disposition', `inline; filename="${fileData.originalname}"`);
        res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
        res.setHeader('Content-Length', fileData.size);
        return res.send(fileData.buffer);
      }
      
      // If not found in memory, try object storage
      console.log("File not found in memory, checking object storage...");
      try {
        const objectStorageService = new ObjectStorageService();
        
        // The file should be in the private directory as uploads/[fileId]
        const privateDir = objectStorageService.getPrivateObjectDir();
        const objectPath = `${privateDir}/uploads/${fileId}`;
        console.log("Trying to fetch from object storage path:", objectPath);
        
        // Parse the object path to get bucket and object name
        const pathParts = objectPath.split('/');
        const bucketName = pathParts[1]; // First part after leading slash
        const objectName = pathParts.slice(2).join('/'); // Rest of the path
        
        console.log("Bucket:", bucketName, "Object:", objectName);
        
        // Get the file directly from the bucket
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        
        // Check if file exists
        const [exists] = await file.exists();
        if (exists) {
          console.log("Found file in object storage, streaming...");
          
          // Get file metadata for debugging
          const [metadata] = await file.getMetadata();
          console.log("File metadata:", {
            name: metadata.name,
            contentType: metadata.contentType,
            size: metadata.size,
            metadata: metadata.metadata
          });
          
          // Try to get the assignment to find the original filename
          let originalFileName = undefined;
          try {
            const assignment = await storage.getAssignment(assignmentId);
            if (assignment) {
              // Find the attachment URL that contains this file ID
              const attachmentUrl = assignment.attachmentUrls?.find(url => url.includes(fileId));
              if (attachmentUrl) {
                originalFileName = metadata.metadata?.originalName || 
                                 metadata.metadata?.filename ||
                                 metadata.metadata?.['original-name'] ||
                                 `assignment-file.${metadata.contentType?.split('/')[1] || 'bin'}`;
              }
            }
          } catch (error) {
            console.log("Could not get assignment details for filename:", error);
          }
          
          console.log("Using filename:", originalFileName);
          await objectStorageService.downloadObject(file, res, 3600, originalFileName);
          return;
        } else {
          console.log("File does not exist in object storage");
        }
      } catch (error) {
        console.log("Object storage error:", error instanceof ObjectNotFoundError ? "File not found" : error);
      }
      
      console.error(`File ${fileId} not found in either memory storage or object storage`);
      return res.status(404).json({ message: "File not found" });
    } catch (error) {
      console.error("Error serving assignment file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Company students route
  app.get('/api/company/students', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
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

  // Student Portal API Routes
  app.get('/api/students/:studentId/terms', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { studentId } = req.params;
      const terms = await storage.getStudentTerms(studentId);
      res.json(terms);
    } catch (error) {
      console.error('Error fetching student terms:', error);
      res.status(500).json({ message: 'Failed to fetch terms' });
    }
  });

  app.get('/api/students/:studentId/classes', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { studentId } = req.params;
      const classes = await storage.getStudentClasses(studentId);
      res.json(classes);
    } catch (error) {
      console.error('Error fetching student classes:', error);
      res.status(500).json({ message: 'Failed to fetch classes' });
    }
  });

  app.get('/api/students/:studentId/assignments', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { studentId } = req.params;
      const assignments = await storage.getStudentAssignments(studentId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      res.status(500).json({ message: 'Failed to fetch assignments' });
    }
  });

  app.get('/api/students/:studentId/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { studentId } = req.params;
      const submissions = await storage.getStudentSubmissions(studentId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  // Get student profile from user ID
  app.get('/api/auth/student-profile', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      res.json(student);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ message: 'Failed to fetch student profile' });
    }
  });

  // Student submission routes
  app.post('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { assignmentId, content, status = 'submitted' } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      const submission = await storage.createSubmission({
        assignmentId,
        studentId: student.id,
        content,
        status,
        submittedAt: new Date()
      });
      
      res.json(submission);
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({ message: 'Failed to create submission' });
    }
  });

  app.patch('/api/submissions', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const { id, content, status } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      const submission = await storage.updateSubmission(id, {
        content,
        status,
        submittedAt: new Date()
      });
      
      res.json(submission);
    } catch (error) {
      console.error('Error updating submission:', error);
      res.status(500).json({ message: 'Failed to update submission' });
    }
  });

  // Simple file upload route
  app.post('/api/homework/upload-direct', isAuthenticated, upload.single('file'), async (req: AuthenticatedRequest, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("Simple file upload:", req.file.originalname, "Size:", req.file.size);

      // Simple in-memory storage
      const fileId = randomUUID();
      const fileUrl = `/api/files/${fileId}`;

      // Store file in memory with file ID
      global.uploadedFiles = global.uploadedFiles || new Map();
      global.uploadedFiles.set(fileId, {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      });

      console.log("File stored with ID:", fileId);
      res.json({
        success: true,
        fileUrl: fileUrl,
        fileId: fileId,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Simple file download route
  app.get('/api/files/:fileId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { fileId } = req.params;
      console.log(`Looking for file with ID: ${fileId}`);

      const uploadedFiles = global.uploadedFiles || new Map();
      console.log("Available files:", Array.from(uploadedFiles.keys()));

      if (uploadedFiles.has(fileId)) {
        const file = uploadedFiles.get(fileId);
        if (file) {
          console.log("Found file:", file.originalname);

          // Set proper headers for download
          res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
          res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
          res.setHeader('Content-Length', file.size);

          // Send the file buffer
          return res.send(file.buffer);
        }
      }

      console.error(`File ${fileId} not found`);
      res.status(404).json({ message: "File not found" });
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Message routes
  app.get('/api/messages/:receiverId', isAuthenticated, async (req: any, res: any) => {
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

  app.post('/api/messages', isAuthenticated, async (req: any, res: any) => {
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
  app.get("/api/students/:studentId", isAuthenticated, async (req: any, res: any) => {
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
  app.patch("/api/students/:studentId", isAuthenticated, async (req: any, res: any) => {
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
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Progress routes (without assignments)
  app.get('/api/progress', isAuthenticated, async (req: any, res: any) => {
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

  app.post('/api/progress', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'student') {
        return res.status(403).json({ message: "Only students can create progress entries" });
      }

      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const validatedData = insertProgressSchema.parse({
        ...req.body,
        studentId: student.id,
      });

      const progress = await storage.createProgress(validatedData);
      res.json(progress);
    } catch (error) {
      console.error("Error creating progress:", error);
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  // Calendar routes
  app.get('/api/calendar', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const events = await storage.getCalendarEventsByTutor(user.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      const validatedData = insertCalendarEventSchema.parse({
        ...req.body,
        createdBy: user.id,
      });

      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  // Administrative routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res: any) => {
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

  // Company management routes
  app.get('/api/companies', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      let companies: any[] = [];
      if (user.role === 'admin') {
        companies = await storage.getAllCompanies();
      } else {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          const company = await storage.getCompany(companyAdmin.companyId);
          companies = company ? [company] : [];
        } else {
          companies = [];
        }
      }

      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:companyId/tutors', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const tutors = await storage.getTutorsByCompany(companyId);
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching company tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.get('/api/companies/:companyId/students', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const students = await storage.getCompanyStudentsByCompanyId(companyId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching company students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Company detail route - ADD THIS MISSING ROUTE
  app.get('/api/companies/:companyId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const company = await storage.getTutoringCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Academic management routes
  app.get('/api/admin/company-admin/:userId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const companyAdmin = await storage.getCompanyAdminByUserId(userId);
      res.json(companyAdmin);
    } catch (error) {
      console.error("Error fetching company admin:", error);
      res.status(500).json({ message: "Failed to fetch company admin" });
    }
  });

  app.get('/api/admin/academic-years', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      let years;
      if (user.role === 'admin') {
        years = await storage.getAcademicYearsByCompany("");
      } else {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          years = await storage.getAcademicYearsByCompany(companyAdmin.companyId);
        } else {
          years = [];
        }
      }

      res.json(years);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      res.status(500).json({ message: "Failed to fetch academic years" });
    }
  });

  app.post('/api/admin/academic-years', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      let yearData = req.body;
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin) {
          return res.status(404).json({ message: "Company admin profile not found" });
        }
        yearData.companyId = companyAdmin.companyId;
      }

      const validatedData = insertAcademicYearSchema.parse(yearData);
      const year = await storage.createAcademicYear(validatedData);
      res.json(year);
    } catch (error) {
      console.error("Error creating academic year:", error);
      res.status(500).json({ message: "Failed to create academic year" });
    }
  });

  // Academic Years routes
  app.get('/api/companies/:companyId/academic-years', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const years = await storage.getAcademicYearsByCompany(companyId);
      res.json(years);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      res.status(500).json({ message: "Failed to fetch academic years" });
    }
  });

  app.post('/api/companies/:companyId/academic-years', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const validatedData = insertAcademicYearSchema.parse({
        ...req.body,
        companyId
      });

      const year = await storage.createAcademicYear(validatedData);
      res.json(year);
    } catch (error) {
      console.error("Error creating academic year:", error);
      res.status(500).json({ message: "Failed to create academic year" });
    }
  });

  // Academic Terms routes
  app.get('/api/companies/:companyId/academic-terms', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const { yearId } = req.query;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      let terms;
      if (yearId) {
        terms = await storage.getAcademicTermsByYear(yearId as string);
      } else {
        terms = await storage.getAcademicTermsByCompany(companyId);
      }

      res.json(terms);
    } catch (error) {
      console.error("Error fetching academic terms:", error);
      res.status(500).json({ message: "Failed to fetch academic terms" });
    }
  });

  app.post('/api/companies/:companyId/academic-terms', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const validatedData = insertAcademicTermSchema.parse({
        ...req.body,
        companyId
      });

      const term = await storage.createAcademicTerm(validatedData);
      res.json(term);
    } catch (error) {
      console.error("Error creating academic term:", error);
      res.status(500).json({ message: "Failed to create academic term" });
    }
  });

  // Classes routes
  app.get('/api/companies/:companyId/classes', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const { termId } = req.query;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      let classes;
      if (termId) {
        classes = await storage.getClassesByTerm(termId as string);
      } else {
        classes = await storage.getClassesByCompany(companyId);
      }

      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/companies/:companyId/classes', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const validatedData = insertClassSchema.parse({
        ...req.body,
        companyId
      });

      const classItem = await storage.createClass(validatedData);
      res.json(classItem);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.put('/api/companies/:companyId/classes/:classId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const validatedData = insertClassSchema.parse({
        ...req.body,
        companyId
      });

      const classItem = await storage.updateClass(classId, validatedData);
      res.json(classItem);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  // Academic hierarchy route
  app.get('/api/companies/:companyId/academic-hierarchy', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;

      if (user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }

      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

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

  // Data clearing routes (admin only)
  app.delete('/api/admin/clear-assignments', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Assignment functionality removed - this route is now deprecated
      // await storage.clearAllAssignments();
      // await storage.clearAllSubmissions();

      res.json({ message: "Assignment clearing functionality has been deprecated" });
    } catch (error) {
      console.error("Error clearing assignments:", error);
      res.status(500).json({ message: "Failed to clear assignments" });
    }
  });



  // Object storage upload endpoint
  app.post('/api/objects/upload', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Serve uploaded objects (for file viewing)
  app.get('/objects/:objectPath(*)', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Create HTTP server without WebSocket conflicts
  const httpServer = createServer(app);

  // Note: WebSocket setup disabled to prevent conflicts with Vite HMR
  // Real-time messaging can be implemented with polling or SSE if needed

  return httpServer;
}

// Assignment functionality has been removed from the application