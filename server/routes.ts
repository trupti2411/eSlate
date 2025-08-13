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

      let assignments = [];
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

      let submissions = [];
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

      let progress = [];
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

      let events = [];
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

      let students = [];
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
