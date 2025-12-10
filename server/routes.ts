import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { setupCustomAuth, isAuthenticated, sendHomeworkSubmissionEmail } from "./customAuth";
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

// Helper function to parse object path
function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function notifyParentOfSubmission(
  studentId: string, 
  assignmentId: string, 
  submittedAt: Date,
  status: string
) {
  try {
    const parentInfo = await storage.getParentUserByStudentId(studentId);
    if (!parentInfo) {
      console.log('No parent found for student, skipping notification');
      return;
    }
    
    const student = await storage.getStudent(studentId);
    if (!student) return;
    
    const studentUser = await storage.getUser(student.userId);
    if (!studentUser) return;
    
    const assignment = await storage.getAssignment(assignmentId);
    if (!assignment) return;
    
    let isLate = false;
    if (assignment.submissionDate) {
      isLate = submittedAt > new Date(assignment.submissionDate);
    } else {
      console.log(`Assignment ${assignmentId} has no due date, marking as on-time`);
    }
    
    await sendHomeworkSubmissionEmail({
      parentEmail: parentInfo.email,
      parentFirstName: parentInfo.firstName,
      studentFirstName: studentUser.firstName || '',
      studentLastName: studentUser.lastName || '',
      assignmentTitle: assignment.title,
      submittedAt,
      isLate,
      status
    });
    
    console.log(`Parent notification sent to ${parentInfo.email} for assignment: ${assignment.title}`);
  } catch (error) {
    console.error('Failed to send parent notification:', error);
  }
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
  app.get('/api/companies/:companyId/assignments', isAuthenticated, async (req: any, res: any) => {
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
  app.get('/api/classes/:classId/assignments', isAuthenticated, async (req: any, res: any) => {
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
  app.get('/api/students/:studentId/terms', isAuthenticated, async (req: any, res: any) => {
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
  app.get('/api/students/:studentId/classes', isAuthenticated, async (req: any, res: any) => {
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

  // Get student's submissions
  app.get('/api/students/:studentId/submissions', isAuthenticated, async (req: any, res: any) => {
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
  app.post('/api/assignments', isAuthenticated, async (req: any, res: any) => {
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
  app.patch('/api/assignments/:id', isAuthenticated, async (req: any, res: any) => {
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
  app.delete('/api/assignments/:id', isAuthenticated, async (req: any, res: any) => {
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
  app.post('/api/assignments/:id/upload', isAuthenticated, upload.array('files', 10), async (req: any, res: any) => {
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
  app.get('/api/students/:studentId/assignments', isAuthenticated, async (req: any, res: any) => {
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
      
      // Enrich assignments with worksheet data if applicable
      const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
        if (assignment.assignmentKind === 'worksheet' && assignment.worksheetId) {
          const worksheet = await storage.getWorksheetWithDetails(assignment.worksheetId);
          return { ...assignment, worksheet };
        }
        return assignment;
      }));
      
      // Filter out correctAnswer field - students should not see this
      const safeAssignments = enrichedAssignments.map(({ correctAnswer, ...assignment }) => assignment);
      
      res.json(safeAssignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Create or update submission (unified endpoint)
  app.post('/api/submissions', isAuthenticated, async (req: any, res: any) => {
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
      
      // Check if submission already exists for this specific document
      const existingSubmissions = await storage.getStudentSubmissions(student.id);
      const existingSubmission = existingSubmissions.find(s => 
        s.assignmentId === req.body.assignmentId && 
        s.documentUrl === req.body.documentUrl
      );
      
      let submission;
      if (existingSubmission) {
        // Update existing submission
        submission = await storage.updateSubmission(existingSubmission.id, validatedData);
      } else {
        // Create new submission
        submission = await storage.createSubmission(validatedData);
      }
      
      // Send parent notification if this is a final submission (not a draft)
      if (!req.body.isDraft && req.body.assignmentId) {
        const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : new Date();
        notifyParentOfSubmission(student.id, req.body.assignmentId, submissionTime, 'submitted');
      }
      
      res.status(existingSubmission ? 200 : 201).json(submission);
    } catch (error) {
      console.error("Error creating/updating submission:", error);
      res.status(500).json({ message: "Failed to save submission" });
    }
  });

  // Legacy create submission endpoint
  app.post('/api/assignments/:assignmentId/submissions', isAuthenticated, async (req: any, res: any) => {
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
      
      // Send parent notification if this is a final submission
      if (!req.body.isDraft) {
        const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : new Date();
        notifyParentOfSubmission(student.id, assignmentId, submissionTime, 'submitted');
      }
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Update submission
  app.patch('/api/submissions/:id', isAuthenticated, async (req: any, res: any) => {
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
      
      // Handle status changes and submission timestamps
      const updateData = { ...req.body };
      if (updateData.status === 'submitted' && !updateData.submittedAt) {
        updateData.submittedAt = new Date();
      } else if (updateData.status === 'draft') {
        updateData.submittedAt = null;
      }
      
      const validatedData = insertSubmissionSchema.partial().parse(updateData);
      const updatedSubmission = await storage.updateSubmission(submissionId, validatedData);
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Get submissions for assignment (for tutors/admins and students for their own submissions)
  app.get('/api/assignments/:assignmentId/submissions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.assignmentId;
      
      // Allow students to access their own submissions for an assignment
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        // Return only this student's submissions for the assignment
        const submissions = await storage.getSubmissionsByAssignmentAndStudent(assignmentId, student.id);
        return res.json(submissions);
      }
      
      // For company_admin and tutor, return all submissions
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
  app.get('/api/assignments/:assignmentId/files/:filename', isAuthenticated, async (req: any, res: any) => {
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
          
          // Get proper filename from content type and metadata
          let filename = `assignment-file`;
          
          // Try to get original filename from object metadata
          if (metadata.metadata?.originalName) {
            filename = metadata.metadata.originalName;
          } else if (metadata.metadata?.filename) {
            filename = metadata.metadata.filename;
          } else if (metadata.contentType) {
            // Map content types to proper extensions
            const contentTypeMap: Record<string, string> = {
              'application/pdf': 'pdf',
              'application/msword': 'doc',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
              'application/vnd.ms-excel': 'xls',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
              'image/png': 'png',
              'image/jpeg': 'jpg',
              'text/plain': 'txt'
            };
            
            const extension = contentTypeMap[metadata.contentType] || 'bin';
            filename = `assignment-file.${extension}`;
          }
          
          console.log("Using filename:", filename);
          
          // Set proper headers for download
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
          res.setHeader('Content-Length', metadata.size);
          
          // Stream the file directly without using downloadObject method
          const stream = file.createReadStream();
          stream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error streaming file' });
            }
          });
          stream.pipe(res);
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
  app.get('/api/company/students', isAuthenticated, async (req: any, res: any) => {
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
  app.get('/api/students/:studentId/terms', isAuthenticated, async (req: any, res: any) => {
    try {
      const { studentId } = req.params;
      const terms = await storage.getStudentTerms(studentId);
      res.json(terms);
    } catch (error) {
      console.error('Error fetching student terms:', error);
      res.status(500).json({ message: 'Failed to fetch terms' });
    }
  });

  app.get('/api/students/:studentId/classes', isAuthenticated, async (req: any, res: any) => {
    try {
      const { studentId } = req.params;
      const classes = await storage.getStudentClasses(studentId);
      res.json(classes);
    } catch (error) {
      console.error('Error fetching student classes:', error);
      res.status(500).json({ message: 'Failed to fetch classes' });
    }
  });

  app.get('/api/students/:studentId/submissions', isAuthenticated, async (req: any, res: any) => {
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
  app.get('/api/auth/student-profile', isAuthenticated, async (req: any, res: any) => {
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

  // Accept terms and privacy policy
  app.post('/api/users/accept-terms', isAuthenticated, async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { version } = req.body;
      if (!version) {
        return res.status(400).json({ message: 'Terms version is required' });
      }

      await storage.updateUser(userId, {
        termsAcceptedAt: new Date(),
        termsVersion: version,
      });

      res.json({ success: true, message: 'Terms accepted successfully' });
    } catch (error) {
      console.error('Error accepting terms:', error);
      res.status(500).json({ message: 'Failed to accept terms' });
    }
  });

  // Get all submissions for company review
  app.get('/api/company/submissions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      
      // Only company admins can access this
      if (user.role !== 'company_admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin profile not found" });
      }
      
      // Get all submissions for students in this company
      const submissions = await storage.getCompanySubmissions(companyAdmin.companyId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching company submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Simple file upload route
  app.post('/api/homework/upload-direct', isAuthenticated, upload.single('file'), async (req: any, res: any) => {
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

  // Parent routes - Get parent profile
  app.get("/api/parents/me", isAuthenticated, async (req: any, res: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== 'parent') return res.status(403).json({ message: "Parent access required" });

    try {
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent profile not found" });
      }
      res.json({ ...parent, user });
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get parent's children with their assignment progress
  app.get("/api/parents/children", isAuthenticated, async (req: any, res: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== 'parent') return res.status(403).json({ message: "Parent access required" });

    try {
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent profile not found" });
      }

      const children = await storage.getParentChildrenWithProgress(parent.id);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific child's details and assignments (parent only)
  app.get("/api/parents/children/:studentId", isAuthenticated, async (req: any, res: any) => {
    const user = req.user;
    const { studentId } = req.params;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== 'parent') return res.status(403).json({ message: "Parent access required" });

    try {
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent profile not found" });
      }

      // Verify this child belongs to the parent
      const children = await storage.getParentChildrenWithProgress(parent.id);
      const child = children.find(c => c.id === studentId);
      
      if (!child) {
        return res.status(403).json({ message: "This child is not linked to your account" });
      }

      res.json(child);
    } catch (error) {
      console.error("Error fetching child details:", error);
      res.status(500).json({ message: "Internal server error" });
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
      const allowedFields = ['schoolName', 'classId', 'tutorId', 'gradeLevel'];
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

  // ==========================================
  // CALENDAR & ATTENDANCE SYSTEM ROUTES
  // ==========================================

  // Get calendar data for company admin
  app.get('/api/calendar/company', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin not found" });
      }

      const { startDate, endDate, classId, tutorId, status } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const sessions = await storage.getClassSessionsByCompany(companyAdmin.companyId, start, end);
      const holidays = await storage.getAcademicHolidaysByCompany(companyAdmin.companyId);

      // Filter by additional criteria if provided
      let filteredSessions = sessions;
      if (classId) {
        filteredSessions = filteredSessions.filter((s: any) => s.session.classId === classId);
      }
      if (tutorId) {
        filteredSessions = filteredSessions.filter((s: any) => s.session.tutorId === tutorId);
      }
      if (status) {
        filteredSessions = filteredSessions.filter((s: any) => s.session.status === status);
      }

      res.json({ sessions: filteredSessions, holidays });
    } catch (error) {
      console.error("Error fetching company calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  // Get calendar data for tutor
  app.get('/api/calendar/tutor', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const { startDate, endDate, status } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const sessions = await storage.getClassSessionsByTutor(tutor.id, start, end);
      const holidays = tutor.companyId 
        ? await storage.getAcademicHolidaysByCompany(tutor.companyId)
        : await storage.getPublicHolidays(start, end);

      // Filter by status if provided
      let filteredSessions = sessions;
      if (status) {
        filteredSessions = filteredSessions.filter((s: any) => s.status === status);
      }

      res.json({ sessions: filteredSessions, holidays });
    } catch (error) {
      console.error("Error fetching tutor calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  // Get calendar data for student
  app.get('/api/calendar/student', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['student', 'parent', 'tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      let studentId = req.query.studentId as string;
      
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        studentId = student.id;
      } else if (user.role === 'parent' && studentId) {
        // Verify parent has access to this student
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        const children = await storage.getStudentsByParent(parent.id);
        if (!children.find(c => c.id === studentId)) {
          return res.status(403).json({ message: "Access denied to this student" });
        }
      }

      if (!studentId) {
        return res.status(400).json({ message: "Student ID required" });
      }

      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const sessions = await storage.getClassSessionsByStudent(studentId, start, end);
      const assignments = await storage.getStudentAssignments(studentId);
      const holidays = await storage.getPublicHolidays(start, end);

      // Get homework deadlines
      const homeworkDeadlines = assignments
        .filter(a => a.dueDate)
        .map(a => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          type: 'homework',
          status: a.status,
        }));

      res.json({ sessions, holidays, homeworkDeadlines });
    } catch (error) {
      console.error("Error fetching student calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  // Get calendar data for parent (child's view)
  app.get('/api/calendar/parent', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      const { startDate, endDate, childId } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      // Get all children's calendars
      const children = await storage.getStudentsByParent(parent.id);
      
      if (childId) {
        // Return specific child's calendar
        const child = children.find(c => c.id === childId);
        if (!child) {
          return res.status(404).json({ message: "Child not found" });
        }
        const sessions = await storage.getClassSessionsByStudent(child.id, start, end);
        const assignments = await storage.getStudentAssignments(child.id);
        const holidays = await storage.getPublicHolidays(start, end);
        
        const homeworkDeadlines = assignments
          .filter(a => a.dueDate)
          .map(a => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            type: 'homework',
          }));

        res.json({ 
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          sessions, 
          holidays, 
          homeworkDeadlines 
        });
      } else {
        // Return all children's summary
        const childrenCalendars = await Promise.all(children.map(async child => {
          const sessions = await storage.getClassSessionsByStudent(child.id, start, end);
          const attendanceSummary = await storage.getStudentAttendanceSummary(child.id, start, end);
          return {
            childId: child.id,
            childName: `${child.firstName} ${child.lastName}`,
            sessionCount: sessions.length,
            attendanceSummary,
          };
        }));

        const holidays = await storage.getPublicHolidays(start, end);
        res.json({ children: childrenCalendars, holidays });
      }
    } catch (error) {
      console.error("Error fetching parent calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  // Get sessions for a specific date (Company roll-call view)
  app.get('/api/sessions/today', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin not found" });
      }

      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();

      const sessions = await storage.getClassSessionsForDate(companyAdmin.companyId, targetDate);
      
      // Get attendance for each session
      const sessionsWithAttendance = await Promise.all(sessions.map(async (s: any) => {
        const attendance = await storage.getAttendanceBySession(s.session.id);
        const studentAssignments = await storage.getStudentsByClass(s.session.classId);
        return {
          ...s,
          attendance,
          enrolledCount: studentAssignments.length,
          attendedCount: attendance.filter((a: any) => 
            a.attendance?.status === 'present' || a.attendance?.status === 'late'
          ).length,
        };
      }));

      res.json(sessionsWithAttendance);
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Create class session
  app.post('/api/sessions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const session = await storage.createClassSession(req.body);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Get session details
  app.get('/api/sessions/:sessionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getClassSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const classData = await storage.getClass(session.classId);
      const attendance = await storage.getAttendanceBySession(sessionId);
      const studentAssignments = await storage.getStudentsByClass(session.classId);

      res.json({
        session,
        class: classData,
        attendance,
        enrolledCount: studentAssignments.length,
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Update session
  app.patch('/api/sessions/:sessionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { sessionId } = req.params;
      const session = await storage.updateClassSession(sessionId, req.body);
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Generate sessions for a class
  app.post('/api/classes/:classId/generate-sessions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId } = req.params;
      const { termStartDate, termEndDate } = req.body;

      const sessions = await storage.generateSessionsForClass(
        classId,
        new Date(termStartDate),
        new Date(termEndDate)
      );

      res.json({ message: `Generated ${sessions.length} sessions`, sessions });
    } catch (error) {
      console.error("Error generating sessions:", error);
      res.status(500).json({ message: "Failed to generate sessions" });
    }
  });

  // ==========================================
  // ATTENDANCE ROUTES
  // ==========================================

  // Get attendance for a session
  app.get('/api/sessions/:sessionId/attendance', isAuthenticated, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const attendance = await storage.getAttendanceBySession(sessionId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Mark attendance for a session
  app.post('/api/sessions/:sessionId/attendance', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { sessionId } = req.params;
      
      // Check if session attendance is locked
      const session = await storage.getClassSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session.attendanceLocked && user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Attendance is locked for this session" });
      }

      const { studentId, status, notes } = req.body;

      const attendance = await storage.markAttendance({
        sessionId,
        studentId,
        status,
        markedBy: user.id,
        markedAt: new Date(),
        notes,
      });

      res.json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  // Bulk mark attendance
  app.post('/api/sessions/:sessionId/attendance/bulk', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { sessionId } = req.params;
      const { attendanceList } = req.body; // [{studentId, status, notes?}]

      const session = await storage.getClassSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session.attendanceLocked && user.role !== 'admin' && user.role !== 'company_admin') {
        return res.status(403).json({ message: "Attendance is locked for this session" });
      }

      const results = await Promise.all(attendanceList.map(async (item: any) => {
        return storage.markAttendance({
          sessionId,
          studentId: item.studentId,
          status: item.status,
          markedBy: user.id,
          markedAt: new Date(),
          notes: item.notes,
        });
      }));

      // Update session counts
      const presentCount = results.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      await storage.updateClassSession(sessionId, {
        attendedCount: presentCount,
        enrolledCount: attendanceList.length,
      });

      res.json({ message: "Attendance marked", results });
    } catch (error) {
      console.error("Error bulk marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  // Mark all present for a session
  app.post('/api/sessions/:sessionId/attendance/mark-all-present', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { sessionId } = req.params;
      await storage.markAllPresent(sessionId, user.id);
      
      res.json({ message: "All students marked present" });
    } catch (error) {
      console.error("Error marking all present:", error);
      res.status(500).json({ message: "Failed to mark all present" });
    }
  });

  // Override attendance (company admin/admin only)
  app.post('/api/attendance/:attendanceId/override', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { attendanceId } = req.params;
      const { status, notes } = req.body;

      const attendance = await storage.overrideAttendance(attendanceId, status, user.id, notes);
      res.json(attendance);
    } catch (error) {
      console.error("Error overriding attendance:", error);
      res.status(500).json({ message: "Failed to override attendance" });
    }
  });

  // Lock session attendance
  app.post('/api/sessions/:sessionId/lock-attendance', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { sessionId } = req.params;
      await storage.lockSessionAttendance(sessionId);
      
      res.json({ message: "Attendance locked" });
    } catch (error) {
      console.error("Error locking attendance:", error);
      res.status(500).json({ message: "Failed to lock attendance" });
    }
  });

  // Get student attendance summary
  app.get('/api/attendance/summary/student/:studentId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      // Verify access
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (!student || student.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === 'parent') {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        const children = await storage.getStudentsByParent(parent.id);
        if (!children.find(c => c.id === studentId)) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const summary = await storage.getStudentAttendanceSummary(studentId, start, end);
      const bySubject = await storage.getStudentAttendanceBySubject(studentId);
      const learningHours = await storage.getStudentLearningHours(studentId, start, end);

      res.json({ summary, bySubject, learningHours });
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      res.status(500).json({ message: "Failed to fetch attendance summary" });
    }
  });

  // ==========================================
  // ACADEMIC HOLIDAY ROUTES
  // ==========================================

  // Get holidays for company
  app.get('/api/holidays', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const { startDate, endDate } = req.query;

      let holidays;
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          holidays = await storage.getAcademicHolidaysByCompany(companyAdmin.companyId);
        }
      } else if (user.role === 'tutor') {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor?.companyId) {
          holidays = await storage.getAcademicHolidaysByCompany(tutor.companyId);
        }
      } else {
        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;
        holidays = await storage.getPublicHolidays(start, end);
      }

      res.json(holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  // Create holiday
  app.post('/api/holidays', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      let companyId = null;
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          companyId = companyAdmin.companyId;
        }
      }

      const holiday = await storage.createAcademicHoliday({
        ...req.body,
        companyId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      });

      res.json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });

  // Update holiday
  app.patch('/api/holidays/:holidayId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { holidayId } = req.params;
      const holiday = await storage.updateAcademicHoliday(holidayId, {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      res.json(holiday);
    } catch (error) {
      console.error("Error updating holiday:", error);
      res.status(500).json({ message: "Failed to update holiday" });
    }
  });

  // Delete holiday
  app.delete('/api/holidays/:holidayId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { holidayId } = req.params;
      await storage.deleteAcademicHoliday(holidayId);

      res.json({ message: "Holiday deleted" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Get tutor's students with attendance history
  app.get('/api/tutor/students-roster', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!['tutor', 'company_admin', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const { classId } = req.query;

      // Get classes for this tutor
      const classes = await storage.getClassesByTutor(tutor.id);
      
      // Filter by classId if provided
      const targetClasses = classId 
        ? classes.filter(c => c.id === classId)
        : classes;

      // Get students for each class with attendance info
      const classesWithStudents = await Promise.all(targetClasses.map(async (classData) => {
        const studentAssignments = await storage.getStudentsByClass(classData.id);
        
        const studentsWithDetails = await Promise.all(studentAssignments.map(async (assignment: any) => {
          const student = await storage.getStudent(assignment.studentId);
          if (!student) return null;
          
          const studentUser = await storage.getUser(student.userId);
          const attendanceSummary = await storage.getStudentAttendanceSummary(student.id);
          const parentInfo = await storage.getParentUserByStudentId(student.id);

          return {
            ...student,
            email: studentUser?.email,
            attendanceSummary,
            parentContact: parentInfo,
          };
        }));

        return {
          class: classData,
          students: studentsWithDetails.filter(Boolean),
          capacity: classData.maxStudents,
          enrolled: studentAssignments.length,
        };
      }));

      res.json(classesWithStudents);
    } catch (error) {
      console.error("Error fetching tutor roster:", error);
      res.status(500).json({ message: "Failed to fetch roster" });
    }
  });

  // Administrative routes
  
  // Admin stats endpoint for dashboard
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all users and calculate stats
      const users = await storage.getAllUsers();
      const activeUsers = users.filter(u => u.isActive && !u.isDeleted);
      
      // Count users by role
      const students = activeUsers.filter(u => u.role === 'student').length;
      const tutors = activeUsers.filter(u => u.role === 'tutor').length;
      const parents = activeUsers.filter(u => u.role === 'parent').length;
      const companyAdmins = activeUsers.filter(u => u.role === 'company_admin').length;
      const admins = activeUsers.filter(u => u.role === 'admin').length;
      
      // Get companies
      const companies = await storage.getAllCompanies();
      const activeCompanies = companies.filter(c => c.isActive).length;
      
      // Get all assignments count
      let totalAssignments = 0;
      let totalSubmissions = 0;
      let submittedCount = 0;
      
      try {
        for (const company of companies) {
          const assignments = await storage.getAssignmentsByCompany(company.id);
          totalAssignments += assignments.length;
          
          for (const assignment of assignments) {
            const submissions = await storage.getSubmissionsByAssignment(assignment.id);
            totalSubmissions += submissions.length;
            submittedCount += submissions.filter(s => s.status === 'submitted').length;
          }
        }
      } catch (e) {
        console.log('Error fetching assignment stats:', e);
      }
      
      const completionRate = totalSubmissions > 0 
        ? Math.round((submittedCount / totalSubmissions) * 100) 
        : 0;

      res.json({
        totalUsers: activeUsers.length,
        students,
        tutors,
        parents,
        companyAdmins,
        admins,
        totalCompanies: activeCompanies,
        totalAssignments,
        totalSubmissions,
        completionRate,
        systemStatus: 'Good'
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Create tutor endpoint for company admins
  app.post('/api/admin/create-tutor', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'company_admin' && user.role !== 'admin') {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }

      const { email, firstName, lastName, specialization, qualifications, companyId } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Verify company admin has access to this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user with tutor role
      const { hashPassword } = await import('./customAuth');
      const tempPassword = 'TempPass123!';
      const hashedPassword = await hashPassword(tempPassword);

      const newUser = await storage.createUserWithRole({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'tutor',
        isActive: true,
        isEmailVerified: true,
      });

      // Create tutor record with company association
      await storage.createTutor({
        userId: newUser.id,
        companyId: companyId || null,
        specialization: specialization || null,
        qualifications: qualifications || null,
        isVerified: false,
      });

      res.json({ 
        message: "Tutor created successfully", 
        user: { ...newUser, password: undefined },
        temporaryPassword: tempPassword
      });
    } catch (error) {
      console.error("Error creating tutor:", error);
      res.status(500).json({ message: "Failed to create tutor", error: (error as Error).message });
    }
  });

  // Update tutor endpoint
  app.patch('/api/tutors/:tutorId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const { tutorId } = req.params;

      if (user.role !== 'company_admin' && user.role !== 'admin') {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }

      const tutor = await storage.getTutor(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      // Verify company admin has access to this tutor's company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied to this tutor" });
        }
      }

      const { specialization, qualifications } = req.body;
      const updatedTutor = await storage.updateTutor(tutorId, { specialization, qualifications });
      res.json(updatedTutor);
    } catch (error) {
      console.error("Error updating tutor:", error);
      res.status(500).json({ message: "Failed to update tutor", error: (error as Error).message });
    }
  });

  // Create student endpoint for company admins
  app.post('/api/admin/create-student', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'company_admin' && user.role !== 'admin') {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }

      const { email, firstName, lastName, gradeLevel, schoolName, classId, tutorId, companyId } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Verify company admin has access to this company
      if (user.role === 'company_admin') {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user with student role
      const { hashPassword } = await import('./customAuth');
      const tempPassword = 'TempPass123!';
      const hashedPassword = await hashPassword(tempPassword);

      const newUser = await storage.createUserWithRole({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true,
      });

      // Create student record with company association
      await storage.createStudent({
        userId: newUser.id,
        companyId: companyId || null,
        gradeLevel: gradeLevel || null,
        schoolName: schoolName || null,
        classId: classId || null,
        tutorId: tutorId || null,
        parentId: null,
      });

      res.json({ 
        message: "Student created successfully", 
        user: { ...newUser, password: undefined },
        temporaryPassword: tempPassword
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student", error: (error as Error).message });
    }
  });

  // Update user endpoint for company admins
  app.patch('/api/admin/users/:userId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const { userId } = req.params;

      if (user.role !== 'company_admin' && user.role !== 'admin') {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }

      const { firstName, lastName, email } = req.body;
      const updatedUser = await storage.updateUser(userId, { firstName, lastName, email });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error: (error as Error).message });
    }
  });
  
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

  // Get deleted users with company info
  app.get('/api/admin/deleted-users', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deletedUsers = await storage.getDeletedUsers();
      
      // Enrich with company info based on role-specific data
      const enrichedUsers = await Promise.all(deletedUsers.map(async (user) => {
        let companyName = null;
        let companyId = null;
        
        try {
          if (user.role === 'student') {
            const student = await storage.getStudentByUserId(user.id);
            if (student?.companyId) {
              const company = await storage.getCompany(student.companyId);
              companyName = company?.name || null;
              companyId = student.companyId;
            }
          } else if (user.role === 'tutor') {
            const tutor = await storage.getTutorByUserId(user.id);
            if (tutor?.companyId) {
              const company = await storage.getCompany(tutor.companyId);
              companyName = company?.name || null;
              companyId = tutor.companyId;
            }
          } else if (user.role === 'company_admin') {
            const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
            if (companyAdmin?.companyId) {
              const company = await storage.getCompany(companyAdmin.companyId);
              companyName = company?.name || null;
              companyId = companyAdmin.companyId;
            }
          }
        } catch (e) {
          // Role-specific data may have been deleted
        }
        
        return {
          ...user,
          companyName,
          companyId
        };
      }));
      
      res.json(enrichedUsers);
    } catch (error) {
      console.error("Error fetching deleted users:", error);
      res.status(500).json({ message: "Failed to fetch deleted users" });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      const { userId } = req.params;

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Prevent deleting yourself
      if (user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId, user.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  // Archive (soft delete) a class
  app.patch('/api/companies/:companyId/classes/:classId/archive', isAuthenticated, async (req: any, res: any) => {
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

      await storage.deleteClass(classId); // This sets isActive to false
      res.json({ message: "Class archived successfully" });
    } catch (error) {
      console.error("Error archiving class:", error);
      res.status(500).json({ message: "Failed to archive class" });
    }
  });

  // Permanently delete a class
  app.delete('/api/companies/:companyId/classes/:classId', isAuthenticated, async (req: any, res: any) => {
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

      await storage.permanentlyDeleteClass(classId);
      res.json({ message: "Class deleted permanently" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Archive (soft delete) an academic term
  app.patch('/api/companies/:companyId/academic-terms/:termId/archive', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId, termId } = req.params;
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

      await storage.deleteAcademicTerm(termId); // This sets isActive to false
      res.json({ message: "Term archived successfully" });
    } catch (error) {
      console.error("Error archiving term:", error);
      res.status(500).json({ message: "Failed to archive term" });
    }
  });

  // Permanently delete an academic term
  app.delete('/api/companies/:companyId/academic-terms/:termId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId, termId } = req.params;
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

      await storage.permanentlyDeleteAcademicTerm(termId);
      res.json({ message: "Term deleted permanently" });
    } catch (error) {
      console.error("Error deleting term:", error);
      res.status(500).json({ message: "Failed to delete term" });
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
  app.post('/api/objects/upload', isAuthenticated, async (req: any, res: any) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Set metadata for uploaded object
  app.post('/api/objects/metadata', isAuthenticated, async (req: any, res: any) => {
    try {
      const { uploadURL, originalFileName } = req.body;
      
      if (!uploadURL || !originalFileName) {
        return res.status(400).json({ message: "uploadURL and originalFileName are required" });
      }

      const objectStorageService = new ObjectStorageService();
      await objectStorageService.setObjectMetadata(uploadURL, { originalName: originalFileName });
      
      res.json({ message: "Metadata set successfully" });
    } catch (error) {
      console.error("Error setting object metadata:", error);
      res.status(500).json({ message: "Failed to set metadata" });
    }
  });

  // Public document route for Google Docs Viewer (no authentication required)
  app.get('/api/public-objects/:objectPath(*)', async (req: any, res: any) => {
    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Get metadata to get original filename
      const [metadata] = await objectFile.getMetadata();
      const originalFileName = metadata.metadata?.originalName || 'assignment-file';
      
      // Serve the file directly with proper headers for Google Docs Viewer
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size?.toString() || '0',
        "Content-Disposition": `inline; filename="${originalFileName}"`,
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*", // Allow Google Docs Viewer to access
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Range"
      });

      // Download the entire file to buffer first
      const [fileContents] = await objectFile.download();
      res.end(fileContents);
    } catch (error) {
      console.error("Error accessing public object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Serve uploaded objects (for file viewing)
  app.get('/objects/:objectPath(*)', isAuthenticated, async (req: any, res: any) => {
    const objectStorageService = new ObjectStorageService();
    const isEditMode = req.query.edit === 'true';
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Get metadata to get original filename
      const [metadata] = await objectFile.getMetadata();
      const originalFileName = metadata.metadata?.originalName || 'assignment-file';
      const contentType = metadata.contentType || 'application/octet-stream';
      
      // If edit mode is requested, serve an HTML editor interface
      if (isEditMode) {
        const editorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assignment Editor - ${originalFileName}</title>
    <style>
        body {
            font-family: serif;
            font-size: 18px;
            line-height: 1.8;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
        }
        .editor-header {
            background: #f8f9fa;
            padding: 15px;
            border: 2px solid #000;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .editor-content {
            border: 2px solid #000;
            border-radius: 8px;
            min-height: 600px;
            background: white;
        }
        .editor-textarea {
            width: 100%;
            min-height: 600px;
            border: none;
            padding: 20px;
            font-family: serif;
            font-size: 18px;
            line-height: 1.8;
            resize: vertical;
            outline: none;
        }
        .btn {
            padding: 12px 24px;
            border: 2px solid #000;
            background: white;
            color: black;
            text-decoration: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            margin: 0 5px;
        }
        .btn:hover {
            background: #f8f9fa;
        }
        .btn-primary {
            background: black;
            color: white;
        }
        .btn-primary:hover {
            background: #333;
        }
        iframe {
            width: 100%;
            height: 500px;
            border: 2px solid #000;
            border-radius: 8px;
        }
        .file-preview {
            margin-bottom: 20px;
            padding: 15px;
            border: 2px solid #000;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            display: none;
        }
        .status.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .status.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="editor-header">
        <h1>Assignment Editor: ${originalFileName}</h1>
        <div>
            <button class="btn" onclick="downloadOriginal()">📥 Download Original</button>
            <button class="btn btn-primary" onclick="saveWork()">💾 Save Work</button>
            <button class="btn" onclick="submitAssignment()">📤 Submit Assignment</button>
        </div>
    </div>
    
    <div id="status" class="status"></div>
    
    <div class="file-preview">
        <h3>📄 Original Assignment File:</h3>
        <iframe src="${req.path}" frameborder="0"></iframe>
    </div>
    
    <div class="editor-content">
        <h3 style="padding: 15px 15px 0 15px; margin: 0;">✍️ Your Work Area:</h3>
        <textarea 
            class="editor-textarea" 
            placeholder="Complete your assignment here. You can reference the original file above and type your responses below...

📝 Instructions:
- Type your answers directly in this text area
- Your work is automatically saved every 30 seconds
- Use the 'Save Work' button to manually save
- Click 'Submit Assignment' when you're finished

Good luck with your assignment!"
            id="workArea"
        ></textarea>
    </div>

    <script>
        const objectPath = '${req.path}';
        const storageKey = 'assignment_work_' + objectPath.replace(/[^a-zA-Z0-9]/g, '_');
        
        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            status.style.display = 'block';
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
        
        function downloadOriginal() {
            const link = document.createElement('a');
            link.href = '${req.path}';
            link.download = '${originalFileName}';
            link.click();
            showStatus('File downloaded successfully!', 'success');
        }
        
        function saveWork() {
            const content = document.getElementById('workArea').value;
            if (content.trim()) {
                localStorage.setItem(storageKey, content);
                showStatus('Work saved successfully!', 'success');
                
                // Also try to save to server (if endpoint exists)
                fetch('/api/save-assignment-work', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        objectPath: objectPath,
                        content: content,
                        timestamp: new Date().toISOString()
                    })
                }).catch(() => {
                    // Fail silently, local storage will preserve the work
                });
            } else {
                showStatus('Please add some content before saving.', 'error');
            }
        }
        
        function submitAssignment() {
            const content = document.getElementById('workArea').value;
            if (content.trim()) {
                if (confirm('Are you sure you want to submit this assignment? You won\\'t be able to edit it after submission.')) {
                    saveWork();
                    showStatus('Assignment submitted successfully!', 'success');
                    
                    // Disable editing after submission
                    document.getElementById('workArea').readOnly = true;
                    document.querySelector('.btn-primary').disabled = true;
                }
            } else {
                showStatus('Please complete your assignment before submitting.', 'error');
            }
        }
        
        // Load saved work if available
        window.onload = function() {
            const savedWork = localStorage.getItem(storageKey);
            if (savedWork) {
                document.getElementById('workArea').value = savedWork;
                showStatus('Previous work restored.', 'success');
            }
        };
        
        // Auto-save every 30 seconds
        setInterval(() => {
            const content = document.getElementById('workArea').value;
            if (content.trim()) {
                localStorage.setItem(storageKey, content);
                console.log('Auto-saved at', new Date().toLocaleTimeString());
            }
        }, 30000);
        
        // Save on beforeunload
        window.addEventListener('beforeunload', function() {
            const content = document.getElementById('workArea').value;
            if (content.trim()) {
                localStorage.setItem(storageKey, content);
            }
        });
    </script>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        return res.send(editorHtml);
      }
      
      // Default behavior: serve the file directly
      objectStorageService.downloadObject(objectFile, res, 3600, originalFileName);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get object metadata including original filename
  app.get('/api/objects/:objectPath(*)/metadata', isAuthenticated, async (req: any, res: any) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      console.log("Getting metadata for object path:", objectPath);
      
      // Get the file path from the object storage bucket
      const privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
      if (!privateObjectDir) {
        throw new Error("PRIVATE_OBJECT_DIR not set");
      }
      
      let entityDir = privateObjectDir;
      if (!entityDir.endsWith("/")) {
        entityDir = `${entityDir}/`;
      }
      
      const entityId = req.params.objectPath;
      const objectEntityPath = `${entityDir}${entityId}`;
      const { bucketName, objectName } = parseObjectPath(objectEntityPath);
      
      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);
      
      const [exists] = await objectFile.exists();
      if (!exists) {
        return res.status(404).json({ error: "File not found" });
      }
      
      const [metadata] = await objectFile.getMetadata();
      res.json({
        originalName: metadata.metadata?.originalName || 'Unknown file',
        contentType: metadata.contentType,
        size: metadata.size
      });
    } catch (error) {
      console.error("Error getting object metadata:", error);
      return res.status(500).json({ error: "Failed to get metadata" });
    }
  });

  // Document converter - converts Word docs to HTML/images for viewing
  app.get('/api/convert-doc/:assignmentId', async (req, res) => {
    try {
      const { assignmentId } = req.params;
      
      // Get assignment to find the document URL
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Get the first attachment URL
      const documentUrl = assignment.attachmentUrls?.[0];
      if (!documentUrl) {
        return res.status(404).json({ error: 'No document attachment found' });
      }
      
      // Extract object path from Google Cloud Storage URL
      const match = documentUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid document URL format' });
      }
      
      const bucketName = match[1];
      const objectName = match[2];
      
      console.log(`Converting document: gs://${bucketName}/${objectName}`);
      
      try {
        // Get the file from Google Cloud Storage
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).json({ error: 'Document file not found in storage' });
        }
        
        // Get file metadata to determine type
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || 'application/octet-stream';
        
        if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
            contentType.includes('application/msword')) {
          
          // For Word documents, convert to HTML
          const mammoth = require('mammoth');
          
          // Download the file to a buffer
          const [fileBuffer] = await file.download();
          
          // Convert Word document to HTML
          const result = await mammoth.convertToHtml({ buffer: fileBuffer });
          const html = result.value;
          
          // Return HTML wrapped in a complete page
          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Document Viewer</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background: white;
                  color: black;
                }
                p { margin-bottom: 1em; }
                h1, h2, h3 { color: #333; margin-top: 1.5em; }
              </style>
            </head>
            <body>
              ${html}
            </body>
            </html>
          `;
          
          res.set({
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600',
          });
          
          return res.send(fullHtml);
          
        } else {
          // For other document types, just proxy the file
          res.set({
            'Content-Type': contentType,
            'Content-Length': metadata.size?.toString() || '0',
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=3600',
          });
          
          const stream = file.createReadStream();
          stream.pipe(res);
          
          stream.on('error', (error) => {
            console.error('Error streaming document:', error);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error streaming document file' });
            }
          });
        }
        
      } catch (storageError: any) {
        console.error('Google Cloud Storage error:', storageError);
        return res.status(500).json({ error: 'Failed to access document file' });
      }
      
    } catch (error) {
      console.error('Document conversion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Public document proxy for Google Docs Viewer (no authentication required)
  app.get('/api/public-doc/:assignmentId', async (req, res) => {
    try {
      const { assignmentId } = req.params;
      
      // Get assignment to find the document URL
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Get the first attachment URL
      const documentUrl = assignment.attachmentUrls?.[0];
      if (!documentUrl) {
        return res.status(404).json({ error: 'No document attachment found' });
      }
      
      // Extract object path from Google Cloud Storage URL
      const match = documentUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid document URL format' });
      }
      
      const bucketName = match[1];
      const objectName = match[2];
      
      console.log(`Serving public document: gs://${bucketName}/${objectName}`);
      
      try {
        // Get the file from Google Cloud Storage
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).json({ error: 'Document file not found in storage' });
        }
        
        // Get file metadata
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || 'application/octet-stream';
        
        // Set appropriate headers for public access
        res.set({
          'Content-Type': contentType,
          'Content-Length': metadata.size?.toString() || '0',
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
        
        // Stream the file to the response
        const stream = file.createReadStream();
        stream.pipe(res);
        
        stream.on('error', (error) => {
          console.error('Error streaming public document:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming document file' });
          }
        });
        
      } catch (storageError: any) {
        console.error('Google Cloud Storage error:', storageError);
        return res.status(500).json({ error: 'Failed to access document file' });
      }
      
    } catch (error) {
      console.error('Public document proxy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PDF Proxy endpoint for serving protected PDFs with authentication
  app.get('/api/pdf-proxy/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      
      // Get assignment to find the PDF URL
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Get the first attachment URL (assuming it's the PDF)
      const pdfUrl = assignment.attachmentUrls?.[0];
      if (!pdfUrl) {
        return res.status(404).json({ error: 'No PDF attachment found' });
      }
      
      // Extract object path from Google Cloud Storage URL
      const match = pdfUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid PDF URL format' });
      }
      
      const bucketName = match[1];
      const objectName = match[2];
      
      console.log(`Serving PDF: gs://${bucketName}/${objectName}`);
      
      try {
        // Get the file from Google Cloud Storage using the authenticated client
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).json({ error: 'PDF file not found in storage' });
        }
        
        // Get file metadata
        const [metadata] = await file.getMetadata();
        
        // Set appropriate headers
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': metadata.size?.toString() || '0',
          'Content-Disposition': 'inline', // Display in browser, not download
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        });
        
        // Stream the file to the response
        const stream = file.createReadStream();
        stream.pipe(res);
        
        stream.on('error', (error) => {
          console.error('Error streaming PDF:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming PDF file' });
          }
        });
        
      } catch (storageError: any) {
        console.error('Google Cloud Storage error:', storageError);
        if (storageError.code === 403) {
          return res.status(403).json({ error: 'Access denied to PDF file' });
        }
        return res.status(500).json({ error: 'Failed to access PDF file' });
      }
      
    } catch (error) {
      console.error('PDF proxy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin password verification endpoint (for Settings page security)
  app.post('/api/admin/verify-password', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { password } = req.body;
      if (!password || password.trim().length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Simple verification: accept any non-empty password for now
      // In production, verify against hashed password in database
      res.json({ success: true, message: "Password verified" });
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({ message: "Failed to verify password" });
    }
  });

  // ===== WORKSHEET SYSTEM ROUTES =====

  // Helper: Check if user can manage worksheets (tutor, company_admin, or admin)
  const canManageWorksheets = (user: any): boolean => {
    return user && ['admin', 'company_admin', 'tutor'].includes(user.role);
  };

  // Get all worksheets for a company
  app.get('/api/companies/:companyId/worksheets', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const worksheets = await storage.getWorksheetsByCompany(companyId);
      res.json(worksheets);
    } catch (error) {
      console.error('Error fetching worksheets:', error);
      res.status(500).json({ error: 'Failed to fetch worksheets' });
    }
  });

  // Create a new worksheet (tutors and company admins only)
  app.post('/api/companies/:companyId/worksheets', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can create worksheets' });
      }
      
      const { companyId } = req.params;
      
      const worksheetData = {
        ...req.body,
        companyId,
        createdBy: user.id,
      };
      
      const worksheet = await storage.createWorksheet(worksheetData);
      
      // Create first page automatically
      await storage.createWorksheetPage({
        worksheetId: worksheet.id,
        pageNumber: 1,
        title: 'Page 1',
      });
      
      res.status(201).json(worksheet);
    } catch (error) {
      console.error('Error creating worksheet:', error);
      res.status(500).json({ error: 'Failed to create worksheet' });
    }
  });

  // Get full worksheet with pages and questions
  app.get('/api/worksheets/:worksheetId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { worksheetId } = req.params;
      const worksheet = await storage.getFullWorksheet(worksheetId);
      
      if (!worksheet) {
        return res.status(404).json({ error: 'Worksheet not found' });
      }
      
      res.json(worksheet);
    } catch (error) {
      console.error('Error fetching worksheet:', error);
      res.status(500).json({ error: 'Failed to fetch worksheet' });
    }
  });

  // Update worksheet (tutors and company admins only)
  app.patch('/api/worksheets/:worksheetId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can update worksheets' });
      }
      
      const { worksheetId } = req.params;
      const worksheet = await storage.updateWorksheet(worksheetId, req.body);
      res.json(worksheet);
    } catch (error) {
      console.error('Error updating worksheet:', error);
      res.status(500).json({ error: 'Failed to update worksheet' });
    }
  });

  // Delete worksheet (tutors and company admins only)
  app.delete('/api/worksheets/:worksheetId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can delete worksheets' });
      }
      
      const { worksheetId } = req.params;
      await storage.deleteWorksheet(worksheetId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      res.status(500).json({ error: 'Failed to delete worksheet' });
    }
  });

  // Add page to worksheet (tutors and company admins only)
  app.post('/api/worksheets/:worksheetId/pages', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can modify worksheets' });
      }
      
      const { worksheetId } = req.params;
      const pages = await storage.getWorksheetPages(worksheetId);
      const nextPageNumber = pages.length + 1;
      
      const page = await storage.createWorksheetPage({
        worksheetId,
        pageNumber: nextPageNumber,
        title: req.body.title || `Page ${nextPageNumber}`,
      });
      
      res.status(201).json(page);
    } catch (error) {
      console.error('Error adding page:', error);
      res.status(500).json({ error: 'Failed to add page' });
    }
  });

  // Delete page (tutors and company admins only)
  app.delete('/api/worksheets/pages/:pageId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can modify worksheets' });
      }
      
      const { pageId } = req.params;
      await storage.deleteWorksheetPage(pageId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  });

  // Add question to page (tutors and company admins only)
  app.post('/api/worksheets/pages/:pageId/questions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can modify worksheets' });
      }
      
      const { pageId } = req.params;
      const questions = await storage.getWorksheetQuestions(pageId);
      const nextQuestionNumber = questions.length + 1;
      
      const question = await storage.createWorksheetQuestion({
        pageId,
        questionNumber: nextQuestionNumber,
        ...req.body,
      });
      
      res.status(201).json(question);
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  });

  // Update question (tutors and company admins only)
  app.patch('/api/worksheets/questions/:questionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can modify worksheets' });
      }
      
      const { questionId } = req.params;
      const question = await storage.updateWorksheetQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  });

  // Delete question (tutors and company admins only)
  app.delete('/api/worksheets/questions/:questionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can modify worksheets' });
      }
      
      const { questionId } = req.params;
      await storage.deleteWorksheetQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  // Assign worksheet to students/classes (tutors and company admins only)
  app.post('/api/worksheets/:worksheetId/assign', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user!;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: 'Only tutors and admins can assign worksheets' });
      }
      
      const { worksheetId } = req.params;
      const { studentIds, classIds, dueDate } = req.body;
      
      const assignmentResults = [];
      
      // Assign to individual students
      if (studentIds && studentIds.length > 0) {
        for (const studentId of studentIds) {
          const assignment = await storage.createWorksheetAssignment({
            worksheetId,
            studentId,
            assignedBy: user.id,
            dueDate: dueDate ? new Date(dueDate) : null,
          });
          assignmentResults.push(assignment);
        }
      }
      
      // Assign to classes - get all students in each class and assign to them
      if (classIds && classIds.length > 0) {
        for (const classId of classIds) {
          // Get all students assigned to this class
          const classStudents = await storage.getStudentsByClass(classId);
          
          for (const studentAssignment of classStudents) {
            const assignment = await storage.createWorksheetAssignment({
              worksheetId,
              studentId: studentAssignment.studentId,
              classId,
              assignedBy: user.id,
              dueDate: dueDate ? new Date(dueDate) : null,
            });
            assignmentResults.push(assignment);
          }
        }
      }
      
      res.status(201).json(assignmentResults);
    } catch (error) {
      console.error('Error assigning worksheet:', error);
      res.status(500).json({ error: 'Failed to assign worksheet' });
    }
  });

  // Get worksheet assignments
  app.get('/api/worksheets/:worksheetId/assignments', isAuthenticated, async (req: any, res: any) => {
    try {
      const { worksheetId } = req.params;
      const assignments = await storage.getWorksheetAssignments(worksheetId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Get student's assigned worksheets
  app.get('/api/students/:studentId/worksheets', isAuthenticated, async (req: any, res: any) => {
    try {
      const { studentId } = req.params;
      const assignments = await storage.getStudentWorksheetAssignments(studentId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching student worksheets:', error);
      res.status(500).json({ error: 'Failed to fetch worksheets' });
    }
  });

  // Save/Update student answer (students only)
  app.post('/api/worksheets/:worksheetId/answers', isAuthenticated, async (req: any, res: any) => {
    try {
      const { worksheetId } = req.params;
      const { questionId, studentId, textAnswer, handwritingData, selectedOption } = req.body;
      
      // Save the answer
      const answer = await storage.upsertWorksheetAnswer(questionId, studentId, worksheetId, {
        textAnswer,
        handwritingData,
        selectedOption,
      });
      
      // Update assignment status to in_progress if still assigned
      await storage.updateWorksheetAssignmentProgress(worksheetId, studentId);
      
      res.json(answer);
    } catch (error) {
      console.error('Error saving answer:', error);
      res.status(500).json({ error: 'Failed to save answer' });
    }
  });

  // Get student's answers for a worksheet
  app.get('/api/worksheets/:worksheetId/answers/:studentId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { worksheetId, studentId } = req.params;
      const answers = await storage.getWorksheetAnswers(worksheetId, studentId);
      res.json(answers);
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  });

  // Submit worksheet (final submission)
  app.post('/api/worksheets/:worksheetId/submit/:studentId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { worksheetId, studentId } = req.params;
      await storage.submitWorksheetAnswers(worksheetId, studentId);
      
      // Try to link worksheet submission to a standard assignment for status tracking
      // This allows the StudentPortal to correctly display worksheet completion status
      try {
        const assignmentWithWorksheet = await storage.getAssignmentByWorksheetAndStudent(worksheetId, studentId);
        if (assignmentWithWorksheet) {
          // Check if a submission already exists for this assignment/student
          const existingSubmissions = await storage.getSubmissionsByAssignmentAndStudent(assignmentWithWorksheet.id, studentId);
          const submissionTime = new Date();
          
          let savedSubmission;
          if (existingSubmissions.length > 0) {
            // Update existing submission to submitted status
            savedSubmission = await storage.updateSubmission(existingSubmissions[0].id, {
              status: 'submitted',
              isDraft: false,
              submittedAt: submissionTime,
            });
          } else {
            // Create new submission with all required and default fields
            const isLate = assignmentWithWorksheet.submissionDate 
              ? submissionTime > new Date(assignmentWithWorksheet.submissionDate) 
              : false;
            savedSubmission = await storage.createSubmission({
              assignmentId: assignmentWithWorksheet.id,
              studentId: studentId,
              status: 'submitted',
              isDraft: false,
              isLate,
              submittedAt: submissionTime,
              content: null,
              documentUrl: null,
              deviceType: null,
              inputMethod: null,
              fileUrls: [],
            });
          }
          
          // Send parent notification using the persisted submission timestamp
          const actualSubmissionTime = savedSubmission.submittedAt 
            ? new Date(savedSubmission.submittedAt) 
            : submissionTime;
          notifyParentOfSubmission(studentId, assignmentWithWorksheet.id, actualSubmissionTime, 'submitted');
        } else {
          console.log('Worksheet submission completed but no linked assignment found for parent notification');
        }
      } catch (linkError) {
        // Don't fail the worksheet submission if linking fails
        console.log('Note: Could not link worksheet submission to assignment:', linkError);
      }
      
      res.json({ success: true, message: 'Worksheet submitted successfully' });
    } catch (error) {
      console.error('Error submitting worksheet:', error);
      res.status(500).json({ error: 'Failed to submit worksheet' });
    }
  });

  // ============================================
  // Test/Exam Routes
  // ============================================
  
  // Get all tests for a company
  app.get('/api/companies/:companyId/tests', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const tests = await storage.getTestsByCompany(companyId);
      res.json(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ error: 'Failed to fetch tests' });
    }
  });

  // Create a new test
  app.post('/api/companies/:companyId/tests', isAuthenticated, async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const userId = req.user?.id;
      
      const testData = {
        ...req.body,
        companyId,
        createdBy: userId,
      };
      
      const test = await storage.createTest(testData);
      res.json(test);
    } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ error: 'Failed to create test' });
    }
  });

  // Get a specific test with questions
  app.get('/api/tests/:testId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const isStudent = req.user?.role === 'student';
      
      const testWithQuestions = await storage.getTestWithQuestions(testId);
      if (!testWithQuestions) {
        return res.status(404).json({ error: 'Test not found' });
      }
      
      // Filter out correct answers for students
      if (isStudent) {
        testWithQuestions.questions = testWithQuestions.questions.map((q: any) => ({
          ...q,
          correctAnswer: undefined,
          options: q.options ? (q.options as any[]).map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            // Remove isCorrect for students
          })) : null,
          explanation: undefined,
        }));
      }
      
      res.json(testWithQuestions);
    } catch (error) {
      console.error('Error fetching test:', error);
      res.status(500).json({ error: 'Failed to fetch test' });
    }
  });

  // Update a test
  app.patch('/api/tests/:testId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const test = await storage.updateTest(testId, req.body);
      res.json(test);
    } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ error: 'Failed to update test' });
    }
  });

  // Delete a test
  app.delete('/api/tests/:testId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      await storage.deleteTest(testId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting test:', error);
      res.status(500).json({ error: 'Failed to delete test' });
    }
  });

  // Add a question to a test
  app.post('/api/tests/:testId/questions', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const questionData = {
        ...req.body,
        testId,
      };
      const question = await storage.createTestQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  });

  // Update a question
  app.patch('/api/tests/questions/:questionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { questionId } = req.params;
      const question = await storage.updateTestQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  });

  // Delete a question
  app.delete('/api/tests/questions/:questionId', isAuthenticated, async (req: any, res: any) => {
    try {
      const { questionId } = req.params;
      await storage.deleteTestQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  // Assign test to students or class
  app.post('/api/tests/:testId/assign', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const { studentIds, classId, dueDate } = req.body;
      const userId = req.user?.id;
      
      const assignments = [];
      
      if (classId) {
        // Assign to entire class
        const assignment = await storage.createTestAssignment({
          testId,
          classId,
          assignedBy: userId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });
        assignments.push(assignment);
      }
      
      if (studentIds && Array.isArray(studentIds)) {
        // Assign to individual students
        for (const studentId of studentIds) {
          const assignment = await storage.createTestAssignment({
            testId,
            studentId,
            assignedBy: userId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
          });
          assignments.push(assignment);
        }
      }
      
      // Update test status to published if it was draft
      const test = await storage.getTest(testId);
      if (test && test.status === 'draft') {
        await storage.updateTest(testId, { status: 'published' });
      }
      
      res.json({ success: true, assignments });
    } catch (error) {
      console.error('Error assigning test:', error);
      res.status(500).json({ error: 'Failed to assign test' });
    }
  });

  // Get test assignments
  app.get('/api/tests/:testId/assignments', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const assignments = await storage.getTestAssignments(testId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching test assignments:', error);
      res.status(500).json({ error: 'Failed to fetch test assignments' });
    }
  });

  // Get student's assigned tests
  app.get('/api/students/:studentId/tests', isAuthenticated, async (req: any, res: any) => {
    try {
      const { studentId } = req.params;
      const testAssignments = await storage.getStudentTestAssignments(studentId);
      
      // Get attempt status for each test
      const attempts = await storage.getTestAttemptsByStudent(studentId);
      
      const testsWithStatus = testAssignments.map((ta: any) => {
        const testAttempts = attempts.filter(a => a.testId === ta.test.id);
        const hasAttempt = testAttempts.length > 0;
        const latestAttempt = testAttempts[0];
        
        return {
          ...ta,
          attemptStatus: hasAttempt ? latestAttempt.status : 'not_started',
          latestAttempt: latestAttempt || null,
        };
      });
      
      res.json(testsWithStatus);
    } catch (error) {
      console.error('Error fetching student tests:', error);
      res.status(500).json({ error: 'Failed to fetch student tests' });
    }
  });

  // Start a test attempt
  app.post('/api/tests/:testId/start', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const { studentId } = req.body;
      
      // Check if student already has an in-progress attempt
      const existingAttempts = await storage.getTestAttemptsByStudent(studentId);
      const inProgressAttempt = existingAttempts.find(a => a.testId === testId && a.status === 'in_progress');
      
      if (inProgressAttempt) {
        return res.json(inProgressAttempt);
      }
      
      // Check if retakes are allowed
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
      
      const submittedAttempts = existingAttempts.filter(a => a.testId === testId && a.status !== 'in_progress');
      if (submittedAttempts.length > 0 && !test.allowRetakes) {
        return res.status(400).json({ error: 'Retakes are not allowed for this test' });
      }
      
      const attempt = await storage.createTestAttempt({
        testId,
        studentId,
        status: 'in_progress',
      });
      
      res.json(attempt);
    } catch (error) {
      console.error('Error starting test:', error);
      res.status(500).json({ error: 'Failed to start test' });
    }
  });

  // Save/update a test answer
  app.post('/api/tests/attempts/:attemptId/answers', isAuthenticated, async (req: any, res: any) => {
    try {
      const { attemptId } = req.params;
      const { questionId, studentAnswer, selectedOption } = req.body;
      
      // Check if answer already exists
      const existingAnswers = await storage.getTestAnswersByAttempt(attemptId);
      const existingAnswer = existingAnswers.find(a => a.questionId === questionId);
      
      if (existingAnswer) {
        const updated = await storage.updateTestAnswer(existingAnswer.id, {
          studentAnswer,
          selectedOption,
        });
        return res.json(updated);
      }
      
      const answer = await storage.createTestAnswer({
        attemptId,
        questionId,
        studentAnswer,
        selectedOption,
      });
      
      res.json(answer);
    } catch (error) {
      console.error('Error saving answer:', error);
      res.status(500).json({ error: 'Failed to save answer' });
    }
  });

  // Get answers for a test attempt
  app.get('/api/tests/attempts/:attemptId/answers', isAuthenticated, async (req: any, res: any) => {
    try {
      const { attemptId } = req.params;
      const answers = await storage.getTestAnswersByAttempt(attemptId);
      res.json(answers);
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  });

  // Submit a test attempt
  app.post('/api/tests/attempts/:attemptId/submit', isAuthenticated, async (req: any, res: any) => {
    try {
      const { attemptId } = req.params;
      
      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }
      
      // Update attempt status
      const updatedAttempt = await storage.updateTestAttempt(attemptId, {
        status: 'submitted',
        submittedAt: new Date(),
      });
      
      // Auto-grade what we can
      const { totalScore, percentageScore } = await storage.autoGradeTestAttempt(attemptId);
      
      // Get the test to check if we should show results immediately
      const test = await storage.getTest(attempt.testId);
      
      res.json({
        ...updatedAttempt,
        autoGradedScore: totalScore,
        percentageScore,
        showResults: test?.showResultsImmediately || false,
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ error: 'Failed to submit test' });
    }
  });

  // Get all attempts for a test (for tutors)
  app.get('/api/tests/:testId/attempts', isAuthenticated, async (req: any, res: any) => {
    try {
      const { testId } = req.params;
      const attempts = await storage.getTestAttemptsByTest(testId);
      
      // Enrich with student info
      const enrichedAttempts = await Promise.all(attempts.map(async (attempt) => {
        const student = await storage.getStudent(attempt.studentId);
        const studentUser = student ? await storage.getUser(student.userId) : null;
        return {
          ...attempt,
          studentName: studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : 'Unknown',
        };
      }));
      
      res.json(enrichedAttempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  });

  // Grade a test attempt (manual grading)
  app.post('/api/tests/attempts/:attemptId/grade', isAuthenticated, async (req: any, res: any) => {
    try {
      const { attemptId } = req.params;
      const { answerGrades, feedback } = req.body;
      const userId = req.user?.id;
      
      // Update individual answer grades if provided
      if (answerGrades && Array.isArray(answerGrades)) {
        for (const grade of answerGrades) {
          await storage.updateTestAnswer(grade.answerId, {
            pointsAwarded: grade.pointsAwarded,
            feedback: grade.feedback,
            isCorrect: grade.isCorrect,
            gradedAt: new Date(),
          });
        }
      }
      
      // Calculate total score from all answers
      const answers = await storage.getTestAnswersByAttempt(attemptId);
      const totalScore = answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
      
      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }
      
      const test = await storage.getTest(attempt.testId);
      const percentageScore = test?.totalPoints ? Math.round((totalScore / test.totalPoints) * 100) : 0;
      const isPassed = test?.passingScore ? percentageScore >= test.passingScore : undefined;
      
      // Update attempt with final grade
      const gradedAttempt = await storage.updateTestAttempt(attemptId, {
        status: 'graded',
        totalScore,
        percentageScore,
        isPassed,
        gradedBy: userId,
        gradedAt: new Date(),
        feedback,
      });
      
      res.json(gradedAttempt);
    } catch (error) {
      console.error('Error grading attempt:', error);
      res.status(500).json({ error: 'Failed to grade attempt' });
    }
  });

  // =====================
  // AI ROUTES
  // =====================
  
  const { aiService } = await import('./services/ai');

  // Check if AI is configured
  app.get('/api/ai/status', isAuthenticated, async (req: any, res: any) => {
    res.json({ 
      configured: aiService.isConfigured(),
      message: aiService.isConfigured() 
        ? 'AI features are enabled' 
        : 'AI features require a GEMINI_API_KEY to be configured'
    });
  });

  // Generate worksheet/test questions
  app.post('/api/ai/generate-questions', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      // Only tutors and company admins can generate questions
      if (!['tutor', 'company_admin', 'admin'].includes(user?.role)) {
        return res.status(403).json({ error: 'Only tutors can generate questions' });
      }
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured. Please add GEMINI_API_KEY.' });
      }
      
      const { subject, topic, gradeLevel, questionTypes, count, difficulty } = req.body;
      
      if (!subject || !topic || !questionTypes || !count || !difficulty) {
        return res.status(400).json({ error: 'Missing required fields: subject, topic, questionTypes, count, difficulty' });
      }
      
      const questions = await aiService.generateQuestions({
        subject,
        topic,
        gradeLevel,
        questionTypes,
        count: Math.min(count, 10),
        difficulty
      });
      
      res.json({ questions });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      res.status(500).json({ error: error.message || 'Failed to generate questions' });
    }
  });

  // Get grading suggestion for essay/short answer
  app.post('/api/ai/grading-suggestion', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      // Only tutors and company admins can get grading suggestions
      if (!['tutor', 'company_admin', 'admin'].includes(user?.role)) {
        return res.status(403).json({ error: 'Only tutors can get grading suggestions' });
      }
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured. Please add GEMINI_API_KEY.' });
      }
      
      const { question, studentAnswer, correctAnswer, rubric, maxPoints } = req.body;
      
      if (!question || !studentAnswer || !maxPoints) {
        return res.status(400).json({ error: 'Missing required fields: question, studentAnswer, maxPoints' });
      }
      
      const suggestion = await aiService.getGradingSuggestion({
        question,
        studentAnswer,
        correctAnswer,
        rubric,
        maxPoints
      });
      
      res.json(suggestion);
    } catch (error: any) {
      console.error('Error getting grading suggestion:', error);
      res.status(500).json({ error: error.message || 'Failed to get grading suggestion' });
    }
  });

  // Get student hint (with parent control check)
  app.post('/api/ai/student-hint', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      // Only students can request hints
      if (user?.role !== 'student') {
        return res.status(403).json({ error: 'Only students can request hints' });
      }
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured' });
      }
      
      // Get student record to find parent
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      
      // Check parent's AI hint settings
      if (student.parentId) {
        const parent = await storage.getParent(student.parentId);
        if (parent && !parent.aiHintsEnabled) {
          return res.status(403).json({ 
            error: 'AI hints have been disabled by your parent. Please contact them to enable this feature.',
            parentControlled: true
          });
        }
      }
      
      const { question, questionType, correctAnswer, helpText, studentAttempt, hintLevel } = req.body;
      
      if (!question || !questionType) {
        return res.status(400).json({ error: 'Missing required fields: question, questionType' });
      }
      
      const hint = await aiService.getStudentHint({
        question,
        questionType,
        correctAnswer,
        helpText,
        studentAttempt,
        hintLevel: hintLevel || 1
      });
      
      res.json({ hint });
    } catch (error: any) {
      console.error('Error getting student hint:', error);
      res.status(500).json({ error: error.message || 'Failed to get hint' });
    }
  });

  // Generate progress insights for parents
  app.post('/api/ai/progress-insights', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      // Only parents can get progress insights
      if (user?.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can view progress insights' });
      }
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured. Please add GEMINI_API_KEY.' });
      }
      
      const { studentId } = req.body;
      
      if (!studentId) {
        return res.status(400).json({ error: 'Missing required field: studentId' });
      }
      
      // Verify parent has access to this student
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      
      const student = await storage.getStudent(studentId);
      if (!student || student.parentId !== parent.id) {
        return res.status(403).json({ error: 'You do not have access to this student' });
      }
      
      const studentUser = await storage.getUser(student.userId);
      if (!studentUser) {
        return res.status(404).json({ error: 'Student user not found' });
      }
      
      // Get student's submissions
      const submissions = await storage.getSubmissionsByStudent(studentId);
      const formattedSubmissions = await Promise.all(submissions.map(async (s) => {
        const assignment = await storage.getAssignment(s.assignmentId);
        return {
          assignmentTitle: assignment?.title || 'Unknown Assignment',
          subject: assignment?.subject || 'Unknown',
          score: undefined,
          maxScore: undefined,
          submittedAt: s.submittedAt?.toISOString() || s.createdAt?.toISOString() || new Date().toISOString(),
          isLate: s.isLate || false
        };
      }));
      
      // Get student's test results
      const testAttempts = await storage.getTestAttemptsByStudent(studentId);
      const formattedTests = await Promise.all(testAttempts.filter(t => t.status === 'graded').map(async (t) => {
        const test = await storage.getTest(t.testId);
        return {
          testTitle: test?.title || 'Unknown Test',
          subject: test?.subject || 'Unknown',
          score: t.totalScore || 0,
          totalPoints: test?.totalPoints || 100,
          completedAt: t.completedAt?.toISOString() || t.createdAt?.toISOString() || new Date().toISOString()
        };
      }));
      
      const insights = await aiService.generateProgressInsights({
        studentName: `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim() || 'Student',
        submissions: formattedSubmissions,
        testResults: formattedTests
      });
      
      res.json(insights);
    } catch (error: any) {
      console.error('Error generating progress insights:', error);
      res.status(500).json({ error: error.message || 'Failed to generate insights' });
    }
  });

  // Enhance content (question, help text, instructions)
  app.post('/api/ai/enhance-content', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      // Only tutors and company admins can enhance content
      if (!['tutor', 'company_admin', 'admin'].includes(user?.role)) {
        return res.status(403).json({ error: 'Only tutors can enhance content' });
      }
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured. Please add GEMINI_API_KEY.' });
      }
      
      const { content, contentType } = req.body;
      
      if (!content || !contentType) {
        return res.status(400).json({ error: 'Missing required fields: content, contentType' });
      }
      
      if (!['question', 'helpText', 'instructions'].includes(contentType)) {
        return res.status(400).json({ error: 'Invalid contentType. Must be: question, helpText, or instructions' });
      }
      
      const enhanced = await aiService.enhanceContent(content, contentType);
      
      res.json({ enhanced });
    } catch (error: any) {
      console.error('Error enhancing content:', error);
      res.status(500).json({ error: error.message || 'Failed to enhance content' });
    }
  });

  // Get parent settings
  app.get('/api/parents/settings', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can access settings' });
      }
      
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      
      res.json({
        id: parent.id,
        userId: parent.userId,
        aiHintsEnabled: parent.aiHintsEnabled ?? true,
        maxHintsPerQuestion: parent.maxHintsPerQuestion ?? 3
      });
    } catch (error: any) {
      console.error('Error getting parent settings:', error);
      res.status(500).json({ error: error.message || 'Failed to get settings' });
    }
  });

  // Update parent settings
  app.patch('/api/parents/settings', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can update settings' });
      }
      
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      
      const { aiHintsEnabled, maxHintsPerQuestion } = req.body;
      
      const updated = await storage.updateParent(parent.id, {
        aiHintsEnabled: aiHintsEnabled !== undefined ? aiHintsEnabled : parent.aiHintsEnabled,
        maxHintsPerQuestion: maxHintsPerQuestion !== undefined ? maxHintsPerQuestion : parent.maxHintsPerQuestion
      });
      
      res.json({
        id: updated.id,
        userId: updated.userId,
        aiHintsEnabled: updated.aiHintsEnabled ?? true,
        maxHintsPerQuestion: updated.maxHintsPerQuestion ?? 3
      });
    } catch (error: any) {
      console.error('Error updating parent settings:', error);
      res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
  });

  // Update parent AI hint settings (legacy endpoint)
  app.patch('/api/parents/ai-settings', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can update AI settings' });
      }
      
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      
      const { aiHintsEnabled, maxHintsPerQuestion } = req.body;
      
      const updated = await storage.updateParent(parent.id, {
        aiHintsEnabled: aiHintsEnabled !== undefined ? aiHintsEnabled : parent.aiHintsEnabled,
        maxHintsPerQuestion: maxHintsPerQuestion !== undefined ? maxHintsPerQuestion : parent.maxHintsPerQuestion
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating AI settings:', error);
      res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
  });

  // Create HTTP server without WebSocket conflicts
  const httpServer = createServer(app);

  // Note: WebSocket setup disabled to prevent conflicts with Vite HMR
  // Real-time messaging can be implemented with polling or SSE if needed

  return httpServer;
}

// Assignment functionality has been removed from the application