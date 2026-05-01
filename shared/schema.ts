import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums for user roles and status
export const userRoleEnum = pgEnum('user_role', ['student', 'parent', 'tutor', 'admin', 'company_admin']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['assigned', 'submitted', 'reviewed', 'completed', 'late', 'needs_revision']);
export const submissionStatusEnum = pgEnum('submission_status', ['draft', 'submitted', 'late', 'graded', 'parent_verified', 'needs_revision']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'file', 'system']);
export const questionTypeEnum = pgEnum('question_type', ['short_text', 'long_text', 'multiple_choice', 'fill_blank', 'text_image', 'information']);
export const assignmentKindEnum = pgEnum('assignment_kind', ['file_upload', 'worksheet']);

// User storage table with custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default('student'),
  isActive: boolean("is_active").notNull().default(true),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  authProvider: varchar("auth_provider").default('email'), // 'email' or 'replit'
  replitId: varchar("replit_id"), // Keep for existing users
  termsAcceptedAt: timestamp("terms_accepted_at"), // When user accepted terms & privacy policy
  termsVersion: varchar("terms_version"), // Version of terms accepted (e.g., "1.0")
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table for additional student-specific data
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gradeLevel: varchar("grade_level"),
  schoolName: varchar("school_name"),
  parentId: varchar("parent_id").references(() => parents.id),
  tutorId: varchar("tutor_id").references(() => tutors.id),
  companyId: varchar("company_id").references(() => tutoringCompanies.id), // Direct company assignment
  yearId: varchar("year_id").references(() => academicYears.id), // Academic year assignment
  termId: varchar("term_id").references(() => academicTerms.id), // Academic term assignment
  classId: varchar("class_id").references(() => classes.id), // Class assignment
  createdAt: timestamp("created_at").defaultNow(),
});

