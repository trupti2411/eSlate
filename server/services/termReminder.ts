import * as nodemailer from 'nodemailer';
import { db } from '../db';
import { academicTerms, tutoringCompanies, companyAdmins, users, studentClassAssignments, students, studentContacts, termReminders, inAppNotifications } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

type ReminderType = 'admin_14d_before_start' | 'admin_7d_before_start' | 'admin_1d_before_start' | 'admin_term_start' | 'admin_14d_before_end' | 'admin_7d_before_end' | 'admin_term_end' | 'parent_7d_before_start' | 'parent_1d_before_start' | 'parent_term_end';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[TermReminder] Email not configured — would send to ${to}: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@eslate.com', to, subject, html });
}

async function alreadySent(companyId: string, termId: string, type: ReminderType, recipient: string): Promise<boolean> {
  const rows = await db.select().from(termReminders)
    .where(and(eq(termReminders.companyId, companyId), eq(termReminders.termId, termId), eq(termReminders.reminderType, type), eq(termReminders.recipient, recipient)))
    .limit(1);
  return rows.length > 0;
}

async function markSent(companyId: string, termId: string, type: ReminderType, recipient: string): Promise<void> {
  await db.insert(termReminders).values({ companyId, termId, reminderType: type, recipient });
}

function daysUntil(date: Date): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(date); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function checkTermReminders(): Promise<void> {
  try {
    const now = new Date();
    // Look at terms starting or ending within the next 14 days or today
    const in14 = new Date(now); in14.setDate(in14.getDate() + 15);
    const fourteenAgo = new Date(now); fourteenAgo.setDate(fourteenAgo.getDate() - 1);

    const allTerms = await db.select().from(academicTerms)
      .where(and(gte(academicTerms.endDate, fourteenAgo), lte(academicTerms.startDate, in14)));

    for (const term of allTerms) {
      const companyId = term.companyId;
      const daysToStart = daysUntil(term.startDate);
      const daysToEnd = daysUntil(term.endDate);

      // get admin for this company
      const adminRows = await db.select({ userId: companyAdmins.userId }).from(companyAdmins).where(eq(companyAdmins.companyId, companyId));
      if (!adminRows.length) continue;
      const adminUserId = adminRows[0].userId;
      const adminUser = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);
      if (!adminUser[0]) continue;
      const adminEmail = adminUser[0].email;
      const companyRow = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, companyId)).limit(1);
      const companyName = companyRow[0]?.name ?? 'Your company';

      // Admin term START reminders
      const adminStartMap: { days: number; type: ReminderType; subject: string; emailSend: boolean }[] = [
        { days: 14, type: 'admin_14d_before_start', subject: `${term.name} starts in 14 days — Action Required`, emailSend: true },
        { days: 7,  type: 'admin_7d_before_start',  subject: `${term.name} starts in 7 days — Final Checks`,   emailSend: true },
        { days: 1,  type: 'admin_1d_before_start',  subject: `${term.name} starts tomorrow`,                    emailSend: false },
        { days: 0,  type: 'admin_term_start',        subject: `${term.name} has started — ${companyName}`,      emailSend: true },
      ];
      for (const r of adminStartMap) {
        if (daysToStart === r.days) {
          if (await alreadySent(companyId, term.id, r.type, 'admin')) continue;
          const html = `<p>Hi ${adminUser[0].firstName ?? 'Admin'},</p><p><strong>${term.name}</strong> ${r.days > 0 ? `starts in ${r.days} day${r.days > 1 ? 's' : ''}` : 'has started today'}.</p><p>Please ensure all classes are set up, tutors are assigned, and invoices are generated.</p>`;
          if (r.emailSend && adminEmail) await sendEmail(adminEmail, r.subject, html).catch(() => {});
          await db.insert(inAppNotifications).values({ userId: adminUserId, companyId, type: r.type, title: r.subject, message: `${term.name} ${r.days > 0 ? `starts in ${r.days} days` : 'has started today'}.`, data: { termId: term.id } });
          await markSent(companyId, term.id, r.type, 'admin');
        }
      }

      // Admin term END reminders
      const adminEndMap: { days: number; type: ReminderType; subject: string }[] = [
        { days: 14, type: 'admin_14d_before_end', subject: `${term.name} ends in 14 days — Prepare for Next Term` },
        { days: 7,  type: 'admin_7d_before_end',  subject: `${term.name} ends in 7 days — Outstanding Items` },
        { days: 0,  type: 'admin_term_end',        subject: `${term.name} has ended — ${companyName}` },
      ];
      for (const r of adminEndMap) {
        if (daysToEnd === r.days) {
          if (await alreadySent(companyId, term.id, r.type, 'admin')) continue;
          const html = `<p>Hi ${adminUser[0].firstName ?? 'Admin'},</p><p><strong>${term.name}</strong> ${r.days > 0 ? `ends in ${r.days} days` : 'has ended today'}.</p><p>Please mark attendance, complete progress reports, and prepare for the upcoming term.</p>`;
          if (adminEmail) await sendEmail(adminEmail, r.subject, html).catch(() => {});
          await db.insert(inAppNotifications).values({ userId: adminUserId, companyId, type: r.type, title: r.subject, message: `${term.name} ${r.days > 0 ? `ends in ${r.days} days` : 'has ended today'}.`, data: { termId: term.id } });
          await markSent(companyId, term.id, r.type, 'admin');
        }
      }

      // Parent reminders (7d before start, 1d before start, last day of term)
      const parentStartMap: { days: number; type: ReminderType }[] = [
        { days: 7, type: 'parent_7d_before_start' },
        { days: 1, type: 'parent_1d_before_start' },
      ];
      for (const r of parentStartMap) {
        if (daysToStart === r.days) {
          if (await alreadySent(companyId, term.id, r.type, 'parent')) continue;
          // get all students enrolled in classes for this term
          const classRows = await db.select({ id: students.id, userId: students.userId })
            .from(students)
            .innerJoin(studentClassAssignments, eq(studentClassAssignments.studentId, students.id))
            .where(and(eq(students.companyId, companyId), eq(studentClassAssignments.isActive, true)));
          const studentIds = Array.from(new Set(classRows.map(s => s.id)));
          if (studentIds.length > 0) {
            const contacts = await db.select().from(studentContacts)
              .where(and(eq(studentContacts.isPrimary, true)));
            const filtered = contacts.filter(c => studentIds.includes(c.studentId) && c.email);
            const unique = Array.from(new Map(filtered.map(c => [c.email, c])).values());
            for (const contact of unique) {
              const html = `<p>Dear ${contact.name},</p><p><strong>${term.name}</strong> ${r.days > 1 ? `starts in ${r.days} days` : 'starts tomorrow'}.</p><p>Please check the class schedule and ensure your child is prepared.</p>`;
              if (contact.email) await sendEmail(contact.email, `${term.name} ${r.days > 1 ? `starts in ${r.days} days` : 'starts tomorrow'}`, html).catch(() => {});
            }
          }
          await markSent(companyId, term.id, r.type, 'parent');
        }
      }
      if (daysToEnd === 0 && !(await alreadySent(companyId, term.id, 'parent_term_end', 'parent'))) {
        await markSent(companyId, term.id, 'parent_term_end', 'parent');
      }
    }
    console.log('[TermReminder] Check complete');
  } catch (err) {
    console.error('[TermReminder] Error:', err);
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startTermReminderJob(): void {
  setTimeout(() => checkTermReminders(), 60_000);
  setInterval(() => checkTermReminders(), MS_PER_DAY);
  console.log('[TermReminder] Term reminder job scheduled (daily)');
}
