import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  mysqlTable,
  mysqlEnum,
  timestamp,
  varchar,
  text,
  int,
  boolean,
  json,
  decimal,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table with custom authentication
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: mysqlEnum("role", ['student', 'parent', 'tutor', 'admin', 'company_admin']).notNull().default('student'),
  isActive: boolean("is_active").notNull().default(true),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  authProvider: varchar("auth_provider", { length: 50 }).default('email'),
  replitId: varchar("replit_id", { length: 255 }),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsVersion: varchar("terms_version", { length: 20 }),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = mysqlTable("students", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  gradeLevel: varchar("grade_level", { length: 50 }),
  schoolName: varchar("school_name", { length: 255 }),
  yearGroupCode: varchar("year_group_code", { length: 20 }),
  rollNumber: varchar("roll_number", { length: 50 }),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  learningGoals: text("learning_goals"),
  notes: text("notes"),
  parentId: varchar("parent_id", { length: 36 }).references(() => parents.id),
  tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id),
  companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id),
  yearId: varchar("year_id", { length: 36 }).references(() => academicYears.id),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id),
  status: mysqlEnum("status", ['active', 'archived']).notNull().default('active'),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by", { length: 36 }),
  archivedByName: varchar("archived_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  updatedByName: varchar("updated_by_name", { length: 255 }),
});

