import * as nodemailer from 'nodemailer';
import { db } from '../db';
import { invoices, payments, students, studentContacts, tutoringCompanies, companyAdmins, inAppNotifications } from '../../shared/schema';
import { eq, and, inArray, lt } from 'drizzle-orm';

const REMINDER_INTERVAL_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[InvoiceOverdue] Email not configured — would send to ${to}: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@eslate.com',
    to,
    subject,
    html,
  });
}

async function outstandingBalance(invoiceId: string, total: number): Promise<number> {
  const paidRows = await db.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, invoiceId));
  const totalPaid = paidRows.reduce((s, p) => s + parseFloat(p.amount as string), 0);
  return Math.max(0, total - totalPaid);
}

async function sendOverdueReminder(inv: typeof invoices.$inferSelect, isFirstReminder: boolean): Promise<void> {
  const [student] = await db.select().from(students).where(eq(students.id, inv.studentId)).limit(1);
  if (!student) return;
  const contacts = await db.select().from(studentContacts).where(and(eq(studentContacts.studentId, student.id), eq(studentContacts.isPrimary, true))).limit(1);
  const toEmail = contacts[0]?.email;
  if (!toEmail) return;

  const [company] = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.id, inv.companyId)).limit(1);
  const total = parseFloat(inv.total as string);
  const outstanding = await outstandingBalance(inv.id, total);
  if (outstanding <= 0) return;

  const now = new Date();
  const daysOverdue = Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / MS_PER_DAY));

  const html = `
    <p>Hi ${contacts[0]?.name || 'Parent/Guardian'},</p>
    <p>${isFirstReminder ? 'This is a reminder that' : 'This is a follow-up reminder that'} invoice <strong>${inv.invoiceNumber}</strong> from ${company?.name || 'your tutoring provider'} is overdue${daysOverdue > 0 ? ` by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}` : ''}.</p>
    <p><strong>Outstanding balance:</strong> $${outstanding.toFixed(2)}<br>
    <strong>Original due date:</strong> ${inv.dueDate.toLocaleDateString('en-AU')}</p>
    <p>Please arrange payment as soon as possible. If you've already paid, please disregard this reminder.</p>
    <p>Regards,<br>${company?.name || 'eSlate'}</p>
  `;

  await sendEmail(toEmail, `Overdue: Invoice ${inv.invoiceNumber} — $${outstanding.toFixed(2)} due`, html);
  await db.update(invoices).set({ lastOverdueReminderAt: now }).where(eq(invoices.id, inv.id));
}

export async function checkOverdueInvoices(): Promise<void> {
  try {
    const now = new Date();

    // Invoices that just crossed their due date without being fully paid — flip to
    // "overdue" and notify the company admin(s), grouped so one notification covers all.
    const newlyDue = await db.select().from(invoices)
      .where(and(inArray(invoices.status, ['sent', 'partially_paid']), lt(invoices.dueDate, now)));

    const newlyOverdueByCompany: Record<string, number> = {};
    for (const inv of newlyDue) {
      const total = parseFloat(inv.total as string);
      const outstanding = await outstandingBalance(inv.id, total);
      if (outstanding <= 0) continue; // fully paid but status hadn't caught up yet

      await db.update(invoices).set({ status: 'overdue', updatedAt: new Date() }).where(eq(invoices.id, inv.id));
      newlyOverdueByCompany[inv.companyId] = (newlyOverdueByCompany[inv.companyId] ?? 0) + 1;

      if (!inv.remindersSuppressed) {
        await sendOverdueReminder(inv, true).catch(err => console.error(`[InvoiceOverdue] First reminder failed for ${inv.invoiceNumber}:`, err));
      }
    }

    for (const [companyId, count] of Object.entries(newlyOverdueByCompany)) {
      const adminRows = await db.select({ userId: companyAdmins.userId }).from(companyAdmins).where(eq(companyAdmins.companyId, companyId));
      for (const admin of adminRows) {
        await db.insert(inAppNotifications).values({
          userId: admin.userId,
          companyId,
          type: 'invoice_overdue',
          title: `${count} invoice${count === 1 ? '' : 's'} became overdue today`,
          message: `${count} invoice${count === 1 ? '' : 's'} passed ${count === 1 ? 'its' : 'their'} due date without full payment and ${count === 1 ? 'has' : 'have'} been marked overdue.`,
          data: { count },
        });
      }
    }

    // Invoices already overdue — send a follow-up every REMINDER_INTERVAL_DAYS.
    const alreadyOverdue = await db.select().from(invoices)
      .where(and(eq(invoices.status, 'overdue'), eq(invoices.remindersSuppressed, false)));

    for (const inv of alreadyOverdue) {
      if (!inv.lastOverdueReminderAt) continue; // handled above as newly-overdue, or reminder failed — leave for next run
      const daysSinceLastReminder = Math.floor((now.getTime() - inv.lastOverdueReminderAt.getTime()) / MS_PER_DAY);
      if (daysSinceLastReminder < REMINDER_INTERVAL_DAYS) continue;
      await sendOverdueReminder(inv, false).catch(err => console.error(`[InvoiceOverdue] Follow-up reminder failed for ${inv.invoiceNumber}:`, err));
    }

    console.log(`[InvoiceOverdue] Check complete. ${newlyDue.length} newly overdue, ${alreadyOverdue.length} existing overdue reviewed for follow-up.`);
  } catch (err) {
    console.error('[InvoiceOverdue] Error during overdue check:', err);
  }
}

export function startInvoiceOverdueJob(): void {
  setTimeout(() => checkOverdueInvoices(), 40_000);
  setInterval(() => checkOverdueInvoices(), MS_PER_DAY);
  console.log('[InvoiceOverdue] Invoice overdue detection + reminder job scheduled (daily)');
}