// Parents table
export const parents = pgTable("parents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phoneNumber: varchar("phone_number"),
  aiHintsEnabled: boolean("ai_hints_enabled").notNull().default(true),
  maxHintsPerQuestion: integer("max_hints_per_question").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutoring Companies table
export const tutoringCompanies = pgTable("tutoring_companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  address: text("address"),
  state: varchar("state", { length: 10 }), // Australian state/territory: NSW, VIC, QLD, SA, WA, TAS, NT, ACT
  tutorChatEnabled: boolean("tutor_chat_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companySupportContacts = pgTable("company_support_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  roleLabel: varchar("role_label").notNull().default('Support'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log table - tracks security-relevant user actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  resource: varchar("resource"),
  resourceId: varchar("resource_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  status: varchar("status").notNull().default('success'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login Attempts table - tracks failed login attempts for rate limiting
export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  ipAddress: varchar("ip_address"),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company Admins table
export const companyAdmins = pgTable("company_admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  permissions: text("permissions").array(), // Array of permission strings
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutors table
export const tutors = pgTable("tutors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").references(() => tutoringCompanies.id), // Associate tutor with company
  specialization: text("specialization"),
  qualifications: text("qualifications"),
  availability: text("availability"), // e.g., "Mon-Fri 9am-5pm", "Weekends only"
  subjectsTeaching: text("subjects_teaching").array().default([]), // Array of subjects
  branch: varchar("branch", { length: 255 }), // Branch/location of the tutor
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  correctAnswer: text("correct_answer"), // Correct answer for tutor reference
  helpText: text("help_text"), // Help/hints that students can view
  submissionDate: timestamp("submission_date").notNull(), // Required deadline field
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  classId: varchar("class_id").references(() => classes.id), // Assign to entire class
  
  // Assignment type: 'file_upload' for traditional file submissions, 'worksheet' for interactive worksheets
  assignmentKind: assignmentKindEnum("assignment_kind").notNull().default('file_upload'),
  worksheetId: varchar("worksheet_id"), // Reference to worksheet (when assignmentKind is 'worksheet')
  
  // Academic organization fields
  academicYearId: varchar("academic_year_id").references(() => academicYears.id),
  termId: varchar("term_id").references(() => academicTerms.id),
  subject: varchar("subject").notNull(), // Required subject field
  week: integer("week"), // Week number (1-52 or term-specific)
  
  solutionText: text("solution_text"), // Tutor-provided solution text/explanation
  solutionFileUrls: text("solution_file_urls").array().default([]), // Tutor-uploaded solution files (PDF, doc, images)
  solutionNotes: text("solution_notes"), // Additional notes about solution files (e.g., descriptions, instructions)
  
  attachmentUrls: text("attachment_urls").array().default([]), // Files uploaded by admin/tutor
  allowedFileTypes: text("allowed_file_types").array().default(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg']), // Specified file types
  maxFileSize: integer("max_file_size").default(31457280), // 30MB in bytes
  pageRotations: jsonb("page_rotations").$type<Record<string, number>>().default({}), // Per-page rotation corrections (e.g. {"1": 90})
  status: assignmentStatusEnum("status").notNull().default('assigned'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submissions table - optimized for e-ink devices
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => assignments.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  documentUrl: varchar("document_url"), // Which specific document this submission is for (for multi-document assignments)
  content: text("content"), // Text response for pen/touchscreen input
  digitalContent: text("digital_content"), // Digitized handwriting content
  fileUrls: text("file_urls").array().default([]), // Multiple uploaded files
  status: submissionStatusEnum("status").notNull().default('draft'),
  isDraft: boolean("is_draft").notNull().default(true),
  submittedAt: timestamp("submitted_at"),
  isLate: boolean("is_late").notNull().default(false),
  // Grading fields
  score: integer("score"), // Grade score (0-100)
  feedback: text("feedback"), // Tutor feedback on the submission
  reviewerAnnotations: text("reviewer_annotations"), // JSON string of tick/cross/comment annotations from tutor/admin/parent
  annotations: text("annotations"), // JSON string of student annotations (pen strokes, text, highlights)
  gradedBy: varchar("graded_by").references(() => users.id), // Who graded this submission
  gradedAt: timestamp("graded_at"), // When it was graded
  // AI check result (stored after first check to prevent re-runs)
  aiCheckResult: text("ai_check_result"), // JSON string of AI assessment result
  // Parent feedback on the submission
  parentComment: text("parent_comment"), // Parent's comment/feedback visible to tutor
  parentCommentAt: timestamp("parent_comment_at"), // When parent left the comment
  // E-ink device specific fields
  deviceType: varchar("device_type"), // 'e-ink', 'tablet', 'desktop'
  inputMethod: varchar("input_method"), // 'pen', 'touch', 'keyboard'

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table for real-time communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").notNull().default('text'),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress tracking table
export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  assignmentId: varchar("assignment_id").notNull().references(() => assignments.id),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  timeSpent: integer("time_spent_minutes").default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  tutorId: varchar("tutor_id").references(() => tutors.id),
  studentId: varchar("student_id").references(() => students.id),
  eventType: varchar("event_type").notNull(), // 'class', 'makeup', 'meeting'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  parent: one(parents, {
    fields: [users.id],
    references: [parents.userId],
  }),
  tutor: one(tutors, {
    fields: [users.id],
    references: [tutors.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  tutor: one(tutors, {
    fields: [students.tutorId],
    references: [tutors.id],
  }),
  company: one(tutoringCompanies, {
    fields: [students.companyId],
    references: [tutoringCompanies.id],
  }),
  submissions: many(submissions),
  progress: many(progress),
  calendarEvents: many(calendarEvents),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  students: many(students),
}));

export const tutoringCompaniesRelations = relations(tutoringCompanies, ({ many }) => ({
  admins: many(companyAdmins),
  tutors: many(tutors),
  supportContacts: many(companySupportContacts),
}));

export const companySupportContactsRelations = relations(companySupportContacts, ({ one }) => ({
  company: one(tutoringCompanies, {
    fields: [companySupportContacts.companyId],
    references: [tutoringCompanies.id],
  }),
  user: one(users, {
    fields: [companySupportContacts.userId],
    references: [users.id],
  }),
}));

export const companyAdminsRelations = relations(companyAdmins, ({ one }) => ({
  user: one(users, {
    fields: [companyAdmins.userId],
    references: [users.id],
  }),
  company: one(tutoringCompanies, {
    fields: [companyAdmins.companyId],
    references: [tutoringCompanies.id],
  }),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.userId],
    references: [users.id],
  }),
  company: one(tutoringCompanies, {
    fields: [tutors.companyId],
    references: [tutoringCompanies.id],
  }),
  students: many(students),
  assignments: many(assignments),
  calendarEvents: many(calendarEvents),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  company: one(tutoringCompanies, {
    fields: [assignments.companyId],
    references: [tutoringCompanies.id],
  }),
  creator: one(users, {
    fields: [assignments.createdBy],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [assignments.classId],
    references: [classes.id],
  }),
  academicYear: one(academicYears, {
    fields: [assignments.academicYearId],
    references: [academicYears.id],
  }),
  term: one(academicTerms, {
    fields: [assignments.termId],
    references: [academicTerms.id],
  }),
  submissions: many(submissions),
  progress: many(progress),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [submissions.studentId],
    references: [students.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  student: one(students, {
    fields: [progress.studentId],
    references: [students.id],
  }),
  assignment: one(assignments, {
    fields: [progress.assignmentId],
    references: [assignments.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  tutor: one(tutors, {
    fields: [calendarEvents.tutorId],
    references: [tutors.id],
  }),
  student: one(students, {
    fields: [calendarEvents.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
});

export const insertTutorSchema = createInsertSchema(tutors).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  gradedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  lastAccessedAt: true,
  updatedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Parent = typeof parents.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;
export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type TutoringCompany = typeof tutoringCompanies.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Academic management insert schemas will be added after table definitions

export const insertTutoringCompanySchema = createInsertSchema(tutoringCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyAdminSchema = createInsertSchema(companyAdmins).omit({
  id: true,
  createdAt: true,
});

export type CompanySupportContact = typeof companySupportContacts.$inferSelect;
export const insertCompanySupportContactSchema = createInsertSchema(companySupportContacts).omit({
  id: true,
  createdAt: true,
});



// Academic Years table
export const academicYears = pgTable("academic_years", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  yearNumber: integer("year_number").notNull(), // 1-12
  name: varchar("name").notNull(), // e.g., "Year 7", "Grade 10"
  description: varchar("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Terms table
export const academicTerms = pgTable("academic_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  academicYearId: varchar("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // e.g., "Term 1", "Fall Semester"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Weeks table
export const academicWeeks = pgTable("academic_weeks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  termId: varchar("term_id").notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  name: varchar("name").notNull(), // e.g. "Week 1"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  termId: varchar("term_id").notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // e.g., "Mathematics A", "English Literature"
  subject: varchar("subject").notNull(),
  description: text("description"),
  location: varchar("location"),
  tutorId: varchar("tutor_id").references(() => tutors.id, { onDelete: "set null" }),
  dayOfWeek: integer("day_of_week"), // 0 = Sunday, 1 = Monday, etc. (nullable for backwards compatibility)
  daysOfWeek: integer("days_of_week").array().notNull().default([]), // Array of days for multi-day classes
  startTime: varchar("start_time").notNull(), // e.g., "09:00"
  endTime: varchar("end_time").notNull(), // e.g., "10:30"
  maxStudents: integer("max_students").default(20),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Class Assignments table
export const studentClassAssignments = pgTable("student_class_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: varchar("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  assignedDate: timestamp("assigned_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const academicYearsRelations = relations(academicYears, ({ one, many }) => ({
  company: one(tutoringCompanies, {
    fields: [academicYears.companyId],
    references: [tutoringCompanies.id],
  }),
  terms: many(academicTerms),
  assignments: many(assignments),
}));

export const academicTermsRelations = relations(academicTerms, ({ one, many }) => ({
  academicYear: one(academicYears, {
    fields: [academicTerms.academicYearId],
    references: [academicYears.id],
  }),
  company: one(tutoringCompanies, {
    fields: [academicTerms.companyId],
    references: [tutoringCompanies.id],
  }),
  weeks: many(academicWeeks),
  classes: many(classes),
  assignments: many(assignments),
}));

export const academicWeeksRelations = relations(academicWeeks, ({ one }) => ({
  term: one(academicTerms, {
    fields: [academicWeeks.termId],
    references: [academicTerms.id],
  }),
  company: one(tutoringCompanies, {
    fields: [academicWeeks.companyId],
    references: [tutoringCompanies.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  term: one(academicTerms, {
    fields: [classes.termId],
    references: [academicTerms.id],
  }),
  company: one(tutoringCompanies, {
    fields: [classes.companyId],
    references: [tutoringCompanies.id],
  }),
  tutor: one(tutors, {
    fields: [classes.tutorId],
    references: [tutors.id],
  }),
  studentAssignments: many(studentClassAssignments),
  assignments: many(assignments),
}));

export const studentClassAssignmentsRelations = relations(studentClassAssignments, ({ one }) => ({
  student: one(students, {
    fields: [studentClassAssignments.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentClassAssignments.classId],
    references: [classes.id],
  }),
}));

// Type exports for academic entities
export type AcademicYear = typeof academicYears.$inferSelect;
export type AcademicTerm = typeof academicTerms.$inferSelect;
export type AcademicWeek = typeof academicWeeks.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type StudentClassAssignment = typeof studentClassAssignments.$inferSelect;
export type InsertStudentClassAssignment = typeof studentClassAssignments.$inferInsert;

// Academic management insert schemas
export const insertAcademicYearSchema = createInsertSchema(academicYears).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicTermSchema = createInsertSchema(academicTerms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicWeekSchema = createInsertSchema(academicWeeks).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentClassAssignmentSchema = createInsertSchema(studentClassAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert types for academic management
export type InsertAcademicYear = z.infer<typeof insertAcademicYearSchema>;
export type InsertAcademicTerm = z.infer<typeof insertAcademicTermSchema>;
export type InsertAcademicWeek = z.infer<typeof insertAcademicWeekSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertStudentAssignment = z.infer<typeof insertStudentClassAssignmentSchema>;


export type InsertCompanyAdmin = z.infer<typeof insertCompanyAdminSchema>;
export type CompanyAdmin = typeof companyAdmins.$inferSelect;

// ==========================================
// WORKSHEET SYSTEM TABLES
// ==========================================

// Worksheets table - main worksheet document
export const worksheets = pgTable("worksheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  subject: varchar("subject"),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Worksheet pages - each page in a worksheet
export const worksheetPages = pgTable("worksheet_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksheetId: varchar("worksheet_id").notNull().references(() => worksheets.id, { onDelete: 'cascade' }),
  pageNumber: integer("page_number").notNull(),
  title: varchar("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Worksheet questions - questions on each page
export const worksheetQuestions = pgTable("worksheet_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => worksheetPages.id, { onDelete: 'cascade' }),
  questionType: questionTypeEnum("question_type").notNull(),
  questionText: text("question_text").notNull(),
  questionNumber: integer("question_number").notNull(),
  options: jsonb("options"), // For multiple choice: [{id, text, isCorrect}]
  imageUrl: varchar("image_url"), // For text+image questions
  correctAnswer: text("correct_answer"), // For fill-blank
  points: integer("points").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Worksheet assignment status enum
export const worksheetAssignmentStatusEnum = pgEnum("worksheet_assignment_status", [
  "assigned",
  "in_progress",
  "submitted",
  "graded",
]);

// Worksheet assignments - assign worksheets to students/classes
export const worksheetAssignments = pgTable("worksheet_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksheetId: varchar("worksheet_id").notNull().references(() => worksheets.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }),
  classId: varchar("class_id").references(() => classes.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  status: worksheetAssignmentStatusEnum("status").notNull().default("assigned"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student worksheet answers - student responses to questions
export const worksheetAnswers = pgTable("worksheet_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => worksheetQuestions.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").notNull().references(() => students.id),
  worksheetId: varchar("worksheet_id").notNull().references(() => worksheets.id),
  textAnswer: text("text_answer"), // For typed answers
  handwritingData: text("handwriting_data"), // For pen/stylus input (SVG or canvas data)
  selectedOption: varchar("selected_option"), // For multiple choice
  isSubmitted: boolean("is_submitted").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  grade: integer("grade"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Worksheet type exports
export type Worksheet = typeof worksheets.$inferSelect;
export type WorksheetPage = typeof worksheetPages.$inferSelect;
export type WorksheetQuestion = typeof worksheetQuestions.$inferSelect;
export type WorksheetAssignment = typeof worksheetAssignments.$inferSelect;
export type WorksheetAnswer = typeof worksheetAnswers.$inferSelect;

// Worksheet insert schemas
export const insertWorksheetSchema = createInsertSchema(worksheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorksheetPageSchema = createInsertSchema(worksheetPages).omit({
  id: true,
  createdAt: true,
});

export const insertWorksheetQuestionSchema = createInsertSchema(worksheetQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertWorksheetAssignmentSchema = createInsertSchema(worksheetAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertWorksheetAnswerSchema = createInsertSchema(worksheetAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorksheet = z.infer<typeof insertWorksheetSchema>;
export type InsertWorksheetPage = z.infer<typeof insertWorksheetPageSchema>;
export type InsertWorksheetQuestion = z.infer<typeof insertWorksheetQuestionSchema>;
export type InsertWorksheetAssignment = z.infer<typeof insertWorksheetAssignmentSchema>;
export type InsertWorksheetAnswer = z.infer<typeof insertWorksheetAnswerSchema>;

// Test/Exam status enum
export const testStatusEnum = pgEnum("test_status", ["draft", "published", "archived"]);

// Test question type enum
export const testQuestionTypeEnum = pgEnum("test_question_type", [
  "multiple_choice",
  "true_false", 
  "short_answer",
  "essay",
  "fill_blank"
]);

// Test attempt status enum
export const testAttemptStatusEnum = pgEnum("test_attempt_status", ["in_progress", "submitted", "graded"]);

// Tests table - main test/exam record
export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  subject: varchar("subject"),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  classId: varchar("class_id").references(() => classes.id),
  status: testStatusEnum("status").notNull().default("draft"),
  duration: integer("duration"), // Duration in minutes
  totalPoints: integer("total_points").default(0),
  passingScore: integer("passing_score"), // Minimum score to pass
  dueDate: timestamp("due_date"),
  allowRetakes: boolean("allow_retakes").default(false),
  showResultsImmediately: boolean("show_results_immediately").default(true),
  shuffleQuestions: boolean("shuffle_questions").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test questions table
export const testQuestions = pgTable("test_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  questionType: testQuestionTypeEnum("question_type").notNull(),
  questionText: text("question_text").notNull(),
  questionNumber: integer("question_number").notNull(),
  options: jsonb("options"), // For multiple choice: [{id, text, isCorrect}]
  correctAnswer: text("correct_answer"), // For short answer, fill blank
  points: integer("points").default(1),
  explanation: text("explanation"), // Explanation shown after grading
  createdAt: timestamp("created_at").defaultNow(),
});

// Test assignments - assign tests to students/classes
export const testAssignments = pgTable("test_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }),
  classId: varchar("class_id").references(() => classes.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Test attempts - track student test sessions
export const testAttempts = pgTable("test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").notNull().references(() => students.id),
  status: testAttemptStatusEnum("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  totalScore: integer("total_score"),
  percentageScore: integer("percentage_score"),
  isPassed: boolean("is_passed"),
  gradedBy: varchar("graded_by").references(() => users.id),
  gradedAt: timestamp("graded_at"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Test answers - student responses to questions
export const testAnswers = pgTable("test_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull().references(() => testQuestions.id, { onDelete: 'cascade' }),
  studentAnswer: text("student_answer"),
  selectedOption: varchar("selected_option"), // For multiple choice
  isCorrect: boolean("is_correct"),
  pointsAwarded: integer("points_awarded"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test type exports
export type Test = typeof tests.$inferSelect;
export type TestQuestion = typeof testQuestions.$inferSelect;
export type TestAssignment = typeof testAssignments.$inferSelect;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type TestAnswer = typeof testAnswers.$inferSelect;

// Test insert schemas
export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestQuestionSchema = createInsertSchema(testQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertTestAssignmentSchema = createInsertSchema(testAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertTestAnswerSchema = createInsertSchema(testAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertTestQuestion = z.infer<typeof insertTestQuestionSchema>;
export type InsertTestAssignment = z.infer<typeof insertTestAssignmentSchema>;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
export type InsertTestAnswer = z.infer<typeof insertTestAnswerSchema>;

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['student', 'parent', 'tutor']).default('student'),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// =====================
// CALENDAR & ATTENDANCE SYSTEM
// =====================

// Session status enum
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "in_progress", "completed", "cancelled"]);

// Attendance status enum
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "excused"]);

// Class Sessions table - individual instances of a class
export const classSessions = pgTable("class_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id").references(() => tutors.id, { onDelete: "set null" }),
  sessionDate: timestamp("session_date").notNull(),
  startTime: varchar("start_time").notNull(), // e.g., "09:00"
  endTime: varchar("end_time").notNull(), // e.g., "10:30"
  durationMinutes: integer("duration_minutes").notNull(),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  deliveryMode: varchar("delivery_mode").default("in_person"), // in_person, online, hybrid
  locationUrl: varchar("location_url"), // Online meeting link if applicable
  notes: text("notes"), // Lesson summary/notes
  enrolledCount: integer("enrolled_count").default(0),
  attendedCount: integer("attended_count").default(0),
  attendanceLocked: boolean("attendance_locked").default(false),
  attendanceLockedAt: timestamp("attendance_locked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session Attendance table - individual attendance records
export const sessionAttendance = pgTable("session_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("absent"),
  markedBy: varchar("marked_by").references(() => users.id),
  markedAt: timestamp("marked_at"),
  notes: text("notes"), // Tutor remarks
  isOverride: boolean("is_override").default(false), // Admin override flag
  overrideBy: varchar("override_by").references(() => users.id),
  overrideAt: timestamp("override_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Holidays table
export const academicHolidays = pgTable("academic_holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isPublic: boolean("is_public").default(true), // Public holiday vs company-specific
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const classSessionsRelations = relations(classSessions, ({ one, many }) => ({
  class: one(classes, {
    fields: [classSessions.classId],
    references: [classes.id],
  }),
  tutor: one(tutors, {
    fields: [classSessions.tutorId],
    references: [tutors.id],
  }),
  attendance: many(sessionAttendance),
}));

export const sessionAttendanceRelations = relations(sessionAttendance, ({ one }) => ({
  session: one(classSessions, {
    fields: [sessionAttendance.sessionId],
    references: [classSessions.id],
  }),
  student: one(students, {
    fields: [sessionAttendance.studentId],
    references: [students.id],
  }),
  markedByUser: one(users, {
    fields: [sessionAttendance.markedBy],
    references: [users.id],
  }),
}));

export const academicHolidaysRelations = relations(academicHolidays, ({ one }) => ({
  company: one(tutoringCompanies, {
    fields: [academicHolidays.companyId],
    references: [tutoringCompanies.id],
  }),
}));

// Type exports
export type ClassSession = typeof classSessions.$inferSelect;
export type SessionAttendance = typeof sessionAttendance.$inferSelect;
export type AcademicHoliday = typeof academicHolidays.$inferSelect;

// Insert schemas
export const insertClassSessionSchema = createInsertSchema(classSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionAttendanceSchema = createInsertSchema(sessionAttendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicHolidaySchema = createInsertSchema(academicHolidays).omit({
  id: true,
  createdAt: true,
});

export type InsertClassSession = z.infer<typeof insertClassSessionSchema>;
export type InsertSessionAttendance = z.infer<typeof insertSessionAttendanceSchema>;
export type InsertAcademicHoliday = z.infer<typeof insertAcademicHolidaySchema>;

// Notification Preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Email notification preferences
  emailEnabled: boolean("email_enabled").notNull().default(true),
  emailNewAssignment: boolean("email_new_assignment").notNull().default(true),
  emailSubmissionGraded: boolean("email_submission_graded").notNull().default(true),
  emailNewMessage: boolean("email_new_message").notNull().default(true),
  emailAttendanceMarked: boolean("email_attendance_marked").notNull().default(true),
  emailScheduleChanges: boolean("email_schedule_changes").notNull().default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").notNull().default(false),
  
  // In-app notification preferences
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  inAppNewAssignment: boolean("in_app_new_assignment").notNull().default(true),
  inAppSubmissionGraded: boolean("in_app_submission_graded").notNull().default(true),
  inAppNewMessage: boolean("in_app_new_message").notNull().default(true),
  inAppAttendanceMarked: boolean("in_app_attendance_marked").notNull().default(true),
  inAppScheduleChanges: boolean("in_app_schedule_changes").notNull().default(true),
  
  // Staff/Admin specific preferences
  staffNewStudentEnrollment: boolean("staff_new_student_enrollment").notNull().default(true),
  staffSubmissionReceived: boolean("staff_submission_received").notNull().default(true),
  staffLowAttendanceAlert: boolean("staff_low_attendance_alert").notNull().default(true),
  adminSystemAlerts: boolean("admin_system_alerts").notNull().default(true),
  adminNewStaffRegistration: boolean("admin_new_staff_registration").notNull().default(true),
  
  // Quiet hours
  quietHoursEnabled: boolean("quiet_hours_enabled").notNull().default(false),
  quietHoursStart: varchar("quiet_hours_start").default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end").default("07:00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for notification preferences
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Insert schema for notification preferences
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

// Report type and status enums
export const reportTypeEnum = pgEnum('report_type', [
  'student_performance',
  'attendance_summary',
  'class_utilization',
  'assignment_completion',
  'tutor_workload',
  'enrollment_trends'
]);

export const reportStatusEnum = pgEnum('report_status', ['pending', 'processing', 'completed', 'failed']);

// Report Definitions table - templates for reports
export const reportDefinitions = pgTable("report_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  name: varchar("name").notNull(),
  description: text("description"),
  reportType: reportTypeEnum("report_type").notNull(),
  defaultFilters: jsonb("default_filters").default({}),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  scheduleCron: varchar("schedule_cron"),
  createdBy: varchar("created_by").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Runs table - individual report executions
export const reportRuns = pgTable("report_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => tutoringCompanies.id),
  reportType: reportTypeEnum("report_type").notNull(),
  name: varchar("name").notNull(),
  parameters: jsonb("parameters").default({}),
  status: reportStatusEnum("status").notNull().default('pending'),
  resultData: jsonb("result_data"),
  rowCount: integer("row_count"),
  errorMessage: text("error_message"),
  requestedBy: varchar("requested_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Report Exports table - exported files
export const reportExports = pgTable("report_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportRunId: varchar("report_run_id").notNull().references(() => reportRuns.id),
  exportType: varchar("export_type").notNull(), // 'csv', 'pdf', 'xlsx'
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for reports
export const reportDefinitionsRelations = relations(reportDefinitions, ({ one }) => ({
  company: one(tutoringCompanies, {
    fields: [reportDefinitions.companyId],
    references: [tutoringCompanies.id],
  }),
  createdByUser: one(users, {
    fields: [reportDefinitions.createdBy],
    references: [users.id],
  }),
}));

export const reportRunsRelations = relations(reportRuns, ({ one, many }) => ({
  company: one(tutoringCompanies, {
    fields: [reportRuns.companyId],
    references: [tutoringCompanies.id],
  }),
  requestedByUser: one(users, {
    fields: [reportRuns.requestedBy],
    references: [users.id],
  }),
  exports: many(reportExports),
}));

export const reportExportsRelations = relations(reportExports, ({ one }) => ({
  reportRun: one(reportRuns, {
    fields: [reportExports.reportRunId],
    references: [reportRuns.id],
  }),
}));

// Type exports for reports
export type ReportDefinition = typeof reportDefinitions.$inferSelect;
export type ReportRun = typeof reportRuns.$inferSelect;
export type ReportExport = typeof reportExports.$inferSelect;

// Insert schemas for reports
export const insertReportDefinitionSchema = createInsertSchema(reportDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportRunSchema = createInsertSchema(reportRuns).omit({
  id: true,
  createdAt: true,
});

export const insertReportExportSchema = createInsertSchema(reportExports).omit({
  id: true,
  createdAt: true,
});

export type InsertReportDefinition = z.infer<typeof insertReportDefinitionSchema>;
export type InsertReportRun = z.infer<typeof insertReportRunSchema>;
export type InsertReportExport = z.infer<typeof insertReportExportSchema>;