// Student contacts
export const studentContacts = mysqlTable("student_contacts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parents table
export const parents = mysqlTable("parents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  phoneNumber: varchar("phone_number", { length: 50 }),
  aiHintsEnabled: boolean("ai_hints_enabled").notNull().default(true),
  maxHintsPerQuestion: int("max_hints_per_question").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutoring Companies table
export const tutoringCompanies = mysqlTable("tutoring_companies", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  abn: varchar("abn", { length: 20 }),
  legalName: varchar("legal_name", { length: 255 }),
  logo: varchar("logo", { length: 500 }),
  timezone: varchar("timezone", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  state: varchar("state", { length: 10 }),
  tutorChatEnabled: boolean("tutor_chat_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  paymentBsb: varchar("payment_bsb", { length: 20 }),
  paymentAccount: varchar("payment_account", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paymentNotes: text("payment_notes"),
  updatedByName: varchar("updated_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses
export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  yearGroupCode: varchar("year_group_code", { length: 10 }),
  status: varchar("status", { length: 20 }).default('active'),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by", { length: 36 }),
  archivedByName: varchar("archived_by_name", { length: 255 }),
  duplicatedFromId: varchar("duplicated_from_id", { length: 36 }),
  updatedBy: varchar("updated_by", { length: 36 }),
  updatedByName: varchar("updated_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course subjects
export const courseSubjects = mysqlTable("course_subjects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  courseId: varchar("course_id", { length: 36 }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  subjectId: int("subject_id").notNull(),
});

// Class subjects
export const classSubjects = mysqlTable("class_subjects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  subjectId: int("subject_id").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
});

// Company subjects
export const companySubjects = mysqlTable("company_subjects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companySupportContacts = mysqlTable("company_support_contacts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  roleLabel: varchar("role_label", { length: 100 }).notNull().default('Support'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: varchar("resource_id", { length: 36 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  details: json("details"),
  status: varchar("status", { length: 20 }).notNull().default('success'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login Attempts
export const loginAttempts = mysqlTable("login_attempts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company Admins
export const companyAdmins = mysqlTable("company_admins", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  permissions: json("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutors
export const tutors = mysqlTable("tutors", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id),
  specialization: text("specialization"),
  qualifications: text("qualifications"),
  availability: text("availability"),
  subjectsTeaching: json("subjects_teaching").$type<string[]>().default([]),
  branch: varchar("branch", { length: 255 }),
  isVerified: boolean("is_verified").notNull().default(false),
  phoneNumber: varchar("phone_number", { length: 50 }),
  address: text("address"),
  profilePhotoUrl: varchar("profile_photo_url", { length: 500 }),
  wwccNumber: varchar("wwcc_number", { length: 100 }),
  wwccExpiry: timestamp("wwcc_expiry"),
  wwccState: varchar("wwcc_state", { length: 10 }),
  status: mysqlEnum("status", ['active', 'inactive']).notNull().default('active'),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by", { length: 36 }),
  deactivatedByName: varchar("deactivated_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Years
export const academicYears = mysqlTable("academic_years", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  yearNumber: int("year_number").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Terms
export const academicTerms = mysqlTable("academic_terms", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  academicYearId: varchar("academic_year_id", { length: 36 }).notNull().references(() => academicYears.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Weeks
export const academicWeeks = mysqlTable("academic_weeks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  weekNumber: int("week_number").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes
export const classes = mysqlTable("classes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull().default('TBD'),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id, { onDelete: "set null" }),
  dayOfWeek: int("day_of_week"),
  daysOfWeek: json("days_of_week").$type<number[]>().default([]),
  startTime: varchar("start_time", { length: 10 }).notNull().default(''),
  endTime: varchar("end_time", { length: 10 }).notNull().default(''),
  maxStudents: int("max_students"),
  isActive: boolean("is_active").default(true),
  courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),
  yearGroupCode: varchar("year_group_code", { length: 20 }),
  level: varchar("level", { length: 50 }),
  status: varchar("status", { length: 20 }).default('draft'),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by", { length: 36 }),
  archivedByName: varchar("archived_by_name", { length: 255 }),
  duplicatedFromId: varchar("duplicated_from_id", { length: 36 }),
  feePerSession: decimal("fee_per_session", { precision: 8, scale: 2 }),
  feePerTerm: decimal("fee_per_term", { precision: 8, scale: 2 }),
  updatedBy: varchar("updated_by", { length: 36 }),
  updatedByName: varchar("updated_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignments
export const assignments = mysqlTable("assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  correctAnswer: text("correct_answer"),
  helpText: text("help_text"),
  submissionDate: timestamp("submission_date").notNull(),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id),
  assignmentKind: mysqlEnum("assignment_kind", ['file_upload', 'worksheet']).notNull().default('file_upload'),
  worksheetId: varchar("worksheet_id", { length: 36 }),
  academicYearId: varchar("academic_year_id", { length: 36 }).references(() => academicYears.id),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
  subject: varchar("subject", { length: 100 }).notNull(),
  week: int("week"),
  solutionText: text("solution_text"),
  solutionFileUrls: json("solution_file_urls").$type<string[]>().default([]),
  solutionNotes: text("solution_notes"),
  attachmentUrls: json("attachment_urls").$type<string[]>().default([]),
  allowedFileTypes: json("allowed_file_types").$type<string[]>().default(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpeg']),
  maxFileSize: int("max_file_size").default(31457280),
  pageRotations: json("page_rotations").$type<Record<string, number>>().default({}),
  status: mysqlEnum("status", ['assigned', 'submitted', 'reviewed', 'completed', 'late', 'needs_revision']).notNull().default('assigned'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submissions
export const submissions = mysqlTable("submissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  documentUrl: varchar("document_url", { length: 500 }),
  content: text("content"),
  digitalContent: text("digital_content"),
  fileUrls: json("file_urls").$type<string[]>().default([]),
  status: mysqlEnum("status", ['draft', 'submitted', 'late', 'graded', 'parent_verified', 'needs_revision']).notNull().default('draft'),
  isDraft: boolean("is_draft").notNull().default(true),
  submittedAt: timestamp("submitted_at"),
  isLate: boolean("is_late").notNull().default(false),
  score: int("score"),
  feedback: text("feedback"),
  reviewerAnnotations: text("reviewer_annotations"),
  annotations: text("annotations"),
  gradedBy: varchar("graded_by", { length: 36 }).references(() => users.id),
  gradedAt: timestamp("graded_at"),
  aiCheckResult: text("ai_check_result"),
  parentComment: text("parent_comment"),
  parentCommentAt: timestamp("parent_comment_at"),
  deviceType: varchar("device_type", { length: 50 }),
  inputMethod: varchar("input_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: mysqlEnum("message_type", ['text', 'file', 'system']).notNull().default('text'),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress
export const progress = mysqlTable("progress", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id),
  completionPercentage: int("completion_percentage").notNull().default(0),
  timeSpent: int("time_spent_minutes").default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events
export const calendarEvents = mysqlTable("calendar_events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id),
  studentId: varchar("student_id", { length: 36 }).references(() => students.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Class Assignments
export const studentClassAssignments = mysqlTable("student_class_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  assignedDate: timestamp("assigned_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// WORKSHEET SYSTEM
// ==========================================

export const worksheets = mysqlTable("worksheets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const worksheetPages = mysqlTable("worksheet_pages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  worksheetId: varchar("worksheet_id", { length: 36 }).notNull().references(() => worksheets.id, { onDelete: 'cascade' }),
  pageNumber: int("page_number").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worksheetQuestions = mysqlTable("worksheet_questions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  pageId: varchar("page_id", { length: 36 }).notNull().references(() => worksheetPages.id, { onDelete: 'cascade' }),
  questionType: mysqlEnum("question_type", ['short_text', 'long_text', 'multiple_choice', 'fill_blank', 'text_image', 'information']).notNull(),
  questionText: text("question_text").notNull(),
  questionNumber: int("question_number").notNull(),
  options: json("options"),
  imageUrl: varchar("image_url", { length: 500 }),
  correctAnswer: text("correct_answer"),
  points: int("points").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worksheetAssignments = mysqlTable("worksheet_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  worksheetId: varchar("worksheet_id", { length: 36 }).notNull().references(() => worksheets.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id", { length: 36 }).references(() => students.id, { onDelete: 'cascade' }),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  status: mysqlEnum("status", ['assigned', 'in_progress', 'submitted', 'graded']).notNull().default("assigned"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worksheetAnswers = mysqlTable("worksheet_answers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => worksheetQuestions.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  worksheetId: varchar("worksheet_id", { length: 36 }).notNull().references(() => worksheets.id),
  textAnswer: text("text_answer"),
  handwritingData: text("handwriting_data"),
  selectedOption: varchar("selected_option", { length: 100 }),
  isSubmitted: boolean("is_submitted").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  grade: int("grade"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// TEST SYSTEM
// ==========================================

export const tests = mysqlTable("tests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id),
  status: mysqlEnum("status", ['draft', 'published', 'archived']).notNull().default("draft"),
  duration: int("duration"),
  totalPoints: int("total_points").default(0),
  passingScore: int("passing_score"),
  dueDate: timestamp("due_date"),
  allowRetakes: boolean("allow_retakes").default(false),
  showResultsImmediately: boolean("show_results_immediately").default(true),
  shuffleQuestions: boolean("shuffle_questions").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testQuestions = mysqlTable("test_questions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: 'cascade' }),
  questionType: mysqlEnum("question_type", ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank']).notNull(),
  questionText: text("question_text").notNull(),
  questionNumber: int("question_number").notNull(),
  options: json("options"),
  correctAnswer: text("correct_answer"),
  points: int("points").default(1),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testAssignments = mysqlTable("test_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id", { length: 36 }).references(() => students.id, { onDelete: 'cascade' }),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testAttempts = mysqlTable("test_attempts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  status: mysqlEnum("status", ['in_progress', 'submitted', 'graded']).notNull().default("in_progress"),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  totalScore: int("total_score"),
  percentageScore: int("percentage_score"),
  isPassed: boolean("is_passed"),
  gradedBy: varchar("graded_by", { length: 36 }).references(() => users.id),
  gradedAt: timestamp("graded_at"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testAnswers = mysqlTable("test_answers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  attemptId: varchar("attempt_id", { length: 36 }).notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => testQuestions.id, { onDelete: 'cascade' }),
  studentAnswer: text("student_answer"),
  selectedOption: varchar("selected_option", { length: 100 }),
  isCorrect: boolean("is_correct"),
  pointsAwarded: int("points_awarded"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// CALENDAR & ATTENDANCE
// ==========================================

export const classSessions = mysqlTable("class_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id, { onDelete: "set null" }),
  sessionDate: timestamp("session_date").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  durationMinutes: int("duration_minutes").notNull(),
  status: mysqlEnum("status", ['scheduled', 'in_progress', 'completed', 'cancelled']).notNull().default("scheduled"),
  deliveryMode: varchar("delivery_mode", { length: 20 }).default("in_person"),
  locationUrl: varchar("location_url", { length: 500 }),
  notes: text("notes"),
  enrolledCount: int("enrolled_count").default(0),
  attendedCount: int("attended_count").default(0),
  attendanceLocked: boolean("attendance_locked").default(false),
  attendanceLockedAt: timestamp("attendance_locked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessionAttendance = mysqlTable("session_attendance", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  sessionId: varchar("session_id", { length: 36 }).notNull().references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ['present', 'absent', 'late', 'excused']).notNull().default("absent"),
  markedBy: varchar("marked_by", { length: 36 }).references(() => users.id),
  markedAt: timestamp("marked_at"),
  notes: text("notes"),
  isOverride: boolean("is_override").default(false),
  overrideBy: varchar("override_by", { length: 36 }).references(() => users.id),
  overrideAt: timestamp("override_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const academicHolidays = mysqlTable("academic_holidays", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isPublic: boolean("is_public").default(true),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification Preferences
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  emailNewAssignment: boolean("email_new_assignment").notNull().default(true),
  emailSubmissionGraded: boolean("email_submission_graded").notNull().default(true),
  emailNewMessage: boolean("email_new_message").notNull().default(true),
  emailAttendanceMarked: boolean("email_attendance_marked").notNull().default(true),
  emailScheduleChanges: boolean("email_schedule_changes").notNull().default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").notNull().default(false),
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  inAppNewAssignment: boolean("in_app_new_assignment").notNull().default(true),
  inAppSubmissionGraded: boolean("in_app_submission_graded").notNull().default(true),
  inAppNewMessage: boolean("in_app_new_message").notNull().default(true),
  inAppAttendanceMarked: boolean("in_app_attendance_marked").notNull().default(true),
  inAppScheduleChanges: boolean("in_app_schedule_changes").notNull().default(true),
  staffNewStudentEnrollment: boolean("staff_new_student_enrollment").notNull().default(true),
  staffSubmissionReceived: boolean("staff_submission_received").notNull().default(true),
  staffLowAttendanceAlert: boolean("staff_low_attendance_alert").notNull().default(true),
  adminSystemAlerts: boolean("admin_system_alerts").notNull().default(true),
  adminNewStaffRegistration: boolean("admin_new_staff_registration").notNull().default(true),
  quietHoursEnabled: boolean("quiet_hours_enabled").notNull().default(false),
  quietHoursStart: varchar("quiet_hours_start", { length: 10 }).default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 10 }).default("07:00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports
export const reportDefinitions = mysqlTable("report_definitions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  reportType: mysqlEnum("report_type", ['student_performance', 'attendance_summary', 'class_utilization', 'assignment_completion', 'tutor_workload', 'enrollment_trends']).notNull(),
  defaultFilters: json("default_filters").default({}),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  scheduleCron: varchar("schedule_cron", { length: 100 }),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportRuns = mysqlTable("report_runs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  reportType: mysqlEnum("report_type", ['student_performance', 'attendance_summary', 'class_utilization', 'assignment_completion', 'tutor_workload', 'enrollment_trends']).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  parameters: json("parameters").default({}),
  status: mysqlEnum("status", ['pending', 'processing', 'completed', 'failed']).notNull().default('pending'),
  resultData: json("result_data"),
  rowCount: int("row_count"),
  errorMessage: text("error_message"),
  requestedBy: varchar("requested_by", { length: 36 }).references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportExports = mysqlTable("report_exports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  reportRunId: varchar("report_run_id", { length: 36 }).notNull().references(() => reportRuns.id),
  exportType: varchar("export_type", { length: 20 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }),
  fileSize: int("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Progress Reports (per-student per-term per-subject reports)
export const studentProgressReports = mysqlTable("student_progress_reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
  subject: varchar("subject", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 20 }),
  overallComment: text("overall_comment"),
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  attendancePercentage: int("attendance_percentage"),
  status: mysqlEnum("status", ['draft', 'published', 'shared_with_parent']).notNull().default('draft'),
  sharedWithParentAt: timestamp("shared_with_parent_at"),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  createdByName: varchar("created_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Class Waitlist (ESLATE-31)
export const classWaitlist = mysqlTable("class_waitlist", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
  position: int("position").notNull().default(1),
  status: mysqlEnum("status", ['waiting', 'enrolled', 'removed']).notNull().default('waiting'),
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: varchar("added_by", { length: 36 }),
  addedByName: varchar("added_by_name", { length: 255 }),
  enrolledAt: timestamp("enrolled_at"),
  removedAt: timestamp("removed_at"),
  notes: text("notes"),
});

// ==========================================
// INVOICING & PAYMENTS (ESLATE-35/36/37/38)
// ==========================================

export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull(),
  status: mysqlEnum("status", ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void']).notNull().default('draft'),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  discountType: varchar("discount_type", { length: 20 }),
  discountReason: text("discount_reason"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default('0'),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  createdByName: varchar("created_by_name", { length: 255 }),
  sentAt: timestamp("sent_at"),
  sentToEmail: varchar("sent_to_email", { length: 255 }),
  sendStatus: varchar("send_status", { length: 20 }),
  voidedAt: timestamp("voided_at"),
  voidReason: varchar("void_reason", { length: 100 }),
  bulkRunId: varchar("bulk_run_id", { length: 36 }),
  remindersSuppressed: boolean("reminders_suppressed").notNull().default(false),
  lastOverdueReminderAt: timestamp("last_overdue_reminder_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceLineItems = mysqlTable("invoice_line_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: "set null" }),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
  sessions: int("sessions"),
  unitPrice: decimal("unit_price", { precision: 8, scale: 2 }).notNull().default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default('0'),
  isManual: boolean("is_manual").default(false),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  method: varchar("method", { length: 50 }).notNull().default('bank_transfer'),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  recordedBy: varchar("recorded_by", { length: 36 }).references(() => users.id),
  recordedByName: varchar("recorded_by_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Term reminders log to prevent duplicate sends (ESLATE-41)
export const termReminders = mysqlTable("term_reminders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(),
  recipient: varchar("recipient", { length: 20 }).notNull().default('admin'),
  sentAt: timestamp("sent_at").defaultNow(),
});

// In-app notifications (used for WWCC reminders and other alerts)
export const inAppNotifications = mysqlTable("in_app_notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// ASSIGNMENT LIBRARY SYSTEM (ESLATE-42 epic)
// ==========================================

export const assignmentLibraryItems = mysqlTable("asgn_lib_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  subjects: json("subjects").$type<string[]>().default([]),
  yearGroups: json("year_groups").$type<string[]>().default([]),
  estimatedDuration: int("estimated_duration"),
  maxMarks: int("max_marks"),
  libStatus: mysqlEnum("lib_status", ['draft', 'published', 'archived']).notNull().default('draft'),
  fileUrl: varchar("file_url", { length: 500 }),
  fileType: varchar("file_type", { length: 20 }),
  pageCount: int("page_count"),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  lastUpdatedBy: varchar("last_updated_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentLibraryQuestions = mysqlTable("asgn_lib_questions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id, { onDelete: "cascade" }),
  questionNumber: int("question_number").notNull(),
  questionText: text("question_text").notNull(),
  questionType: mysqlEnum("lib_question_type", ['objective', 'subjective', 'mcq', 'fill_in']).notNull().default('subjective'),
  answerKey: text("answer_key"),
  maxMarks: int("max_marks").default(1),
  regionCoords: json("region_coords"),
  options: json("options").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignmentLibraryRubrics = mysqlTable("asgn_lib_rubrics", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id, { onDelete: "cascade" }),
  criterion: varchar("criterion", { length: 255 }).notNull(),
  descriptor: text("descriptor"),
  maxMarks: int("max_marks").notNull().default(1),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignmentAllocations = mysqlTable("asgn_allocations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
  dueAt: timestamp("due_at").notNull(),
  releaseAt: timestamp("release_at"),
  allowResubmission: boolean("allow_resubmission").notNull().default(false),
  allocStatus: mysqlEnum("alloc_status", ['scheduled', 'assigned', 'in_progress', 'submitted', 'auto_marked', 'under_review', 'returned', 'overdue', 'revoked']).notNull().default('assigned'),
  studentNote: text("student_note"),
  currentAttempt: int("current_attempt").notNull().default(1),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  dueSoonReminderAt: timestamp("due_soon_reminder_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentSubmissions = mysqlTable("asgn_submissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
  attemptNo: int("attempt_no").notNull().default(1),
  submittedAt: timestamp("submitted_at"),
  isLate: boolean("is_late").notNull().default(false),
  syncStatus: mysqlEnum("asgn_sync_status", ['synced', 'pending']).notNull().default('synced'),
  inkData: text("ink_data"),
  enteredAnswers: json("entered_answers"),
  answerImages: json("answer_images").$type<Record<string, string>>(),
  ocrStatus: mysqlEnum("asgn_ocr_status", ['pending', 'processing', 'complete', 'failed', 'unavailable']).notNull().default('pending'),
  autoMarkStatus: mysqlEnum("asgn_auto_mark_status", ['pending', 'processing', 'complete', 'failed']).notNull().default('pending'),
  provisionalScore: int("provisional_score"),
  finalScore: int("final_score"),
  tutorFeedback: text("tutor_feedback"),
  tutorAnnotations: text("tutor_annotations"),
  finalisedBy: varchar("finalised_by", { length: 36 }).references(() => users.id),
  finalisedAt: timestamp("finalised_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const submissionTranscriptions = mysqlTable("sub_transcriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id),
  text: text("text"),
  confidence: int("confidence"),
  ocrStatus: varchar("transcription_ocr_status", { length: 20 }).notNull().default('pending'),
  tutorCorrection: text("tutor_correction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissionMarks = mysqlTable("sub_marks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id),
  markSource: mysqlEnum("mark_source", ['key', 'ai', 'tutor']).notNull(),
  provisionalScore: int("provisional_score"),
  finalScore: int("final_score"),
  provisionalComments: text("provisional_comments"),
  tutorComments: text("tutor_comments"),
  confidence: int("confidence"),
  isProvisional: boolean("is_provisional").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const resubmissions = mysqlTable("resubmissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id, { onDelete: "cascade" }),
  grantedBy: varchar("granted_by", { length: 36 }).notNull().references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  newDueAt: timestamp("new_due_at"),
  note: text("note"),
  usedAt: timestamp("used_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevices = mysqlTable("user_devices", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceName: varchar("device_name", { length: 100 }),
  deviceType: varchar("device_type", { length: 50 }),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  lastSyncAt: timestamp("last_sync_at"),
  sessionTokenRef: varchar("session_token_ref", { length: 100 }),
  deviceStatus: mysqlEnum("device_status", ['active', 'inactive', 'unlinked']).notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentAssignmentResults = mysqlTable("stu_asgn_results", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id),
  libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
  classId: varchar("class_id", { length: 36 }).references(() => classes.id),
  termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
  subjects: json("subjects").$type<string[]>().default([]),
  score: int("score"),
  maxMarks: int("sar_max_marks"),
  isLate: boolean("is_late").notNull().default(false),
  attemptNo: int("attempt_no").notNull().default(1),
  finalisedAt: timestamp("finalised_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
  parent: one(parents, { fields: [users.id], references: [parents.userId] }),
  tutor: one(tutors, { fields: [users.id], references: [tutors.userId] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  parent: one(parents, { fields: [students.parentId], references: [parents.id] }),
  tutor: one(tutors, { fields: [students.tutorId], references: [tutors.id] }),
  company: one(tutoringCompanies, { fields: [students.companyId], references: [tutoringCompanies.id] }),
  submissions: many(submissions),
  progress: many(progress),
  calendarEvents: many(calendarEvents),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, { fields: [parents.userId], references: [users.id] }),
  students: many(students),
}));

export const tutoringCompaniesRelations = relations(tutoringCompanies, ({ many }) => ({
  admins: many(companyAdmins),
  tutors: many(tutors),
  supportContacts: many(companySupportContacts),
}));

export const companySupportContactsRelations = relations(companySupportContacts, ({ one }) => ({
  company: one(tutoringCompanies, { fields: [companySupportContacts.companyId], references: [tutoringCompanies.id] }),
  user: one(users, { fields: [companySupportContacts.userId], references: [users.id] }),
}));

export const companyAdminsRelations = relations(companyAdmins, ({ one }) => ({
  user: one(users, { fields: [companyAdmins.userId], references: [users.id] }),
  company: one(tutoringCompanies, { fields: [companyAdmins.companyId], references: [tutoringCompanies.id] }),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, { fields: [tutors.userId], references: [users.id] }),
  company: one(tutoringCompanies, { fields: [tutors.companyId], references: [tutoringCompanies.id] }),
  students: many(students),
  assignments: many(assignments),
  calendarEvents: many(calendarEvents),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  company: one(tutoringCompanies, { fields: [assignments.companyId], references: [tutoringCompanies.id] }),
  creator: one(users, { fields: [assignments.createdBy], references: [users.id] }),
  class: one(classes, { fields: [assignments.classId], references: [classes.id] }),
  academicYear: one(academicYears, { fields: [assignments.academicYearId], references: [academicYears.id] }),
  term: one(academicTerms, { fields: [assignments.termId], references: [academicTerms.id] }),
  submissions: many(submissions),
  progress: many(progress),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, { fields: [submissions.assignmentId], references: [assignments.id] }),
  student: one(students, { fields: [submissions.studentId], references: [students.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id] }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  student: one(students, { fields: [progress.studentId], references: [students.id] }),
  assignment: one(assignments, { fields: [progress.assignmentId], references: [assignments.id] }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  tutor: one(tutors, { fields: [calendarEvents.tutorId], references: [tutors.id] }),
  student: one(students, { fields: [calendarEvents.studentId], references: [students.id] }),
}));

export const academicYearsRelations = relations(academicYears, ({ one, many }) => ({
  company: one(tutoringCompanies, { fields: [academicYears.companyId], references: [tutoringCompanies.id] }),
  terms: many(academicTerms),
  assignments: many(assignments),
}));

export const academicTermsRelations = relations(academicTerms, ({ one, many }) => ({
  academicYear: one(academicYears, { fields: [academicTerms.academicYearId], references: [academicYears.id] }),
  company: one(tutoringCompanies, { fields: [academicTerms.companyId], references: [tutoringCompanies.id] }),
  weeks: many(academicWeeks),
  classes: many(classes),
  assignments: many(assignments),
}));

export const academicWeeksRelations = relations(academicWeeks, ({ one }) => ({
  term: one(academicTerms, { fields: [academicWeeks.termId], references: [academicTerms.id] }),
  company: one(tutoringCompanies, { fields: [academicWeeks.companyId], references: [tutoringCompanies.id] }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  term: one(academicTerms, { fields: [classes.termId], references: [academicTerms.id] }),
  company: one(tutoringCompanies, { fields: [classes.companyId], references: [tutoringCompanies.id] }),
  tutor: one(tutors, { fields: [classes.tutorId], references: [tutors.id] }),
  studentAssignments: many(studentClassAssignments),
  assignments: many(assignments),
}));

export const studentClassAssignmentsRelations = relations(studentClassAssignments, ({ one }) => ({
  student: one(students, { fields: [studentClassAssignments.studentId], references: [students.id] }),
  class: one(classes, { fields: [studentClassAssignments.classId], references: [classes.id] }),
}));

export const classSessionsRelations = relations(classSessions, ({ one, many }) => ({
  class: one(classes, { fields: [classSessions.classId], references: [classes.id] }),
  tutor: one(tutors, { fields: [classSessions.tutorId], references: [tutors.id] }),
  attendance: many(sessionAttendance),
}));

export const sessionAttendanceRelations = relations(sessionAttendance, ({ one }) => ({
  session: one(classSessions, { fields: [sessionAttendance.sessionId], references: [classSessions.id] }),
  student: one(students, { fields: [sessionAttendance.studentId], references: [students.id] }),
  markedByUser: one(users, { fields: [sessionAttendance.markedBy], references: [users.id] }),
}));

export const academicHolidaysRelations = relations(academicHolidays, ({ one }) => ({
  company: one(tutoringCompanies, { fields: [academicHolidays.companyId], references: [tutoringCompanies.id] }),
}));

export const reportDefinitionsRelations = relations(reportDefinitions, ({ one }) => ({
  company: one(tutoringCompanies, { fields: [reportDefinitions.companyId], references: [tutoringCompanies.id] }),
  createdByUser: one(users, { fields: [reportDefinitions.createdBy], references: [users.id] }),
}));

export const reportRunsRelations = relations(reportRuns, ({ one, many }) => ({
  company: one(tutoringCompanies, { fields: [reportRuns.companyId], references: [tutoringCompanies.id] }),
  requestedByUser: one(users, { fields: [reportRuns.requestedBy], references: [users.id] }),
  exports: many(reportExports),
}));

export const reportExportsRelations = relations(reportExports, ({ one }) => ({
  reportRun: one(reportRuns, { fields: [reportExports.reportRunId], references: [reportRuns.id] }),
}));

export const studentProgressReportsRelations = relations(studentProgressReports, ({ one }) => ({
  student: one(students, { fields: [studentProgressReports.studentId], references: [students.id] }),
  company: one(tutoringCompanies, { fields: [studentProgressReports.companyId], references: [tutoringCompanies.id] }),
  term: one(academicTerms, { fields: [studentProgressReports.termId], references: [academicTerms.id] }),
  createdByUser: one(users, { fields: [studentProgressReports.createdBy], references: [users.id] }),
}));

export const inAppNotificationsRelations = relations(inAppNotifications, ({ one }) => ({
  user: one(users, { fields: [inAppNotifications.userId], references: [users.id] }),
  company: one(tutoringCompanies, { fields: [inAppNotifications.companyId], references: [tutoringCompanies.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(tutoringCompanies, { fields: [invoices.companyId], references: [tutoringCompanies.id] }),
  student: one(students, { fields: [invoices.studentId], references: [students.id] }),
  term: one(academicTerms, { fields: [invoices.termId], references: [academicTerms.id] }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
  class: one(classes, { fields: [invoiceLineItems.classId], references: [classes.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

// ==========================================
// INSERT SCHEMAS & TYPES
// ==========================================

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertParentSchema = createInsertSchema(parents).omit({ id: true, createdAt: true });
export const insertTutorSchema = createInsertSchema(tutors).omit({ id: true, createdAt: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true, gradedAt: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, lastAccessedAt: true, updatedAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
export const insertTutoringCompanySchema = createInsertSchema(tutoringCompanies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanyAdminSchema = createInsertSchema(companyAdmins).omit({ id: true, createdAt: true });
export const insertCompanySupportContactSchema = createInsertSchema(companySupportContacts).omit({ id: true, createdAt: true });
export const insertAcademicYearSchema = createInsertSchema(academicYears).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAcademicTermSchema = createInsertSchema(academicTerms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAcademicWeekSchema = createInsertSchema(academicWeeks).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentClassAssignmentSchema = createInsertSchema(studentClassAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorksheetSchema = createInsertSchema(worksheets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorksheetPageSchema = createInsertSchema(worksheetPages).omit({ id: true, createdAt: true });
export const insertWorksheetQuestionSchema = createInsertSchema(worksheetQuestions).omit({ id: true, createdAt: true });
export const insertWorksheetAssignmentSchema = createInsertSchema(worksheetAssignments).omit({ id: true, createdAt: true });
export const insertWorksheetAnswerSchema = createInsertSchema(worksheetAnswers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestQuestionSchema = createInsertSchema(testQuestions).omit({ id: true, createdAt: true });
export const insertTestAssignmentSchema = createInsertSchema(testAssignments).omit({ id: true, createdAt: true });
export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({ id: true, createdAt: true });
export const insertTestAnswerSchema = createInsertSchema(testAnswers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClassSessionSchema = createInsertSchema(classSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionAttendanceSchema = createInsertSchema(sessionAttendance).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAcademicHolidaySchema = createInsertSchema(academicHolidays).omit({ id: true, createdAt: true });
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReportDefinitionSchema = createInsertSchema(reportDefinitions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReportRunSchema = createInsertSchema(reportRuns).omit({ id: true, createdAt: true });
export const insertReportExportSchema = createInsertSchema(reportExports).omit({ id: true, createdAt: true });
export const insertStudentProgressReportSchema = createInsertSchema(studentProgressReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInAppNotificationSchema = createInsertSchema(inAppNotifications).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertAssignmentLibraryItemSchema = createInsertSchema(assignmentLibraryItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssignmentLibraryQuestionSchema = createInsertSchema(assignmentLibraryQuestions).omit({ id: true, createdAt: true });
export const insertAssignmentLibraryRubricSchema = createInsertSchema(assignmentLibraryRubrics).omit({ id: true, createdAt: true });
export const insertAssignmentAllocationSchema = createInsertSchema(assignmentAllocations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubmissionTranscriptionSchema = createInsertSchema(submissionTranscriptions).omit({ id: true, createdAt: true });
export const insertSubmissionMarkSchema = createInsertSchema(submissionMarks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResubmissionSchema = createInsertSchema(resubmissions).omit({ id: true, createdAt: true });
export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({ id: true, createdAt: true });
export const insertStudentAssignmentResultSchema = createInsertSchema(studentAssignmentResults).omit({ id: true, createdAt: true });

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
export type InsertTutoringCompany = z.infer<typeof insertTutoringCompanySchema>;
export type CompanyAdmin = typeof companyAdmins.$inferSelect;
export type InsertCompanyAdmin = z.infer<typeof insertCompanyAdminSchema>;
export type CompanySupportContact = typeof companySupportContacts.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type AcademicYear = typeof academicYears.$inferSelect;
export type InsertAcademicYear = z.infer<typeof insertAcademicYearSchema>;
export type AcademicTerm = typeof academicTerms.$inferSelect;
export type InsertAcademicTerm = z.infer<typeof insertAcademicTermSchema>;
export type AcademicWeek = typeof academicWeeks.$inferSelect;
export type InsertAcademicWeek = z.infer<typeof insertAcademicWeekSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type StudentClassAssignment = typeof studentClassAssignments.$inferSelect;
export type InsertStudentAssignment = z.infer<typeof insertStudentClassAssignmentSchema>;
export type InsertStudentClassAssignment = typeof studentClassAssignments.$inferInsert;
export type Worksheet = typeof worksheets.$inferSelect;
export type WorksheetPage = typeof worksheetPages.$inferSelect;
export type WorksheetQuestion = typeof worksheetQuestions.$inferSelect;
export type WorksheetAssignment = typeof worksheetAssignments.$inferSelect;
export type WorksheetAnswer = typeof worksheetAnswers.$inferSelect;
export type InsertWorksheet = z.infer<typeof insertWorksheetSchema>;
export type InsertWorksheetPage = z.infer<typeof insertWorksheetPageSchema>;
export type InsertWorksheetQuestion = z.infer<typeof insertWorksheetQuestionSchema>;
export type InsertWorksheetAssignment = z.infer<typeof insertWorksheetAssignmentSchema>;
export type InsertWorksheetAnswer = z.infer<typeof insertWorksheetAnswerSchema>;
export type Test = typeof tests.$inferSelect;
export type TestQuestion = typeof testQuestions.$inferSelect;
export type TestAssignment = typeof testAssignments.$inferSelect;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type TestAnswer = typeof testAnswers.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertTestQuestion = z.infer<typeof insertTestQuestionSchema>;
export type InsertTestAssignment = z.infer<typeof insertTestAssignmentSchema>;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
export type InsertTestAnswer = z.infer<typeof insertTestAnswerSchema>;
export type ClassSession = typeof classSessions.$inferSelect;
export type SessionAttendance = typeof sessionAttendance.$inferSelect;
export type AcademicHoliday = typeof academicHolidays.$inferSelect;
export type InsertClassSession = z.infer<typeof insertClassSessionSchema>;
export type InsertSessionAttendance = z.infer<typeof insertSessionAttendanceSchema>;
export type InsertAcademicHoliday = z.infer<typeof insertAcademicHolidaySchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type ReportDefinition = typeof reportDefinitions.$inferSelect;
export type ReportRun = typeof reportRuns.$inferSelect;
export type ReportExport = typeof reportExports.$inferSelect;
export type InsertReportDefinition = z.infer<typeof insertReportDefinitionSchema>;
export type InsertReportRun = z.infer<typeof insertReportRunSchema>;
export type InsertReportExport = z.infer<typeof insertReportExportSchema>;
export type StudentProgressReport = typeof studentProgressReports.$inferSelect;
export type InsertStudentProgressReport = z.infer<typeof insertStudentProgressReportSchema>;
export type InAppNotification = typeof inAppNotifications.$inferSelect;
export type InsertInAppNotification = z.infer<typeof insertInAppNotificationSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type AssignmentLibraryItem = typeof assignmentLibraryItems.$inferSelect;
export type AssignmentLibraryQuestion = typeof assignmentLibraryQuestions.$inferSelect;
export type AssignmentLibraryRubric = typeof assignmentLibraryRubrics.$inferSelect;
export type AssignmentAllocation = typeof assignmentAllocations.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type SubmissionTranscription = typeof submissionTranscriptions.$inferSelect;
export type SubmissionMark = typeof submissionMarks.$inferSelect;
export type Resubmission = typeof resubmissions.$inferSelect;
export type UserDevice = typeof userDevices.$inferSelect;
export type StudentAssignmentResult = typeof studentAssignmentResults.$inferSelect;

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;
export type AuState = typeof AU_STATES[number];

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.literal('AU').default('AU'),
  state: z.literal('NSW'),
  suburb: z.string().max(120).optional(),
  postcode: z.string().max(10).optional(),
  accountType: z.enum(['individual', 'multi_tutor']).default('individual'),
  businessName: z.string().max(255).optional(),
}).refine(
  (data) => data.accountType !== 'multi_tutor' || (data.businessName && data.businessName.trim().length >= 2),
  { message: "Business name is required (≥2 characters)", path: ['businessName'] }
);

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  state: z.enum(['VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']),
  intendedRole: z.enum(['individual_tutor', 'multi_tutor_owner', 'other']).optional(),
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
export type WaitlistData = z.infer<typeof waitlistSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
