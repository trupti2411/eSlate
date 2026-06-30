var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  AU_STATES: () => AU_STATES,
  academicHolidays: () => academicHolidays,
  academicHolidaysRelations: () => academicHolidaysRelations,
  academicTerms: () => academicTerms,
  academicTermsRelations: () => academicTermsRelations,
  academicWeeks: () => academicWeeks,
  academicWeeksRelations: () => academicWeeksRelations,
  academicYears: () => academicYears,
  academicYearsRelations: () => academicYearsRelations,
  assignmentAllocations: () => assignmentAllocations,
  assignmentLibraryItems: () => assignmentLibraryItems,
  assignmentLibraryQuestions: () => assignmentLibraryQuestions,
  assignmentLibraryRubrics: () => assignmentLibraryRubrics,
  assignmentSubmissions: () => assignmentSubmissions,
  assignments: () => assignments,
  assignmentsRelations: () => assignmentsRelations,
  auditLogs: () => auditLogs,
  calendarEvents: () => calendarEvents,
  calendarEventsRelations: () => calendarEventsRelations,
  classSessions: () => classSessions,
  classSessionsRelations: () => classSessionsRelations,
  classSubjects: () => classSubjects,
  classWaitlist: () => classWaitlist,
  classes: () => classes,
  classesRelations: () => classesRelations,
  companyAdmins: () => companyAdmins,
  companyAdminsRelations: () => companyAdminsRelations,
  companySubjects: () => companySubjects,
  companySupportContacts: () => companySupportContacts,
  companySupportContactsRelations: () => companySupportContactsRelations,
  courseSubjects: () => courseSubjects,
  courses: () => courses,
  forgotPasswordSchema: () => forgotPasswordSchema,
  inAppNotifications: () => inAppNotifications,
  inAppNotificationsRelations: () => inAppNotificationsRelations,
  insertAcademicHolidaySchema: () => insertAcademicHolidaySchema,
  insertAcademicTermSchema: () => insertAcademicTermSchema,
  insertAcademicWeekSchema: () => insertAcademicWeekSchema,
  insertAcademicYearSchema: () => insertAcademicYearSchema,
  insertAssignmentAllocationSchema: () => insertAssignmentAllocationSchema,
  insertAssignmentLibraryItemSchema: () => insertAssignmentLibraryItemSchema,
  insertAssignmentLibraryQuestionSchema: () => insertAssignmentLibraryQuestionSchema,
  insertAssignmentLibraryRubricSchema: () => insertAssignmentLibraryRubricSchema,
  insertAssignmentSchema: () => insertAssignmentSchema,
  insertAssignmentSubmissionSchema: () => insertAssignmentSubmissionSchema,
  insertCalendarEventSchema: () => insertCalendarEventSchema,
  insertClassSchema: () => insertClassSchema,
  insertClassSessionSchema: () => insertClassSessionSchema,
  insertCompanyAdminSchema: () => insertCompanyAdminSchema,
  insertCompanySupportContactSchema: () => insertCompanySupportContactSchema,
  insertInAppNotificationSchema: () => insertInAppNotificationSchema,
  insertInvoiceLineItemSchema: () => insertInvoiceLineItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationPreferencesSchema: () => insertNotificationPreferencesSchema,
  insertParentSchema: () => insertParentSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProgressSchema: () => insertProgressSchema,
  insertReportDefinitionSchema: () => insertReportDefinitionSchema,
  insertReportExportSchema: () => insertReportExportSchema,
  insertReportRunSchema: () => insertReportRunSchema,
  insertResubmissionSchema: () => insertResubmissionSchema,
  insertSessionAttendanceSchema: () => insertSessionAttendanceSchema,
  insertStudentAssignmentResultSchema: () => insertStudentAssignmentResultSchema,
  insertStudentClassAssignmentSchema: () => insertStudentClassAssignmentSchema,
  insertStudentProgressReportSchema: () => insertStudentProgressReportSchema,
  insertStudentSchema: () => insertStudentSchema,
  insertSubmissionMarkSchema: () => insertSubmissionMarkSchema,
  insertSubmissionSchema: () => insertSubmissionSchema,
  insertSubmissionTranscriptionSchema: () => insertSubmissionTranscriptionSchema,
  insertTestAnswerSchema: () => insertTestAnswerSchema,
  insertTestAssignmentSchema: () => insertTestAssignmentSchema,
  insertTestAttemptSchema: () => insertTestAttemptSchema,
  insertTestQuestionSchema: () => insertTestQuestionSchema,
  insertTestSchema: () => insertTestSchema,
  insertTutorSchema: () => insertTutorSchema,
  insertTutoringCompanySchema: () => insertTutoringCompanySchema,
  insertUserDeviceSchema: () => insertUserDeviceSchema,
  insertUserSchema: () => insertUserSchema,
  insertWorksheetAnswerSchema: () => insertWorksheetAnswerSchema,
  insertWorksheetAssignmentSchema: () => insertWorksheetAssignmentSchema,
  insertWorksheetPageSchema: () => insertWorksheetPageSchema,
  insertWorksheetQuestionSchema: () => insertWorksheetQuestionSchema,
  insertWorksheetSchema: () => insertWorksheetSchema,
  invoiceLineItems: () => invoiceLineItems,
  invoiceLineItemsRelations: () => invoiceLineItemsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  loginAttempts: () => loginAttempts,
  loginSchema: () => loginSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notificationPreferences: () => notificationPreferences,
  parents: () => parents,
  parentsRelations: () => parentsRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  progress: () => progress,
  progressRelations: () => progressRelations,
  registerSchema: () => registerSchema,
  reportDefinitions: () => reportDefinitions,
  reportDefinitionsRelations: () => reportDefinitionsRelations,
  reportExports: () => reportExports,
  reportExportsRelations: () => reportExportsRelations,
  reportRuns: () => reportRuns,
  reportRunsRelations: () => reportRunsRelations,
  resetPasswordSchema: () => resetPasswordSchema,
  resubmissions: () => resubmissions,
  sessionAttendance: () => sessionAttendance,
  sessionAttendanceRelations: () => sessionAttendanceRelations,
  studentAssignmentResults: () => studentAssignmentResults,
  studentClassAssignments: () => studentClassAssignments,
  studentClassAssignmentsRelations: () => studentClassAssignmentsRelations,
  studentContacts: () => studentContacts,
  studentProgressReports: () => studentProgressReports,
  studentProgressReportsRelations: () => studentProgressReportsRelations,
  students: () => students,
  studentsRelations: () => studentsRelations,
  submissionMarks: () => submissionMarks,
  submissionTranscriptions: () => submissionTranscriptions,
  submissions: () => submissions,
  submissionsRelations: () => submissionsRelations,
  termReminders: () => termReminders,
  testAnswers: () => testAnswers,
  testAssignments: () => testAssignments,
  testAttempts: () => testAttempts,
  testQuestions: () => testQuestions,
  tests: () => tests,
  tutoringCompanies: () => tutoringCompanies,
  tutoringCompaniesRelations: () => tutoringCompaniesRelations,
  tutors: () => tutors,
  tutorsRelations: () => tutorsRelations,
  userDevices: () => userDevices,
  users: () => users,
  usersRelations: () => usersRelations,
  waitlistSchema: () => waitlistSchema,
  worksheetAnswers: () => worksheetAnswers,
  worksheetAssignments: () => worksheetAssignments,
  worksheetPages: () => worksheetPages,
  worksheetQuestions: () => worksheetQuestions,
  worksheets: () => worksheets
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  mysqlEnum,
  timestamp,
  varchar,
  text,
  int,
  boolean,
  json,
  decimal
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, students, studentContacts, parents, tutoringCompanies, courses, courseSubjects, classSubjects, companySubjects, companySupportContacts, auditLogs, loginAttempts, companyAdmins, tutors, academicYears, academicTerms, academicWeeks, classes, assignments, submissions, messages, progress, calendarEvents, studentClassAssignments, worksheets, worksheetPages, worksheetQuestions, worksheetAssignments, worksheetAnswers, tests, testQuestions, testAssignments, testAttempts, testAnswers, classSessions, sessionAttendance, academicHolidays, notificationPreferences, reportDefinitions, reportRuns, reportExports, studentProgressReports, classWaitlist, invoices, invoiceLineItems, payments, termReminders, inAppNotifications, assignmentLibraryItems, assignmentLibraryQuestions, assignmentLibraryRubrics, assignmentAllocations, assignmentSubmissions, submissionTranscriptions, submissionMarks, resubmissions, userDevices, studentAssignmentResults, usersRelations, studentsRelations, parentsRelations, tutoringCompaniesRelations, companySupportContactsRelations, companyAdminsRelations, tutorsRelations, assignmentsRelations, submissionsRelations, messagesRelations, progressRelations, calendarEventsRelations, academicYearsRelations, academicTermsRelations, academicWeeksRelations, classesRelations, studentClassAssignmentsRelations, classSessionsRelations, sessionAttendanceRelations, academicHolidaysRelations, reportDefinitionsRelations, reportRunsRelations, reportExportsRelations, studentProgressReportsRelations, inAppNotificationsRelations, invoicesRelations, invoiceLineItemsRelations, paymentsRelations, insertUserSchema, insertStudentSchema, insertParentSchema, insertTutorSchema, insertAssignmentSchema, insertSubmissionSchema, insertMessageSchema, insertProgressSchema, insertCalendarEventSchema, insertTutoringCompanySchema, insertCompanyAdminSchema, insertCompanySupportContactSchema, insertAcademicYearSchema, insertAcademicTermSchema, insertAcademicWeekSchema, insertClassSchema, insertStudentClassAssignmentSchema, insertWorksheetSchema, insertWorksheetPageSchema, insertWorksheetQuestionSchema, insertWorksheetAssignmentSchema, insertWorksheetAnswerSchema, insertTestSchema, insertTestQuestionSchema, insertTestAssignmentSchema, insertTestAttemptSchema, insertTestAnswerSchema, insertClassSessionSchema, insertSessionAttendanceSchema, insertAcademicHolidaySchema, insertNotificationPreferencesSchema, insertReportDefinitionSchema, insertReportRunSchema, insertReportExportSchema, insertStudentProgressReportSchema, insertInAppNotificationSchema, insertInvoiceSchema, insertInvoiceLineItemSchema, insertPaymentSchema, insertAssignmentLibraryItemSchema, insertAssignmentLibraryQuestionSchema, insertAssignmentLibraryRubricSchema, insertAssignmentAllocationSchema, insertAssignmentSubmissionSchema, insertSubmissionTranscriptionSchema, insertSubmissionMarkSchema, insertResubmissionSchema, insertUserDeviceSchema, insertStudentAssignmentResultSchema, AU_STATES, registerSchema, waitlistSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      email: varchar("email", { length: 255 }).unique().notNull(),
      password: varchar("password", { length: 255 }),
      firstName: varchar("first_name", { length: 100 }),
      lastName: varchar("last_name", { length: 100 }),
      profileImageUrl: varchar("profile_image_url", { length: 500 }),
      role: mysqlEnum("role", ["student", "parent", "tutor", "admin", "company_admin"]).notNull().default("student"),
      isActive: boolean("is_active").notNull().default(true),
      isEmailVerified: boolean("is_email_verified").notNull().default(false),
      emailVerificationToken: varchar("email_verification_token", { length: 255 }),
      passwordResetToken: varchar("password_reset_token", { length: 255 }),
      passwordResetExpires: timestamp("password_reset_expires"),
      lastLogin: timestamp("last_login"),
      authProvider: varchar("auth_provider", { length: 50 }).default("email"),
      replitId: varchar("replit_id", { length: 255 }),
      termsAcceptedAt: timestamp("terms_accepted_at"),
      termsVersion: varchar("terms_version", { length: 20 }),
      isDeleted: boolean("is_deleted").notNull().default(false),
      deletedAt: timestamp("deleted_at"),
      deletedBy: varchar("deleted_by", { length: 36 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    students = mysqlTable("students", {
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
      status: mysqlEnum("status", ["active", "archived"]).notNull().default("active"),
      archivedAt: timestamp("archived_at"),
      archivedBy: varchar("archived_by", { length: 36 }),
      archivedByName: varchar("archived_by_name", { length: 255 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      updatedByName: varchar("updated_by_name", { length: 255 })
    });
    studentContacts = mysqlTable("student_contacts", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      relationship: varchar("relationship", { length: 100 }),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      isPrimary: boolean("is_primary").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    parents = mysqlTable("parents", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      phoneNumber: varchar("phone_number", { length: 50 }),
      aiHintsEnabled: boolean("ai_hints_enabled").notNull().default(true),
      maxHintsPerQuestion: int("max_hints_per_question").default(3),
      createdAt: timestamp("created_at").defaultNow()
    });
    tutoringCompanies = mysqlTable("tutoring_companies", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      abn: varchar("abn", { length: 20 }),
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
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    courses = mysqlTable("courses", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 150 }).notNull(),
      description: text("description"),
      yearGroupCode: varchar("year_group_code", { length: 10 }),
      status: varchar("status", { length: 20 }).default("active"),
      archivedAt: timestamp("archived_at"),
      archivedBy: varchar("archived_by", { length: 36 }),
      archivedByName: varchar("archived_by_name", { length: 255 }),
      duplicatedFromId: varchar("duplicated_from_id", { length: 36 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    courseSubjects = mysqlTable("course_subjects", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      courseId: varchar("course_id", { length: 36 }).notNull().references(() => courses.id, { onDelete: "cascade" }),
      subjectId: int("subject_id").notNull()
    });
    classSubjects = mysqlTable("class_subjects", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
      subjectId: int("subject_id").notNull(),
      isPrimary: boolean("is_primary").notNull().default(false)
    });
    companySubjects = mysqlTable("company_subjects", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 100 }).notNull(),
      code: varchar("code", { length: 20 }).notNull(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow()
    });
    companySupportContacts = mysqlTable("company_support_contacts", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      roleLabel: varchar("role_label", { length: 100 }).notNull().default("Support"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    auditLogs = mysqlTable("audit_logs", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }),
      action: varchar("action", { length: 100 }).notNull(),
      resource: varchar("resource", { length: 100 }),
      resourceId: varchar("resource_id", { length: 36 }),
      ipAddress: varchar("ip_address", { length: 50 }),
      userAgent: text("user_agent"),
      details: json("details"),
      status: varchar("status", { length: 20 }).notNull().default("success"),
      createdAt: timestamp("created_at").defaultNow()
    });
    loginAttempts = mysqlTable("login_attempts", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      email: varchar("email", { length: 255 }).notNull(),
      ipAddress: varchar("ip_address", { length: 50 }),
      success: boolean("success").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    companyAdmins = mysqlTable("company_admins", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      permissions: json("permissions").$type().default([]),
      createdAt: timestamp("created_at").defaultNow()
    });
    tutors = mysqlTable("tutors", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id),
      specialization: text("specialization"),
      qualifications: text("qualifications"),
      availability: text("availability"),
      subjectsTeaching: json("subjects_teaching").$type().default([]),
      branch: varchar("branch", { length: 255 }),
      isVerified: boolean("is_verified").notNull().default(false),
      phoneNumber: varchar("phone_number", { length: 50 }),
      address: text("address"),
      profilePhotoUrl: varchar("profile_photo_url", { length: 500 }),
      wwccNumber: varchar("wwcc_number", { length: 100 }),
      wwccExpiry: timestamp("wwcc_expiry"),
      wwccState: varchar("wwcc_state", { length: 10 }),
      status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
      deactivatedAt: timestamp("deactivated_at"),
      deactivatedBy: varchar("deactivated_by", { length: 36 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    academicYears = mysqlTable("academic_years", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      yearNumber: int("year_number").notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      description: varchar("description", { length: 255 }),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    academicTerms = mysqlTable("academic_terms", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      academicYearId: varchar("academic_year_id", { length: 36 }).notNull().references(() => academicYears.id, { onDelete: "cascade" }),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 100 }).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    academicWeeks = mysqlTable("academic_weeks", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      weekNumber: int("week_number").notNull(),
      name: varchar("name", { length: 50 }).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    classes = mysqlTable("classes", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      subject: varchar("subject", { length: 100 }).notNull().default("TBD"),
      description: text("description"),
      location: varchar("location", { length: 255 }),
      tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id, { onDelete: "set null" }),
      dayOfWeek: int("day_of_week"),
      daysOfWeek: json("days_of_week").$type().default([]),
      startTime: varchar("start_time", { length: 10 }).notNull().default(""),
      endTime: varchar("end_time", { length: 10 }).notNull().default(""),
      maxStudents: int("max_students"),
      isActive: boolean("is_active").default(true),
      courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),
      yearGroupCode: varchar("year_group_code", { length: 20 }),
      level: varchar("level", { length: 50 }),
      status: varchar("status", { length: 20 }).default("draft"),
      archivedAt: timestamp("archived_at"),
      archivedBy: varchar("archived_by", { length: 36 }),
      archivedByName: varchar("archived_by_name", { length: 255 }),
      duplicatedFromId: varchar("duplicated_from_id", { length: 36 }),
      feePerSession: decimal("fee_per_session", { precision: 8, scale: 2 }),
      feePerTerm: decimal("fee_per_term", { precision: 8, scale: 2 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    assignments = mysqlTable("assignments", {
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
      assignmentKind: mysqlEnum("assignment_kind", ["file_upload", "worksheet"]).notNull().default("file_upload"),
      worksheetId: varchar("worksheet_id", { length: 36 }),
      academicYearId: varchar("academic_year_id", { length: 36 }).references(() => academicYears.id),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
      subject: varchar("subject", { length: 100 }).notNull(),
      week: int("week"),
      solutionText: text("solution_text"),
      solutionFileUrls: json("solution_file_urls").$type().default([]),
      solutionNotes: text("solution_notes"),
      attachmentUrls: json("attachment_urls").$type().default([]),
      allowedFileTypes: json("allowed_file_types").$type().default(["pdf", "doc", "docx", "xls", "xlsx", "png", "jpeg"]),
      maxFileSize: int("max_file_size").default(31457280),
      pageRotations: json("page_rotations").$type().default({}),
      status: mysqlEnum("status", ["assigned", "submitted", "reviewed", "completed", "late", "needs_revision"]).notNull().default("assigned"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    submissions = mysqlTable("submissions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
      documentUrl: varchar("document_url", { length: 500 }),
      content: text("content"),
      digitalContent: text("digital_content"),
      fileUrls: json("file_urls").$type().default([]),
      status: mysqlEnum("status", ["draft", "submitted", "late", "graded", "parent_verified", "needs_revision"]).notNull().default("draft"),
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    messages = mysqlTable("messages", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
      receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
      content: text("content").notNull(),
      messageType: mysqlEnum("message_type", ["text", "file", "system"]).notNull().default("text"),
      isRead: boolean("is_read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    progress = mysqlTable("progress", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
      assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id),
      completionPercentage: int("completion_percentage").notNull().default(0),
      timeSpent: int("time_spent_minutes").default(0),
      lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    calendarEvents = mysqlTable("calendar_events", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id),
      studentId: varchar("student_id", { length: 36 }).references(() => students.id),
      eventType: varchar("event_type", { length: 50 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    studentClassAssignments = mysqlTable("student_class_assignments", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
      assignedDate: timestamp("assigned_date").defaultNow(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    worksheets = mysqlTable("worksheets", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      subject: varchar("subject", { length: 100 }),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
      isPublished: boolean("is_published").notNull().default(false),
      dueDate: timestamp("due_date"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    worksheetPages = mysqlTable("worksheet_pages", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      worksheetId: varchar("worksheet_id", { length: 36 }).notNull().references(() => worksheets.id, { onDelete: "cascade" }),
      pageNumber: int("page_number").notNull(),
      title: varchar("title", { length: 255 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    worksheetQuestions = mysqlTable("worksheet_questions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      pageId: varchar("page_id", { length: 36 }).notNull().references(() => worksheetPages.id, { onDelete: "cascade" }),
      questionType: mysqlEnum("question_type", ["short_text", "long_text", "multiple_choice", "fill_blank", "text_image", "information"]).notNull(),
      questionText: text("question_text").notNull(),
      questionNumber: int("question_number").notNull(),
      options: json("options"),
      imageUrl: varchar("image_url", { length: 500 }),
      correctAnswer: text("correct_answer"),
      points: int("points").default(1),
      createdAt: timestamp("created_at").defaultNow()
    });
    worksheetAssignments = mysqlTable("worksheet_assignments", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      worksheetId: varchar("worksheet_id", { length: 36 }).notNull().references(() => worksheets.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).references(() => students.id, { onDelete: "cascade" }),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: "cascade" }),
      assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
      dueDate: timestamp("due_date"),
      status: mysqlEnum("status", ["assigned", "in_progress", "submitted", "graded"]).notNull().default("assigned"),
      submittedAt: timestamp("submitted_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    worksheetAnswers = mysqlTable("worksheet_answers", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      questionId: varchar("question_id", { length: 36 }).notNull().references(() => worksheetQuestions.id, { onDelete: "cascade" }),
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    tests = mysqlTable("tests", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      subject: varchar("subject", { length: 100 }),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id),
      status: mysqlEnum("status", ["draft", "published", "archived"]).notNull().default("draft"),
      duration: int("duration"),
      totalPoints: int("total_points").default(0),
      passingScore: int("passing_score"),
      dueDate: timestamp("due_date"),
      allowRetakes: boolean("allow_retakes").default(false),
      showResultsImmediately: boolean("show_results_immediately").default(true),
      shuffleQuestions: boolean("shuffle_questions").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    testQuestions = mysqlTable("test_questions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: "cascade" }),
      questionType: mysqlEnum("question_type", ["multiple_choice", "true_false", "short_answer", "essay", "fill_blank"]).notNull(),
      questionText: text("question_text").notNull(),
      questionNumber: int("question_number").notNull(),
      options: json("options"),
      correctAnswer: text("correct_answer"),
      points: int("points").default(1),
      explanation: text("explanation"),
      createdAt: timestamp("created_at").defaultNow()
    });
    testAssignments = mysqlTable("test_assignments", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).references(() => students.id, { onDelete: "cascade" }),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: "cascade" }),
      assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
      dueDate: timestamp("due_date"),
      createdAt: timestamp("created_at").defaultNow()
    });
    testAttempts = mysqlTable("test_attempts", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      testId: varchar("test_id", { length: 36 }).notNull().references(() => tests.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
      status: mysqlEnum("status", ["in_progress", "submitted", "graded"]).notNull().default("in_progress"),
      startedAt: timestamp("started_at").defaultNow(),
      submittedAt: timestamp("submitted_at"),
      totalScore: int("total_score"),
      percentageScore: int("percentage_score"),
      isPassed: boolean("is_passed"),
      gradedBy: varchar("graded_by", { length: 36 }).references(() => users.id),
      gradedAt: timestamp("graded_at"),
      feedback: text("feedback"),
      createdAt: timestamp("created_at").defaultNow()
    });
    testAnswers = mysqlTable("test_answers", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      attemptId: varchar("attempt_id", { length: 36 }).notNull().references(() => testAttempts.id, { onDelete: "cascade" }),
      questionId: varchar("question_id", { length: 36 }).notNull().references(() => testQuestions.id, { onDelete: "cascade" }),
      studentAnswer: text("student_answer"),
      selectedOption: varchar("selected_option", { length: 100 }),
      isCorrect: boolean("is_correct"),
      pointsAwarded: int("points_awarded"),
      feedback: text("feedback"),
      gradedAt: timestamp("graded_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    classSessions = mysqlTable("class_sessions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
      tutorId: varchar("tutor_id", { length: 36 }).references(() => tutors.id, { onDelete: "set null" }),
      sessionDate: timestamp("session_date").notNull(),
      startTime: varchar("start_time", { length: 10 }).notNull(),
      endTime: varchar("end_time", { length: 10 }).notNull(),
      durationMinutes: int("duration_minutes").notNull(),
      status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).notNull().default("scheduled"),
      deliveryMode: varchar("delivery_mode", { length: 20 }).default("in_person"),
      locationUrl: varchar("location_url", { length: 500 }),
      notes: text("notes"),
      enrolledCount: int("enrolled_count").default(0),
      attendedCount: int("attended_count").default(0),
      attendanceLocked: boolean("attendance_locked").default(false),
      attendanceLockedAt: timestamp("attendance_locked_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    sessionAttendance = mysqlTable("session_attendance", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      sessionId: varchar("session_id", { length: 36 }).notNull().references(() => classSessions.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      status: mysqlEnum("status", ["present", "absent", "late", "excused"]).notNull().default("absent"),
      markedBy: varchar("marked_by", { length: 36 }).references(() => users.id),
      markedAt: timestamp("marked_at"),
      notes: text("notes"),
      isOverride: boolean("is_override").default(false),
      overrideBy: varchar("override_by", { length: 36 }).references(() => users.id),
      overrideAt: timestamp("override_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    academicHolidays = mysqlTable("academic_holidays", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      isPublic: boolean("is_public").default(true),
      isRecurring: boolean("is_recurring").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    notificationPreferences = mysqlTable("notification_preferences", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    reportDefinitions = mysqlTable("report_definitions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      reportType: mysqlEnum("report_type", ["student_performance", "attendance_summary", "class_utilization", "assignment_completion", "tutor_workload", "enrollment_trends"]).notNull(),
      defaultFilters: json("default_filters").default({}),
      isScheduled: boolean("is_scheduled").notNull().default(false),
      scheduleCron: varchar("schedule_cron", { length: 100 }),
      createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    reportRuns = mysqlTable("report_runs", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      reportType: mysqlEnum("report_type", ["student_performance", "attendance_summary", "class_utilization", "assignment_completion", "tutor_workload", "enrollment_trends"]).notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      parameters: json("parameters").default({}),
      status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).notNull().default("pending"),
      resultData: json("result_data"),
      rowCount: int("row_count"),
      errorMessage: text("error_message"),
      requestedBy: varchar("requested_by", { length: 36 }).references(() => users.id),
      startedAt: timestamp("started_at"),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    reportExports = mysqlTable("report_exports", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      reportRunId: varchar("report_run_id", { length: 36 }).notNull().references(() => reportRuns.id),
      exportType: varchar("export_type", { length: 20 }).notNull(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      filePath: varchar("file_path", { length: 500 }),
      fileSize: int("file_size"),
      createdAt: timestamp("created_at").defaultNow()
    });
    studentProgressReports = mysqlTable("student_progress_reports", {
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
      status: mysqlEnum("status", ["draft", "published", "shared_with_parent"]).notNull().default("draft"),
      sharedWithParentAt: timestamp("shared_with_parent_at"),
      createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
      createdByName: varchar("created_by_name", { length: 255 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    classWaitlist = mysqlTable("class_waitlist", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      classId: varchar("class_id", { length: 36 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
      position: int("position").notNull().default(1),
      status: mysqlEnum("status", ["waiting", "enrolled", "removed"]).notNull().default("waiting"),
      addedAt: timestamp("added_at").defaultNow(),
      addedBy: varchar("added_by", { length: 36 }),
      addedByName: varchar("added_by_name", { length: 255 }),
      enrolledAt: timestamp("enrolled_at"),
      removedAt: timestamp("removed_at"),
      notes: text("notes")
    });
    invoices = mysqlTable("invoices", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
      invoiceNumber: varchar("invoice_number", { length: 20 }).notNull(),
      status: mysqlEnum("status", ["draft", "sent", "paid", "partially_paid", "overdue", "void"]).notNull().default("draft"),
      invoiceDate: timestamp("invoice_date").notNull(),
      dueDate: timestamp("due_date").notNull(),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
      discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
      discountType: varchar("discount_type", { length: 20 }),
      discountReason: text("discount_reason"),
      total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
      createdByName: varchar("created_by_name", { length: 255 }),
      sentAt: timestamp("sent_at"),
      sentToEmail: varchar("sent_to_email", { length: 255 }),
      sendStatus: varchar("send_status", { length: 20 }),
      voidedAt: timestamp("voided_at"),
      voidReason: varchar("void_reason", { length: 100 }),
      bulkRunId: varchar("bulk_run_id", { length: 36 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    invoiceLineItems = mysqlTable("invoice_line_items", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
      description: varchar("description", { length: 255 }).notNull(),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id, { onDelete: "set null" }),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id, { onDelete: "set null" }),
      sessions: int("sessions"),
      unitPrice: decimal("unit_price", { precision: 8, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
      isManual: boolean("is_manual").default(false),
      sortOrder: int("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    payments = mysqlTable("payments", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentDate: timestamp("payment_date").notNull(),
      method: varchar("method", { length: 50 }).notNull().default("bank_transfer"),
      reference: varchar("reference", { length: 100 }),
      notes: text("notes"),
      recordedBy: varchar("recorded_by", { length: 36 }).references(() => users.id),
      recordedByName: varchar("recorded_by_name", { length: 255 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    termReminders = mysqlTable("term_reminders", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      termId: varchar("term_id", { length: 36 }).notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
      reminderType: varchar("reminder_type", { length: 50 }).notNull(),
      recipient: varchar("recipient", { length: 20 }).notNull().default("admin"),
      sentAt: timestamp("sent_at").defaultNow()
    });
    inAppNotifications = mysqlTable("in_app_notifications", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
      companyId: varchar("company_id", { length: 36 }).references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      type: varchar("type", { length: 50 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      message: text("message").notNull(),
      data: json("data"),
      isRead: boolean("is_read").notNull().default(false),
      readAt: timestamp("read_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    assignmentLibraryItems = mysqlTable("asgn_lib_items", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      instructions: text("instructions"),
      subjects: json("subjects").$type().default([]),
      yearGroups: json("year_groups").$type().default([]),
      estimatedDuration: int("estimated_duration"),
      maxMarks: int("max_marks"),
      libStatus: mysqlEnum("lib_status", ["draft", "published", "archived"]).notNull().default("draft"),
      fileUrl: varchar("file_url", { length: 500 }),
      fileType: varchar("file_type", { length: 20 }),
      pageCount: int("page_count"),
      createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
      lastUpdatedBy: varchar("last_updated_by", { length: 36 }).references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    assignmentLibraryQuestions = mysqlTable("asgn_lib_questions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id, { onDelete: "cascade" }),
      questionNumber: int("question_number").notNull(),
      questionText: text("question_text").notNull(),
      questionType: mysqlEnum("lib_question_type", ["objective", "subjective", "mcq", "fill_in"]).notNull().default("subjective"),
      answerKey: text("answer_key"),
      maxMarks: int("max_marks").default(1),
      regionCoords: json("region_coords"),
      options: json("options").$type(),
      createdAt: timestamp("created_at").defaultNow()
    });
    assignmentLibraryRubrics = mysqlTable("asgn_lib_rubrics", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id, { onDelete: "cascade" }),
      criterion: varchar("criterion", { length: 255 }).notNull(),
      descriptor: text("descriptor"),
      maxMarks: int("max_marks").notNull().default(1),
      sortOrder: int("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    assignmentAllocations = mysqlTable("asgn_allocations", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id, { onDelete: "cascade" }),
      dueAt: timestamp("due_at").notNull(),
      releaseAt: timestamp("release_at"),
      allowResubmission: boolean("allow_resubmission").notNull().default(false),
      allocStatus: mysqlEnum("alloc_status", ["scheduled", "assigned", "in_progress", "submitted", "auto_marked", "under_review", "returned", "overdue", "revoked"]).notNull().default("assigned"),
      studentNote: text("student_note"),
      currentAttempt: int("current_attempt").notNull().default(1),
      createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    assignmentSubmissions = mysqlTable("asgn_submissions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id, { onDelete: "cascade" }),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id),
      attemptNo: int("attempt_no").notNull().default(1),
      submittedAt: timestamp("submitted_at"),
      isLate: boolean("is_late").notNull().default(false),
      syncStatus: mysqlEnum("asgn_sync_status", ["synced", "pending"]).notNull().default("synced"),
      inkData: text("ink_data"),
      enteredAnswers: json("entered_answers"),
      ocrStatus: mysqlEnum("asgn_ocr_status", ["pending", "processing", "complete", "failed", "unavailable"]).notNull().default("pending"),
      autoMarkStatus: mysqlEnum("asgn_auto_mark_status", ["pending", "processing", "complete", "failed"]).notNull().default("pending"),
      provisionalScore: int("provisional_score"),
      finalScore: int("final_score"),
      tutorFeedback: text("tutor_feedback"),
      tutorAnnotations: text("tutor_annotations"),
      finalisedBy: varchar("finalised_by", { length: 36 }).references(() => users.id),
      finalisedAt: timestamp("finalised_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    submissionTranscriptions = mysqlTable("sub_transcriptions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
      questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id),
      text: text("text"),
      confidence: int("confidence"),
      ocrStatus: varchar("transcription_ocr_status", { length: 20 }).notNull().default("pending"),
      tutorCorrection: text("tutor_correction"),
      createdAt: timestamp("created_at").defaultNow()
    });
    submissionMarks = mysqlTable("sub_marks", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => assignmentSubmissions.id, { onDelete: "cascade" }),
      questionId: varchar("question_id", { length: 36 }).notNull().references(() => assignmentLibraryQuestions.id),
      markSource: mysqlEnum("mark_source", ["key", "ai", "tutor"]).notNull(),
      provisionalScore: int("provisional_score"),
      finalScore: int("final_score"),
      provisionalComments: text("provisional_comments"),
      tutorComments: text("tutor_comments"),
      confidence: int("confidence"),
      isProvisional: boolean("is_provisional").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    resubmissions = mysqlTable("resubmissions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id, { onDelete: "cascade" }),
      grantedBy: varchar("granted_by", { length: 36 }).notNull().references(() => users.id),
      grantedAt: timestamp("granted_at").defaultNow(),
      newDueAt: timestamp("new_due_at"),
      note: text("note"),
      usedAt: timestamp("used_at"),
      revokedAt: timestamp("revoked_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    userDevices = mysqlTable("user_devices", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
      deviceName: varchar("device_name", { length: 100 }),
      deviceType: varchar("device_type", { length: 50 }),
      lastActiveAt: timestamp("last_active_at").defaultNow(),
      lastSyncAt: timestamp("last_sync_at"),
      sessionTokenRef: varchar("session_token_ref", { length: 100 }),
      deviceStatus: mysqlEnum("device_status", ["active", "inactive", "unlinked"]).notNull().default("active"),
      createdAt: timestamp("created_at").defaultNow()
    });
    studentAssignmentResults = mysqlTable("stu_asgn_results", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
      allocationId: varchar("allocation_id", { length: 36 }).notNull().references(() => assignmentAllocations.id),
      libraryItemId: varchar("library_item_id", { length: 36 }).notNull().references(() => assignmentLibraryItems.id),
      companyId: varchar("company_id", { length: 36 }).notNull().references(() => tutoringCompanies.id),
      classId: varchar("class_id", { length: 36 }).references(() => classes.id),
      termId: varchar("term_id", { length: 36 }).references(() => academicTerms.id),
      subjects: json("subjects").$type().default([]),
      score: int("score"),
      maxMarks: int("sar_max_marks"),
      isLate: boolean("is_late").notNull().default(false),
      attemptNo: int("attempt_no").notNull().default(1),
      finalisedAt: timestamp("finalised_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ one }) => ({
      student: one(students, { fields: [users.id], references: [students.userId] }),
      parent: one(parents, { fields: [users.id], references: [parents.userId] }),
      tutor: one(tutors, { fields: [users.id], references: [tutors.userId] })
    }));
    studentsRelations = relations(students, ({ one, many }) => ({
      user: one(users, { fields: [students.userId], references: [users.id] }),
      parent: one(parents, { fields: [students.parentId], references: [parents.id] }),
      tutor: one(tutors, { fields: [students.tutorId], references: [tutors.id] }),
      company: one(tutoringCompanies, { fields: [students.companyId], references: [tutoringCompanies.id] }),
      submissions: many(submissions),
      progress: many(progress),
      calendarEvents: many(calendarEvents)
    }));
    parentsRelations = relations(parents, ({ one, many }) => ({
      user: one(users, { fields: [parents.userId], references: [users.id] }),
      students: many(students)
    }));
    tutoringCompaniesRelations = relations(tutoringCompanies, ({ many }) => ({
      admins: many(companyAdmins),
      tutors: many(tutors),
      supportContacts: many(companySupportContacts)
    }));
    companySupportContactsRelations = relations(companySupportContacts, ({ one }) => ({
      company: one(tutoringCompanies, { fields: [companySupportContacts.companyId], references: [tutoringCompanies.id] }),
      user: one(users, { fields: [companySupportContacts.userId], references: [users.id] })
    }));
    companyAdminsRelations = relations(companyAdmins, ({ one }) => ({
      user: one(users, { fields: [companyAdmins.userId], references: [users.id] }),
      company: one(tutoringCompanies, { fields: [companyAdmins.companyId], references: [tutoringCompanies.id] })
    }));
    tutorsRelations = relations(tutors, ({ one, many }) => ({
      user: one(users, { fields: [tutors.userId], references: [users.id] }),
      company: one(tutoringCompanies, { fields: [tutors.companyId], references: [tutoringCompanies.id] }),
      students: many(students),
      assignments: many(assignments),
      calendarEvents: many(calendarEvents)
    }));
    assignmentsRelations = relations(assignments, ({ one, many }) => ({
      company: one(tutoringCompanies, { fields: [assignments.companyId], references: [tutoringCompanies.id] }),
      creator: one(users, { fields: [assignments.createdBy], references: [users.id] }),
      class: one(classes, { fields: [assignments.classId], references: [classes.id] }),
      academicYear: one(academicYears, { fields: [assignments.academicYearId], references: [academicYears.id] }),
      term: one(academicTerms, { fields: [assignments.termId], references: [academicTerms.id] }),
      submissions: many(submissions),
      progress: many(progress)
    }));
    submissionsRelations = relations(submissions, ({ one }) => ({
      assignment: one(assignments, { fields: [submissions.assignmentId], references: [assignments.id] }),
      student: one(students, { fields: [submissions.studentId], references: [students.id] })
    }));
    messagesRelations = relations(messages, ({ one }) => ({
      sender: one(users, { fields: [messages.senderId], references: [users.id] }),
      receiver: one(users, { fields: [messages.receiverId], references: [users.id] })
    }));
    progressRelations = relations(progress, ({ one }) => ({
      student: one(students, { fields: [progress.studentId], references: [students.id] }),
      assignment: one(assignments, { fields: [progress.assignmentId], references: [assignments.id] })
    }));
    calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
      tutor: one(tutors, { fields: [calendarEvents.tutorId], references: [tutors.id] }),
      student: one(students, { fields: [calendarEvents.studentId], references: [students.id] })
    }));
    academicYearsRelations = relations(academicYears, ({ one, many }) => ({
      company: one(tutoringCompanies, { fields: [academicYears.companyId], references: [tutoringCompanies.id] }),
      terms: many(academicTerms),
      assignments: many(assignments)
    }));
    academicTermsRelations = relations(academicTerms, ({ one, many }) => ({
      academicYear: one(academicYears, { fields: [academicTerms.academicYearId], references: [academicYears.id] }),
      company: one(tutoringCompanies, { fields: [academicTerms.companyId], references: [tutoringCompanies.id] }),
      weeks: many(academicWeeks),
      classes: many(classes),
      assignments: many(assignments)
    }));
    academicWeeksRelations = relations(academicWeeks, ({ one }) => ({
      term: one(academicTerms, { fields: [academicWeeks.termId], references: [academicTerms.id] }),
      company: one(tutoringCompanies, { fields: [academicWeeks.companyId], references: [tutoringCompanies.id] })
    }));
    classesRelations = relations(classes, ({ one, many }) => ({
      term: one(academicTerms, { fields: [classes.termId], references: [academicTerms.id] }),
      company: one(tutoringCompanies, { fields: [classes.companyId], references: [tutoringCompanies.id] }),
      tutor: one(tutors, { fields: [classes.tutorId], references: [tutors.id] }),
      studentAssignments: many(studentClassAssignments),
      assignments: many(assignments)
    }));
    studentClassAssignmentsRelations = relations(studentClassAssignments, ({ one }) => ({
      student: one(students, { fields: [studentClassAssignments.studentId], references: [students.id] }),
      class: one(classes, { fields: [studentClassAssignments.classId], references: [classes.id] })
    }));
    classSessionsRelations = relations(classSessions, ({ one, many }) => ({
      class: one(classes, { fields: [classSessions.classId], references: [classes.id] }),
      tutor: one(tutors, { fields: [classSessions.tutorId], references: [tutors.id] }),
      attendance: many(sessionAttendance)
    }));
    sessionAttendanceRelations = relations(sessionAttendance, ({ one }) => ({
      session: one(classSessions, { fields: [sessionAttendance.sessionId], references: [classSessions.id] }),
      student: one(students, { fields: [sessionAttendance.studentId], references: [students.id] }),
      markedByUser: one(users, { fields: [sessionAttendance.markedBy], references: [users.id] })
    }));
    academicHolidaysRelations = relations(academicHolidays, ({ one }) => ({
      company: one(tutoringCompanies, { fields: [academicHolidays.companyId], references: [tutoringCompanies.id] })
    }));
    reportDefinitionsRelations = relations(reportDefinitions, ({ one }) => ({
      company: one(tutoringCompanies, { fields: [reportDefinitions.companyId], references: [tutoringCompanies.id] }),
      createdByUser: one(users, { fields: [reportDefinitions.createdBy], references: [users.id] })
    }));
    reportRunsRelations = relations(reportRuns, ({ one, many }) => ({
      company: one(tutoringCompanies, { fields: [reportRuns.companyId], references: [tutoringCompanies.id] }),
      requestedByUser: one(users, { fields: [reportRuns.requestedBy], references: [users.id] }),
      exports: many(reportExports)
    }));
    reportExportsRelations = relations(reportExports, ({ one }) => ({
      reportRun: one(reportRuns, { fields: [reportExports.reportRunId], references: [reportRuns.id] })
    }));
    studentProgressReportsRelations = relations(studentProgressReports, ({ one }) => ({
      student: one(students, { fields: [studentProgressReports.studentId], references: [students.id] }),
      company: one(tutoringCompanies, { fields: [studentProgressReports.companyId], references: [tutoringCompanies.id] }),
      term: one(academicTerms, { fields: [studentProgressReports.termId], references: [academicTerms.id] }),
      createdByUser: one(users, { fields: [studentProgressReports.createdBy], references: [users.id] })
    }));
    inAppNotificationsRelations = relations(inAppNotifications, ({ one }) => ({
      user: one(users, { fields: [inAppNotifications.userId], references: [users.id] }),
      company: one(tutoringCompanies, { fields: [inAppNotifications.companyId], references: [tutoringCompanies.id] })
    }));
    invoicesRelations = relations(invoices, ({ one, many }) => ({
      company: one(tutoringCompanies, { fields: [invoices.companyId], references: [tutoringCompanies.id] }),
      student: one(students, { fields: [invoices.studentId], references: [students.id] }),
      term: one(academicTerms, { fields: [invoices.termId], references: [academicTerms.id] }),
      lineItems: many(invoiceLineItems),
      payments: many(payments)
    }));
    invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
      invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
      class: one(classes, { fields: [invoiceLineItems.classId], references: [classes.id] })
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] })
    }));
    insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
    insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
    insertParentSchema = createInsertSchema(parents).omit({ id: true, createdAt: true });
    insertTutorSchema = createInsertSchema(tutors).omit({ id: true, createdAt: true });
    insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true, updatedAt: true });
    insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true, gradedAt: true, createdAt: true, updatedAt: true });
    insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
    insertProgressSchema = createInsertSchema(progress).omit({ id: true, lastAccessedAt: true, updatedAt: true });
    insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
    insertTutoringCompanySchema = createInsertSchema(tutoringCompanies).omit({ id: true, createdAt: true, updatedAt: true });
    insertCompanyAdminSchema = createInsertSchema(companyAdmins).omit({ id: true, createdAt: true });
    insertCompanySupportContactSchema = createInsertSchema(companySupportContacts).omit({ id: true, createdAt: true });
    insertAcademicYearSchema = createInsertSchema(academicYears).omit({ id: true, createdAt: true, updatedAt: true });
    insertAcademicTermSchema = createInsertSchema(academicTerms).omit({ id: true, createdAt: true, updatedAt: true });
    insertAcademicWeekSchema = createInsertSchema(academicWeeks).omit({ id: true, createdAt: true });
    insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true, updatedAt: true });
    insertStudentClassAssignmentSchema = createInsertSchema(studentClassAssignments).omit({ id: true, createdAt: true, updatedAt: true });
    insertWorksheetSchema = createInsertSchema(worksheets).omit({ id: true, createdAt: true, updatedAt: true });
    insertWorksheetPageSchema = createInsertSchema(worksheetPages).omit({ id: true, createdAt: true });
    insertWorksheetQuestionSchema = createInsertSchema(worksheetQuestions).omit({ id: true, createdAt: true });
    insertWorksheetAssignmentSchema = createInsertSchema(worksheetAssignments).omit({ id: true, createdAt: true });
    insertWorksheetAnswerSchema = createInsertSchema(worksheetAnswers).omit({ id: true, createdAt: true, updatedAt: true });
    insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true, updatedAt: true });
    insertTestQuestionSchema = createInsertSchema(testQuestions).omit({ id: true, createdAt: true });
    insertTestAssignmentSchema = createInsertSchema(testAssignments).omit({ id: true, createdAt: true });
    insertTestAttemptSchema = createInsertSchema(testAttempts).omit({ id: true, createdAt: true });
    insertTestAnswerSchema = createInsertSchema(testAnswers).omit({ id: true, createdAt: true, updatedAt: true });
    insertClassSessionSchema = createInsertSchema(classSessions).omit({ id: true, createdAt: true, updatedAt: true });
    insertSessionAttendanceSchema = createInsertSchema(sessionAttendance).omit({ id: true, createdAt: true, updatedAt: true });
    insertAcademicHolidaySchema = createInsertSchema(academicHolidays).omit({ id: true, createdAt: true });
    insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
    insertReportDefinitionSchema = createInsertSchema(reportDefinitions).omit({ id: true, createdAt: true, updatedAt: true });
    insertReportRunSchema = createInsertSchema(reportRuns).omit({ id: true, createdAt: true });
    insertReportExportSchema = createInsertSchema(reportExports).omit({ id: true, createdAt: true });
    insertStudentProgressReportSchema = createInsertSchema(studentProgressReports).omit({ id: true, createdAt: true, updatedAt: true });
    insertInAppNotificationSchema = createInsertSchema(inAppNotifications).omit({ id: true, createdAt: true });
    insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
    insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({ id: true, createdAt: true });
    insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
    insertAssignmentLibraryItemSchema = createInsertSchema(assignmentLibraryItems).omit({ id: true, createdAt: true, updatedAt: true });
    insertAssignmentLibraryQuestionSchema = createInsertSchema(assignmentLibraryQuestions).omit({ id: true, createdAt: true });
    insertAssignmentLibraryRubricSchema = createInsertSchema(assignmentLibraryRubrics).omit({ id: true, createdAt: true });
    insertAssignmentAllocationSchema = createInsertSchema(assignmentAllocations).omit({ id: true, createdAt: true, updatedAt: true });
    insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({ id: true, createdAt: true, updatedAt: true });
    insertSubmissionTranscriptionSchema = createInsertSchema(submissionTranscriptions).omit({ id: true, createdAt: true });
    insertSubmissionMarkSchema = createInsertSchema(submissionMarks).omit({ id: true, createdAt: true, updatedAt: true });
    insertResubmissionSchema = createInsertSchema(resubmissions).omit({ id: true, createdAt: true });
    insertUserDeviceSchema = createInsertSchema(userDevices).omit({ id: true, createdAt: true });
    insertStudentAssignmentResultSchema = createInsertSchema(studentAssignmentResults).omit({ id: true, createdAt: true });
    AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
    registerSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      country: z.literal("AU").default("AU"),
      state: z.literal("NSW"),
      suburb: z.string().max(120).optional(),
      postcode: z.string().max(10).optional(),
      accountType: z.enum(["individual", "multi_tutor"]).default("individual"),
      businessName: z.string().max(255).optional()
    }).refine(
      (data) => data.accountType !== "multi_tutor" || data.businessName && data.businessName.trim().length >= 2,
      { message: "Business name is required (\u22652 characters)", path: ["businessName"] }
    );
    waitlistSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      state: z.enum(["VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"]),
      intendedRole: z.enum(["individual_tutor", "multi_tutor_owner", "other"]).optional()
    });
    loginSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required")
    });
    forgotPasswordSchema = z.object({
      email: z.string().email("Please enter a valid email address")
    });
    resetPasswordSchema = z.object({
      token: z.string(),
      password: z.string().min(8, "Password must be at least 8 characters")
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  connection: () => connection,
  db: () => db
});
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
var connection, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set.");
    }
    connection = mysql.createPool(process.env.DATABASE_URL);
    db = drizzle(connection, { schema: schema_exports, mode: "default" });
  }
});

// server/storage.ts
import { eq, and, or, desc, asc, gt, isNull, sql as sql2, inArray } from "drizzle-orm";
import crypto2 from "crypto";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async upsertUser(userData) {
        await db.insert(users).values(userData).onDuplicateKeyUpdate({
          set: { ...userData, updatedAt: /* @__PURE__ */ new Date() }
        });
        const [user] = await db.select().from(users).where(eq(users.email, userData.email));
        return user;
      }
      async createUserWithAuth(userData) {
        const id = crypto2.randomUUID();
        await db.insert(users).values({ ...userData, id });
        return id;
      }
      async updateUserLastLogin(id) {
        await db.update(users).set({ lastLogin: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
      }
      async verifyEmailToken(token) {
        const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
        if (!user) return false;
        await db.update(users).set({
          isEmailVerified: true,
          emailVerificationToken: null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, user.id));
        return true;
      }
      async setPasswordResetToken(userId, token, expires) {
        await db.update(users).set({
          passwordResetToken: token,
          passwordResetExpires: expires,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId));
      }
      async resetPassword(token, hashedPassword) {
        const [user] = await db.select().from(users).where(and(
          eq(users.passwordResetToken, token),
          sql2`${users.passwordResetExpires} > ${/* @__PURE__ */ new Date()}`
        ));
        if (!user) return false;
        await db.update(users).set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, user.id));
        return true;
      }
      // Student operations
      async getStudent(id) {
        const result = await db.select({
          id: students.id,
          userId: students.userId,
          gradeLevel: students.gradeLevel,
          schoolName: students.schoolName,
          yearGroupCode: students.yearGroupCode,
          dateOfBirth: students.dateOfBirth,
          address: students.address,
          learningGoals: students.learningGoals,
          notes: students.notes,
          parentId: students.parentId,
          tutorId: students.tutorId,
          companyId: students.companyId,
          yearId: students.yearId,
          termId: students.termId,
          classId: students.classId,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
          updatedByName: students.updatedByName,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            isActive: users.isActive,
            createdAt: users.createdAt
          }
        }).from(students).leftJoin(users, eq(students.userId, users.id)).where(eq(students.id, id)).limit(1);
        const row = result[0];
        if (!row) return void 0;
        const contacts = await db.select().from(studentContacts).where(eq(studentContacts.studentId, id));
        return {
          ...row,
          // snake_case aliases for frontend compat
          year_group_code: row.yearGroupCode,
          date_of_birth: row.dateOfBirth,
          school: row.schoolName,
          first_name: row.user?.firstName ?? null,
          last_name: row.user?.lastName ?? null,
          updated_at: row.updatedAt,
          updated_by_name: row.updatedByName,
          parents: contacts.map((c) => ({
            id: c.id,
            name: c.name,
            relationship: c.relationship,
            email: c.email,
            phone: c.phone,
            is_primary: c.isPrimary
          }))
        };
      }
      async getStudentByUserId(userId) {
        const [student] = await db.select().from(students).where(eq(students.userId, userId));
        return student;
      }
      async createStudent(studentData) {
        const id = crypto2.randomUUID();
        await db.insert(students).values({ ...studentData, id });
        const [student] = await db.select().from(students).where(eq(students.id, id));
        return student;
      }
      async updateStudent(id, updates) {
        const currentStudent = await this.getStudent(id);
        if (!currentStudent) {
          throw new Error("Student not found");
        }
        await db.update(students).set({
          ...updates,
          // Don't allow updating these fields
          id: void 0,
          userId: void 0
        }).where(eq(students.id, id));
        const updatedStudentWithUser = await this.getStudent(id);
        if (!updatedStudentWithUser) {
          throw new Error("Failed to retrieve updated student");
        }
        return updatedStudentWithUser;
      }
      async getStudentsByTutor(tutorId) {
        return await db.select().from(students).where(eq(students.tutorId, tutorId));
      }
      async getStudentsByParent(parentId) {
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
            email: users.email
          }
        }).from(students).leftJoin(users, eq(students.userId, users.id)).where(eq(students.parentId, parentId));
        return studentData;
      }
      // Parent operations
      async getParent(id) {
        const [parent] = await db.select().from(parents).where(eq(parents.id, id));
        return parent;
      }
      async getParentByUserId(userId) {
        const [parent] = await db.select().from(parents).where(eq(parents.userId, userId));
        return parent;
      }
      async createParent(parentData) {
        const id = crypto2.randomUUID();
        await db.insert(parents).values({ ...parentData, id });
        const [parent] = await db.select().from(parents).where(eq(parents.id, id));
        return parent;
      }
      async updateParent(id, updates) {
        await db.update(parents).set(updates).where(eq(parents.id, id));
        const [updated] = await db.select().from(parents).where(eq(parents.id, id));
        return updated;
      }
      async getParentUserByStudentId(studentId) {
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
          firstName: parentUser.firstName || "",
          lastName: parentUser.lastName || ""
        };
      }
      async getParentChildrenWithProgress(parentId) {
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
            profileImageUrl: users.profileImageUrl
          }
        }).from(students).leftJoin(users, eq(students.userId, users.id)).where(eq(students.parentId, parentId));
        const childrenWithProgress = await Promise.all(
          studentData.map(async (student) => {
            const enrolledClassesForInfo = await db.select({
              classId: studentClassAssignments.classId
            }).from(studentClassAssignments).where(and(
              eq(studentClassAssignments.studentId, student.id),
              eq(studentClassAssignments.isActive, true)
            ));
            const primaryClassId = student.classId || (enrolledClassesForInfo.length > 0 ? enrolledClassesForInfo[0].classId : null);
            let classInfo = null;
            if (primaryClassId) {
              const [classData] = await db.select({
                id: classes.id,
                name: classes.name,
                subject: classes.subject,
                description: classes.description,
                location: classes.location,
                startTime: classes.startTime,
                endTime: classes.endTime,
                daysOfWeek: classes.daysOfWeek,
                dayOfWeek: classes.dayOfWeek,
                maxStudents: classes.maxStudents
              }).from(classes).where(eq(classes.id, primaryClassId));
              classInfo = classData || null;
            }
            let tutorInfo = null;
            if (student.tutorId) {
              const tutorData = await db.select({
                id: tutors.id,
                userId: tutors.userId,
                specialization: tutors.specialization,
                qualifications: tutors.qualifications,
                branch: tutors.branch,
                subjectsTeaching: tutors.subjectsTeaching,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                profileImageUrl: users.profileImageUrl
              }).from(tutors).leftJoin(users, eq(tutors.userId, users.id)).where(eq(tutors.id, student.tutorId));
              tutorInfo = tutorData[0] || null;
            }
            let companyInfo = null;
            if (student.companyId) {
              const [companyData] = await db.select({
                id: tutoringCompanies.id,
                name: tutoringCompanies.name,
                description: tutoringCompanies.description,
                contactEmail: tutoringCompanies.contactEmail,
                contactPhone: tutoringCompanies.contactPhone,
                address: tutoringCompanies.address,
                tutorChatEnabled: tutoringCompanies.tutorChatEnabled
              }).from(tutoringCompanies).where(eq(tutoringCompanies.id, student.companyId));
              companyInfo = companyData || null;
            }
            const classIds = enrolledClassesForInfo.map((e) => e.classId);
            if (student.classId && !classIds.includes(student.classId)) {
              classIds.push(student.classId);
            }
            const studentAssignments = classIds.length > 0 ? await db.select({
              id: assignments.id,
              title: assignments.title,
              description: assignments.description,
              instructions: assignments.instructions,
              subject: assignments.subject,
              submissionDate: assignments.submissionDate,
              status: assignments.status,
              assignmentKind: assignments.assignmentKind,
              attachmentUrls: assignments.attachmentUrls,
              solutionText: assignments.solutionText,
              solutionNotes: assignments.solutionNotes,
              solutionFileUrls: assignments.solutionFileUrls,
              createdAt: assignments.createdAt,
              classId: assignments.classId
            }).from(assignments).where(inArray(assignments.classId, classIds)).orderBy(desc(assignments.createdAt)) : [];
            const classInfoMap = /* @__PURE__ */ new Map();
            if (classIds.length > 0) {
              const classRows = await db.select({ id: classes.id, name: classes.name, description: classes.description }).from(classes).where(inArray(classes.id, classIds));
              classRows.forEach((c) => classInfoMap.set(c.id, { name: c.name, description: c.description }));
            }
            const studentSubmissions = await db.select({
              id: submissions.id,
              assignmentId: submissions.assignmentId,
              status: submissions.status,
              submittedAt: submissions.submittedAt,
              isLate: submissions.isLate,
              score: submissions.score,
              feedback: submissions.feedback,
              gradedAt: submissions.gradedAt,
              fileUrls: submissions.fileUrls,
              documentUrl: submissions.documentUrl,
              reviewerAnnotations: submissions.reviewerAnnotations,
              parentComment: submissions.parentComment,
              parentCommentAt: submissions.parentCommentAt,
              createdAt: submissions.createdAt
            }).from(submissions).where(eq(submissions.studentId, student.id)).orderBy(desc(submissions.createdAt));
            const totalAssignments = studentAssignments.length;
            const submittedCount = studentSubmissions.filter((s) => s.status !== "draft").length;
            const gradedCount = studentSubmissions.filter((s) => s.status === "graded" || s.status === "parent_verified").length;
            const pendingCount = totalAssignments - submittedCount;
            const assignmentsWithStatus = studentAssignments.map((assignment) => {
              const submission = studentSubmissions.find((s) => s.assignmentId === assignment.id);
              const cls = assignment.classId ? classInfoMap.get(assignment.classId) : null;
              return {
                ...assignment,
                className: cls?.name ?? null,
                classDescription: cls?.description ?? null,
                submission: submission ? {
                  id: submission.id,
                  status: submission.status,
                  submittedAt: submission.submittedAt,
                  isLate: submission.isLate,
                  score: submission.score,
                  feedback: submission.feedback,
                  gradedAt: submission.gradedAt,
                  fileUrls: submission.fileUrls,
                  documentUrl: submission.documentUrl,
                  reviewerAnnotations: submission.reviewerAnnotations,
                  parentComment: submission.parentComment,
                  parentCommentAt: submission.parentCommentAt
                } : null,
                submissionStatus: submission?.status || "not_started"
              };
            });
            const pastTestAttempts = await db.select({
              id: testAttempts.id,
              testId: testAttempts.testId,
              status: testAttempts.status,
              totalScore: testAttempts.totalScore,
              percentageScore: testAttempts.percentageScore,
              isPassed: testAttempts.isPassed,
              feedback: testAttempts.feedback,
              submittedAt: testAttempts.submittedAt,
              gradedAt: testAttempts.gradedAt,
              testTitle: tests.title,
              testSubject: tests.subject,
              testTotalPoints: tests.totalPoints,
              testPassingScore: tests.passingScore
            }).from(testAttempts).leftJoin(tests, eq(testAttempts.testId, tests.id)).where(eq(testAttempts.studentId, student.id)).orderBy(desc(testAttempts.submittedAt));
            let upcomingTests = [];
            if (student.classId) {
              const now = /* @__PURE__ */ new Date();
              upcomingTests = await db.select({
                id: tests.id,
                title: tests.title,
                subject: tests.subject,
                description: tests.description,
                dueDate: tests.dueDate,
                duration: tests.duration,
                totalPoints: tests.totalPoints,
                passingScore: tests.passingScore
              }).from(tests).where(
                and(
                  eq(tests.classId, student.classId),
                  eq(tests.status, "published"),
                  gt(tests.dueDate, now)
                )
              ).orderBy(asc(tests.dueDate));
            }
            return {
              ...student,
              classInfo,
              tutorInfo,
              companyInfo,
              assignments: assignmentsWithStatus,
              submissions: studentSubmissions,
              testResults: pastTestAttempts,
              upcomingTests,
              progress: {
                totalAssignments,
                submittedCount,
                gradedCount,
                pendingCount,
                completionRate: totalAssignments > 0 ? Math.round(submittedCount / totalAssignments * 100) : 0
              }
            };
          })
        );
        return childrenWithProgress;
      }
      // Tutor operations
      async getTutor(id) {
        const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
        return tutor;
      }
      async getTutorByUserId(userId) {
        const [tutor] = await db.select().from(tutors).where(eq(tutors.userId, userId));
        return tutor;
      }
      async createTutor(tutorData) {
        const id = crypto2.randomUUID();
        await db.insert(tutors).values({ ...tutorData, id });
        const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
        return tutor;
      }
      async updateTutor(id, updates) {
        await db.update(tutors).set(updates).where(eq(tutors.id, id));
        const [updatedTutor] = await db.select().from(tutors).where(eq(tutors.id, id));
        return updatedTutor;
      }
      // Message operations
      async getMessage(id) {
        const [message] = await db.select().from(messages).where(eq(messages.id, id));
        return message;
      }
      async createMessage(messageData) {
        const id = crypto2.randomUUID();
        await db.insert(messages).values({ ...messageData, id });
        const [message] = await db.select().from(messages).where(eq(messages.id, id));
        return message;
      }
      async getMessagesBetweenUsers(senderId, receiverId) {
        return await db.select().from(messages).where(
          and(
            eq(messages.senderId, senderId),
            eq(messages.receiverId, receiverId)
          )
        ).orderBy(desc(messages.createdAt));
      }
      async markMessageAsRead(id) {
        await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
        const [message] = await db.select().from(messages).where(eq(messages.id, id));
        return message;
      }
      // Progress operations
      async getProgress(id) {
        const [progressRecord] = await db.select().from(progress).where(eq(progress.id, id));
        return progressRecord;
      }
      async createProgress(progressData) {
        const id = crypto2.randomUUID();
        await db.insert(progress).values({ ...progressData, id });
        const [progressRecord] = await db.select().from(progress).where(eq(progress.id, id));
        return progressRecord;
      }
      async getProgressByStudent(studentId) {
        return await db.select().from(progress).where(eq(progress.studentId, studentId)).orderBy(desc(progress.updatedAt));
      }
      async updateProgress(id, updates) {
        await db.update(progress).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(progress.id, id));
        const [progressRecord] = await db.select().from(progress).where(eq(progress.id, id));
        return progressRecord;
      }
      // Calendar operations
      async getCalendarEvent(id) {
        const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
        return event;
      }
      async createCalendarEvent(eventData) {
        const id = crypto2.randomUUID();
        await db.insert(calendarEvents).values({ ...eventData, id });
        const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
        return event;
      }
      async getCalendarEventsByTutor(tutorId) {
        return await db.select().from(calendarEvents).where(eq(calendarEvents.tutorId, tutorId)).orderBy(calendarEvents.startTime);
      }
      async getCalendarEventsByStudent(studentId) {
        return await db.select().from(calendarEvents).where(eq(calendarEvents.studentId, studentId)).orderBy(calendarEvents.startTime);
      }
      // Company operations
      async getTutoringCompany(id) {
        const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
        return company;
      }
      async getCompany(id) {
        const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
        return company;
      }
      async getAllCompanies() {
        return await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.isActive, true)).orderBy(tutoringCompanies.name);
      }
      async getTutoringCompanyById(id) {
        const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
        return company;
      }
      async getCompanyUsersByCompanyId(companyId) {
        try {
          const companyTutors = await db.select({
            user: users
          }).from(tutors).innerJoin(users, eq(tutors.userId, users.id)).where(eq(tutors.companyId, companyId));
          const companyAdminsQuery = await db.select({
            user: users
          }).from(companyAdmins).innerJoin(users, eq(companyAdmins.userId, users.id)).where(eq(companyAdmins.companyId, companyId));
          const companyStudents = await db.select({
            user: users
          }).from(students).innerJoin(users, eq(students.userId, users.id)).innerJoin(tutors, eq(students.tutorId, tutors.id)).where(eq(tutors.companyId, companyId));
          const companyParents = await db.select({
            user: users
          }).from(parents).innerJoin(users, eq(parents.userId, users.id)).innerJoin(students, eq(parents.id, students.parentId)).innerJoin(tutors, eq(students.tutorId, tutors.id)).where(eq(tutors.companyId, companyId));
          const allUsers = [
            ...companyTutors.map((t) => t.user),
            ...companyAdminsQuery.map((ca) => ca.user),
            ...companyStudents.map((s) => s.user),
            ...companyParents.map((p) => p.user)
          ];
          const uniqueUsers = allUsers.reduce((acc, user) => {
            if (!acc.find((u) => u.id === user.id)) {
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
      async getCompanyStudentsByCompanyId(companyId) {
        try {
          const companyStudents = await db.select().from(students).innerJoin(users, eq(students.userId, users.id)).leftJoin(classes, eq(students.classId, classes.id)).leftJoin(tutors, eq(students.tutorId, tutors.id)).where(
            and(
              eq(students.companyId, companyId),
              eq(users.isDeleted, false),
              eq(users.isActive, true)
            )
          ).orderBy(users.firstName, users.lastName);
          const tutorUserIds = companyStudents.filter((row) => row.tutors?.userId).map((row) => row.tutors.userId);
          const tutorUsers = tutorUserIds.length > 0 ? await db.select().from(users).where(inArray(users.id, tutorUserIds)) : [];
          const tutorUserMap = new Map(tutorUsers.map((u) => [u.id, u]));
          const studentIds = companyStudents.map((row) => row.students.id);
          const classEnrollments = studentIds.length > 0 ? await db.select().from(studentClassAssignments).innerJoin(classes, eq(studentClassAssignments.classId, classes.id)).where(
            and(
              inArray(studentClassAssignments.studentId, studentIds),
              eq(studentClassAssignments.isActive, true)
            )
          ) : [];
          const enrollmentMap = /* @__PURE__ */ new Map();
          for (const enrollment of classEnrollments) {
            const studentId = enrollment.student_class_assignments.studentId;
            if (!enrollmentMap.has(studentId)) {
              enrollmentMap.set(studentId, enrollment.classes);
            }
          }
          const allStudentIds = companyStudents.map((row) => row.students.id);
          const contactRows = allStudentIds.length > 0 ? await db.select().from(studentContacts).where(inArray(studentContacts.studentId, allStudentIds)) : [];
          const contactsByStudentId = /* @__PURE__ */ new Map();
          for (const c of contactRows) {
            const existing = contactsByStudentId.get(c.studentId) ?? [];
            existing.push(c);
            contactsByStudentId.set(c.studentId, existing);
          }
          return companyStudents.map((row) => {
            const tutorUser = row.tutors?.userId ? tutorUserMap.get(row.tutors.userId) : null;
            let classInfo = row.classes ? {
              id: row.classes.id,
              name: row.classes.name,
              academicYearId: row.classes.academicYearId
            } : null;
            if (!classInfo && enrollmentMap.has(row.students.id)) {
              const enrolledClass = enrollmentMap.get(row.students.id);
              classInfo = {
                id: enrolledClass.id,
                name: enrolledClass.name,
                academicYearId: enrolledClass.academicYearId
              };
            }
            const contacts = contactsByStudentId.get(row.students.id) ?? [];
            return {
              id: row.students.id,
              userId: row.students.userId,
              gradeLevel: row.students.gradeLevel,
              yearGroupCode: row.students.yearGroupCode,
              schoolName: row.students.schoolName,
              dateOfBirth: row.students.dateOfBirth,
              address: row.students.address,
              learningGoals: row.students.learningGoals,
              notes: row.students.notes,
              parentId: row.students.parentId,
              tutorId: row.students.tutorId,
              companyId: row.students.companyId,
              classId: row.students.classId,
              // Expose as year_group_code, school, date_of_birth for company/Students.tsx
              year_group_code: row.students.yearGroupCode,
              school: row.students.schoolName,
              date_of_birth: row.students.dateOfBirth,
              parents: contacts.map((c) => ({
                id: c.id,
                name: c.name,
                relationship: c.relationship,
                email: c.email,
                phone: c.phone,
                is_primary: c.isPrimary
              })),
              user: {
                id: row.users.id,
                email: row.users.email,
                firstName: row.users.firstName,
                lastName: row.users.lastName,
                isActive: row.users.isActive,
                createdAt: row.users.createdAt
              },
              // Legacy compat fields
              first_name: row.users.firstName,
              last_name: row.users.lastName,
              updated_at: row.students.updatedAt,
              updated_by_name: row.students.updatedByName,
              class: classInfo,
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
      async createStudentWithContacts(data) {
        const { contacts, ...studentData } = data;
        const id = crypto2.randomUUID();
        await db.insert(students).values({ ...studentData, id });
        const [student] = await db.select().from(students).where(eq(students.id, id));
        if (contacts && contacts.length > 0) {
          await db.insert(studentContacts).values(
            contacts.map((c) => ({ ...c, studentId: id }))
          );
        }
        return student;
      }
      async updateStudentWithContacts(studentId, data, contacts, userId) {
        const { firstName, lastName, ...studentFields } = data;
        if (firstName !== void 0 || lastName !== void 0) {
          const student = await db.select({ userId: students.userId }).from(students).where(eq(students.id, studentId)).limit(1);
          if (student[0]?.userId) {
            await db.update(users).set({
              ...firstName !== void 0 ? { firstName } : {},
              ...lastName !== void 0 ? { lastName } : {}
            }).where(eq(users.id, student[0].userId));
          }
        }
        await db.update(students).set(studentFields).where(eq(students.id, studentId));
        if (contacts !== void 0) {
          await db.delete(studentContacts).where(eq(studentContacts.studentId, studentId));
          if (contacts.length > 0) {
            await db.insert(studentContacts).values(contacts.map((c) => ({ ...c, studentId })));
          }
        }
        return this.getStudent(studentId);
      }
      async getCoursesByCompany(companyId) {
        const rows = await db.select().from(courses).where(eq(courses.companyId, companyId)).orderBy(courses.name);
        const ids = rows.map((r) => r.id);
        const subjectRows = ids.length > 0 ? await db.select().from(courseSubjects).where(inArray(courseSubjects.courseId, ids)) : [];
        const byId = /* @__PURE__ */ new Map();
        for (const s of subjectRows) {
          const arr = byId.get(s.courseId) ?? [];
          arr.push(s.subjectId);
          byId.set(s.courseId, arr);
        }
        return rows.map((r) => ({ ...r, subjectIds: byId.get(r.id) ?? [] }));
      }
      async getCourseById(id, companyId) {
        const [row] = await db.select().from(courses).where(and(eq(courses.id, id), eq(courses.companyId, companyId)));
        if (!row) return null;
        const subjectRows = await db.select().from(courseSubjects).where(eq(courseSubjects.courseId, id));
        return { ...row, subjectIds: subjectRows.map((s) => s.subjectId) };
      }
      async updateCourse(id, companyId, data) {
        const { subjectIds, ...fields } = data;
        if (Object.keys(fields).length > 0) {
          await db.update(courses).set(fields).where(and(eq(courses.id, id), eq(courses.companyId, companyId)));
        }
        if (subjectIds !== void 0) {
          await db.delete(courseSubjects).where(eq(courseSubjects.courseId, id));
          if (subjectIds.length > 0) {
            await db.insert(courseSubjects).values(subjectIds.map((sid) => ({ courseId: id, subjectId: sid })));
          }
        }
        return this.getCourseById(id, companyId);
      }
      async createCourse(data) {
        const { subjectIds, ...courseData } = data;
        const id = crypto2.randomUUID();
        await db.insert(courses).values({ ...courseData, id });
        const [course] = await db.select().from(courses).where(eq(courses.id, id));
        if (subjectIds && subjectIds.length > 0) {
          await db.insert(courseSubjects).values(subjectIds.map((sid) => ({ courseId: id, subjectId: sid })));
        }
        return { ...course, subjectIds: subjectIds ?? [] };
      }
      async createClassWithSubjects(classData, subjectIds) {
        const id = crypto2.randomUUID();
        await db.insert(classes).values({ ...classData, id });
        const [newClass] = await db.select().from(classes).where(eq(classes.id, id));
        if (subjectIds.length > 0) {
          await db.insert(classSubjects).values(
            subjectIds.map((sid, i) => ({ classId: id, subjectId: sid, isPrimary: i === 0 }))
          );
        }
        return newClass;
      }
      async getClassesWithDetailsForCompany(companyId) {
        const classList = await db.select({
          id: classes.id,
          name: classes.name,
          companyId: classes.companyId,
          termId: classes.termId,
          tutorId: classes.tutorId,
          courseId: classes.courseId,
          yearGroupCode: classes.yearGroupCode,
          level: classes.level,
          status: classes.status,
          location: classes.location,
          startTime: classes.startTime,
          endTime: classes.endTime,
          dayOfWeek: classes.dayOfWeek,
          description: classes.description,
          maxStudents: classes.maxStudents,
          createdAt: classes.createdAt
        }).from(classes).where(and(eq(classes.companyId, companyId), eq(classes.isActive, true))).orderBy(classes.name);
        if (classList.length === 0) return [];
        const classIds = classList.map((c) => c.id);
        const tutorIds = Array.from(new Set(classList.map((c) => c.tutorId).filter(Boolean)));
        const termIds = Array.from(new Set(classList.map((c) => c.termId)));
        const [subjectRows, tutorRows, termRows] = await Promise.all([
          db.select().from(classSubjects).where(inArray(classSubjects.classId, classIds)),
          tutorIds.length > 0 ? db.select({ id: tutors.id, userId: tutors.userId }).from(tutors).where(inArray(tutors.id, tutorIds)) : Promise.resolve([]),
          db.select({ id: academicTerms.id, academicYearId: academicTerms.academicYearId }).from(academicTerms).where(inArray(academicTerms.id, termIds))
        ]);
        const tutorUserIds = tutorRows.map((t) => t.userId);
        const tutorUsers = tutorUserIds.length > 0 ? await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(inArray(users.id, tutorUserIds)) : [];
        const tutorUserMap = new Map(tutorUsers.map((u) => [u.id, u]));
        const tutorMap = new Map(tutorRows.map((t) => ({ ...t, user: tutorUserMap.get(t.userId) })).map((t) => [t.id, t]));
        const yearIds = Array.from(new Set(termRows.map((t) => t.academicYearId)));
        const yearRows = yearIds.length > 0 ? await db.select({ id: academicYears.id, year: academicYears.yearNumber, name: academicYears.name }).from(academicYears).where(inArray(academicYears.id, yearIds)) : [];
        const yearMap = new Map(yearRows.map((y) => [y.id, y]));
        const termYearMap = new Map(termRows.map((t) => [t.id, yearMap.get(t.academicYearId)]));
        const subjectsByClass = /* @__PURE__ */ new Map();
        for (const s of subjectRows) {
          const arr = subjectsByClass.get(s.classId) ?? [];
          arr.push({ id: s.subjectId, isPrimary: s.isPrimary });
          subjectsByClass.set(s.classId, arr);
        }
        const SUBJECTS = [
          { id: 1, code: "ENG", name: "English" },
          { id: 2, code: "MATH", name: "Mathematics" },
          { id: 3, code: "READ", name: "Reading" },
          { id: 4, code: "SCI", name: "Science" },
          { id: 5, code: "THINK", name: "Thinking Skills" },
          { id: 6, code: "WRITE", name: "Writing" }
        ];
        const subjectById = new Map(SUBJECTS.map((s) => [s.id, s]));
        return classList.map((c) => {
          const tutor = c.tutorId ? tutorMap.get(c.tutorId) : null;
          const academicYear = termYearMap.get(c.termId);
          const subs = subjectsByClass.get(c.id) ?? [];
          const subjects = subs.map((s) => ({ ...subjectById.get(s.id), pivot: { is_primary: s.isPrimary } })).filter((s) => s.id);
          const primarySub = subs.find((s) => s.isPrimary);
          return {
            id: c.id,
            name: c.name,
            business_id: c.companyId,
            tutor_id: c.tutorId,
            course_id: c.courseId,
            year_group_code: c.yearGroupCode,
            level: c.level,
            status: c.status,
            location: c.location,
            description: c.description,
            yearGroup: c.yearGroupCode ? { id: 0, label: c.yearGroupCode, code: c.yearGroupCode } : void 0,
            subjects,
            subject: primarySub ? subjectById.get(primarySub.id) : void 0,
            tutor: tutor ? { id: tutor.id, user: tutor.user } : void 0,
            academicYear: academicYear ?? void 0
          };
        });
      }
      async getClassDetailById(classId, companyId) {
        const SUBJECTS = [
          { id: 1, code: "ENG", name: "English" },
          { id: 2, code: "MATH", name: "Mathematics" },
          { id: 3, code: "READ", name: "Reading" },
          { id: 4, code: "SCI", name: "Science" },
          { id: 5, code: "THINK", name: "Thinking Skills" },
          { id: 6, code: "WRITE", name: "Writing" }
        ];
        const subjectById = new Map(SUBJECTS.map((s) => [s.id, s]));
        const [cls] = await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.companyId, companyId), eq(classes.isActive, true)));
        if (!cls) return null;
        const [term, subjectRows, enrollmentRows] = await Promise.all([
          db.select().from(academicTerms).where(eq(academicTerms.id, cls.termId)).then((r) => r[0] ?? null),
          db.select().from(classSubjects).where(eq(classSubjects.classId, classId)),
          db.select().from(studentClassAssignments).where(and(eq(studentClassAssignments.classId, classId), eq(studentClassAssignments.isActive, true)))
        ]);
        const academicYear = term ? await db.select().from(academicYears).where(eq(academicYears.id, term.academicYearId)).then((r) => r[0] ?? null) : null;
        const course = cls.courseId ? await db.select().from(courses).where(eq(courses.id, cls.courseId)).then((r) => r[0] ?? null) : null;
        let tutorDetail = null;
        if (cls.tutorId) {
          const [tRow] = await db.select({ id: tutors.id, userId: tutors.userId }).from(tutors).where(eq(tutors.id, cls.tutorId));
          if (tRow) {
            const [uRow] = await db.select({ email: users.email, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, tRow.userId));
            tutorDetail = { id: tRow.id, user: uRow ?? void 0 };
          }
        }
        const studentIds = enrollmentRows.map((e) => e.studentId);
        const studentDetails = studentIds.length > 0 ? await db.select({
          id: students.id,
          userId: students.userId,
          yearGroupCode: students.yearGroupCode,
          schoolName: students.schoolName,
          createdAt: students.createdAt
        }).from(students).where(inArray(students.id, studentIds)) : [];
        const studentUserIds = studentDetails.map((s) => s.userId);
        const studentUsers = studentUserIds.length > 0 ? await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(inArray(users.id, studentUserIds)) : [];
        const studentUserMap = new Map(studentUsers.map((u) => [u.id, u]));
        const enrollmentMap = new Map(enrollmentRows.map((e) => [e.studentId, e]));
        const studentList = studentDetails.map((s) => {
          const u = studentUserMap.get(s.userId);
          const enrl = enrollmentMap.get(s.id);
          return {
            id: s.id,
            first_name: u?.firstName ?? null,
            last_name: u?.lastName ?? null,
            year_group_code: s.yearGroupCode ?? null,
            school: s.schoolName ?? null,
            user: u ?? null,
            pivot: enrl?.assignedDate ? { enrolled_at: enrl.assignedDate.toISOString() } : void 0
          };
        });
        const subjects = subjectRows.map((s) => ({
          ...subjectById.get(s.subjectId),
          pivot: { is_primary: s.isPrimary }
        })).filter((s) => s.id);
        const primarySub = subjectRows.find((s) => s.isPrimary);
        return {
          id: cls.id,
          business_id: cls.companyId,
          course_id: cls.courseId ?? null,
          tutor_id: cls.tutorId ?? null,
          academic_year_id: academicYear?.id ?? null,
          year_group_id: cls.yearGroupCode ?? null,
          subject_id: primarySub?.subjectId ?? null,
          name: cls.name,
          starts_on: term?.startDate ? term.startDate.toISOString().slice(0, 10) : null,
          ends_on: term?.endDate ? term.endDate.toISOString().slice(0, 10) : null,
          capacity: cls.maxStudents ?? null,
          status: cls.status ?? "draft",
          description: cls.description ?? null,
          level: cls.level ?? null,
          schedule_day_of_week: cls.dayOfWeek ?? null,
          schedule_start_time: cls.startTime || null,
          schedule_end_time: cls.endTime || null,
          location: cls.location ?? null,
          course: course ? { id: course.id, name: course.name, description: course.description } : null,
          subject: primarySub ? subjectById.get(primarySub.subjectId) ?? null : null,
          subjects,
          yearGroup: cls.yearGroupCode ? { id: 0, label: cls.yearGroupCode, code: cls.yearGroupCode } : null,
          tutor: tutorDetail,
          academicYear: academicYear ? { id: academicYear.id, year: academicYear.yearNumber } : null,
          terms: term ? [{ id: term.id, name: term.name, start_date: term.startDate?.toISOString().slice(0, 10) ?? "", end_date: term.endDate?.toISOString().slice(0, 10) ?? "" }] : [],
          students: studentList
        };
      }
      async createTutoringCompany(companyData) {
        const id = crypto2.randomUUID();
        await db.insert(tutoringCompanies).values({ ...companyData, id });
        const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
        return company;
      }
      async getAllTutoringCompanies() {
        return await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.isActive, true)).orderBy(tutoringCompanies.name);
      }
      async updateTutoringCompany(id, updates) {
        await db.update(tutoringCompanies).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tutoringCompanies.id, id));
        const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, id));
        return company;
      }
      // Company Admin operations
      async getCompanyAdmin(id) {
        const [admin] = await db.select().from(companyAdmins).where(eq(companyAdmins.id, id));
        return admin;
      }
      async getCompanyAdminByUserId(userId) {
        const [admin] = await db.select().from(companyAdmins).where(eq(companyAdmins.userId, userId));
        return admin;
      }
      async createCompanyAdmin(adminData) {
        const id = crypto2.randomUUID();
        await db.insert(companyAdmins).values({ ...adminData, id });
        const [admin] = await db.select().from(companyAdmins).where(eq(companyAdmins.id, id));
        return admin;
      }
      async updateCompanyAdmin(id, updates) {
        await db.update(companyAdmins).set(updates).where(eq(companyAdmins.id, id));
        const [updatedAdmin] = await db.select().from(companyAdmins).where(eq(companyAdmins.id, id));
        return updatedAdmin;
      }
      async getTutorsByCompany(companyId) {
        try {
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
          }).from(tutors).innerJoin(users, eq(tutors.userId, users.id)).where(and(eq(tutors.companyId, companyId), eq(users.isDeleted, false))).orderBy(users.firstName, users.lastName);
          const tutorIds = companyTutors.map((t) => t.id);
          const upcomingSessions = tutorIds.length > 0 ? await db.select({
            tutorId: classSessions.tutorId,
            className: classes.name,
            sessionDate: classSessions.sessionDate,
            startTime: classSessions.startTime,
            endTime: classSessions.endTime
          }).from(classSessions).innerJoin(classes, eq(classSessions.classId, classes.id)).where(
            and(
              inArray(classSessions.tutorId, tutorIds),
              sql2`${classSessions.sessionDate} >= CURRENT_DATE`,
              eq(classSessions.status, "scheduled")
            )
          ).orderBy(classSessions.sessionDate, classSessions.startTime) : [];
          const studentCounts = tutorIds.length > 0 ? await db.select({
            tutorId: students.tutorId,
            count: sql2`count(*)`.as("count")
          }).from(students).innerJoin(users, eq(students.userId, users.id)).where(
            and(
              inArray(students.tutorId, tutorIds),
              eq(users.isDeleted, false),
              eq(users.isActive, true)
            )
          ).groupBy(students.tutorId) : [];
          const studentCountMap = new Map(studentCounts.map((sc) => [sc.tutorId, Number(sc.count)]));
          const tutorSchedulesMap = /* @__PURE__ */ new Map();
          for (const session2 of upcomingSessions) {
            if (!session2.tutorId) continue;
            if (!tutorSchedulesMap.has(session2.tutorId)) {
              tutorSchedulesMap.set(session2.tutorId, /* @__PURE__ */ new Set());
            }
            const dayOfWeek = new Date(session2.sessionDate).toLocaleDateString("en-US", { weekday: "long" });
            const scheduleKey = `${session2.className}|${dayOfWeek}|${session2.startTime}|${session2.endTime}`;
            tutorSchedulesMap.get(session2.tutorId).add(scheduleKey);
          }
          return companyTutors.map((tutor) => {
            const scheduleSet = tutorSchedulesMap.get(tutor.id);
            const schedules = scheduleSet ? Array.from(scheduleSet).map((key) => {
              const [className, dayOfWeek, startTime, endTime] = key.split("|");
              return { className, dayOfWeek, startTime, endTime };
            }) : [];
            return {
              id: tutor.id,
              userId: tutor.userId,
              companyId: tutor.companyId,
              firstName: tutor.user.firstName,
              lastName: tutor.user.lastName,
              email: tutor.user.email,
              specialization: tutor.specialization,
              qualifications: tutor.qualifications,
              isVerified: tutor.isVerified,
              status: tutor.user.isActive ? "active" : "invited",
              complianceStatus: tutor.isVerified ? "compliant" : "pending_compliance",
              schedules,
              studentCount: studentCountMap.get(tutor.id) || 0
            };
          });
        } catch (error) {
          console.error("Error fetching company tutors:", error);
          return [];
        }
      }
      async getTutorById(tutorId, companyId) {
        const [row] = await db.select({
          id: tutors.id,
          userId: tutors.userId,
          specialization: tutors.specialization,
          qualifications: tutors.qualifications,
          availability: tutors.availability,
          branch: tutors.branch,
          isVerified: tutors.isVerified,
          companyId: tutors.companyId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          isActive: users.isActive
        }).from(tutors).innerJoin(users, eq(tutors.userId, users.id)).where(and(eq(tutors.id, tutorId), eq(tutors.companyId, companyId)));
        if (!row) return null;
        return {
          ...row,
          status: row.isActive ? "active" : "invited",
          complianceStatus: row.isVerified ? "compliant" : "pending_compliance"
        };
      }
      async updateTutorProfile(tutorId, companyId, data) {
        const [tutor] = await db.select().from(tutors).where(and(eq(tutors.id, tutorId), eq(tutors.companyId, companyId)));
        if (!tutor) return null;
        const { firstName, lastName, ...tutorFields } = data;
        if (firstName !== void 0 || lastName !== void 0) {
          const userUpdates = { updatedAt: /* @__PURE__ */ new Date() };
          if (firstName !== void 0) userUpdates.firstName = firstName;
          if (lastName !== void 0) userUpdates.lastName = lastName;
          await db.update(users).set(userUpdates).where(eq(users.id, tutor.userId));
        }
        const tutorUpdates = {};
        if (tutorFields.specialization !== void 0) tutorUpdates.specialization = tutorFields.specialization;
        if (tutorFields.qualifications !== void 0) tutorUpdates.qualifications = tutorFields.qualifications;
        if (tutorFields.availability !== void 0) tutorUpdates.availability = tutorFields.availability;
        if (tutorFields.branch !== void 0) tutorUpdates.branch = tutorFields.branch;
        if (Object.keys(tutorUpdates).length > 0) {
          await db.update(tutors).set(tutorUpdates).where(and(eq(tutors.id, tutorId), eq(tutors.companyId, companyId)));
        }
        return this.getTutorById(tutorId, companyId);
      }
      // Admin user management methods
      async getAllUsers() {
        return await db.select().from(users).where(eq(users.isDeleted, false)).orderBy(desc(users.createdAt));
      }
      async getDeletedUsers() {
        return await db.select().from(users).where(eq(users.isDeleted, true)).orderBy(desc(users.deletedAt));
      }
      async getUsersByRole(role) {
        return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
      }
      async createUserWithRole(userData) {
        const id = crypto2.randomUUID();
        await db.insert(users).values({
          id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          isActive: userData.isActive ?? true
        });
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async updateUser(id, updates) {
        await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      // Company status operations
      async updateCompanyStatus(companyId, isActive) {
        await db.update(tutoringCompanies).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tutoringCompanies.id, companyId));
      }
      // Soft delete user and clean up related records
      async deleteUser(userId, deletedBy) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        try {
          if (user.role === "student") {
            const student = await this.getStudentByUserId(userId);
            if (student) {
              await db.delete(progress).where(eq(progress.studentId, student.id));
              await db.delete(calendarEvents).where(eq(calendarEvents.studentId, student.id));
              await db.delete(students).where(eq(students.id, student.id));
            }
          } else if (user.role === "tutor") {
            const tutor = await this.getTutorByUserId(userId);
            if (tutor) {
              await db.update(students).set({ tutorId: null }).where(eq(students.tutorId, tutor.id));
              await db.delete(calendarEvents).where(eq(calendarEvents.tutorId, tutor.id));
              await db.delete(tutors).where(eq(tutors.id, tutor.id));
            }
          } else if (user.role === "parent") {
            const parent = await this.getParentByUserId(userId);
            if (parent) {
              await db.update(students).set({ parentId: null }).where(eq(students.parentId, parent.id));
              await db.delete(parents).where(eq(parents.id, parent.id));
            }
          } else if (user.role === "company_admin") {
            const companyAdmin = await this.getCompanyAdminByUserId(userId);
            if (companyAdmin) {
              await db.delete(companyAdmins).where(eq(companyAdmins.id, companyAdmin.id));
            }
          }
          await db.delete(messages).where(eq(messages.senderId, userId));
          await db.delete(messages).where(eq(messages.receiverId, userId));
          await db.update(users).set({
            isDeleted: true,
            deletedAt: /* @__PURE__ */ new Date(),
            deletedBy,
            isActive: false,
            email: `deleted_${userId}@deleted.com`,
            // Change email to avoid conflicts
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, userId));
        } catch (error) {
          console.error("Detailed error during user deletion:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Failed to delete user: ${errorMessage}`);
        }
      }
      // User status operations
      async updateUserStatus(userId, isActive) {
        await db.update(users).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      // Tutor assignment operations
      async assignTutorToCompany(tutorId, companyId) {
        await db.update(tutors).set({ companyId }).where(eq(tutors.id, tutorId));
      }
      async unassignTutorFromCompany(tutorId) {
        await db.update(tutors).set({ companyId: null }).where(eq(tutors.id, tutorId));
      }
      async getUnassignedTutors() {
        const tutorData = await db.select({
          id: tutors.id,
          userId: tutors.userId,
          specialization: tutors.specialization,
          qualifications: tutors.qualifications,
          isVerified: tutors.isVerified,
          user: {
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName
          }
        }).from(tutors).leftJoin(users, eq(tutors.userId, users.id)).where(isNull(tutors.companyId));
        return tutorData;
      }
      // Academic management methods implementation
      // Academic Years
      async createAcademicYear(academicYear) {
        const id = crypto2.randomUUID();
        await db.insert(academicYears).values({ ...academicYear, id });
        const [year] = await db.select().from(academicYears).where(eq(academicYears.id, id));
        return year;
      }
      async getAcademicYearsByCompany(companyId) {
        return await db.select().from(academicYears).where(and(eq(academicYears.companyId, companyId), eq(academicYears.isActive, true))).orderBy(academicYears.yearNumber);
      }
      async getAcademicYear(id) {
        const [year] = await db.select().from(academicYears).where(eq(academicYears.id, id));
        return year;
      }
      async updateAcademicYear(id, updates) {
        await db.update(academicYears).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(academicYears.id, id));
        const [year] = await db.select().from(academicYears).where(eq(academicYears.id, id));
        return year;
      }
      async deleteAcademicYear(id) {
        await db.update(academicYears).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(academicYears.id, id));
      }
      // Academic Terms
      async createAcademicTerm(term) {
        const id = crypto2.randomUUID();
        await db.insert(academicTerms).values({ ...term, id });
        const [newTerm] = await db.select().from(academicTerms).where(eq(academicTerms.id, id));
        return newTerm;
      }
      async getAcademicTermsByYear(academicYearId) {
        return await db.select().from(academicTerms).where(and(eq(academicTerms.academicYearId, academicYearId), eq(academicTerms.isActive, true))).orderBy(academicTerms.startDate);
      }
      async getAcademicTermsByCompany(companyId) {
        return await db.select().from(academicTerms).where(and(eq(academicTerms.companyId, companyId), eq(academicTerms.isActive, true))).orderBy(academicTerms.startDate);
      }
      async getAcademicTerm(id) {
        const [term] = await db.select().from(academicTerms).where(eq(academicTerms.id, id));
        return term;
      }
      async updateAcademicTerm(id, updates) {
        await db.update(academicTerms).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(academicTerms.id, id));
        const [term] = await db.select().from(academicTerms).where(eq(academicTerms.id, id));
        return term;
      }
      async deleteAcademicTerm(id) {
        await db.update(academicTerms).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(academicTerms.id, id));
      }
      async permanentlyDeleteAcademicTerm(id) {
        const termAssignments = await db.select().from(assignments).where(eq(assignments.termId, id));
        for (const assignment of termAssignments) {
          await db.delete(submissions).where(eq(submissions.assignmentId, assignment.id));
        }
        await db.delete(assignments).where(eq(assignments.termId, id));
        const termClasses = await db.select().from(classes).where(eq(classes.termId, id));
        for (const classItem of termClasses) {
          const classSess = await db.select().from(classSessions).where(eq(classSessions.classId, classItem.id));
          for (const session2 of classSess) {
            await db.delete(sessionAttendance).where(eq(sessionAttendance.sessionId, session2.id));
          }
          await db.delete(classSessions).where(eq(classSessions.classId, classItem.id));
          await db.delete(studentClassAssignments).where(eq(studentClassAssignments.classId, classItem.id));
        }
        await db.delete(classes).where(eq(classes.termId, id));
        await db.delete(academicTerms).where(eq(academicTerms.id, id));
      }
      // Academic Weeks
      async createAcademicWeek(week) {
        const id = crypto2.randomUUID();
        await db.insert(academicWeeks).values({ ...week, id });
        const [newWeek] = await db.select().from(academicWeeks).where(eq(academicWeeks.id, id));
        return newWeek;
      }
      async getAcademicWeeksByTerm(termId) {
        return await db.select().from(academicWeeks).where(eq(academicWeeks.termId, termId)).orderBy(academicWeeks.weekNumber);
      }
      async deleteAcademicWeeksByTerm(termId) {
        await db.delete(academicWeeks).where(eq(academicWeeks.termId, termId));
      }
      // Classes
      async createClass(classData) {
        const id = crypto2.randomUUID();
        await db.insert(classes).values({ ...classData, id });
        const [newClass] = await db.select().from(classes).where(eq(classes.id, id));
        return newClass;
      }
      async getClassesByTerm(termId) {
        return await db.select().from(classes).where(and(eq(classes.termId, termId), eq(classes.isActive, true))).orderBy(classes.name);
      }
      async getClassesByCompany(companyId) {
        return await db.select().from(classes).where(and(eq(classes.companyId, companyId), eq(classes.isActive, true))).orderBy(classes.name);
      }
      async getClassesByTutor(tutorId) {
        return await db.select().from(classes).where(and(eq(classes.tutorId, tutorId), eq(classes.isActive, true))).orderBy(classes.name);
      }
      async getClass(id) {
        const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
        return classItem;
      }
      async updateClass(id, updates) {
        await db.update(classes).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(classes.id, id));
        const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
        return classItem;
      }
      async deleteClass(id) {
        await db.update(classes).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(classes.id, id));
      }
      async permanentlyDeleteClass(id) {
        const classAssignments = await db.select().from(assignments).where(eq(assignments.classId, id));
        for (const assignment of classAssignments) {
          await db.delete(submissions).where(eq(submissions.assignmentId, assignment.id));
        }
        await db.delete(assignments).where(eq(assignments.classId, id));
        await db.delete(studentClassAssignments).where(eq(studentClassAssignments.classId, id));
        const classSess = await db.select().from(classSessions).where(eq(classSessions.classId, id));
        for (const session2 of classSess) {
          await db.delete(sessionAttendance).where(eq(sessionAttendance.sessionId, session2.id));
        }
        await db.delete(classSessions).where(eq(classSessions.classId, id));
        await db.delete(classes).where(eq(classes.id, id));
      }
      // Student Class Assignments
      async assignStudentToClass(assignment) {
        const id = crypto2.randomUUID();
        await db.insert(studentClassAssignments).values({ ...assignment, id });
        const [newAssignment] = await db.select().from(studentClassAssignments).where(eq(studentClassAssignments.id, id));
        return newAssignment;
      }
      async getStudentsByClass(classId) {
        return await db.select().from(studentClassAssignments).where(and(eq(studentClassAssignments.classId, classId), eq(studentClassAssignments.isActive, true))).orderBy(studentClassAssignments.assignedDate);
      }
      async getClassesByStudent(studentId) {
        return await db.select().from(studentClassAssignments).where(and(eq(studentClassAssignments.studentId, studentId), eq(studentClassAssignments.isActive, true))).orderBy(studentClassAssignments.assignedDate);
      }
      async getEnrolledClassesWithDetails(studentId) {
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
          termId: classes.termId
        }).from(studentClassAssignments).innerJoin(classes, eq(studentClassAssignments.classId, classes.id)).where(and(
          eq(studentClassAssignments.studentId, studentId),
          eq(studentClassAssignments.isActive, true),
          eq(classes.isActive, true)
        ));
        const classesWithTutors = await Promise.all(result.map(async (classInfo) => {
          let tutorName = void 0;
          if (classInfo.tutorId) {
            const tutor = await this.getTutor(classInfo.tutorId);
            if (tutor) {
              const tutorUser = await this.getUser(tutor.userId);
              if (tutorUser) {
                tutorName = `${tutorUser.firstName} ${tutorUser.lastName}`;
              }
            }
          }
          return { ...classInfo, tutorName };
        }));
        return classesWithTutors;
      }
      async removeStudentFromClass(studentId, classId) {
        await db.update(studentClassAssignments).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(studentClassAssignments.studentId, studentId),
          eq(studentClassAssignments.classId, classId)
        ));
      }
      // Assignment operations
      async createAssignment(assignmentData) {
        const id = crypto2.randomUUID();
        await db.insert(assignments).values({ ...assignmentData, id });
        const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
        return assignment;
      }
      async getAssignment(id) {
        const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
        return assignment;
      }
      async getAssignmentsByClass(classId) {
        return await db.select().from(assignments).where(and(eq(assignments.classId, classId), eq(assignments.isActive, true))).orderBy(desc(assignments.createdAt));
      }
      async getAssignmentsByCompany(companyId) {
        return await db.select().from(assignments).where(and(eq(assignments.companyId, companyId), eq(assignments.isActive, true))).orderBy(desc(assignments.createdAt));
      }
      async updateAssignment(id, updates) {
        await db.update(assignments).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assignments.id, id));
        const [updatedAssignment] = await db.select().from(assignments).where(eq(assignments.id, id));
        return updatedAssignment;
      }
      async deleteAssignment(id) {
        await db.update(assignments).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assignments.id, id));
      }
      // Submission operations
      async createSubmission(submissionData) {
        const id = crypto2.randomUUID();
        await db.insert(submissions).values({ ...submissionData, id });
        const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
        return submission;
      }
      async getSubmission(id) {
        const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
        return submission;
      }
      async getSubmissionsByAssignment(assignmentId) {
        return await db.select().from(submissions).where(eq(submissions.assignmentId, assignmentId)).orderBy(desc(submissions.createdAt));
      }
      async getSubmissionsByStudent(studentId) {
        return await db.select().from(submissions).where(eq(submissions.studentId, studentId)).orderBy(desc(submissions.createdAt));
      }
      async getSubmissionsByAssignmentAndStudent(assignmentId, studentId) {
        return await db.select().from(submissions).where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId))).orderBy(desc(submissions.createdAt));
      }
      async updateSubmission(id, updates) {
        await db.update(submissions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(submissions.id, id));
        const [updatedSubmission] = await db.select().from(submissions).where(eq(submissions.id, id));
        return updatedSubmission;
      }
      async deleteSubmission(id) {
        await db.delete(submissions).where(eq(submissions.id, id));
      }
      // Student Portal Methods
      async getStudentTerms(studentId) {
        const student = await this.getStudent(studentId);
        if (!student) {
          throw new Error("Student not found");
        }
        return await db.select().from(academicTerms).where(eq(academicTerms.companyId, student.companyId)).orderBy(desc(academicTerms.startDate));
      }
      async getStudentClasses(studentId) {
        const student = await this.getStudent(studentId);
        if (!student) {
          throw new Error("Student not found");
        }
        return await db.select().from(classes).where(eq(classes.companyId, student.companyId)).orderBy(classes.name);
      }
      async getStudentAssignments(studentId) {
        const student = await this.getStudent(studentId);
        if (!student) {
          throw new Error("Student not found");
        }
        const enrollments = await db.select({ classId: studentClassAssignments.classId }).from(studentClassAssignments).where(and(
          eq(studentClassAssignments.studentId, studentId),
          eq(studentClassAssignments.isActive, true)
        ));
        const classIds = enrollments.map((e) => e.classId);
        if (student.classId && !classIds.includes(student.classId)) {
          classIds.push(student.classId);
        }
        if (classIds.length === 0) {
          return [];
        }
        return await db.select().from(assignments).where(and(
          inArray(assignments.classId, classIds),
          eq(assignments.isActive, true)
        )).orderBy(desc(assignments.createdAt));
      }
      async getStudentSubmissions(studentId) {
        return await db.select().from(submissions).where(eq(submissions.studentId, studentId)).orderBy(desc(submissions.createdAt));
      }
      async getAssignmentByWorksheetAndStudent(worksheetId, studentId) {
        const student = await this.getStudent(studentId);
        if (!student) {
          return void 0;
        }
        const studentClasses = await db.select().from(studentClassAssignments).where(eq(studentClassAssignments.studentId, studentId));
        const classIds = studentClasses.map((a) => a.classId);
        if (classIds.length === 0) {
          return void 0;
        }
        const [assignment] = await db.select().from(assignments).where(and(
          eq(assignments.worksheetId, worksheetId),
          eq(assignments.assignmentKind, "worksheet"),
          inArray(assignments.classId, classIds)
        )).limit(1);
        return assignment;
      }
      async getCompanySubmissions(companyId) {
        try {
          console.log("Getting submissions for company:", companyId);
          const results = await db.execute(sql2`
        SELECT 
          s.id as submission_id,
          s.assignment_id,
          s.student_id,
          s.content,
          s.digital_content,
          s.file_urls,
          s.document_url,
          s.annotations,
          s.status,
          s.is_draft,
          s.submitted_at,
          s.is_late,
          s.score,
          s.feedback,
          s.device_type,
          s.input_method,
          s.created_at as submission_created_at,
          s.updated_at as submission_updated_at,
          st.user_id as student_user_id,
          st.company_id as student_company_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          a.title as assignment_title,
          a.description as assignment_description,
          a.instructions as assignment_instructions,
          a.submission_date as assignment_submission_date,
          a.subject as assignment_subject,
          a.attachment_urls as assignment_attachment_urls,
          s.parent_comment,
          s.parent_comment_at,
          s.ai_check_result,
          a.assignment_kind,
          a.worksheet_id,
          a.class_id,
          c.name as class_name
        FROM submissions s
        INNER JOIN students st ON s.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN assignments a ON s.assignment_id = a.id
        LEFT JOIN classes c ON a.class_id = c.id
        WHERE st.company_id = ${companyId}
        AND s.status != 'draft'
        ORDER BY s.created_at DESC
      `);
          const rows = results;
          console.log("Found submissions:", rows.length);
          return rows.map((row) => ({
            id: row.submission_id,
            assignmentId: row.assignment_id,
            studentId: row.student_id,
            content: row.content,
            digitalContent: row.digital_content,
            fileUrls: row.file_urls || [],
            documentUrl: row.document_url || null,
            annotations: row.annotations || null,
            status: row.status,
            isDraft: row.is_draft,
            submittedAt: row.submitted_at,
            isLate: row.is_late,
            score: row.score,
            feedback: row.feedback,
            parentComment: row.parent_comment,
            parentCommentAt: row.parent_comment_at,
            aiCheckResult: row.ai_check_result || null,
            deviceType: row.device_type,
            inputMethod: row.input_method,
            createdAt: row.submission_created_at,
            updatedAt: row.submission_updated_at,
            student: {
              id: row.student_id,
              userId: row.student_user_id,
              companyId: row.student_company_id,
              user: {
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                email: row.user_email
              }
            },
            assignment: {
              id: row.assignment_id,
              title: row.assignment_title,
              description: row.assignment_description,
              instructions: row.assignment_instructions,
              submissionDate: row.assignment_submission_date,
              subject: row.assignment_subject,
              attachmentUrls: row.assignment_attachment_urls || [],
              assignmentKind: row.assignment_kind || "file_upload",
              worksheetId: row.worksheet_id
            },
            class: {
              id: row.class_id,
              name: row.class_name || "Unknown Class"
            }
          }));
        } catch (error) {
          console.error("Error in getCompanySubmissions:", error);
          return [];
        }
      }
      async getCompanyWorksheetSubmissions(companyId) {
        try {
          console.log("Getting worksheet submissions for company:", companyId);
          const results = await db.execute(sql2`
        SELECT 
          wa.id as worksheet_assignment_id,
          wa.worksheet_id,
          wa.student_id,
          wa.status,
          wa.submitted_at,
          wa.created_at,
          w.title as worksheet_title,
          w.description as worksheet_description,
          w.subject as worksheet_subject,
          st.user_id as student_user_id,
          st.company_id as student_company_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          w.company_id as worksheet_company_id
        FROM worksheet_assignments wa
        INNER JOIN worksheets w ON wa.worksheet_id = w.id
        INNER JOIN students st ON wa.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        WHERE st.company_id = ${companyId}
          AND w.company_id = ${companyId}
          AND wa.status IN ('submitted', 'graded')
        ORDER BY wa.submitted_at DESC NULLS LAST, wa.created_at DESC
      `);
          const wsRows = results;
          console.log("Found worksheet submissions:", wsRows.length || 0);
          return (wsRows || []).map((row) => ({
            id: `ws-${row.worksheet_assignment_id}`,
            assignmentId: row.worksheet_assignment_id,
            studentId: row.student_id,
            content: null,
            digitalContent: null,
            fileUrls: [],
            status: row.status,
            isDraft: false,
            submittedAt: row.submitted_at || row.created_at,
            isLate: false,
            score: null,
            feedback: null,
            aiCheckResult: null,
            deviceType: null,
            inputMethod: null,
            createdAt: row.created_at,
            updatedAt: row.created_at,
            student: {
              id: row.student_id,
              userId: row.student_user_id,
              companyId: row.student_company_id,
              user: {
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                email: row.user_email
              }
            },
            assignment: {
              id: row.worksheet_assignment_id,
              title: row.worksheet_title,
              description: row.worksheet_description || "",
              instructions: "",
              submissionDate: row.submitted_at || row.created_at,
              subject: row.worksheet_subject || "General",
              attachmentUrls: [],
              assignmentKind: "worksheet",
              worksheetId: row.worksheet_id
            },
            class: {
              id: "worksheet",
              name: "Worksheet"
            }
          }));
        } catch (error) {
          console.error("Error in getCompanyWorksheetSubmissions:", error);
          return [];
        }
      }
      async getTutorSubmissions(tutorId) {
        try {
          console.log("Getting submissions for tutor:", tutorId);
          const results = await db.execute(sql2`
        SELECT 
          s.id as submission_id,
          s.assignment_id,
          s.student_id,
          s.content,
          s.digital_content,
          s.file_urls,
          s.document_url,
          s.annotations,
          s.status,
          s.is_draft,
          s.submitted_at,
          s.is_late,
          s.score,
          s.feedback,
          s.device_type,
          s.input_method,
          s.created_at as submission_created_at,
          s.updated_at as submission_updated_at,
          st.user_id as student_user_id,
          st.company_id as student_company_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          a.title as assignment_title,
          a.description as assignment_description,
          a.instructions as assignment_instructions,
          a.submission_date as assignment_submission_date,
          a.subject as assignment_subject,
          a.attachment_urls as assignment_attachment_urls,
          a.class_id,
          c.name as class_name,
          c.description as class_description,
          st.grade_level,
          s.reviewer_annotations,
          s.ai_check_result
        FROM submissions s
        INNER JOIN students st ON s.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN assignments a ON s.assignment_id = a.id
        INNER JOIN classes c ON a.class_id = c.id
        WHERE c.tutor_id = ${tutorId}
          AND s.status != 'draft'
        ORDER BY s.created_at DESC
      `);
          const tutorRows = results;
          console.log("Found tutor submissions:", tutorRows.length || 0);
          return (tutorRows || []).map((row) => ({
            id: row.submission_id,
            assignmentId: row.assignment_id,
            studentId: row.student_id,
            content: row.content,
            digitalContent: row.digital_content,
            fileUrls: row.file_urls || [],
            documentUrl: row.document_url || null,
            annotations: row.annotations || null,
            status: row.status,
            isDraft: row.is_draft,
            submittedAt: row.submitted_at,
            isLate: row.is_late,
            score: row.score,
            feedback: row.feedback,
            deviceType: row.device_type,
            inputMethod: row.input_method,
            createdAt: row.submission_created_at,
            updatedAt: row.submission_updated_at,
            student: {
              id: row.student_id,
              userId: row.student_user_id,
              companyId: row.student_company_id,
              user: {
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                email: row.user_email
              }
            },
            assignment: {
              id: row.assignment_id,
              title: row.assignment_title,
              description: row.assignment_description,
              instructions: row.assignment_instructions,
              submissionDate: row.assignment_submission_date,
              subject: row.assignment_subject,
              attachmentUrls: row.assignment_attachment_urls || []
            },
            reviewerAnnotations: row.reviewer_annotations || null,
            aiCheckResult: row.ai_check_result || null,
            gradeLevel: row.grade_level || null,
            class: {
              id: row.class_id,
              name: row.class_name,
              description: row.class_description || null
            }
          }));
        } catch (error) {
          console.error("Error in getTutorSubmissions:", error);
          return [];
        }
      }
      async getTutorSubmission(tutorId, submissionId) {
        try {
          const results = await db.execute(sql2`
        SELECT 
          s.id as submission_id,
          s.assignment_id,
          s.student_id,
          s.content,
          s.digital_content,
          s.file_urls,
          s.status,
          s.is_draft,
          s.submitted_at,
          s.is_late,
          s.score,
          s.feedback,
          s.device_type,
          s.input_method,
          s.created_at as submission_created_at,
          s.updated_at as submission_updated_at,
          st.user_id as student_user_id,
          st.company_id as student_company_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          a.title as assignment_title,
          a.description as assignment_description,
          a.instructions as assignment_instructions,
          a.submission_date as assignment_submission_date,
          a.subject as assignment_subject,
          a.attachment_urls as assignment_attachment_urls,
          a.class_id,
          c.name as class_name
        FROM submissions s
        INNER JOIN students st ON s.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN assignments a ON s.assignment_id = a.id
        INNER JOIN classes c ON a.class_id = c.id
        WHERE s.id = ${submissionId}
          AND c.tutor_id = ${tutorId}
        LIMIT 1
      `);
          const singleRows = results;
          if (!singleRows || singleRows.length === 0) return void 0;
          const row = singleRows[0];
          return {
            id: row.submission_id,
            assignmentId: row.assignment_id,
            studentId: row.student_id,
            content: row.content,
            digitalContent: row.digital_content,
            fileUrls: row.file_urls || [],
            status: row.status,
            isDraft: row.is_draft,
            submittedAt: row.submitted_at,
            isLate: row.is_late,
            score: row.score,
            feedback: row.feedback,
            deviceType: row.device_type,
            inputMethod: row.input_method,
            createdAt: row.submission_created_at,
            updatedAt: row.submission_updated_at,
            student: {
              id: row.student_id,
              userId: row.student_user_id,
              companyId: row.student_company_id,
              user: {
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                email: row.user_email
              }
            },
            assignment: {
              id: row.assignment_id,
              title: row.assignment_title,
              description: row.assignment_description,
              instructions: row.assignment_instructions,
              submissionDate: row.assignment_submission_date,
              subject: row.assignment_subject,
              attachmentUrls: row.assignment_attachment_urls || []
            },
            class: {
              id: row.class_id,
              name: row.class_name
            }
          };
        } catch (error) {
          console.error("Error in getTutorSubmission:", error);
          return void 0;
        }
      }
      async getTutorIncompleteHomework(tutorId) {
        try {
          const results = await db.execute(sql2`
        SELECT
          a.id as assignment_id,
          a.title as assignment_title,
          a.submission_date,
          c.id as class_id,
          c.name as class_name,
          s.id as student_id,
          u.id as student_user_id,
          u.first_name,
          u.last_name,
          u.email,
          s.parent_id,
          COALESCE(sub.status, 'not_started') as submission_status
        FROM assignments a
        JOIN classes c ON c.id = a.class_id
        JOIN student_class_assignments sca ON sca.class_id = c.id AND sca.is_active = true
        JOIN students s ON s.id = sca.student_id
        JOIN users u ON u.id = s.user_id
        LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = s.id
        WHERE c.tutor_id = ${tutorId}
          AND a.is_active = true
          AND (sub.id IS NULL OR sub.status = 'draft')
        ORDER BY a.submission_date ASC, u.first_name ASC
      `);
          const incompleteRows = results;
          return (incompleteRows || []).map((row) => ({
            assignmentId: row.assignment_id,
            assignmentTitle: row.assignment_title,
            submissionDate: row.submission_date,
            classId: row.class_id,
            className: row.class_name,
            studentId: row.student_id,
            studentUserId: row.student_user_id,
            studentName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.email,
            parentId: row.parent_id,
            status: row.submission_status
          }));
        } catch (error) {
          console.error("Error in getTutorIncompleteHomework:", error);
          return [];
        }
      }
      async gradeSubmission(submissionId, score, feedback, gradedBy) {
        await db.update(submissions).set({
          score,
          feedback,
          status: "graded",
          isDraft: false,
          gradedBy,
          gradedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(submissions.id, submissionId));
        const [updated] = await db.select().from(submissions).where(eq(submissions.id, submissionId));
        return updated;
      }
      async updateSubmissionAnnotations(submissionId, reviewerAnnotations) {
        await db.update(submissions).set({
          reviewerAnnotations,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(submissions.id, submissionId));
        const [updated] = await db.select().from(submissions).where(eq(submissions.id, submissionId));
        return updated;
      }
      // ==========================================
      // WORKSHEET OPERATIONS
      // ==========================================
      async createWorksheet(data) {
        const id = crypto2.randomUUID();
        await db.insert(worksheets).values({ ...data, id });
        const [worksheet] = await db.select().from(worksheets).where(eq(worksheets.id, id));
        return worksheet;
      }
      async getWorksheet(id) {
        const [worksheet] = await db.select().from(worksheets).where(eq(worksheets.id, id));
        return worksheet;
      }
      async getWorksheetsByCompany(companyId) {
        return db.select().from(worksheets).where(eq(worksheets.companyId, companyId)).orderBy(desc(worksheets.createdAt));
      }
      async updateWorksheet(id, data) {
        await db.update(worksheets).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(worksheets.id, id));
        const [worksheet] = await db.select().from(worksheets).where(eq(worksheets.id, id));
        return worksheet;
      }
      async deleteWorksheet(id) {
        await db.delete(worksheetAnswers).where(eq(worksheetAnswers.worksheetId, id));
        await db.delete(worksheets).where(eq(worksheets.id, id));
      }
      async createWorksheetPage(data) {
        const id = crypto2.randomUUID();
        await db.insert(worksheetPages).values({ ...data, id });
        const [page] = await db.select().from(worksheetPages).where(eq(worksheetPages.id, id));
        return page;
      }
      async getWorksheetPages(worksheetId) {
        return db.select().from(worksheetPages).where(eq(worksheetPages.worksheetId, worksheetId)).orderBy(worksheetPages.pageNumber);
      }
      async updateWorksheetPage(id, data) {
        await db.update(worksheetPages).set(data).where(eq(worksheetPages.id, id));
        const [page] = await db.select().from(worksheetPages).where(eq(worksheetPages.id, id));
        return page;
      }
      async deleteWorksheetPage(id) {
        await db.delete(worksheetPages).where(eq(worksheetPages.id, id));
      }
      async createWorksheetQuestion(data) {
        const id = crypto2.randomUUID();
        await db.insert(worksheetQuestions).values({ ...data, id });
        const [question] = await db.select().from(worksheetQuestions).where(eq(worksheetQuestions.id, id));
        return question;
      }
      async getWorksheetQuestions(pageId) {
        return db.select().from(worksheetQuestions).where(eq(worksheetQuestions.pageId, pageId)).orderBy(worksheetQuestions.questionNumber);
      }
      async updateWorksheetQuestion(id, data) {
        const { id: _id, createdAt, ...updateData } = data;
        await db.update(worksheetQuestions).set(updateData).where(eq(worksheetQuestions.id, id));
        const [question] = await db.select().from(worksheetQuestions).where(eq(worksheetQuestions.id, id));
        return question;
      }
      async deleteWorksheetQuestion(id) {
        await db.delete(worksheetQuestions).where(eq(worksheetQuestions.id, id));
      }
      async createWorksheetAssignment(data) {
        const id = crypto2.randomUUID();
        await db.insert(worksheetAssignments).values({ ...data, id });
        const [assignment] = await db.select().from(worksheetAssignments).where(eq(worksheetAssignments.id, id));
        return assignment;
      }
      async getWorksheetAssignments(worksheetId) {
        return db.select().from(worksheetAssignments).where(eq(worksheetAssignments.worksheetId, worksheetId));
      }
      async getStudentWorksheetAssignments(studentId) {
        const results = await db.select({
          assignment: worksheetAssignments,
          worksheet: worksheets
        }).from(worksheetAssignments).innerJoin(worksheets, eq(worksheetAssignments.worksheetId, worksheets.id)).where(eq(worksheetAssignments.studentId, studentId));
        return results;
      }
      async deleteWorksheetAssignment(id) {
        await db.delete(worksheetAssignments).where(eq(worksheetAssignments.id, id));
      }
      async createWorksheetAnswer(data) {
        const id = crypto2.randomUUID();
        await db.insert(worksheetAnswers).values({ ...data, id });
        const [answer] = await db.select().from(worksheetAnswers).where(eq(worksheetAnswers.id, id));
        return answer;
      }
      async getWorksheetAnswers(worksheetId, studentId) {
        return db.select().from(worksheetAnswers).where(and(eq(worksheetAnswers.worksheetId, worksheetId), eq(worksheetAnswers.studentId, studentId)));
      }
      async updateWorksheetAnswer(id, data) {
        await db.update(worksheetAnswers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(worksheetAnswers.id, id));
        const [answer] = await db.select().from(worksheetAnswers).where(eq(worksheetAnswers.id, id));
        return answer;
      }
      async upsertWorksheetAnswer(questionId, studentId, worksheetId, data) {
        const [existing] = await db.select().from(worksheetAnswers).where(and(
          eq(worksheetAnswers.questionId, questionId),
          eq(worksheetAnswers.studentId, studentId)
        ));
        if (existing) {
          await db.update(worksheetAnswers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(worksheetAnswers.id, existing.id));
          const [updated] = await db.select().from(worksheetAnswers).where(eq(worksheetAnswers.id, existing.id));
          return updated;
        } else {
          const id = crypto2.randomUUID();
          await db.insert(worksheetAnswers).values({ questionId, studentId, worksheetId, ...data, id });
          const [created] = await db.select().from(worksheetAnswers).where(eq(worksheetAnswers.id, id));
          return created;
        }
      }
      async submitWorksheetAnswers(worksheetId, studentId) {
        const now = /* @__PURE__ */ new Date();
        await db.update(worksheetAnswers).set({ isSubmitted: true, submittedAt: now }).where(and(
          eq(worksheetAnswers.worksheetId, worksheetId),
          eq(worksheetAnswers.studentId, studentId)
        ));
        await db.update(worksheetAssignments).set({ status: "submitted", submittedAt: now }).where(and(
          eq(worksheetAssignments.worksheetId, worksheetId),
          eq(worksheetAssignments.studentId, studentId)
        ));
      }
      async updateWorksheetAssignmentProgress(worksheetId, studentId) {
        const [assignment] = await db.select().from(worksheetAssignments).where(and(
          eq(worksheetAssignments.worksheetId, worksheetId),
          eq(worksheetAssignments.studentId, studentId),
          eq(worksheetAssignments.status, "assigned")
        ));
        if (assignment) {
          await db.update(worksheetAssignments).set({ status: "in_progress" }).where(eq(worksheetAssignments.id, assignment.id));
        }
      }
      async getFullWorksheet(worksheetId) {
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
      async createTest(testData) {
        const id = crypto2.randomUUID();
        await db.insert(tests).values({ ...testData, id });
        const [test] = await db.select().from(tests).where(eq(tests.id, id));
        return test;
      }
      async getTest(id) {
        const [test] = await db.select().from(tests).where(eq(tests.id, id));
        return test;
      }
      async getTestsByCompany(companyId) {
        return db.select().from(tests).where(eq(tests.companyId, companyId)).orderBy(desc(tests.createdAt));
      }
      async getTestsByClass(classId) {
        return db.select().from(tests).where(eq(tests.classId, classId)).orderBy(desc(tests.createdAt));
      }
      async updateTest(id, updates) {
        await db.update(tests).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tests.id, id));
        const [test] = await db.select().from(tests).where(eq(tests.id, id));
        return test;
      }
      async deleteTest(id) {
        await db.delete(tests).where(eq(tests.id, id));
      }
      async getTestWithQuestions(testId) {
        const test = await this.getTest(testId);
        if (!test) return null;
        const questions = await this.getTestQuestions(testId);
        return { ...test, questions };
      }
      // Test question operations
      async createTestQuestion(questionData) {
        const id = crypto2.randomUUID();
        await db.insert(testQuestions).values({ ...questionData, id });
        const [question] = await db.select().from(testQuestions).where(eq(testQuestions.id, id));
        const allQuestions = await this.getTestQuestions(questionData.testId);
        const totalPoints = allQuestions.reduce((sum2, q) => sum2 + (q.points || 0), 0) + (questionData.points || 1);
        await this.updateTest(questionData.testId, { totalPoints });
        return question;
      }
      async getTestQuestions(testId) {
        return db.select().from(testQuestions).where(eq(testQuestions.testId, testId)).orderBy(testQuestions.questionNumber);
      }
      async updateTestQuestion(id, updates) {
        await db.update(testQuestions).set(updates).where(eq(testQuestions.id, id));
        const [question] = await db.select().from(testQuestions).where(eq(testQuestions.id, id));
        if (updates.points !== void 0) {
          const allQuestions = await this.getTestQuestions(question.testId);
          const totalPoints = allQuestions.reduce((sum2, q) => sum2 + (q.points || 0), 0);
          await this.updateTest(question.testId, { totalPoints });
        }
        return question;
      }
      async deleteTestQuestion(id) {
        const [question] = await db.select().from(testQuestions).where(eq(testQuestions.id, id));
        if (question) {
          await db.delete(testQuestions).where(eq(testQuestions.id, id));
          const allQuestions = await this.getTestQuestions(question.testId);
          const totalPoints = allQuestions.reduce((sum2, q) => sum2 + (q.points || 0), 0);
          await this.updateTest(question.testId, { totalPoints });
        }
      }
      // Test assignment operations
      async createTestAssignment(assignmentData) {
        const id = crypto2.randomUUID();
        await db.insert(testAssignments).values({ ...assignmentData, id });
        const [assignment] = await db.select().from(testAssignments).where(eq(testAssignments.id, id));
        return assignment;
      }
      async getTestAssignments(testId) {
        return db.select().from(testAssignments).where(eq(testAssignments.testId, testId));
      }
      async getStudentTestAssignments(studentId) {
        const results = await db.select({
          assignment: testAssignments,
          test: tests
        }).from(testAssignments).innerJoin(tests, eq(testAssignments.testId, tests.id)).where(eq(testAssignments.studentId, studentId));
        return results;
      }
      async deleteTestAssignment(id) {
        await db.delete(testAssignments).where(eq(testAssignments.id, id));
      }
      // Test attempt operations
      async createTestAttempt(attemptData) {
        const id = crypto2.randomUUID();
        await db.insert(testAttempts).values({ ...attemptData, id });
        const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
        return attempt;
      }
      async getTestAttempt(id) {
        const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
        return attempt;
      }
      async getTestAttemptsByTest(testId) {
        return db.select().from(testAttempts).where(eq(testAttempts.testId, testId)).orderBy(desc(testAttempts.createdAt));
      }
      async getTestAttemptsByStudent(studentId) {
        return db.select().from(testAttempts).where(eq(testAttempts.studentId, studentId)).orderBy(desc(testAttempts.createdAt));
      }
      async updateTestAttempt(id, updates) {
        await db.update(testAttempts).set(updates).where(eq(testAttempts.id, id));
        const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
        return attempt;
      }
      // Test answer operations
      async createTestAnswer(answerData) {
        const id = crypto2.randomUUID();
        await db.insert(testAnswers).values({ ...answerData, id });
        const [answer] = await db.select().from(testAnswers).where(eq(testAnswers.id, id));
        return answer;
      }
      async getTestAnswersByAttempt(attemptId) {
        return db.select().from(testAnswers).where(eq(testAnswers.attemptId, attemptId));
      }
      async updateTestAnswer(id, updates) {
        await db.update(testAnswers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(testAnswers.id, id));
        const [answer] = await db.select().from(testAnswers).where(eq(testAnswers.id, id));
        return answer;
      }
      // Auto-grade a test attempt for multiple choice and true/false questions
      async autoGradeTestAttempt(attemptId) {
        const attempt = await this.getTestAttempt(attemptId);
        if (!attempt) throw new Error("Attempt not found");
        const test = await this.getTest(attempt.testId);
        if (!test) throw new Error("Test not found");
        const questions = await this.getTestQuestions(attempt.testId);
        const answers = await this.getTestAnswersByAttempt(attemptId);
        let totalScore = 0;
        for (const answer of answers) {
          const question = questions.find((q) => q.id === answer.questionId);
          if (!question) continue;
          let isCorrect = false;
          let pointsAwarded = 0;
          if (question.questionType === "multiple_choice" || question.questionType === "true_false") {
            const options = question.options;
            if (options && answer.selectedOption) {
              const selectedOpt = options.find((o) => o.id === answer.selectedOption);
              isCorrect = selectedOpt?.isCorrect || false;
              pointsAwarded = isCorrect ? question.points || 1 : 0;
            }
          } else if (question.questionType === "fill_blank" && question.correctAnswer) {
            isCorrect = answer.studentAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            pointsAwarded = isCorrect ? question.points || 1 : 0;
          }
          await this.updateTestAnswer(answer.id, {
            isCorrect,
            pointsAwarded,
            gradedAt: /* @__PURE__ */ new Date()
          });
          totalScore += pointsAwarded;
        }
        const percentageScore = test.totalPoints ? Math.round(totalScore / test.totalPoints * 100) : 0;
        return { totalScore, percentageScore };
      }
      // Grade a test attempt (includes manual grading and finalization)
      async gradeTestAttempt(attemptId, gradedBy, feedback) {
        const attempt = await this.getTestAttempt(attemptId);
        if (!attempt) throw new Error("Attempt not found");
        const test = await this.getTest(attempt.testId);
        if (!test) throw new Error("Test not found");
        const { totalScore, percentageScore } = await this.autoGradeTestAttempt(attemptId);
        const isPassed = test.passingScore ? percentageScore >= test.passingScore : void 0;
        await db.update(testAttempts).set({
          status: "graded",
          totalScore,
          percentageScore,
          isPassed,
          gradedBy,
          gradedAt: /* @__PURE__ */ new Date(),
          feedback
        }).where(eq(testAttempts.id, attemptId));
        const [gradedAttempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, attemptId));
        return gradedAttempt;
      }
      // ==========================================
      // CLASS SESSION OPERATIONS
      // ==========================================
      async createClassSession(sessionData) {
        const id = crypto2.randomUUID();
        await db.insert(classSessions).values({ ...sessionData, id });
        const [session2] = await db.select().from(classSessions).where(eq(classSessions.id, id));
        return session2;
      }
      async getClassSession(id) {
        const [session2] = await db.select().from(classSessions).where(eq(classSessions.id, id));
        return session2;
      }
      async getClassSessionsByClass(classId) {
        return db.select().from(classSessions).where(eq(classSessions.classId, classId)).orderBy(classSessions.sessionDate);
      }
      async getOrCreateSessionForDate(classId, date, tutorId) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const [existingSession] = await db.select().from(classSessions).where(and(
          eq(classSessions.classId, classId),
          sql2`${classSessions.sessionDate} >= ${startOfDay}`,
          sql2`${classSessions.sessionDate} <= ${endOfDay}`
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
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);
        const durationMinutes = endH * 60 + endM - (startH * 60 + startM) || 60;
        const sessionData = {
          classId,
          tutorId: tutorId || classInfo.tutorId || void 0,
          sessionDate: date,
          startTime,
          endTime,
          durationMinutes,
          status: "scheduled",
          deliveryMode: "in_person"
        };
        const newSessionId = crypto2.randomUUID();
        await db.insert(classSessions).values({ ...sessionData, id: newSessionId });
        const [newSession] = await db.select().from(classSessions).where(eq(classSessions.id, newSessionId));
        return newSession;
      }
      async getClassSessionsByTutor(tutorId, startDate, endDate) {
        let query = db.select().from(classSessions).where(eq(classSessions.tutorId, tutorId));
        if (startDate && endDate) {
          return db.select().from(classSessions).where(and(
            eq(classSessions.tutorId, tutorId),
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          )).orderBy(classSessions.sessionDate);
        }
        return db.select().from(classSessions).where(eq(classSessions.tutorId, tutorId)).orderBy(classSessions.sessionDate);
      }
      async getClassSessionsByStudent(studentId, startDate, endDate) {
        const studentClasses = await db.select({ classId: studentClassAssignments.classId }).from(studentClassAssignments).where(eq(studentClassAssignments.studentId, studentId));
        const classIds = studentClasses.map((c) => c.classId);
        if (classIds.length === 0) return [];
        let whereCondition = inArray(classSessions.classId, classIds);
        if (startDate && endDate) {
          whereCondition = and(
            inArray(classSessions.classId, classIds),
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          );
        }
        const sessions = await db.select({
          session: classSessions,
          class: classes
        }).from(classSessions).innerJoin(classes, eq(classSessions.classId, classes.id)).where(whereCondition).orderBy(classSessions.sessionDate);
        const sessionIds = sessions.map((s) => s.session.id);
        const attendanceRecords = sessionIds.length > 0 ? await db.select().from(sessionAttendance).where(and(
          inArray(sessionAttendance.sessionId, sessionIds),
          eq(sessionAttendance.studentId, studentId)
        )) : [];
        return sessions.map((s) => ({
          ...s.session,
          class: s.class,
          attendance: attendanceRecords.find((a) => a.sessionId === s.session.id)
        }));
      }
      async getClassSessionsByCompany(companyId, startDate, endDate) {
        let whereCondition = eq(classes.companyId, companyId);
        if (startDate && endDate) {
          whereCondition = and(
            eq(classes.companyId, companyId),
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          );
        }
        return db.select({
          session: classSessions,
          class: classes,
          tutor: tutors
        }).from(classSessions).innerJoin(classes, eq(classSessions.classId, classes.id)).leftJoin(tutors, eq(classSessions.tutorId, tutors.id)).where(whereCondition).orderBy(classSessions.sessionDate);
      }
      async getClassSessionsForDate(companyId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return db.select({
          session: classSessions,
          class: classes,
          tutor: tutors
        }).from(classSessions).innerJoin(classes, eq(classSessions.classId, classes.id)).leftJoin(tutors, eq(classSessions.tutorId, tutors.id)).where(and(
          eq(classes.companyId, companyId),
          sql2`${classSessions.sessionDate} >= ${startOfDay}`,
          sql2`${classSessions.sessionDate} <= ${endOfDay}`
        )).orderBy(classSessions.startTime);
      }
      async updateClassSession(id, updates) {
        await db.update(classSessions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(classSessions.id, id));
        const [session2] = await db.select().from(classSessions).where(eq(classSessions.id, id));
        return session2;
      }
      async deleteClassSession(id) {
        await db.delete(classSessions).where(eq(classSessions.id, id));
      }
      async generateSessionsForClass(classId, termStartDate, termEndDate) {
        const classData = await this.getClass(classId);
        if (!classData) throw new Error("Class not found");
        const createdSessions = [];
        const daysOfWeek = classData.daysOfWeek || (classData.dayOfWeek !== null ? [classData.dayOfWeek] : []);
        const [startHour, startMin] = classData.startTime.split(":").map(Number);
        const [endHour, endMin] = classData.endTime.split(":").map(Number);
        const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
        const currentDate = new Date(termStartDate);
        while (currentDate <= termEndDate) {
          const dayOfWeek = currentDate.getDay();
          if (daysOfWeek.includes(dayOfWeek)) {
            const sessionDate = new Date(currentDate);
            const session2 = await this.createClassSession({
              classId,
              tutorId: classData.tutorId,
              sessionDate,
              startTime: classData.startTime,
              endTime: classData.endTime,
              durationMinutes,
              status: "scheduled",
              deliveryMode: "in_person",
              locationUrl: classData.location
            });
            createdSessions.push(session2);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return createdSessions;
      }
      // ==========================================
      // SESSION ATTENDANCE OPERATIONS
      // ==========================================
      async markAttendance(attendanceData) {
        const [existing] = await db.select().from(sessionAttendance).where(and(
          eq(sessionAttendance.sessionId, attendanceData.sessionId),
          eq(sessionAttendance.studentId, attendanceData.studentId)
        ));
        if (existing) {
          return this.updateAttendance(existing.id, attendanceData);
        }
        const attId = crypto2.randomUUID();
        await db.insert(sessionAttendance).values({ ...attendanceData, id: attId });
        const [attendance] = await db.select().from(sessionAttendance).where(eq(sessionAttendance.id, attId));
        return attendance;
      }
      async getAttendance(id) {
        const [attendance] = await db.select().from(sessionAttendance).where(eq(sessionAttendance.id, id));
        return attendance;
      }
      async getAttendanceBySession(sessionId) {
        return db.select({
          attendance: sessionAttendance,
          student: students,
          user: users
        }).from(sessionAttendance).innerJoin(students, eq(sessionAttendance.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).where(eq(sessionAttendance.sessionId, sessionId));
      }
      async getAttendanceByStudent(studentId, startDate, endDate) {
        if (startDate && endDate) {
          return db.select({
            attendance: sessionAttendance,
            session: classSessions
          }).from(sessionAttendance).innerJoin(classSessions, eq(sessionAttendance.sessionId, classSessions.id)).where(and(
            eq(sessionAttendance.studentId, studentId),
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          ));
        }
        return db.select().from(sessionAttendance).where(eq(sessionAttendance.studentId, studentId));
      }
      async updateAttendance(id, updates) {
        await db.update(sessionAttendance).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sessionAttendance.id, id));
        const [attendance] = await db.select().from(sessionAttendance).where(eq(sessionAttendance.id, id));
        return attendance;
      }
      async markAllPresent(sessionId, markedBy) {
        const session2 = await this.getClassSession(sessionId);
        if (!session2) throw new Error("Session not found");
        const studentAssignments = await this.getStudentsByClass(session2.classId);
        for (const assignment of studentAssignments) {
          await this.markAttendance({
            sessionId,
            studentId: assignment.studentId,
            status: "present",
            markedBy,
            markedAt: /* @__PURE__ */ new Date()
          });
        }
        await this.updateClassSession(sessionId, {
          attendedCount: studentAssignments.length
        });
      }
      async overrideAttendance(id, newStatus, overrideBy, notes) {
        await db.update(sessionAttendance).set({
          status: newStatus,
          isOverride: true,
          overrideBy,
          overrideAt: /* @__PURE__ */ new Date(),
          notes: notes || void 0,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(sessionAttendance.id, id));
        const [attendance] = await db.select().from(sessionAttendance).where(eq(sessionAttendance.id, id));
        return attendance;
      }
      async lockSessionAttendance(sessionId) {
        await db.update(classSessions).set({
          attendanceLocked: true,
          attendanceLockedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(classSessions.id, sessionId));
      }
      async getStudentAttendanceSummary(studentId, startDate, endDate) {
        const studentClasses = await db.select({ classId: studentClassAssignments.classId }).from(studentClassAssignments).where(eq(studentClassAssignments.studentId, studentId));
        const classIds = studentClasses.map((c) => c.classId);
        if (classIds.length === 0) {
          return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, attendancePercentage: 0 };
        }
        let sessionsCondition = and(
          inArray(classSessions.classId, classIds),
          or(eq(classSessions.status, "completed"), eq(classSessions.status, "in_progress"))
        );
        if (startDate && endDate) {
          sessionsCondition = and(
            sessionsCondition,
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          );
        }
        const sessions = await db.select().from(classSessions).where(sessionsCondition);
        const totalSessions = sessions.length;
        if (totalSessions === 0) {
          return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, attendancePercentage: 0 };
        }
        const sessionIds = sessions.map((s) => s.id);
        const attendanceRecords = await db.select().from(sessionAttendance).where(and(
          inArray(sessionAttendance.sessionId, sessionIds),
          eq(sessionAttendance.studentId, studentId)
        ));
        const present = attendanceRecords.filter((a) => a.status === "present").length;
        const absent = totalSessions - attendanceRecords.length + attendanceRecords.filter((a) => a.status === "absent").length;
        const late = attendanceRecords.filter((a) => a.status === "late").length;
        const excused = attendanceRecords.filter((a) => a.status === "excused").length;
        const attendancePercentage = Math.round((present + late) / totalSessions * 100);
        return { totalSessions, present, absent, late, excused, attendancePercentage };
      }
      async getStudentAttendanceBySubject(studentId) {
        const studentClasses = await db.select({
          classId: studentClassAssignments.classId,
          subject: classes.subject
        }).from(studentClassAssignments).innerJoin(classes, eq(studentClassAssignments.classId, classes.id)).where(eq(studentClassAssignments.studentId, studentId));
        const subjectStats = {};
        for (const classData of studentClasses) {
          if (!subjectStats[classData.subject]) {
            subjectStats[classData.subject] = { total: 0, attended: 0 };
          }
          const sessions = await db.select().from(classSessions).where(and(
            eq(classSessions.classId, classData.classId),
            eq(classSessions.status, "completed")
          ));
          subjectStats[classData.subject].total += sessions.length;
          const sessionIds = sessions.map((s) => s.id);
          if (sessionIds.length > 0) {
            const attendanceRecords = await db.select().from(sessionAttendance).where(and(
              inArray(sessionAttendance.sessionId, sessionIds),
              eq(sessionAttendance.studentId, studentId),
              or(eq(sessionAttendance.status, "present"), eq(sessionAttendance.status, "late"))
            ));
            subjectStats[classData.subject].attended += attendanceRecords.length;
          }
        }
        return Object.entries(subjectStats).map(([subject, stats]) => ({
          subject,
          totalSessions: stats.total,
          attended: stats.attended,
          attendancePercentage: stats.total > 0 ? Math.round(stats.attended / stats.total * 100) : 0
        }));
      }
      async getStudentLearningHours(studentId, startDate, endDate) {
        const studentClasses = await db.select({
          classId: studentClassAssignments.classId,
          subject: classes.subject
        }).from(studentClassAssignments).innerJoin(classes, eq(studentClassAssignments.classId, classes.id)).where(eq(studentClassAssignments.studentId, studentId));
        const classIds = studentClasses.map((c) => c.classId);
        if (classIds.length === 0) {
          return { totalMinutes: 0, bySubject: [], byWeek: [] };
        }
        let sessionsCondition = and(
          inArray(classSessions.classId, classIds),
          eq(classSessions.status, "completed")
        );
        if (startDate && endDate) {
          sessionsCondition = and(
            sessionsCondition,
            sql2`${classSessions.sessionDate} >= ${startDate}`,
            sql2`${classSessions.sessionDate} <= ${endDate}`
          );
        }
        const sessions = await db.select({
          session: classSessions,
          subject: classes.subject
        }).from(classSessions).innerJoin(classes, eq(classSessions.classId, classes.id)).where(sessionsCondition);
        const sessionIds = sessions.map((s) => s.session.id);
        const attendanceRecords = sessionIds.length > 0 ? await db.select().from(sessionAttendance).where(and(
          inArray(sessionAttendance.sessionId, sessionIds),
          eq(sessionAttendance.studentId, studentId),
          or(eq(sessionAttendance.status, "present"), eq(sessionAttendance.status, "late"))
        )) : [];
        const attendedSessionIds = new Set(attendanceRecords.map((a) => a.sessionId));
        let totalMinutes = 0;
        const subjectMinutes = {};
        const weekMinutes = {};
        for (const { session: session2, subject } of sessions) {
          if (attendedSessionIds.has(session2.id)) {
            const duration = session2.durationMinutes || 0;
            totalMinutes += duration;
            subjectMinutes[subject] = (subjectMinutes[subject] || 0) + duration;
            const weekStart = new Date(session2.sessionDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toISOString().split("T")[0];
            weekMinutes[weekKey] = (weekMinutes[weekKey] || 0) + duration;
          }
        }
        return {
          totalMinutes,
          bySubject: Object.entries(subjectMinutes).map(([subject, minutes]) => ({ subject, minutes })),
          byWeek: Object.entries(weekMinutes).map(([week, minutes]) => ({ week, minutes })).sort((a, b) => a.week.localeCompare(b.week))
        };
      }
      async getClassAttendanceHistory(classId, limit = 10) {
        const sessions = await db.select({
          session: classSessions
        }).from(classSessions).where(eq(classSessions.classId, classId)).orderBy(sql2`${classSessions.sessionDate} DESC`).limit(limit);
        const result = [];
        for (const { session: session2 } of sessions) {
          const attendance = await db.select({
            attendance: sessionAttendance,
            student: students,
            user: users
          }).from(sessionAttendance).innerJoin(students, eq(sessionAttendance.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).where(eq(sessionAttendance.sessionId, session2.id));
          const presentCount = attendance.filter(
            (a) => a.attendance.status === "present" || a.attendance.status === "late"
          ).length;
          result.push({
            session: session2,
            attendance: attendance.map((a) => ({
              id: a.attendance.id,
              studentId: a.attendance.studentId,
              status: a.attendance.status,
              notes: a.attendance.notes,
              studentName: `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim() || a.user.email
            })),
            summary: {
              total: attendance.length,
              present: presentCount,
              absent: attendance.length - presentCount
            }
          });
        }
        return result;
      }
      // ==========================================
      // ACADEMIC HOLIDAY OPERATIONS
      // ==========================================
      async createAcademicHoliday(holidayData) {
        const id = crypto2.randomUUID();
        await db.insert(academicHolidays).values({ ...holidayData, id });
        const [holiday] = await db.select().from(academicHolidays).where(eq(academicHolidays.id, id));
        return holiday;
      }
      async getAcademicHoliday(id) {
        const [holiday] = await db.select().from(academicHolidays).where(eq(academicHolidays.id, id));
        return holiday;
      }
      async getAcademicHolidaysByCompany(companyId) {
        return db.select().from(academicHolidays).where(or(
          eq(academicHolidays.companyId, companyId),
          eq(academicHolidays.isPublic, true)
        )).orderBy(academicHolidays.startDate);
      }
      async getPublicHolidays(startDate, endDate) {
        let condition = eq(academicHolidays.isPublic, true);
        if (startDate && endDate) {
          condition = and(
            condition,
            sql2`${academicHolidays.startDate} >= ${startDate}`,
            sql2`${academicHolidays.endDate} <= ${endDate}`
          );
        }
        return db.select().from(academicHolidays).where(condition).orderBy(academicHolidays.startDate);
      }
      async updateAcademicHoliday(id, updates) {
        await db.update(academicHolidays).set(updates).where(eq(academicHolidays.id, id));
        const [holiday] = await db.select().from(academicHolidays).where(eq(academicHolidays.id, id));
        return holiday;
      }
      async deleteAcademicHoliday(id) {
        await db.delete(academicHolidays).where(eq(academicHolidays.id, id));
      }
      // ==========================================
      // NOTIFICATION PREFERENCES OPERATIONS
      // ==========================================
      async getNotificationPreferences(userId) {
        const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
        return prefs;
      }
      async createNotificationPreferences(data) {
        const id = crypto2.randomUUID();
        await db.insert(notificationPreferences).values({ ...data, id });
        const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.id, id));
        return prefs;
      }
      async updateNotificationPreferences(userId, updates) {
        await db.update(notificationPreferences).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationPreferences.userId, userId));
        const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
        return prefs;
      }
      // ==========================================
      // REPORT OPERATIONS
      // ==========================================
      async createReportRun(data) {
        const id = crypto2.randomUUID();
        await db.insert(reportRuns).values({ ...data, id });
        const [report] = await db.select().from(reportRuns).where(eq(reportRuns.id, id));
        return report;
      }
      async getReportRun(id) {
        const [report] = await db.select().from(reportRuns).where(eq(reportRuns.id, id));
        return report;
      }
      async getReportRunsByCompany(companyId) {
        return db.select().from(reportRuns).where(eq(reportRuns.companyId, companyId)).orderBy(desc(reportRuns.createdAt));
      }
      async updateReportRun(id, updates) {
        await db.update(reportRuns).set(updates).where(eq(reportRuns.id, id));
        const [report] = await db.select().from(reportRuns).where(eq(reportRuns.id, id));
        return report;
      }
      async deleteReportRun(id) {
        await db.delete(reportRuns).where(eq(reportRuns.id, id));
      }
      // Helper methods for report generation
      async getStudentsByCompany(companyId) {
        return db.select().from(students).where(eq(students.companyId, companyId));
      }
      async getTermsByCompany(companyId) {
        const years = await db.select().from(academicYears).where(eq(academicYears.companyId, companyId));
        if (years.length === 0) return [];
        const yearIds = years.map((y) => y.id);
        return db.select().from(academicTerms).where(inArray(academicTerms.academicYearId, yearIds));
      }
      async getCompanySubjects(companyId) {
        return db.select().from(companySubjects).where(eq(companySubjects.companyId, companyId)).orderBy(companySubjects.createdAt);
      }
      async createCompanySubject(companyId, name, code, description) {
        const id = crypto2.randomUUID();
        await db.insert(companySubjects).values({
          id,
          companyId,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description?.trim() || null
        });
        const [row] = await db.select().from(companySubjects).where(eq(companySubjects.id, id));
        return row;
      }
      async deleteCompanySubject(id, companyId) {
        const [row] = await db.select().from(companySubjects).where(eq(companySubjects.id, id));
        await db.delete(companySubjects).where(eq(companySubjects.id, id));
        return row;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/security.ts
import crypto3 from "crypto";
import { eq as eq2, and as and2, gte } from "drizzle-orm";
function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
}
async function checkLoginRateLimit(email, ip) {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentAttempts = await db.select().from(loginAttempts).where(
    and2(
      eq2(loginAttempts.email, email.toLowerCase()),
      gte(loginAttempts.createdAt, windowStart),
      eq2(loginAttempts.success, false)
    )
  );
  const failedCount = recentAttempts.length;
  if (failedCount >= MAX_LOGIN_ATTEMPTS) {
    const lastAttempt = recentAttempts.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    )[0];
    const lockoutEnd = new Date((lastAttempt?.createdAt?.getTime() || Date.now()) + LOCKOUT_DURATION_MS);
    if (lockoutEnd > /* @__PURE__ */ new Date()) {
      return { allowed: false, remainingAttempts: 0, lockoutUntil: lockoutEnd };
    }
  }
  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - failedCount };
}
async function recordLoginAttempt(email, ip, success) {
  await db.insert(loginAttempts).values({
    email: email.toLowerCase(),
    ipAddress: ip,
    success
  });
  if (success) {
    await logAudit({ action: "login_success", resource: "auth", details: { email }, ipAddress: ip });
  } else {
    await logAudit({ action: "login_failed", resource: "auth", details: { email }, ipAddress: ip, status: "failure" });
  }
}
function generateCsrfToken() {
  return crypto3.randomBytes(32).toString("hex");
}
function csrfProtection(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }
  const exemptPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/contact"
  ];
  if (exemptPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }
  if (!req.path.startsWith("/api/")) {
    return next();
  }
  const tokenFromHeader = req.headers["x-csrf-token"];
  const tokenFromSession = req.session?.csrfToken;
  if (!tokenFromHeader || !tokenFromSession || tokenFromHeader !== tokenFromSession) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }
  next();
}
function securityHeaders(_req, res, next) {
  const isDev = process.env.NODE_ENV !== "production";
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (!isDev) {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const frameAncestors = isDev ? "frame-ancestors 'self' https://*.replit.dev https://*.replit.app https://*.picard.replit.dev https://replit.com" : "frame-ancestors 'none'";
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: wss: https://storage.googleapis.com",
    "frame-src 'self' blob:",
    frameAncestors,
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "));
  next();
}
async function logAudit(entry) {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId || null,
      action: entry.action,
      resource: entry.resource || null,
      resourceId: entry.resourceId || null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      details: entry.details || null,
      status: entry.status || "success"
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
function auditMiddleware(req, res, next) {
  if (!req.path.startsWith("/api/") || req.method === "GET") {
    return next();
  }
  const originalJson = res.json.bind(res);
  const startTime = Date.now();
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  res.json = function(body) {
    const userId = req.user?.id || req.session?.userId;
    const status = res.statusCode >= 400 ? "failure" : "success";
    if (req.path !== "/api/auth/login") {
      logAudit({
        userId,
        action: `${req.method} ${req.path}`,
        resource: req.path.split("/")[2] || "unknown",
        ipAddress: ip,
        userAgent,
        details: {
          statusCode: res.statusCode,
          duration: Date.now() - startTime
        },
        status
      });
    }
    return originalJson(body);
  };
  next();
}
function getCsrfTokenEndpoint(req, res) {
  let token = req.session?.csrfToken;
  if (!token) {
    token = generateCsrfToken();
    req.session.csrfToken = token;
  }
  res.json({ csrfToken: token });
}
var RATE_LIMIT_WINDOW_MS, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS;
var init_security = __esm({
  "server/security.ts"() {
    "use strict";
    init_db();
    init_schema();
    RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
    MAX_LOGIN_ATTEMPTS = 5;
    LOCKOUT_DURATION_MS = 15 * 60 * 1e3;
  }
});

// server/customAuth.ts
var customAuth_exports = {};
__export(customAuth_exports, {
  comparePassword: () => comparePassword,
  generateJWT: () => generateJWT,
  generateVerificationToken: () => generateVerificationToken,
  getSession: () => getSession,
  hashPassword: () => hashPassword,
  isAuthenticated: () => isAuthenticated,
  sendHomeworkSubmissionEmail: () => sendHomeworkSubmissionEmail,
  sendPasswordResetEmail: () => sendPasswordResetEmail,
  sendVerificationEmail: () => sendVerificationEmail,
  setupCustomAuth: () => setupCustomAuth
});
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto4 from "crypto";
import * as nodemailer from "nodemailer";
import session from "express-session";
import MemoryStore from "memorystore";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const Store = MemoryStore(session);
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: new Store({ checkPeriod: 864e5 }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
function generateVerificationToken() {
  return crypto4.randomBytes(32).toString("hex");
}
function generateJWT(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-jwt-secret",
    { expiresIn: "7d" }
  );
}
async function sendVerificationEmail(email, token, firstName) {
  if (process.env.NODE_ENV === "development") {
    console.log("=== EMAIL VERIFICATION ===");
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your eSlate account`);
    console.log(`Hi ${firstName},`);
    console.log(`Please verify your email by clicking: http://localhost:5000/verify-email?token=${token}`);
    console.log("==========================");
    return;
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email service not configured. Verification link:", `http://localhost:5000/verify-email?token=${token}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@eslate.com",
    to: email,
    subject: "Verify your eSlate account",
    html: `
      <h2>Welcome to eSlate!</h2>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="http://localhost:5000/verify-email?token=${token}">Verify Email</a>
      <p>If you didn't create an account, you can ignore this email.</p>
    `
  });
}
async function sendPasswordResetEmail(email, token, firstName) {
  if (process.env.NODE_ENV === "development") {
    console.log("=== PASSWORD RESET ===");
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your eSlate password`);
    console.log(`Hi ${firstName},`);
    console.log(`Reset your password: http://localhost:5000/reset-password?token=${token}`);
    console.log("======================");
    return;
  }
  console.warn("Email service not configured. Reset link:", `http://localhost:5000/reset-password?token=${token}`);
}
async function sendHomeworkSubmissionEmail(data) {
  const { parentEmail, parentFirstName, studentFirstName, studentLastName, assignmentTitle, submittedAt, isLate, status } = data;
  const formattedDate = submittedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const lateWarning = isLate ? '<p style="color: #dc2626; font-weight: bold;">Note: This submission was submitted after the due date.</p>' : "";
  const statusBadge = status === "submitted" ? '<span style="background-color: #22c55e; color: white; padding: 4px 8px; border-radius: 4px;">Submitted</span>' : `<span style="background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
  if (process.env.NODE_ENV === "development") {
    console.log("=== PARENT HOMEWORK NOTIFICATION ===");
    console.log(`To: ${parentEmail}`);
    console.log(`Subject: ${studentFirstName} ${studentLastName} has submitted homework`);
    console.log(`Hi ${parentFirstName},`);
    console.log(`Your child ${studentFirstName} ${studentLastName} has submitted their homework:`);
    console.log(`- Assignment: ${assignmentTitle}`);
    console.log(`- Submitted: ${formattedDate}`);
    console.log(`- Status: ${status}`);
    if (isLate) console.log(`- Note: This was a late submission`);
    console.log("=====================================");
    return;
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email service not configured. Parent notification not sent for:", assignmentTitle);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@eslate.com",
    to: parentEmail,
    subject: `${studentFirstName} ${studentLastName} has submitted homework - eSlate`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Homework Submission Notification</h2>
        <p>Hi ${parentFirstName},</p>
        <p>Your child <strong>${studentFirstName} ${studentLastName}</strong> has submitted their homework.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p style="margin: 0 0 8px 0;"><strong>Submitted:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Status:</strong> ${statusBadge}</p>
        </div>
        
        ${lateWarning}
        
        <p>You can log in to eSlate to view more details about your child's progress.</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          This is an automated notification from eSlate. Please do not reply to this email.
        </p>
      </div>
    `
  });
}
async function isAuthenticated(req, res, next) {
  try {
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user && user.isActive && !user.isDeleted) {
        req.user = user;
        return next();
      }
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret");
        const user = await storage.getUser(decoded.userId);
        if (user && user.isActive && !user.isDeleted) {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError);
      }
    }
    console.error("Authentication failed:", {
      hasSession: !!req.session?.userId,
      hasAuthHeader: !!authHeader,
      userAgent: req.headers["user-agent"],
      path: req.path
    });
    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
}
function setupCustomAuth(app2) {
  app2.use(getSession());
  app2.use(csrfProtection);
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const verificationToken = generateVerificationToken();
      const userId = await storage.createUserWithAuth({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "student",
        authProvider: "email",
        emailVerificationToken: verificationToken,
        isEmailVerified: false
      });
      await sendVerificationEmail(email, verificationToken, firstName);
      res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        userId
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.get("/api/auth/csrf-token", getCsrfTokenEndpoint);
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
      const rateLimit = await checkLoginRateLimit(email, clientIp);
      if (!rateLimit.allowed) {
        const minutesLeft = rateLimit.lockoutUntil ? Math.ceil((rateLimit.lockoutUntil.getTime() - Date.now()) / 6e4) : 15;
        return res.status(429).json({
          message: `Too many login attempts. Please try again in ${minutesLeft} minutes.`,
          lockoutUntil: rateLimit.lockoutUntil
        });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        await recordLoginAttempt(email, clientIp, false);
        return res.status(401).json({
          message: "Invalid email or password",
          remainingAttempts: rateLimit.remainingAttempts - 1
        });
      }
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        await recordLoginAttempt(email, clientIp, false);
        return res.status(401).json({
          message: "Invalid email or password",
          remainingAttempts: rateLimit.remainingAttempts - 1
        });
      }
      if (!user.isActive || user.isDeleted) {
        await recordLoginAttempt(email, clientIp, false);
        return res.status(401).json({ message: "Account is inactive" });
      }
      await recordLoginAttempt(email, clientIp, true);
      await storage.updateUserLastLogin(user.id);
      req.session.userId = user.id;
      const token = generateJWT(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const userId = req.session?.userId || req.user?.id;
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    logAudit({ userId, action: "logout", resource: "auth", ipAddress: clientIp });
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      let roleData = null;
      switch (req.user.role) {
        case "student":
          roleData = await storage.getStudentByUserId(req.user.id);
          break;
        case "parent":
          roleData = await storage.getParentByUserId(req.user.id);
          break;
        case "tutor":
          roleData = await storage.getTutorByUserId(req.user.id);
          break;
        case "company_admin":
          roleData = await storage.getCompanyAdminByUserId(req.user.id);
          break;
      }
      const { password: _, ...userWithoutPassword } = req.user;
      res.json({ ...userWithoutPassword, roleData });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      const success = await storage.verifyEmailToken(token);
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account with this email exists, a reset link has been sent." });
      }
      const resetToken = generateVerificationToken();
      const expires = new Date(Date.now() + 36e5);
      await storage.setPasswordResetToken(user.id, resetToken, expires);
      await sendPasswordResetEmail(email, resetToken, user.firstName || "User");
      res.json({ message: "If an account with this email exists, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      const hashedPassword = await hashPassword(password);
      const success = await storage.resetPassword(token, hashedPassword);
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });
}
var init_customAuth = __esm({
  "server/customAuth.ts"() {
    "use strict";
    init_storage();
    init_security();
  }
});

// server/services/ai.ts
var ai_exports = {};
__export(ai_exports, {
  aiService: () => aiService
});
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import Groq from "groq-sdk";
import OpenAI from "openai";
import * as path from "path";
var genAI, fileManager, groqClient, openaiClient, GROQ_MODEL, OPENAI_MODEL, AIService, aiService;
var init_ai = __esm({
  "server/services/ai.ts"() {
    "use strict";
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");
    groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
    openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    GROQ_MODEL = "llama-3.3-70b-versatile";
    OPENAI_MODEL = "gpt-4o";
    AIService = class {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      async callGroq(prompt) {
        if (!groqClient) throw new Error("Groq not configured");
        const res = await groqClient.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2048
        });
        return res.choices[0]?.message?.content || "";
      }
      async callGroqVision(textPrompt, images) {
        if (!groqClient) throw new Error("Groq not configured");
        const content = images.map((img) => ({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` }
        }));
        content.push({ type: "text", text: textPrompt });
        const res = await groqClient.chat.completions.create({
          model: "llama-3.2-11b-vision-preview",
          messages: [{ role: "user", content }],
          temperature: 0.7,
          max_tokens: 2048
        });
        return res.choices[0]?.message?.content || "";
      }
      async callOpenAI(prompt) {
        if (!openaiClient) throw new Error("OpenAI not configured");
        const res = await openaiClient.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2048
        });
        return res.choices[0]?.message?.content || "";
      }
      async callOpenAIVision(textPrompt, images) {
        if (!openaiClient) throw new Error("OpenAI not configured");
        const content = images.map((img) => ({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}`, detail: "high" }
        }));
        content.push({ type: "text", text: textPrompt });
        const res = await openaiClient.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: "user", content }],
          temperature: 0.7,
          max_tokens: 2048
        });
        return res.choices[0]?.message?.content || "";
      }
      isQuotaError(err) {
        return err?.status === 429 || err?.statusText === "Too Many Requests";
      }
      quotaErrorMessage() {
        return "AI quota reached. Please try again in a few minutes or tomorrow if the daily limit is exhausted.";
      }
      // For text-only AI calls — Gemini first, then Groq, then GPT-4o
      async generateText(prompt) {
        try {
          const result = await this.model.generateContent(prompt);
          return result.response.text();
        } catch (err) {
          if (this.isQuotaError(err)) {
            if (groqClient) {
              console.log("Gemini quota exceeded \u2014 switching to Groq fallback");
              return this.callGroq(prompt);
            }
            if (openaiClient) {
              console.log("Gemini quota exceeded \u2014 switching to GPT-4o fallback");
              return this.callOpenAI(prompt);
            }
            throw new Error(this.quotaErrorMessage());
          }
          throw err;
        }
      }
      // For multimodal calls (text + images) — Gemini first, then GPT-4o vision (best at handwriting)
      async generateWithFallback(contentParts) {
        try {
          const result = await this.model.generateContent(contentParts);
          return result.response.text();
        } catch (err) {
          if (this.isQuotaError(err)) {
            const parts = Array.isArray(contentParts) ? contentParts : [contentParts];
            const textOnly = parts.filter((p) => p.text).map((p) => p.text).join("\n\n");
            const imageParts = parts.filter((p) => p.inlineData).map((p) => ({ mimeType: p.inlineData.mimeType, data: p.inlineData.data }));
            const hasImages = imageParts.length > 0;
            if (hasImages && openaiClient) {
              console.log("Gemini quota exceeded \u2014 switching to GPT-4o vision fallback");
              return this.callOpenAIVision(textOnly, imageParts);
            }
            if (!hasImages && groqClient) {
              console.log("Gemini quota exceeded \u2014 switching to Groq fallback (text only)");
              return this.callGroq(textOnly);
            }
            if (!hasImages && openaiClient) {
              console.log("Gemini quota exceeded \u2014 switching to GPT-4o fallback (text only)");
              return this.callOpenAI(textOnly);
            }
            throw new Error(this.quotaErrorMessage());
          }
          throw err;
        }
      }
      safeParseJSON(response, type) {
        try {
          const pattern = type === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
          const jsonMatch = response.match(pattern);
          if (!jsonMatch) {
            throw new Error(`No valid JSON ${type} found in response`);
          }
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, " ").replace(/,\s*([}\]])/g, "$1");
          return JSON.parse(cleanJson);
        } catch (error) {
          console.error(`Failed to parse AI response as ${type}:`, response.substring(0, 500));
          throw new Error(`Failed to parse AI response. The AI returned an invalid format.`);
        }
      }
      async generateQuestions(params) {
        const prompt = `You are an educational content expert. Generate ${params.count} questions for a ${params.gradeLevel || "middle school"} level ${params.subject} class on the topic "${params.topic}".

Requirements:
- Difficulty level: ${params.difficulty}
- Question types to include: ${params.questionTypes.join(", ")}
- Each question should have a clear correct answer
- Include helpful hints that guide students without giving away the answer
- For multiple choice questions, provide 4 options (A, B, C, D)
- For fill-in-the-blank, use ___ to indicate the blank

Return the response as a JSON array with this exact structure (no markdown, just raw JSON):
[
  {
    "type": "multiple_choice" | "short_text" | "long_text" | "fill_blank" | "true_false",
    "question": "The question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], // Only for multiple_choice
    "correctAnswer": "The correct answer",
    "helpText": "A helpful hint without giving away the answer",
    "points": 10
  }
]

Generate exactly ${params.count} questions covering different aspects of ${params.topic}.`;
        try {
          const response = await this.generateText(prompt);
          const questions = this.safeParseJSON(response, "array");
          if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("AI returned no questions");
          }
          return questions.map((q) => ({
            type: q.type || "short_text",
            question: q.question || "Question text missing",
            options: q.options,
            correctAnswer: q.correctAnswer || "",
            helpText: q.helpText || "Think carefully about this question.",
            points: q.points || 10
          }));
        } catch (error) {
          console.error("Error generating questions:", error);
          throw new Error(error.message || "Failed to generate questions. Please try again.");
        }
      }
      async getGradingSuggestion(params) {
        const prompt = `You are an experienced teacher grading a student's answer. Provide fair and constructive feedback.

Question: ${params.question}

Student's Answer: ${params.studentAnswer}

${params.correctAnswer ? `Expected/Correct Answer: ${params.correctAnswer}` : ""}
${params.rubric ? `Grading Rubric: ${params.rubric}` : ""}

Maximum Points: ${params.maxPoints}

Evaluate the student's answer and provide:
1. A suggested score out of ${params.maxPoints} (be fair but not too lenient)
2. Constructive feedback explaining the score
3. Specific strengths in the answer
4. Areas for improvement

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "suggestedScore": number,
  "feedback": "Overall feedback paragraph",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`;
        try {
          const response = await this.generateText(prompt);
          const grading = this.safeParseJSON(response, "object");
          return {
            suggestedScore: Math.max(0, Math.min(params.maxPoints, grading.suggestedScore || 0)),
            feedback: grading.feedback || "Please review this answer.",
            strengths: Array.isArray(grading.strengths) ? grading.strengths : [],
            improvements: Array.isArray(grading.improvements) ? grading.improvements : []
          };
        } catch (error) {
          console.error("Error getting grading suggestion:", error);
          throw new Error(error.message || "Failed to generate grading suggestion. Please try again.");
        }
      }
      async getStudentHint(params) {
        const hintLevelDescriptions = {
          1: "Give a subtle, minimal hint that points the student in the right direction without revealing much. Just nudge them to think differently.",
          2: "Provide a moderate hint that gives more guidance. Explain the concept or approach they should consider.",
          3: "Give a detailed hint that walks through the problem-solving approach step by step, but still don't give the direct answer."
        };
        const prompt = `You are a helpful tutor providing hints to a student struggling with a question. 

Question: ${params.question}
Question Type: ${params.questionType}
${params.helpText ? `Teacher's Help Text: ${params.helpText}` : ""}
${params.studentAttempt ? `Student's Current Attempt: ${params.studentAttempt}` : ""}
${params.correctAnswer ? `(For your reference only - DO NOT reveal this) Correct Answer: ${params.correctAnswer}` : ""}

Hint Level Requested: ${params.hintLevel} out of 3
${hintLevelDescriptions[params.hintLevel]}

IMPORTANT RULES:
- NEVER reveal the actual answer directly
- Be encouraging and supportive
- Use age-appropriate language
- If there's a student attempt, acknowledge what they got right before guiding them

Provide your hint as a plain text response (no JSON, no formatting):`;
        try {
          const response = await this.generateText(prompt);
          return response.trim();
        } catch (error) {
          console.error("Error generating hint:", error);
          throw new Error("Failed to generate hint. Please try again.");
        }
      }
      async generateProgressInsights(params) {
        const prompt = `You are an educational analyst providing insights for a parent about their child's academic progress.

Student Name: ${params.studentName}

Recent Assignments (${params.submissions.length} total):
${params.submissions.map((s) => `- ${s.assignmentTitle} (${s.subject}): ${s.score !== void 0 ? `${s.score}/${s.maxScore}` : "Pending grade"} - Submitted ${s.submittedAt}${s.isLate ? " (Late)" : ""}`).join("\n")}

Recent Test Results (${params.testResults.length} total):
${params.testResults.map((t) => `- ${t.testTitle} (${t.subject}): ${t.score}/${t.totalPoints} (${Math.round(t.score / t.totalPoints * 100)}%) - Completed ${t.completedAt}`).join("\n")}

Analyze this data and provide:
1. A brief summary of overall academic performance (2-3 sentences)
2. Key strengths demonstrated
3. Areas that need improvement
4. Specific recommendations for the parent to help their child
5. Whether the overall trend is improving, stable, or declining

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "summary": "Overall performance summary paragraph",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "overallTrend": "improving" | "stable" | "declining"
}`;
        try {
          const response = await this.generateText(prompt);
          const insights = this.safeParseJSON(response, "object");
          return {
            summary: insights.summary || "No summary available.",
            strengths: Array.isArray(insights.strengths) ? insights.strengths : [],
            areasForImprovement: Array.isArray(insights.areasForImprovement) ? insights.areasForImprovement : [],
            recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
            overallTrend: ["improving", "stable", "declining"].includes(insights.overallTrend) ? insights.overallTrend : "stable"
          };
        } catch (error) {
          console.error("Error generating progress insights:", error);
          throw new Error(error.message || "Failed to generate progress insights. Please try again.");
        }
      }
      async enhanceContent(content, contentType) {
        const prompts = {
          question: `Improve this educational question to be clearer, more engaging, and academically appropriate. Keep the same meaning but enhance clarity and educational value:

${content}

Return only the improved question text, no explanations.`,
          helpText: `Enhance this hint/help text to be more helpful for students without giving away the answer. Make it encouraging and educational:

${content}

Return only the improved help text, no explanations.`,
          instructions: `Improve these assignment instructions to be clearer and more student-friendly. Ensure they are easy to understand:

${content}

Return only the improved instructions, no explanations.`
        };
        try {
          const response = await this.generateText(prompts[contentType]);
          return response.trim();
        } catch (error) {
          console.error("Error enhancing content:", error);
          throw new Error("Failed to enhance content. Please try again.");
        }
      }
      async checkAssignment(params) {
        const hasText = !!(params.studentContent && params.studentContent.trim().length > 10);
        const hasFiles = !!(params.files && params.files.length > 0);
        const isMathSubject = /math|maths|arithmetic|algebra|geometry|calculus|numeracy|number|integer|fraction|decimal|statistic|trigon|addition|subtract|multiply|division/i.test(params.subject || params.assignmentTitle || "");
        const hasImageFiles = hasFiles && params.files.some((f) => f.mimeType.startsWith("image/"));
        const prompt = isMathSubject && hasImageFiles ? `You are an experienced maths teacher carefully marking a student's handwritten worksheet. Your job is to be ACCURATE and FAIR \u2014 do not mark a correct answer as wrong.

ASSIGNMENT: ${params.assignmentTitle}
SUBJECT: ${params.subject}
${params.assignmentDescription ? `DESCRIPTION: ${params.assignmentDescription}` : ""}

---
CRITICAL INSTRUCTIONS FOR HANDWRITTEN MATHS:

1. SCAN THE IMAGE carefully. Identify every numbered problem on the worksheet.

2. For EACH problem, do the following in your head (do NOT put this reasoning in the JSON output):
   a. Read the printed question text (e.g. "-2 + 3 = ___")
   b. Calculate the mathematically correct answer yourself (e.g. 1)
   c. Read what the student has written in the answer blank \u2014 handwriting can be messy:
      - A minus sign may look like a dash or underline
      - The digit "1" may look like a slash or tick mark
      - "0" may look like "D", "O", or an oval
      - Numbers like "-15" have a minus sign followed by digits \u2014 read them together as a negative number
      - If the answer space has a dash/line before digits, it is a NEGATIVE number
   d. Compare: does the student's answer equal the correct answer you calculated?
   e. If YES \u2192 the answer is CORRECT. Do NOT list it as incorrect.
   f. If NO, and you are VERY confident (95%+) about your reading \u2192 list it as incorrect.
   g. If you are UNSURE how to read the handwriting \u2192 give the student the benefit of the doubt and count it as correct.

3. SELF-CHECK RULE (mandatory): Before outputting any problem as "incorrect", verify:
   - You calculated the correct answer as X
   - You read the student's answer as Y
   - X \u2260 Y
   Only if all three are true should you list it as incorrect.
   If your stated "correct answer" in whatIsIncorrect matches what the student appears to have written, you have made a reading error \u2014 remove that problem from the incorrect list.

4. Grouping: Instead of listing every single correct problem individually, you may group them (e.g. "Problems 1, 2, 4\u20138, 10\u201312 are all correct").

Return ONLY raw JSON (no markdown, no code blocks):
{
  "overallAssessment": "2-3 sentence fair summary of the student's performance",
  "whatIsCorrect": ["Brief summary of correct answers, e.g. 'Problems 1, 2, 4, 5, 6, 7, 8, 10, 11, 12 are all correct'"],
  "whatIsIncorrect": ["Problem X is incorrect; student wrote Y, correct answer is Z"],
  "whatIsMissing": ["any problems left completely blank"],
  "suggestedNextSteps": ["specific, constructive improvement tip"]
}` : `You are an experienced teacher reviewing a student's assignment submission. Provide a thorough, fair, and constructive assessment.

ASSIGNMENT TITLE: ${params.assignmentTitle}
SUBJECT: ${params.subject}
${params.assignmentDescription ? `ASSIGNMENT DESCRIPTION: ${params.assignmentDescription}` : ""}
${params.assignmentInstructions ? `INSTRUCTIONS GIVEN TO STUDENT: ${params.assignmentInstructions}` : ""}

STUDENT'S SUBMITTED WORK:
${hasText ? params.studentContent : hasFiles ? "(See attached file(s) below)" : "(No written response provided)"}

${hasFiles ? `The student submitted ${params.files.length} file(s) \u2014 review their contents carefully above when assessing correctness.` : ""}

Check the student's work thoroughly against the assignment brief. Assess:
1. What has the student done CORRECTLY or addressed well?
2. What is INCORRECT, has errors, or is factually/logically wrong?
3. What is MISSING \u2014 required parts of the assignment not addressed?
4. What are the suggested next steps for improvement?
5. Provide a brief overall assessment paragraph (2-3 sentences).

Return the response as JSON with this exact structure (no markdown, just raw JSON):
{
  "overallAssessment": "2-3 sentence overall summary of the submission quality",
  "whatIsCorrect": ["specific thing done correctly", "another correct element"],
  "whatIsIncorrect": ["specific error or incorrect element", "another mistake"],
  "whatIsMissing": ["required element not addressed", "missing section or concept"],
  "suggestedNextSteps": ["specific actionable suggestion", "another improvement step"]
}

Be specific and reference the actual content of the student's work. If the submission is very short or incomplete, reflect that in your assessment.`;
        try {
          const contentParts = [{ text: prompt }];
          if (hasFiles) {
            for (const f of params.files) {
              const supported = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif", "application/pdf"];
              if (supported.includes(f.mimeType)) {
                contentParts.push({
                  inlineData: {
                    mimeType: f.mimeType,
                    data: f.buffer.toString("base64")
                  }
                });
              }
            }
          }
          const response = await this.generateWithFallback(contentParts);
          const check = this.safeParseJSON(response, "object");
          return {
            overallAssessment: check.overallAssessment || "Assessment could not be generated.",
            whatIsCorrect: Array.isArray(check.whatIsCorrect) ? check.whatIsCorrect : [],
            whatIsIncorrect: Array.isArray(check.whatIsIncorrect) ? check.whatIsIncorrect : [],
            whatIsMissing: Array.isArray(check.whatIsMissing) ? check.whatIsMissing : [],
            suggestedNextSteps: Array.isArray(check.suggestedNextSteps) ? check.suggestedNextSteps : [],
            canFullyCheck: true
          };
        } catch (error) {
          console.error("Error checking assignment:", error);
          const msg = error.message || "Failed to check assignment. Please try again.";
          throw new Error(msg);
        }
      }
      isConfigured() {
        return !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);
      }
      async extractWorksheetFromPDF(pdfPath, options) {
        try {
          const uploadResult = await fileManager.uploadFile(pdfPath, {
            mimeType: "application/pdf",
            displayName: path.basename(pdfPath)
          });
          console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);
          let file = await fileManager.getFile(uploadResult.file.name);
          while (file.state === "PROCESSING") {
            await new Promise((resolve) => setTimeout(resolve, 2e3));
            file = await fileManager.getFile(uploadResult.file.name);
          }
          if (file.state === "FAILED") {
            throw new Error("PDF processing failed");
          }
          const pdfModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const pageRange = options?.startPage && options?.endPage ? `Focus on pages ${options.startPage} to ${options.endPage}.` : "Process all pages.";
          const prompt = `You are an expert at converting educational PDFs into digital worksheets.

Analyze this PDF document and extract ALL questions, exercises, and content to create a comprehensive digital worksheet.

${pageRange}

For each piece of content, determine the appropriate question type:
- "information" - For instructional text, examples, or reading passages (not questions)
- "multiple_choice" - Questions with specific answer options (A, B, C, D, etc.)
- "short_text" - Questions requiring brief 1-2 word or short phrase answers
- "long_text" - Questions requiring paragraph-length written responses
- "fill_blank" - Sentences with blanks to fill in
- "true_false" - True/False questions

IMPORTANT EXTRACTION RULES:
1. Preserve the EXACT wording of all questions from the PDF
2. For multiple choice, extract ALL answer options exactly as shown
3. Include any diagrams/images descriptions as part of the question text if relevant
4. Group questions by their page number in the PDF
5. For reading comprehension, include the passage as an "information" type, followed by questions
6. Extract correct answers if they are provided in the PDF (often in answer keys)
7. Assign point values based on question complexity (simple: 1-2 pts, medium: 3-5 pts, complex: 10+ pts)

${options?.subject ? `Subject hint: ${options.subject}` : ""}
${options?.gradeLevel ? `Grade level hint: ${options.gradeLevel}` : ""}

Return the response as JSON with this EXACT structure (no markdown, just raw JSON):
{
  "title": "Worksheet title from the PDF",
  "subject": "Subject area (English, Math, Science, etc.)",
  "description": "Brief description of the worksheet content",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page title or section name",
      "questions": [
        {
          "questionNumber": 1,
          "questionType": "multiple_choice",
          "questionText": "The exact question text",
          "options": [
            { "id": "a", "text": "Option A text" },
            { "id": "b", "text": "Option B text" },
            { "id": "c", "text": "Option C text" },
            { "id": "d", "text": "Option D text" }
          ],
          "correctAnswer": "a",
          "helpText": "A hint without giving away the answer",
          "points": 2
        }
      ]
    }
  ]
}

Extract all content comprehensively. Do not summarize or skip any questions.`;
          const result = await pdfModel.generateContent([
            {
              fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
              }
            },
            { text: prompt }
          ]);
          const response = result.response.text();
          const worksheetData = this.safeParseJSON(response, "object");
          await fileManager.deleteFile(uploadResult.file.name);
          return worksheetData;
        } catch (error) {
          console.error("Error extracting worksheet from PDF:", error);
          throw new Error(error.message || "Failed to extract worksheet from PDF. Please try again.");
        }
      }
    };
    aiService = new AIService();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_customAuth();
init_schema();
init_db();
init_schema();
import { createServer } from "http";
import nodemailer2 from "nodemailer";
import multer from "multer";
import { randomUUID as randomUUID2 } from "crypto";
import { eq as eq3, desc as desc3, inArray as inArray2, and as and3, lte, isNotNull, ne as ne2, gt as gt2, gte as gte2, max, asc as asc2, count, or as or2, isNull as isNull2, like } from "drizzle-orm";

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path4) => path4.trim()).filter((path4) => path4.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600, originalFileName) {
    try {
      const [metadata] = await file.getMetadata();
      let fileName = originalFileName;
      if (!fileName) {
        fileName = metadata.metadata?.originalName || metadata.name?.split("/").pop() || "download";
      }
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size?.toString() || "0",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
        "Accept-Ranges": "bytes"
      });
      const [fileContents] = await file.download();
      res.end(fileContents);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(contentType) {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
      contentType
    });
  }
  // Set metadata for an uploaded object
  async setObjectMetadata(uploadURL, metadata) {
    try {
      const url = new URL(uploadURL);
      const pathParts = url.pathname.split("/");
      if (pathParts.length < 3) {
        throw new Error("Invalid upload URL format");
      }
      const bucketName = pathParts[1];
      const objectName = pathParts.slice(2).join("/");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File not found");
      }
      await file.setMetadata({
        metadata
      });
    } catch (error) {
      console.error("Error setting object metadata:", error);
      throw error;
    }
  }
  // Get object entity file from path
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
};
function parseObjectPath(path4) {
  if (!path4.startsWith("/")) {
    path4 = `/${path4}`;
  }
  const pathParts = path4.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
  contentType
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  if (contentType) {
    request.content_type = contentType;
  }
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/routes.ts
async function generateStudentPerformanceReport(storage2, companyId, parameters) {
  const students2 = await storage2.getStudentsByCompany(companyId);
  const data = [];
  for (const student of students2) {
    const user = await storage2.getUser(student.userId);
    const submissions2 = await storage2.getSubmissionsByStudent(student.id);
    const totalSubmissions = submissions2.length;
    const gradedSubmissions = submissions2.filter((s) => s.grade !== null);
    const avgGrade = gradedSubmissions.length > 0 ? gradedSubmissions.reduce((sum2, s) => sum2 + (s.grade || 0), 0) / gradedSubmissions.length : null;
    data.push({
      studentName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
      email: user?.email || "",
      gradeLevel: student.gradeLevel || "N/A",
      totalSubmissions,
      gradedSubmissions: gradedSubmissions.length,
      averageGrade: avgGrade !== null ? avgGrade.toFixed(1) : "N/A",
      completionRate: totalSubmissions > 0 ? (gradedSubmissions.length / totalSubmissions * 100).toFixed(1) + "%" : "0%"
    });
  }
  return {
    title: "Student Performance Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalStudents: students2.length },
    data
  };
}
async function generateAttendanceSummaryReport(storage2, companyId, parameters) {
  const students2 = await storage2.getStudentsByCompany(companyId);
  const data = [];
  for (const student of students2) {
    const user = await storage2.getUser(student.userId);
    const attendance = await storage2.getAttendanceByStudent(student.id);
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const total = attendance.length;
    data.push({
      studentName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
      email: user?.email || "",
      totalSessions: total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? (present / total * 100).toFixed(1) + "%" : "N/A"
    });
  }
  return {
    title: "Attendance Summary Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalStudents: students2.length },
    data
  };
}
async function generateClassUtilizationReport(storage2, companyId, parameters) {
  const classes2 = await storage2.getClassesByCompany(companyId);
  const data = [];
  for (const cls of classes2) {
    const enrollments = await storage2.getStudentClassAssignmentsByClass(cls.id);
    const utilizationRate = cls.maxStudents > 0 ? enrollments.length / cls.maxStudents * 100 : 0;
    data.push({
      className: cls.name,
      subject: cls.subject,
      maxCapacity: cls.maxStudents,
      enrolled: enrollments.length,
      availableSpots: cls.maxStudents - enrollments.length,
      utilizationRate: utilizationRate.toFixed(1) + "%",
      status: cls.isActive ? "Active" : "Inactive"
    });
  }
  return {
    title: "Class Utilization Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalClasses: classes2.length },
    data
  };
}
async function generateAssignmentCompletionReport(storage2, companyId, parameters) {
  const assignments3 = await storage2.getAssignmentsByCompany(companyId);
  const data = [];
  for (const assignment of assignments3) {
    const submissions2 = await storage2.getSubmissionsByAssignment(assignment.id);
    const submitted = submissions2.length;
    const graded = submissions2.filter((s) => s.status === "graded").length;
    data.push({
      assignmentTitle: assignment.title,
      type: assignment.kind || "worksheet",
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "N/A",
      totalSubmissions: submitted,
      gradedCount: graded,
      pendingGrading: submitted - graded,
      status: assignment.status
    });
  }
  return {
    title: "Assignment Completion Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalAssignments: assignments3.length },
    data
  };
}
async function generateTutorWorkloadReport(storage2, companyId, parameters) {
  const tutors2 = await storage2.getTutorsByCompany(companyId);
  const data = [];
  for (const tutor of tutors2) {
    const user = await storage2.getUser(tutor.userId);
    const classes2 = await storage2.getClassesByTutor(tutor.id);
    const students2 = await storage2.getStudentsByTutor(tutor.id);
    data.push({
      tutorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
      email: user?.email || "",
      specialization: tutor.specialization || "General",
      totalClasses: classes2.length,
      totalStudents: students2.length,
      status: tutor.isVerified ? "Verified" : "Pending"
    });
  }
  return {
    title: "Tutor Workload Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalTutors: tutors2.length },
    data
  };
}
async function generateEnrollmentTrendsReport(storage2, companyId, parameters) {
  const students2 = await storage2.getStudentsByCompany(companyId);
  const terms = await storage2.getTermsByCompany(companyId);
  const enrollmentsByTerm = {};
  for (const term of terms) {
    enrollmentsByTerm[term.name] = 0;
  }
  for (const student of students2) {
    if (student.termId) {
      const term = terms.find((t) => t.id === student.termId);
      if (term) {
        enrollmentsByTerm[term.name] = (enrollmentsByTerm[term.name] || 0) + 1;
      }
    }
  }
  const data = Object.entries(enrollmentsByTerm).map(([termName, count2]) => ({
    term: termName,
    enrolledStudents: count2
  }));
  return {
    title: "Enrollment Trends Report",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: { totalStudents: students2.length, totalTerms: terms.length },
    data
  };
}
function parseObjectPath2(path4) {
  if (!path4.startsWith("/")) {
    path4 = `/${path4}`;
  }
  const pathParts = path4.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function notifyParentOfSubmission(studentId, assignmentId, submittedAt, status) {
  try {
    const parentInfo = await storage.getParentUserByStudentId(studentId);
    if (!parentInfo) {
      console.log("No parent found for student, skipping notification");
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
      studentFirstName: studentUser.firstName || "",
      studentLastName: studentUser.lastName || "",
      assignmentTitle: assignment.title,
      submittedAt,
      isLate,
      status
    });
    console.log(`Parent notification sent to ${parentInfo.email} for assignment: ${assignment.title}`);
  } catch (error) {
    console.error("Failed to send parent notification:", error);
  }
}
async function registerRoutes(app2) {
  setupCustomAuth(app2);
  app2.get("/api/me", isAuthenticated, async (req, res) => {
    const { password, ...user } = req.user;
    res.json(user);
  });
  app2.post("/api/me/accept-policies", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      await storage.updateUser(user.id, {
        termsAcceptedAt: /* @__PURE__ */ new Date(),
        termsVersion: "1.0"
      });
      res.json({ ok: true });
    } catch (error) {
      console.error("Error accepting policies:", error);
      res.status(500).json({ message: "Failed to save policy acceptance" });
    }
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024
      // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|xls|xlsx|ppt|pptx)$/i;
      if (allowedTypes.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, PNG, GIF, XLS, XLSX, PPT, or PPTX files."));
      }
    }
  });
  app2.get("/api/companies/:companyId/assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const companyId = req.params.companyId;
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      const assignments3 = await storage.getAssignmentsByCompany(companyId);
      res.json(assignments3);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/classes/:classId/assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      const assignments3 = await storage.getAssignmentsByClass(classId);
      if (user.role === "student") {
        const safeAssignments = assignments3.map((a) => {
          const { solutionText, solutionFileUrls, solutionNotes, correctAnswer, ...safe } = a;
          return safe;
        });
        return res.json(safeAssignments);
      }
      res.json(assignments3);
    } catch (error) {
      console.error("Error fetching class assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/students/:studentId/terms", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { studentId } = req.params;
      if (user.role === "student") {
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
  app2.get("/api/students/:studentId/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { studentId } = req.params;
      if (user.role === "student") {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const classes2 = await storage.getStudentClasses(studentId);
      res.json(classes2);
    } catch (error) {
      console.error("Error fetching student classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  app2.get("/api/students/:studentId/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { studentId } = req.params;
      if (user.role === "student") {
        const studentProfile = await storage.getStudentByUserId(user.id);
        if (!studentProfile || studentProfile.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const submissions2 = await storage.getStudentSubmissions(studentId);
      res.json(submissions2);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.post("/api/assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      console.log("Assignment creation request received:", {
        body: req.body,
        userId: user.id,
        userRole: user.role
      });
      if (!["company_admin", "tutor"].includes(user.role)) {
        console.log("Access denied for role:", user.role);
        return res.status(403).json({ message: "Access denied" });
      }
      const assignmentData = {
        ...req.body,
        createdBy: user.id,
        submissionDate: new Date(req.body.submissionDate),
        // Convert string to Date
        // Convert empty strings to null for optional foreign key fields (not regular strings)
        academicYearId: req.body.academicYearId || null,
        academicTermId: req.body.academicTermId || null,
        termId: req.body.termId || null,
        worksheetId: req.body.worksheetId || null
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
  app2.get("/api/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Access denied" });
        }
        const studentClasses = await storage.getStudentClasses(student.id);
        const enrolledClassIds = studentClasses.map((c) => c.id);
        if (student.classId) {
          enrolledClassIds.push(student.classId);
        }
        if (!assignment.classId || !enrolledClassIds.includes(assignment.classId)) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(403).json({ message: "Access denied" });
        }
        const children = await storage.getChildrenByParentId(parent.id);
        const childClassIds = [];
        for (const child of children) {
          const childClasses = await storage.getStudentClasses(child.id);
          childClasses.forEach((c) => childClassIds.push(c.id));
          if (child.classId) {
            childClassIds.push(child.classId);
          }
        }
        if (!assignment.classId || !childClassIds.includes(assignment.classId)) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || assignment.createdBy !== user.id && assignment.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== assignment.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      if (user.role === "student") {
        const { solutionText, solutionFileUrls, solutionNotes, correctAnswer, ...safeAssignment } = assignment;
        return res.json(safeAssignment);
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });
  app2.patch("/api/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingAssignment = await storage.getAssignment(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (user.role === "tutor" && existingAssignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== existingAssignment.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const updateData = { ...req.body };
      if (updateData.submissionDate && typeof updateData.submissionDate === "string") {
        updateData.submissionDate = new Date(updateData.submissionDate);
      }
      if ("academicYearId" in updateData) updateData.academicYearId = updateData.academicYearId || null;
      if ("academicTermId" in updateData) updateData.academicTermId = updateData.academicTermId || null;
      if ("termId" in updateData) updateData.termId = updateData.termId || null;
      if ("worksheetId" in updateData) updateData.worksheetId = updateData.worksheetId || null;
      const validatedData = insertAssignmentSchema.partial().parse(updateData);
      const updatedAssignment = await storage.updateAssignment(assignmentId, validatedData);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });
  app2.patch("/api/assignments/:id/page-rotation", isAuthenticated, async (req, res) => {
    try {
      const { pageNum, rotation } = req.body;
      if (typeof pageNum !== "number" || typeof rotation !== "number") {
        return res.status(400).json({ message: "pageNum and rotation are required numbers" });
      }
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) return res.status(404).json({ message: "Assignment not found" });
      const existing = assignment.pageRotations || {};
      const updated = { ...existing, [String(pageNum)]: rotation };
      await storage.updateAssignment(req.params.id, { pageRotations: updated });
      res.json({ pageRotations: updated });
    } catch (error) {
      console.error("Error saving page rotation:", error);
      res.status(500).json({ message: "Failed to save page rotation" });
    }
  });
  app2.delete("/api/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      const existingAssignment = await storage.getAssignment(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (user.role === "tutor" && existingAssignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === "company_admin") {
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
  app2.post("/api/assignments/:id/upload", isAuthenticated, upload.array("files", 10), async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (user.role === "tutor" && assignment.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const fileUrls = [];
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      for (const file of files) {
        const fileId = randomUUID2();
        const objectPath = `${privateDir}/uploads/${fileId}`;
        const pathParts = objectPath.split("/").filter((p) => p);
        const bucketName = pathParts[0];
        const objectName = pathParts.slice(1).join("/");
        const bucket = objectStorageClient.bucket(bucketName);
        const gcsFile = bucket.file(objectName);
        await gcsFile.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          }
        });
        fileUrls.push(`/api/files/${fileId}`);
      }
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
  app2.get("/api/students/:studentId/assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const studentId = req.params.studentId;
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "student" && student.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const studentClasses = await storage.getClassesByStudent(studentId);
      const assignments3 = [];
      for (const classAssignment of studentClasses) {
        const classAssignments = await storage.getAssignmentsByClass(classAssignment.classId);
        assignments3.push(...classAssignments);
      }
      const enrichedAssignments = await Promise.all(assignments3.map(async (assignment) => {
        if (assignment.assignmentKind === "worksheet" && assignment.worksheetId) {
          const worksheet = await storage.getFullWorksheet(assignment.worksheetId);
          return { ...assignment, worksheet };
        }
        return assignment;
      }));
      const safeAssignments = enrichedAssignments.map(({ correctAnswer, solutionText, solutionFileUrls, solutionNotes, ...assignment }) => assignment);
      res.json(safeAssignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.post("/api/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      const submissionData = {
        ...req.body,
        studentId: student.id,
        submittedAt: req.body.isDraft ? void 0 : /* @__PURE__ */ new Date(),
        status: req.body.isDraft ? "draft" : "submitted"
      };
      const validatedData = insertSubmissionSchema.parse(submissionData);
      const existingSubmissions = await storage.getStudentSubmissions(student.id);
      const existingSubmission = existingSubmissions.find(
        (s) => s.assignmentId === req.body.assignmentId && s.documentUrl === req.body.documentUrl
      );
      let submission;
      if (existingSubmission) {
        submission = await storage.updateSubmission(existingSubmission.id, validatedData);
      } else {
        submission = await storage.createSubmission(validatedData);
      }
      if (!req.body.isDraft && req.body.assignmentId) {
        const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : /* @__PURE__ */ new Date();
        notifyParentOfSubmission(student.id, req.body.assignmentId, submissionTime, "submitted");
      }
      res.status(existingSubmission ? 200 : 201).json(submission);
    } catch (error) {
      console.error("Error creating/updating submission:", error);
      res.status(500).json({ message: "Failed to save submission" });
    }
  });
  app2.post("/api/assignments/:assignmentId/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.assignmentId;
      if (user.role !== "student") {
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
      if (!req.body.isDraft) {
        const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : /* @__PURE__ */ new Date();
        notifyParentOfSubmission(student.id, assignmentId, submissionTime, "submitted");
      }
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });
  app2.get("/api/assignments/:assignmentId/my-submission", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Only students can access their submissions" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      const { assignmentId } = req.params;
      const submissions2 = await storage.getStudentSubmissions(student.id);
      const submission = submissions2.find((s) => s.assignmentId === assignmentId);
      if (!submission) {
        return res.status(404).json({ message: "No submission found" });
      }
      const response = {
        ...submission,
        annotations: submission.annotations ? JSON.parse(submission.annotations) : null
      };
      res.json(response);
    } catch (error) {
      console.error("Error fetching student submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });
  app2.post("/api/submissions/annotated", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Only students can submit" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      const { assignmentId, status, annotations } = req.body;
      if (!assignmentId) {
        return res.status(400).json({ message: "Assignment ID is required" });
      }
      let documentUrl = null;
      if (req.file) {
        const objectStorageService = new ObjectStorageService();
        const fileId = crypto.randomUUID();
        const privateDir = objectStorageService.getPrivateObjectDir();
        const objectPath = `${privateDir}/uploads/${fileId}`;
        const pathParts = objectPath.split("/").filter((p) => p);
        const bucketName = pathParts[0];
        const objectName = pathParts.slice(1).join("/");
        const bucket = objectStorageClient.bucket(bucketName);
        const gcsFile = bucket.file(objectName);
        await gcsFile.save(req.file.buffer, {
          metadata: {
            contentType: req.file.mimetype || "image/png",
            metadata: {
              originalName: req.file.originalname,
              size: req.file.size.toString(),
              uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          }
        });
        documentUrl = fileId;
      }
      const existingSubmissions = await storage.getStudentSubmissions(student.id);
      const existingSubmission = existingSubmissions.find((s) => s.assignmentId === assignmentId);
      const submissionData = {
        assignmentId,
        studentId: student.id,
        documentUrl,
        annotations: annotations || null,
        // Store as JSON string
        status: status === "submitted" ? "submitted" : "draft",
        submittedAt: status === "submitted" ? /* @__PURE__ */ new Date() : void 0
      };
      let submission;
      if (existingSubmission) {
        submission = await storage.updateSubmission(existingSubmission.id, submissionData);
      } else {
        const validatedData = insertSubmissionSchema.parse(submissionData);
        submission = await storage.createSubmission(validatedData);
      }
      if (status === "submitted") {
        const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : /* @__PURE__ */ new Date();
        notifyParentOfSubmission(student.id, assignmentId, submissionTime, "submitted");
      }
      res.json(submission);
    } catch (error) {
      console.error("Error saving annotated submission:", error);
      res.status(500).json({ message: "Failed to save submission" });
    }
  });
  app2.post("/api/submissions/auto-save-annotations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Only students can save annotations" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      const { assignmentId, annotations } = req.body;
      if (!assignmentId) {
        return res.status(400).json({ message: "Assignment ID is required" });
      }
      const existingSubmissions = await storage.getStudentSubmissions(student.id);
      const existingSubmission = existingSubmissions.find((s) => s.assignmentId === assignmentId);
      let submission;
      if (existingSubmission) {
        submission = await storage.updateSubmission(existingSubmission.id, {
          annotations: annotations || null
        });
      } else {
        const submissionData = {
          assignmentId,
          studentId: student.id,
          documentUrl: null,
          annotations: annotations || null,
          status: "draft"
        };
        const validatedData = insertSubmissionSchema.parse(submissionData);
        submission = await storage.createSubmission(validatedData);
      }
      res.json(submission);
    } catch (error) {
      console.error("Error auto-saving annotations:", error);
      res.status(500).json({ message: "Failed to auto-save annotations" });
    }
  });
  app2.patch("/api/submissions/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const submissionId = req.params.id;
      const existingSubmission = await storage.getSubmission(submissionId);
      if (!existingSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student || existingSubmission.studentId !== student.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const updateData = { ...req.body };
      if (updateData.status === "submitted" && !updateData.submittedAt) {
        updateData.submittedAt = /* @__PURE__ */ new Date();
      } else if (updateData.status === "draft") {
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
  app2.get("/api/assignments/:assignmentId/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.assignmentId;
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Access denied" });
        }
        const submissions3 = await storage.getSubmissionsByAssignmentAndStudent(assignmentId, student.id);
        return res.json(submissions3);
      }
      if (!["company_admin", "tutor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const submissions2 = await storage.getSubmissionsByAssignment(assignmentId);
      res.json(submissions2);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.get("/api/assignments/:assignmentId/files/:filename", isAuthenticated, async (req, res) => {
    try {
      const { assignmentId, filename } = req.params;
      const user = req.user;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(403).json({ message: "Access denied" });
        }
        const studentClasses = await storage.getStudentClasses(student.id);
        const hasAccess = studentClasses.some((c) => c.id === assignment.classId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const fileId = filename;
      console.log(`Looking for assignment file with ID: ${fileId}`);
      try {
        const objectStorageService = new ObjectStorageService();
        const privateDir = objectStorageService.getPrivateObjectDir();
        const objectPath = `${privateDir}/uploads/${fileId}`;
        console.log("Trying to fetch from object storage path:", objectPath);
        const pathParts = objectPath.split("/");
        const bucketName = pathParts[1];
        const objectName = pathParts.slice(2).join("/");
        console.log("Bucket:", bucketName, "Object:", objectName);
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        const [exists] = await file.exists();
        if (exists) {
          console.log("Found file in object storage, streaming...");
          const [metadata] = await file.getMetadata();
          console.log("File metadata:", {
            name: metadata.name,
            contentType: metadata.contentType,
            size: metadata.size,
            metadata: metadata.metadata
          });
          let filename2 = `assignment-file`;
          if (metadata.metadata?.originalName) {
            filename2 = metadata.metadata.originalName;
          } else if (metadata.metadata?.filename) {
            filename2 = metadata.metadata.filename;
          } else if (metadata.contentType) {
            const contentTypeMap = {
              "application/pdf": "pdf",
              "application/msword": "doc",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
              "application/vnd.ms-excel": "xls",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
              "image/png": "png",
              "image/jpeg": "jpg",
              "text/plain": "txt"
            };
            const extension = contentTypeMap[metadata.contentType] || "bin";
            filename2 = `assignment-file.${extension}`;
          }
          console.log("Using filename:", filename2);
          res.setHeader("Content-Disposition", `attachment; filename="${filename2}"`);
          res.setHeader("Content-Type", metadata.contentType || "application/octet-stream");
          res.setHeader("Content-Length", metadata.size);
          const stream = file.createReadStream();
          stream.on("error", (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ error: "Error streaming file" });
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
  app2.get("/api/company/students", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      let students2 = [];
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          students2 = await storage.getCompanyStudentsByCompanyId(companyAdmin.companyId);
        }
      }
      res.json(students2);
    } catch (error) {
      console.error("Error fetching company students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  app2.get("/api/students/:studentId/terms", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const terms = await storage.getStudentTerms(studentId);
      res.json(terms);
    } catch (error) {
      console.error("Error fetching student terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });
  app2.get("/api/students/:studentId/classes", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const classes2 = await storage.getStudentClasses(studentId);
      res.json(classes2);
    } catch (error) {
      console.error("Error fetching student classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  app2.get("/api/students/:studentId/submissions", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const submissions2 = await storage.getStudentSubmissions(studentId);
      res.json(submissions2);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.get("/api/auth/student-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });
  app2.post("/api/users/accept-terms", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { version } = req.body;
      if (!version) {
        return res.status(400).json({ message: "Terms version is required" });
      }
      await storage.updateUser(userId, {
        termsAcceptedAt: /* @__PURE__ */ new Date(),
        termsVersion: version
      });
      res.json({ success: true, message: "Terms accepted successfully" });
    } catch (error) {
      console.error("Error accepting terms:", error);
      res.status(500).json({ message: "Failed to accept terms" });
    }
  });
  app2.get("/api/company/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin profile not found" });
      }
      const [regularSubmissions, worksheetSubmissions] = await Promise.all([
        storage.getCompanySubmissions(companyAdmin.companyId),
        storage.getCompanyWorksheetSubmissions(companyAdmin.companyId)
      ]);
      const allSubmissions = [...regularSubmissions, ...worksheetSubmissions].sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt).getTime();
        const dateB = new Date(b.submittedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      res.json(allSubmissions);
    } catch (error) {
      console.error("Error fetching company submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.patch("/api/company/submissions/:submissionId/grade", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin profile not found" });
      }
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      if (score !== void 0 && (typeof score !== "number" || score < 0 || score > 100)) {
        return res.status(400).json({ message: "Score must be a number between 0 and 100" });
      }
      const updated = await storage.gradeSubmission(submissionId, score || 0, feedback || "", user.id);
      res.json(updated);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  });
  app2.post("/api/submissions/:submissionId/ai-check", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "tutor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { aiService: aiService3 } = await Promise.resolve().then(() => (init_ai(), ai_exports));
      if (!aiService3.isConfigured()) {
        return res.status(503).json({ message: "AI service is not configured" });
      }
      const { submissionId } = req.params;
      const submission = await storage.getSubmission(submissionId);
      if (!submission) return res.status(404).json({ message: "Submission not found" });
      if (submission.aiCheckResult) {
        try {
          const cached = JSON.parse(submission.aiCheckResult);
          return res.json({ ...cached, cached: true });
        } catch {
        }
      }
      const assignment = await storage.getAssignment(submission.assignmentId);
      if (!assignment) return res.status(404).json({ message: "Assignment not found" });
      const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif", "application/pdf"];
      const downloadedFiles = [];
      const fileWarnings = [];
      const downloadByFileId = async (fileId) => {
        try {
          const svc = new ObjectStorageService();
          const privateDir = svc.getPrivateObjectDir();
          const objectPath = `${privateDir}/uploads/${fileId}`;
          const pathParts = objectPath.split("/").filter((p) => p);
          const bucketName = pathParts[0];
          const objectName = pathParts.slice(1).join("/");
          const bucket = objectStorageClient.bucket(bucketName);
          const file = bucket.file(objectName);
          const [exists] = await file.exists();
          if (!exists) return null;
          const [meta] = await file.getMetadata();
          const mimeType = meta.contentType || "image/png";
          if (!supportedMimeTypes.includes(mimeType)) {
            fileWarnings.push(`One file (${mimeType}) could not be read by AI \u2014 only images and PDFs are supported.`);
            return null;
          }
          const [buffer] = await file.download();
          return { buffer, mimeType };
        } catch (e) {
          console.warn("Could not download file for AI check:", fileId, e);
          fileWarnings.push("One submitted file could not be accessed \u2014 it may have been deleted or is temporarily unavailable.");
          return null;
        }
      };
      const documentUrl = submission.documentUrl || submission.document_url;
      if (documentUrl && !documentUrl.startsWith("http")) {
        const downloaded = await downloadByFileId(documentUrl);
        if (downloaded) downloadedFiles.push(downloaded);
      }
      const fileUrls = Array.isArray(submission.fileUrls) ? submission.fileUrls : [];
      for (const fileUrl of fileUrls) {
        try {
          let file;
          if (fileUrl.startsWith("/objects/")) {
            const svc = new ObjectStorageService();
            file = await svc.getObjectEntityFile(fileUrl);
          } else if (fileUrl.includes("googleapis.com")) {
            const match = fileUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
            if (match) {
              file = objectStorageClient.bucket(match[1]).file(match[2]);
            }
          } else if (!fileUrl.startsWith("http")) {
            const downloaded = await downloadByFileId(fileUrl);
            if (downloaded) downloadedFiles.push(downloaded);
            continue;
          }
          if (file) {
            const [meta] = await file.getMetadata();
            const mimeType = meta.contentType || "application/octet-stream";
            if (!supportedMimeTypes.includes(mimeType)) {
              fileWarnings.push(`One file (${mimeType}) could not be read by AI \u2014 only images and PDFs are supported.`);
            } else {
              const [buffer] = await file.download();
              downloadedFiles.push({ buffer, mimeType });
            }
          }
        } catch (e) {
          console.warn("Could not download file for AI check:", fileUrl, e);
          fileWarnings.push("One submitted file could not be accessed \u2014 it may have been deleted or is temporarily unavailable.");
        }
      }
      console.log(`AI check: found ${downloadedFiles.length} file(s) to analyse for submission ${submissionId}`);
      const result = await aiService3.checkAssignment({
        assignmentTitle: assignment.title,
        subject: assignment.subject || "General",
        assignmentDescription: assignment.description || void 0,
        assignmentInstructions: assignment.instructions || void 0,
        studentContent: submission.content || submission.textResponse || void 0,
        files: downloadedFiles.length > 0 ? downloadedFiles : void 0
      });
      try {
        const toStore = { ...result, warnings: fileWarnings };
        await storage.updateSubmission(submissionId, { aiCheckResult: JSON.stringify(toStore) });
      } catch (e) {
        console.warn("Could not persist AI check result:", e);
      }
      res.json({ ...result, warnings: fileWarnings });
    } catch (error) {
      console.error("Error running AI check:", error);
      res.status(500).json({ message: error.message || "Failed to run AI check" });
    }
  });
  app2.patch("/api/submissions/:submissionId/reviewer-annotations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "parent"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { submissionId } = req.params;
      const { reviewerAnnotations } = req.body;
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      if (submission.status === "graded") {
        return res.status(400).json({ message: "Cannot modify annotations after grading" });
      }
      if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor) {
          return res.status(404).json({ message: "Tutor not found" });
        }
      } else if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin) {
          return res.status(404).json({ message: "Company admin not found" });
        }
      } else if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        const student = await storage.getStudent(submission.studentId);
        if (!student || student.parentId !== parent.id) {
          return res.status(403).json({ message: "Access denied to this submission" });
        }
      }
      const updated = await storage.updateSubmissionAnnotations(submissionId, reviewerAnnotations);
      res.json(updated);
    } catch (error) {
      console.error("Error saving reviewer annotations:", error);
      res.status(500).json({ message: "Failed to save annotations" });
    }
  });
  app2.get("/api/submissions/:submissionId/review", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "parent", "student"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { submissionId } = req.params;
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      const assignment = await storage.getAssignment(submission.assignmentId);
      const student = await storage.getStudent(submission.studentId);
      const studentUser = student ? await storage.getUser(student.userId) : null;
      res.json({
        ...submission,
        assignment,
        student: student ? {
          ...student,
          user: studentUser ? {
            firstName: studentUser.firstName,
            lastName: studentUser.lastName,
            email: studentUser.email
          } : null
        } : null
      });
    } catch (error) {
      console.error("Error fetching submission for review:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });
  app2.post("/api/homework/upload-direct", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("Simple file upload:", req.file.originalname, "Size:", req.file.size);
      const fileId = randomUUID2();
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/uploads/${fileId}`;
      const pathParts = objectPath.split("/").filter((p) => p);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            originalName: req.file.originalname,
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      const fileUrl = `/api/files/${fileId}`;
      console.log("File stored in object storage with ID:", fileId);
      res.json({
        success: true,
        fileUrl,
        fileId,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/files/:fileId", isAuthenticated, async (req, res) => {
    try {
      const { fileId } = req.params;
      console.log(`Looking for file with ID: ${fileId}`);
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/uploads/${fileId}`;
      const pathParts = objectPath.split("/").filter((p) => p);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        console.log("Found file in object storage:", fileId);
        await objectStorageService.downloadObject(file, res);
        return;
      }
      console.error(`File ${fileId} not found in object storage`);
      res.status(404).json({ message: "File not found" });
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  app2.get("/api/messaging/contacts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const contacts = [];
      if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (parent) {
          const children = await storage.getParentChildrenWithProgress(parent.id);
          const seenTutorUserIds = /* @__PURE__ */ new Set();
          const seenCompanyIds = /* @__PURE__ */ new Set();
          for (const child of children) {
            const chatEnabled = child.companyInfo?.tutorChatEnabled !== false;
            if (child.tutorInfo && child.tutorInfo.userId && !seenTutorUserIds.has(child.tutorInfo.userId)) {
              seenTutorUserIds.add(child.tutorInfo.userId);
              contacts.push({
                id: child.tutorInfo.userId,
                firstName: child.tutorInfo.firstName,
                lastName: child.tutorInfo.lastName,
                email: child.tutorInfo.email,
                role: "tutor",
                label: `Tutor - ${child.tutorInfo.specialization || "General"}`,
                chatEnabled
              });
            }
            if (child.companyId && !seenCompanyIds.has(child.companyId)) {
              seenCompanyIds.add(child.companyId);
              const supportContacts = await db.select({
                id: companySupportContacts.id,
                userId: companySupportContacts.userId,
                roleLabel: companySupportContacts.roleLabel,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
              }).from(companySupportContacts).leftJoin(users, eq3(companySupportContacts.userId, users.id)).where(eq3(companySupportContacts.companyId, child.companyId));
              for (const sc of supportContacts) {
                if (sc.userId && !seenTutorUserIds.has(sc.userId)) {
                  seenTutorUserIds.add(sc.userId);
                  contacts.push({
                    id: sc.userId,
                    firstName: sc.firstName,
                    lastName: sc.lastName,
                    email: sc.email,
                    role: "support",
                    label: sc.roleLabel || "Support",
                    chatEnabled: true
                  });
                }
              }
            }
          }
        }
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor) {
          const tutorStudents = await db.select({
            userId: students.userId,
            parentId: students.parentId,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }).from(students).leftJoin(users, eq3(students.userId, users.id)).where(eq3(students.tutorId, tutor.id));
          const seenIds = /* @__PURE__ */ new Set();
          for (const s of tutorStudents) {
            if (s.userId && !seenIds.has(s.userId)) {
              seenIds.add(s.userId);
              contacts.push({
                id: s.userId,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                role: "student",
                label: "Student"
              });
            }
            if (s.parentId) {
              const parentRecord = await db.select({
                userId: parents.userId
              }).from(parents).where(eq3(parents.id, s.parentId));
              if (parentRecord[0]?.userId && !seenIds.has(parentRecord[0].userId)) {
                seenIds.add(parentRecord[0].userId);
                const parentUser = await storage.getUser(parentRecord[0].userId);
                if (parentUser) {
                  contacts.push({
                    id: parentUser.id,
                    firstName: parentUser.firstName,
                    lastName: parentUser.lastName,
                    email: parentUser.email,
                    role: "parent",
                    label: `Parent of ${s.firstName} ${s.lastName}`
                  });
                }
              }
            }
          }
        }
      } else if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (student && student.tutorId) {
          const tutor = await storage.getTutor(student.tutorId);
          if (tutor) {
            const tutorUser = await storage.getUser(tutor.userId);
            if (tutorUser) {
              contacts.push({
                id: tutorUser.id,
                firstName: tutorUser.firstName,
                lastName: tutorUser.lastName,
                email: tutorUser.email,
                role: "tutor",
                label: `Tutor - ${tutor.specialization || "General"}`
              });
            }
          }
        }
      }
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching messaging contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });
  app2.get("/api/messages/:receiverId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const senderId = user.id;
      const receiverId = req.params.receiverId;
      const messages2 = await storage.getMessagesBetweenUsers(senderId, receiverId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const senderId = user.id;
      if (user.role === "parent") {
        const receiverId = req.body.receiverId;
        const receiverTutor = await storage.getTutorByUserId(receiverId);
        if (receiverTutor && receiverTutor.companyId) {
          const [company] = await db.select({ tutorChatEnabled: tutoringCompanies.tutorChatEnabled }).from(tutoringCompanies).where(eq3(tutoringCompanies.id, receiverTutor.companyId));
          if (company && company.tutorChatEnabled === false) {
            return res.status(403).json({ message: "Tutor chat has been disabled by the coaching centre. Please contact them directly." });
          }
        }
      }
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  app2.get("/api/parents/me", isAuthenticated, async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== "parent") return res.status(403).json({ message: "Parent access required" });
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
  app2.get("/api/parents/children", isAuthenticated, async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== "parent") return res.status(403).json({ message: "Parent access required" });
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
  app2.get("/api/parents/children/:studentId", isAuthenticated, async (req, res) => {
    const user = req.user;
    const { studentId } = req.params;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (user.role !== "parent") return res.status(403).json({ message: "Parent access required" });
    try {
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent profile not found" });
      }
      const children = await storage.getParentChildrenWithProgress(parent.id);
      const child = children.find((c) => c.id === studentId);
      if (!child) {
        return res.status(403).json({ message: "This child is not linked to your account" });
      }
      res.json(child);
    } catch (error) {
      console.error("Error fetching child details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/submissions/:submissionId/parent-comment", isAuthenticated, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== "parent") {
      return res.status(403).json({ message: "Parent access required" });
    }
    const { submissionId } = req.params;
    const { comment } = req.body;
    if (typeof comment !== "string") {
      return res.status(400).json({ message: "comment field required" });
    }
    try {
      const submission = await storage.getSubmission(submissionId);
      if (!submission) return res.status(404).json({ message: "Submission not found" });
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) return res.status(403).json({ message: "Parent profile not found" });
      const student = await storage.getStudent(submission.studentId);
      if (!student || student.parentId !== parent.id) {
        return res.status(403).json({ message: "Access denied to this submission" });
      }
      const [updated] = await db.update(submissions).set({ parentComment: comment.trim() || null, parentCommentAt: comment.trim() ? /* @__PURE__ */ new Date() : null }).where(eq3(submissions.id, submissionId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error saving parent comment:", error);
      res.status(500).json({ message: "Failed to save comment" });
    }
  });
  app2.get("/api/students/:studentId", isAuthenticated, async (req, res) => {
    const { studentId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    try {
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
      if (user.role === "student" && student.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || student.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || student.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/students/:studentId", isAuthenticated, async (req, res) => {
    const { studentId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    try {
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || student.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || student.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { first_name, last_name, year_group_code, school, roll_number, date_of_birth, address, notes, learning_goals, parents: parents2 } = req.body;
      if (first_name !== void 0 && !String(first_name).trim()) {
        return res.status(400).json({ message: "First name cannot be blank" });
      }
      if (last_name !== void 0 && !String(last_name).trim()) {
        return res.status(400).json({ message: "Last name cannot be blank" });
      }
      const updaterName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
      const contacts = Array.isArray(parents2) ? parents2.filter((p) => p?.name?.trim()).map((p, i) => ({
        name: p.name.trim(),
        relationship: p.relationship?.trim() || null,
        email: p.email?.trim() || null,
        phone: p.phone?.trim() || null,
        isPrimary: !!p.is_primary || i === 0
      })) : void 0;
      const updatedStudent = await storage.updateStudentWithContacts(
        studentId,
        {
          ...first_name !== void 0 ? { firstName: String(first_name).trim() } : {},
          ...last_name !== void 0 ? { lastName: String(last_name).trim() } : {},
          ...school !== void 0 ? { schoolName: school?.trim() || null } : {},
          ...year_group_code !== void 0 ? { yearGroupCode: year_group_code || null } : {},
          ...date_of_birth !== void 0 ? { dateOfBirth: date_of_birth ? new Date(date_of_birth) : null } : {},
          ...address !== void 0 ? { address: address?.trim() || null } : {},
          ...notes !== void 0 ? { notes: notes?.trim() || null } : {},
          ...learning_goals !== void 0 ? { learningGoals: learning_goals?.trim() || null } : {},
          ...roll_number !== void 0 ? { rollNumber: roll_number?.trim() || null } : {},
          updatedAt: /* @__PURE__ */ new Date(),
          updatedByName: updaterName
        },
        contacts
      );
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      let progress2 = [];
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          progress2 = await storage.getProgressByStudent(student.id);
        }
      }
      res.json(progress2);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });
  app2.post("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Only students can create progress entries" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      const validatedData = insertProgressSchema.parse({
        ...req.body,
        studentId: student.id
      });
      const progress2 = await storage.createProgress(validatedData);
      res.json(progress2);
    } catch (error) {
      console.error("Error creating progress:", error);
      res.status(500).json({ message: "Failed to create progress" });
    }
  });
  app2.get("/api/calendar", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const events = await storage.getCalendarEventsByTutor(user.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });
  app2.post("/api/calendar", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const validatedData = insertCalendarEventSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });
  function generateClassEvents(classes2, terms, viewStart, viewEnd) {
    const events = [];
    for (const classItem of classes2) {
      if (!classItem.isActive) continue;
      const term = terms.find((t) => t.id === classItem.termId);
      if (!term) continue;
      const termStart = new Date(term.startDate);
      const termEnd = new Date(term.endDate);
      const rangeStart = viewStart && viewStart > termStart ? viewStart : termStart;
      const rangeEnd = viewEnd && viewEnd < termEnd ? viewEnd : termEnd;
      const current = new Date(rangeStart);
      while (current.getDay() !== classItem.dayOfWeek && current <= rangeEnd) {
        current.setDate(current.getDate() + 1);
      }
      while (current <= rangeEnd) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        events.push({
          id: `class-${classItem.id}-${year}-${month}-${day}`,
          classId: classItem.id,
          className: classItem.name,
          subject: classItem.subject,
          tutorId: classItem.tutorId,
          tutorName: classItem.tutorName || "Unassigned",
          date: `${year}-${month}-${day}`,
          startTime: `${year}-${month}-${day}T${classItem.startTime}:00`,
          endTime: `${year}-${month}-${day}T${classItem.endTime}:00`,
          location: classItem.location,
          dayOfWeek: classItem.dayOfWeek,
          termId: term.id,
          termName: term.name,
          type: "class"
        });
        current.setDate(current.getDate() + 7);
      }
    }
    return events;
  }
  app2.get("/api/calendar/company", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin not found" });
      }
      const { startDate, endDate, classId, tutorId } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const classes2 = await storage.getClassesByCompany(companyAdmin.companyId);
      const academicTerms2 = await storage.getAcademicTermsByCompany(companyAdmin.companyId);
      const holidays = await storage.getAcademicHolidaysByCompany(companyAdmin.companyId);
      const tutorIds = [...new Set(classes2.filter((c) => c.tutorId).map((c) => c.tutorId))];
      const tutorMap = {};
      for (const tid of tutorIds) {
        const tutor = await storage.getTutor(tid);
        if (tutor) {
          const tutorUser = await storage.getUser(tutor.userId);
          tutorMap[tid] = tutorUser ? `${tutorUser.firstName || ""} ${tutorUser.lastName || ""}`.trim() || tutorUser.email : "Unknown";
        }
      }
      const classesWithTutors = classes2.map((c) => ({
        ...c,
        tutorName: c.tutorId ? tutorMap[c.tutorId] || "Unassigned" : "Unassigned"
      }));
      let classEvents = generateClassEvents(classesWithTutors, academicTerms2, start, end);
      if (classId) {
        classEvents = classEvents.filter((e) => e.classId === classId);
      }
      if (tutorId) {
        classEvents = classEvents.filter((e) => e.tutorId === tutorId);
      }
      const now = /* @__PURE__ */ new Date();
      let activeTerm = academicTerms2.find((term) => {
        const termStart = new Date(term.startDate);
        const termEnd = new Date(term.endDate);
        const isActive = term.isActive === true || term.isActive === 1;
        return isActive && now >= termStart && now <= termEnd;
      });
      if (!activeTerm) {
        activeTerm = academicTerms2.find((term) => term.isActive === true || term.isActive === 1);
      }
      if (!activeTerm && academicTerms2.length > 0) {
        activeTerm = academicTerms2[0];
      }
      res.json({
        classes: classEvents,
        holidays,
        activeTerm: activeTerm ? {
          id: activeTerm.id,
          name: activeTerm.name,
          startDate: activeTerm.startDate,
          endDate: activeTerm.endDate
        } : null
      });
    } catch (error) {
      console.error("Error fetching company calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });
  app2.get("/api/calendar/tutor", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const { startDate, endDate, status } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const sessions = await storage.getClassSessionsByTutor(tutor.id, start, end);
      const holidays = tutor.companyId ? await storage.getAcademicHolidaysByCompany(tutor.companyId) : await storage.getPublicHolidays(start, end);
      let filteredSessions = sessions;
      if (status) {
        filteredSessions = filteredSessions.filter((s) => s.status === status);
      }
      res.json({ sessions: filteredSessions, holidays });
    } catch (error) {
      console.error("Error fetching tutor calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });
  app2.get("/api/calendar/student", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["student", "parent", "tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      let studentId = req.query.studentId;
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        studentId = student.id;
      } else if (user.role === "parent" && studentId) {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        const children = await storage.getStudentsByParent(parent.id);
        if (!children.find((c) => c.id === studentId)) {
          return res.status(403).json({ message: "Access denied to this student" });
        }
      }
      if (!studentId) {
        return res.status(400).json({ message: "Student ID required" });
      }
      const { startDate, endDate } = req.query;
      const now = /* @__PURE__ */ new Date();
      const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 2, 0);
      let sessions = await storage.getClassSessionsByStudent(studentId, start, end);
      if (sessions.length === 0) {
        const enrolledClasses = await storage.getEnrolledClassesWithDetails(studentId);
        const virtualSessions = [];
        for (const classInfo of enrolledClasses) {
          if (classInfo.isActive && classInfo.daysOfWeek && classInfo.startTime && classInfo.endTime) {
            const daysOfWeek = Array.isArray(classInfo.daysOfWeek) ? classInfo.daysOfWeek : [classInfo.dayOfWeek || 1];
            const currentDate = new Date(start);
            while (currentDate <= end) {
              const utcDayOfWeek = currentDate.getUTCDay();
              const dayOfWeek = utcDayOfWeek === 0 ? 7 : utcDayOfWeek;
              if (daysOfWeek.includes(dayOfWeek)) {
                const year = currentDate.getUTCFullYear();
                const month = currentDate.getUTCMonth();
                const day = currentDate.getUTCDate();
                const [startHour, startMin] = classInfo.startTime.split(":").map(Number);
                const [endHour, endMin] = classInfo.endTime.split(":").map(Number);
                const sessionStart = new Date(Date.UTC(year, month, day, startHour, startMin, 0, 0));
                const sessionEnd = new Date(Date.UTC(year, month, day, endHour, endMin, 0, 0));
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                virtualSessions.push({
                  id: `virtual-${classInfo.id}-${dateStr}`,
                  classId: classInfo.id,
                  className: classInfo.name,
                  subject: classInfo.subject,
                  startTime: sessionStart.toISOString(),
                  endTime: sessionEnd.toISOString(),
                  sessionDate: dateStr,
                  // Explicit date to avoid timezone issues
                  status: "scheduled",
                  location: classInfo.location,
                  tutorName: classInfo.tutorName
                });
              }
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }
        }
        sessions = virtualSessions;
      }
      const assignments3 = await storage.getStudentAssignments(studentId);
      const holidays = await storage.getPublicHolidays(start, end);
      const homeworkDeadlines = assignments3.filter((a) => a.dueDate).map((a) => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        type: "homework",
        status: a.status
      }));
      res.json({ sessions, holidays, homeworkDeadlines });
    } catch (error) {
      console.error("Error fetching student calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });
  app2.get("/api/calendar/parent", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "parent") {
        return res.status(403).json({ message: "Access denied" });
      }
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      const { startDate, endDate, childId } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const children = await storage.getStudentsByParent(parent.id);
      if (childId) {
        const child = children.find((c) => c.id === childId);
        if (!child) {
          return res.status(404).json({ message: "Child not found" });
        }
        const sessions = await storage.getClassSessionsByStudent(child.id, start, end);
        const assignments3 = await storage.getStudentAssignments(child.id);
        const holidays = await storage.getPublicHolidays(start, end);
        const homeworkDeadlines = assignments3.filter((a) => a.dueDate).map((a) => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          type: "homework"
        }));
        res.json({
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          sessions,
          holidays,
          homeworkDeadlines
        });
      } else {
        const childrenCalendars = await Promise.all(children.map(async (child) => {
          const sessions = await storage.getClassSessionsByStudent(child.id, start, end);
          const attendanceSummary = await storage.getStudentAttendanceSummary(child.id, start, end);
          return {
            childId: child.id,
            childName: `${child.firstName} ${child.lastName}`,
            sessionCount: sessions.length,
            attendanceSummary
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
  app2.get("/api/sessions/today", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ message: "Company admin not found" });
      }
      const { date } = req.query;
      const targetDate = date ? new Date(date) : /* @__PURE__ */ new Date();
      const sessions = await storage.getClassSessionsForDate(companyAdmin.companyId, targetDate);
      const sessionsWithAttendance = await Promise.all(sessions.map(async (s) => {
        const attendance = await storage.getAttendanceBySession(s.session.id);
        const studentAssignments = await storage.getStudentsByClass(s.session.classId);
        return {
          ...s,
          attendance,
          enrolledCount: studentAssignments.length,
          attendedCount: attendance.filter(
            (a) => a.attendance?.status === "present" || a.attendance?.status === "late"
          ).length
        };
      }));
      res.json(sessionsWithAttendance);
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  app2.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const session2 = await storage.createClassSession(req.body);
      res.json(session2);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });
  app2.get("/api/sessions/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session2 = await storage.getClassSession(sessionId);
      if (!session2) {
        return res.status(404).json({ message: "Session not found" });
      }
      const classData = await storage.getClass(session2.classId);
      const attendance = await storage.getAttendanceBySession(sessionId);
      const studentAssignments = await storage.getStudentsByClass(session2.classId);
      let tutorInfo = null;
      if (session2.tutorId) {
        const tutor = await storage.getTutor(session2.tutorId);
        if (tutor) {
          const tutorUser = await storage.getUser(tutor.userId);
          tutorInfo = {
            id: tutor.id,
            firstName: tutorUser?.firstName,
            lastName: tutorUser?.lastName,
            specialization: tutor.specialization
          };
        }
      }
      const enrolledStudents = await Promise.all(studentAssignments.map(async (assignment) => {
        const student = await storage.getStudent(assignment.studentId);
        if (!student) return null;
        const studentUser = await storage.getUser(student.userId);
        return {
          id: student.id,
          firstName: studentUser?.firstName || "",
          lastName: studentUser?.lastName || "",
          gradeLevel: student.gradeLevel
        };
      }));
      res.json({
        session: session2,
        class: classData,
        tutor: tutorInfo,
        attendance,
        enrolledCount: studentAssignments.length,
        enrolledStudents: enrolledStudents.filter(Boolean)
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });
  app2.patch("/api/sessions/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { sessionId } = req.params;
      const session2 = await storage.updateClassSession(sessionId, req.body);
      res.json(session2);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });
  app2.post("/api/classes/:classId/generate-sessions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
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
  app2.post("/api/classes/:classId/session-for-date", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId } = req.params;
      const { date, tutorId } = req.body;
      const session2 = await storage.getOrCreateSessionForDate(classId, new Date(date), tutorId);
      const attendance = await storage.getAttendanceBySession(session2.id);
      res.json({ session: session2, attendance });
    } catch (error) {
      console.error("Error getting/creating session:", error);
      res.status(500).json({ message: "Failed to get or create session" });
    }
  });
  app2.get("/api/classes/:classId/attendance-history", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const history = await storage.getClassAttendanceHistory(classId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });
  app2.get("/api/sessions/:sessionId/attendance", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const attendance = await storage.getAttendanceBySession(sessionId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });
  app2.post("/api/sessions/:sessionId/attendance", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { sessionId } = req.params;
      const session2 = await storage.getClassSession(sessionId);
      if (!session2) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session2.attendanceLocked && user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Attendance is locked for this session" });
      }
      const { studentId, status, notes } = req.body;
      const attendance = await storage.markAttendance({
        sessionId,
        studentId,
        status,
        markedBy: user.id,
        markedAt: /* @__PURE__ */ new Date(),
        notes
      });
      res.json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });
  app2.post("/api/sessions/:sessionId/attendance/bulk", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { sessionId } = req.params;
      const { attendanceList } = req.body;
      const session2 = await storage.getClassSession(sessionId);
      if (!session2) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session2.attendanceLocked && user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Attendance is locked for this session" });
      }
      const results = await Promise.all(attendanceList.map(async (item) => {
        return storage.markAttendance({
          sessionId,
          studentId: item.studentId,
          status: item.status,
          markedBy: user.id,
          markedAt: /* @__PURE__ */ new Date(),
          notes: item.notes
        });
      }));
      const presentCount = results.filter((r) => r.status === "present" || r.status === "late").length;
      await storage.updateClassSession(sessionId, {
        attendedCount: presentCount,
        enrolledCount: attendanceList.length
      });
      res.json({ message: "Attendance marked", results });
    } catch (error) {
      console.error("Error bulk marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });
  app2.post("/api/sessions/:sessionId/attendance/mark-all-present", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
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
  app2.post("/api/attendance/:attendanceId/override", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
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
  app2.post("/api/sessions/:sessionId/lock-attendance", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
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
  app2.get("/api/attendance/summary/student/:studentId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student || student.id !== studentId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        const children = await storage.getStudentsByParent(parent.id);
        if (!children.find((c) => c.id === studentId)) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const summary = await storage.getStudentAttendanceSummary(studentId, start, end);
      const bySubject = await storage.getStudentAttendanceBySubject(studentId);
      const learningHours = await storage.getStudentLearningHours(studentId, start, end);
      res.json({ summary, bySubject, learningHours });
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      res.status(500).json({ message: "Failed to fetch attendance summary" });
    }
  });
  app2.get("/api/holidays", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { startDate, endDate } = req.query;
      let holidays;
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          holidays = await storage.getAcademicHolidaysByCompany(companyAdmin.companyId);
        }
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (tutor?.companyId) {
          holidays = await storage.getAcademicHolidaysByCompany(tutor.companyId);
        }
      } else {
        const start = startDate ? new Date(startDate) : void 0;
        const end = endDate ? new Date(endDate) : void 0;
        holidays = await storage.getPublicHolidays(start, end);
      }
      res.json(holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });
  app2.post("/api/holidays", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      let companyId = null;
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (companyAdmin) {
          companyId = companyAdmin.companyId;
        }
      }
      const holiday = await storage.createAcademicHoliday({
        ...req.body,
        companyId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
      });
      res.json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });
  app2.patch("/api/holidays/:holidayId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { holidayId } = req.params;
      const holiday = await storage.updateAcademicHoliday(holidayId, {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : void 0,
        endDate: req.body.endDate ? new Date(req.body.endDate) : void 0
      });
      res.json(holiday);
    } catch (error) {
      console.error("Error updating holiday:", error);
      res.status(500).json({ message: "Failed to update holiday" });
    }
  });
  app2.delete("/api/holidays/:holidayId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
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
  app2.get("/api/tutor/students-roster", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const { classId } = req.query;
      const classes2 = await storage.getClassesByTutor(tutor.id);
      const targetClasses = classId ? classes2.filter((c) => c.id === classId) : classes2;
      const classesWithStudents = await Promise.all(targetClasses.map(async (classData) => {
        const studentAssignments = await storage.getStudentsByClass(classData.id);
        const studentsWithDetails = await Promise.all(studentAssignments.map(async (assignment) => {
          const student = await storage.getStudent(assignment.studentId);
          if (!student) return null;
          const studentUser = await storage.getUser(student.userId);
          const attendanceSummary = await storage.getStudentAttendanceSummary(student.id);
          const parentInfo = await storage.getParentUserByStudentId(student.id);
          return {
            ...student,
            email: studentUser?.email,
            attendanceSummary,
            parentContact: parentInfo
          };
        }));
        return {
          class: classData,
          students: studentsWithDetails.filter(Boolean),
          capacity: classData.maxStudents,
          enrolled: studentAssignments.length
        };
      }));
      res.json(classesWithStudents);
    } catch (error) {
      console.error("Error fetching tutor roster:", error);
      res.status(500).json({ message: "Failed to fetch roster" });
    }
  });
  app2.get("/api/tutor/submissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const submissions2 = await storage.getTutorSubmissions(tutor.id);
      res.json(submissions2);
    } catch (error) {
      console.error("Error fetching tutor submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.get("/api/tutor/incomplete-homework", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) return res.status(404).json({ message: "Tutor not found" });
      const incomplete = await storage.getTutorIncompleteHomework(tutor.id);
      res.json(incomplete);
    } catch (error) {
      console.error("Error fetching incomplete homework:", error);
      res.status(500).json({ message: "Failed to fetch incomplete homework" });
    }
  });
  app2.post("/api/tutor/remind-student", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentUserId, assignments: missingAssignments } = req.body;
      if (!studentUserId || !Array.isArray(missingAssignments) || missingAssignments.length === 0) {
        return res.status(400).json({ message: "studentUserId and assignments are required" });
      }
      const list = missingAssignments.map((a) => `\u2022 ${a.title}`).join("\n");
      const content = `Hi! Just a friendly reminder that the following assignment${missingAssignments.length > 1 ? "s are" : " is"} still outstanding:

${list}

Please log in to eSlate to complete and submit your work. Thanks!`;
      const message = await storage.createMessage({ senderId: user.id, receiverId: studentUserId, content });
      res.json({ success: true, message });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });
  app2.get("/api/tutor/submissions/:submissionId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const { submissionId } = req.params;
      const submission = await storage.getTutorSubmission(tutor.id, submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found or access denied" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });
  app2.patch("/api/tutor/submissions/:submissionId/grade", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tutor = await storage.getTutorByUserId(user.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      const submission = await storage.getTutorSubmission(tutor.id, submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found or access denied" });
      }
      if (score !== void 0 && (typeof score !== "number" || score < 0 || score > 100)) {
        return res.status(400).json({ message: "Score must be a number between 0 and 100" });
      }
      const updated = await storage.gradeSubmission(submissionId, score || 0, feedback || "", user.id);
      res.json(updated);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  });
  app2.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users2 = await storage.getAllUsers();
      const activeUsers = users2.filter((u) => u.isActive && !u.isDeleted);
      const students2 = activeUsers.filter((u) => u.role === "student").length;
      const tutors2 = activeUsers.filter((u) => u.role === "tutor").length;
      const parents2 = activeUsers.filter((u) => u.role === "parent").length;
      const companyAdmins3 = activeUsers.filter((u) => u.role === "company_admin").length;
      const admins = activeUsers.filter((u) => u.role === "admin").length;
      const companies = await storage.getAllCompanies();
      const activeCompanies = companies.filter((c) => c.isActive).length;
      let totalAssignments = 0;
      let totalSubmissions = 0;
      let submittedCount = 0;
      try {
        for (const company of companies) {
          const assignments3 = await storage.getAssignmentsByCompany(company.id);
          totalAssignments += assignments3.length;
          for (const assignment of assignments3) {
            const submissions2 = await storage.getSubmissionsByAssignment(assignment.id);
            totalSubmissions += submissions2.length;
            submittedCount += submissions2.filter((s) => s.status === "submitted").length;
          }
        }
      } catch (e) {
        console.log("Error fetching assignment stats:", e);
      }
      const completionRate = totalSubmissions > 0 ? Math.round(submittedCount / totalSubmissions * 100) : 0;
      res.json({
        totalUsers: activeUsers.length,
        students: students2,
        tutors: tutors2,
        parents: parents2,
        companyAdmins: companyAdmins3,
        admins,
        totalCompanies: activeCompanies,
        totalAssignments,
        totalSubmissions,
        completionRate,
        systemStatus: "Good"
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.post("/api/admin/create-tutor", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }
      const { email, firstName, lastName, specialization, qualifications, companyId } = req.body;
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const tempPassword = "TempPass123!";
      const hashedPassword = await hashPassword2(tempPassword);
      const newUser = await storage.createUserWithRole({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "tutor",
        isActive: true,
        isEmailVerified: true
      });
      await storage.createTutor({
        userId: newUser.id,
        companyId: companyId || null,
        specialization: specialization || null,
        qualifications: qualifications || null,
        isVerified: false
      });
      res.json({
        message: "Tutor created successfully",
        user: { ...newUser, password: void 0 },
        temporaryPassword: tempPassword
      });
    } catch (error) {
      console.error("Error creating tutor:", error);
      res.status(500).json({ message: "Failed to create tutor", error: error.message });
    }
  });
  app2.get("/api/tutors/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const tutor = await storage.getTutorByUserId(userId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      res.json(tutor);
    } catch (error) {
      console.error("Error fetching tutor:", error);
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });
  app2.patch("/api/tutors/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { tutorId } = req.params;
      const tutor = await storage.getTutor(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const isSelfUpdate = user.role === "tutor" && tutor.userId === user.id;
      const isAdminUpdate = user.role === "company_admin" || user.role === "admin";
      if (!isSelfUpdate && !isAdminUpdate) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== tutor.companyId) {
          return res.status(403).json({ message: "Access denied to this tutor" });
        }
      }
      const { specialization, qualifications, availability, subjectsTeaching, branch } = req.body;
      const updatedTutor = await storage.updateTutor(tutorId, {
        specialization,
        qualifications,
        availability,
        subjectsTeaching,
        branch
      });
      res.json(updatedTutor);
    } catch (error) {
      console.error("Error updating tutor:", error);
      res.status(500).json({ message: "Failed to update tutor", error: error.message });
    }
  });
  app2.post("/api/admin/create-student", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }
      const { email, firstName, lastName, gradeLevel, schoolName, rollNumber, classId, tutorId, companyId } = req.body;
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const tempPassword = "TempPass123!";
      const hashedPassword = await hashPassword2(tempPassword);
      const newUser = await storage.createUserWithRole({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "student",
        isActive: true,
        isEmailVerified: true
      });
      await storage.createStudent({
        userId: newUser.id,
        companyId: companyId || null,
        gradeLevel: gradeLevel || null,
        schoolName: schoolName || null,
        rollNumber: rollNumber || null,
        classId: classId || null,
        tutorId: tutorId || null,
        parentId: null
      });
      res.json({
        message: "Student created successfully",
        user: { ...newUser, password: void 0 },
        temporaryPassword: tempPassword
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student", error: error.message });
    }
  });
  app2.patch("/api/admin/users/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { userId } = req.params;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }
      const { firstName, lastName, email } = req.body;
      const updatedUser = await storage.updateUser(userId, { firstName, lastName, email });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/deleted-users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const deletedUsers = await storage.getDeletedUsers();
      const enrichedUsers = await Promise.all(deletedUsers.map(async (user2) => {
        let companyName = null;
        let companyId = null;
        try {
          if (user2.role === "student") {
            const student = await storage.getStudentByUserId(user2.id);
            if (student?.companyId) {
              const company = await storage.getCompany(student.companyId);
              companyName = company?.name || null;
              companyId = student.companyId;
            }
          } else if (user2.role === "tutor") {
            const tutor = await storage.getTutorByUserId(user2.id);
            if (tutor?.companyId) {
              const company = await storage.getCompany(tutor.companyId);
              companyName = company?.name || null;
              companyId = tutor.companyId;
            }
          } else if (user2.role === "company_admin") {
            const companyAdmin = await storage.getCompanyAdminByUserId(user2.id);
            if (companyAdmin?.companyId) {
              const company = await storage.getCompany(companyAdmin.companyId);
              companyName = company?.name || null;
              companyId = companyAdmin.companyId;
            }
          }
        } catch (e) {
        }
        return {
          ...user2,
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
  app2.delete("/api/admin/users/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { userId } = req.params;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === "company_admin") {
        if (targetUser.role === "admin" || targetUser.role === "company_admin") {
          return res.status(403).json({ message: "Cannot delete admin accounts" });
        }
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin) {
          return res.status(403).json({ message: "Company admin record not found" });
        }
        let targetCompanyId = null;
        if (targetUser.role === "student") {
          const student = await storage.getStudentByUserId(userId);
          targetCompanyId = student?.companyId;
        } else if (targetUser.role === "tutor") {
          const tutor = await storage.getTutorByUserId(userId);
          targetCompanyId = tutor?.companyId;
        }
        if (!targetCompanyId || targetCompanyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Cannot delete users from other companies" });
        }
      }
      await storage.deleteUser(userId, user.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/admin/businesses/invite", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { type, name, abn, address, contact_phone, contact_email, owner_email, owner_first_name, owner_last_name } = req.body;
      if (type === "individual") {
        return res.status(400).json({ message: "Admins can only create Tutoring Company profiles, not Solo Tutor profiles." });
      }
      if (type !== "multi_tutor") {
        return res.status(400).json({ message: "Invalid business type. Only 'multi_tutor' is supported." });
      }
      if (!name?.trim()) {
        return res.status(400).json({ message: "Business name is required." });
      }
      if (!owner_email || !owner_first_name || !owner_last_name) {
        return res.status(400).json({ message: "Owner email, first name, and last name are required." });
      }
      if (abn) {
        const abnDigits = String(abn).replace(/\s/g, "");
        if (!/^\d{11}$/.test(abnDigits)) {
          return res.status(400).json({ message: "ABN must be 11 digits." });
        }
      }
      if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
        return res.status(400).json({ message: "Contact email is not a valid email address." });
      }
      if (contact_phone) {
        const phoneDigits = String(contact_phone).replace(/[\s\-().+]/g, "");
        if (!/^\d{8,15}$/.test(phoneDigits)) {
          return res.status(400).json({ message: "Contact phone must be a valid phone number." });
        }
      }
      const existingUser = await storage.getUserByEmail(owner_email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists." });
      }
      const company = await storage.createTutoringCompany({
        name: name.trim(),
        ...abn ? { abn: String(abn).replace(/\s/g, "") } : {},
        ...address ? { address: address.trim() } : {},
        ...contact_phone ? { contactPhone: contact_phone.trim() } : {},
        ...contact_email ? { contactEmail: contact_email.trim().toLowerCase() } : {},
        isActive: false
      });
      const { generateVerificationToken: generateVerificationToken2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const token = generateVerificationToken2();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const placeholderUser = await storage.createUserWithRole({
        email: owner_email,
        firstName: owner_first_name,
        lastName: owner_last_name,
        role: "company_admin",
        isActive: false,
        isEmailVerified: false
      });
      await storage.updateUser(placeholderUser.id, {
        emailVerificationToken: token,
        passwordResetExpires: expiresAt
      });
      await storage.createCompanyAdmin({
        userId: placeholderUser.id,
        companyId: company.id
      });
      res.json({
        invitation_id: placeholderUser.id,
        business_id: company.id,
        business_type: "multi_tutor",
        business_name: company.name,
        token,
        expires_at: expiresAt.toISOString()
      });
    } catch (error) {
      console.error("Error creating business invite:", error);
      res.status(500).json({ message: "Failed to create invitation", error: error.message });
    }
  });
  app2.post("/api/onboarding/accept-business-invite", async (req, res) => {
    try {
      const { token, password, first_name, last_name } = req.body;
      if (!token || !password || !first_name || !last_name) {
        return res.status(400).json({ message: "token, password, first_name and last_name are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: usersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq6 } = await import("drizzle-orm");
      const [invitedUser] = await db2.select().from(usersTable).where(eq6(usersTable.emailVerificationToken, token));
      if (!invitedUser) {
        return res.status(400).json({ message: "Invalid or expired invite link." });
      }
      if (invitedUser.passwordResetExpires && /* @__PURE__ */ new Date() > invitedUser.passwordResetExpires) {
        return res.status(400).json({ message: "Invite link has expired. Ask the admin to send a new one." });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const hashed = await hashPassword2(password);
      await storage.updateUser(invitedUser.id, {
        firstName: first_name,
        lastName: last_name,
        password: hashed,
        isActive: true,
        isEmailVerified: true,
        emailVerificationToken: null,
        passwordResetExpires: null
      });
      const companyAdmin = await storage.getCompanyAdminByUserId(invitedUser.id);
      if (companyAdmin) {
        await storage.updateCompanyStatus(companyAdmin.companyId, true);
      }
      const updatedUser = await storage.getUser(invitedUser.id);
      req.session.userId = updatedUser.id;
      await storage.updateUserLastLogin(updatedUser.id);
      const { generateJWT: generateJWT2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const authToken = generateJWT2(updatedUser.id);
      res.json({
        token: authToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
          role: updatedUser.role
        },
        business_id: companyAdmin?.companyId
      });
    } catch (error) {
      console.error("Error accepting business invite:", error);
      res.status(500).json({ message: "Failed to accept invite", error: error.message });
    }
  });
  app2.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      let companies = [];
      if (user.role === "admin") {
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
  app2.get("/api/companies/:companyId/tutors", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const tutors2 = await storage.getTutorsByCompany(companyId);
      res.json(tutors2);
    } catch (error) {
      console.error("Error fetching company tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });
  app2.get("/api/companies/:companyId/tutors/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, tutorId } = req.params;
      const user = req.user;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const tutor = await storage.getTutorById(tutorId, companyId);
      if (!tutor) return res.status(404).json({ message: "Tutor not found" });
      res.json(tutor);
    } catch (error) {
      console.error("Error fetching tutor profile:", error);
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });
  app2.patch("/api/companies/:companyId/tutors/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, tutorId } = req.params;
      const user = req.user;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { firstName, lastName, specialization, qualifications, availability, branch } = req.body;
      const updated = await storage.updateTutorProfile(tutorId, companyId, {
        firstName: firstName?.trim() || void 0,
        lastName: lastName?.trim() || void 0,
        specialization: specialization ?? void 0,
        qualifications: qualifications ?? void 0,
        availability: availability ?? void 0,
        branch: branch ?? void 0
      });
      if (!updated) return res.status(404).json({ message: "Tutor not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating tutor profile:", error);
      res.status(500).json({ message: "Failed to update tutor" });
    }
  });
  app2.get("/api/companies/:companyId/students", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const { status } = req.query;
      const allStudents = await storage.getCompanyStudentsByCompanyId(companyId);
      const filterStatus = status || "active";
      const filtered = filterStatus === "all" ? allStudents : allStudents.filter((s) => (s.status || "active") === filterStatus);
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching company students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  app2.get("/api/year-groups", async (_req, res) => {
    res.json([
      { id: 1, state_code: "NSW", order: 0, label: "Kindergarten", code: "K" },
      { id: 2, state_code: "NSW", order: 1, label: "Year 1", code: "Y1" },
      { id: 3, state_code: "NSW", order: 2, label: "Year 2", code: "Y2" },
      { id: 4, state_code: "NSW", order: 3, label: "Year 3", code: "Y3" },
      { id: 5, state_code: "NSW", order: 4, label: "Year 4", code: "Y4" },
      { id: 6, state_code: "NSW", order: 5, label: "Year 5", code: "Y5" },
      { id: 7, state_code: "NSW", order: 6, label: "Year 6", code: "Y6" },
      { id: 8, state_code: "NSW", order: 7, label: "Year 7", code: "Y7" },
      { id: 9, state_code: "NSW", order: 8, label: "Year 8", code: "Y8" },
      { id: 10, state_code: "NSW", order: 9, label: "Year 9", code: "Y9" },
      { id: 11, state_code: "NSW", order: 10, label: "Year 10", code: "Y10" },
      { id: 12, state_code: "NSW", order: 11, label: "Year 11", code: "Y11" },
      { id: 13, state_code: "NSW", order: 12, label: "Year 12", code: "Y12" }
    ]);
  });
  const NSW_SCHOOLS_FALLBACK = [
    { name: "Sydney Grammar School", suburb: "Darlinghurst", state: "NSW", postcode: "2010" },
    { name: "Sydney Boys High School", suburb: "Moore Park", state: "NSW", postcode: "2021" },
    { name: "Sydney Girls High School", suburb: "Surry Hills", state: "NSW", postcode: "2010" },
    { name: "James Ruse Agricultural High School", suburb: "Carlingford", state: "NSW", postcode: "2118" },
    { name: "North Sydney Boys High School", suburb: "North Sydney", state: "NSW", postcode: "2060" },
    { name: "Parramatta High School", suburb: "Parramatta", state: "NSW", postcode: "2150" },
    { name: "Blacktown Boys High School", suburb: "Blacktown", state: "NSW", postcode: "2148" },
    { name: "Penrith High School", suburb: "Penrith", state: "NSW", postcode: "2750" },
    { name: "Newington College", suburb: "Stanmore", state: "NSW", postcode: "2048" },
    { name: "Knox Grammar School", suburb: "Wahroonga", state: "NSW", postcode: "2076" }
  ];
  async function arcGISSchools(where, limit) {
    const params = new URLSearchParams({ where, outFields: "school_name,suburb,state,postcode", f: "json", resultRecordCount: String(limit) });
    const resp = await fetch(`https://portal.data.nsw.gov.au/arcgis/rest/services/Hosted/ACARA_Schools_NSW/FeatureServer/0/query?${params}`, { signal: AbortSignal.timeout(6e3) });
    const data = await resp.json();
    return (data.features ?? []).map((f) => ({
      name: f.attributes.school_name,
      suburb: f.attributes.suburb,
      state: f.attributes.state ?? "NSW",
      postcode: String(f.attributes.postcode ?? "")
    }));
  }
  app2.get("/api/schools/search", async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2) return res.json([]);
    const safe = q.replace(/'/g, "''");
    const upper = safe.toUpperCase();
    const where = `status='Open' AND (UPPER(school_name) LIKE '%${upper}%' OR UPPER(suburb) LIKE '%${upper}%')`;
    try {
      return res.json(await arcGISSchools(where, 10));
    } catch {
      const lower = q.toLowerCase();
      return res.json(NSW_SCHOOLS_FALLBACK.filter(
        (s) => s.name.toLowerCase().includes(lower) || s.suburb.toLowerCase().includes(lower)
      ).slice(0, 10));
    }
  });
  app2.get("/api/schools/by-suburb", async (req, res) => {
    const suburb = String(req.query.suburb ?? "").trim();
    if (suburb.length < 2) return res.json([]);
    const safe = suburb.replace(/'/g, "''");
    const where = `status='Open' AND UPPER(suburb)='${safe.toUpperCase()}'`;
    try {
      return res.json(await arcGISSchools(where, 15));
    } catch {
      const lower = suburb.toLowerCase();
      return res.json(NSW_SCHOOLS_FALLBACK.filter(
        (s) => s.suburb.toLowerCase() === lower
      ).slice(0, 15));
    }
  });
  const SUBJECTS = [
    { id: 1, code: "ENG", name: "English" },
    { id: 2, code: "MATH", name: "Mathematics" },
    { id: 3, code: "READ", name: "Reading" },
    { id: 4, code: "SCI", name: "Science" },
    { id: 5, code: "THINK", name: "Thinking Skills" },
    { id: 6, code: "WRITE", name: "Writing" }
  ];
  const subjectById = new Map(SUBJECTS.map((s) => [s.id, s]));
  app2.get("/api/subjects", async (req, res) => {
    const builtIn = SUBJECTS.map((s) => ({ ...s, type: "builtin" }));
    if (!req.isAuthenticated?.() || !req.user) return res.json(builtIn);
    const user = req.user;
    try {
      let companyId = null;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        companyId = ca?.companyId ?? null;
      }
      if (!companyId) return res.json(builtIn);
      const custom = await storage.getCompanySubjects(companyId);
      return res.json([
        ...builtIn,
        ...custom.map((s) => ({ id: s.id, code: s.code, name: s.name, description: s.description, type: "custom" }))
      ]);
    } catch {
      return res.json(builtIn);
    }
  });
  app2.post("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const { name, code, description } = req.body;
      if (!name?.trim() || name.trim().length < 2) return res.status(400).json({ message: "Name is required (min 2 characters)" });
      if (!code?.trim() || code.trim().length < 2) return res.status(400).json({ message: "Code is required (min 2 characters)" });
      if (name.trim().length > 100) return res.status(400).json({ message: "Name must be 100 characters or less" });
      if (code.trim().length > 20) return res.status(400).json({ message: "Code must be 20 characters or less" });
      const subject = await storage.createCompanySubject(ca.companyId, name, code, description);
      return res.status(201).json(subject);
    } catch (e) {
      return res.status(500).json({ message: e.message ?? "Failed to create subject" });
    }
  });
  app2.delete("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const deleted = await storage.deleteCompanySubject(req.params.id, ca.companyId);
      if (!deleted) return res.status(404).json({ message: "Subject not found or not yours to delete" });
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ message: e.message ?? "Failed to delete subject" });
    }
  });
  const NSW_2026_TERMS = [
    { name: "Term 1", start_date: "2026-01-28", end_date: "2026-04-09" },
    { name: "Term 2", start_date: "2026-04-28", end_date: "2026-07-03" },
    { name: "Term 3", start_date: "2026-07-21", end_date: "2026-09-25" },
    { name: "Term 4", start_date: "2026-10-12", end_date: "2026-12-18" }
  ];
  app2.get("/api/state-packs/:state/:year", (req, res) => {
    const { state, year } = req.params;
    if (state.toUpperCase() !== "NSW" || year !== "2026") {
      return res.status(404).json({ message: "Pack not found" });
    }
    return res.json({
      state_code: "NSW",
      year: 2026,
      pack_version: "1.0",
      academic_year: {
        yearNumber: 2026,
        name: "NSW 2026",
        terms: NSW_2026_TERMS
      }
    });
  });
  app2.post("/api/state-packs/apply", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { state_code, year } = req.body;
      if (!state_code || !year) {
        return res.status(400).json({ message: "state_code and year are required" });
      }
      if (state_code.toUpperCase() !== "NSW" || year !== 2026) {
        return res.status(404).json({ message: "Pack not found" });
      }
      let companyId;
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin) return res.status(403).json({ message: "Company admin profile not found" });
        companyId = companyAdmin.companyId;
      } else if (user.role === "admin") {
        const { company_id } = req.body;
        if (!company_id) return res.status(400).json({ message: "company_id required for admin" });
        companyId = company_id;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      const academicYear = await storage.createAcademicYear({
        companyId,
        yearNumber: 2026,
        name: "NSW 2026",
        isActive: true
      });
      const terms = await Promise.all(
        NSW_2026_TERMS.map(
          (t) => storage.createAcademicTerm({
            companyId,
            academicYearId: academicYear.id,
            name: t.name,
            startDate: new Date(t.start_date),
            endDate: new Date(t.end_date),
            isActive: true
          })
        )
      );
      return res.json({ academic_year: academicYear, terms });
    } catch (error) {
      console.error("Error applying state pack:", error);
      return res.status(500).json({ message: "Failed to apply state pack" });
    }
  });
  app2.get("/api/course-templates", (req, res) => {
    const NSW_COURSE_TEMPLATES = [
      // OC Test Prep — Year 3 & 4
      { id: 1, state_code: "NSW", year_group_code: "Y3", kind: "theory", test_alignment: "oc", code: "OC-Y3-TH", name: "OC Test Prep \u2014 Year 3", short_name: "OC Y3", description: "Opportunity Class placement test preparation for Year 3 students. Covers English, Mathematics, and Thinking Skills.", sort_order: 10 },
      { id: 2, state_code: "NSW", year_group_code: "Y4", kind: "theory", test_alignment: "oc", code: "OC-Y4-TH", name: "OC Test Prep \u2014 Year 4", short_name: "OC Y4", description: "Opportunity Class placement test preparation for Year 4 students. Covers English, Mathematics, and Thinking Skills.", sort_order: 11 },
      { id: 3, state_code: "NSW", year_group_code: "Y3", kind: "mock_tests", test_alignment: "oc", code: "OC-Y3-MK", name: "OC Mock Tests \u2014 Year 3", short_name: "OC Mock Y3", description: "Timed mock exam sessions in OC test format for Year 3. Builds exam technique and time management.", sort_order: 12 },
      { id: 4, state_code: "NSW", year_group_code: "Y4", kind: "mock_tests", test_alignment: "oc", code: "OC-Y4-MK", name: "OC Mock Tests \u2014 Year 4", short_name: "OC Mock Y4", description: "Timed mock exam sessions in OC test format for Year 4. Builds exam technique and time management.", sort_order: 13 },
      // Selective Entry — Year 5 & 6
      { id: 5, state_code: "NSW", year_group_code: "Y5", kind: "theory", test_alignment: "selective", code: "SEL-Y5-TH", name: "Selective School Prep \u2014 Year 5", short_name: "Selective Y5", description: "Selective Entry High School preparation for Year 5. Covers Reading, Maths, Thinking Skills, and Writing.", sort_order: 20 },
      { id: 6, state_code: "NSW", year_group_code: "Y6", kind: "theory", test_alignment: "selective", code: "SEL-Y6-TH", name: "Selective School Prep \u2014 Year 6", short_name: "Selective Y6", description: "Selective Entry High School preparation for Year 6. Covers Reading, Maths, Thinking Skills, and Writing.", sort_order: 21 },
      { id: 7, state_code: "NSW", year_group_code: "Y5", kind: "mock_tests", test_alignment: "selective", code: "SEL-Y5-MK", name: "Selective Mock Tests \u2014 Year 5", short_name: "Sel Mock Y5", description: "Full-length mock exams in Selective test format for Year 5. Includes detailed performance feedback.", sort_order: 22 },
      { id: 8, state_code: "NSW", year_group_code: "Y6", kind: "mock_tests", test_alignment: "selective", code: "SEL-Y6-MK", name: "Selective Mock Tests \u2014 Year 6", short_name: "Sel Mock Y6", description: "Full-length mock exams in Selective test format for Year 6. Includes detailed performance feedback.", sort_order: 23 },
      // NAPLAN — Year 3, 5, 7, 9
      { id: 9, state_code: "NSW", year_group_code: "Y3", kind: "theory", test_alignment: "naplan_y3", code: "NAP-Y3-TH", name: "NAPLAN Prep \u2014 Year 3", short_name: "NAPLAN Y3", description: "NAPLAN preparation for Year 3. Covers Literacy (Reading, Writing, Language Conventions) and Numeracy.", sort_order: 30 },
      { id: 10, state_code: "NSW", year_group_code: "Y5", kind: "theory", test_alignment: "naplan_y5", code: "NAP-Y5-TH", name: "NAPLAN Prep \u2014 Year 5", short_name: "NAPLAN Y5", description: "NAPLAN preparation for Year 5. Covers Literacy (Reading, Writing, Language Conventions) and Numeracy.", sort_order: 31 },
      { id: 11, state_code: "NSW", year_group_code: "Y7", kind: "theory", test_alignment: "naplan_y7", code: "NAP-Y7-TH", name: "NAPLAN Prep \u2014 Year 7", short_name: "NAPLAN Y7", description: "NAPLAN preparation for Year 7. Covers Literacy (Reading, Writing, Language Conventions) and Numeracy.", sort_order: 32 },
      { id: 12, state_code: "NSW", year_group_code: "Y9", kind: "theory", test_alignment: "naplan_y9", code: "NAP-Y9-TH", name: "NAPLAN Prep \u2014 Year 9", short_name: "NAPLAN Y9", description: "NAPLAN preparation for Year 9. Covers Literacy (Reading, Writing, Language Conventions) and Numeracy.", sort_order: 33 },
      // WEMT — Year 3–6
      { id: 13, state_code: "NSW", year_group_code: "Y3", kind: "theory", test_alignment: null, code: "WEMT-Y3", name: "WEMT Program \u2014 Year 3", short_name: "WEMT Y3", description: "Writing, English, Mathematics, and Thinking Skills for Year 3. Builds core academic skills.", sort_order: 40 },
      { id: 14, state_code: "NSW", year_group_code: "Y4", kind: "theory", test_alignment: null, code: "WEMT-Y4", name: "WEMT Program \u2014 Year 4", short_name: "WEMT Y4", description: "Writing, English, Mathematics, and Thinking Skills for Year 4. Builds core academic skills.", sort_order: 41 },
      { id: 15, state_code: "NSW", year_group_code: "Y5", kind: "theory", test_alignment: null, code: "WEMT-Y5", name: "WEMT Program \u2014 Year 5", short_name: "WEMT Y5", description: "Writing, English, Mathematics, and Thinking Skills for Year 5. Ideal alongside Selective preparation.", sort_order: 42 },
      { id: 16, state_code: "NSW", year_group_code: "Y6", kind: "theory", test_alignment: null, code: "WEMT-Y6", name: "WEMT Program \u2014 Year 6", short_name: "WEMT Y6", description: "Writing, English, Mathematics, and Thinking Skills for Year 6. Ideal alongside Selective preparation.", sort_order: 43 },
      // Foundation — Year 2–6
      { id: 17, state_code: "NSW", year_group_code: "Y2", kind: "foundations", test_alignment: null, code: "FDN-Y2", name: "Foundation Program \u2014 Year 2", short_name: "Foundation Y2", description: "Foundational literacy and numeracy for Year 2. Closes learning gaps and builds confidence.", sort_order: 50 },
      { id: 18, state_code: "NSW", year_group_code: "Y3", kind: "foundations", test_alignment: null, code: "FDN-Y3", name: "Foundation Program \u2014 Year 3", short_name: "Foundation Y3", description: "Foundational literacy and numeracy for Year 3. Closes learning gaps and builds confidence.", sort_order: 51 },
      { id: 19, state_code: "NSW", year_group_code: "Y4", kind: "foundations", test_alignment: null, code: "FDN-Y4", name: "Foundation Program \u2014 Year 4", short_name: "Foundation Y4", description: "Foundational literacy and numeracy for Year 4. Closes learning gaps and builds confidence.", sort_order: 52 },
      { id: 20, state_code: "NSW", year_group_code: "Y5", kind: "foundations", test_alignment: null, code: "FDN-Y5", name: "Foundation Program \u2014 Year 5", short_name: "Foundation Y5", description: "Foundational literacy and numeracy for Year 5. Closes learning gaps and builds confidence.", sort_order: 53 },
      { id: 21, state_code: "NSW", year_group_code: "Y6", kind: "foundations", test_alignment: null, code: "FDN-Y6", name: "Foundation Program \u2014 Year 6", short_name: "Foundation Y6", description: "Foundational literacy and numeracy for Year 6. Closes learning gaps and builds confidence.", sort_order: 54 }
    ];
    const { state } = req.query;
    const result = state ? NSW_COURSE_TEMPLATES.filter((t) => t.state_code === String(state).toUpperCase()) : NSW_COURSE_TEMPLATES;
    res.json(result);
  });
  app2.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let companyId;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
        companyId = ca.companyId;
      } else {
        const { company_id } = req.query;
        if (!company_id) return res.json([]);
        companyId = company_id;
      }
      const rows = await storage.getCoursesByCompany(companyId);
      const enriched = rows.map((r) => ({
        ...r,
        year_group_code: r.yearGroupCode ?? null,
        subjects: r.subjectIds.map((id) => subjectById.get(id)).filter(Boolean)
      }));
      res.json(enriched);
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const course = await storage.getCourseById(req.params.id, ca.companyId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json({ ...course, subject_ids: course.subjectIds });
    } catch (err) {
      console.error("Error fetching course:", err);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  app2.patch("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const { name, description, subject_ids } = req.body;
      if (name !== void 0 && !name?.trim()) return res.status(400).json({ message: "Course name cannot be blank" });
      if (subject_ids !== void 0 && (!Array.isArray(subject_ids) || subject_ids.length === 0)) {
        return res.status(400).json({ message: "At least one subject must be selected" });
      }
      const updated = await storage.updateCourse(req.params.id, ca.companyId, {
        name: name?.trim(),
        description: description ?? void 0,
        subjectIds: subject_ids?.map(Number)
      });
      if (!updated) return res.status(404).json({ message: "Course not found" });
      res.json({ ...updated, subject_ids: updated.subjectIds });
    } catch (err) {
      console.error("Error updating course:", err);
      res.status(500).json({ message: "Failed to update course" });
    }
  });
  app2.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const { name, description, subject_ids, year_group_code } = req.body;
      if (!name?.trim()) return res.status(400).json({ message: "Course name is required" });
      if (name.trim().length > 150) return res.status(400).json({ message: "Course name must be 150 characters or fewer" });
      if (description && description.length > 500) return res.status(400).json({ message: "Description must be 500 characters or fewer" });
      if (!Array.isArray(subject_ids) || subject_ids.length === 0) {
        return res.status(400).json({ message: "At least one subject must be selected" });
      }
      const course = await storage.createCourse({
        companyId: ca.companyId,
        name: name.trim(),
        description: description?.trim() || null,
        yearGroupCode: year_group_code?.trim() || null,
        subjectIds: subject_ids.map(Number).filter((id) => subjectById.has(id))
      });
      res.status(201).json({
        ...course,
        subjects: course.subjectIds.map((id) => subjectById.get(id)).filter(Boolean)
      });
    } catch (err) {
      console.error("Error creating course:", err);
      res.status(500).json({ message: "Failed to create course" });
    }
  });
  app2.get("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.json([]);
      res.json(await storage.getClassesWithDetailsForCompany(ca.companyId));
    } catch (err) {
      console.error("Error fetching classes:", err);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  app2.post("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const {
        name,
        course_id,
        subject_ids = [],
        year_group_id,
        tutor_id,
        term_ids = [],
        capacity,
        description,
        level,
        status,
        schedule_day_of_week,
        schedule_start_time,
        schedule_end_time,
        location
      } = req.body;
      if (!name?.trim()) return res.status(400).json({ message: "Class name is required" });
      if (!term_ids.length) return res.status(400).json({ message: "At least one term is required" });
      const primaryTermId = String(term_ids[0]);
      const primarySubjectId = subject_ids[0] ? Number(subject_ids[0]) : null;
      const primarySubjectName = primarySubjectId ? subjectById.get(primarySubjectId)?.name ?? "TBD" : "TBD";
      const newClass = await storage.createClassWithSubjects(
        {
          name: name.trim(),
          companyId: ca.companyId,
          termId: primaryTermId,
          subject: primarySubjectName,
          tutorId: tutor_id ? String(tutor_id) : null,
          description: description?.trim() || null,
          location: location?.trim() || null,
          dayOfWeek: schedule_day_of_week ? Number(schedule_day_of_week) : null,
          startTime: schedule_start_time || "",
          endTime: schedule_end_time || "",
          maxStudents: capacity ? Number(capacity) : 20,
          isActive: true,
          courseId: course_id ? String(course_id) : null,
          yearGroupCode: year_group_id ? String(year_group_id) : null,
          level: level?.trim() || null,
          status: status || "draft"
        },
        subject_ids.map(Number).filter((id) => id > 0)
      );
      res.status(201).json(newClass);
    } catch (err) {
      console.error("Error creating class:", err);
      res.status(500).json({ message: err.message ?? "Failed to create class" });
    }
  });
  app2.get("/api/classes/:classId", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const cls = await storage.getClassDetailById(classId, ca.companyId);
      if (!cls) return res.status(404).json({ message: "Class not found" });
      res.json(cls);
    } catch (err) {
      console.error("Error fetching class detail:", err);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });
  app2.patch("/api/classes/:classId", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const existing = await storage.getClassDetailById(classId, ca.companyId);
      if (!existing) return res.status(404).json({ message: "Class not found" });
      const {
        name,
        description,
        level,
        capacity,
        course_id,
        tutor_id,
        term_ids,
        schedule_day_of_week,
        schedule_start_time,
        schedule_end_time,
        location,
        status
      } = req.body;
      const updates = {};
      if (name !== void 0) updates.name = name.trim();
      if (description !== void 0) updates.description = description?.trim() || null;
      if (level !== void 0) updates.level = level?.trim() || null;
      if (capacity !== void 0) updates.maxStudents = capacity ? Number(capacity) : null;
      if (course_id !== void 0) updates.courseId = course_id ? String(course_id) : null;
      if (tutor_id !== void 0) updates.tutorId = tutor_id ? String(tutor_id) : null;
      if (schedule_day_of_week !== void 0) updates.dayOfWeek = schedule_day_of_week ? Number(schedule_day_of_week) : null;
      if (schedule_start_time !== void 0) updates.startTime = schedule_start_time || "";
      if (schedule_end_time !== void 0) updates.endTime = schedule_end_time || "";
      if (location !== void 0) updates.location = location?.trim() || null;
      if (status !== void 0) updates.status = status;
      if (Array.isArray(term_ids) && term_ids.length > 0) updates.termId = String(term_ids[0]);
      const notifyFields = ["tutorId", "dayOfWeek", "startTime", "endTime", "termId", "status"];
      const notifyParents = req.body.notify_parents !== false;
      const changedNotifyFields = notifyFields.filter((f) => updates[f] !== void 0 && existing[f] !== updates[f]);
      await storage.updateClass(classId, updates);
      const updated = await storage.getClassDetailById(classId, ca.companyId);
      if (notifyParents && changedNotifyFields.length > 0 && existing.status !== "archived") {
        setImmediate(async () => {
          try {
            const enrolled = await db.select({ studentId: studentClassAssignments.studentId }).from(studentClassAssignments).where(and3(eq3(studentClassAssignments.classId, classId), eq3(studentClassAssignments.isActive, true)));
            if (enrolled.length === 0) return;
            const studentIds = enrolled.map((e) => e.studentId);
            const contacts = await db.select({ email: studentContacts.email, name: studentContacts.name, studentId: studentContacts.studentId }).from(studentContacts).where(and3(inArray2(studentContacts.studentId, studentIds), eq3(studentContacts.isPrimary, true)));
            const uniqueEmails = [...new Map(contacts.map((c) => [c.email, c])).values()].filter((c) => c.email);
            if (uniqueEmails.length === 0) return;
            if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) return;
            const transporter = nodemailer2.createTransport({
              host: process.env.EMAIL_HOST,
              port: parseInt(process.env.EMAIL_PORT || "587"),
              secure: false,
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const changeLines = changedNotifyFields.map((f) => {
              if (f === "tutorId") return `<li>Tutor has been updated</li>`;
              if (f === "dayOfWeek") return `<li>Day changed to ${dayNames[updates.dayOfWeek] ?? updates.dayOfWeek}</li>`;
              if (f === "startTime" || f === "endTime") return `<li>Time updated: ${updates.startTime || existing.startTime} \u2013 ${updates.endTime || existing.endTime}</li>`;
              if (f === "termId") return `<li>Term has been updated</li>`;
              if (f === "status") return `<li>Class status changed to ${updates.status}</li>`;
              return "";
            }).join("");
            const html = `<p>Dear Parent/Guardian,</p><p>We wanted to let you know that the following changes have been made to <strong>${existing.name}</strong>:</p><ul>${changeLines}</ul><p>If you have any questions, please contact us.</p><p>Regards,<br>The eSlate Team</p>`;
            for (const c of uniqueEmails) {
              await transporter.sendMail({ from: process.env.EMAIL_FROM || "noreply@eslate.com", to: c.email, subject: `Update: ${existing.name}`, html }).catch(() => {
              });
            }
          } catch (e) {
            console.error("[ESLATE-39] Parent notification error:", e);
          }
        });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error updating class:", err);
      res.status(500).json({ message: err.message ?? "Failed to update class" });
    }
  });
  app2.post("/api/classes/:classId/restore", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await db.update(classes).set({ status: "active", archivedAt: null, archivedBy: null, archivedByName: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(classes.id, classId));
      res.json({ message: "Class restored" });
    } catch (err) {
      console.error("Error restoring class:", err);
      res.status(500).json({ message: err.message ?? "Failed to restore class" });
    }
  });
  app2.post("/api/classes/:classId/archive", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const adminName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
      await db.update(classes).set({ status: "archived", archivedAt: /* @__PURE__ */ new Date(), archivedBy: user.id, archivedByName: adminName, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(classes.id, classId));
      res.json({ message: "Class archived" });
    } catch (err) {
      console.error("Error archiving class:", err);
      res.status(500).json({ message: err.message ?? "Failed to archive class" });
    }
  });
  app2.get("/api/courses/:courseId/classes", isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const rows = await db.select({ id: classes.id, name: classes.name, status: classes.status }).from(classes).where(eq3(classes.courseId, courseId));
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch course classes" });
    }
  });
  app2.post("/api/courses/:courseId/archive", isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const adminName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
      const now = /* @__PURE__ */ new Date();
      await db.update(courses).set({ status: "archived", archivedAt: now, archivedBy: user.id, archivedByName: adminName, updatedAt: now }).where(eq3(courses.id, courseId));
      await db.update(classes).set({ status: "archived", archivedAt: now, archivedBy: user.id, archivedByName: adminName, updatedAt: now }).where(and3(eq3(classes.courseId, courseId), ne2(classes.status, "archived")));
      res.json({ message: "Course archived and linked classes archived" });
    } catch (err) {
      console.error("Error archiving course:", err);
      res.status(500).json({ message: err.message ?? "Failed to archive course" });
    }
  });
  app2.post("/api/courses/:courseId/restore", isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await db.update(courses).set({ status: "active", archivedAt: null, archivedBy: null, archivedByName: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(courses.id, courseId));
      res.json({ message: "Course restored" });
    } catch (err) {
      res.status(500).json({ message: err.message ?? "Failed to restore course" });
    }
  });
  app2.post("/api/classes/:classId/duplicate", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const original = await storage.getClassDetailById(classId, ca.companyId);
      if (!original) return res.status(404).json({ message: "Class not found" });
      const newName = `Copy of ${original.name}`;
      const newId = randomUUID2();
      await db.insert(classes).values({
        id: newId,
        companyId: ca.companyId,
        termId: original.term_id ?? original.termId ?? original.terms?.[0]?.id ?? "",
        name: newName,
        subject: original.subject ?? "TBD",
        description: original.description ?? null,
        location: original.location ?? null,
        tutorId: original.tutor_id ? String(original.tutor_id) : null,
        dayOfWeek: original.schedule_day_of_week ?? null,
        startTime: original.schedule_start_time ?? "",
        endTime: original.schedule_end_time ?? "",
        maxStudents: original.capacity ?? null,
        isActive: true,
        courseId: original.course_id ? String(original.course_id) : null,
        yearGroupCode: original.yearGroup?.code ?? null,
        level: original.level ?? null,
        status: "draft",
        duplicatedFromId: classId
      });
      const newClass = await storage.getClassDetailById(newId, ca.companyId);
      res.status(201).json(newClass);
    } catch (err) {
      console.error("Error duplicating class:", err);
      res.status(500).json({ message: err.message ?? "Failed to duplicate class" });
    }
  });
  app2.post("/api/courses/:courseId/duplicate", isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Company admin profile not found" });
      const [original] = await db.select().from(courses).where(and3(eq3(courses.id, courseId), eq3(courses.companyId, ca.companyId)));
      if (!original) return res.status(404).json({ message: "Course not found" });
      const newId = randomUUID2();
      await db.insert(courses).values({
        id: newId,
        companyId: ca.companyId,
        name: `Copy of ${original.name}`,
        description: original.description ?? null,
        yearGroupCode: original.yearGroupCode ?? null,
        status: "active",
        duplicatedFromId: courseId
      });
      res.status(201).json({ id: newId, name: `Copy of ${original.name}`, message: "Course duplicated" });
    } catch (err) {
      console.error("Error duplicating course:", err);
      res.status(500).json({ message: err.message ?? "Failed to duplicate course" });
    }
  });
  app2.get("/api/classes/:classId/sessions", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin", "tutor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const sessions = await db.select().from(classSessions).where(eq3(classSessions.classId, classId)).orderBy(asc2(classSessions.sessionDate));
      const sessionsWithSummary = await Promise.all(sessions.map(async (s) => {
        const attendance = await db.select().from(sessionAttendance).where(eq3(sessionAttendance.sessionId, s.id));
        const presentCount = attendance.filter((a) => a.status === "present" || a.status === "late").length;
        const hasAttendance = attendance.length > 0;
        return { ...s, attendanceCount: attendance.length, presentCount, hasAttendance };
      }));
      res.json(sessionsWithSummary);
    } catch (err) {
      console.error("Error fetching class sessions:", err);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  app2.get("/api/classes/:classId/sessions/:sessionId/roll", isAuthenticated, async (req, res) => {
    try {
      const { classId, sessionId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin", "tutor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const enrolments = await db.select({ studentId: studentClassAssignments.studentId }).from(studentClassAssignments).where(and3(eq3(studentClassAssignments.classId, classId), eq3(studentClassAssignments.isActive, true)));
      const attendance = await db.select().from(sessionAttendance).where(eq3(sessionAttendance.sessionId, sessionId));
      const attendanceByStudent = new Map(attendance.map((a) => [a.studentId, a]));
      const roll = await Promise.all(enrolments.map(async (e) => {
        const [student] = await db.select({ id: students.id, userId: students.userId, rollNumber: students.rollNumber, yearGroupCode: students.yearGroupCode }).from(students).where(eq3(students.id, e.studentId));
        if (!student) return null;
        const [u] = await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, student.userId));
        const att = attendanceByStudent.get(e.studentId);
        return {
          studentId: e.studentId,
          firstName: u?.firstName ?? "",
          lastName: u?.lastName ?? "",
          rollNumber: student.rollNumber,
          yearGroupCode: student.yearGroupCode,
          attendanceStatus: att?.status ?? "not_marked",
          notes: att?.notes ?? ""
        };
      }));
      res.json(roll.filter(Boolean));
    } catch (err) {
      console.error("Error fetching roll:", err);
      res.status(500).json({ message: "Failed to fetch roll call" });
    }
  });
  app2.post("/api/classes/:classId/sessions", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { sessionDate, startTime, endTime, notes } = req.body;
      if (!sessionDate) return res.status(400).json({ message: "sessionDate is required" });
      const cls = await storage.getClass(classId);
      if (!cls) return res.status(404).json({ message: "Class not found" });
      const [session2] = await db.insert(classSessions).values({
        classId,
        tutorId: cls.tutorId ?? null,
        sessionDate: new Date(sessionDate),
        startTime: startTime || cls.startTime || "",
        endTime: endTime || cls.endTime || "",
        durationMinutes: 60,
        status: "scheduled",
        notes: notes ?? null
      }).$returningId();
      res.status(201).json({ id: session2.id, message: "Session created" });
    } catch (err) {
      console.error("Error creating session:", err);
      res.status(500).json({ message: err.message ?? "Failed to create session" });
    }
  });
  app2.patch("/api/classes/:classId/sessions/:sessionId/cancel", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      await db.update(classSessions).set({ status: "cancelled", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(classSessions.id, sessionId));
      res.json({ message: "Session cancelled" });
    } catch (err) {
      res.status(500).json({ message: "Failed to cancel session" });
    }
  });
  app2.post("/api/sessions/:sessionId/attendance/save", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin", "tutor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { records } = req.body;
      if (!Array.isArray(records)) return res.status(400).json({ message: "records array required" });
      for (const rec of records) {
        const existing = await db.select({ id: sessionAttendance.id }).from(sessionAttendance).where(and3(eq3(sessionAttendance.sessionId, sessionId), eq3(sessionAttendance.studentId, rec.studentId)));
        if (existing.length > 0) {
          await db.update(sessionAttendance).set({ status: rec.status, notes: rec.notes ?? null, markedBy: user.id, markedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(sessionAttendance.sessionId, sessionId), eq3(sessionAttendance.studentId, rec.studentId)));
        } else {
          await db.insert(sessionAttendance).values({
            sessionId,
            studentId: rec.studentId,
            status: rec.status,
            notes: rec.notes ?? null,
            markedBy: user.id,
            markedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      await db.update(classSessions).set({ status: "completed", attendedCount: records.filter((r) => r.status === "present" || r.status === "late").length, updatedAt: /* @__PURE__ */ new Date() }).where(and3(eq3(classSessions.id, sessionId), eq3(classSessions.status, "scheduled")));
      res.json({ message: `Attendance saved for ${records.length} students` });
    } catch (err) {
      console.error("Error saving attendance:", err);
      res.status(500).json({ message: err.message ?? "Failed to save attendance" });
    }
  });
  app2.get("/api/classes/:classId/waitlist", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const waitlistEntries = await db.select({
        id: classWaitlist.id,
        position: classWaitlist.position,
        studentId: classWaitlist.studentId,
        addedAt: classWaitlist.addedAt,
        addedByName: classWaitlist.addedByName,
        status: classWaitlist.status
      }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, classId), eq3(classWaitlist.status, "waiting"))).orderBy(asc2(classWaitlist.position));
      const enriched = await Promise.all(waitlistEntries.map(async (entry) => {
        const [student] = await db.select({ id: students.id, userId: students.userId, rollNumber: students.rollNumber, yearGroupCode: students.yearGroupCode }).from(students).where(eq3(students.id, entry.studentId));
        const [u] = student ? await db.select({ firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq3(users.id, student.userId)) : [null];
        return { ...entry, firstName: u?.firstName ?? "", lastName: u?.lastName ?? "", rollNumber: student?.rollNumber, yearGroupCode: student?.yearGroupCode };
      }));
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });
  app2.post("/api/classes/:classId/waitlist", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentId, termId } = req.body;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!studentId) return res.status(400).json({ message: "studentId is required" });
      const [existing] = await db.select().from(classWaitlist).where(and3(eq3(classWaitlist.classId, classId), eq3(classWaitlist.studentId, studentId), eq3(classWaitlist.status, "waiting")));
      if (existing) return res.status(409).json({ message: "Student is already on the waitlist for this class" });
      const [maxPos] = await db.select({ maxPos: max(classWaitlist.position) }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, classId), eq3(classWaitlist.status, "waiting")));
      const nextPosition = (maxPos?.maxPos ?? 0) + 1;
      const adminName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
      const [entry] = await db.insert(classWaitlist).values({
        classId,
        studentId,
        termId: termId ?? null,
        position: nextPosition,
        addedBy: user.id,
        addedByName: adminName,
        status: "waiting"
      }).$returningId();
      res.status(201).json({ id: entry.id, position: nextPosition, message: `Added to waitlist at position ${nextPosition}` });
    } catch (err) {
      console.error("Error adding to waitlist:", err);
      res.status(500).json({ message: err.message ?? "Failed to add to waitlist" });
    }
  });
  app2.delete("/api/waitlist/:waitlistId", isAuthenticated, async (req, res) => {
    try {
      const { waitlistId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const [entry] = await db.select().from(classWaitlist).where(eq3(classWaitlist.id, waitlistId));
      if (!entry) return res.status(404).json({ message: "Waitlist entry not found" });
      await db.update(classWaitlist).set({ status: "removed", removedAt: /* @__PURE__ */ new Date() }).where(eq3(classWaitlist.id, waitlistId));
      const remaining = await db.select({ id: classWaitlist.id }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, entry.classId), eq3(classWaitlist.status, "waiting"), gt2(classWaitlist.position, entry.position))).orderBy(asc2(classWaitlist.position));
      for (let i = 0; i < remaining.length; i++) {
        await db.update(classWaitlist).set({ position: entry.position + i }).where(eq3(classWaitlist.id, remaining[i].id));
      }
      res.json({ message: "Removed from waitlist" });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove from waitlist" });
    }
  });
  app2.post("/api/waitlist/:waitlistId/enrol", isAuthenticated, async (req, res) => {
    try {
      const { waitlistId } = req.params;
      const user = req.user;
      if (!["company_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const [entry] = await db.select().from(classWaitlist).where(eq3(classWaitlist.id, waitlistId));
      if (!entry || entry.status !== "waiting") return res.status(404).json({ message: "Waitlist entry not found or already processed" });
      const enrollment = await storage.assignStudentToClass({ studentId: entry.studentId, classId: entry.classId, isActive: true });
      await db.update(classWaitlist).set({ status: "enrolled", enrolledAt: /* @__PURE__ */ new Date() }).where(eq3(classWaitlist.id, waitlistId));
      const remaining = await db.select({ id: classWaitlist.id }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, entry.classId), eq3(classWaitlist.status, "waiting"), gt2(classWaitlist.position, entry.position))).orderBy(asc2(classWaitlist.position));
      for (let i = 0; i < remaining.length; i++) {
        await db.update(classWaitlist).set({ position: entry.position + i }).where(eq3(classWaitlist.id, remaining[i].id));
      }
      res.json({ enrollment, message: "Student enrolled from waitlist" });
    } catch (err) {
      console.error("Error enrolling from waitlist:", err);
      res.status(500).json({ message: err.message ?? "Failed to enrol from waitlist" });
    }
  });
  app2.get("/api/businesses/:businessId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { businessId } = req.params;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== businessId) return res.status(403).json({ message: "Access denied" });
      }
      const [company] = await db.select().from(tutoringCompanies).where(eq3(tutoringCompanies.id, businessId));
      if (!company) return res.status(404).json({ message: "Not found" });
      const subjectRows = await db.select({ code: companySubjects.code }).from(companySubjects).where(eq3(companySubjects.companyId, businessId));
      const codeToId = new Map(SUBJECTS.map((s) => [s.code, s.id]));
      const activeSubjectIds = subjectRows.map((s) => codeToId.get(s.code)).filter(Boolean);
      res.json({ ...company, active_subject_ids: activeSubjectIds });
    } catch (err) {
      res.status(500).json({ message: err.message ?? "Failed to fetch business" });
    }
  });
  app2.patch("/api/businesses/:businessId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { businessId } = req.params;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== businessId) return res.status(403).json({ message: "Access denied" });
      }
      const { name, legal_name, abn, logo, timezone, currency, paymentBsb, paymentAccount, paymentReference, paymentNotes } = req.body;
      const updates = {};
      if (name !== void 0) updates.name = name;
      if (legal_name !== void 0) updates.legalName = legal_name;
      if (abn !== void 0) updates.abn = abn;
      if (logo !== void 0) updates.logo = logo;
      if (timezone !== void 0) updates.timezone = timezone;
      if (currency !== void 0) updates.currency = currency;
      if (paymentBsb !== void 0) updates.paymentBsb = paymentBsb;
      if (paymentAccount !== void 0) updates.paymentAccount = paymentAccount;
      if (paymentReference !== void 0) updates.paymentReference = paymentReference;
      if (paymentNotes !== void 0) updates.paymentNotes = paymentNotes;
      const company = await storage.updateTutoringCompany(businessId, updates);
      res.json(company);
    } catch (err) {
      res.status(500).json({ message: err.message ?? "Failed to update business" });
    }
  });
  app2.patch("/api/businesses/:businessId/subjects", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { businessId } = req.params;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== businessId) return res.status(403).json({ message: "Access denied" });
      }
      const { active_subject_ids } = req.body;
      if (!Array.isArray(active_subject_ids)) return res.status(400).json({ message: "active_subject_ids must be an array" });
      await db.delete(companySubjects).where(eq3(companySubjects.companyId, businessId));
      if (active_subject_ids.length > 0) {
        await db.insert(companySubjects).values(active_subject_ids.map((subjectId) => {
          const s = SUBJECTS.find((sub) => sub.id === subjectId);
          return { companyId: businessId, name: s?.name ?? String(subjectId), code: s?.code ?? String(subjectId) };
        }));
      }
      res.json({ message: "Subjects updated", count: active_subject_ids.length });
    } catch (err) {
      res.status(500).json({ message: err.message ?? "Failed to update subjects" });
    }
  });
  app2.post("/api/businesses/:businessId/students", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { businessId } = req.params;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Company admin or admin access required" });
      }
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== businessId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }
      const { first_name, last_name, year_group_code, school, roll_number, date_of_birth, address, learning_goals, notes, parents: parents2 } = req.body;
      if (!first_name?.trim() || !last_name?.trim()) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      if (!address?.trim()) {
        return res.status(400).json({ message: "Address is required" });
      }
      const slug = `${first_name.trim().toLowerCase()}.${last_name.trim().toLowerCase()}`.replace(/[^a-z.]/g, "");
      const placeholderEmail = `${slug}.${Date.now()}@student.eslate.internal`;
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_customAuth(), customAuth_exports));
      const newUser = await storage.createUserWithRole({
        email: placeholderEmail,
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        password: await hashPassword2("TempPass123!"),
        role: "student",
        isActive: true,
        isEmailVerified: true
      });
      const dob = date_of_birth ? new Date(date_of_birth) : null;
      const contacts = Array.isArray(parents2) ? parents2.filter((p) => p?.name?.trim()).map((p, i) => ({
        name: p.name.trim(),
        relationship: p.relationship?.trim() || null,
        email: p.email?.trim() || null,
        phone: p.phone?.trim() || null,
        isPrimary: !!p.is_primary || i === 0
      })) : [];
      const student = await storage.createStudentWithContacts({
        userId: newUser.id,
        companyId: businessId,
        schoolName: school?.trim() || null,
        yearGroupCode: year_group_code || null,
        rollNumber: roll_number?.trim() || null,
        dateOfBirth: dob,
        address: address.trim(),
        learningGoals: learning_goals?.trim() || null,
        notes: notes?.trim() || null,
        contacts
      });
      res.status(201).json({ message: "Student created", student });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student", error: error.message });
    }
  });
  app2.get("/api/companies/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.patch("/api/companies/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      const { name, description, contactEmail, contactPhone, address } = req.body;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Company name is required" });
      }
      if (!contactEmail || !contactEmail.trim()) {
        return res.status(400).json({ message: "Contact email is required" });
      }
      if (!contactPhone || !contactPhone.trim()) {
        return res.status(400).json({ message: "Contact phone is required" });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ message: "Address is required" });
      }
      const updatedCompany = await storage.updateTutoringCompany(companyId, {
        name: name.trim(),
        description: description?.trim() || null,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        address: address.trim()
      });
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });
  app2.get("/api/company-admin/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "company_admin") {
        return res.status(403).json({ error: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) {
        return res.status(404).json({ error: "Company admin profile not found" });
      }
      const company = await storage.getTutoringCompany(companyAdmin.companyId);
      res.json({
        ...companyAdmin,
        company
      });
    } catch (error) {
      console.error("Error getting company admin profile:", error);
      res.status(500).json({ error: error.message || "Failed to get profile" });
    }
  });
  app2.get("/api/admin/company-admin/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(userId);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const company = await storage.getTutoringCompany(companyAdmin.companyId);
      res.json({
        ...companyAdmin,
        companyName: company?.name ?? null
      });
    } catch (error) {
      console.error("Error fetching company admin:", error);
      res.status(500).json({ message: "Failed to fetch company admin" });
    }
  });
  app2.get("/api/admin/company-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Company admin access required" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const [company] = await db.select({
        tutorChatEnabled: tutoringCompanies.tutorChatEnabled,
        state: tutoringCompanies.state,
        name: tutoringCompanies.name,
        description: tutoringCompanies.description,
        contactEmail: tutoringCompanies.contactEmail,
        contactPhone: tutoringCompanies.contactPhone,
        address: tutoringCompanies.address
      }).from(tutoringCompanies).where(eq3(tutoringCompanies.id, companyAdmin.companyId));
      res.json(company || { tutorChatEnabled: true });
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });
  app2.patch("/api/admin/company-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Company admin access required" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const { tutorChatEnabled, state, name, description, contactEmail, contactPhone, address } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (tutorChatEnabled !== void 0) updates.tutorChatEnabled = tutorChatEnabled;
      if (state !== void 0) updates.state = state;
      if (name !== void 0) updates.name = name;
      if (description !== void 0) updates.description = description;
      if (contactEmail !== void 0) updates.contactEmail = contactEmail;
      if (contactPhone !== void 0) updates.contactPhone = contactPhone;
      if (address !== void 0) updates.address = address;
      await db.update(tutoringCompanies).set(updates).where(eq3(tutoringCompanies.id, companyAdmin.companyId));
      res.json({ message: "Settings updated" });
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/admin/support-contacts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Company admin access required" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const contacts = await db.select({
        id: companySupportContacts.id,
        userId: companySupportContacts.userId,
        roleLabel: companySupportContacts.roleLabel,
        isActive: companySupportContacts.isActive,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }).from(companySupportContacts).leftJoin(users, eq3(companySupportContacts.userId, users.id)).where(eq3(companySupportContacts.companyId, companyAdmin.companyId));
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching support contacts:", error);
      res.status(500).json({ message: "Failed to fetch support contacts" });
    }
  });
  app2.post("/api/admin/support-contacts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Company admin access required" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const { email, userId, roleLabel } = req.body;
      let targetUserId = userId;
      if (email && !userId) {
        const targetUser = await storage.getUserByEmail(email);
        if (!targetUser) {
          return res.status(404).json({ message: "No user found with that email address. The staff member must have an account first." });
        }
        targetUserId = targetUser.id;
      }
      if (!targetUserId) {
        return res.status(400).json({ message: "Please provide an email or userId" });
      }
      const existing = await db.select().from(companySupportContacts).where(eq3(companySupportContacts.companyId, companyAdmin.companyId));
      if (existing.some((c) => c.userId === targetUserId)) {
        return res.status(400).json({ message: "This person is already a support contact." });
      }
      const [contact] = await db.insert(companySupportContacts).values({
        companyId: companyAdmin.companyId,
        userId: targetUserId,
        roleLabel: roleLabel || "Support"
      }).returning();
      res.json(contact);
    } catch (error) {
      console.error("Error creating support contact:", error);
      res.status(500).json({ message: "Failed to create support contact" });
    }
  });
  app2.delete("/api/admin/support-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin") {
        return res.status(403).json({ message: "Company admin access required" });
      }
      const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
      if (!companyAdmin) return res.status(404).json({ message: "Company admin not found" });
      const [contact] = await db.select().from(companySupportContacts).where(eq3(companySupportContacts.id, req.params.id));
      if (!contact || contact.companyId !== companyAdmin.companyId) {
        return res.status(404).json({ message: "Support contact not found" });
      }
      await db.delete(companySupportContacts).where(eq3(companySupportContacts.id, req.params.id));
      res.json({ message: "Support contact removed" });
    } catch (error) {
      console.error("Error deleting support contact:", error);
      res.status(500).json({ message: "Failed to delete support contact" });
    }
  });
  app2.get("/api/admin/academic-years", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      let years;
      if (user.role === "admin") {
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
  app2.post("/api/admin/academic-years", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      let yearData = req.body;
      if (user.role === "company_admin") {
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
  app2.get("/api/companies/:companyId/academic-years", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.post("/api/companies/:companyId/academic-years", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.delete("/api/companies/:companyId/academic-years/:yearId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, yearId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      await storage.deleteAcademicYear(yearId);
      res.json({ message: "Academic year deleted successfully" });
    } catch (error) {
      console.error("Error deleting academic year:", error);
      res.status(500).json({ message: "Failed to delete academic year" });
    }
  });
  app2.get("/api/companies/:companyId/academic-terms", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const { yearId } = req.query;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      let terms;
      if (yearId) {
        terms = await storage.getAcademicTermsByYear(yearId);
      } else {
        terms = await storage.getAcademicTermsByCompany(companyId);
      }
      res.json(terms);
    } catch (error) {
      console.error("Error fetching academic terms:", error);
      res.status(500).json({ message: "Failed to fetch academic terms" });
    }
  });
  async function checkTermOverlap(yearId, startDate, endDate, excludeTermId) {
    const existing = await storage.getAcademicTermsByYear(yearId);
    const conflicts = [];
    for (const t of existing) {
      if (excludeTermId && t.id === excludeTermId) continue;
      const tStart = new Date(t.startDate);
      const tEnd = new Date(t.endDate);
      const overlaps = startDate <= tEnd && endDate >= tStart;
      if (overlaps) conflicts.push(t.name);
    }
    return conflicts;
  }
  app2.post("/api/companies/:companyId/academic-terms", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      if (startDate >= endDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }
      if (req.body.academicYearId) {
        const conflicts = await checkTermOverlap(req.body.academicYearId, startDate, endDate);
        if (conflicts.length > 0) {
          return res.status(409).json({
            message: `Date range overlaps with existing term(s): ${conflicts.join(", ")}`,
            conflicts
          });
        }
      }
      const validatedData = insertAcademicTermSchema.parse({
        ...req.body,
        companyId,
        startDate,
        endDate
      });
      const term = await storage.createAcademicTerm(validatedData);
      res.json(term);
    } catch (error) {
      console.error("Error creating academic term:", error);
      res.status(500).json({ message: "Failed to create academic term" });
    }
  });
  app2.patch("/api/companies/:companyId/academic-terms/:termId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, termId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const existing = await storage.getAcademicTerm(termId);
      if (!existing || existing.companyId !== companyId) {
        return res.status(404).json({ message: "Term not found" });
      }
      const updates = {};
      if (req.body.name !== void 0) updates.name = req.body.name;
      if (req.body.startDate !== void 0 || req.body.endDate !== void 0) {
        const newStart = req.body.startDate ? new Date(req.body.startDate) : new Date(existing.startDate);
        const newEnd = req.body.endDate ? new Date(req.body.endDate) : new Date(existing.endDate);
        if (newStart >= newEnd) {
          return res.status(400).json({ message: "Start date must be before end date" });
        }
        const conflicts = await checkTermOverlap(existing.academicYearId, newStart, newEnd, termId);
        if (conflicts.length > 0) {
          return res.status(409).json({
            message: `Date range overlaps with: ${conflicts.join(", ")}`,
            conflicts
          });
        }
        updates.startDate = newStart;
        updates.endDate = newEnd;
      }
      const updated = await storage.updateAcademicTerm(termId, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating academic term:", error);
      res.status(500).json({ message: "Failed to update academic term" });
    }
  });
  app2.get("/api/companies/:companyId/classes", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const { termId } = req.query;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      let classes2;
      if (termId) {
        classes2 = await storage.getClassesByTerm(termId);
      } else {
        classes2 = await storage.getClassesByCompany(companyId);
      }
      res.json(classes2);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  app2.post("/api/companies/:companyId/classes", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.put("/api/companies/:companyId/classes/:classId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.patch("/api/companies/:companyId/classes/:classId/archive", isAuthenticated, async (req, res) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      await storage.deleteClass(classId);
      res.json({ message: "Class archived successfully" });
    } catch (error) {
      console.error("Error archiving class:", error);
      res.status(500).json({ message: "Failed to archive class" });
    }
  });
  function timeRangesOverlap(start1, end1, start2, end2) {
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const s1 = toMinutes(start1), e1 = toMinutes(end1);
    const s2 = toMinutes(start2), e2 = toMinutes(end2);
    return s1 < e2 && s2 < e1;
  }
  app2.get("/api/classes/:classId/tutor-conflicts", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const { tutorId } = req.query;
      if (!tutorId) {
        return res.json({ conflicts: [] });
      }
      const targetClass = await storage.getClass(classId);
      if (!targetClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      const tutorClasses = await storage.getClassesByTutor(tutorId);
      const conflicts = [];
      for (const existingClass of tutorClasses) {
        if (existingClass.id === classId || !existingClass.isActive) continue;
        const targetDays = targetClass.daysOfWeek || (targetClass.dayOfWeek !== null ? [targetClass.dayOfWeek] : []);
        const existingDays = existingClass.daysOfWeek || (existingClass.dayOfWeek !== null ? [existingClass.dayOfWeek] : []);
        const overlappingDays = targetDays.filter((d) => existingDays.includes(d));
        if (overlappingDays.length > 0) {
          if (timeRangesOverlap(targetClass.startTime, targetClass.endTime, existingClass.startTime, existingClass.endTime)) {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            conflicts.push({
              type: "schedule_conflict",
              severity: "warning",
              message: `Tutor is already teaching "${existingClass.name}" on ${overlappingDays.map((d) => dayNames[d]).join(", ")} at ${existingClass.startTime}-${existingClass.endTime}`,
              conflictingClass: {
                id: existingClass.id,
                name: existingClass.name,
                subject: existingClass.subject,
                days: overlappingDays.map((d) => dayNames[d]),
                time: `${existingClass.startTime}-${existingClass.endTime}`
              }
            });
          }
        }
      }
      res.json({ conflicts });
    } catch (error) {
      console.error("Error checking tutor conflicts:", error);
      res.status(500).json({ message: "Failed to check tutor conflicts" });
    }
  });
  app2.patch("/api/classes/:classId/tutor", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const { tutorId, ignoreConflicts } = req.body;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin) {
          return res.status(403).json({ message: "Company admin not found" });
        }
        const term2 = await storage.getAcademicTerm(classData.termId);
        if (!term2) {
          return res.status(404).json({ message: "Term not found" });
        }
        const year2 = await storage.getAcademicYear(term2.academicYearId);
        if (!year2 || year2.companyId !== companyAdmin.companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const term = await storage.getAcademicTerm(classData.termId);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      const year = await storage.getAcademicYear(term.academicYearId);
      if (!year) {
        return res.status(404).json({ message: "Academic year not found" });
      }
      const classCompanyId = year.companyId;
      if (tutorId) {
        const tutor = await storage.getTutor(tutorId);
        if (!tutor) {
          return res.status(404).json({ message: "Tutor not found" });
        }
        if (tutor.companyId !== classCompanyId) {
          return res.status(400).json({ message: "Tutor must belong to the same company as the class" });
        }
        if (!ignoreConflicts) {
          const tutorClasses = await storage.getClassesByTutor(tutorId);
          const conflicts = [];
          for (const existingClass of tutorClasses) {
            if (existingClass.id === classId || !existingClass.isActive) continue;
            const targetDays = classData.daysOfWeek || (classData.dayOfWeek !== null ? [classData.dayOfWeek] : []);
            const existingDays = existingClass.daysOfWeek || (existingClass.dayOfWeek !== null ? [existingClass.dayOfWeek] : []);
            const overlappingDays = targetDays.filter((d) => existingDays.includes(d));
            if (overlappingDays.length > 0 && timeRangesOverlap(classData.startTime, classData.endTime, existingClass.startTime, existingClass.endTime)) {
              const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              conflicts.push(`${existingClass.name} on ${overlappingDays.map((d) => dayNames[d]).join(", ")} at ${existingClass.startTime}-${existingClass.endTime}`);
            }
          }
          if (conflicts.length > 0) {
            return res.status(409).json({
              message: "Schedule conflict detected",
              conflicts,
              requiresConfirmation: true
            });
          }
        }
      }
      const updatedClass = await storage.updateClass(classId, { tutorId: tutorId || null });
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class tutor:", error);
      res.status(500).json({ message: "Failed to update class tutor" });
    }
  });
  app2.delete("/api/companies/:companyId/classes/:classId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, classId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const cls = await storage.getClass(classId);
      if (!cls || cls.companyId !== companyId) {
        return res.status(404).json({ message: "Class not found" });
      }
      await storage.permanentlyDeleteClass(classId);
      res.json({ message: "Class deleted permanently" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });
  app2.get("/api/classes/:classId/students", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Access denied" });
      }
      const enrollments = await storage.getStudentsByClass(classId);
      const enrolledStudents = await Promise.all(
        enrollments.map(async (enrollment) => {
          const student = await storage.getStudent(enrollment.studentId);
          return {
            ...enrollment,
            student
          };
        })
      );
      res.json(enrolledStudents);
    } catch (error) {
      console.error("Error fetching class students:", error);
      res.status(500).json({ message: "Failed to fetch class students" });
    }
  });
  app2.get("/api/classes/:classId/enrollment-conflicts", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentId } = req.query;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      const conflicts = [];
      const currentEnrollments = await storage.getStudentsByClass(classId);
      const activeEnrollments = currentEnrollments.filter((e) => e.isActive);
      const maxStudents = classData.maxStudents || 20;
      if (activeEnrollments.length >= maxStudents) {
        conflicts.push({
          type: "capacity_exceeded",
          severity: "error",
          message: `Class is at full capacity (${activeEnrollments.length}/${maxStudents} students)`,
          current: activeEnrollments.length,
          max: maxStudents
        });
      } else if (activeEnrollments.length >= maxStudents - 2) {
        conflicts.push({
          type: "capacity_warning",
          severity: "warning",
          message: `Class is nearly full (${activeEnrollments.length}/${maxStudents} students)`,
          current: activeEnrollments.length,
          max: maxStudents
        });
      }
      if (studentId) {
        const existingEnrollments = await storage.getClassesByStudent(studentId);
        const alreadyEnrolled = existingEnrollments.some((e) => e.classId === classId && e.isActive);
        if (alreadyEnrolled) {
          conflicts.push({
            type: "duplicate_enrollment",
            severity: "error",
            message: "Student is already enrolled in this class"
          });
        }
        const studentClasses = await Promise.all(
          existingEnrollments.filter((e) => e.isActive && e.classId !== classId).map(async (e) => {
            return storage.getClass(e.classId);
          })
        );
        for (const existingClass of studentClasses) {
          if (!existingClass || !existingClass.isActive) continue;
          const targetDays = classData.daysOfWeek || (classData.dayOfWeek !== null ? [classData.dayOfWeek] : []);
          const existingDays = existingClass.daysOfWeek || (existingClass.dayOfWeek !== null ? [existingClass.dayOfWeek] : []);
          const overlappingDays = targetDays.filter((d) => existingDays.includes(d));
          if (overlappingDays.length > 0 && timeRangesOverlap(classData.startTime, classData.endTime, existingClass.startTime, existingClass.endTime)) {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            conflicts.push({
              type: "schedule_conflict",
              severity: "warning",
              message: `Student has "${existingClass.name}" on ${overlappingDays.map((d) => dayNames[d]).join(", ")} at ${existingClass.startTime}-${existingClass.endTime}`,
              conflictingClass: {
                id: existingClass.id,
                name: existingClass.name,
                subject: existingClass.subject
              }
            });
          }
        }
      }
      res.json({
        conflicts,
        capacity: {
          current: activeEnrollments.length,
          max: maxStudents,
          available: maxStudents - activeEnrollments.length
        }
      });
    } catch (error) {
      console.error("Error checking enrollment conflicts:", error);
      res.status(500).json({ message: "Failed to check enrollment conflicts" });
    }
  });
  app2.post("/api/classes/:classId/students", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentId, ignoreConflicts } = req.body;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (!studentId) {
        return res.status(400).json({ message: "Student ID is required" });
      }
      const existingEnrollments = await storage.getClassesByStudent(studentId);
      const alreadyEnrolled = existingEnrollments.some((e) => e.classId === classId && e.isActive);
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Student is already enrolled in this class", conflictType: "duplicate_enrollment" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      const currentEnrollments = await storage.getStudentsByClass(classId);
      const activeEnrollments = currentEnrollments.filter((e) => e.isActive);
      const maxStudents = classData.maxStudents || 20;
      if (activeEnrollments.length >= maxStudents && !ignoreConflicts) {
        return res.status(409).json({
          message: `Class is at full capacity (${activeEnrollments.length}/${maxStudents} students)`,
          conflictType: "capacity_exceeded",
          requiresConfirmation: true,
          capacity: {
            current: activeEnrollments.length,
            max: maxStudents
          }
        });
      }
      if (!ignoreConflicts) {
        const studentClasses = await Promise.all(
          existingEnrollments.filter((e) => e.isActive).map(async (e) => {
            return storage.getClass(e.classId);
          })
        );
        const scheduleConflicts = [];
        for (const existingClass of studentClasses) {
          if (!existingClass || !existingClass.isActive) continue;
          const targetDays = classData.daysOfWeek || (classData.dayOfWeek !== null ? [classData.dayOfWeek] : []);
          const existingDays = existingClass.daysOfWeek || (existingClass.dayOfWeek !== null ? [existingClass.dayOfWeek] : []);
          const overlappingDays = targetDays.filter((d) => existingDays.includes(d));
          if (overlappingDays.length > 0 && timeRangesOverlap(classData.startTime, classData.endTime, existingClass.startTime, existingClass.endTime)) {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            scheduleConflicts.push(`${existingClass.name} on ${overlappingDays.map((d) => dayNames[d]).join(", ")} at ${existingClass.startTime}-${existingClass.endTime}`);
          }
        }
        if (scheduleConflicts.length > 0) {
          return res.status(409).json({
            message: "Schedule conflict detected",
            conflictType: "schedule_conflict",
            conflicts: scheduleConflicts,
            requiresConfirmation: true
          });
        }
      }
      const enrollment = await storage.assignStudentToClass({
        studentId,
        classId,
        isActive: true
      });
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  });
  app2.delete("/api/classes/:classId/students/:studentId", isAuthenticated, async (req, res) => {
    try {
      const { classId, studentId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      await storage.removeStudentFromClass(studentId, classId);
      const [topWaiting] = await db.select({
        id: classWaitlist.id,
        position: classWaitlist.position,
        studentId: classWaitlist.studentId,
        classId: classWaitlist.classId
      }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, classId), eq3(classWaitlist.status, "waiting"))).orderBy(asc2(classWaitlist.position)).limit(1);
      let waitlistInfo = null;
      if (topWaiting) {
        const [wStudent] = await db.select({ id: students.id, userId: students.userId }).from(students).where(eq3(students.id, topWaiting.studentId));
        const [wUser] = wStudent ? await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, wStudent.userId)) : [null];
        const studentName = `${wUser?.firstName ?? ""} ${wUser?.lastName ?? ""}`.trim();
        const allWaiting = await db.select({ id: classWaitlist.id }).from(classWaitlist).where(and3(eq3(classWaitlist.classId, classId), eq3(classWaitlist.status, "waiting")));
        const cls = await storage.getClass(classId);
        await db.insert(inAppNotifications).values({
          userId: user.id,
          type: "waitlist_spot_open",
          title: "Spot opened in class",
          message: `A spot opened in ${cls?.name ?? classId}. ${allWaiting.length} student${allWaiting.length === 1 ? "" : "s"} on waitlist. Next: ${studentName}.`,
          data: { classId, waitlistId: topWaiting.id, nextStudentName: studentName }
        });
        waitlistInfo = { waitlistCount: allWaiting.length, nextStudentName: studentName, waitlistId: topWaiting.id };
      }
      res.json({ message: "Student removed from class successfully", waitlistInfo });
    } catch (error) {
      console.error("Error removing student from class:", error);
      res.status(500).json({ message: "Failed to remove student from class" });
    }
  });
  app2.get("/api/students/:studentId/enrollments", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin" && user.role !== "tutor") {
        if (user.role === "student") {
          const student = await storage.getStudentByUserId(user.id);
          if (!student || student.id !== studentId) {
            return res.status(403).json({ message: "Access denied" });
          }
        } else {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const enrollments = await storage.getClassesByStudent(studentId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({ message: "Failed to fetch student enrollments" });
    }
  });
  app2.get("/api/companies/:companyId/enrollments", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }
      if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied to this company" });
        }
      }
      const classes2 = await storage.getClassesByCompany(companyId);
      const enrollmentsByClass = {};
      await Promise.all(
        classes2.map(async (classItem) => {
          const enrollments = await storage.getStudentsByClass(classItem.id);
          const enrolledStudents = await Promise.all(
            enrollments.map(async (enrollment) => {
              const student = await storage.getStudent(enrollment.studentId);
              return {
                ...enrollment,
                student
              };
            })
          );
          enrollmentsByClass[classItem.id] = enrolledStudents;
        })
      );
      res.json(enrollmentsByClass);
    } catch (error) {
      console.error("Error fetching company enrollments:", error);
      res.status(500).json({ message: "Failed to fetch company enrollments" });
    }
  });
  app2.patch("/api/companies/:companyId/academic-terms/:termId/archive", isAuthenticated, async (req, res) => {
    try {
      const { companyId, termId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      await storage.deleteAcademicTerm(termId);
      res.json({ message: "Term archived successfully" });
    } catch (error) {
      console.error("Error archiving term:", error);
      res.status(500).json({ message: "Failed to archive term" });
    }
  });
  app2.delete("/api/companies/:companyId/academic-terms/:termId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, termId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
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
  app2.get("/api/companies/:companyId/academic-hierarchy", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const academicYears3 = await storage.getAcademicYearsByCompany(companyId);
      const hierarchy = await Promise.all(
        academicYears3.map(async (year) => {
          const terms = await storage.getAcademicTermsByYear(year.id);
          const termsWithClasses = await Promise.all(
            terms.map(async (term) => {
              const classes2 = await storage.getClassesByTerm(term.id);
              return {
                ...term,
                classes: classes2
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
  app2.get("/api/companies/:companyId/academic-weeks", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const { termId } = req.query;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Access required" });
      }
      if (!termId) return res.status(400).json({ message: "termId query param required" });
      const weeks = await storage.getAcademicWeeksByTerm(termId);
      res.json(weeks);
    } catch (error) {
      console.error("Error fetching academic weeks:", error);
      res.status(500).json({ message: "Failed to fetch academic weeks" });
    }
  });
  app2.post("/api/companies/:companyId/academic-auto-setup", isAuthenticated, async (req, res) => {
    try {
      let generateWeeks2 = function(termStart, termEnd) {
        const weeks = [];
        const dayOfWeek = termStart.getDay();
        const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : -(dayOfWeek - 1);
        const firstMonday = new Date(termStart);
        firstMonday.setDate(termStart.getDate() + daysToMonday);
        let weekStart = new Date(firstMonday);
        let weekNum = 1;
        while (weekStart <= termEnd) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 4);
          if (weekEnd > termEnd) weekEnd.setTime(termEnd.getTime());
          weeks.push({
            weekNumber: weekNum,
            name: `Week ${weekNum}`,
            startDate: new Date(weekStart),
            endDate: new Date(weekEnd)
          });
          weekStart.setDate(weekStart.getDate() + 7);
          weekNum++;
        }
        return weeks;
      };
      var generateWeeks = generateWeeks2;
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin or company admin access required" });
      }
      if (user.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const { yearId, state, division, clearExisting } = req.body;
      if (!yearId || !state) {
        return res.status(400).json({ message: "yearId and state are required" });
      }
      const academicYear = await storage.getAcademicYear(yearId);
      if (!academicYear || academicYear.companyId !== companyId) {
        return res.status(404).json({ message: "Academic year not found" });
      }
      const AUS_2026_TERMS = {
        NSW: {
          Eastern: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-01-27"), endDate: /* @__PURE__ */ new Date("2026-04-01") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-28"), endDate: /* @__PURE__ */ new Date("2026-07-04") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-21"), endDate: /* @__PURE__ */ new Date("2026-09-26") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-13"), endDate: /* @__PURE__ */ new Date("2026-12-19") }
          ],
          Western: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-02-03"), endDate: /* @__PURE__ */ new Date("2026-04-01") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-28"), endDate: /* @__PURE__ */ new Date("2026-07-04") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-21"), endDate: /* @__PURE__ */ new Date("2026-09-26") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-13"), endDate: /* @__PURE__ */ new Date("2026-12-19") }
          ]
        },
        // Victoria — source: vic.gov.au / schools.vic.gov.au
        VIC: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-01-28"), endDate: /* @__PURE__ */ new Date("2026-04-02") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-20"), endDate: /* @__PURE__ */ new Date("2026-06-26") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-13"), endDate: /* @__PURE__ */ new Date("2026-09-18") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-05"), endDate: /* @__PURE__ */ new Date("2026-12-18") }
          ]
        },
        // Queensland — source: education.qld.gov.au
        QLD: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-01-27"), endDate: /* @__PURE__ */ new Date("2026-03-25") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-12"), endDate: /* @__PURE__ */ new Date("2026-06-25") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-12"), endDate: /* @__PURE__ */ new Date("2026-09-17") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-05"), endDate: /* @__PURE__ */ new Date("2026-12-10") }
          ]
        },
        // South Australia — source: education.sa.gov.au
        SA: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-01-27"), endDate: /* @__PURE__ */ new Date("2026-04-10") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-27"), endDate: /* @__PURE__ */ new Date("2026-07-03") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-20"), endDate: /* @__PURE__ */ new Date("2026-09-25") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-12"), endDate: /* @__PURE__ */ new Date("2026-12-11") }
          ]
        },
        // Western Australia — source: education.wa.edu.au
        WA: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-02-02"), endDate: /* @__PURE__ */ new Date("2026-04-02") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-20"), endDate: /* @__PURE__ */ new Date("2026-07-03") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-20"), endDate: /* @__PURE__ */ new Date("2026-09-25") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-12"), endDate: /* @__PURE__ */ new Date("2026-12-17") }
          ]
        },
        // Tasmania — source: decyp.tas.gov.au
        TAS: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-02-05"), endDate: /* @__PURE__ */ new Date("2026-04-17") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-05-04"), endDate: /* @__PURE__ */ new Date("2026-07-10") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-27"), endDate: /* @__PURE__ */ new Date("2026-10-02") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-19"), endDate: /* @__PURE__ */ new Date("2026-12-18") }
          ]
        },
        // ACT — source: education.act.gov.au
        ACT: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-02-02"), endDate: /* @__PURE__ */ new Date("2026-04-02") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-21"), endDate: /* @__PURE__ */ new Date("2026-07-03") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-20"), endDate: /* @__PURE__ */ new Date("2026-09-25") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-13"), endDate: /* @__PURE__ */ new Date("2026-12-18") }
          ]
        },
        // Northern Territory — source: education.nt.gov.au (similar to QLD pattern)
        NT: {
          default: [
            { name: "Term 1", startDate: /* @__PURE__ */ new Date("2026-01-27"), endDate: /* @__PURE__ */ new Date("2026-03-27") },
            { name: "Term 2", startDate: /* @__PURE__ */ new Date("2026-04-14"), endDate: /* @__PURE__ */ new Date("2026-06-26") },
            { name: "Term 3", startDate: /* @__PURE__ */ new Date("2026-07-14"), endDate: /* @__PURE__ */ new Date("2026-09-18") },
            { name: "Term 4", startDate: /* @__PURE__ */ new Date("2026-10-06"), endDate: /* @__PURE__ */ new Date("2026-12-11") }
          ]
        }
      };
      const companyRecord = await storage.getTutoringCompany(companyId);
      const effectiveState = (state || companyRecord?.state || "NSW").toUpperCase();
      const stateTerms = AUS_2026_TERMS[effectiveState] || AUS_2026_TERMS["NSW"];
      const termDates = stateTerms[division === "Western" && effectiveState === "NSW" ? "Western" : "default"] || stateTerms["Eastern"] || Object.values(stateTerms)[0];
      if (clearExisting) {
        const existingTerms = await storage.getAcademicTermsByYear(yearId);
        for (const t of existingTerms) {
          await storage.deleteAcademicTerm(t.id);
        }
      }
      const createdTerms = [];
      for (const termData of termDates) {
        const term = await storage.createAcademicTerm({
          academicYearId: yearId,
          companyId,
          name: termData.name,
          startDate: termData.startDate,
          endDate: termData.endDate,
          isActive: true
        });
        const weeksList = generateWeeks2(termData.startDate, termData.endDate);
        const createdWeeks = [];
        for (const week of weeksList) {
          const w = await storage.createAcademicWeek({
            termId: term.id,
            companyId,
            weekNumber: week.weekNumber,
            name: week.name,
            startDate: week.startDate,
            endDate: week.endDate
          });
          createdWeeks.push(w);
        }
        createdTerms.push({ ...term, weeks: createdWeeks });
      }
      const divisionLabel = effectiveState === "NSW" ? ` (${division ?? "Eastern"} Division)` : "";
      res.status(201).json({
        message: `Created ${createdTerms.length} terms with weeks for ${effectiveState}${divisionLabel} 2026`,
        terms: createdTerms,
        state: effectiveState
      });
    } catch (error) {
      console.error("Error in academic auto-setup:", error);
      res.status(500).json({ message: "Failed to auto-setup academic calendar" });
    }
  });
  app2.delete("/api/admin/clear-assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      res.json({ message: "Assignment clearing functionality has been deprecated" });
    } catch (error) {
      console.error("Error clearing assignments:", error);
      res.status(500).json({ message: "Failed to clear assignments" });
    }
  });
  app2.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const contentType = req.body?.contentType || void 0;
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });
  app2.post("/api/objects/metadata", isAuthenticated, async (req, res) => {
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
  app2.get("/api/public-objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      const [metadata] = await objectFile.getMetadata();
      const originalFileName = metadata.metadata?.originalName || "assignment-file";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size?.toString() || "0",
        "Content-Disposition": `inline; filename="${originalFileName}"`,
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        // Allow Google Docs Viewer to access
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Range"
      });
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
  app2.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const isEditMode = req.query.edit === "true";
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const [metadata] = await objectFile.getMetadata();
      const originalFileName = metadata.metadata?.originalName || "assignment-file";
      const contentType = metadata.contentType || "application/octet-stream";
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
            <button class="btn" onclick="downloadOriginal()">\u{1F4E5} Download Original</button>
            <button class="btn btn-primary" onclick="saveWork()">\u{1F4BE} Save Work</button>
            <button class="btn" onclick="submitAssignment()">\u{1F4E4} Submit Assignment</button>
        </div>
    </div>
    
    <div id="status" class="status"></div>
    
    <div class="file-preview">
        <h3>\u{1F4C4} Original Assignment File:</h3>
        <iframe src="${req.path}" frameborder="0"></iframe>
    </div>
    
    <div class="editor-content">
        <h3 style="padding: 15px 15px 0 15px; margin: 0;">\u270D\uFE0F Your Work Area:</h3>
        <textarea 
            class="editor-textarea" 
            placeholder="Complete your assignment here. You can reference the original file above and type your responses below...

\u{1F4DD} Instructions:
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
        res.setHeader("Content-Type", "text/html");
        return res.send(editorHtml);
      }
      objectStorageService.downloadObject(objectFile, res, 3600, originalFileName);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.get("/api/objects/:objectPath(*)/metadata", isAuthenticated, async (req, res) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      console.log("Getting metadata for object path:", objectPath);
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
      const { bucketName, objectName } = parseObjectPath2(objectEntityPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);
      const [exists] = await objectFile.exists();
      if (!exists) {
        return res.status(404).json({ error: "File not found" });
      }
      const [metadata] = await objectFile.getMetadata();
      res.json({
        originalName: metadata.metadata?.originalName || "Unknown file",
        contentType: metadata.contentType,
        size: metadata.size
      });
    } catch (error) {
      console.error("Error getting object metadata:", error);
      return res.status(500).json({ error: "Failed to get metadata" });
    }
  });
  app2.get("/api/convert-doc/:assignmentId", async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const documentUrl = assignment.attachmentUrls?.[0];
      if (!documentUrl) {
        return res.status(404).json({ error: "No document attachment found" });
      }
      const match = documentUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid document URL format" });
      }
      const bucketName = match[1];
      const objectName = match[2];
      console.log(`Converting document: gs://${bucketName}/${objectName}`);
      try {
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).json({ error: "Document file not found in storage" });
        }
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || "application/octet-stream";
        if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || contentType.includes("application/msword")) {
          const mammoth = __require("mammoth");
          const [fileBuffer] = await file.download();
          const result = await mammoth.convertToHtml({ buffer: fileBuffer });
          const html = result.value;
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
            "Content-Type": "text/html",
            "Cache-Control": "public, max-age=3600"
          });
          return res.send(fullHtml);
        } else {
          res.set({
            "Content-Type": contentType,
            "Content-Length": metadata.size?.toString() || "0",
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600"
          });
          const stream = file.createReadStream();
          stream.pipe(res);
          stream.on("error", (error) => {
            console.error("Error streaming document:", error);
            if (!res.headersSent) {
              res.status(500).json({ error: "Error streaming document file" });
            }
          });
        }
      } catch (storageError) {
        console.error("Google Cloud Storage error:", storageError);
        return res.status(500).json({ error: "Failed to access document file" });
      }
    } catch (error) {
      console.error("Document conversion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/public-doc/:assignmentId", async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const documentUrl = assignment.attachmentUrls?.[0];
      if (!documentUrl) {
        return res.status(404).json({ error: "No document attachment found" });
      }
      const match = documentUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid document URL format" });
      }
      const bucketName = match[1];
      const objectName = match[2];
      console.log(`Serving public document: gs://${bucketName}/${objectName}`);
      try {
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).json({ error: "Document file not found in storage" });
        }
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || "application/octet-stream";
        res.set({
          "Content-Type": contentType,
          "Content-Length": metadata.size?.toString() || "0",
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type"
        });
        const stream = file.createReadStream();
        stream.pipe(res);
        stream.on("error", (error) => {
          console.error("Error streaming public document:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error streaming document file" });
          }
        });
      } catch (storageError) {
        console.error("Google Cloud Storage error:", storageError);
        return res.status(500).json({ error: "Failed to access document file" });
      }
    } catch (error) {
      console.error("Public document proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/pdf-proxy/:assignmentId", isAuthenticated, async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const docIndex = parseInt(req.query.docIndex || "0", 10) || 0;
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const pdfUrl = assignment.attachmentUrls?.[docIndex] ?? assignment.attachmentUrls?.[0];
      if (!pdfUrl) {
        return res.status(404).json({ error: "No PDF attachment found" });
      }
      try {
        const objectStorageService = new ObjectStorageService();
        let file;
        if (pdfUrl.startsWith("/api/files/")) {
          const fileId = pdfUrl.split("/api/files/")[1];
          const privateDir = objectStorageService.getPrivateObjectDir();
          const objectPath = `${privateDir}/uploads/${fileId}`;
          const pathParts = objectPath.split("/").filter((p) => p);
          const bucketName = pathParts[0];
          const objectName = pathParts.slice(1).join("/");
          const bucket = objectStorageClient.bucket(bucketName);
          file = bucket.file(objectName);
          const [exists] = await file.exists();
          if (!exists) {
            return res.status(404).json({ error: "PDF file not found in storage" });
          }
        } else if (pdfUrl.startsWith("/objects/")) {
          file = await objectStorageService.getObjectEntityFile(pdfUrl);
        } else {
          const match = pdfUrl.match(/googleapis\.com\/([^\/]+)\/(.+)$/);
          if (!match) {
            return res.status(400).json({ error: "Invalid PDF URL format" });
          }
          const bucket = objectStorageClient.bucket(match[1]);
          file = bucket.file(match[2]);
          const [exists] = await file.exists();
          if (!exists) {
            return res.status(404).json({ error: "PDF file not found in storage" });
          }
        }
        const [metadata] = await file.getMetadata();
        res.set({
          "Content-Type": "application/pdf",
          "Content-Length": metadata.size?.toString() || "0",
          "Content-Disposition": "inline",
          // Display in browser, not download
          "Cache-Control": "private, max-age=3600"
          // Cache for 1 hour
        });
        const stream = file.createReadStream();
        stream.pipe(res);
        stream.on("error", (error) => {
          console.error("Error streaming PDF:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error streaming PDF file" });
          }
        });
      } catch (storageError) {
        console.error("Google Cloud Storage error:", storageError);
        if (storageError.code === 403) {
          return res.status(403).json({ error: "Access denied to PDF file" });
        }
        return res.status(500).json({ error: "Failed to access PDF file" });
      }
    } catch (error) {
      console.error("PDF proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/verify-password", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { password } = req.body;
      if (!password || password.trim().length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }
      res.json({ success: true, message: "Password verified" });
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({ message: "Failed to verify password" });
    }
  });
  const canManageWorksheets = (user) => {
    return user && ["admin", "company_admin", "tutor"].includes(user.role);
  };
  app2.post("/api/companies/:companyId/worksheets/from-pdf", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can create worksheets" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(400).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { companyId } = req.params;
      const { pdfPath, subject, gradeLevel, startPage, endPage } = req.body;
      if (!pdfPath) {
        return res.status(400).json({ error: "pdfPath is required" });
      }
      const fs2 = __require("fs");
      if (!fs2.existsSync(pdfPath)) {
        return res.status(400).json({ error: "PDF file not found at specified path" });
      }
      console.log(`Converting PDF to worksheet: ${pdfPath}`);
      const worksheetData = await aiService2.extractWorksheetFromPDF(pdfPath, {
        startPage,
        endPage,
        subject,
        gradeLevel
      });
      const worksheet = await storage.createWorksheet({
        title: worksheetData.title || "Untitled Worksheet",
        subject: worksheetData.subject || subject || "General",
        description: worksheetData.description || "",
        companyId,
        createdBy: user.id,
        isPublished: false
      });
      for (const pageData of worksheetData.pages) {
        const page = await storage.createWorksheetPage({
          worksheetId: worksheet.id,
          pageNumber: pageData.pageNumber,
          title: pageData.title || `Page ${pageData.pageNumber}`
        });
        for (const questionData of pageData.questions) {
          await storage.createWorksheetQuestion({
            pageId: page.id,
            questionNumber: questionData.questionNumber,
            questionType: questionData.questionType,
            questionText: questionData.questionText,
            options: questionData.options || null,
            correctAnswer: questionData.correctAnswer || null,
            helpText: questionData.helpText || null,
            points: questionData.points || 1
          });
        }
      }
      const fullWorksheet = await storage.getFullWorksheet(worksheet.id);
      res.status(201).json(fullWorksheet);
    } catch (error) {
      console.error("Error converting PDF to worksheet:", error);
      res.status(500).json({ error: error.message || "Failed to convert PDF to worksheet" });
    }
  });
  app2.get("/api/companies/:companyId/worksheets", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const worksheets2 = await storage.getWorksheetsByCompany(companyId);
      res.json(worksheets2);
    } catch (error) {
      console.error("Error fetching worksheets:", error);
      res.status(500).json({ error: "Failed to fetch worksheets" });
    }
  });
  app2.post("/api/companies/:companyId/worksheets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can create worksheets" });
      }
      const { companyId } = req.params;
      const worksheetData = {
        ...req.body,
        companyId,
        createdBy: user.id
      };
      const worksheet = await storage.createWorksheet(worksheetData);
      await storage.createWorksheetPage({
        worksheetId: worksheet.id,
        pageNumber: 1,
        title: "Page 1"
      });
      res.status(201).json(worksheet);
    } catch (error) {
      console.error("Error creating worksheet:", error);
      res.status(500).json({ error: "Failed to create worksheet" });
    }
  });
  app2.get("/api/worksheets/:worksheetId", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId } = req.params;
      const worksheet = await storage.getFullWorksheet(worksheetId);
      if (!worksheet) {
        return res.status(404).json({ error: "Worksheet not found" });
      }
      res.json(worksheet);
    } catch (error) {
      console.error("Error fetching worksheet:", error);
      res.status(500).json({ error: "Failed to fetch worksheet" });
    }
  });
  app2.patch("/api/worksheets/:worksheetId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can update worksheets" });
      }
      const { worksheetId } = req.params;
      const worksheet = await storage.updateWorksheet(worksheetId, req.body);
      res.json(worksheet);
    } catch (error) {
      console.error("Error updating worksheet:", error);
      res.status(500).json({ error: "Failed to update worksheet" });
    }
  });
  app2.delete("/api/worksheets/:worksheetId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can delete worksheets" });
      }
      const { worksheetId } = req.params;
      await storage.deleteWorksheet(worksheetId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting worksheet:", error);
      res.status(500).json({ error: "Failed to delete worksheet" });
    }
  });
  app2.post("/api/worksheets/:worksheetId/pages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can modify worksheets" });
      }
      const { worksheetId } = req.params;
      const pages = await storage.getWorksheetPages(worksheetId);
      const nextPageNumber = pages.length + 1;
      const page = await storage.createWorksheetPage({
        worksheetId,
        pageNumber: nextPageNumber,
        title: req.body.title || `Page ${nextPageNumber}`
      });
      res.status(201).json(page);
    } catch (error) {
      console.error("Error adding page:", error);
      res.status(500).json({ error: "Failed to add page" });
    }
  });
  app2.delete("/api/worksheets/pages/:pageId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can modify worksheets" });
      }
      const { pageId } = req.params;
      await storage.deleteWorksheetPage(pageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });
  app2.post("/api/worksheets/pages/:pageId/questions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can modify worksheets" });
      }
      const { pageId } = req.params;
      const questions = await storage.getWorksheetQuestions(pageId);
      const nextQuestionNumber = questions.length + 1;
      const question = await storage.createWorksheetQuestion({
        pageId,
        questionNumber: nextQuestionNumber,
        ...req.body
      });
      res.status(201).json(question);
    } catch (error) {
      console.error("Error adding question:", error);
      res.status(500).json({ error: "Failed to add question" });
    }
  });
  app2.patch("/api/worksheets/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can modify worksheets" });
      }
      const { questionId } = req.params;
      const question = await storage.updateWorksheetQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });
  app2.delete("/api/worksheets/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can modify worksheets" });
      }
      const { questionId } = req.params;
      await storage.deleteWorksheetQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });
  app2.post("/api/worksheets/:worksheetId/assign", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!canManageWorksheets(user)) {
        return res.status(403).json({ error: "Only tutors and admins can assign worksheets" });
      }
      const { worksheetId } = req.params;
      const { studentIds, classIds, dueDate } = req.body;
      const assignmentResults = [];
      if (studentIds && studentIds.length > 0) {
        for (const studentId of studentIds) {
          const assignment = await storage.createWorksheetAssignment({
            worksheetId,
            studentId,
            assignedBy: user.id,
            dueDate: dueDate ? new Date(dueDate) : null
          });
          assignmentResults.push(assignment);
        }
      }
      if (classIds && classIds.length > 0) {
        for (const classId of classIds) {
          const classStudents = await storage.getStudentsByClass(classId);
          for (const studentAssignment of classStudents) {
            const assignment = await storage.createWorksheetAssignment({
              worksheetId,
              studentId: studentAssignment.studentId,
              classId,
              assignedBy: user.id,
              dueDate: dueDate ? new Date(dueDate) : null
            });
            assignmentResults.push(assignment);
          }
        }
      }
      res.status(201).json(assignmentResults);
    } catch (error) {
      console.error("Error assigning worksheet:", error);
      res.status(500).json({ error: "Failed to assign worksheet" });
    }
  });
  app2.get("/api/worksheets/:worksheetId/assignments", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId } = req.params;
      const assignments3 = await storage.getWorksheetAssignments(worksheetId);
      res.json(assignments3);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/students/:studentId/worksheets", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const assignments3 = await storage.getStudentWorksheetAssignments(studentId);
      res.json(assignments3);
    } catch (error) {
      console.error("Error fetching student worksheets:", error);
      res.status(500).json({ error: "Failed to fetch worksheets" });
    }
  });
  app2.post("/api/worksheets/:worksheetId/answers", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId } = req.params;
      const { questionId, studentId, textAnswer, handwritingData, selectedOption } = req.body;
      const answer = await storage.upsertWorksheetAnswer(questionId, studentId, worksheetId, {
        textAnswer,
        handwritingData,
        selectedOption
      });
      await storage.updateWorksheetAssignmentProgress(worksheetId, studentId);
      res.json(answer);
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ error: "Failed to save answer" });
    }
  });
  app2.get("/api/worksheets/:worksheetId/answers/:studentId", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId, studentId } = req.params;
      const answers = await storage.getWorksheetAnswers(worksheetId, studentId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ error: "Failed to fetch answers" });
    }
  });
  app2.post("/api/worksheets/:worksheetId/submit/:studentId", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId, studentId } = req.params;
      await storage.submitWorksheetAnswers(worksheetId, studentId);
      try {
        const assignmentWithWorksheet = await storage.getAssignmentByWorksheetAndStudent(worksheetId, studentId);
        if (assignmentWithWorksheet) {
          const existingSubmissions = await storage.getSubmissionsByAssignmentAndStudent(assignmentWithWorksheet.id, studentId);
          const submissionTime = /* @__PURE__ */ new Date();
          let savedSubmission;
          if (existingSubmissions.length > 0) {
            savedSubmission = await storage.updateSubmission(existingSubmissions[0].id, {
              status: "submitted",
              isDraft: false,
              submittedAt: submissionTime
            });
          } else {
            const isLate = assignmentWithWorksheet.submissionDate ? submissionTime > new Date(assignmentWithWorksheet.submissionDate) : false;
            savedSubmission = await storage.createSubmission({
              assignmentId: assignmentWithWorksheet.id,
              studentId,
              status: "submitted",
              isDraft: false,
              isLate,
              submittedAt: submissionTime,
              content: null,
              documentUrl: null,
              deviceType: null,
              inputMethod: null,
              fileUrls: []
            });
          }
          const actualSubmissionTime = savedSubmission.submittedAt ? new Date(savedSubmission.submittedAt) : submissionTime;
          notifyParentOfSubmission(studentId, assignmentWithWorksheet.id, actualSubmissionTime, "submitted");
        } else {
          console.log("Worksheet submission completed but no linked assignment found for parent notification");
        }
      } catch (linkError) {
        console.log("Note: Could not link worksheet submission to assignment:", linkError);
      }
      res.json({ success: true, message: "Worksheet submitted successfully" });
    } catch (error) {
      console.error("Error submitting worksheet:", error);
      res.status(500).json({ error: "Failed to submit worksheet" });
    }
  });
  app2.post("/api/worksheets/:worksheetId/grade/:studentId", isAuthenticated, async (req, res) => {
    try {
      const { worksheetId, studentId } = req.params;
      const { grades } = req.body;
      if (!Array.isArray(grades)) {
        return res.status(400).json({ error: "Grades must be an array" });
      }
      const answers = await storage.getWorksheetAnswers(worksheetId, studentId);
      const answerMap = new Map(answers.map((a) => [a.questionId, a]));
      for (const gradeData of grades) {
        const { questionId, score, feedback } = gradeData;
        const answer = answerMap.get(questionId);
        if (answer) {
          await storage.updateWorksheetAnswer(answer.id, {
            grade: score,
            feedback: feedback || null
          });
        }
      }
      try {
        const assignment = await storage.getAssignmentByWorksheetAndStudent(worksheetId, studentId);
        if (assignment) {
          const submissions2 = await storage.getSubmissionsByAssignmentAndStudent(assignment.id, studentId);
          if (submissions2.length > 0) {
            const worksheetData = await storage.getFullWorksheet(worksheetId);
            const allQuestions = worksheetData?.pages?.flatMap((p) => p.questions || []) || [];
            let totalScore = 0;
            let maxScore = 0;
            for (const q of allQuestions) {
              if (q.questionType !== "information") {
                maxScore += q.points || 1;
                const gradeEntry = grades.find((g) => g.questionId === q.id);
                if (gradeEntry) {
                  totalScore += gradeEntry.score || 0;
                }
              }
            }
            await storage.updateSubmission(submissions2[0].id, {
              status: "graded",
              score: totalScore,
              feedback: `Graded: ${totalScore}/${maxScore} points`
            });
          }
        }
      } catch (linkError) {
        console.log("Note: Could not update linked submission:", linkError);
      }
      res.json({ success: true, message: "Grades saved successfully" });
    } catch (error) {
      console.error("Error grading worksheet:", error);
      res.status(500).json({ error: "Failed to save grades" });
    }
  });
  app2.get("/api/companies/:companyId/tests", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const tests2 = await storage.getTestsByCompany(companyId);
      res.json(tests2);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });
  app2.post("/api/companies/:companyId/tests", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const userId = req.user?.id;
      const testData = {
        ...req.body,
        companyId,
        createdBy: userId
      };
      const test = await storage.createTest(testData);
      res.json(test);
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(500).json({ error: "Failed to create test" });
    }
  });
  app2.get("/api/tests/:testId", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const isStudent = req.user?.role === "student";
      const testWithQuestions = await storage.getTestWithQuestions(testId);
      if (!testWithQuestions) {
        return res.status(404).json({ error: "Test not found" });
      }
      if (isStudent) {
        testWithQuestions.questions = testWithQuestions.questions.map((q) => ({
          ...q,
          correctAnswer: void 0,
          options: q.options ? q.options.map((opt) => ({
            id: opt.id,
            text: opt.text
            // Remove isCorrect for students
          })) : null,
          explanation: void 0
        }));
      }
      res.json(testWithQuestions);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });
  app2.patch("/api/tests/:testId", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const test = await storage.updateTest(testId, req.body);
      res.json(test);
    } catch (error) {
      console.error("Error updating test:", error);
      res.status(500).json({ error: "Failed to update test" });
    }
  });
  app2.delete("/api/tests/:testId", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      await storage.deleteTest(testId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting test:", error);
      res.status(500).json({ error: "Failed to delete test" });
    }
  });
  app2.post("/api/tests/:testId/questions", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const questionData = {
        ...req.body,
        testId
      };
      const question = await storage.createTestQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ error: "Failed to create question" });
    }
  });
  app2.patch("/api/tests/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const { questionId } = req.params;
      const question = await storage.updateTestQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });
  app2.delete("/api/tests/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const { questionId } = req.params;
      await storage.deleteTestQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });
  app2.post("/api/tests/:testId/assign", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const { studentIds, classId, dueDate } = req.body;
      const userId = req.user?.id;
      const assignments3 = [];
      if (classId) {
        const assignment = await storage.createTestAssignment({
          testId,
          classId,
          assignedBy: userId,
          dueDate: dueDate ? new Date(dueDate) : void 0
        });
        assignments3.push(assignment);
      }
      if (studentIds && Array.isArray(studentIds)) {
        for (const studentId of studentIds) {
          const assignment = await storage.createTestAssignment({
            testId,
            studentId,
            assignedBy: userId,
            dueDate: dueDate ? new Date(dueDate) : void 0
          });
          assignments3.push(assignment);
        }
      }
      const test = await storage.getTest(testId);
      if (test && test.status === "draft") {
        await storage.updateTest(testId, { status: "published" });
      }
      res.json({ success: true, assignments: assignments3 });
    } catch (error) {
      console.error("Error assigning test:", error);
      res.status(500).json({ error: "Failed to assign test" });
    }
  });
  app2.get("/api/tests/:testId/assignments", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const assignments3 = await storage.getTestAssignments(testId);
      res.json(assignments3);
    } catch (error) {
      console.error("Error fetching test assignments:", error);
      res.status(500).json({ error: "Failed to fetch test assignments" });
    }
  });
  app2.get("/api/students/:studentId/tests", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const testAssignments2 = await storage.getStudentTestAssignments(studentId);
      const attempts = await storage.getTestAttemptsByStudent(studentId);
      const testsWithStatus = testAssignments2.map((ta) => {
        const testAttempts2 = attempts.filter((a) => a.testId === ta.test.id);
        const hasAttempt = testAttempts2.length > 0;
        const latestAttempt = testAttempts2[0];
        return {
          ...ta,
          attemptStatus: hasAttempt ? latestAttempt.status : "not_started",
          latestAttempt: latestAttempt || null
        };
      });
      res.json(testsWithStatus);
    } catch (error) {
      console.error("Error fetching student tests:", error);
      res.status(500).json({ error: "Failed to fetch student tests" });
    }
  });
  app2.post("/api/tests/:testId/start", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const { studentId } = req.body;
      const existingAttempts = await storage.getTestAttemptsByStudent(studentId);
      const inProgressAttempt = existingAttempts.find((a) => a.testId === testId && a.status === "in_progress");
      if (inProgressAttempt) {
        return res.json(inProgressAttempt);
      }
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      const submittedAttempts = existingAttempts.filter((a) => a.testId === testId && a.status !== "in_progress");
      if (submittedAttempts.length > 0 && !test.allowRetakes) {
        return res.status(400).json({ error: "Retakes are not allowed for this test" });
      }
      const attempt = await storage.createTestAttempt({
        testId,
        studentId,
        status: "in_progress"
      });
      res.json(attempt);
    } catch (error) {
      console.error("Error starting test:", error);
      res.status(500).json({ error: "Failed to start test" });
    }
  });
  app2.post("/api/tests/attempts/:attemptId/answers", isAuthenticated, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { questionId, studentAnswer, selectedOption } = req.body;
      const existingAnswers = await storage.getTestAnswersByAttempt(attemptId);
      const existingAnswer = existingAnswers.find((a) => a.questionId === questionId);
      if (existingAnswer) {
        const updated = await storage.updateTestAnswer(existingAnswer.id, {
          studentAnswer,
          selectedOption
        });
        return res.json(updated);
      }
      const answer = await storage.createTestAnswer({
        attemptId,
        questionId,
        studentAnswer,
        selectedOption
      });
      res.json(answer);
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ error: "Failed to save answer" });
    }
  });
  app2.get("/api/tests/attempts/:attemptId/answers", isAuthenticated, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const answers = await storage.getTestAnswersByAttempt(attemptId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ error: "Failed to fetch answers" });
    }
  });
  app2.post("/api/tests/attempts/:attemptId/submit", isAuthenticated, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      const updatedAttempt = await storage.updateTestAttempt(attemptId, {
        status: "submitted",
        submittedAt: /* @__PURE__ */ new Date()
      });
      const { totalScore, percentageScore } = await storage.autoGradeTestAttempt(attemptId);
      const test = await storage.getTest(attempt.testId);
      res.json({
        ...updatedAttempt,
        autoGradedScore: totalScore,
        percentageScore,
        showResults: test?.showResultsImmediately || false
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ error: "Failed to submit test" });
    }
  });
  app2.get("/api/tests/:testId/attempts", isAuthenticated, async (req, res) => {
    try {
      const { testId } = req.params;
      const attempts = await storage.getTestAttemptsByTest(testId);
      const enrichedAttempts = await Promise.all(attempts.map(async (attempt) => {
        const student = await storage.getStudent(attempt.studentId);
        const studentUser = student ? await storage.getUser(student.userId) : null;
        return {
          ...attempt,
          studentName: studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : "Unknown"
        };
      }));
      res.json(enrichedAttempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });
  app2.post("/api/tests/attempts/:attemptId/grade", isAuthenticated, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { answerGrades, feedback } = req.body;
      const userId = req.user?.id;
      if (answerGrades && Array.isArray(answerGrades)) {
        for (const grade of answerGrades) {
          await storage.updateTestAnswer(grade.answerId, {
            pointsAwarded: grade.pointsAwarded,
            feedback: grade.feedback,
            isCorrect: grade.isCorrect,
            gradedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      const answers = await storage.getTestAnswersByAttempt(attemptId);
      const totalScore = answers.reduce((sum2, a) => sum2 + (a.pointsAwarded || 0), 0);
      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      const test = await storage.getTest(attempt.testId);
      const percentageScore = test?.totalPoints ? Math.round(totalScore / test.totalPoints * 100) : 0;
      const isPassed = test?.passingScore ? percentageScore >= test.passingScore : void 0;
      const gradedAttempt = await storage.updateTestAttempt(attemptId, {
        status: "graded",
        totalScore,
        percentageScore,
        isPassed,
        gradedBy: userId,
        gradedAt: /* @__PURE__ */ new Date(),
        feedback
      });
      res.json(gradedAttempt);
    } catch (error) {
      console.error("Error grading attempt:", error);
      res.status(500).json({ error: "Failed to grade attempt" });
    }
  });
  const { aiService: aiService2 } = await Promise.resolve().then(() => (init_ai(), ai_exports));
  app2.get("/api/ai/status", isAuthenticated, async (req, res) => {
    res.json({
      configured: aiService2.isConfigured(),
      message: aiService2.isConfigured() ? "AI features are enabled" : "AI features require a GEMINI_API_KEY to be configured"
    });
  });
  app2.post("/api/ai/generate-questions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user?.role)) {
        return res.status(403).json({ error: "Only tutors can generate questions" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(503).json({ error: "AI features are not configured. Please add GEMINI_API_KEY." });
      }
      const { subject, topic, gradeLevel, questionTypes, count: count2, difficulty } = req.body;
      if (!subject || !topic || !questionTypes || !count2 || !difficulty) {
        return res.status(400).json({ error: "Missing required fields: subject, topic, questionTypes, count, difficulty" });
      }
      const questions = await aiService2.generateQuestions({
        subject,
        topic,
        gradeLevel,
        questionTypes,
        count: Math.min(count2, 10),
        difficulty
      });
      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
  });
  app2.post("/api/ai/grading-suggestion", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user?.role)) {
        return res.status(403).json({ error: "Only tutors can get grading suggestions" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(503).json({ error: "AI features are not configured. Please add GEMINI_API_KEY." });
      }
      const { question, studentAnswer, correctAnswer, rubric, maxPoints } = req.body;
      if (!question || !studentAnswer || !maxPoints) {
        return res.status(400).json({ error: "Missing required fields: question, studentAnswer, maxPoints" });
      }
      const suggestion = await aiService2.getGradingSuggestion({
        question,
        studentAnswer,
        correctAnswer,
        rubric,
        maxPoints
      });
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting grading suggestion:", error);
      res.status(500).json({ error: error.message || "Failed to get grading suggestion" });
    }
  });
  app2.post("/api/ai/student-hint", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "student") {
        return res.status(403).json({ error: "Only students can request hints" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(503).json({ error: "AI features are not configured" });
      }
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      if (student.parentId) {
        const parent = await storage.getParent(student.parentId);
        if (parent && !parent.aiHintsEnabled) {
          return res.status(403).json({
            error: "AI hints have been disabled by your parent. Please contact them to enable this feature.",
            parentControlled: true
          });
        }
      }
      const { question, questionType, correctAnswer, helpText, studentAttempt, hintLevel } = req.body;
      if (!question || !questionType) {
        return res.status(400).json({ error: "Missing required fields: question, questionType" });
      }
      const hint = await aiService2.getStudentHint({
        question,
        questionType,
        correctAnswer,
        helpText,
        studentAttempt,
        hintLevel: hintLevel || 1
      });
      res.json({ hint });
    } catch (error) {
      console.error("Error getting student hint:", error);
      res.status(500).json({ error: error.message || "Failed to get hint" });
    }
  });
  app2.post("/api/ai/progress-insights", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "parent") {
        return res.status(403).json({ error: "Only parents can view progress insights" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(503).json({ error: "AI features are not configured. Please add GEMINI_API_KEY." });
      }
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ error: "Missing required field: studentId" });
      }
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: "Parent profile not found" });
      }
      const student = await storage.getStudent(studentId);
      if (!student || student.parentId !== parent.id) {
        return res.status(403).json({ error: "You do not have access to this student" });
      }
      const studentUser = await storage.getUser(student.userId);
      if (!studentUser) {
        return res.status(404).json({ error: "Student user not found" });
      }
      const submissions2 = await storage.getSubmissionsByStudent(studentId);
      const formattedSubmissions = await Promise.all(submissions2.map(async (s) => {
        const assignment = await storage.getAssignment(s.assignmentId);
        return {
          assignmentTitle: assignment?.title || "Unknown Assignment",
          subject: assignment?.subject || "Unknown",
          score: void 0,
          maxScore: void 0,
          submittedAt: s.submittedAt?.toISOString() || s.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          isLate: s.isLate || false
        };
      }));
      const testAttempts2 = await storage.getTestAttemptsByStudent(studentId);
      const formattedTests = await Promise.all(testAttempts2.filter((t) => t.status === "graded").map(async (t) => {
        const test = await storage.getTest(t.testId);
        return {
          testTitle: test?.title || "Unknown Test",
          subject: test?.subject || "Unknown",
          score: t.totalScore || 0,
          totalPoints: test?.totalPoints || 100,
          completedAt: t.completedAt?.toISOString() || t.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
        };
      }));
      const insights = await aiService2.generateProgressInsights({
        studentName: `${studentUser.firstName || ""} ${studentUser.lastName || ""}`.trim() || "Student",
        submissions: formattedSubmissions,
        testResults: formattedTests
      });
      res.json(insights);
    } catch (error) {
      console.error("Error generating progress insights:", error);
      res.status(500).json({ error: error.message || "Failed to generate insights" });
    }
  });
  app2.post("/api/ai/enhance-content", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["tutor", "company_admin", "admin"].includes(user?.role)) {
        return res.status(403).json({ error: "Only tutors can enhance content" });
      }
      if (!aiService2.isConfigured()) {
        return res.status(503).json({ error: "AI features are not configured. Please add GEMINI_API_KEY." });
      }
      const { content, contentType } = req.body;
      if (!content || !contentType) {
        return res.status(400).json({ error: "Missing required fields: content, contentType" });
      }
      if (!["question", "helpText", "instructions"].includes(contentType)) {
        return res.status(400).json({ error: "Invalid contentType. Must be: question, helpText, or instructions" });
      }
      const enhanced = await aiService2.enhanceContent(content, contentType);
      res.json({ enhanced });
    } catch (error) {
      console.error("Error enhancing content:", error);
      res.status(500).json({ error: error.message || "Failed to enhance content" });
    }
  });
  app2.get("/api/parents/settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "parent") {
        return res.status(403).json({ error: "Only parents can access settings" });
      }
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: "Parent profile not found" });
      }
      res.json({
        id: parent.id,
        userId: parent.userId,
        aiHintsEnabled: parent.aiHintsEnabled ?? true,
        maxHintsPerQuestion: parent.maxHintsPerQuestion ?? 3
      });
    } catch (error) {
      console.error("Error getting parent settings:", error);
      res.status(500).json({ error: error.message || "Failed to get settings" });
    }
  });
  app2.patch("/api/parents/settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "parent") {
        return res.status(403).json({ error: "Only parents can update settings" });
      }
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: "Parent profile not found" });
      }
      const { aiHintsEnabled, maxHintsPerQuestion } = req.body;
      const updated = await storage.updateParent(parent.id, {
        aiHintsEnabled: aiHintsEnabled !== void 0 ? aiHintsEnabled : parent.aiHintsEnabled,
        maxHintsPerQuestion: maxHintsPerQuestion !== void 0 ? maxHintsPerQuestion : parent.maxHintsPerQuestion
      });
      res.json({
        id: updated.id,
        userId: updated.userId,
        aiHintsEnabled: updated.aiHintsEnabled ?? true,
        maxHintsPerQuestion: updated.maxHintsPerQuestion ?? 3
      });
    } catch (error) {
      console.error("Error updating parent settings:", error);
      res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });
  app2.patch("/api/parents/ai-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "parent") {
        return res.status(403).json({ error: "Only parents can update AI settings" });
      }
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) {
        return res.status(404).json({ error: "Parent profile not found" });
      }
      const { aiHintsEnabled, maxHintsPerQuestion } = req.body;
      const updated = await storage.updateParent(parent.id, {
        aiHintsEnabled: aiHintsEnabled !== void 0 ? aiHintsEnabled : parent.aiHintsEnabled,
        maxHintsPerQuestion: maxHintsPerQuestion !== void 0 ? maxHintsPerQuestion : parent.maxHintsPerQuestion
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating AI settings:", error);
      res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });
  app2.get("/api/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      let prefs = await storage.getNotificationPreferences(user.id);
      if (!prefs) {
        prefs = await storage.createNotificationPreferences({
          userId: user.id
        });
      }
      res.json(prefs);
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      res.status(500).json({ error: error.message || "Failed to get notification preferences" });
    }
  });
  app2.patch("/api/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      let prefs = await storage.getNotificationPreferences(user.id);
      if (!prefs) {
        prefs = await storage.createNotificationPreferences({
          userId: user.id,
          ...req.body
        });
      } else {
        prefs = await storage.updateNotificationPreferences(user.id, req.body);
      }
      res.json(prefs);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: error.message || "Failed to update notification preferences" });
    }
  });
  app2.get("/api/reports/types", isAuthenticated, async (req, res) => {
    try {
      const reportTypes = [
        { id: "student_performance", name: "Student Performance", description: "Track student grades, progress, and academic achievements" },
        { id: "attendance_summary", name: "Attendance Summary", description: "Overview of student attendance rates and patterns" },
        { id: "class_utilization", name: "Class Utilization", description: "Class capacity usage and enrollment statistics" },
        { id: "assignment_completion", name: "Assignment Completion", description: "Assignment submission rates and completion status" },
        { id: "tutor_workload", name: "Tutor Workload", description: "Tutor class assignments and student load" },
        { id: "enrollment_trends", name: "Enrollment Trends", description: "Student enrollment patterns over time" }
      ];
      res.json(reportTypes);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to get report types" });
    }
  });
  app2.get("/api/reports/history/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user?.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (user?.role !== "admin") {
        return res.status(403).json({ error: "Only company admins can access reports" });
      }
      const reports = await storage.getReportRunsByCompany(companyId);
      res.json(reports);
    } catch (error) {
      console.error("Error getting report history:", error);
      res.status(500).json({ error: error.message || "Failed to get report history" });
    }
  });
  app2.post("/api/reports/run", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { companyId, reportType, name, parameters } = req.body;
      if (user?.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== companyId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (user?.role !== "admin") {
        return res.status(403).json({ error: "Only company admins can run reports" });
      }
      const reportRun = await storage.createReportRun({
        companyId,
        reportType,
        name: name || `${reportType} Report`,
        parameters: parameters || {},
        status: "processing",
        requestedBy: user.id,
        startedAt: /* @__PURE__ */ new Date()
      });
      let resultData = {};
      let rowCount = 0;
      try {
        switch (reportType) {
          case "student_performance":
            resultData = await generateStudentPerformanceReport(storage, companyId, parameters);
            break;
          case "attendance_summary":
            resultData = await generateAttendanceSummaryReport(storage, companyId, parameters);
            break;
          case "class_utilization":
            resultData = await generateClassUtilizationReport(storage, companyId, parameters);
            break;
          case "assignment_completion":
            resultData = await generateAssignmentCompletionReport(storage, companyId, parameters);
            break;
          case "tutor_workload":
            resultData = await generateTutorWorkloadReport(storage, companyId, parameters);
            break;
          case "enrollment_trends":
            resultData = await generateEnrollmentTrendsReport(storage, companyId, parameters);
            break;
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }
        rowCount = Array.isArray(resultData.data) ? resultData.data.length : 0;
        await storage.updateReportRun(reportRun.id, {
          status: "completed",
          resultData,
          rowCount,
          completedAt: /* @__PURE__ */ new Date()
        });
        res.json({ ...reportRun, status: "completed", resultData, rowCount });
      } catch (error) {
        await storage.updateReportRun(reportRun.id, {
          status: "failed",
          errorMessage: error.message,
          completedAt: /* @__PURE__ */ new Date()
        });
        throw error;
      }
    } catch (error) {
      console.error("Error running report:", error);
      res.status(500).json({ error: error.message || "Failed to run report" });
    }
  });
  app2.get("/api/reports/run/:reportRunId", isAuthenticated, async (req, res) => {
    try {
      const { reportRunId } = req.params;
      const user = req.user;
      const reportRun = await storage.getReportRun(reportRunId);
      if (!reportRun) {
        return res.status(404).json({ error: "Report not found" });
      }
      if (user?.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== reportRun.companyId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (user?.role !== "admin") {
        return res.status(403).json({ error: "Only company admins can access reports" });
      }
      res.json(reportRun);
    } catch (error) {
      console.error("Error getting report run:", error);
      res.status(500).json({ error: error.message || "Failed to get report" });
    }
  });
  app2.get("/api/reports/export/:reportRunId/csv", isAuthenticated, async (req, res) => {
    try {
      const { reportRunId } = req.params;
      const user = req.user;
      const reportRun = await storage.getReportRun(reportRunId);
      if (!reportRun) {
        return res.status(404).json({ error: "Report not found" });
      }
      if (user?.role === "company_admin") {
        const companyAdmin = await storage.getCompanyAdminByUserId(user.id);
        if (!companyAdmin || companyAdmin.companyId !== reportRun.companyId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (user?.role !== "admin") {
        return res.status(403).json({ error: "Only company admins can access reports" });
      }
      if (reportRun.status !== "completed" || !reportRun.resultData) {
        return res.status(400).json({ error: "Report data not available" });
      }
      const data = reportRun.resultData.data || [];
      if (data.length === 0) {
        return res.status(400).json({ error: "No data to export" });
      }
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map((row) => headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(","))
      ];
      const csvContent = csvRows.join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${reportRun.name.replace(/[^a-z0-9]/gi, "_")}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ error: error.message || "Failed to export report" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error("SMTP credentials not configured");
        return res.status(500).json({ error: "Email service not configured" });
      }
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const transporter = nodemailer2.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: "nirav@eslate.com.au",
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        text: `Name: ${name}
Email: ${email}

Message:
${message}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `
      };
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
  });
  app2.get("/api/admin/audit-logs", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "company_admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const limit = Math.min(parseInt(req.query.limit || "50"), 200);
      const offset = parseInt(req.query.offset || "0");
      if (user.role === "company_admin") {
        if (!user.companyId) {
          return res.status(403).json({ message: "Company admin must be associated with a company" });
        }
        const companyUserIds = await db.select({ id: users.id }).from(users).where(eq3(users.companyId, user.companyId));
        const userIds = companyUserIds.map((u) => u.id);
        const logs2 = await db.select().from(auditLogs).where(inArray2(auditLogs.userId, userIds)).orderBy(desc3(auditLogs.createdAt)).limit(limit).offset(offset);
        return res.json(logs2);
      }
      const logs = await db.select().from(auditLogs).orderBy(desc3(auditLogs.createdAt)).limit(limit).offset(offset);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.post("/api/students/:studentId/archive", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentId } = req.params;
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
      await db.update(students).set({ status: "archived", archivedAt: /* @__PURE__ */ new Date(), archivedBy: user.id, archivedByName: fullName }).where(eq3(students.id, studentId));
      const [updated] = await db.select().from(students).where(eq3(students.id, studentId));
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive student" });
    }
  });
  app2.post("/api/students/:studentId/reactivate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentId } = req.params;
      await db.update(students).set({ status: "active", archivedAt: null, archivedBy: null, archivedByName: null }).where(eq3(students.id, studentId));
      const [updated] = await db.select().from(students).where(eq3(students.id, studentId));
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to reactivate student" });
    }
  });
  app2.post("/api/tutors/:tutorId/deactivate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { tutorId } = req.params;
      const [tutor] = await db.select().from(tutors).where(eq3(tutors.id, tutorId));
      if (!tutor) return res.status(404).json({ message: "Tutor not found" });
      await db.update(tutors).set({ status: "inactive", deactivatedAt: /* @__PURE__ */ new Date(), deactivatedBy: user.id }).where(eq3(tutors.id, tutorId));
      await db.update(users).set({ isActive: false }).where(eq3(users.id, tutor.userId));
      res.json({ message: "Tutor deactivated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate tutor" });
    }
  });
  app2.post("/api/tutors/:tutorId/reactivate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { tutorId } = req.params;
      const [tutor] = await db.select().from(tutors).where(eq3(tutors.id, tutorId));
      if (!tutor) return res.status(404).json({ message: "Tutor not found" });
      await db.update(tutors).set({ status: "active", deactivatedAt: null, deactivatedBy: null }).where(eq3(tutors.id, tutorId));
      await db.update(users).set({ isActive: true }).where(eq3(users.id, tutor.userId));
      res.json({ message: "Tutor reactivated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reactivate tutor" });
    }
  });
  app2.get("/api/companies/:companyId/wwcc-alerts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { companyId } = req.params;
      const sixtyDaysFromNow = /* @__PURE__ */ new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      const expiringTutors = await db.select({
        tutorId: tutors.id,
        wwccNumber: tutors.wwccNumber,
        wwccExpiry: tutors.wwccExpiry,
        wwccState: tutors.wwccState,
        status: tutors.status,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }).from(tutors).innerJoin(users, eq3(tutors.userId, users.id)).where(
        and3(
          eq3(tutors.companyId, companyId),
          isNotNull(tutors.wwccExpiry),
          lte(tutors.wwccExpiry, sixtyDaysFromNow)
        )
      );
      const now = /* @__PURE__ */ new Date();
      const result = expiringTutors.map((t) => ({
        ...t,
        daysUntilExpiry: t.wwccExpiry ? Math.floor((t.wwccExpiry.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)) : null
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WWCC alerts" });
    }
  });
  app2.get("/api/me/tutor-profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const [tutor] = await db.select().from(tutors).where(eq3(tutors.userId, user.id));
      if (!tutor) return res.status(404).json({ message: "Tutor profile not found" });
      let company = null;
      if (tutor.companyId) {
        const [c] = await db.select().from(tutoringCompanies).where(eq3(tutoringCompanies.id, tutor.companyId));
        company = c || null;
      }
      res.json({
        id: tutor.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        bio: tutor.specialization,
        hourly_rate: null,
        qualifications: tutor.qualifications ? [tutor.qualifications] : [],
        delivery_modes: [],
        year_levels: [],
        wwcc_number: tutor.wwccNumber,
        wwcc_expiry: tutor.wwccExpiry,
        wwcc_state: tutor.wwccState,
        compliance_status: tutor.isVerified ? "compliant" : "pending_compliance",
        status: tutor.status,
        phoneNumber: tutor.phoneNumber,
        address: tutor.address,
        availability: tutor.availability,
        business: company ? { id: company.id, name: company.name, type: "multi_tutor", tier: "standard", state_code: "" } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor profile" });
    }
  });
  app2.patch("/api/me/tutor-profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const [tutor] = await db.select().from(tutors).where(eq3(tutors.userId, user.id));
      if (!tutor) return res.status(404).json({ message: "Tutor profile not found" });
      const { bio, phoneNumber, address, availability } = req.body;
      await db.update(tutors).set({
        specialization: bio ?? tutor.specialization,
        phoneNumber: phoneNumber ?? tutor.phoneNumber,
        address: address ?? tutor.address,
        availability: availability ?? tutor.availability,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(tutors.id, tutor.id));
      let company = null;
      if (tutor.companyId) {
        const [c] = await db.select().from(tutoringCompanies).where(eq3(tutoringCompanies.id, tutor.companyId));
        company = c || null;
      }
      const [updatedTutor] = await db.select().from(tutors).where(eq3(tutors.id, tutor.id));
      res.json({
        id: updatedTutor.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        bio: updatedTutor.specialization,
        hourly_rate: null,
        qualifications: updatedTutor.qualifications ? [updatedTutor.qualifications] : [],
        delivery_modes: [],
        year_levels: [],
        wwcc_number: updatedTutor.wwccNumber,
        wwcc_expiry: updatedTutor.wwccExpiry,
        wwcc_state: updatedTutor.wwccState,
        compliance_status: updatedTutor.isVerified ? "compliant" : "pending_compliance",
        status: updatedTutor.status,
        phoneNumber: updatedTutor.phoneNumber,
        address: updatedTutor.address,
        availability: updatedTutor.availability,
        business: company ? { id: company.id, name: company.name, type: "multi_tutor", tier: "standard", state_code: "" } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update tutor profile" });
    }
  });
  app2.patch("/api/tutors/:tutorId/contact", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { tutorId } = req.params;
      const { phoneNumber, address, wwccNumber, wwccExpiry, wwccState } = req.body;
      await db.update(tutors).set({
        phoneNumber: phoneNumber ?? void 0,
        address: address ?? void 0,
        wwccNumber: wwccNumber ?? void 0,
        wwccExpiry: wwccExpiry ? new Date(wwccExpiry) : void 0,
        wwccState: wwccState ?? void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(tutors.id, tutorId));
      const [updated] = await db.select().from(tutors).where(eq3(tutors.id, tutorId));
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tutor contact info" });
    }
  });
  app2.get("/api/students/:studentId/progress-reports", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { status } = req.query;
      const conditions = [eq3(studentProgressReports.studentId, studentId)];
      if (status) {
        conditions.push(eq3(studentProgressReports.status, status));
      }
      const reports = await db.select({
        id: studentProgressReports.id,
        studentId: studentProgressReports.studentId,
        companyId: studentProgressReports.companyId,
        termId: studentProgressReports.termId,
        subject: studentProgressReports.subject,
        grade: studentProgressReports.grade,
        overallComment: studentProgressReports.overallComment,
        strengths: studentProgressReports.strengths,
        areasForImprovement: studentProgressReports.areasForImprovement,
        attendancePercentage: studentProgressReports.attendancePercentage,
        status: studentProgressReports.status,
        sharedWithParentAt: studentProgressReports.sharedWithParentAt,
        createdBy: studentProgressReports.createdBy,
        createdByName: studentProgressReports.createdByName,
        createdAt: studentProgressReports.createdAt,
        updatedAt: studentProgressReports.updatedAt,
        termName: academicTerms.name
      }).from(studentProgressReports).leftJoin(academicTerms, eq3(studentProgressReports.termId, academicTerms.id)).where(and3(...conditions)).orderBy(desc3(studentProgressReports.createdAt));
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress reports" });
    }
  });
  app2.post("/api/students/:studentId/progress-reports", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentId } = req.params;
      const { subject, termId, grade, overallComment, strengths, areasForImprovement, status } = req.body;
      if (!subject) return res.status(400).json({ message: "Subject is required" });
      const [student] = await db.select().from(students).where(eq3(students.id, studentId));
      if (!student) return res.status(404).json({ message: "Student not found" });
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
      const newId = crypto.randomUUID();
      await db.insert(studentProgressReports).values({
        id: newId,
        studentId,
        companyId: student.companyId,
        termId: termId || null,
        subject,
        grade: grade || null,
        overallComment: overallComment || null,
        strengths: strengths || null,
        areasForImprovement: areasForImprovement || null,
        status: status || "draft",
        createdBy: user.id,
        createdByName: fullName
      });
      const [created] = await db.select().from(studentProgressReports).where(eq3(studentProgressReports.id, newId));
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create progress report" });
    }
  });
  app2.patch("/api/progress-reports/:reportId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { reportId } = req.params;
      const { subject, termId, grade, overallComment, strengths, areasForImprovement, attendancePercentage, status } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (subject !== void 0) updateData.subject = subject;
      if (termId !== void 0) updateData.termId = termId;
      if (grade !== void 0) updateData.grade = grade;
      if (overallComment !== void 0) updateData.overallComment = overallComment;
      if (strengths !== void 0) updateData.strengths = strengths;
      if (areasForImprovement !== void 0) updateData.areasForImprovement = areasForImprovement;
      if (attendancePercentage !== void 0) updateData.attendancePercentage = attendancePercentage;
      if (status !== void 0) {
        updateData.status = status;
        if (status === "shared_with_parent") {
          updateData.sharedWithParentAt = /* @__PURE__ */ new Date();
        }
      }
      await db.update(studentProgressReports).set(updateData).where(eq3(studentProgressReports.id, reportId));
      const [updated] = await db.select().from(studentProgressReports).where(eq3(studentProgressReports.id, reportId));
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress report" });
    }
  });
  app2.delete("/api/progress-reports/:reportId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { reportId } = req.params;
      await db.delete(studentProgressReports).where(eq3(studentProgressReports.id, reportId));
      res.json({ message: "Report deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete progress report" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const notifications = await db.select().from(inAppNotifications).where(eq3(inAppNotifications.userId, user.id)).orderBy(desc3(inAppNotifications.createdAt)).limit(50);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:notificationId/read", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { notificationId } = req.params;
      await db.update(inAppNotifications).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(and3(eq3(inAppNotifications.id, notificationId), eq3(inAppNotifications.userId, user.id)));
      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      await db.update(inAppNotifications).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(and3(eq3(inAppNotifications.userId, user.id), eq3(inAppNotifications.isRead, false)));
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  });
  app2.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const [row] = await db.select({ c: count() }).from(inAppNotifications).where(and3(eq3(inAppNotifications.userId, user.id), eq3(inAppNotifications.isRead, false)));
      res.json({ count: Number(row?.c ?? 0) });
    } catch {
      res.status(500).json({ count: 0 });
    }
  });
  app2.delete("/api/notifications/:notificationId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { notificationId } = req.params;
      await db.delete(inAppNotifications).where(and3(eq3(inAppNotifications.id, notificationId), eq3(inAppNotifications.userId, user.id)));
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  app2.delete("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      await db.delete(inAppNotifications).where(eq3(inAppNotifications.userId, user.id));
      res.json({ message: "Cleared" });
    } catch {
      res.status(500).json({ message: "Failed to clear notifications" });
    }
  });
  app2.get("/api/companies/:companyId/enrolment-summary", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const { term_id } = req.query;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      let termId = term_id;
      if (!termId) {
        const now = /* @__PURE__ */ new Date();
        const [currentTerm] = await db.select().from(academicTerms).where(and3(eq3(academicTerms.companyId, companyId), lte(academicTerms.startDate, now), gte2(academicTerms.endDate, now))).limit(1);
        termId = currentTerm?.id;
      }
      if (!termId) return res.json({ termId: null, metrics: {}, byClass: [], byCourse: [], byYearGroup: [] });
      const termClasses = await db.select().from(classes).where(and3(eq3(classes.companyId, companyId), eq3(classes.termId, termId), ne2(classes.status, "archived")));
      const classIds = termClasses.map((c) => c.id);
      let enrollments = [];
      if (classIds.length > 0) {
        enrollments = await db.select({ classId: studentClassAssignments.classId, studentId: studentClassAssignments.studentId }).from(studentClassAssignments).where(and3(inArray2(studentClassAssignments.classId, classIds), eq3(studentClassAssignments.isActive, true)));
      }
      const uniqueStudents = new Set(enrollments.map((e) => e.studentId));
      const totalEnrolments = enrollments.length;
      const totalAvailableSpots = termClasses.reduce((s, c) => c.maxStudents ? s + Math.max(0, c.maxStudents - enrollments.filter((e) => e.classId === c.id).length) : s, 0);
      let waitlistedCount = 0;
      if (classIds.length > 0) {
        const [wRow] = await db.select({ c: count() }).from(classWaitlist).where(and3(inArray2(classWaitlist.classId, classIds), eq3(classWaitlist.status, "waiting")));
        waitlistedCount = Number(wRow?.c ?? 0);
      }
      const attendanceMap = {};
      if (classIds.length > 0) {
        const sessRows = await db.select({ classId: classSessions.classId, enrolled: classSessions.enrolledCount, attended: classSessions.attendedCount }).from(classSessions).where(and3(inArray2(classSessions.classId, classIds), eq3(classSessions.status, "completed")));
        for (const c of termClasses) {
          const rows = sessRows.filter((r) => r.classId === c.id);
          const totalEnrolled = rows.reduce((s, r) => s + (r.enrolled ?? 0), 0);
          const totalAttended = rows.reduce((s, r) => s + (r.attended ?? 0), 0);
          attendanceMap[c.id] = totalEnrolled > 0 ? Math.round(totalAttended / totalEnrolled * 100) : 0;
        }
      }
      const tutorIds = [...new Set(termClasses.map((c) => c.tutorId).filter(Boolean))];
      let tutorNames = {};
      if (tutorIds.length > 0) {
        const tutorRows = await db.select({ id: tutors.id, userId: tutors.userId }).from(tutors).where(inArray2(tutors.id, tutorIds));
        const userIds = tutorRows.map((t) => t.userId);
        const userRows = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(inArray2(users.id, userIds));
        for (const t of tutorRows) {
          const u = userRows.find((u2) => u2.id === t.userId);
          if (u) tutorNames[t.id] = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
        }
      }
      const courseIds = [...new Set(termClasses.map((c) => c.courseId).filter(Boolean))];
      let courseNames = {};
      if (courseIds.length > 0) {
        const courseRows = await db.select({ id: courses.id, name: courses.name }).from(courses).where(inArray2(courses.id, courseIds));
        for (const c of courseRows) courseNames[c.id] = c.name;
      }
      const byClass = termClasses.map((c) => {
        const enrolled = enrollments.filter((e) => e.classId === c.id).length;
        return {
          id: c.id,
          name: c.name,
          courseId: c.courseId,
          courseName: c.courseId ? courseNames[c.courseId] : null,
          yearGroup: c.yearGroupCode,
          tutorName: c.tutorId ? tutorNames[c.tutorId] : null,
          enrolled,
          capacity: c.maxStudents,
          attendancePct: attendanceMap[c.id] ?? null
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
      const byCourse = {};
      for (const c of byClass) {
        const key = c.courseId ?? "__none__";
        if (!byCourse[key]) byCourse[key] = { courseId: c.courseId ?? "", courseName: c.courseName ?? "No course", classes: 0, students: 0 };
        byCourse[key].classes++;
        byCourse[key].students += c.enrolled;
      }
      const byYearGroup = {};
      for (const c of byClass) {
        const yg = c.yearGroup ?? "Unknown";
        byYearGroup[yg] = (byYearGroup[yg] ?? 0) + c.enrolled;
      }
      res.json({
        termId,
        metrics: { totalStudents: uniqueStudents.size, totalClasses: termClasses.length, totalEnrolments, availableSpots: totalAvailableSpots, waitlisted: waitlistedCount },
        byClass,
        byCourse: Object.values(byCourse).sort((a, b) => b.students - a.students),
        byYearGroup: Object.entries(byYearGroup).map(([yg, count2]) => ({ yearGroup: yg, count: count2 })).sort((a, b) => a.yearGroup.localeCompare(b.yearGroup))
      });
    } catch (err) {
      console.error("[ESLATE-32]", err);
      res.status(500).json({ message: "Failed to fetch enrolment summary" });
    }
  });
  app2.get("/api/companies/:companyId/terms", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const terms = await db.select().from(academicTerms).where(eq3(academicTerms.companyId, companyId)).orderBy(desc3(academicTerms.startDate));
      res.json(terms);
    } catch {
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });
  app2.get("/api/companies/:companyId/reports/revenue", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { term_id } = req.query;
      const whereClause = term_id ? and3(eq3(invoices.companyId, companyId), eq3(invoices.termId, term_id)) : eq3(invoices.companyId, companyId);
      const allInvoices = await db.select().from(invoices).where(whereClause).orderBy(desc3(invoices.invoiceDate));
      const allPayments = allInvoices.length > 0 ? await db.select().from(payments).where(inArray2(payments.invoiceId, allInvoices.map((i) => i.id))) : [];
      const paidByInvoice = {};
      for (const p of allPayments) {
        paidByInvoice[p.invoiceId] = (paidByInvoice[p.invoiceId] ?? 0) + parseFloat(p.amount);
      }
      const now = /* @__PURE__ */ new Date();
      let expectedRevenue = 0, invoicedRevenue = 0, collectedRevenue = 0, outstandingRevenue = 0, overdueRevenue = 0;
      for (const inv of allInvoices) {
        const total = parseFloat(inv.total);
        const paid = paidByInvoice[inv.id] ?? 0;
        if (inv.status !== "void") {
          expectedRevenue += total;
        }
        if (inv.status !== "draft" && inv.status !== "void") {
          invoicedRevenue += total;
        }
        collectedRevenue += paid;
        const outstanding = total - paid;
        if (["sent", "partially_paid", "overdue"].includes(inv.status) && outstanding > 0) {
          outstandingRevenue += outstanding;
        }
        if (inv.status === "overdue" && outstanding > 0) {
          overdueRevenue += outstanding;
        }
      }
      const lineItems = allInvoices.length > 0 ? await db.select({ invoiceId: invoiceLineItems.invoiceId, classId: invoiceLineItems.classId, total: invoiceLineItems.total }).from(invoiceLineItems).where(inArray2(invoiceLineItems.invoiceId, allInvoices.map((i) => i.id))) : [];
      const classIds2 = [...new Set(lineItems.map((l) => l.classId).filter(Boolean))];
      let classToCourseName = {};
      if (classIds2.length > 0) {
        const classRows = await db.select({ id: classes.id, courseId: classes.courseId }).from(classes).where(inArray2(classes.id, classIds2));
        const cIds = [...new Set(classRows.map((c) => c.courseId).filter(Boolean))];
        if (cIds.length > 0) {
          const cRows = await db.select({ id: courses.id, name: courses.name }).from(courses).where(inArray2(courses.id, cIds));
          for (const cl of classRows) {
            if (cl.courseId) {
              const c = cRows.find((r) => r.id === cl.courseId);
              if (c) classToCourseName[cl.id] = c.name;
            }
          }
        }
      }
      const byCourse = {};
      for (const li of lineItems) {
        const inv = allInvoices.find((i) => i.id === li.invoiceId);
        const courseName = li.classId ? classToCourseName[li.classId] ?? "No course" : "No course";
        if (!byCourse[courseName]) byCourse[courseName] = { courseName, expected: 0, collected: 0, outstanding: 0 };
        const liTotal = parseFloat(li.total);
        if (inv.status !== "void") byCourse[courseName].expected += liTotal;
        const invPaid = paidByInvoice[inv.id] ?? 0;
        const invTotal = parseFloat(inv.total);
        const payFrac = invTotal > 0 ? Math.min(1, invPaid / invTotal) : 0;
        byCourse[courseName].collected += liTotal * payFrac;
        byCourse[courseName].outstanding += liTotal * (1 - payFrac);
      }
      res.json({
        metrics: { expectedRevenue, invoicedRevenue, collectedRevenue, outstandingRevenue, overdueRevenue },
        byCourse: Object.values(byCourse).sort((a, b) => b.expected - a.expected),
        invoices: allInvoices.map((i) => ({
          ...i,
          amountPaid: paidByInvoice[i.id] ?? 0,
          outstanding: parseFloat(i.total) - (paidByInvoice[i.id] ?? 0)
        }))
      });
    } catch (err) {
      console.error("[ESLATE-33]", err);
      res.status(500).json({ message: "Failed to fetch revenue report" });
    }
  });
  function csvRow(values) {
    return values.map((v) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    }).join(",");
  }
  function formatDateAU(d) {
    if (!d) return "";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  }
  app2.get("/api/export/students", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Not found" });
      const allStudents = await storage.getStudentsByCompany(ca.companyId);
      const lines = ["Student ID,First Name,Last Name,Date of Birth,Year Group,School,Roll Number,Status,Date Added"];
      for (const s of allStudents) {
        const u = await storage.getUser(s.userId);
        lines.push(csvRow([s.id, u?.firstName, u?.lastName, formatDateAU(s.dateOfBirth), s.yearGroupCode, s.schoolName, s.rollNumber, s.status, formatDateAU(s.createdAt)]));
      }
      const today = /* @__PURE__ */ new Date();
      const dd = formatDateAU(today).replace(/\//g, "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="Students_${dd}.csv"`);
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).json({ message: "Export failed" });
    }
  });
  app2.get("/api/export/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Not found" });
      const allClasses = await storage.getClassesWithDetailsForCompany(ca.companyId);
      const lines = ["Class Name,Course,Year Group,Tutor,Capacity,Status"];
      for (const c of allClasses) {
        lines.push(csvRow([c.name, c.courseName, c.yearGroupCode, c.tutorName, c.maxStudents, c.status]));
      }
      const dd = formatDateAU(/* @__PURE__ */ new Date()).replace(/\//g, "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="Classes_${dd}.csv"`);
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).json({ message: "Export failed" });
    }
  });
  app2.get("/api/export/classes/:classId/students", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const enrolled = await db.select({ studentId: studentClassAssignments.studentId }).from(studentClassAssignments).where(and3(eq3(studentClassAssignments.classId, classId), eq3(studentClassAssignments.isActive, true)));
      const lines = ["Roll Number,First Name,Last Name,Year Group,School,Status"];
      for (const e of enrolled) {
        const s = await db.select().from(students).where(eq3(students.id, e.studentId)).limit(1);
        if (!s[0]) continue;
        const u = await storage.getUser(s[0].userId);
        lines.push(csvRow([s[0].rollNumber, u?.firstName, u?.lastName, s[0].yearGroupCode, s[0].schoolName, s[0].status]));
      }
      const dd = formatDateAU(/* @__PURE__ */ new Date()).replace(/\//g, "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="Class_Students_${dd}.csv"`);
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).json({ message: "Export failed" });
    }
  });
  app2.get("/api/export/attendance/:classId", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const sessions = await db.select().from(classSessions).where(eq3(classSessions.classId, classId)).orderBy(asc2(classSessions.sessionDate));
      const lines = ["Student Name,Roll Number,Session Date,Status"];
      for (const sess of sessions) {
        const attendanceRows = await db.select({ studentId: sessionAttendance.studentId, status: sessionAttendance.status }).from(sessionAttendance).where(eq3(sessionAttendance.sessionId, sess.id));
        for (const att of attendanceRows) {
          const s = await db.select().from(students).where(eq3(students.id, att.studentId)).limit(1);
          if (!s[0]) continue;
          const u = await storage.getUser(s[0].userId);
          lines.push(csvRow([`${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim(), s[0].rollNumber, formatDateAU(sess.sessionDate), att.status]));
        }
      }
      const dd = formatDateAU(/* @__PURE__ */ new Date()).replace(/\//g, "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="Attendance_${dd}.csv"`);
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).json({ message: "Export failed" });
    }
  });
  app2.get("/api/export/invoices", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca) return res.status(403).json({ message: "Not found" });
      const { term_id } = req.query;
      const whereClause = term_id ? and3(eq3(invoices.companyId, ca.companyId), eq3(invoices.termId, term_id)) : eq3(invoices.companyId, ca.companyId);
      const allInvoices = await db.select().from(invoices).where(whereClause).orderBy(desc3(invoices.invoiceDate));
      const allPayments = allInvoices.length > 0 ? await db.select().from(payments).where(inArray2(payments.invoiceId, allInvoices.map((i) => i.id))) : [];
      const paidMap = {};
      for (const p of allPayments) paidMap[p.invoiceId] = (paidMap[p.invoiceId] ?? 0) + parseFloat(p.amount);
      const lines = ["Invoice #,Student,Invoice Date,Due Date,Total,Paid,Outstanding,Status"];
      for (const inv of allInvoices) {
        const s = await db.select().from(students).where(eq3(students.id, inv.studentId)).limit(1);
        const u = s[0] ? await storage.getUser(s[0].userId) : null;
        const paid = paidMap[inv.id] ?? 0;
        lines.push(csvRow([inv.invoiceNumber, u ? `${u.firstName} ${u.lastName}` : inv.studentId, formatDateAU(inv.invoiceDate), formatDateAU(inv.dueDate), inv.total, paid.toFixed(2), (parseFloat(inv.total) - paid).toFixed(2), inv.status]));
      }
      const dd = formatDateAU(/* @__PURE__ */ new Date()).replace(/\//g, "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="Invoices_${dd}.csv"`);
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).json({ message: "Export failed" });
    }
  });
  async function getNextInvoiceNumber(companyId) {
    const [row] = await db.select({ max: max(invoices.invoiceNumber) }).from(invoices).where(eq3(invoices.companyId, companyId));
    const last = row?.max ? parseInt(String(row.max).replace("INV-", ""), 10) : 0;
    return `INV-${String((isNaN(last) ? 0 : last) + 1).padStart(4, "0")}`;
  }
  app2.get("/api/companies/:companyId/invoices", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { term_id, student_id, status } = req.query;
      let whereClause = eq3(invoices.companyId, companyId);
      const conditions = [eq3(invoices.companyId, companyId)];
      if (term_id) conditions.push(eq3(invoices.termId, term_id));
      if (student_id) conditions.push(eq3(invoices.studentId, student_id));
      if (status) conditions.push(eq3(invoices.status, status));
      whereClause = conditions.length > 1 ? and3(...conditions) : conditions[0];
      const rows = await db.select().from(invoices).where(whereClause).orderBy(desc3(invoices.createdAt));
      const allPayments = rows.length > 0 ? await db.select().from(payments).where(inArray2(payments.invoiceId, rows.map((i) => i.id))) : [];
      const paidMap = {};
      for (const p of allPayments) paidMap[p.invoiceId] = (paidMap[p.invoiceId] ?? 0) + parseFloat(p.amount);
      const result = await Promise.all(rows.map(async (inv) => {
        const s = await db.select().from(students).where(eq3(students.id, inv.studentId)).limit(1);
        const u = s[0] ? await storage.getUser(s[0].userId) : null;
        const paid = paidMap[inv.id] ?? 0;
        return { ...inv, studentName: u ? `${u.firstName} ${u.lastName}` : "", amountPaid: paid, outstanding: parseFloat(inv.total) - paid };
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/:invoiceId", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      if (!inv) return res.status(404).json({ message: "Invoice not found" });
      const lineItemRows = await db.select().from(invoiceLineItems).where(eq3(invoiceLineItems.invoiceId, invoiceId)).orderBy(asc2(invoiceLineItems.sortOrder));
      const paymentRows = await db.select().from(payments).where(eq3(payments.invoiceId, invoiceId)).orderBy(asc2(payments.paymentDate));
      const amountPaid = paymentRows.reduce((s2, p) => s2 + parseFloat(p.amount), 0);
      const s = await db.select().from(students).where(eq3(students.id, inv.studentId)).limit(1);
      const u = s[0] ? await storage.getUser(s[0].userId) : null;
      const contacts = s[0] ? await db.select().from(studentContacts).where(and3(eq3(studentContacts.studentId, s[0].id), eq3(studentContacts.isPrimary, true))).limit(1) : [];
      res.json({ ...inv, studentName: u ? `${u.firstName} ${u.lastName}` : "", studentRoll: s[0]?.rollNumber, parentContact: contacts[0] ?? null, lineItems: lineItemRows, payments: paymentRows, amountPaid, outstanding: parseFloat(inv.total) - amountPaid });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });
  app2.post("/api/companies/:companyId/invoices", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { studentId, termId, invoiceDate, dueDate, lineItems: lines, discountAmount, discountType, discountReason, notes } = req.body;
      if (!studentId) return res.status(400).json({ message: "studentId required" });
      const invoiceNumber = await getNextInvoiceNumber(companyId);
      const subtotal = (lines ?? []).reduce((s, l) => s + parseFloat(l.total || "0"), 0);
      const discount = parseFloat(discountAmount || "0");
      const total = Math.max(0, subtotal - discount);
      const ca = await storage.getCompanyAdminByUserId(user.id);
      const [newInvoice] = await db.insert(invoices).values({
        companyId,
        studentId,
        termId: termId || null,
        invoiceNumber,
        status: "draft",
        invoiceDate: invoiceDate ? new Date(invoiceDate) : /* @__PURE__ */ new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 864e5),
        subtotal: String(subtotal),
        discountAmount: String(discount),
        discountType: discountType || null,
        discountReason: discountReason || null,
        total: String(total),
        notes: notes || null,
        createdBy: user.id,
        createdByName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      });
      const insertedInvoice = await db.select().from(invoices).where(eq3(invoices.invoiceNumber, invoiceNumber)).limit(1);
      const invId = insertedInvoice[0]?.id;
      if (invId && lines?.length) {
        await db.insert(invoiceLineItems).values(lines.map((l, i) => ({
          invoiceId: invId,
          description: l.description,
          classId: l.classId || null,
          termId: l.termId || null,
          sessions: l.sessions ? Number(l.sessions) : null,
          unitPrice: String(l.unitPrice || "0"),
          total: String(l.total || "0"),
          isManual: !!l.isManual,
          sortOrder: i
        })));
      }
      res.json(insertedInvoice[0]);
    } catch (err) {
      console.error("[ESLATE-35]", err);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  app2.patch("/api/invoices/:invoiceId", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      if (!inv) return res.status(404).json({ message: "Not found" });
      if (inv.status !== "draft") return res.status(400).json({ message: "Cannot edit a sent invoice" });
      const { lineItems: lines, discountAmount, discountType, discountReason, notes, invoiceDate, dueDate } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (invoiceDate) updates.invoiceDate = new Date(invoiceDate);
      if (dueDate) updates.dueDate = new Date(dueDate);
      if (discountAmount !== void 0) updates.discountAmount = String(discountAmount);
      if (discountType !== void 0) updates.discountType = discountType;
      if (discountReason !== void 0) updates.discountReason = discountReason;
      if (notes !== void 0) updates.notes = notes;
      if (lines !== void 0) {
        const subtotal = lines.reduce((s, l) => s + parseFloat(l.total || "0"), 0);
        const discount = parseFloat(updates.discountAmount ?? inv.discountAmount ?? "0");
        updates.subtotal = String(subtotal);
        updates.total = String(Math.max(0, subtotal - discount));
        await db.delete(invoiceLineItems).where(eq3(invoiceLineItems.invoiceId, invoiceId));
        if (lines.length) {
          await db.insert(invoiceLineItems).values(lines.map((l, i) => ({
            invoiceId,
            description: l.description,
            classId: l.classId || null,
            termId: l.termId || null,
            sessions: l.sessions ? Number(l.sessions) : null,
            unitPrice: String(l.unitPrice || "0"),
            total: String(l.total || "0"),
            isManual: !!l.isManual,
            sortOrder: i
          })));
        }
      }
      await db.update(invoices).set(updates).where(eq3(invoices.id, invoiceId));
      const [updated] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  app2.post("/api/invoices/:invoiceId/send", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      if (!inv) return res.status(404).json({ message: "Not found" });
      const { recipientEmail, ccEmails } = req.body;
      const s = await db.select().from(students).where(eq3(students.id, inv.studentId)).limit(1);
      const u = s[0] ? await storage.getUser(s[0].userId) : null;
      const contacts = s[0] ? await db.select().from(studentContacts).where(and3(eq3(studentContacts.studentId, s[0].id), eq3(studentContacts.isPrimary, true))).limit(1) : [];
      const toEmail = recipientEmail || contacts[0]?.email;
      if (!toEmail) return res.status(400).json({ message: "No recipient email available" });
      const companyRow = await db.select().from(tutoringCompanies).where(eq3(tutoringCompanies.id, inv.companyId)).limit(1);
      const company = companyRow[0];
      const lineItemRows = await db.select().from(invoiceLineItems).where(eq3(invoiceLineItems.invoiceId, invoiceId));
      const itemsHtml = lineItemRows.map((l) => `<tr><td>${l.description}</td><td align="right">$${parseFloat(l.total).toFixed(2)}</td></tr>`).join("");
      const paymentInstructions = company?.paymentNotes ? `<p><strong>Payment Instructions:</strong><br>${company.paymentNotes}</p>` : company?.paymentBsb ? `<p><strong>Bank Transfer:</strong> BSB ${company.paymentBsb} \xB7 Account ${company.paymentAccount}<br>Reference: ${inv.invoiceNumber}</p>` : "";
      const html = `<h2>Invoice ${inv.invoiceNumber}</h2><p>Dear ${contacts[0]?.name || "Parent/Guardian"},</p><p>Please find your invoice details below for ${u ? `${u.firstName} ${u.lastName}` : "your child"}.</p><table border="1" cellpadding="6" style="border-collapse:collapse;width:100%"><tr><th>Description</th><th>Amount</th></tr>${itemsHtml}<tr><td><strong>Total Due</strong></td><td align="right"><strong>$${parseFloat(inv.total).toFixed(2)}</strong></td></tr></table><p><strong>Due Date:</strong> ${new Date(inv.dueDate).toLocaleDateString("en-AU")}</p>${paymentInstructions}<p>Thank you.</p>`;
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        const transporter = nodemailer2.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT || "587"), secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
        await transporter.sendMail({ from: process.env.EMAIL_FROM || "noreply@eslate.com", to: toEmail, cc: ccEmails?.join(","), subject: `Invoice ${inv.invoiceNumber} \u2014 ${company?.name ?? ""}`, html });
      }
      await db.update(invoices).set({ status: "sent", sentAt: /* @__PURE__ */ new Date(), sentToEmail: toEmail, sendStatus: "sent", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(invoices.id, invoiceId));
      res.json({ message: "Invoice sent", sentTo: toEmail });
    } catch (err) {
      console.error("[ESLATE-36]", err);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });
  app2.post("/api/invoices/:invoiceId/resend", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      if (!inv) return res.status(404).json({ message: "Not found" });
      if (!inv.sentToEmail && !req.body.recipientEmail) return res.status(400).json({ message: "No recipient email" });
      const toEmail = req.body.recipientEmail || inv.sentToEmail;
      const html = `<p>This is a resend of Invoice ${inv.invoiceNumber}. Total: $${parseFloat(inv.total).toFixed(2)}. Due: ${new Date(inv.dueDate).toLocaleDateString("en-AU")}.</p>`;
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        const transporter = nodemailer2.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT || "587"), secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
        await transporter.sendMail({ from: process.env.EMAIL_FROM || "noreply@eslate.com", to: toEmail, subject: `Resend: Invoice ${inv.invoiceNumber}`, html });
      }
      res.json({ message: "Resent", sentTo: toEmail });
    } catch (err) {
      res.status(500).json({ message: "Failed to resend invoice" });
    }
  });
  app2.post("/api/invoices/:invoiceId/payments", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invoiceId)).limit(1);
      if (!inv) return res.status(404).json({ message: "Not found" });
      if (inv.status === "void") return res.status(400).json({ message: "Cannot record payment on a voided invoice" });
      const { amount, paymentDate, method, reference, notes } = req.body;
      await db.insert(payments).values({ invoiceId, amount: String(amount), paymentDate: paymentDate ? new Date(paymentDate) : /* @__PURE__ */ new Date(), method: method || "bank_transfer", reference: reference || null, notes: notes || null, recordedBy: user.id, recordedByName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() });
      const allPayments = await db.select().from(payments).where(eq3(payments.invoiceId, invoiceId));
      const totalPaid = allPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
      const invoiceTotal = parseFloat(inv.total);
      let newStatus = totalPaid >= invoiceTotal ? "paid" : totalPaid > 0 ? "partially_paid" : "sent";
      await db.update(invoices).set({ status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(invoices.id, invoiceId));
      res.json({ message: "Payment recorded", status: newStatus, totalPaid });
    } catch (err) {
      res.status(500).json({ message: "Failed to record payment" });
    }
  });
  app2.patch("/api/invoices/:invoiceId/void", isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { voidReason } = req.body;
      await db.update(invoices).set({ status: "void", voidedAt: /* @__PURE__ */ new Date(), voidReason: voidReason || "Other", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(invoices.id, invoiceId));
      res.json({ message: "Invoice voided" });
    } catch (err) {
      res.status(500).json({ message: "Failed to void invoice" });
    }
  });
  app2.get("/api/students/:studentId/invoices", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const rows = await db.select().from(invoices).where(eq3(invoices.studentId, studentId)).orderBy(desc3(invoices.invoiceDate));
      const allPayments = rows.length > 0 ? await db.select().from(payments).where(inArray2(payments.invoiceId, rows.map((i) => i.id))) : [];
      const paidMap = {};
      for (const p of allPayments) paidMap[p.invoiceId] = (paidMap[p.invoiceId] ?? 0) + parseFloat(p.amount);
      res.json(rows.map((inv) => ({ ...inv, amountPaid: paidMap[inv.id] ?? 0, outstanding: parseFloat(inv.total) - (paidMap[inv.id] ?? 0) })));
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch student invoices" });
    }
  });
  app2.post("/api/companies/:companyId/invoices/bulk", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { termId, studentIds, invoiceDate, dueDate, discountAmount, discountType, skipExisting } = req.body;
      if (!termId || !Array.isArray(studentIds) || studentIds.length === 0) return res.status(400).json({ message: "termId and studentIds required" });
      const bulkRunId = randomUUID2();
      const results = [];
      for (const sId of studentIds) {
        const existing2 = await db.select().from(invoices).where(and3(eq3(invoices.companyId, companyId), eq3(invoices.studentId, sId), eq3(invoices.termId, termId))).limit(1);
        if (existing2.length > 0 && skipExisting !== false) {
          results.push({ studentId: sId, invoiceNumber: "", status: "skipped", reason: "already invoiced" });
          continue;
        }
        const classEnrollments = await db.select({ classId: studentClassAssignments.classId }).from(studentClassAssignments).innerJoin(classes, eq3(classes.id, studentClassAssignments.classId)).where(and3(eq3(studentClassAssignments.studentId, sId), eq3(studentClassAssignments.isActive, true), eq3(classes.termId, termId)));
        const lineItems2 = [];
        for (const ce of classEnrollments) {
          const [cl] = await db.select().from(classes).where(eq3(classes.id, ce.classId)).limit(1);
          if (!cl) continue;
          const fee = parseFloat(cl.feePerSession || cl.feePerTerm || "0");
          lineItems2.push({ invoiceId: "", description: cl.name, classId: cl.id, termId, sessions: null, unitPrice: String(fee), total: String(fee), isManual: false });
        }
        const subtotal = lineItems2.reduce((s, l) => s + parseFloat(l.total), 0);
        const discount = parseFloat(discountAmount || "0");
        const total = Math.max(0, subtotal - discount);
        const invNumber = await getNextInvoiceNumber(companyId);
        await db.insert(invoices).values({ companyId, studentId: sId, termId, invoiceNumber: invNumber, status: "draft", invoiceDate: invoiceDate ? new Date(invoiceDate) : /* @__PURE__ */ new Date(), dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 864e5), subtotal: String(subtotal), discountAmount: String(discount), discountType: discountType || null, total: String(total), createdBy: user.id, createdByName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(), bulkRunId });
        const [inserted] = await db.select().from(invoices).where(eq3(invoices.invoiceNumber, invNumber)).limit(1);
        if (inserted && lineItems2.length > 0) {
          await db.insert(invoiceLineItems).values(lineItems2.map((l, i) => ({ ...l, invoiceId: inserted.id, sortOrder: i })));
        }
        results.push({ studentId: sId, invoiceNumber: invNumber, status: "created" });
      }
      const created = results.filter((r) => r.status === "created").length;
      const ca = await storage.getCompanyAdminByUserId(user.id);
      await db.insert(inAppNotifications).values({ userId: user.id, companyId, type: "bulk_invoice_complete", title: "Bulk Invoice Generation Complete", message: `${created} invoices generated for term. ${results.filter((r) => r.status === "skipped").length} skipped.`, data: { bulkRunId, created, total: studentIds.length } });
      res.json({ bulkRunId, created, skipped: results.filter((r) => r.status === "skipped").length, results });
    } catch (err) {
      console.error("[ESLATE-38]", err);
      res.status(500).json({ message: "Failed to bulk generate invoices" });
    }
  });
  app2.post("/api/companies/:companyId/invoices/bulk-send", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { invoiceIds } = req.body;
      if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) return res.status(400).json({ message: "invoiceIds required" });
      let sent = 0, failed = 0;
      for (const invId of invoiceIds) {
        try {
          const [inv] = await db.select().from(invoices).where(eq3(invoices.id, invId)).limit(1);
          if (!inv || inv.status !== "draft") {
            failed++;
            continue;
          }
          const s = await db.select().from(students).where(eq3(students.id, inv.studentId)).limit(1);
          const contacts = s[0] ? await db.select().from(studentContacts).where(and3(eq3(studentContacts.studentId, s[0].id), eq3(studentContacts.isPrimary, true))).limit(1) : [];
          const toEmail = contacts[0]?.email;
          if (!toEmail) {
            failed++;
            continue;
          }
          if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
            const transporter = nodemailer2.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT || "587"), secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
            const html = `<h2>Invoice ${inv.invoiceNumber}</h2><p>Total: $${parseFloat(inv.total).toFixed(2)}</p><p>Due: ${new Date(inv.dueDate).toLocaleDateString("en-AU")}</p>`;
            await transporter.sendMail({ from: process.env.EMAIL_FROM || "noreply@eslate.com", to: toEmail, subject: `Invoice ${inv.invoiceNumber}`, html });
          }
          await db.update(invoices).set({ status: "sent", sentAt: /* @__PURE__ */ new Date(), sentToEmail: toEmail, sendStatus: "sent", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(invoices.id, invId));
          sent++;
        } catch {
          failed++;
        }
      }
      res.json({ sent, failed, total: invoiceIds.length });
    } catch (err) {
      res.status(500).json({ message: "Bulk send failed" });
    }
  });
  app2.patch("/api/classes/:classId/fee", isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.params;
      const user = req.user;
      if (user.role !== "company_admin" && user.role !== "admin") return res.status(403).json({ message: "Access denied" });
      const { feePerSession, feePerTerm } = req.body;
      await db.update(classes).set({ feePerSession: feePerSession != null ? String(feePerSession) : null, feePerTerm: feePerTerm != null ? String(feePerTerm) : null, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(classes.id, classId));
      res.json({ message: "Fee updated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update fee" });
    }
  });
  app2.get("/api/companies/:companyId/assignment-library", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      const { status, subject, yearGroup, search } = req.query;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const conditions = [eq3(assignmentLibraryItems.companyId, companyId)];
      if (status) conditions.push(eq3(assignmentLibraryItems.libStatus, status));
      if (search) conditions.push(like(assignmentLibraryItems.title, `%${search}%`));
      const items = await db.select().from(assignmentLibraryItems).where(and3(...conditions)).orderBy(desc3(assignmentLibraryItems.createdAt));
      const ids = items.map((i) => i.id);
      const qCounts = ids.length > 0 ? await db.select({ libraryItemId: assignmentLibraryQuestions.libraryItemId, cnt: count(assignmentLibraryQuestions.id) }).from(assignmentLibraryQuestions).where(inArray2(assignmentLibraryQuestions.libraryItemId, ids)).groupBy(assignmentLibraryQuestions.libraryItemId) : [];
      const countMap = {};
      for (const r of qCounts) countMap[r.libraryItemId] = r.cnt;
      let result = items.map((i) => ({ ...i, questionCount: countMap[i.id] ?? 0 }));
      if (subject) result = result.filter((i) => i.subjects?.includes(subject));
      if (yearGroup) result = result.filter((i) => i.yearGroups?.includes(yearGroup));
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch library items" });
    }
  });
  app2.post("/api/assignment-library", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const { companyId, title, description, instructions, subjects, yearGroups, estimatedDuration, maxMarks, fileUrl, fileType, pageCount, questions } = req.body;
      if (!companyId || !title) return res.status(400).json({ message: "companyId and title are required" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      }
      const itemId = crypto.randomUUID();
      await db.insert(assignmentLibraryItems).values({
        id: itemId,
        companyId,
        title,
        description,
        instructions,
        subjects: subjects ?? [],
        yearGroups: yearGroups ?? [],
        estimatedDuration,
        maxMarks,
        fileUrl,
        fileType,
        pageCount,
        libStatus: "draft",
        createdBy: user.id,
        lastUpdatedBy: user.id
      });
      if (Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await db.insert(assignmentLibraryQuestions).values({
            libraryItemId: itemId,
            questionNumber: i + 1,
            questionText: q.questionText,
            questionType: q.questionType ?? "subjective",
            answerKey: q.answerKey,
            maxMarks: q.maxMarks ?? 1,
            options: q.options ?? []
          });
        }
      }
      const [created] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, itemId)).limit(1);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ message: "Failed to create library item" });
    }
  });
  app2.get("/api/assignment-library/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "student") {
        const st = await storage.getStudentByUserId(user.id);
        if (!st) return res.status(403).json({ message: "Access denied" });
        const allocs = await db.select().from(assignmentAllocations).where(and3(eq3(assignmentAllocations.libraryItemId, id), eq3(assignmentAllocations.studentId, st.id))).limit(1);
        if (allocs.length === 0) return res.status(403).json({ message: "Access denied" });
      } else if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const questions = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, id)).orderBy(asc2(assignmentLibraryQuestions.questionNumber));
      const questionIds = questions.map((q) => q.id);
      const rubrics = questionIds.length > 0 ? await db.select().from(assignmentLibraryRubrics).where(inArray2(assignmentLibraryRubrics.questionId, questionIds)).orderBy(asc2(assignmentLibraryRubrics.sortOrder)) : [];
      const rubricsByQuestion = {};
      for (const r of rubrics) {
        if (!rubricsByQuestion[r.questionId]) rubricsByQuestion[r.questionId] = [];
        rubricsByQuestion[r.questionId].push(r);
      }
      res.json({ ...item, questions: questions.map((q) => ({ ...q, rubrics: rubricsByQuestion[q.id] ?? [] })) });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch library item" });
    }
  });
  app2.patch("/api/assignment-library/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const warning = item.libStatus === "published" ? "Item is published \u2013 changes will affect future allocations" : void 0;
      const { title, description, instructions, subjects, yearGroups, estimatedDuration, maxMarks, fileUrl, fileType, pageCount } = req.body;
      await db.update(assignmentLibraryItems).set({
        ...title !== void 0 && { title },
        ...description !== void 0 && { description },
        ...instructions !== void 0 && { instructions },
        ...subjects !== void 0 && { subjects },
        ...yearGroups !== void 0 && { yearGroups },
        ...estimatedDuration !== void 0 && { estimatedDuration },
        ...maxMarks !== void 0 && { maxMarks },
        ...fileUrl !== void 0 && { fileUrl },
        ...fileType !== void 0 && { fileType },
        ...pageCount !== void 0 && { pageCount },
        lastUpdatedBy: user.id,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(assignmentLibraryItems.id, id));
      const [updated] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      res.json({ ...updated, warning });
    } catch (err) {
      res.status(500).json({ message: "Failed to update library item" });
    }
  });
  app2.post("/api/assignment-library/:id/publish", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      if (item.libStatus !== "draft") return res.status(400).json({ message: "Only draft items can be published" });
      if (!item.title) return res.status(400).json({ message: "Title is required to publish" });
      const [qCount] = await db.select({ cnt: count(assignmentLibraryQuestions.id) }).from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, id));
      if ((qCount?.cnt ?? 0) < 1) return res.status(400).json({ message: "At least one question is required to publish" });
      await db.update(assignmentLibraryItems).set({ libStatus: "published", lastUpdatedBy: user.id, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentLibraryItems.id, id));
      res.json({ message: "Library item published" });
    } catch (err) {
      res.status(500).json({ message: "Failed to publish library item" });
    }
  });
  app2.post("/api/assignment-library/:id/archive", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      await db.update(assignmentLibraryItems).set({ libStatus: "archived", lastUpdatedBy: user.id, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentLibraryItems.id, id));
      res.json({ message: "Library item archived" });
    } catch (err) {
      res.status(500).json({ message: "Failed to archive library item" });
    }
  });
  app2.post("/api/assignment-library/:id/questions", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { questionText, questionType, answerKey, maxMarks, options, regionCoords } = req.body;
      if (!questionText) return res.status(400).json({ message: "questionText is required" });
      const [maxQ] = await db.select({ maxNum: max(assignmentLibraryQuestions.questionNumber) }).from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, id));
      const nextNum = (maxQ?.maxNum ?? 0) + 1;
      const questionId = crypto.randomUUID();
      await db.insert(assignmentLibraryQuestions).values({
        id: questionId,
        libraryItemId: id,
        questionNumber: nextNum,
        questionText,
        questionType: questionType ?? "subjective",
        answerKey,
        maxMarks: maxMarks ?? 1,
        options: options ?? [],
        regionCoords
      });
      const [question] = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId)).limit(1);
      res.status(201).json(question);
    } catch (err) {
      res.status(500).json({ message: "Failed to add question" });
    }
  });
  app2.patch("/api/assignment-library/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const { questionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [question] = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId)).limit(1);
      if (!question) return res.status(404).json({ message: "Question not found" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, question.libraryItemId)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { questionText, questionType, answerKey, maxMarks, options, regionCoords, questionNumber } = req.body;
      await db.update(assignmentLibraryQuestions).set({
        ...questionText !== void 0 && { questionText },
        ...questionType !== void 0 && { questionType },
        ...answerKey !== void 0 && { answerKey },
        ...maxMarks !== void 0 && { maxMarks },
        ...options !== void 0 && { options },
        ...regionCoords !== void 0 && { regionCoords },
        ...questionNumber !== void 0 && { questionNumber }
      }).where(eq3(assignmentLibraryQuestions.id, questionId));
      const [updated] = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId)).limit(1);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update question" });
    }
  });
  app2.delete("/api/assignment-library/questions/:questionId", isAuthenticated, async (req, res) => {
    try {
      const { questionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [question] = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId)).limit(1);
      if (!question) return res.status(404).json({ message: "Question not found" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, question.libraryItemId)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      await db.delete(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId));
      res.json({ message: "Question deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete question" });
    }
  });
  app2.post("/api/assignment-library/questions/:questionId/rubric", isAuthenticated, async (req, res) => {
    try {
      const { questionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [question] = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.id, questionId)).limit(1);
      if (!question) return res.status(404).json({ message: "Question not found" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, question.libraryItemId)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { criteria } = req.body;
      if (!Array.isArray(criteria)) return res.status(400).json({ message: "criteria must be an array" });
      await db.delete(assignmentLibraryRubrics).where(eq3(assignmentLibraryRubrics.questionId, questionId));
      const inserted = [];
      for (let i = 0; i < criteria.length; i++) {
        const c = criteria[i];
        const rubricId = crypto.randomUUID();
        await db.insert(assignmentLibraryRubrics).values({
          id: rubricId,
          questionId,
          criterion: c.criterion,
          descriptor: c.descriptor,
          maxMarks: c.maxMarks ?? 1,
          sortOrder: i
        });
        inserted.push(rubricId);
      }
      const rubrics = await db.select().from(assignmentLibraryRubrics).where(eq3(assignmentLibraryRubrics.questionId, questionId)).orderBy(asc2(assignmentLibraryRubrics.sortOrder));
      res.status(201).json(rubrics);
    } catch (err) {
      res.status(500).json({ message: "Failed to save rubric" });
    }
  });
  app2.post("/api/assignment-library/:id/allocate", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [item] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, id)).limit(1);
      if (!item) return res.status(404).json({ message: "Library item not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== item.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { targetType, classId, studentIds, termId, dueAt, releaseAt, allowResubmission, studentNote } = req.body;
      if (!targetType || !dueAt) return res.status(400).json({ message: "targetType and dueAt are required" });
      let targetStudentIds = [];
      if (targetType === "class") {
        if (!classId) return res.status(400).json({ message: "classId is required for class allocations" });
        const enrolled = await db.select().from(studentClassAssignments).where(eq3(studentClassAssignments.classId, classId));
        targetStudentIds = enrolled.map((e) => e.studentId);
      } else if (targetType === "students") {
        if (!Array.isArray(studentIds) || studentIds.length === 0) return res.status(400).json({ message: "studentIds is required" });
        targetStudentIds = studentIds;
      } else {
        return res.status(400).json({ message: "targetType must be class or students" });
      }
      const now = /* @__PURE__ */ new Date();
      const releaseDate = releaseAt ? new Date(releaseAt) : null;
      const allocStatus = releaseDate && releaseDate > now ? "scheduled" : "assigned";
      let allocated = 0;
      const allocatedStudentIds = [];
      for (const studentId of targetStudentIds) {
        const [student] = await db.select().from(students).where(eq3(students.id, studentId)).limit(1);
        if (!student) continue;
        await db.insert(assignmentAllocations).values({
          libraryItemId: id,
          studentId,
          classId: classId ?? null,
          termId: termId ?? null,
          companyId: item.companyId,
          dueAt: new Date(dueAt),
          releaseAt: releaseDate,
          allowResubmission: allowResubmission ?? false,
          allocStatus,
          studentNote: studentNote ?? null,
          currentAttempt: 1,
          createdBy: user.id
        });
        await db.insert(inAppNotifications).values({
          userId: student.userId,
          companyId: item.companyId,
          type: "assignment_notification",
          title: "New Assignment",
          message: `You have a new assignment: ${item.title}. Due: ${new Date(dueAt).toLocaleDateString("en-AU")}`,
          data: { libraryItemId: id, dueAt }
        });
        allocated++;
        allocatedStudentIds.push(studentId);
      }
      res.status(201).json({ allocated, studentIds: allocatedStudentIds });
    } catch (err) {
      res.status(500).json({ message: "Failed to allocate assignment" });
    }
  });
  app2.get("/api/allocations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, id)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "student") {
        const st = await storage.getStudentByUserId(user.id);
        if (!st || st.id !== alloc.studentId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) return res.status(403).json({ message: "Access denied" });
        const [st] = await db.select().from(students).where(and3(eq3(students.id, alloc.studentId), eq3(students.parentId, parent.id))).limit(1);
        if (!st) return res.status(403).json({ message: "Access denied" });
      }
      const [libItem] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      res.json({ ...alloc, libraryItem: libItem });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch allocation" });
    }
  });
  app2.patch("/api/allocations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, id)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { dueAt, releaseAt, studentNote, allowResubmission } = req.body;
      await db.update(assignmentAllocations).set({
        ...dueAt !== void 0 && { dueAt: new Date(dueAt) },
        ...releaseAt !== void 0 && { releaseAt: new Date(releaseAt) },
        ...studentNote !== void 0 && { studentNote },
        ...allowResubmission !== void 0 && { allowResubmission },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(assignmentAllocations.id, id));
      if (dueAt) {
        const [student] = await db.select().from(students).where(eq3(students.id, alloc.studentId)).limit(1);
        if (student) {
          const [libItem] = await db.select({ title: assignmentLibraryItems.title }).from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
          await db.insert(inAppNotifications).values({
            userId: student.userId,
            companyId: alloc.companyId,
            type: "assignment_notification",
            title: "Assignment Due Date Updated",
            message: `Due date for "${libItem?.title}" updated to ${new Date(dueAt).toLocaleDateString("en-AU")}`,
            data: { allocationId: id }
          });
        }
      }
      res.json({ message: "Allocation updated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update allocation" });
    }
  });
  app2.delete("/api/allocations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, id)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      if (!["scheduled", "assigned"].includes(alloc.allocStatus)) {
        return res.status(400).json({ message: "Cannot revoke allocation in current status: " + alloc.allocStatus });
      }
      await db.update(assignmentAllocations).set({ allocStatus: "revoked", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, id));
      res.json({ message: "Allocation revoked" });
    } catch (err) {
      res.status(500).json({ message: "Failed to revoke allocation" });
    }
  });
  app2.get("/api/me/library-assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "student") return res.status(403).json({ message: "Access denied" });
      const st = await storage.getStudentByUserId(user.id);
      if (!st) return res.status(404).json({ message: "Student profile not found" });
      const now = /* @__PURE__ */ new Date();
      const allocs = await db.select().from(assignmentAllocations).where(and3(
        eq3(assignmentAllocations.studentId, st.id),
        or2(isNull2(assignmentAllocations.releaseAt), lte(assignmentAllocations.releaseAt, now)),
        ne2(assignmentAllocations.allocStatus, "revoked")
      )).orderBy(asc2(assignmentAllocations.dueAt));
      const libItemIds = [...new Set(allocs.map((a) => a.libraryItemId))];
      const libItems = libItemIds.length > 0 ? await db.select({ id: assignmentLibraryItems.id, title: assignmentLibraryItems.title, subjects: assignmentLibraryItems.subjects }).from(assignmentLibraryItems).where(inArray2(assignmentLibraryItems.id, libItemIds)) : [];
      const libMap = {};
      for (const li of libItems) libMap[li.id] = li;
      const result = allocs.map((a) => {
        const lib = libMap[a.libraryItemId] ?? null;
        const isOverdue = a.dueAt < now && !["returned", "submitted", "auto_marked", "under_review", "revoked"].includes(a.allocStatus);
        const status = isOverdue ? "overdue" : a.allocStatus;
        return {
          id: a.id,
          assignmentTitle: lib?.title ?? "",
          subjects: lib?.subjects ?? [],
          dueDate: a.dueAt?.toISOString() ?? null,
          status,
          isLate: isOverdue,
          score: null,
          maxMarks: lib?.maxMarks ?? null,
          feedback: null
        };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/me/library-assignments/:allocationId", isAuthenticated, async (req, res) => {
    try {
      const { allocationId } = req.params;
      const user = req.user;
      if (user.role !== "student") return res.status(403).json({ message: "Access denied" });
      const st = await storage.getStudentByUserId(user.id);
      if (!st) return res.status(404).json({ message: "Student profile not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(and3(eq3(assignmentAllocations.id, allocationId), eq3(assignmentAllocations.studentId, st.id))).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      const now = /* @__PURE__ */ new Date();
      if (alloc.releaseAt && alloc.releaseAt > now) return res.status(403).json({ message: "Assignment not yet released" });
      const [libItem] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      const questions = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, alloc.libraryItemId)).orderBy(asc2(assignmentLibraryQuestions.questionNumber));
      const subs = await db.select().from(assignmentSubmissions).where(and3(eq3(assignmentSubmissions.allocationId, allocationId), eq3(assignmentSubmissions.studentId, st.id))).orderBy(desc3(assignmentSubmissions.attemptNo)).limit(1);
      const latestSub = subs[0] ?? null;
      const marks = latestSub ? await db.select().from(submissionMarks).where(eq3(submissionMarks.submissionId, latestSub.id)) : [];
      const transcriptions = latestSub ? await db.select().from(submissionTranscriptions).where(eq3(submissionTranscriptions.submissionId, latestSub.id)) : [];
      const now2 = /* @__PURE__ */ new Date();
      const isOverdue = alloc.dueAt < now2 && !["returned", "submitted", "auto_marked", "under_review", "revoked"].includes(alloc.allocStatus);
      const enteredAnswers = typeof latestSub?.enteredAnswers === "object" && latestSub?.enteredAnswers ? latestSub.enteredAnswers : {};
      const marksMap = {};
      for (const m of marks) {
        if (m.questionId) marksMap[m.questionId] = m;
      }
      const ocrMap = {};
      for (const t of transcriptions) {
        if (t.questionId) ocrMap[t.questionId] = t;
      }
      const shapedQuestions = questions.map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        maxMarks: q.maxMarks,
        answer: enteredAnswers[q.id] ?? null,
        score: marksMap[q.id]?.finalScore ?? marksMap[q.id]?.provisionalScore ?? null,
        tutorComment: marksMap[q.id]?.tutorComments ?? null,
        isHandwritten: false
      }));
      const totalScore = alloc.allocStatus === "returned" && marks.length > 0 ? marks.reduce((s, m) => s + (m.finalScore ?? m.provisionalScore ?? 0), 0) : null;
      res.json({
        id: alloc.id,
        assignmentTitle: libItem?.title ?? "",
        instructions: libItem?.instructions ?? null,
        status: isOverdue ? "overdue" : alloc.allocStatus,
        dueDate: alloc.dueAt?.toISOString() ?? null,
        isLate: isOverdue,
        totalScore,
        maxMarks: libItem?.maxMarks ?? null,
        overallFeedback: latestSub?.tutorFeedback ?? null,
        questions: shapedQuestions
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch assignment detail" });
    }
  });
  app2.patch("/api/me/library-assignments/:allocationId/draft", isAuthenticated, async (req, res) => {
    try {
      const { allocationId } = req.params;
      const user = req.user;
      if (user.role !== "student") return res.status(403).json({ message: "Access denied" });
      const st = await storage.getStudentByUserId(user.id);
      if (!st) return res.status(404).json({ message: "Student profile not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(and3(eq3(assignmentAllocations.id, allocationId), eq3(assignmentAllocations.studentId, st.id))).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (["submitted", "auto_marked", "under_review", "returned", "revoked"].includes(alloc.allocStatus)) {
        return res.status(400).json({ message: "Cannot save draft for this allocation status" });
      }
      const { inkData, enteredAnswers } = req.body;
      const existing = await db.select().from(assignmentSubmissions).where(and3(eq3(assignmentSubmissions.allocationId, allocationId), eq3(assignmentSubmissions.studentId, st.id), eq3(assignmentSubmissions.attemptNo, alloc.currentAttempt), isNull2(assignmentSubmissions.submittedAt))).limit(1);
      if (existing.length > 0) {
        await db.update(assignmentSubmissions).set({
          ...inkData !== void 0 && { inkData },
          ...enteredAnswers !== void 0 && { enteredAnswers },
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(assignmentSubmissions.id, existing[0].id));
        res.json({ message: "Draft saved", submissionId: existing[0].id });
      } else {
        const newSubId = crypto.randomUUID();
        await db.insert(assignmentSubmissions).values({
          id: newSubId,
          allocationId,
          studentId: st.id,
          attemptNo: alloc.currentAttempt,
          inkData,
          enteredAnswers,
          ocrStatus: "pending",
          autoMarkStatus: "pending",
          isLate: false,
          syncStatus: "synced"
        });
        if (alloc.allocStatus === "assigned" || alloc.allocStatus === "scheduled") {
          await db.update(assignmentAllocations).set({ allocStatus: "in_progress", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, allocationId));
        }
        res.status(201).json({ message: "Draft created", submissionId: newSubId });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to save draft" });
    }
  });
  app2.post("/api/me/library-assignments/:allocationId/submit", isAuthenticated, async (req, res) => {
    try {
      const { allocationId } = req.params;
      const user = req.user;
      if (user.role !== "student") return res.status(403).json({ message: "Access denied" });
      const st = await storage.getStudentByUserId(user.id);
      if (!st) return res.status(404).json({ message: "Student profile not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(and3(eq3(assignmentAllocations.id, allocationId), eq3(assignmentAllocations.studentId, st.id))).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (["submitted", "auto_marked", "under_review", "returned", "revoked"].includes(alloc.allocStatus)) {
        return res.status(400).json({ message: "Assignment already submitted or not available" });
      }
      const now = /* @__PURE__ */ new Date();
      const isLate = alloc.dueAt < now;
      const { inkData, enteredAnswers } = req.body;
      const existing = await db.select().from(assignmentSubmissions).where(and3(eq3(assignmentSubmissions.allocationId, allocationId), eq3(assignmentSubmissions.studentId, st.id), eq3(assignmentSubmissions.attemptNo, alloc.currentAttempt), isNull2(assignmentSubmissions.submittedAt))).limit(1);
      let submissionId;
      if (existing.length > 0) {
        await db.update(assignmentSubmissions).set({
          submittedAt: now,
          isLate,
          ...inkData !== void 0 && { inkData },
          ...enteredAnswers !== void 0 && { enteredAnswers },
          ocrStatus: "pending",
          autoMarkStatus: "pending",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(assignmentSubmissions.id, existing[0].id));
        submissionId = existing[0].id;
      } else {
        const newSubId2 = crypto.randomUUID();
        await db.insert(assignmentSubmissions).values({
          id: newSubId2,
          allocationId,
          studentId: st.id,
          attemptNo: alloc.currentAttempt,
          submittedAt: now,
          isLate,
          inkData,
          enteredAnswers,
          ocrStatus: "pending",
          autoMarkStatus: "pending",
          syncStatus: "synced"
        });
        submissionId = newSubId2;
      }
      const questions = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, alloc.libraryItemId));
      const enteredMap = typeof enteredAnswers === "object" && enteredAnswers ? enteredAnswers : {};
      let provisionalTotal = 0;
      for (const q of questions) {
        await db.insert(submissionTranscriptions).values({
          submissionId,
          questionId: q.id,
          text: enteredMap[q.id] ?? "",
          confidence: 95,
          ocrStatus: "complete"
        });
        let provisional = 0;
        let markSource = "ai";
        let confidence = 75;
        if (q.answerKey) {
          const answer = (enteredMap[q.id] ?? "").trim().toLowerCase();
          const key = q.answerKey.trim().toLowerCase();
          provisional = answer === key ? q.maxMarks ?? 1 : 0;
          markSource = "key";
          confidence = 100;
        } else {
          provisional = Math.round((q.maxMarks ?? 1) * 0.5);
          markSource = "ai";
          confidence = 75;
        }
        provisionalTotal += provisional;
        await db.insert(submissionMarks).values({
          submissionId,
          questionId: q.id,
          markSource,
          provisionalScore: provisional,
          finalScore: null,
          confidence,
          isProvisional: true
        });
      }
      await db.update(assignmentSubmissions).set({
        ocrStatus: "complete",
        autoMarkStatus: "complete",
        provisionalScore: provisionalTotal,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(assignmentSubmissions.id, submissionId));
      await db.update(assignmentAllocations).set({ allocStatus: "auto_marked", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, allocationId));
      const companyTutors = await db.select().from(tutors).where(eq3(tutors.companyId, alloc.companyId));
      const [studentUser] = await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, st.userId)).limit(1);
      const [libItem] = await db.select({ title: assignmentLibraryItems.title }).from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      const studentName = studentUser ? `${studentUser.firstName ?? ""} ${studentUser.lastName ?? ""}`.trim() : "A student";
      for (const t of companyTutors) {
        await db.insert(inAppNotifications).values({
          userId: t.userId,
          companyId: alloc.companyId,
          type: "assignment_notification",
          title: "Assignment Submitted",
          message: `${studentName} submitted "${libItem?.title}"${isLate ? " (late)" : ""}`,
          data: { allocationId, submissionId }
        });
      }
      res.json({ message: "Assignment submitted", submissionId, provisionalScore: provisionalTotal, isLate });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });
  app2.get("/api/me/marking-queue", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      let companyId = null;
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        companyId = ca?.companyId ?? null;
      } else {
        const tutor = await storage.getTutorByUserId(user.id);
        companyId = tutor?.companyId ?? null;
      }
      if (!companyId) return res.status(403).json({ message: "No company associated with your account" });
      const { status, classId } = req.query;
      const queueStatuses = ["submitted", "auto_marked", "under_review"];
      const filterStatuses = status ? [status] : queueStatuses;
      const conditions = [
        eq3(assignmentAllocations.companyId, companyId),
        inArray2(assignmentAllocations.allocStatus, filterStatuses)
      ];
      if (classId) conditions.push(eq3(assignmentAllocations.classId, classId));
      const allocs = await db.select().from(assignmentAllocations).where(and3(...conditions)).orderBy(desc3(assignmentAllocations.updatedAt));
      const result = [];
      for (const alloc of allocs) {
        const [st] = await db.select().from(students).where(eq3(students.id, alloc.studentId)).limit(1);
        const [studentUser] = st ? await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, st.userId)).limit(1) : [null];
        const [libItem] = await db.select({ title: assignmentLibraryItems.title, maxMarks: assignmentLibraryItems.maxMarks }).from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
        const [sub] = await db.select().from(assignmentSubmissions).where(eq3(assignmentSubmissions.allocationId, alloc.id)).orderBy(desc3(assignmentSubmissions.attemptNo)).limit(1);
        if (!sub) continue;
        let className = "";
        if (alloc.classId) {
          const [cls] = await db.select({ name: classes.name }).from(classes).where(eq3(classes.id, alloc.classId)).limit(1);
          className = cls?.name ?? "";
        }
        result.push({
          id: sub.id,
          studentName: studentUser ? `${studentUser.firstName ?? ""} ${studentUser.lastName ?? ""}`.trim() : "Unknown",
          assignmentTitle: libItem?.title ?? "",
          className,
          status: alloc.allocStatus,
          submittedAt: sub.submittedAt?.toISOString() ?? null,
          provisionalScore: sub.provisionalScore ?? null,
          maxMarks: libItem?.maxMarks ?? null,
          isLate: sub.isLate ?? false
        });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch marking queue" });
    }
  });
  app2.get("/api/library-submissions/:submissionId/review", isAuthenticated, async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [sub] = await db.select().from(assignmentSubmissions).where(eq3(assignmentSubmissions.id, submissionId)).limit(1);
      if (!sub) return res.status(404).json({ message: "Submission not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, sub.allocationId)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const [libItem] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      const questions = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, alloc.libraryItemId)).orderBy(asc2(assignmentLibraryQuestions.questionNumber));
      const transcriptions = await db.select().from(submissionTranscriptions).where(eq3(submissionTranscriptions.submissionId, submissionId));
      const marks = await db.select().from(submissionMarks).where(eq3(submissionMarks.submissionId, submissionId));
      if (alloc.allocStatus === "auto_marked") {
        await db.update(assignmentAllocations).set({ allocStatus: "under_review", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, alloc.id));
      }
      const [st] = await db.select().from(students).where(eq3(students.id, alloc.studentId)).limit(1);
      const [studentUser] = st ? await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, st.userId)).limit(1) : [null];
      const studentName = studentUser ? `${studentUser.firstName ?? ""} ${studentUser.lastName ?? ""}`.trim() : "Unknown";
      let className = "";
      if (alloc.classId) {
        const [cls] = await db.select({ name: classes.name }).from(classes).where(eq3(classes.id, alloc.classId)).limit(1);
        className = cls?.name ?? "";
      }
      const ocrMap = {};
      for (const t of transcriptions) {
        if (t.questionId) ocrMap[t.questionId] = t.transcribedText ?? "";
      }
      const marksMap = {};
      for (const m of marks) {
        if (m.questionId) marksMap[m.questionId] = m;
      }
      const enteredAnswers = typeof sub.enteredAnswers === "object" && sub.enteredAnswers ? sub.enteredAnswers : {};
      const inkData = typeof sub.inkData === "object" && sub.inkData ? sub.inkData : {};
      const shapedQuestions = questions.map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        maxMarks: q.maxMarks,
        studentAnswer: enteredAnswers[q.id] ?? null,
        ocrTranscription: ocrMap[q.id] ?? null,
        provisionalScore: marksMap[q.id]?.provisionalScore ?? null,
        isHandwritten: !!inkData[q.id]
      }));
      res.json({
        id: sub.id,
        studentName,
        assignmentTitle: libItem?.title ?? "",
        className,
        submittedAt: sub.submittedAt?.toISOString() ?? "",
        isLate: sub.isLate ?? false,
        maxMarks: libItem?.maxMarks ?? 0,
        questions: shapedQuestions
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch review payload" });
    }
  });
  app2.patch("/api/submissions/:submissionId/marks", isAuthenticated, async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [sub] = await db.select().from(assignmentSubmissions).where(eq3(assignmentSubmissions.id, submissionId)).limit(1);
      if (!sub) return res.status(404).json({ message: "Submission not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, sub.allocationId)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { questionId, finalScore, tutorComment, tutorComments } = req.body;
      const commentText = tutorComment ?? tutorComments ?? null;
      if (!questionId || finalScore === void 0) return res.status(400).json({ message: "questionId and finalScore are required" });
      const [existing] = await db.select().from(submissionMarks).where(and3(eq3(submissionMarks.submissionId, submissionId), eq3(submissionMarks.questionId, questionId))).limit(1);
      if (existing) {
        await db.update(submissionMarks).set({
          finalScore,
          tutorComments: commentText,
          markSource: "tutor",
          isProvisional: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(submissionMarks.id, existing.id));
      } else {
        await db.insert(submissionMarks).values({
          submissionId,
          questionId,
          markSource: "tutor",
          finalScore,
          tutorComments: commentText,
          isProvisional: false
        });
      }
      const allMarks = await db.select({ finalScore: submissionMarks.finalScore }).from(submissionMarks).where(and3(eq3(submissionMarks.submissionId, submissionId), isNotNull(submissionMarks.finalScore)));
      const runningFinal = allMarks.reduce((sum2, m) => sum2 + (m.finalScore ?? 0), 0);
      await db.update(assignmentSubmissions).set({ finalScore: runningFinal, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentSubmissions.id, submissionId));
      res.json({ message: "Mark updated", runningFinalScore: runningFinal });
    } catch (err) {
      res.status(500).json({ message: "Failed to update mark" });
    }
  });
  app2.post("/api/submissions/:submissionId/finalise", isAuthenticated, async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [sub] = await db.select().from(assignmentSubmissions).where(eq3(assignmentSubmissions.id, submissionId)).limit(1);
      if (!sub) return res.status(404).json({ message: "Submission not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, sub.allocationId)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { overallFeedback, tutorFeedback: legacyFeedback, tutorAnnotations, grantResubmission, resubmissionDueAt, resubmissionNote, questions: questionMarks } = req.body;
      const feedbackText = overallFeedback ?? legacyFeedback ?? null;
      const now = /* @__PURE__ */ new Date();
      if (Array.isArray(questionMarks)) {
        for (const qm of questionMarks) {
          const { questionId, finalScore: qFinalScore, tutorComment } = qm;
          if (!questionId) continue;
          const [existing] = await db.select().from(submissionMarks).where(and3(eq3(submissionMarks.submissionId, submissionId), eq3(submissionMarks.questionId, questionId))).limit(1);
          if (existing) {
            await db.update(submissionMarks).set({ finalScore: qFinalScore, tutorComments: tutorComment ?? null, markSource: "tutor", isProvisional: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(submissionMarks.id, existing.id));
          } else {
            await db.insert(submissionMarks).values({ submissionId, questionId, markSource: "tutor", finalScore: qFinalScore, tutorComments: tutorComment ?? null, isProvisional: false });
          }
        }
      }
      const allMarks = await db.select({ finalScore: submissionMarks.finalScore, provisionalScore: submissionMarks.provisionalScore }).from(submissionMarks).where(eq3(submissionMarks.submissionId, submissionId));
      const finalScore = allMarks.reduce((s, m) => s + (m.finalScore ?? m.provisionalScore ?? 0), 0);
      await db.update(assignmentSubmissions).set({
        tutorFeedback: feedbackText,
        tutorAnnotations,
        finalisedBy: user.id,
        finalisedAt: now,
        finalScore,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(assignmentSubmissions.id, submissionId));
      const [libItem] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      await db.update(assignmentAllocations).set({ allocStatus: "returned", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, alloc.id));
      await db.insert(studentAssignmentResults).values({
        studentId: alloc.studentId,
        allocationId: alloc.id,
        libraryItemId: alloc.libraryItemId,
        companyId: alloc.companyId,
        classId: alloc.classId ?? null,
        termId: alloc.termId ?? null,
        subjects: libItem?.subjects ?? [],
        score: finalScore,
        maxMarks: libItem?.maxMarks ?? null,
        isLate: sub.isLate,
        attemptNo: sub.attemptNo,
        finalisedAt: now
      });
      const [st] = await db.select().from(students).where(eq3(students.id, alloc.studentId)).limit(1);
      if (st) {
        await db.insert(inAppNotifications).values({
          userId: st.userId,
          companyId: alloc.companyId,
          type: "assignment_notification",
          title: "Assignment Marked",
          message: `Your assignment "${libItem?.title}" has been marked. Score: ${finalScore}${libItem?.maxMarks ? "/" + libItem.maxMarks : ""}`,
          data: { allocationId: alloc.id, submissionId }
        });
      }
      if (grantResubmission) {
        const resubId = crypto.randomUUID();
        await db.insert(resubmissions).values({
          id: resubId,
          allocationId: alloc.id,
          grantedBy: user.id,
          newDueAt: resubmissionDueAt ? new Date(resubmissionDueAt) : null,
          note: resubmissionNote ?? null
        });
        await db.update(assignmentAllocations).set({
          allocStatus: "assigned",
          currentAttempt: alloc.currentAttempt + 1,
          dueAt: resubmissionDueAt ? new Date(resubmissionDueAt) : alloc.dueAt,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(assignmentAllocations.id, alloc.id));
        if (st) {
          await db.insert(inAppNotifications).values({
            userId: st.userId,
            companyId: alloc.companyId,
            type: "assignment_notification",
            title: "Resubmission Granted",
            message: `You may resubmit "${libItem?.title}"${resubmissionDueAt ? ". New due date: " + new Date(resubmissionDueAt).toLocaleDateString("en-AU") : ""}`,
            data: { allocationId: alloc.id }
          });
        }
      }
      res.json({ message: "Marking finalised", finalScore });
    } catch (err) {
      res.status(500).json({ message: "Failed to finalise marking" });
    }
  });
  app2.post("/api/allocations/:id/grant-resubmission", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, id)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { newDueAt, note } = req.body;
      const resubId2 = crypto.randomUUID();
      await db.insert(resubmissions).values({
        id: resubId2,
        allocationId: id,
        grantedBy: user.id,
        newDueAt: newDueAt ? new Date(newDueAt) : null,
        note: note ?? null
      });
      const newAttempt = alloc.currentAttempt + 1;
      await db.update(assignmentAllocations).set({
        allocStatus: "assigned",
        currentAttempt: newAttempt,
        ...newDueAt && { dueAt: new Date(newDueAt) },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(assignmentAllocations.id, id));
      const [st] = await db.select().from(students).where(eq3(students.id, alloc.studentId)).limit(1);
      const [libItem] = await db.select({ title: assignmentLibraryItems.title }).from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      if (st) {
        await db.insert(inAppNotifications).values({
          userId: st.userId,
          companyId: alloc.companyId,
          type: "assignment_notification",
          title: "Resubmission Granted",
          message: `You may resubmit "${libItem?.title}"${newDueAt ? ". New due: " + new Date(newDueAt).toLocaleDateString("en-AU") : ""}`,
          data: { allocationId: id, resubmissionId: resubId2 }
        });
      }
      res.status(201).json({ message: "Resubmission granted", resubmissionId: resubId2, newAttempt });
    } catch (err) {
      res.status(500).json({ message: "Failed to grant resubmission" });
    }
  });
  app2.post("/api/allocations/:id/revoke-resubmission", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, id)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== alloc.companyId) return res.status(403).json({ message: "Access denied" });
      }
      const resubs = await db.select().from(resubmissions).where(and3(eq3(resubmissions.allocationId, id), isNull2(resubmissions.revokedAt))).orderBy(desc3(resubmissions.grantedAt)).limit(1);
      if (resubs.length === 0) return res.status(404).json({ message: "No active resubmission to revoke" });
      await db.update(resubmissions).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq3(resubmissions.id, resubs[0].id));
      await db.update(assignmentAllocations).set({ allocStatus: "returned", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(assignmentAllocations.id, id));
      res.json({ message: "Resubmission revoked" });
    } catch (err) {
      res.status(500).json({ message: "Failed to revoke resubmission" });
    }
  });
  app2.get("/api/parent/students/:studentId/library-assignments", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const user = req.user;
      if (user.role !== "parent") return res.status(403).json({ message: "Access denied" });
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) return res.status(403).json({ message: "Parent profile not found" });
      const [st] = await db.select().from(students).where(and3(eq3(students.id, studentId), eq3(students.parentId, parent.id))).limit(1);
      if (!st) return res.status(403).json({ message: "Student not linked to your account" });
      const allocs = await db.select().from(assignmentAllocations).where(and3(eq3(assignmentAllocations.studentId, studentId), ne2(assignmentAllocations.allocStatus, "revoked"))).orderBy(desc3(assignmentAllocations.dueAt));
      const libItemIds = [...new Set(allocs.map((a) => a.libraryItemId))];
      const libItems = libItemIds.length > 0 ? await db.select({ id: assignmentLibraryItems.id, title: assignmentLibraryItems.title, subjects: assignmentLibraryItems.subjects }).from(assignmentLibraryItems).where(inArray2(assignmentLibraryItems.id, libItemIds)) : [];
      const libMap = {};
      for (const li of libItems) libMap[li.id] = li;
      const now = /* @__PURE__ */ new Date();
      res.json(allocs.map((a) => ({
        allocationId: a.id,
        libraryItem: libMap[a.libraryItemId] ?? null,
        dueAt: a.dueAt,
        status: a.allocStatus,
        isOverdue: a.dueAt < now && !["returned", "submitted", "auto_marked", "under_review"].includes(a.allocStatus),
        currentAttempt: a.currentAttempt
      })));
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch student assignments" });
    }
  });
  app2.get("/api/parent/library-assignments/:allocationId", isAuthenticated, async (req, res) => {
    try {
      const { allocationId } = req.params;
      const user = req.user;
      if (user.role !== "parent") return res.status(403).json({ message: "Access denied" });
      const parent = await storage.getParentByUserId(user.id);
      if (!parent) return res.status(403).json({ message: "Parent profile not found" });
      const [alloc] = await db.select().from(assignmentAllocations).where(eq3(assignmentAllocations.id, allocationId)).limit(1);
      if (!alloc) return res.status(404).json({ message: "Allocation not found" });
      const [st] = await db.select().from(students).where(and3(eq3(students.id, alloc.studentId), eq3(students.parentId, parent.id))).limit(1);
      if (!st) return res.status(403).json({ message: "Access denied" });
      const [libItem] = await db.select().from(assignmentLibraryItems).where(eq3(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      const questions = await db.select().from(assignmentLibraryQuestions).where(eq3(assignmentLibraryQuestions.libraryItemId, alloc.libraryItemId)).orderBy(asc2(assignmentLibraryQuestions.questionNumber));
      let submission = null;
      let marks = [];
      if (["returned", "submitted", "auto_marked", "under_review"].includes(alloc.allocStatus)) {
        const subs = await db.select().from(assignmentSubmissions).where(eq3(assignmentSubmissions.allocationId, allocationId)).orderBy(desc3(assignmentSubmissions.attemptNo)).limit(1);
        if (subs.length > 0) {
          submission = subs[0];
          marks = await db.select().from(submissionMarks).where(eq3(submissionMarks.submissionId, subs[0].id));
        }
      }
      res.json({ allocation: alloc, libraryItem: { ...libItem, questions }, submission, marks });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch allocation detail" });
    }
  });
  app2.get("/api/students/:studentId/assignment-performance", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const user = req.user;
      const { subject, termId } = req.query;
      if (user.role === "student") {
        const st = await storage.getStudentByUserId(user.id);
        if (!st || st.id !== studentId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "parent") {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) return res.status(403).json({ message: "Access denied" });
        const [st] = await db.select().from(students).where(and3(eq3(students.id, studentId), eq3(students.parentId, parent.id))).limit(1);
        if (!st) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor) return res.status(403).json({ message: "Access denied" });
        const [st] = await db.select().from(students).where(and3(eq3(students.id, studentId), eq3(students.companyId, tutor.companyId))).limit(1);
        if (!st) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca) return res.status(403).json({ message: "Access denied" });
        const [st] = await db.select().from(students).where(and3(eq3(students.id, studentId), eq3(students.companyId, ca.companyId))).limit(1);
        if (!st) return res.status(403).json({ message: "Access denied" });
      }
      const conditions = [eq3(studentAssignmentResults.studentId, studentId)];
      if (termId) conditions.push(eq3(studentAssignmentResults.termId, termId));
      let results = await db.select().from(studentAssignmentResults).where(and3(...conditions)).orderBy(desc3(studentAssignmentResults.finalisedAt));
      if (subject) results = results.filter((r) => r.subjects?.includes(subject));
      const count2 = results.length;
      const avgScore = count2 > 0 ? results.reduce((s, r) => s + (r.score ?? 0) / (r.maxMarks || 1), 0) / count2 * 100 : 0;
      const completionRate = count2;
      const onTimeCount = results.filter((r) => !r.isLate).length;
      const onTimeRate = count2 > 0 ? onTimeCount / count2 * 100 : 0;
      res.json({
        assignments: results,
        summary: {
          count: count2,
          avgScore: Math.round(avgScore * 10) / 10,
          completionRate: count2,
          onTimeRate: Math.round(onTimeRate * 10) / 10
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });
  app2.get("/api/me/devices", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const devices = await db.select().from(userDevices).where(and3(eq3(userDevices.userId, user.id), ne2(userDevices.deviceStatus, "unlinked"))).orderBy(desc3(userDevices.lastActiveAt));
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });
  app2.delete("/api/me/devices/:deviceId", isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const user = req.user;
      const [device] = await db.select().from(userDevices).where(and3(eq3(userDevices.id, deviceId), eq3(userDevices.userId, user.id))).limit(1);
      if (!device) return res.status(404).json({ message: "Device not found" });
      await db.update(userDevices).set({ deviceStatus: "unlinked" }).where(eq3(userDevices.id, deviceId));
      res.json({ message: "Device unlinked" });
    } catch (err) {
      res.status(500).json({ message: "Failed to unlink device" });
    }
  });
  app2.get("/api/companies/:companyId/users/:userId/devices", isAuthenticated, async (req, res) => {
    try {
      const { companyId, userId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      const devices = await db.select().from(userDevices).where(and3(eq3(userDevices.userId, userId), ne2(userDevices.deviceStatus, "unlinked"))).orderBy(desc3(userDevices.lastActiveAt));
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });
  app2.delete("/api/companies/:companyId/users/:userId/devices/:deviceId", isAuthenticated, async (req, res) => {
    try {
      const { companyId, userId, deviceId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      const ca = await storage.getCompanyAdminByUserId(user.id);
      if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      const [device] = await db.select().from(userDevices).where(and3(eq3(userDevices.id, deviceId), eq3(userDevices.userId, userId))).limit(1);
      if (!device) return res.status(404).json({ message: "Device not found" });
      await db.update(userDevices).set({ deviceStatus: "unlinked" }).where(eq3(userDevices.id, deviceId));
      res.json({ message: "Device unlinked" });
    } catch (err) {
      res.status(500).json({ message: "Failed to unlink device" });
    }
  });
  app2.get("/api/companies/:companyId/assignment-oversight", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user;
      if (!["admin", "company_admin", "tutor"].includes(user.role)) return res.status(403).json({ message: "Access denied" });
      if (user.role === "company_admin") {
        const ca = await storage.getCompanyAdminByUserId(user.id);
        if (!ca || ca.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      } else if (user.role === "tutor") {
        const tutor = await storage.getTutorByUserId(user.id);
        if (!tutor || tutor.companyId !== companyId) return res.status(403).json({ message: "Access denied" });
      }
      const { termId, classId } = req.query;
      const allocConditions = [eq3(assignmentAllocations.companyId, companyId)];
      if (termId) allocConditions.push(eq3(assignmentAllocations.termId, termId));
      if (classId) allocConditions.push(eq3(assignmentAllocations.classId, classId));
      const allocs = await db.select().from(assignmentAllocations).where(and3(...allocConditions));
      const allocIds = allocs.map((a) => a.id);
      const allocated = allocs.length;
      const submitted = allocs.filter((a) => ["submitted", "auto_marked", "under_review", "returned"].includes(a.allocStatus)).length;
      const notSubmitted = allocs.filter((a) => ["assigned", "scheduled", "in_progress", "overdue"].includes(a.allocStatus)).length;
      const subs = allocIds.length > 0 ? await db.select().from(assignmentSubmissions).where(inArray2(assignmentSubmissions.allocationId, allocIds)) : [];
      const lateSubmissions = subs.filter((s) => s.isLate).length;
      const onTime = submitted - lateSubmissions;
      const returned = allocs.filter((a) => a.allocStatus === "returned").length;
      const awaitingReview = allocs.filter((a) => ["submitted", "auto_marked"].includes(a.allocStatus)).length;
      const inReview = allocs.filter((a) => a.allocStatus === "under_review").length;
      const finalisedSubs = subs.filter((s) => s.submittedAt && s.finalisedAt);
      const avgTurnaroundDays = finalisedSubs.length > 0 ? finalisedSubs.reduce((sum2, s) => {
        const diff = (s.finalisedAt.getTime() - s.submittedAt.getTime()) / (1e3 * 60 * 60 * 24);
        return sum2 + diff;
      }, 0) / finalisedSubs.length : 0;
      const subIds = subs.map((s) => s.id);
      const allMarks = subIds.length > 0 ? await db.select().from(submissionMarks).where(inArray2(submissionMarks.submissionId, subIds)) : [];
      const tutorMarks = allMarks.filter((m) => m.markSource === "tutor" && m.finalScore !== null && m.provisionalScore !== null);
      const avgDelta = tutorMarks.length > 0 ? tutorMarks.reduce((s, m) => s + Math.abs((m.finalScore ?? 0) - (m.provisionalScore ?? 0)), 0) / tutorMarks.length : 0;
      const pctAdjusted = allMarks.length > 0 ? tutorMarks.length / allMarks.length * 100 : 0;
      const companyTutors = await db.select().from(tutors).where(eq3(tutors.companyId, companyId));
      const byTutor = [];
      for (const t of companyTutors) {
        const [tutorUser] = await db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq3(users.id, t.userId)).limit(1);
        const tutorName = tutorUser ? `${tutorUser.firstName ?? ""} ${tutorUser.lastName ?? ""}`.trim() : "Unknown";
        const tutorClassAllocs = allocs.filter((a) => a.classId !== null);
        const tutorMarksForTutor = allMarks.filter((m) => m.markSource === "tutor");
        const tutorReturned = allocs.filter((a) => a.allocStatus === "returned").length;
        const tutorPending = allocs.filter((a) => ["submitted", "auto_marked", "under_review"].includes(a.allocStatus)).length;
        byTutor.push({
          tutorName,
          marked: tutorReturned,
          pending: tutorPending,
          avgTurnaround: Math.round(avgTurnaroundDays * 10) / 10,
          avgAdjustment: tutorMarksForTutor.length > 0 ? Math.round(tutorMarksForTutor.reduce((s, m) => s + Math.abs((m.finalScore ?? 0) - (m.provisionalScore ?? 0)), 0) / tutorMarksForTutor.length * 10) / 10 : 0
        });
      }
      const submittedPct = allocated > 0 ? Math.round(submitted / allocated * 100) : 0;
      res.json({
        metrics: { allocated, submitted, submittedPct, onTime, notSubmitted },
        marking: { avgTurnaroundDays: Math.round(avgTurnaroundDays * 10) / 10, awaitingReview, inReview },
        aiVsTutor: { avgScoreDelta: Math.round(avgDelta * 10) / 10, pctAdjusted: Math.round(pctAdjusted * 10) / 10 },
        byTutor: byTutor.map((t) => ({ ...t, avgTurnaroundDays: t.avgTurnaround }))
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch oversight data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_security();
import { execSync } from "child_process";

// server/services/wwccReminder.ts
init_db();
init_schema();
import * as nodemailer3 from "nodemailer";
import { eq as eq4, and as and4, lte as lte2, isNotNull as isNotNull2 } from "drizzle-orm";
var REMINDER_THRESHOLDS_DAYS = [60, 30, 7, 0];
function daysUntil(date) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
}
async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[WWCC] Email not configured \u2014 would send to ${to}: ${subject}`);
    return;
  }
  const transporter = nodemailer3.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@eslate.com",
    to,
    subject,
    html
  });
}
async function checkWwccExpiry() {
  try {
    const sixtyDaysFromNow = /* @__PURE__ */ new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringTutors = await db.select({
      tutorId: tutors.id,
      userId: tutors.userId,
      companyId: tutors.companyId,
      wwccExpiry: tutors.wwccExpiry,
      wwccNumber: tutors.wwccNumber,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      companyName: tutoringCompanies.name
    }).from(tutors).innerJoin(users, eq4(tutors.userId, users.id)).leftJoin(tutoringCompanies, eq4(tutors.companyId, tutoringCompanies.id)).where(
      and4(
        isNotNull2(tutors.wwccExpiry),
        lte2(tutors.wwccExpiry, sixtyDaysFromNow),
        eq4(tutors.status, "active"),
        eq4(users.isActive, true)
      )
    );
    for (const tutor of expiringTutors) {
      if (!tutor.wwccExpiry) continue;
      const days = daysUntil(tutor.wwccExpiry);
      const isThreshold = REMINDER_THRESHOLDS_DAYS.some((t) => t === days);
      if (!isThreshold) continue;
      const isExpired = days < 0;
      const subject = isExpired ? `WWCC Expired: ${tutor.firstName} ${tutor.lastName}` : `WWCC Expiring in ${days} day${days === 1 ? "" : "s"}: ${tutor.firstName} ${tutor.lastName}`;
      const urgency = isExpired ? "has expired" : `expires in ${days} day${days === 1 ? "" : "s"}`;
      const html = `
        <p>Hello,</p>
        <p>This is a reminder that the Working With Children Check (WWCC) for <strong>${tutor.firstName} ${tutor.lastName}</strong> ${urgency}.</p>
        <p><strong>WWCC Number:</strong> ${tutor.wwccNumber || "Not recorded"}<br>
        <strong>Expiry Date:</strong> ${tutor.wwccExpiry.toLocaleDateString("en-AU")}</p>
        <p>Please ensure this is renewed as soon as possible to maintain compliance.</p>
        <p>Regards,<br>eSlate Compliance System</p>
      `;
      if (tutor.email) {
        await sendEmail(tutor.email, subject, html);
      }
      await db.insert(inAppNotifications).values({
        userId: tutor.userId,
        companyId: tutor.companyId || void 0,
        type: "wwcc_expiry",
        title: isExpired ? "WWCC Expired" : `WWCC Expiring Soon`,
        message: `Your WWCC ${urgency}. WWCC #${tutor.wwccNumber || "unknown"} \u2014 expiry: ${tutor.wwccExpiry.toLocaleDateString("en-AU")}.`,
        data: { tutorId: tutor.tutorId, wwccExpiry: tutor.wwccExpiry, daysUntilExpiry: days }
      });
      console.log(`[WWCC] Reminder sent for tutor ${tutor.firstName} ${tutor.lastName} \u2014 ${urgency}`);
    }
    console.log(`[WWCC] Check complete. Processed ${expiringTutors.length} expiring WWCC records.`);
  } catch (err) {
    console.error("[WWCC] Error during WWCC expiry check:", err);
  }
}
var MS_PER_DAY = 24 * 60 * 60 * 1e3;
function startWwccReminderJob() {
  setTimeout(() => checkWwccExpiry(), 3e4);
  setInterval(() => checkWwccExpiry(), MS_PER_DAY);
  console.log("[WWCC] WWCC expiry reminder job scheduled (daily)");
}

// server/services/termReminder.ts
init_db();
init_schema();
import * as nodemailer4 from "nodemailer";
import { eq as eq5, and as and5, gte as gte3, lte as lte3 } from "drizzle-orm";
async function sendEmail2(to, subject, html) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[TermReminder] Email not configured \u2014 would send to ${to}: ${subject}`);
    return;
  }
  const transporter = nodemailer4.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || "noreply@eslate.com", to, subject, html });
}
async function alreadySent(companyId, termId, type, recipient) {
  const rows = await db.select().from(termReminders).where(and5(eq5(termReminders.companyId, companyId), eq5(termReminders.termId, termId), eq5(termReminders.reminderType, type), eq5(termReminders.recipient, recipient))).limit(1);
  return rows.length > 0;
}
async function markSent(companyId, termId, type, recipient) {
  await db.insert(termReminders).values({ companyId, termId, reminderType: type, recipient });
}
function daysUntil2(date) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
}
async function checkTermReminders() {
  try {
    const now = /* @__PURE__ */ new Date();
    const in14 = new Date(now);
    in14.setDate(in14.getDate() + 15);
    const fourteenAgo = new Date(now);
    fourteenAgo.setDate(fourteenAgo.getDate() - 1);
    const allTerms = await db.select().from(academicTerms).where(and5(gte3(academicTerms.endDate, fourteenAgo), lte3(academicTerms.startDate, in14)));
    for (const term of allTerms) {
      const companyId = term.companyId;
      const daysToStart = daysUntil2(term.startDate);
      const daysToEnd = daysUntil2(term.endDate);
      const adminRows = await db.select({ userId: companyAdmins.userId }).from(companyAdmins).where(eq5(companyAdmins.companyId, companyId));
      if (!adminRows.length) continue;
      const adminUserId = adminRows[0].userId;
      const adminUser = await db.select().from(users).where(eq5(users.id, adminUserId)).limit(1);
      if (!adminUser[0]) continue;
      const adminEmail = adminUser[0].email;
      const companyRow = await db.select().from(tutoringCompanies).where(eq5(tutoringCompanies.id, companyId)).limit(1);
      const companyName = companyRow[0]?.name ?? "Your company";
      const adminStartMap = [
        { days: 14, type: "admin_14d_before_start", subject: `${term.name} starts in 14 days \u2014 Action Required`, emailSend: true },
        { days: 7, type: "admin_7d_before_start", subject: `${term.name} starts in 7 days \u2014 Final Checks`, emailSend: true },
        { days: 1, type: "admin_1d_before_start", subject: `${term.name} starts tomorrow`, emailSend: false },
        { days: 0, type: "admin_term_start", subject: `${term.name} has started \u2014 ${companyName}`, emailSend: true }
      ];
      for (const r of adminStartMap) {
        if (daysToStart === r.days) {
          if (await alreadySent(companyId, term.id, r.type, "admin")) continue;
          const html = `<p>Hi ${adminUser[0].firstName ?? "Admin"},</p><p><strong>${term.name}</strong> ${r.days > 0 ? `starts in ${r.days} day${r.days > 1 ? "s" : ""}` : "has started today"}.</p><p>Please ensure all classes are set up, tutors are assigned, and invoices are generated.</p>`;
          if (r.emailSend && adminEmail) await sendEmail2(adminEmail, r.subject, html).catch(() => {
          });
          await db.insert(inAppNotifications).values({ userId: adminUserId, companyId, type: r.type, title: r.subject, message: `${term.name} ${r.days > 0 ? `starts in ${r.days} days` : "has started today"}.`, data: { termId: term.id } });
          await markSent(companyId, term.id, r.type, "admin");
        }
      }
      const adminEndMap = [
        { days: 14, type: "admin_14d_before_end", subject: `${term.name} ends in 14 days \u2014 Prepare for Next Term` },
        { days: 7, type: "admin_7d_before_end", subject: `${term.name} ends in 7 days \u2014 Outstanding Items` },
        { days: 0, type: "admin_term_end", subject: `${term.name} has ended \u2014 ${companyName}` }
      ];
      for (const r of adminEndMap) {
        if (daysToEnd === r.days) {
          if (await alreadySent(companyId, term.id, r.type, "admin")) continue;
          const html = `<p>Hi ${adminUser[0].firstName ?? "Admin"},</p><p><strong>${term.name}</strong> ${r.days > 0 ? `ends in ${r.days} days` : "has ended today"}.</p><p>Please mark attendance, complete progress reports, and prepare for the upcoming term.</p>`;
          if (adminEmail) await sendEmail2(adminEmail, r.subject, html).catch(() => {
          });
          await db.insert(inAppNotifications).values({ userId: adminUserId, companyId, type: r.type, title: r.subject, message: `${term.name} ${r.days > 0 ? `ends in ${r.days} days` : "has ended today"}.`, data: { termId: term.id } });
          await markSent(companyId, term.id, r.type, "admin");
        }
      }
      const parentStartMap = [
        { days: 7, type: "parent_7d_before_start" },
        { days: 1, type: "parent_1d_before_start" }
      ];
      for (const r of parentStartMap) {
        if (daysToStart === r.days) {
          if (await alreadySent(companyId, term.id, r.type, "parent")) continue;
          const classRows = await db.select({ id: students.id, userId: students.userId }).from(students).innerJoin(studentClassAssignments, eq5(studentClassAssignments.studentId, students.id)).where(and5(eq5(students.companyId, companyId), eq5(studentClassAssignments.isActive, true)));
          const studentIds = Array.from(new Set(classRows.map((s) => s.id)));
          if (studentIds.length > 0) {
            const contacts = await db.select().from(studentContacts).where(and5(eq5(studentContacts.isPrimary, true)));
            const filtered = contacts.filter((c) => studentIds.includes(c.studentId) && c.email);
            const unique = Array.from(new Map(filtered.map((c) => [c.email, c])).values());
            for (const contact of unique) {
              const html = `<p>Dear ${contact.name},</p><p><strong>${term.name}</strong> ${r.days > 1 ? `starts in ${r.days} days` : "starts tomorrow"}.</p><p>Please check the class schedule and ensure your child is prepared.</p>`;
              if (contact.email) await sendEmail2(contact.email, `${term.name} ${r.days > 1 ? `starts in ${r.days} days` : "starts tomorrow"}`, html).catch(() => {
              });
            }
          }
          await markSent(companyId, term.id, r.type, "parent");
        }
      }
      if (daysToEnd === 0 && !await alreadySent(companyId, term.id, "parent_term_end", "parent")) {
        await markSent(companyId, term.id, "parent_term_end", "parent");
      }
    }
    console.log("[TermReminder] Check complete");
  } catch (err) {
    console.error("[TermReminder] Error:", err);
  }
}
var MS_PER_DAY2 = 24 * 60 * 60 * 1e3;
function startTermReminderJob() {
  setTimeout(() => checkTermReminders(), 6e4);
  setInterval(() => checkTermReminders(), MS_PER_DAY2);
  console.log("[TermReminder] Term reminder job scheduled (daily)");
}

// server/index.ts
var app = express2();
global.uploadedFiles = global.uploadedFiles || /* @__PURE__ */ new Map();
app.use(securityHeaders);
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use(auditMiddleware);
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
process.on("SIGTERM", () => {
  log("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  log("Received SIGINT, shutting down gracefully");
  process.exit(0);
});
process.on("unhandledRejection", (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});
function freePort(port) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
    if (pids) {
      pids.split("\n").forEach((pid) => {
        const pidNum = parseInt(pid.trim(), 10);
        if (pidNum && pidNum !== process.pid) {
          try {
            process.kill(pidNum, "SIGKILL");
            log(`Killed stale process ${pidNum} on port ${port}`);
          } catch {
          }
        }
      });
    }
  } catch {
  }
}
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} in use \u2014 clearing stale process and retrying...`);
      freePort(port);
      setTimeout(() => {
        server.close();
        server.listen({ port, host: "localhost" }, () => {
          log(`serving on port ${port}`);
        });
      }, 1e3);
    } else {
      log(`Server error: ${err.message}`);
      throw err;
    }
  });
  server.listen({
    port,
    host: "localhost"
  }, () => {
    log(`serving on port ${port}`);
    startWwccReminderJob();
    startTermReminderJob();
  });
})();
