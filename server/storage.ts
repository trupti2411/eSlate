import {
  users,
  students,
  parents,
  tutors,
  tutoringCompanies,
  companyAdmins,
  messages,
  progress,
  calendarEvents,
  academicYears,
  academicTerms,
  classes,
  studentClassAssignments,
  assignments,
  submissions,
  worksheets,
  worksheetPages,
  worksheetQuestions,
  worksheetAssignments,
  worksheetAnswers,
  tests,
  testQuestions,
  testAssignments,
  testAttempts,
  testAnswers,
  classSessions,
  sessionAttendance,
  academicHolidays,
  notificationPreferences,
  reportDefinitions,
  reportRuns,
  reportExports,
  type User,
  type Student,
  type InsertStudent,
  type Parent,
  type InsertParent,
  type Tutor,
  type InsertTutor,
  type TutoringCompany,
  type Message,
  type InsertMessage,
  type Progress,
  type InsertProgress,
  type CalendarEvent,
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
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type InsertUser,
  type Worksheet,
  type InsertWorksheet,
  type WorksheetPage,
  type InsertWorksheetPage,
  type WorksheetQuestion,
  type InsertWorksheetQuestion,
  type WorksheetAssignment,
  type InsertWorksheetAssignment,
  type WorksheetAnswer,
  type InsertWorksheetAnswer,
  type Test,
  type InsertTest,
  type TestQuestion,
  type InsertTestQuestion,
  type TestAssignment,
  type InsertTestAssignment,
  type TestAttempt,
  type InsertTestAttempt,
  type TestAnswer,
  type InsertTestAnswer,
  type ClassSession,
  type InsertClassSession,
  type SessionAttendance,
  type InsertSessionAttendance,
  type AcademicHoliday,
  type InsertAcademicHoliday,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type ReportDefinition,
  type InsertReportDefinition,
  type ReportRun,
  type InsertReportRun,
  type ReportExport,
  type InsertReportExport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, isNull, sql, arrayContains, inArray } from "drizzle-orm";

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
  updateParent(id: string, updates: Partial<InsertParent>): Promise<Parent>;
  getParentChildrenWithProgress(parentId: string): Promise<any[]>;
  getParentUserByStudentId(studentId: string): Promise<{ parentId: string; email: string; firstName: string; lastName: string } | null>;

  // Tutor operations
  getTutor(id: string): Promise<Tutor | undefined>;
  getTutorByUserId(userId: string): Promise<Tutor | undefined>;
  createTutor(tutorData: InsertTutor): Promise<Tutor>;
  updateTutor(id: string, updates: Partial<InsertTutor>): Promise<Tutor>;



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
  createCalendarEvent(eventData: any): Promise<CalendarEvent>;
  getCalendarEventsByTutor(tutorId: string): Promise<CalendarEvent[]>;
  getCalendarEventsByStudent(studentId: string): Promise<CalendarEvent[]>;

  // Company operations
  getTutoringCompany(id: string): Promise<TutoringCompany | undefined>;
  createTutoringCompany(companyData: any): Promise<TutoringCompany>;
  getAllTutoringCompanies(): Promise<TutoringCompany[]>;
  updateTutoringCompany(id: string, updates: any): Promise<TutoringCompany>;
  getCompanyStudentsByCompanyId(companyId: string): Promise<any[]>;
  getCompanyUsersByCompanyId(companyId: string): Promise<User[]>;
  updateCompanyStatus(companyId: string, isActive: boolean): Promise<void>;


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
  createUserWithRole(userData: Partial<InsertUser> & { role: string }): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(userId: string, deletedBy: string): Promise<void>;
  updateUserStatus(userId: string, isActive: boolean): Promise<void>;


  // Tutor assignment operations
  assignTutorToCompany(tutorId: string, companyId: string): Promise<void>;
  unassignTutorFromCompany(tutorId: string): Promise<void>;
  getUnassignedTutors(): Promise<any[]>;

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
  permanentlyDeleteAcademicTerm(id: string): Promise<void>;

  // Classes
  createClass(classData: InsertClass): Promise<Class>;
  getClassesByTerm(termId: string): Promise<Class[]>;
  getClassesByCompany(companyId: string): Promise<Class[]>;
  getClassesByTutor(tutorId: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  updateClass(id: string, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;
  permanentlyDeleteClass(id: string): Promise<void>;

  // Student Class Assignments
  assignStudentToClass(assignment: InsertStudentClassAssignment): Promise<StudentClassAssignment>;
  getStudentsByClass(classId: string): Promise<StudentClassAssignment[]>;
  getClassesByStudent(studentId: string): Promise<StudentClassAssignment[]>;
  getEnrolledClassesWithDetails(studentId: string): Promise<any[]>;
  removeStudentFromClass(studentId: string, classId: string): Promise<void>;

  // Assignment operations
  createAssignment(assignmentData: InsertAssignment): Promise<Assignment>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentsByClass(classId: string): Promise<Assignment[]>;
  getAssignmentsByCompany(companyId: string): Promise<Assignment[]>;
  updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  
  // Submission operations
  createSubmission(submissionData: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionsByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission[]>;
  getCompanySubmissions(companyId: string): Promise<any[]>;
  updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission>;
  deleteSubmission(id: string): Promise<void>;

  // Student portal methods
  getStudentTerms(studentId: string): Promise<AcademicTerm[]>;
  getStudentClasses(studentId: string): Promise<Class[]>;
  getStudentAssignments(studentId: string): Promise<Assignment[]>;
  getStudentSubmissions(studentId: string): Promise<Submission[]>;
  
  // Worksheet-Assignment link
  getAssignmentByWorksheetAndStudent(worksheetId: string, studentId: string): Promise<Assignment | undefined>;

  // Test/Exam operations
  createTest(testData: InsertTest): Promise<Test>;
  getTest(id: string): Promise<Test | undefined>;
  getTestsByCompany(companyId: string): Promise<Test[]>;
  getTestsByClass(classId: string): Promise<Test[]>;
  updateTest(id: string, updates: Partial<InsertTest>): Promise<Test>;
  deleteTest(id: string): Promise<void>;
  getTestWithQuestions(testId: string): Promise<any>;

  // Test question operations
  createTestQuestion(questionData: InsertTestQuestion): Promise<TestQuestion>;
  getTestQuestions(testId: string): Promise<TestQuestion[]>;
  updateTestQuestion(id: string, updates: Partial<InsertTestQuestion>): Promise<TestQuestion>;
  deleteTestQuestion(id: string): Promise<void>;

  // Test assignment operations
  createTestAssignment(assignmentData: InsertTestAssignment): Promise<TestAssignment>;
  getTestAssignments(testId: string): Promise<TestAssignment[]>;
  getStudentTestAssignments(studentId: string): Promise<any[]>;
  deleteTestAssignment(id: string): Promise<void>;

  // Test attempt operations
  createTestAttempt(attemptData: InsertTestAttempt): Promise<TestAttempt>;
  getTestAttempt(id: string): Promise<TestAttempt | undefined>;
  getTestAttemptsByTest(testId: string): Promise<TestAttempt[]>;
  getTestAttemptsByStudent(studentId: string): Promise<TestAttempt[]>;
  updateTestAttempt(id: string, updates: Partial<InsertTestAttempt>): Promise<TestAttempt>;

  // Test answer operations
  createTestAnswer(answerData: InsertTestAnswer): Promise<TestAnswer>;
  getTestAnswersByAttempt(attemptId: string): Promise<TestAnswer[]>;
  updateTestAnswer(id: string, updates: Partial<InsertTestAnswer>): Promise<TestAnswer>;
  
  // Grading operations
  gradeTestAttempt(attemptId: string, gradedBy: string, feedback?: string): Promise<TestAttempt>;
  autoGradeTestAttempt(attemptId: string): Promise<{ totalScore: number; percentageScore: number }>;

  // Class Session operations
  createClassSession(sessionData: InsertClassSession): Promise<ClassSession>;
  getClassSession(id: string): Promise<ClassSession | undefined>;
  getClassSessionsByClass(classId: string): Promise<ClassSession[]>;
  getClassSessionsByTutor(tutorId: string, startDate?: Date, endDate?: Date): Promise<ClassSession[]>;
  getClassSessionsByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getClassSessionsByCompany(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getClassSessionsForDate(companyId: string, date: Date): Promise<any[]>;
  updateClassSession(id: string, updates: Partial<InsertClassSession>): Promise<ClassSession>;
  deleteClassSession(id: string): Promise<void>;
  generateSessionsForClass(classId: string, termStartDate: Date, termEndDate: Date): Promise<ClassSession[]>;

  // Session Attendance operations
  markAttendance(attendanceData: InsertSessionAttendance): Promise<SessionAttendance>;
  getAttendance(id: string): Promise<SessionAttendance | undefined>;
  getAttendanceBySession(sessionId: string): Promise<SessionAttendance[]>;
  getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<SessionAttendance[]>;
  updateAttendance(id: string, updates: Partial<InsertSessionAttendance>): Promise<SessionAttendance>;
  markAllPresent(sessionId: string, markedBy: string): Promise<void>;
  overrideAttendance(id: string, newStatus: string, overrideBy: string, notes?: string): Promise<SessionAttendance>;
  lockSessionAttendance(sessionId: string): Promise<void>;
  getStudentAttendanceSummary(studentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }>;
  getStudentAttendanceBySubject(studentId: string): Promise<any[]>;
  getStudentLearningHours(studentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMinutes: number;
    bySubject: { subject: string; minutes: number }[];
    byWeek: { week: string; minutes: number }[];
  }>;
  getClassAttendanceHistory(classId: string, limit?: number): Promise<any[]>;

  // Academic Holiday operations
  createAcademicHoliday(holidayData: InsertAcademicHoliday): Promise<AcademicHoliday>;
  getAcademicHoliday(id: string): Promise<AcademicHoliday | undefined>;
  getAcademicHolidaysByCompany(companyId: string): Promise<AcademicHoliday[]>;
  getPublicHolidays(startDate?: Date, endDate?: Date): Promise<AcademicHoliday[]>;
  updateAcademicHoliday(id: string, updates: Partial<InsertAcademicHoliday>): Promise<AcademicHoliday>;
  deleteAcademicHoliday(id: string): Promise<void>;

  // Notification Preferences operations
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  createNotificationPreferences(data: Partial<InsertNotificationPreferences> & { userId: string }): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: string, updates: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
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

  async upsertUser(userData: any): Promise<User> {
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
        sql`${users.passwordResetExpires} > ${new Date()}`
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

    return studentData;
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

  async updateParent(id: string, updates: Partial<InsertParent>): Promise<Parent> {
    const [updated] = await db.update(parents).set(updates).where(eq(parents.id, id)).returning();
    return updated;
  }

  async getParentUserByStudentId(studentId: string): Promise<{ parentId: string; email: string; firstName: string; lastName: string } | null> {
    const student = await this.getStudent(studentId);
    if (!student || !student.parentId) {
      return null;
    }
    
    const parent = await this.getParent(student.parentId);
    if (!parent) {
      return null;
    }
    
    const parentUser = await this.getUser(parent.userId);
    if (!parentUser || !parentUser.email) {
      return null;
    }
    
    return {
      parentId: parent.id,
      email: parentUser.email,
      firstName: parentUser.firstName || '',
      lastName: parentUser.lastName || ''
    };
  }

  async getParentChildrenWithProgress(parentId: string): Promise<any[]> {
    // Get all students linked to this parent with user info
    const studentData = await db.select({
      id: students.id,
      userId: students.userId,
      gradeLevel: students.gradeLevel,
      schoolName: students.schoolName,
      parentId: students.parentId,
      tutorId: students.tutorId,
      companyId: students.companyId,
      classId: students.classId,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(students)
    .leftJoin(users, eq(students.userId, users.id))
    .where(eq(students.parentId, parentId));

    // For each student, get their assignments and submissions
    const childrenWithProgress = await Promise.all(
      studentData.map(async (student) => {
        // Get class info if assigned
        let classInfo = null;
        if (student.classId) {
          const [classData] = await db.select({
            id: classes.id,
            name: classes.name,
            subject: classes.subject,
          }).from(classes).where(eq(classes.id, student.classId));
          classInfo = classData;
        }

        // Get assignments for this student's class
        const studentAssignments = student.classId 
          ? await db.select({
              id: assignments.id,
              title: assignments.title,
              description: assignments.description,
              subject: assignments.subject,
              submissionDate: assignments.submissionDate,
              status: assignments.status,
              assignmentKind: assignments.assignmentKind,
              createdAt: assignments.createdAt,
            })
            .from(assignments)
            .where(eq(assignments.classId, student.classId))
            .orderBy(desc(assignments.createdAt))
          : [];

        // Get all submissions for this student
        const studentSubmissions = await db.select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
          isLate: submissions.isLate,
          createdAt: submissions.createdAt,
        })
        .from(submissions)
        .where(eq(submissions.studentId, student.id))
        .orderBy(desc(submissions.createdAt));

        // Calculate progress stats
        const totalAssignments = studentAssignments.length;
        const submittedCount = studentSubmissions.filter(s => s.status !== 'draft').length;
        const gradedCount = studentSubmissions.filter(s => s.status === 'graded' || s.status === 'parent_verified').length;
        const pendingCount = totalAssignments - submittedCount;

        // Enrich assignments with submission status
        const assignmentsWithStatus = studentAssignments.map(assignment => {
          const submission = studentSubmissions.find(s => s.assignmentId === assignment.id);
          return {
            ...assignment,
            submission: submission || null,
            submissionStatus: submission?.status || 'not_started',
          };
        });

        return {
          ...student,
          classInfo,
          assignments: assignmentsWithStatus,
          submissions: studentSubmissions,
          progress: {
            totalAssignments,
            submittedCount,
            gradedCount,
            pendingCount,
            completionRate: totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0,
          }
        };
      })
    );

    return childrenWithProgress;
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

  async createCalendarEvent(eventData: any): Promise<CalendarEvent> {
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

  async getCompany(id: string): Promise<TutoringCompany | undefined> {
    const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
    return company;
  }

  async getAllCompanies(): Promise<TutoringCompany[]> {
    return await db.select().from(tutoringCompanies)
      .where(eq(tutoringCompanies.isActive, true))
      .orderBy(tutoringCompanies.name);
  }

  async getTutoringCompanyById(id: string): Promise<TutoringCompany | undefined> {
    const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
    return company;
  }

  async getCompanyUsersByCompanyId(companyId: string): Promise<User[]> {
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
      // Get students with direct company assignment, including class and tutor info
      const companyStudents = await db.select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(classes, eq(students.classId, classes.id))
      .leftJoin(tutors, eq(students.tutorId, tutors.id))
      .where(
        and(
          eq(students.companyId, companyId),
          eq(users.isDeleted, false),
          eq(users.isActive, true)
        )
      )
      .orderBy(users.firstName, users.lastName);

      // Get tutor user info for display
      const tutorUserIds = companyStudents
        .filter((row: any) => row.tutors?.userId)
        .map((row: any) => row.tutors.userId);
      
      const tutorUsers = tutorUserIds.length > 0 
        ? await db.select().from(users).where(inArray(users.id, tutorUserIds))
        : [];

      const tutorUserMap = new Map(tutorUsers.map((u: any) => [u.id, u]));

      // Transform the result to match expected structure
      return companyStudents.map((row: any) => {
        const tutorUser = row.tutors?.userId ? tutorUserMap.get(row.tutors.userId) : null;
        return {
          id: row.students.id,
          userId: row.students.userId,
          gradeLevel: row.students.gradeLevel,
          parentId: row.students.parentId,
          tutorId: row.students.tutorId,
          companyId: row.students.companyId,
          classId: row.students.classId,
          schoolName: row.students.schoolName,
          dateOfBirth: row.students.dateOfBirth,
          user: {
            id: row.users.id,
            email: row.users.email,
            firstName: row.users.firstName,
            lastName: row.users.lastName,
            isActive: row.users.isActive,
            createdAt: row.users.createdAt
          },
          class: row.classes ? {
            id: row.classes.id,
            name: row.classes.name,
            academicYearId: row.classes.academicYearId
          } : null,
          tutor: row.tutors ? {
            id: row.tutors.id,
            user: tutorUser ? {
              firstName: tutorUser.firstName,
              lastName: tutorUser.lastName
            } : null
          } : null
        };
      });
    } catch (error) {
      console.error("Error fetching company students:", error);
      return [];
    }
  }



  async createTutoringCompany(companyData: any): Promise<TutoringCompany> {
    const [company] = await db.insert(tutoringCompanies).values(companyData).returning();
    return company;
  }

  async getAllTutoringCompanies(): Promise<TutoringCompany[]> {
    return await db.select().from(tutoringCompanies)
      .where(eq(tutoringCompanies.isActive, true))
      .orderBy(tutoringCompanies.name);
  }

  async updateTutoringCompany(id: string, updates: any): Promise<TutoringCompany> {
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

      // Get class schedules for each tutor (upcoming sessions grouped by class/day/time)
      const tutorIds = companyTutors.map(t => t.id);
      
      // Get upcoming sessions for these tutors
      const upcomingSessions = tutorIds.length > 0 
        ? await db.select({
            tutorId: classSessions.tutorId,
            className: classes.name,
            sessionDate: classSessions.sessionDate,
            startTime: classSessions.startTime,
            endTime: classSessions.endTime,
          })
          .from(classSessions)
          .innerJoin(classes, eq(classSessions.classId, classes.id))
          .where(
            and(
              inArray(classSessions.tutorId, tutorIds),
              sql`${classSessions.sessionDate} >= CURRENT_DATE`,
              eq(classSessions.status, 'scheduled')
            )
          )
          .orderBy(classSessions.sessionDate, classSessions.startTime)
        : [];

      // Get student counts for each tutor
      const studentCounts = tutorIds.length > 0
        ? await db.select({
            tutorId: students.tutorId,
            count: sql<number>`count(*)`.as('count')
          })
          .from(students)
          .innerJoin(users, eq(students.userId, users.id))
          .where(
            and(
              inArray(students.tutorId, tutorIds),
              eq(users.isDeleted, false),
              eq(users.isActive, true)
            )
          )
          .groupBy(students.tutorId)
        : [];

      const studentCountMap = new Map(studentCounts.map((sc: any) => [sc.tutorId, Number(sc.count)]));

      // Group sessions by tutor and create unique schedule entries
      const tutorSchedulesMap = new Map<string, Set<string>>();
      for (const session of upcomingSessions) {
        if (!session.tutorId) continue;
        if (!tutorSchedulesMap.has(session.tutorId)) {
          tutorSchedulesMap.set(session.tutorId, new Set());
        }
        const dayOfWeek = new Date(session.sessionDate).toLocaleDateString('en-US', { weekday: 'long' });
        const scheduleKey = `${session.className}|${dayOfWeek}|${session.startTime}|${session.endTime}`;
        tutorSchedulesMap.get(session.tutorId)!.add(scheduleKey);
      }

      // Add schedules and student count to tutors
      return companyTutors.map(tutor => {
        const scheduleSet = tutorSchedulesMap.get(tutor.id);
        const schedules = scheduleSet 
          ? Array.from(scheduleSet).map(key => {
              const [className, dayOfWeek, startTime, endTime] = key.split('|');
              return { className, dayOfWeek, startTime, endTime };
            })
          : [];
        
        return {
          ...tutor,
          schedules,
          studentCount: studentCountMap.get(tutor.id) || 0
        };
      });
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

  async createUserWithRole(userData: Partial<InsertUser> & { role: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      email: userData.email!,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      role: userData.role as any,
      isActive: userData.isActive ?? true,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
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
          // Assignment functionality has been removed from the application
          // await db.delete(assignments).where(eq(assignments.studentId, student.id));
          // await db.delete(submissions).where(eq(submissions.studentId, student.id));
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
          // Assignment functionality has been removed from the application
          // await db.delete(assignments).where(eq(assignments.tutorId, tutor.id));
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

  async permanentlyDeleteAcademicTerm(id: string): Promise<void> {
    // First, get all assignments for this term to delete their submissions
    const termAssignments = await db.select().from(assignments).where(eq(assignments.termId, id));
    
    // Delete submissions for each assignment
    for (const assignment of termAssignments) {
      await db.delete(submissions).where(eq(submissions.assignmentId, assignment.id));
    }
    
    // Delete all assignments for this term
    await db.delete(assignments).where(eq(assignments.termId, id));
    
    // Get all classes in this term
    const termClasses = await db.select().from(classes).where(eq(classes.termId, id));
    
    for (const classItem of termClasses) {
      // Delete class sessions and attendance for each class
      const classSess = await db.select().from(classSessions).where(eq(classSessions.classId, classItem.id));
      for (const session of classSess) {
        await db.delete(sessionAttendance).where(eq(sessionAttendance.sessionId, session.id));
      }
      await db.delete(classSessions).where(eq(classSessions.classId, classItem.id));
      
      // Delete student class assignments
      await db.delete(studentClassAssignments).where(eq(studentClassAssignments.classId, classItem.id));
    }
    
    // Delete all classes in this term
    await db.delete(classes).where(eq(classes.termId, id));
    
    // Finally delete the term itself
    await db.delete(academicTerms).where(eq(academicTerms.id, id));
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

  async permanentlyDeleteClass(id: string): Promise<void> {
    // First, get all assignments for this class to delete their submissions
    const classAssignments = await db.select().from(assignments).where(eq(assignments.classId, id));
    
    // Delete submissions for each assignment
    for (const assignment of classAssignments) {
      await db.delete(submissions).where(eq(submissions.assignmentId, assignment.id));
    }
    
    // Delete all assignments for this class
    await db.delete(assignments).where(eq(assignments.classId, id));
    
    // Delete student class assignments
    await db.delete(studentClassAssignments).where(eq(studentClassAssignments.classId, id));
    
    // Delete class sessions and attendance
    const classSess = await db.select().from(classSessions).where(eq(classSessions.classId, id));
    for (const session of classSess) {
      await db.delete(sessionAttendance).where(eq(sessionAttendance.sessionId, session.id));
    }
    await db.delete(classSessions).where(eq(classSessions.classId, id));
    
    // Then delete the class itself
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Student Class Assignments
  async assignStudentToClass(assignment: InsertStudentClassAssignment): Promise<StudentClassAssignment> {
    const [newAssignment] = await db.insert(studentClassAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getStudentsByClass(classId: string): Promise<StudentClassAssignment[]> {
    return await db.select().from(studentClassAssignments)
      .where(and(eq(studentClassAssignments.classId, classId), eq(studentClassAssignments.isActive, true)))
      .orderBy(studentClassAssignments.assignedDate);
  }

  async getClassesByStudent(studentId: string): Promise<StudentClassAssignment[]> {
    return await db.select().from(studentClassAssignments)
      .where(and(eq(studentClassAssignments.studentId, studentId), eq(studentClassAssignments.isActive, true)))
      .orderBy(studentClassAssignments.assignedDate);
  }

  async getEnrolledClassesWithDetails(studentId: string): Promise<any[]> {
    const result = await db.select({
      id: classes.id,
      name: classes.name,
      subject: classes.subject,
      description: classes.description,
      startTime: classes.startTime,
      endTime: classes.endTime,
      daysOfWeek: classes.daysOfWeek,
      dayOfWeek: classes.dayOfWeek,
      location: classes.location,
      isActive: classes.isActive,
      tutorId: classes.tutorId,
      termId: classes.termId,
    })
    .from(studentClassAssignments)
    .innerJoin(classes, eq(studentClassAssignments.classId, classes.id))
    .where(and(
      eq(studentClassAssignments.studentId, studentId),
      eq(studentClassAssignments.isActive, true),
      eq(classes.isActive, true)
    ));

    // Get tutor names for each class
    const classesWithTutors = await Promise.all(result.map(async (classInfo) => {
      let tutorName = undefined;
      if (classInfo.tutorId) {
        const tutor = await this.getTutor(classInfo.tutorId);
        if (tutor) {
          tutorName = `${tutor.firstName} ${tutor.lastName}`;
        }
      }
      return { ...classInfo, tutorName };
    }));

    return classesWithTutors;
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    await db.update(studentClassAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(studentClassAssignments.studentId, studentId),
        eq(studentClassAssignments.classId, classId)
      ));
  }

  // Assignment operations
  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(assignmentData).returning();
    return assignment;
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async getAssignmentsByClass(classId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(and(eq(assignments.classId, classId), eq(assignments.isActive, true)))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsByCompany(companyId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(and(eq(assignments.companyId, companyId), eq(assignments.isActive, true)))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db.update(assignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.update(assignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(assignments.id, id));
  }

  // Submission operations
  async createSubmission(submissionData: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(submissionData).returning();
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.createdAt));
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.createdAt));
  }

  async getSubmissionsByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)))
      .orderBy(desc(submissions.createdAt));
  }

  async updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission> {
    const [updatedSubmission] = await db.update(submissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async deleteSubmission(id: string): Promise<void> {
    await db.delete(submissions).where(eq(submissions.id, id));
  }

  // Student Portal Methods
  async getStudentTerms(studentId: string): Promise<AcademicTerm[]> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Get all terms for the student's company
    return await db.select().from(academicTerms)
      .where(eq(academicTerms.companyId, student.companyId))
      .orderBy(desc(academicTerms.startDate));
  }

  async getStudentClasses(studentId: string): Promise<Class[]> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Get classes for the student's company
    return await db.select().from(classes)
      .where(eq(classes.companyId, student.companyId))
      .orderBy(classes.name);
  }

  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Get classes for this student's company
    const studentClasses = await db.select().from(classes)
      .where(eq(classes.companyId, student.companyId));
    const classIds = studentClasses.map(cls => cls.id);
    
    if (classIds.length === 0) {
      return [];
    }
    
    // Get assignments for these classes
    return await db.select().from(assignments)
      .where(and(
        inArray(assignments.classId, classIds),
        eq(assignments.isActive, true)
      ))
      .orderBy(desc(assignments.createdAt));
  }

  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.createdAt));
  }

  async getAssignmentByWorksheetAndStudent(worksheetId: string, studentId: string): Promise<Assignment | undefined> {
    // Find an assignment that uses this worksheet and is assigned to a class containing this student
    const student = await this.getStudent(studentId);
    if (!student) {
      return undefined;
    }
    
    // Get classes for this student
    const studentClasses = await db.select().from(studentClassAssignments)
      .where(eq(studentClassAssignments.studentId, studentId));
    const classIds = studentClasses.map((a: any) => a.classId);
    
    if (classIds.length === 0) {
      return undefined;
    }
    
    // Find assignment with this worksheet in any of the student's classes
    const [assignment] = await db.select().from(assignments)
      .where(and(
        eq(assignments.worksheetId, worksheetId),
        eq(assignments.assignmentKind, 'worksheet'),
        inArray(assignments.classId, classIds)
      ))
      .limit(1);
    
    return assignment;
  }

  async getCompanySubmissions(companyId: string): Promise<any[]> {
    try {
      console.log("Getting submissions for company:", companyId);
      
      // Get all submissions for students in this company with proper field names
      const results = await db
        .select({
          // Submission fields (using actual schema fields)
          submissionId: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          content: submissions.content,
          digitalContent: submissions.digitalContent,
          fileUrls: submissions.fileUrls,
          status: submissions.status,
          isDraft: submissions.isDraft,
          submittedAt: submissions.submittedAt,
          isLate: submissions.isLate,
          deviceType: submissions.deviceType,
          inputMethod: submissions.inputMethod,
          submissionCreatedAt: submissions.createdAt,
          submissionUpdatedAt: submissions.updatedAt,
          // Student fields
          studentUserId: students.userId,
          studentCompanyId: students.companyId,
          // User fields for the student
          userFirstName: users.firstName,
          userLastName: users.lastName,
          userEmail: users.email,
          // Assignment fields (using actual schema fields)
          assignmentTitle: assignments.title,
          assignmentDescription: assignments.description,
          assignmentInstructions: assignments.instructions,
          assignmentSubmissionDate: assignments.submissionDate,
        })
        .from(submissions)
        .innerJoin(students, eq(submissions.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .where(eq(students.companyId, companyId))
        .orderBy(desc(submissions.createdAt));

      console.log("Found submissions:", results.length);

      // Transform to match expected structure
      return results.map(result => ({
        id: result.submissionId,
        assignmentId: result.assignmentId,
        studentId: result.studentId,
        content: result.content,
        digitalContent: result.digitalContent,
        fileUrls: result.fileUrls,
        status: result.status,
        isDraft: result.isDraft,
        submittedAt: result.submittedAt,
        isLate: result.isLate,
        deviceType: result.deviceType,
        inputMethod: result.inputMethod,
        createdAt: result.submissionCreatedAt,
        updatedAt: result.submissionUpdatedAt,
        student: {
          id: result.studentId,
          userId: result.studentUserId,
          companyId: result.studentCompanyId,
          user: {
            firstName: result.userFirstName,
            lastName: result.userLastName,
            email: result.userEmail,
          }
        },
        assignment: {
          id: result.assignmentId,
          title: result.assignmentTitle,
          description: result.assignmentDescription,
          instructions: result.assignmentInstructions,
          submissionDate: result.assignmentSubmissionDate,
        }
      }));
    } catch (error) {
      console.error("Error in getCompanySubmissions:", error);
      return [];
    }
  }

  // ==========================================
  // WORKSHEET OPERATIONS
  // ==========================================

  async createWorksheet(data: InsertWorksheet): Promise<Worksheet> {
    const [worksheet] = await db.insert(worksheets).values(data).returning();
    return worksheet;
  }

  async getWorksheet(id: string): Promise<Worksheet | undefined> {
    const [worksheet] = await db.select().from(worksheets).where(eq(worksheets.id, id));
    return worksheet;
  }

  async getWorksheetsByCompany(companyId: string): Promise<Worksheet[]> {
    return db.select().from(worksheets).where(eq(worksheets.companyId, companyId)).orderBy(desc(worksheets.createdAt));
  }

  async updateWorksheet(id: string, data: Partial<InsertWorksheet>): Promise<Worksheet> {
    const [worksheet] = await db.update(worksheets).set({ ...data, updatedAt: new Date() }).where(eq(worksheets.id, id)).returning();
    return worksheet;
  }

  async deleteWorksheet(id: string): Promise<void> {
    await db.delete(worksheets).where(eq(worksheets.id, id));
  }

  async createWorksheetPage(data: InsertWorksheetPage): Promise<WorksheetPage> {
    const [page] = await db.insert(worksheetPages).values(data).returning();
    return page;
  }

  async getWorksheetPages(worksheetId: string): Promise<WorksheetPage[]> {
    return db.select().from(worksheetPages).where(eq(worksheetPages.worksheetId, worksheetId)).orderBy(worksheetPages.pageNumber);
  }

  async updateWorksheetPage(id: string, data: Partial<InsertWorksheetPage>): Promise<WorksheetPage> {
    const [page] = await db.update(worksheetPages).set(data).where(eq(worksheetPages.id, id)).returning();
    return page;
  }

  async deleteWorksheetPage(id: string): Promise<void> {
    await db.delete(worksheetPages).where(eq(worksheetPages.id, id));
  }

  async createWorksheetQuestion(data: InsertWorksheetQuestion): Promise<WorksheetQuestion> {
    const [question] = await db.insert(worksheetQuestions).values(data).returning();
    return question;
  }

  async getWorksheetQuestions(pageId: string): Promise<WorksheetQuestion[]> {
    return db.select().from(worksheetQuestions).where(eq(worksheetQuestions.pageId, pageId)).orderBy(worksheetQuestions.questionNumber);
  }

  async updateWorksheetQuestion(id: string, data: Partial<InsertWorksheetQuestion>): Promise<WorksheetQuestion> {
    const [question] = await db.update(worksheetQuestions).set(data).where(eq(worksheetQuestions.id, id)).returning();
    return question;
  }

  async deleteWorksheetQuestion(id: string): Promise<void> {
    await db.delete(worksheetQuestions).where(eq(worksheetQuestions.id, id));
  }

  async createWorksheetAssignment(data: InsertWorksheetAssignment): Promise<WorksheetAssignment> {
    const [assignment] = await db.insert(worksheetAssignments).values(data).returning();
    return assignment;
  }

  async getWorksheetAssignments(worksheetId: string): Promise<WorksheetAssignment[]> {
    return db.select().from(worksheetAssignments).where(eq(worksheetAssignments.worksheetId, worksheetId));
  }

  async getStudentWorksheetAssignments(studentId: string): Promise<any[]> {
    const results = await db.select({
      assignment: worksheetAssignments,
      worksheet: worksheets,
    })
    .from(worksheetAssignments)
    .innerJoin(worksheets, eq(worksheetAssignments.worksheetId, worksheets.id))
    .where(eq(worksheetAssignments.studentId, studentId));
    
    return results;
  }

  async deleteWorksheetAssignment(id: string): Promise<void> {
    await db.delete(worksheetAssignments).where(eq(worksheetAssignments.id, id));
  }

  async createWorksheetAnswer(data: InsertWorksheetAnswer): Promise<WorksheetAnswer> {
    const [answer] = await db.insert(worksheetAnswers).values(data).returning();
    return answer;
  }

  async getWorksheetAnswers(worksheetId: string, studentId: string): Promise<WorksheetAnswer[]> {
    return db.select().from(worksheetAnswers)
      .where(and(eq(worksheetAnswers.worksheetId, worksheetId), eq(worksheetAnswers.studentId, studentId)));
  }

  async updateWorksheetAnswer(id: string, data: Partial<InsertWorksheetAnswer>): Promise<WorksheetAnswer> {
    const [answer] = await db.update(worksheetAnswers).set({ ...data, updatedAt: new Date() }).where(eq(worksheetAnswers.id, id)).returning();
    return answer;
  }

  async upsertWorksheetAnswer(questionId: string, studentId: string, worksheetId: string, data: Partial<InsertWorksheetAnswer>): Promise<WorksheetAnswer> {
    const [existing] = await db.select().from(worksheetAnswers)
      .where(and(
        eq(worksheetAnswers.questionId, questionId),
        eq(worksheetAnswers.studentId, studentId)
      ));
    
    if (existing) {
      const [updated] = await db.update(worksheetAnswers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(worksheetAnswers.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(worksheetAnswers)
        .values({ questionId, studentId, worksheetId, ...data } as InsertWorksheetAnswer)
        .returning();
      return created;
    }
  }

  async submitWorksheetAnswers(worksheetId: string, studentId: string): Promise<void> {
    const now = new Date();
    
    // Update all answers as submitted
    await db.update(worksheetAnswers)
      .set({ isSubmitted: true, submittedAt: now })
      .where(and(
        eq(worksheetAnswers.worksheetId, worksheetId),
        eq(worksheetAnswers.studentId, studentId)
      ));
    
    // Update the assignment status to submitted
    await db.update(worksheetAssignments)
      .set({ status: 'submitted', submittedAt: now })
      .where(and(
        eq(worksheetAssignments.worksheetId, worksheetId),
        eq(worksheetAssignments.studentId, studentId)
      ));
  }
  
  async updateWorksheetAssignmentProgress(worksheetId: string, studentId: string): Promise<void> {
    // Mark assignment as in progress when student starts saving answers
    const [assignment] = await db.select().from(worksheetAssignments)
      .where(and(
        eq(worksheetAssignments.worksheetId, worksheetId),
        eq(worksheetAssignments.studentId, studentId),
        eq(worksheetAssignments.status, 'assigned')
      ));
    
    if (assignment) {
      await db.update(worksheetAssignments)
        .set({ status: 'in_progress' })
        .where(eq(worksheetAssignments.id, assignment.id));
    }
  }

  async getFullWorksheet(worksheetId: string): Promise<any> {
    const worksheet = await this.getWorksheet(worksheetId);
    if (!worksheet) return null;
    
    const pages = await this.getWorksheetPages(worksheetId);
    const pagesWithQuestions = await Promise.all(pages.map(async (page) => {
      const questions = await this.getWorksheetQuestions(page.id);
      return { ...page, questions };
    }));
    
    return { ...worksheet, pages: pagesWithQuestions };
  }

  // Test/Exam operations
  async createTest(testData: InsertTest): Promise<Test> {
    const [test] = await db.insert(tests).values(testData).returning();
    return test;
  }

  async getTest(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async getTestsByCompany(companyId: string): Promise<Test[]> {
    return db.select().from(tests).where(eq(tests.companyId, companyId)).orderBy(desc(tests.createdAt));
  }

  async getTestsByClass(classId: string): Promise<Test[]> {
    return db.select().from(tests).where(eq(tests.classId, classId)).orderBy(desc(tests.createdAt));
  }

  async updateTest(id: string, updates: Partial<InsertTest>): Promise<Test> {
    const [test] = await db.update(tests).set({ ...updates, updatedAt: new Date() }).where(eq(tests.id, id)).returning();
    return test;
  }

  async deleteTest(id: string): Promise<void> {
    await db.delete(tests).where(eq(tests.id, id));
  }

  async getTestWithQuestions(testId: string): Promise<any> {
    const test = await this.getTest(testId);
    if (!test) return null;
    
    const questions = await this.getTestQuestions(testId);
    return { ...test, questions };
  }

  // Test question operations
  async createTestQuestion(questionData: InsertTestQuestion): Promise<TestQuestion> {
    const [question] = await db.insert(testQuestions).values(questionData).returning();
    
    // Update total points on the test
    const allQuestions = await this.getTestQuestions(questionData.testId);
    const totalPoints = allQuestions.reduce((sum, q) => sum + (q.points || 0), 0) + (questionData.points || 1);
    await this.updateTest(questionData.testId, { totalPoints });
    
    return question;
  }

  async getTestQuestions(testId: string): Promise<TestQuestion[]> {
    return db.select().from(testQuestions).where(eq(testQuestions.testId, testId)).orderBy(testQuestions.questionNumber);
  }

  async updateTestQuestion(id: string, updates: Partial<InsertTestQuestion>): Promise<TestQuestion> {
    const [question] = await db.update(testQuestions).set(updates).where(eq(testQuestions.id, id)).returning();
    
    // Recalculate total points if points changed
    if (updates.points !== undefined) {
      const allQuestions = await this.getTestQuestions(question.testId);
      const totalPoints = allQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
      await this.updateTest(question.testId, { totalPoints });
    }
    
    return question;
  }

  async deleteTestQuestion(id: string): Promise<void> {
    const [question] = await db.select().from(testQuestions).where(eq(testQuestions.id, id));
    if (question) {
      await db.delete(testQuestions).where(eq(testQuestions.id, id));
      // Recalculate total points
      const allQuestions = await this.getTestQuestions(question.testId);
      const totalPoints = allQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
      await this.updateTest(question.testId, { totalPoints });
    }
  }

  // Test assignment operations
  async createTestAssignment(assignmentData: InsertTestAssignment): Promise<TestAssignment> {
    const [assignment] = await db.insert(testAssignments).values(assignmentData).returning();
    return assignment;
  }

  async getTestAssignments(testId: string): Promise<TestAssignment[]> {
    return db.select().from(testAssignments).where(eq(testAssignments.testId, testId));
  }

  async getStudentTestAssignments(studentId: string): Promise<any[]> {
    const results = await db.select({
      assignment: testAssignments,
      test: tests,
    })
    .from(testAssignments)
    .innerJoin(tests, eq(testAssignments.testId, tests.id))
    .where(eq(testAssignments.studentId, studentId));
    
    return results;
  }

  async deleteTestAssignment(id: string): Promise<void> {
    await db.delete(testAssignments).where(eq(testAssignments.id, id));
  }

  // Test attempt operations
  async createTestAttempt(attemptData: InsertTestAttempt): Promise<TestAttempt> {
    const [attempt] = await db.insert(testAttempts).values(attemptData).returning();
    return attempt;
  }

  async getTestAttempt(id: string): Promise<TestAttempt | undefined> {
    const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
    return attempt;
  }

  async getTestAttemptsByTest(testId: string): Promise<TestAttempt[]> {
    return db.select().from(testAttempts).where(eq(testAttempts.testId, testId)).orderBy(desc(testAttempts.createdAt));
  }

  async getTestAttemptsByStudent(studentId: string): Promise<TestAttempt[]> {
    return db.select().from(testAttempts).where(eq(testAttempts.studentId, studentId)).orderBy(desc(testAttempts.createdAt));
  }

  async updateTestAttempt(id: string, updates: Partial<InsertTestAttempt>): Promise<TestAttempt> {
    const [attempt] = await db.update(testAttempts).set(updates).where(eq(testAttempts.id, id)).returning();
    return attempt;
  }

  // Test answer operations
  async createTestAnswer(answerData: InsertTestAnswer): Promise<TestAnswer> {
    const [answer] = await db.insert(testAnswers).values(answerData).returning();
    return answer;
  }

  async getTestAnswersByAttempt(attemptId: string): Promise<TestAnswer[]> {
    return db.select().from(testAnswers).where(eq(testAnswers.attemptId, attemptId));
  }

  async updateTestAnswer(id: string, updates: Partial<InsertTestAnswer>): Promise<TestAnswer> {
    const [answer] = await db.update(testAnswers).set({ ...updates, updatedAt: new Date() }).where(eq(testAnswers.id, id)).returning();
    return answer;
  }

  // Auto-grade a test attempt for multiple choice and true/false questions
  async autoGradeTestAttempt(attemptId: string): Promise<{ totalScore: number; percentageScore: number }> {
    const attempt = await this.getTestAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const test = await this.getTest(attempt.testId);
    if (!test) throw new Error("Test not found");

    const questions = await this.getTestQuestions(attempt.testId);
    const answers = await this.getTestAnswersByAttempt(attemptId);

    let totalScore = 0;

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsAwarded = 0;

      if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
        const options = question.options as { id: string; text: string; isCorrect: boolean }[] | null;
        if (options && answer.selectedOption) {
          const selectedOpt = options.find(o => o.id === answer.selectedOption);
          isCorrect = selectedOpt?.isCorrect || false;
          pointsAwarded = isCorrect ? (question.points || 1) : 0;
        }
      } else if (question.questionType === 'fill_blank' && question.correctAnswer) {
        isCorrect = answer.studentAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        pointsAwarded = isCorrect ? (question.points || 1) : 0;
      }

      await this.updateTestAnswer(answer.id, {
        isCorrect,
        pointsAwarded,
        gradedAt: new Date(),
      });

      totalScore += pointsAwarded;
    }

    const percentageScore = test.totalPoints ? Math.round((totalScore / test.totalPoints) * 100) : 0;

    return { totalScore, percentageScore };
  }

  // Grade a test attempt (includes manual grading and finalization)
  async gradeTestAttempt(attemptId: string, gradedBy: string, feedback?: string): Promise<TestAttempt> {
    const attempt = await this.getTestAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const test = await this.getTest(attempt.testId);
    if (!test) throw new Error("Test not found");

    // First, auto-grade what we can
    const { totalScore, percentageScore } = await this.autoGradeTestAttempt(attemptId);

    // Determine if passed
    const isPassed = test.passingScore ? percentageScore >= test.passingScore : undefined;

    // Update the attempt with final grading
    const [gradedAttempt] = await db.update(testAttempts)
      .set({
        status: 'graded',
        totalScore,
        percentageScore,
        isPassed,
        gradedBy,
        gradedAt: new Date(),
        feedback,
      })
      .where(eq(testAttempts.id, attemptId))
      .returning();

    return gradedAttempt;
  }

  // ==========================================
  // CLASS SESSION OPERATIONS
  // ==========================================

  async createClassSession(sessionData: InsertClassSession): Promise<ClassSession> {
    const [session] = await db.insert(classSessions).values(sessionData).returning();
    return session;
  }

  async getClassSession(id: string): Promise<ClassSession | undefined> {
    const [session] = await db.select().from(classSessions).where(eq(classSessions.id, id));
    return session;
  }

  async getClassSessionsByClass(classId: string): Promise<ClassSession[]> {
    return db.select().from(classSessions)
      .where(eq(classSessions.classId, classId))
      .orderBy(classSessions.sessionDate);
  }

  async getOrCreateSessionForDate(classId: string, date: Date, tutorId?: string): Promise<ClassSession> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [existingSession] = await db.select().from(classSessions)
      .where(and(
        eq(classSessions.classId, classId),
        sql`${classSessions.sessionDate} >= ${startOfDay}`,
        sql`${classSessions.sessionDate} <= ${endOfDay}`
      ));

    if (existingSession) {
      return existingSession;
    }

    const classInfo = await this.getClass(classId);
    if (!classInfo) {
      throw new Error("Class not found");
    }

    const startTime = classInfo.startTime || "09:00";
    const endTime = classInfo.endTime || "10:00";
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMinutes = ((endH * 60 + endM) - (startH * 60 + startM)) || 60;

    const sessionData: InsertClassSession = {
      classId,
      tutorId: tutorId || classInfo.tutorId || undefined,
      sessionDate: date,
      startTime,
      endTime,
      durationMinutes,
      status: "scheduled",
      deliveryMode: "in_person",
    };

    const [newSession] = await db.insert(classSessions).values(sessionData).returning();
    return newSession;
  }

  async getClassSessionsByTutor(tutorId: string, startDate?: Date, endDate?: Date): Promise<ClassSession[]> {
    let query = db.select().from(classSessions).where(eq(classSessions.tutorId, tutorId));
    
    if (startDate && endDate) {
      return db.select().from(classSessions)
        .where(and(
          eq(classSessions.tutorId, tutorId),
          sql`${classSessions.sessionDate} >= ${startDate}`,
          sql`${classSessions.sessionDate} <= ${endDate}`
        ))
        .orderBy(classSessions.sessionDate);
    }
    
    return db.select().from(classSessions)
      .where(eq(classSessions.tutorId, tutorId))
      .orderBy(classSessions.sessionDate);
  }

  async getClassSessionsByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const studentClasses = await db.select({ classId: studentClassAssignments.classId })
      .from(studentClassAssignments)
      .where(eq(studentClassAssignments.studentId, studentId));
    
    const classIds = studentClasses.map(c => c.classId);
    if (classIds.length === 0) return [];

    let whereCondition = inArray(classSessions.classId, classIds);
    if (startDate && endDate) {
      whereCondition = and(
        inArray(classSessions.classId, classIds),
        sql`${classSessions.sessionDate} >= ${startDate}`,
        sql`${classSessions.sessionDate} <= ${endDate}`
      )!;
    }

    const sessions = await db.select({
      session: classSessions,
      class: classes,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .where(whereCondition)
    .orderBy(classSessions.sessionDate);

    // Get attendance for each session
    const sessionIds = sessions.map(s => s.session.id);
    const attendanceRecords = sessionIds.length > 0
      ? await db.select().from(sessionAttendance)
          .where(and(
            inArray(sessionAttendance.sessionId, sessionIds),
            eq(sessionAttendance.studentId, studentId)
          ))
      : [];

    return sessions.map(s => ({
      ...s.session,
      class: s.class,
      attendance: attendanceRecords.find(a => a.sessionId === s.session.id),
    }));
  }

  async getClassSessionsByCompany(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    let whereCondition = eq(classes.companyId, companyId);
    if (startDate && endDate) {
      whereCondition = and(
        eq(classes.companyId, companyId),
        sql`${classSessions.sessionDate} >= ${startDate}`,
        sql`${classSessions.sessionDate} <= ${endDate}`
      )!;
    }

    return db.select({
      session: classSessions,
      class: classes,
      tutor: tutors,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .leftJoin(tutors, eq(classSessions.tutorId, tutors.id))
    .where(whereCondition)
    .orderBy(classSessions.sessionDate);
  }

  async getClassSessionsForDate(companyId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select({
      session: classSessions,
      class: classes,
      tutor: tutors,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .leftJoin(tutors, eq(classSessions.tutorId, tutors.id))
    .where(and(
      eq(classes.companyId, companyId),
      sql`${classSessions.sessionDate} >= ${startOfDay}`,
      sql`${classSessions.sessionDate} <= ${endOfDay}`
    ))
    .orderBy(classSessions.startTime);
  }

  async updateClassSession(id: string, updates: Partial<InsertClassSession>): Promise<ClassSession> {
    const [session] = await db.update(classSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(classSessions.id, id))
      .returning();
    return session;
  }

  async deleteClassSession(id: string): Promise<void> {
    await db.delete(classSessions).where(eq(classSessions.id, id));
  }

  async generateSessionsForClass(classId: string, termStartDate: Date, termEndDate: Date): Promise<ClassSession[]> {
    const classData = await this.getClass(classId);
    if (!classData) throw new Error("Class not found");

    const createdSessions: ClassSession[] = [];
    const daysOfWeek = classData.daysOfWeek || (classData.dayOfWeek !== null ? [classData.dayOfWeek] : []);
    
    // Calculate duration from start/end times
    const [startHour, startMin] = classData.startTime.split(':').map(Number);
    const [endHour, endMin] = classData.endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    // Iterate through each day in the term
    const currentDate = new Date(termStartDate);
    while (currentDate <= termEndDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const sessionDate = new Date(currentDate);
        
        const session = await this.createClassSession({
          classId,
          tutorId: classData.tutorId,
          sessionDate,
          startTime: classData.startTime,
          endTime: classData.endTime,
          durationMinutes,
          status: 'scheduled',
          deliveryMode: 'in_person',
          locationUrl: classData.location,
        });
        
        createdSessions.push(session);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return createdSessions;
  }

  // ==========================================
  // SESSION ATTENDANCE OPERATIONS
  // ==========================================

  async markAttendance(attendanceData: InsertSessionAttendance): Promise<SessionAttendance> {
    // Check if attendance already exists for this student and session
    const [existing] = await db.select().from(sessionAttendance)
      .where(and(
        eq(sessionAttendance.sessionId, attendanceData.sessionId),
        eq(sessionAttendance.studentId, attendanceData.studentId)
      ));

    if (existing) {
      // Update existing
      return this.updateAttendance(existing.id, attendanceData);
    }

    const [attendance] = await db.insert(sessionAttendance).values(attendanceData).returning();
    return attendance;
  }

  async getAttendance(id: string): Promise<SessionAttendance | undefined> {
    const [attendance] = await db.select().from(sessionAttendance).where(eq(sessionAttendance.id, id));
    return attendance;
  }

  async getAttendanceBySession(sessionId: string): Promise<SessionAttendance[]> {
    return db.select({
      attendance: sessionAttendance,
      student: students,
      user: users,
    })
    .from(sessionAttendance)
    .innerJoin(students, eq(sessionAttendance.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(sessionAttendance.sessionId, sessionId)) as any;
  }

  async getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<SessionAttendance[]> {
    if (startDate && endDate) {
      return db.select({
        attendance: sessionAttendance,
        session: classSessions,
      })
      .from(sessionAttendance)
      .innerJoin(classSessions, eq(sessionAttendance.sessionId, classSessions.id))
      .where(and(
        eq(sessionAttendance.studentId, studentId),
        sql`${classSessions.sessionDate} >= ${startDate}`,
        sql`${classSessions.sessionDate} <= ${endDate}`
      )) as any;
    }

    return db.select().from(sessionAttendance)
      .where(eq(sessionAttendance.studentId, studentId));
  }

  async updateAttendance(id: string, updates: Partial<InsertSessionAttendance>): Promise<SessionAttendance> {
    const [attendance] = await db.update(sessionAttendance)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sessionAttendance.id, id))
      .returning();
    return attendance;
  }

  async markAllPresent(sessionId: string, markedBy: string): Promise<void> {
    // Get session's class
    const session = await this.getClassSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Get all students in the class
    const studentAssignments = await this.getStudentsByClass(session.classId);
    
    // Mark each as present
    for (const assignment of studentAssignments) {
      await this.markAttendance({
        sessionId,
        studentId: assignment.studentId,
        status: 'present',
        markedBy,
        markedAt: new Date(),
      });
    }

    // Update session attended count
    await this.updateClassSession(sessionId, {
      attendedCount: studentAssignments.length,
    });
  }

  async overrideAttendance(id: string, newStatus: string, overrideBy: string, notes?: string): Promise<SessionAttendance> {
    const [attendance] = await db.update(sessionAttendance)
      .set({
        status: newStatus as any,
        isOverride: true,
        overrideBy,
        overrideAt: new Date(),
        notes: notes || undefined,
        updatedAt: new Date(),
      })
      .where(eq(sessionAttendance.id, id))
      .returning();
    return attendance;
  }

  async lockSessionAttendance(sessionId: string): Promise<void> {
    await db.update(classSessions)
      .set({
        attendanceLocked: true,
        attendanceLockedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));
  }

  async getStudentAttendanceSummary(studentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }> {
    // Get student's classes
    const studentClasses = await db.select({ classId: studentClassAssignments.classId })
      .from(studentClassAssignments)
      .where(eq(studentClassAssignments.studentId, studentId));
    
    const classIds = studentClasses.map(c => c.classId);
    if (classIds.length === 0) {
      return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, attendancePercentage: 0 };
    }

    // Get all sessions for these classes
    let sessionsCondition: any = and(
      inArray(classSessions.classId, classIds),
      or(eq(classSessions.status, 'completed'), eq(classSessions.status, 'in_progress'))
    );
    
    if (startDate && endDate) {
      sessionsCondition = and(
        sessionsCondition,
        sql`${classSessions.sessionDate} >= ${startDate}`,
        sql`${classSessions.sessionDate} <= ${endDate}`
      );
    }

    const sessions = await db.select().from(classSessions).where(sessionsCondition);
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, attendancePercentage: 0 };
    }

    // Get attendance records
    const sessionIds = sessions.map(s => s.id);
    const attendanceRecords = await db.select().from(sessionAttendance)
      .where(and(
        inArray(sessionAttendance.sessionId, sessionIds),
        eq(sessionAttendance.studentId, studentId)
      ));

    const present = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = totalSessions - attendanceRecords.length + attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const excused = attendanceRecords.filter(a => a.status === 'excused').length;
    const attendancePercentage = Math.round(((present + late) / totalSessions) * 100);

    return { totalSessions, present, absent, late, excused, attendancePercentage };
  }

  async getStudentAttendanceBySubject(studentId: string): Promise<any[]> {
    // Get student's classes grouped by subject
    const studentClasses = await db.select({
      classId: studentClassAssignments.classId,
      subject: classes.subject,
    })
    .from(studentClassAssignments)
    .innerJoin(classes, eq(studentClassAssignments.classId, classes.id))
    .where(eq(studentClassAssignments.studentId, studentId));

    const subjectStats: { [key: string]: { total: number; attended: number } } = {};

    for (const classData of studentClasses) {
      if (!subjectStats[classData.subject]) {
        subjectStats[classData.subject] = { total: 0, attended: 0 };
      }

      // Get completed sessions for this class
      const sessions = await db.select().from(classSessions)
        .where(and(
          eq(classSessions.classId, classData.classId),
          eq(classSessions.status, 'completed')
        ));

      subjectStats[classData.subject].total += sessions.length;

      // Get attendance records
      const sessionIds = sessions.map(s => s.id);
      if (sessionIds.length > 0) {
        const attendanceRecords = await db.select().from(sessionAttendance)
          .where(and(
            inArray(sessionAttendance.sessionId, sessionIds),
            eq(sessionAttendance.studentId, studentId),
            or(eq(sessionAttendance.status, 'present'), eq(sessionAttendance.status, 'late'))
          ));
        subjectStats[classData.subject].attended += attendanceRecords.length;
      }
    }

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      totalSessions: stats.total,
      attended: stats.attended,
      attendancePercentage: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
    }));
  }

  async getStudentLearningHours(studentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMinutes: number;
    bySubject: { subject: string; minutes: number }[];
    byWeek: { week: string; minutes: number }[];
  }> {
    // Get student's classes
    const studentClasses = await db.select({
      classId: studentClassAssignments.classId,
      subject: classes.subject,
    })
    .from(studentClassAssignments)
    .innerJoin(classes, eq(studentClassAssignments.classId, classes.id))
    .where(eq(studentClassAssignments.studentId, studentId));

    const classIds = studentClasses.map(c => c.classId);
    if (classIds.length === 0) {
      return { totalMinutes: 0, bySubject: [], byWeek: [] };
    }

    // Build condition for sessions
    let sessionsCondition: any = and(
      inArray(classSessions.classId, classIds),
      eq(classSessions.status, 'completed')
    );

    if (startDate && endDate) {
      sessionsCondition = and(
        sessionsCondition,
        sql`${classSessions.sessionDate} >= ${startDate}`,
        sql`${classSessions.sessionDate} <= ${endDate}`
      );
    }

    const sessions = await db.select({
      session: classSessions,
      subject: classes.subject,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .where(sessionsCondition);

    // Get attendance records for attended sessions
    const sessionIds = sessions.map(s => s.session.id);
    const attendanceRecords = sessionIds.length > 0
      ? await db.select().from(sessionAttendance)
          .where(and(
            inArray(sessionAttendance.sessionId, sessionIds),
            eq(sessionAttendance.studentId, studentId),
            or(eq(sessionAttendance.status, 'present'), eq(sessionAttendance.status, 'late'))
          ))
      : [];

    const attendedSessionIds = new Set(attendanceRecords.map(a => a.sessionId));

    // Calculate totals
    let totalMinutes = 0;
    const subjectMinutes: { [key: string]: number } = {};
    const weekMinutes: { [key: string]: number } = {};

    for (const { session, subject } of sessions) {
      if (attendedSessionIds.has(session.id)) {
        const duration = session.durationMinutes || 0;
        totalMinutes += duration;

        // By subject
        subjectMinutes[subject] = (subjectMinutes[subject] || 0) + duration;

        // By week
        const weekStart = new Date(session.sessionDate!);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weekMinutes[weekKey] = (weekMinutes[weekKey] || 0) + duration;
      }
    }

    return {
      totalMinutes,
      bySubject: Object.entries(subjectMinutes).map(([subject, minutes]) => ({ subject, minutes })),
      byWeek: Object.entries(weekMinutes).map(([week, minutes]) => ({ week, minutes })).sort((a, b) => a.week.localeCompare(b.week)),
    };
  }

  async getClassAttendanceHistory(classId: string, limit: number = 10): Promise<any[]> {
    const sessions = await db.select({
      session: classSessions,
    })
    .from(classSessions)
    .where(eq(classSessions.classId, classId))
    .orderBy(sql`${classSessions.sessionDate} DESC`)
    .limit(limit);

    const result = [];
    for (const { session } of sessions) {
      const attendance = await db.select({
        attendance: sessionAttendance,
        student: students,
        user: users,
      })
      .from(sessionAttendance)
      .innerJoin(students, eq(sessionAttendance.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(sessionAttendance.sessionId, session.id));

      const presentCount = attendance.filter((a: any) => 
        a.attendance.status === 'present' || a.attendance.status === 'late'
      ).length;

      result.push({
        session,
        attendance: attendance.map((a: any) => ({
          id: a.attendance.id,
          studentId: a.attendance.studentId,
          status: a.attendance.status,
          notes: a.attendance.notes,
          studentName: `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || a.user.email,
        })),
        summary: {
          total: attendance.length,
          present: presentCount,
          absent: attendance.length - presentCount,
        },
      });
    }

    return result;
  }

  // ==========================================
  // ACADEMIC HOLIDAY OPERATIONS
  // ==========================================

  async createAcademicHoliday(holidayData: InsertAcademicHoliday): Promise<AcademicHoliday> {
    const [holiday] = await db.insert(academicHolidays).values(holidayData).returning();
    return holiday;
  }

  async getAcademicHoliday(id: string): Promise<AcademicHoliday | undefined> {
    const [holiday] = await db.select().from(academicHolidays).where(eq(academicHolidays.id, id));
    return holiday;
  }

  async getAcademicHolidaysByCompany(companyId: string): Promise<AcademicHoliday[]> {
    return db.select().from(academicHolidays)
      .where(or(
        eq(academicHolidays.companyId, companyId),
        eq(academicHolidays.isPublic, true)
      ))
      .orderBy(academicHolidays.startDate);
  }

  async getPublicHolidays(startDate?: Date, endDate?: Date): Promise<AcademicHoliday[]> {
    let condition: any = eq(academicHolidays.isPublic, true);
    
    if (startDate && endDate) {
      condition = and(
        condition,
        sql`${academicHolidays.startDate} >= ${startDate}`,
        sql`${academicHolidays.endDate} <= ${endDate}`
      );
    }

    return db.select().from(academicHolidays)
      .where(condition)
      .orderBy(academicHolidays.startDate);
  }

  async updateAcademicHoliday(id: string, updates: Partial<InsertAcademicHoliday>): Promise<AcademicHoliday> {
    const [holiday] = await db.update(academicHolidays)
      .set(updates)
      .where(eq(academicHolidays.id, id))
      .returning();
    return holiday;
  }

  async deleteAcademicHoliday(id: string): Promise<void> {
    await db.delete(academicHolidays).where(eq(academicHolidays.id, id));
  }

  // ==========================================
  // NOTIFICATION PREFERENCES OPERATIONS
  // ==========================================

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async createNotificationPreferences(data: Partial<InsertNotificationPreferences> & { userId: string }): Promise<NotificationPreferences> {
    const [prefs] = await db.insert(notificationPreferences).values(data).returning();
    return prefs;
  }

  async updateNotificationPreferences(userId: string, updates: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    const [prefs] = await db.update(notificationPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return prefs;
  }

  // ==========================================
  // REPORT OPERATIONS
  // ==========================================

  async createReportRun(data: Partial<InsertReportRun> & { companyId: string; reportType: any; name: string }): Promise<ReportRun> {
    const [report] = await db.insert(reportRuns).values(data as any).returning();
    return report;
  }

  async getReportRun(id: string): Promise<ReportRun | undefined> {
    const [report] = await db.select().from(reportRuns).where(eq(reportRuns.id, id));
    return report;
  }

  async getReportRunsByCompany(companyId: string): Promise<ReportRun[]> {
    return db.select().from(reportRuns)
      .where(eq(reportRuns.companyId, companyId))
      .orderBy(desc(reportRuns.createdAt));
  }

  async updateReportRun(id: string, updates: Partial<InsertReportRun>): Promise<ReportRun> {
    const [report] = await db.update(reportRuns)
      .set(updates as any)
      .where(eq(reportRuns.id, id))
      .returning();
    return report;
  }

  async deleteReportRun(id: string): Promise<void> {
    await db.delete(reportRuns).where(eq(reportRuns.id, id));
  }

  // Helper methods for report generation
  async getAttendanceByStudent(studentId: string): Promise<SessionAttendance[]> {
    return db.select().from(sessionAttendance)
      .where(eq(sessionAttendance.studentId, studentId));
  }

  async getClassesByTutor(tutorId: string): Promise<Class[]> {
    return db.select().from(classes)
      .where(eq(classes.tutorId, tutorId));
  }

  async getStudentsByCompany(companyId: string): Promise<Student[]> {
    return db.select().from(students)
      .where(eq(students.companyId, companyId));
  }

  async getTermsByCompany(companyId: string): Promise<AcademicTerm[]> {
    const years = await db.select().from(academicYears)
      .where(eq(academicYears.companyId, companyId));
    
    if (years.length === 0) return [];
    
    const yearIds = years.map(y => y.id);
    return db.select().from(academicTerms)
      .where(inArray(academicTerms.academicYearId, yearIds));
  }
}

export const storage = new DatabaseStorage();