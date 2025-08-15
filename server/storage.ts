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
  academicYears,
  academicTerms,
  classes,
  studentClassAssignments,
  type User,
  type Student,
  type InsertStudent,
  type Parent,
  type InsertParent,
  type Tutor,
  type InsertTutor,
  type TutoringCompany,
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
  type CompanyAdmin,
  type InsertCompanyAdmin,
  type AcademicYear,
  type InsertAcademicYear,
  type AcademicTerm,
  type InsertAcademicTerm,
  type Class,
  type InsertClass,
  type StudentClassAssignment,
  type InsertStudentClassAssignment,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, isNull, sql, arrayContains } from "drizzle-orm";

export interface IStorage {
  // User operations (supports both Replit Auth and Custom Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: any): Promise<User>;
  createUserWithAuth(user: Partial<User>): Promise<string>;
  updateUserLastLogin(id: string): Promise<void>;
  verifyEmailToken(token: string): Promise<boolean>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  resetPassword(token: string, hashedPassword: string): Promise<boolean>;

  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  createStudent(studentData: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student>;
  getStudentsByTutor(tutorId: string): Promise<Student[]>;
  getStudentsByParent(parentId: string): Promise<any[]>;

  // Parent operations
  getParent(id: string): Promise<Parent | undefined>;
  getParentByUserId(userId: string): Promise<Parent | undefined>;
  createParent(parentData: InsertParent): Promise<Parent>;

  // Tutor operations
  getTutor(id: string): Promise<Tutor | undefined>;
  getTutorByUserId(userId: string): Promise<Tutor | undefined>;
  createTutor(tutorData: InsertTutor): Promise<Tutor>;
  updateTutor(id: string, updates: Partial<InsertTutor>): Promise<Tutor>;

  // Assignment operations
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignmentData: InsertAssignment): Promise<Assignment>;
  getAssignmentsByStudent(studentId: string): Promise<Assignment[]>;
  getAssignmentsByCompany(companyId: string): Promise<Assignment[]>;
  updateAssignmentStatus(id: string, status: string): Promise<Assignment>;

  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submissionData: InsertSubmission): Promise<Submission>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission>;
  gradeSubmission(submissionId: string, score: number, feedback: string, graderId: string): Promise<Submission | undefined>;
  verifySubmissionByParent(id: string): Promise<Submission>;

  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(messageData: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<Message>;

  // Progress operations
  getProgress(id: string): Promise<Progress | undefined>;
  createProgress(progressData: InsertProgress): Promise<Progress>;
  getProgressByStudent(studentId: string): Promise<Progress[]>;
  updateProgress(id: string, updates: Partial<InsertProgress>): Promise<Progress>;

  // Calendar operations
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEventsByTutor(tutorId: string): Promise<CalendarEvent[]>;
  getCalendarEventsByStudent(studentId: string): Promise<CalendarEvent[]>;

  // Company operations
  getTutoringCompany(id: string): Promise<TutoringCompany | undefined>;
  createTutoringCompany(companyData: InsertTutoringCompany): Promise<TutoringCompany>;
  getAllTutoringCompanies(): Promise<TutoringCompany[]>;
  updateTutoringCompany(id: string, updates: Partial<InsertTutoringCompany>): Promise<TutoringCompany>;
  getCompanyStudentsByCompanyId(companyId: string): Promise<any[]>;

  // Company Admin operations
  getCompanyAdmin(id: string): Promise<CompanyAdmin | undefined>;
  getCompanyAdminByUserId(userId: string): Promise<CompanyAdmin | undefined>;
  createCompanyAdmin(adminData: InsertCompanyAdmin): Promise<CompanyAdmin>;
  updateCompanyAdmin(id: string, updates: Partial<InsertCompanyAdmin>): Promise<CompanyAdmin>;
  getTutorsByCompany(companyId: string): Promise<any[]>;

  // Admin user management methods
  getAllUsers(): Promise<User[]>;
  getDeletedUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUserWithRole(userData: Partial<UpsertUser> & { role: string }): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  deleteUser(userId: string, deletedBy: string): Promise<void>;

  // Academic management methods
  // Academic Years
  createAcademicYear(academicYear: InsertAcademicYear): Promise<AcademicYear>;
  getAcademicYearsByCompany(companyId: string): Promise<AcademicYear[]>;
  getAcademicYear(id: string): Promise<AcademicYear | undefined>;
  updateAcademicYear(id: string, updates: Partial<InsertAcademicYear>): Promise<AcademicYear>;
  deleteAcademicYear(id: string): Promise<void>;

  // Academic Terms
  createAcademicTerm(term: InsertAcademicTerm): Promise<AcademicTerm>;
  getAcademicTermsByYear(academicYearId: string): Promise<AcademicTerm[]>;
  getAcademicTermsByCompany(companyId: string): Promise<AcademicTerm[]>;
  getAcademicTerm(id: string): Promise<AcademicTerm | undefined>;
  updateAcademicTerm(id: string, updates: Partial<InsertAcademicTerm>): Promise<AcademicTerm>;
  deleteAcademicTerm(id: string): Promise<void>;

  // Classes
  createClass(classData: InsertClass): Promise<Class>;
  getClassesByTerm(termId: string): Promise<Class[]>;
  getClassesByCompany(companyId: string): Promise<Class[]>;
  getClassesByTutor(tutorId: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  updateClass(id: string, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Student Class Assignments
  assignStudentToClass(assignment: InsertStudentClassAssignment): Promise<StudentClassAssignment>;
  getStudentsByClass(classId: string): Promise<StudentClassAssignment[]>;
  getClassesByStudent(studentId: string): Promise<StudentClassAssignment[]>;
  removeStudentFromClass(studentId: string, classId: string): Promise<void>;

  // Clear all assignment and submission data
  clearAllAssignments(): Promise<void>;
  clearAllSubmissions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async createUserWithAuth(userData: Partial<User>): Promise<string> {
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .returning();
    return user.id;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));

    if (!user) return false;

    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return true;
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async resetPassword(token: string, hashedPassword: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        isNull(users.passwordResetExpires) ? eq(users.passwordResetExpires, null) :
        // Check if token hasn't expired
        new Date() < users.passwordResetExpires as any
      ));

    if (!user) return false;

    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Student operations
  async getStudent(id: string): Promise<any> {
    const result = await db
      .select({
        id: students.id,
        userId: students.userId,
        gradeLevel: students.gradeLevel,
        schoolName: students.schoolName,
        parentId: students.parentId,
        tutorId: students.tutorId,
        companyId: students.companyId,
        yearId: students.yearId,
        termId: students.termId,
        classId: students.classId,
        createdAt: students.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isActive: users.isActive,
          createdAt: users.createdAt,
        }
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id))
      .limit(1);

    return result[0] || undefined;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student> {
    // Get the current student for validation
    const currentStudent = await this.getStudent(id);
    if (!currentStudent) {
      throw new Error("Student not found");
    }

    const [updatedStudent] = await db
      .update(students)
      .set({
        ...updates,
        // Don't allow updating these fields
        id: undefined,
        userId: undefined,
      })
      .where(eq(students.id, id))
      .returning();

    // Return the updated student with user details
    const updatedStudentWithUser = await this.getStudent(id);
    if (!updatedStudentWithUser) {
      throw new Error("Failed to retrieve updated student");
    }
    return updatedStudentWithUser;
  }

  async getStudentsByTutor(tutorId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.tutorId, tutorId));
  }

  async getStudentsByParent(parentId: string): Promise<any[]> {
    const studentData = await db.select({
      id: students.id,
      userId: students.userId,
      gradeLevel: students.gradeLevel,
      schoolName: students.schoolName,
      parentId: students.parentId,
      tutorId: students.tutorId,
      companyId: students.companyId,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      }
    })
    .from(students)
    .leftJoin(users, eq(students.userId, users.id))
    .where(eq(students.parentId, parentId));

    // Get assignments and submissions for each student
    const studentsWithDetails = await Promise.all(
      studentData.map(async (student) => {
        // Get assignments with full details
        const assignmentData = await db.select({
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          instructions: assignments.instructions,
          dueDate: assignments.dueDate,
          status: assignments.status,
          maxPoints: assignments.maxPoints,
          attachmentUrls: assignments.attachmentUrls,
          createdAt: assignments.createdAt,
        })
          .from(assignments)
          .where(arrayContains(assignments.studentIds, [student.id]))
          .orderBy(desc(assignments.dueDate));

        // Get submissions with all details including content and files
        const submissionData = await db.select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          content: submissions.content,
          fileUrls: submissions.fileUrls,
          status: submissions.status,
          isDraft: submissions.isDraft,
          submittedAt: submissions.submittedAt,
          isLate: submissions.isLate,
          score: submissions.score,
          feedback: submissions.feedback,
          gradedAt: submissions.gradedAt,
          isVerifiedByParent: submissions.isVerifiedByParent,
          parentVerifiedAt: submissions.parentVerifiedAt,
          parentComments: submissions.parentComments,
          needsRevision: submissions.needsRevision,
          revisionFeedback: submissions.revisionFeedback,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
        })
          .from(submissions)
          .where(eq(submissions.studentId, student.id))
          .orderBy(desc(submissions.submittedAt));

        return {
          ...student,
          assignments: assignmentData,
          submissions: submissionData
        };
      })
    );

    return studentsWithDetails;
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

  async updateTutor(id: string, updates: Partial<InsertTutor>): Promise<Tutor> {
    const [updatedTutor] = await db
      .update(tutors)
      .set(updates)
      .where(eq(tutors.id, id))
      .returning();
    return updatedTutor;
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
    try {
      const student = await this.getStudent(studentId);
      if (!student) {
        return [];
      }
      const companyId = student.companyId;

      if (!companyId) {
        console.warn(`Student ${studentId} is not associated with a company.`);
        return [];
      }

      const assignmentList = await db.select()
        .from(assignments)
        .where(eq(assignments.companyId, companyId))
        .orderBy(desc(assignments.createdAt));

      return assignmentList;
    } catch (error) {
      console.error("Error fetching assignments for student:", error);
      return [];
    }
  }

  async getAssignmentsByCompany(companyId: string): Promise<Assignment[]> {
    const assignmentData = await db.select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        instructions: assignments.instructions,
        dueDate: assignments.dueDate,
        companyId: assignments.companyId,
        studentIds: assignments.studentIds,
        status: assignments.status,
        maxPoints: assignments.maxPoints,
        attachmentUrls: assignments.attachmentUrls,
        allowedFileTypes: assignments.allowedFileTypes,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
      }).from(assignments)
        .where(eq(assignments.companyId, companyId))
        .orderBy(desc(assignments.createdAt));

    console.log(`Found ${assignmentData.length} assignments for company ${companyId}`);

    // Get submissions for each assignment with student details
    const assignmentsWithSubmissions = await Promise.all(
      assignmentData.map(async (assignment) => {
        console.log(`Getting submissions for assignment ${assignment.id}`);

        const submissionData = await db.select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          content: submissions.content,
          fileUrls: submissions.fileUrls,
          status: submissions.status,
          isDraft: submissions.isDraft,
          submittedAt: submissions.submittedAt,
          isLate: submissions.isLate,
          score: submissions.score,
          feedback: submissions.feedback,
          gradedAt: submissions.gradedAt,
          gradedBy: submissions.gradedBy,
          isVerifiedByParent: submissions.isVerifiedByParent,
          parentVerifiedAt: submissions.parentVerifiedAt,
          parentComments: submissions.parentComments,
          needsRevision: submissions.needsRevision,
          revisionFeedback: submissions.revisionFeedback,
          revisionCount: submissions.revisionCount,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          student: {
            id: students.id,
            userId: students.userId,
            gradeLevel: students.gradeLevel,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
            }
          }
        })
          .from(submissions)
          .leftJoin(students, eq(submissions.studentId, students.id))
          .leftJoin(users, eq(students.userId, users.id))
          .where(eq(submissions.assignmentId, assignment.id))
          .orderBy(desc(submissions.submittedAt));

        console.log(`Found ${submissionData.length} submissions for assignment ${assignment.id}`);

        return {
          ...assignment,
          submissions: submissionData
        };
      })
    );

    return assignmentsWithSubmissions;
  }

  async updateAssignmentStatus(id: string, status: string): Promise<Assignment> {
    const [assignment] = await db.update(assignments)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return assignment;
  }



  async getCompanyStudentsByCompanyId(companyId: string): Promise<any[]> {
    return await db.select({
      id: students.id,
      userId: students.userId,
      gradeLevel: students.gradeLevel,
      parentId: students.parentId,
      tutorId: students.tutorId,
      companyId: students.companyId,
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        createdAt: users.createdAt
      }
    }).from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(tutors, eq(students.tutorId, tutors.id))
      .where(
        and(
          // Either direct company assignment OR tutor's company matches
          and(
            eq(students.companyId, companyId)
          ),
          eq(users.isDeleted, false)
        )
      )
      .orderBy(users.firstName, users.lastName);
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
    try {
      return await db.select().from(submissions)
        .where(eq(submissions.studentId, studentId))
        .orderBy(desc(submissions.submittedAt));
    } catch (error) {
      console.error("Error fetching submissions for student:", error);
      return [];
    }
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

  async getTutoringCompanyById(id: string): Promise<TutoringCompany | undefined> {
    const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
    return company;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    try {
      // Get all tutors for this company
      const companyTutors = await db.select({
        user: users
      })
      .from(tutors)
      .innerJoin(users, eq(tutors.userId, users.id))
      .where(eq(tutors.companyId, companyId));

      // Get all company admins for this company
      const companyAdminsQuery = await db.select({
        user: users
      })
      .from(companyAdmins)
      .innerJoin(users, eq(companyAdmins.userId, users.id))
      .where(eq(companyAdmins.companyId, companyId));

      // Get all students assigned to tutors in this company
      const companyStudents = await db.select({
        user: users
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(tutors, eq(students.tutorId, tutors.id))
      .where(eq(tutors.companyId, companyId));

      // Get all parents of students in this company
      const companyParents = await db.select({
        user: users
      })
      .from(parents)
      .innerJoin(users, eq(parents.userId, users.id))
      .innerJoin(students, eq(parents.id, students.parentId))
      .innerJoin(tutors, eq(students.tutorId, tutors.id))
      .where(eq(tutors.companyId, companyId));

      // Combine all users and remove duplicates
      const allUsers = [
        ...companyTutors.map((t: any) => t.user),
        ...companyAdminsQuery.map((ca: any) => ca.user),
        ...companyStudents.map((s: any) => s.user),
        ...companyParents.map((p: any) => p.user)
      ];

      // Remove duplicates by id
      const uniqueUsers = allUsers.reduce((acc: User[], user: User) => {
        if (!acc.find(u => u.id === user.id)) {
          acc.push(user);
        }
        return acc;
      }, []);

      return uniqueUsers;
    } catch (error) {
      console.error("Error fetching company users:", error);
      return [];
    }
  }

  async getCompanyStudentsByCompanyId(companyId: string): Promise<any[]> {
    try {
      // Get students with direct company assignment OR assigned to tutors in this company
      const companyStudents = await db.select({
        id: students.id,
        userId: students.userId,
        gradeLevel: students.gradeLevel,
        parentId: students.parentId,
        tutorId: students.tutorId,
        companyId: students.companyId,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isActive: users.isActive,
          createdAt: users.createdAt
        }
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(tutors, eq(students.tutorId, tutors.id))
      .where(
        and(
          // Either direct company assignment OR tutor's company matches
          and(
            eq(students.companyId, companyId)
          ),
          eq(users.isDeleted, false)
        )
      )
      .orderBy(users.firstName, users.lastName);

      return companyStudents;
    } catch (error) {
      console.error("Error fetching company students:", error);
      return [];
    }
  }

  // Homework and Assignment operations
  async getAssignmentsByCompanyId(companyId: string): Promise<Assignment[]> {
    try {
      const companyAssignments = await db
        .select()
        .from(assignments)
        .innerJoin(tutors, eq(assignments.tutorId, tutors.id))
        .where(eq(tutors.companyId, companyId))
        .orderBy(desc(assignments.createdAt));

      return companyAssignments.map(item => item.assignments);
    } catch (error) {
      console.error("Error fetching company assignments:", error);
      return [];
    }
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string, gradedBy: string): Promise<Submission | undefined> {
    try {
      const [graded] = await db
        .update(submissions)
        .set({
          score,
          feedback,
          gradedAt: new Date(),
          gradedBy,
          status: 'graded',
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submissionId))
        .returning();

      return graded;
    } catch (error) {
      console.error("Error grading submission:", error);
      return undefined;
    }
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

  async updateCompanyAdmin(id: string, updates: Partial<InsertCompanyAdmin>): Promise<CompanyAdmin> {
    const [updatedAdmin] = await db
      .update(companyAdmins)
      .set(updates)
      .where(eq(companyAdmins.id, id))
      .returning();
    return updatedAdmin;
  }

  async getTutorsByCompany(companyId: string): Promise<any[]> {
    try {
      // Get all tutors in this company with their user information
      const companyTutors = await db.select({
        id: tutors.id,
        userId: tutors.userId,
        specialization: tutors.specialization,
        qualifications: tutors.qualifications,
        isVerified: tutors.isVerified,
        companyId: tutors.companyId,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isActive: users.isActive,
          createdAt: users.createdAt
        }
      })
      .from(tutors)
      .innerJoin(users, eq(tutors.userId, users.id))
      .where(and(eq(tutors.companyId, companyId), eq(users.isDeleted, false)))
      .orderBy(users.firstName, users.lastName);

      return companyTutors;
    } catch (error) {
      console.error("Error fetching company tutors:", error);
      return [];
    }
  }

  // Admin user management methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isDeleted, false)).orderBy(desc(users.createdAt));
  }

  async getDeletedUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isDeleted, true)).orderBy(desc(users.deletedAt));
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

  // Company status operations
  async updateCompanyStatus(companyId: string, isActive: boolean): Promise<void> {
    await db
      .update(tutoringCompanies)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(tutoringCompanies.id, companyId));
  }

  // Soft delete user and clean up related records
  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Step 1: Clean up role-specific records and their dependencies
      if (user.role === 'student') {
        const student = await this.getStudentByUserId(userId);
        if (student) {
          // Delete all records that reference this student
          await db.delete(assignments).where(eq(assignments.studentId, student.id));
          await db.delete(submissions).where(eq(submissions.studentId, student.id));
          await db.delete(progress).where(eq(progress.studentId, student.id));
          await db.delete(calendarEvents).where(eq(calendarEvents.studentId, student.id));
          // Delete the student record itself
          await db.delete(students).where(eq(students.id, student.id));
        }
      } else if (user.role === 'tutor') {
        const tutor = await this.getTutorByUserId(userId);
        if (tutor) {
          // Update students to remove tutor assignment (set to null)
          await db.update(students).set({ tutorId: null }).where(eq(students.tutorId, tutor.id));
          // Delete assignments and calendar events created by this tutor
          await db.delete(assignments).where(eq(assignments.tutorId, tutor.id));
          await db.delete(calendarEvents).where(eq(calendarEvents.tutorId, tutor.id));
          // Delete the tutor record itself
          await db.delete(tutors).where(eq(tutors.id, tutor.id));
        }
      } else if (user.role === 'parent') {
        const parent = await this.getParentByUserId(userId);
        if (parent) {
          // Update students to remove parent assignment (set to null)
          await db.update(students).set({ parentId: null }).where(eq(students.parentId, parent.id));
          // Delete the parent record itself
          await db.delete(parents).where(eq(parents.id, parent.id));
        }
      } else if (user.role === 'company_admin') {
        const companyAdmin = await this.getCompanyAdminByUserId(userId);
        if (companyAdmin) {
          // Delete the company admin record
          await db.delete(companyAdmins).where(eq(companyAdmins.id, companyAdmin.id));
        }
      }

      // Step 2: Delete messages sent by or to this user
      await db.delete(messages).where(eq(messages.senderId, userId));
      await db.delete(messages).where(eq(messages.receiverId, userId));

      // Step 3: Mark user as deleted (soft delete)
      await db
        .update(users)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy,
          isActive: false,
          email: `deleted_${userId}@deleted.com`, // Change email to avoid conflicts
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    } catch (error) {
      console.error("Detailed error during user deletion:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete user: ${errorMessage}`);
    }
  }

  // User status operations
  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Tutor assignment operations
  async assignTutorToCompany(tutorId: string, companyId: string): Promise<void> {
    await db
      .update(tutors)
      .set({ companyId })
      .where(eq(tutors.id, tutorId));
  }

  async unassignTutorFromCompany(tutorId: string): Promise<void> {
    await db
      .update(tutors)
      .set({ companyId: null })
      .where(eq(tutors.id, tutorId));
  }

  async getUnassignedTutors(): Promise<any[]> {
    const tutorData = await db
      .select({
        id: tutors.id,
        userId: tutors.userId,
        specialization: tutors.specialization,
        qualifications: tutors.qualifications,
        isVerified: tutors.isVerified,
        user: {
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(tutors)
      .leftJoin(users, eq(tutors.userId, users.id))
      .where(isNull(tutors.companyId));

    return tutorData;
  }



  // Academic management methods implementation

  // Academic Years
  async createAcademicYear(academicYear: InsertAcademicYear): Promise<AcademicYear> {
    const [year] = await db.insert(academicYears).values(academicYear).returning();
    return year;
  }

  async getAcademicYearsByCompany(companyId: string): Promise<AcademicYear[]> {
    return await db.select().from(academicYears)
      .where(and(eq(academicYears.companyId, companyId), eq(academicYears.isActive, true)))
      .orderBy(academicYears.yearNumber);
  }

  async getAcademicYear(id: string): Promise<AcademicYear | undefined> {
    const [year] = await db.select().from(academicYears).where(eq(academicYears.id, id));
    return year;
  }

  async updateAcademicYear(id: string, updates: Partial<InsertAcademicYear>): Promise<AcademicYear> {
    const [year] = await db.update(academicYears)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return year;
  }

  async deleteAcademicYear(id: string): Promise<void> {
    await db.update(academicYears)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(academicYears.id, id));
  }

  // Academic Terms
  async createAcademicTerm(term: InsertAcademicTerm): Promise<AcademicTerm> {
    const [newTerm] = await db.insert(academicTerms).values(term).returning();
    return newTerm;
  }

  async getAcademicTermsByYear(academicYearId: string): Promise<AcademicTerm[]> {
    return await db.select().from(academicTerms)
      .where(and(eq(academicTerms.academicYearId, academicYearId), eq(academicTerms.isActive, true)))
      .orderBy(academicTerms.startDate);
  }

  async getAcademicTermsByCompany(companyId: string): Promise<AcademicTerm[]> {
    return await db.select().from(academicTerms)
      .where(and(eq(academicTerms.companyId, companyId), eq(academicTerms.isActive, true)))
      .orderBy(academicTerms.startDate);
  }

  async getAcademicTerm(id: string): Promise<AcademicTerm | undefined> {
    const [term] = await db.select().from(academicTerms).where(eq(academicTerms.id, id));
    return term;
  }

  async updateAcademicTerm(id: string, updates: Partial<InsertAcademicTerm>): Promise<AcademicTerm> {
    const [term] = await db.update(academicTerms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(academicTerms.id, id))
      .returning();
    return term;
  }

  async deleteAcademicTerm(id: string): Promise<void> {
    await db.update(academicTerms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(academicTerms.id, id));
  }

  // Classes
  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async getClassesByTerm(termId: string): Promise<Class[]> {
    return await db.select().from(classes)
      .where(and(eq(classes.termId, termId), eq(classes.isActive, true)))
      .orderBy(classes.name);
  }

  async getClassesByCompany(companyId: string): Promise<Class[]> {
    return await db.select().from(classes)
      .where(and(eq(classes.companyId, companyId), eq(classes.isActive, true)))
      .orderBy(classes.name);
  }

  async getClassesByTutor(tutorId: string): Promise<Class[]> {
    return await db.select().from(classes)
      .where(and(eq(classes.tutorId, tutorId), eq(classes.isActive, true)))
      .orderBy(classes.name);
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
    return classItem;
  }

  async updateClass(id: string, updates: Partial<InsertClass>): Promise<Class> {
    const [classItem] = await db.update(classes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return classItem;
  }

  async deleteClass(id: string): Promise<void> {
    await db.update(classes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(classes.id, id));
  }

  // Student Class Assignments
  async assignStudentToClass(assignment: InsertStudentClassAssignment): Promise<StudentClassAssignment> {
    const [newAssignment] = await db.insert(studentClassAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getStudentsByClass(classId: string): Promise<StudentClassAssignment[]> {
    return await db.select().from(studentClassAssignments)
      .where(and(eq(studentClassAssignments.classId, classId), eq(studentClassAssignments.isActive, true)))
      .orderBy(studentClassAssignment.assignedDate);
  }

  async getClassesByStudent(studentId: string): Promise<StudentClassAssignment[]> {
    return await db.select().from(studentClassAssignments)
      .where(and(eq(studentClassAssignments.studentId, studentId), eq(studentClassAssignments.isActive, true)))
      .orderBy(studentClassAssignments.assignedDate);
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    await db.update(studentClassAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(studentClassAssignments.studentId, studentId),
        eq(studentClassAssignments.classId, classId)
      ));
  }

  // Clear all assignment and submission data
  async clearAllAssignments(): Promise<void> {
    console.log("Deleting all assignments...");
    await db.delete(assignments);
    console.log("All assignments deleted");
  }

  async clearAllSubmissions(): Promise<void> {
    console.log("Deleting all submissions...");
    await db.delete(submissions);
    console.log("All submissions deleted");
  }
}

export const storage = new DatabaseStorage();