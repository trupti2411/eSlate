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
export const questionTypeEnum = pgEnum('question_type', ['short_text', 'long_text', 'multiple_choice', 'fill_blank', 'text_image']);
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
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
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
  
  attachmentUrls: text("attachment_urls").array().default([]), // Files uploaded by admin/tutor
  allowedFileTypes: text("allowed_file_types").array().default(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg']), // Specified file types
  maxFileSize: integer("max_file_size").default(31457280), // 30MB in bytes
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
  classes: many(classes),
  assignments: many(assignments),
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
