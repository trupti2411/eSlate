import {
  users,
  students,
  parents,
  tutors,
  tutoringCompanies,
  companyAdmins,
  assignments,
  submissions,
  messages,
  progress,
  calendarEvents,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Parent,
  type InsertParent,
  type Tutor,
  type InsertTutor,
  type TutoringCompany,
  type InsertTutoringCompany,
  type CompanyAdmin,
  type InsertCompanyAdmin,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type Message,
  type InsertMessage,
  type Progress,
  type InsertProgress,
  type CalendarEvent,
  type InsertCalendarEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentsByTutor(tutorId: string): Promise<Student[]>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  
  // Parent operations
  getParent(id: string): Promise<Parent | undefined>;
  getParentByUserId(userId: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  
  // Tutor operations
  getTutor(id: string): Promise<Tutor | undefined>;
  getTutorByUserId(userId: string): Promise<Tutor | undefined>;
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  
  // Assignment operations
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignmentsByStudent(studentId: string): Promise<Assignment[]>;
  getAssignmentsByTutor(tutorId: string): Promise<Assignment[]>;
  updateAssignmentStatus(id: string, status: string): Promise<Assignment>;
  
  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission>;
  verifySubmissionByParent(id: string): Promise<Submission>;
  
  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<Message>;
  
  // Progress operations
  getProgress(id: string): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  getProgressByStudent(studentId: string): Promise<Progress[]>;
  updateProgress(id: string, updates: Partial<InsertProgress>): Promise<Progress>;
  
  // Calendar operations
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEventsByTutor(tutorId: string): Promise<CalendarEvent[]>;
  getCalendarEventsByStudent(studentId: string): Promise<CalendarEvent[]>;
  
  // Company operations
  getTutoringCompany(id: string): Promise<TutoringCompany | undefined>;
  createTutoringCompany(company: InsertTutoringCompany): Promise<TutoringCompany>;
  getAllTutoringCompanies(): Promise<TutoringCompany[]>;
  updateTutoringCompany(id: string, updates: Partial<InsertTutoringCompany>): Promise<TutoringCompany>;
  
  // Company Admin operations
  getCompanyAdmin(id: string): Promise<CompanyAdmin | undefined>;
  getCompanyAdminByUserId(userId: string): Promise<CompanyAdmin | undefined>;
  createCompanyAdmin(admin: InsertCompanyAdmin): Promise<CompanyAdmin>;
  getTutorsByCompany(companyId: string): Promise<Tutor[]>;

  // Admin user management methods
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUserWithRole(userData: Partial<UpsertUser> & { role: string }): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }

  async getStudentsByTutor(tutorId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.tutorId, tutorId));
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  // Parent operations
  async getParent(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }

  async getParentByUserId(userId: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.userId, userId));
    return parent;
  }

  async createParent(parentData: InsertParent): Promise<Parent> {
    const [parent] = await db.insert(parents).values(parentData).returning();
    return parent;
  }

  // Tutor operations
  async getTutor(id: string): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
    return tutor;
  }

  async getTutorByUserId(userId: string): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.userId, userId));
    return tutor;
  }

  async createTutor(tutorData: InsertTutor): Promise<Tutor> {
    const [tutor] = await db.insert(tutors).values(tutorData).returning();
    return tutor;
  }

  // Assignment operations
  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(assignmentData).returning();
    return assignment;
  }

  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(eq(assignments.studentId, studentId))
      .orderBy(desc(assignments.dueDate));
  }

  async getAssignmentsByTutor(tutorId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(eq(assignments.tutorId, tutorId))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignmentStatus(id: string, status: string): Promise<Assignment> {
    const [assignment] = await db.update(assignments)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return assignment;
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(submissionData: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(submissionData).returning();
    return submission;
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission> {
    const [submission] = await db.update(submissions)
      .set(updates)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async verifySubmissionByParent(id: string): Promise<Submission> {
    const [submission] = await db.update(submissions)
      .set({ 
        isVerifiedByParent: true, 
        parentVerifiedAt: new Date() 
      })
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const [message] = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // Progress operations
  async getProgress(id: string): Promise<Progress | undefined> {
    const [progressRecord] = await db.select().from(progress).where(eq(progress.id, id));
    return progressRecord;
  }

  async createProgress(progressData: InsertProgress): Promise<Progress> {
    const [progressRecord] = await db.insert(progress).values(progressData).returning();
    return progressRecord;
  }

  async getProgressByStudent(studentId: string): Promise<Progress[]> {
    return await db.select().from(progress)
      .where(eq(progress.studentId, studentId))
      .orderBy(desc(progress.updatedAt));
  }

  async updateProgress(id: string, updates: Partial<InsertProgress>): Promise<Progress> {
    const [progressRecord] = await db.update(progress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(progress.id, id))
      .returning();
    return progressRecord;
  }

  // Calendar operations
  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event;
  }

  async createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db.insert(calendarEvents).values(eventData).returning();
    return event;
  }

  async getCalendarEventsByTutor(tutorId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents)
      .where(eq(calendarEvents.tutorId, tutorId))
      .orderBy(calendarEvents.startTime);
  }

  async getCalendarEventsByStudent(studentId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents)
      .where(eq(calendarEvents.studentId, studentId))
      .orderBy(calendarEvents.startTime);
  }

  // Company operations
  async getTutoringCompany(id: string): Promise<TutoringCompany | undefined> {
    const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
    return company;
  }

  async createTutoringCompany(companyData: InsertTutoringCompany): Promise<TutoringCompany> {
    const [company] = await db.insert(tutoringCompanies).values(companyData).returning();
    return company;
  }

  async getAllTutoringCompanies(): Promise<TutoringCompany[]> {
    return await db.select().from(tutoringCompanies)
      .where(eq(tutoringCompanies.isActive, true))
      .orderBy(tutoringCompanies.name);
  }

  async updateTutoringCompany(id: string, updates: Partial<InsertTutoringCompany>): Promise<TutoringCompany> {
    const [company] = await db.update(tutoringCompanies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutoringCompanies.id, id))
      .returning();
    return company;
  }

  // Company Admin operations
  async getCompanyAdmin(id: string): Promise<CompanyAdmin | undefined> {
    const [admin] = await db.select().from(companyAdmins).where(eq(companyAdmins.id, id));
    return admin;
  }

  async getCompanyAdminByUserId(userId: string): Promise<CompanyAdmin | undefined> {
    const [admin] = await db.select().from(companyAdmins).where(eq(companyAdmins.userId, userId));
    return admin;
  }

  async createCompanyAdmin(adminData: InsertCompanyAdmin): Promise<CompanyAdmin> {
    const [admin] = await db.insert(companyAdmins).values(adminData).returning();
    return admin;
  }

  async getTutorsByCompany(companyId: string): Promise<Tutor[]> {
    return await db.select().from(tutors).where(eq(tutors.companyId, companyId));
  }

  // Admin user management methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.role, role as any))
      .orderBy(desc(users.createdAt));
  }

  async createUserWithRole(userData: Partial<UpsertUser> & { role: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      role: userData.role as any,
      isActive: userData.isActive ?? true,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
