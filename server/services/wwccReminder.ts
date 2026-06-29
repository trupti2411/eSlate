import * as nodemailer from 'nodemailer';
import { db } from '../db';
import { tutors, users, tutoringCompanies, inAppNotifications } from '../../shared/schema';
import { eq, and, lte, isNotNull, sql } from 'drizzle-orm';

const REMINDER_THRESHOLDS_DAYS = [60, 30, 7, 0];

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[WWCC] Email not configured — would send to ${to}: ${subject}`);
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

export async function checkWwccExpiry(): Promise<void> {
  try {
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const expiringTutors = await db
      .select({
        tutorId: tutors.id,
        userId: tutors.userId,
        companyId: tutors.companyId,
        wwccExpiry: tutors.wwccExpiry,
        wwccNumber: tutors.wwccNumber,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: tutoringCompanies.name,
      })
      .from(tutors)
      .innerJoin(users, eq(tutors.userId, users.id))
      .leftJoin(tutoringCompanies, eq(tutors.companyId, tutoringCompanies.id))
      .where(
        and(
          isNotNull(tutors.wwccExpiry),
          lte(tutors.wwccExpiry, sixtyDaysFromNow),
          eq(tutors.status, 'active'),
          eq(users.isActive, true),
        )
      );

    for (const tutor of expiringTutors) {
      if (!tutor.wwccExpiry) continue;
      const days = daysUntil(tutor.wwccExpiry);

      // Only send at specific thresholds to avoid daily spam
      const isThreshold = REMINDER_THRESHOLDS_DAYS.some(t => t === days);
      if (!isThreshold) continue;

      const isExpired = days < 0;
      const subject = isExpired
        ? `WWCC Expired: ${tutor.firstName} ${tutor.lastName}`
        : `WWCC Expiring in ${days} day${days === 1 ? '' : 's'}: ${tutor.firstName} ${tutor.lastName}`;

      const urgency = isExpired ? 'has expired' : `expires in ${days} day${days === 1 ? '' : 's'}`;
      const html = `
        <p>Hello,</p>
        <p>This is a reminder that the Working With Children Check (WWCC) for <strong>${tutor.firstName} ${tutor.lastName}</strong> ${urgency}.</p>
        <p><strong>WWCC Number:</strong> ${tutor.wwccNumber || 'Not recorded'}<br>
        <strong>Expiry Date:</strong> ${tutor.wwccExpiry.toLocaleDateString('en-AU')}</p>
        <p>Please ensure this is renewed as soon as possible to maintain compliance.</p>
        <p>Regards,<br>eSlate Compliance System</p>
      `;

      // Send to tutor
      if (tutor.email) {
        await sendEmail(tutor.email, subject, html);
      }

      // Create in-app notification for tutor
      await db.insert(inAppNotifications).values({
        userId: tutor.userId,
        companyId: tutor.companyId || undefined,
        type: 'wwcc_expiry',
        title: isExpired ? 'WWCC Expired' : `WWCC Expiring Soon`,
        message: `Your WWCC ${urgency}. WWCC #${tutor.wwccNumber || 'unknown'} — expiry: ${tutor.wwccExpiry.toLocaleDateString('en-AU')}.`,
        data: { tutorId: tutor.tutorId, wwccExpiry: tutor.wwccExpiry, daysUntilExpiry: days },
      });

      console.log(`[WWCC] Reminder sent for tutor ${tutor.firstName} ${tutor.lastName} — ${urgency}`);
    }

    console.log(`[WWCC] Check complete. Processed ${expiringTutors.length} expiring WWCC records.`);
  } catch (err) {
    console.error('[WWCC] Error during WWCC expiry check:', err);
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startWwccReminderJob(): void {
  // Run once at startup (after a short delay to let db connect)
  setTimeout(() => checkWwccExpiry(), 30_000);

  // Then run every 24 hours
  setInterval(() => checkWwccExpiry(), MS_PER_DAY);

  console.log('[WWCC] WWCC expiry reminder job scheduled (daily)');
}
