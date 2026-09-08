import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

// MariaDB has no native JSON column type — its "JSON" type is just LONGTEXT with a
// CHECK(JSON_VALID(...)) constraint, so the MySQL wire protocol reports these columns
// as VAR_STRING/BLOB rather than the JSON type code. mysql2 only auto-parses columns
// it sees reported as JSON, so on MariaDB every json() column in the schema comes back
// as a raw JSON string instead of a parsed array/object. On real MySQL (e.g. local dev
// via DBngin) this typeCast is a no-op, since those columns already arrive as objects
// and never hit the JSON-column branch below.
const JSON_COLUMNS = new Set([
  'audit_logs.details',
  'company_admins.permissions',
  'tutors.subjects_teaching',
  'classes.days_of_week',
  'assignments.solution_file_urls',
  'assignments.attachment_urls',
  'assignments.allowed_file_types',
  'assignments.page_rotations',
  'submissions.file_urls',
  'worksheet_questions.options',
  'test_questions.options',
  'report_definitions.default_filters',
  'report_runs.parameters',
  'report_runs.result_data',
  'in_app_notifications.data',
  'asgn_lib_items.subjects',
  'asgn_lib_items.year_groups',
  'asgn_lib_questions.region_coords',
  'asgn_lib_questions.options',
  'asgn_submissions.entered_answers',
  'asgn_submissions.answer_images',
  'stu_asgn_results.subjects',
]);

function typeCast(field: any, next: () => unknown) {
  const key = `${field.table}.${field.name}`;
  if (JSON_COLUMNS.has(key)) {
    const raw = field.string();
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return next();
}

export const connection = mysql.createPool({ uri: process.env.DATABASE_URL, typeCast });
export const db = drizzle(connection, { schema, mode: 'default' });
