import { db } from '../db';
import { assignmentAllocations, assignmentLibraryItems, students, inAppNotifications } from '../../shared/schema';
import { eq, and, inArray, lt, gt, isNull } from 'drizzle-orm';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;
const IN_PROGRESS_STATUSES = ['scheduled', 'assigned', 'in_progress'] as const;

export async function checkAssignmentDueDates(): Promise<void> {
  try {
    const now = new Date();

    // Due-soon: notify the student once, within 24h of the due date, while still not submitted.
    const dueSoonCutoff = new Date(now.getTime() + DUE_SOON_WINDOW_MS);
    const dueSoon = await db.select().from(assignmentAllocations)
      .where(and(
        inArray(assignmentAllocations.allocStatus, IN_PROGRESS_STATUSES as any),
        lt(assignmentAllocations.dueAt, dueSoonCutoff),
        gt(assignmentAllocations.dueAt, now),
        isNull(assignmentAllocations.dueSoonReminderAt),
      ));

    for (const alloc of dueSoon) {
      const [libItem] = await db.select({ title: assignmentLibraryItems.title }).from(assignmentLibraryItems).where(eq(assignmentLibraryItems.id, alloc.libraryItemId)).limit(1);
      const [student] = await db.select({ userId: students.userId }).from(students).where(eq(students.id, alloc.studentId)).limit(1);
      if (student) {
        await db.insert(inAppNotifications).values({
          userId: student.userId,
          companyId: alloc.companyId,
          type: 'assignment_due_soon',
          title: 'Assignment due soon',
          message: `"${libItem?.title ?? 'An assignment'}" is due ${alloc.dueAt.toLocaleDateString('en-AU', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}.`,
          data: { allocationId: alloc.id },
        });
      }
      await db.update(assignmentAllocations).set({ dueSoonReminderAt: now }).where(eq(assignmentAllocations.id, alloc.id));
    }

    // Overdue: flip status once so the marking queue / dashboards can filter on it,
    // and notify the company's admins that assignments are now overdue.
    const newlyOverdue = await db.select().from(assignmentAllocations)
      .where(and(
        inArray(assignmentAllocations.allocStatus, IN_PROGRESS_STATUSES as any),
        lt(assignmentAllocations.dueAt, now),
      ));

    const overdueByCompany: Record<string, number> = {};
    for (const alloc of newlyOverdue) {
      await db.update(assignmentAllocations).set({ allocStatus: 'overdue', updatedAt: now }).where(eq(assignmentAllocations.id, alloc.id));
      overdueByCompany[alloc.companyId] = (overdueByCompany[alloc.companyId] ?? 0) + 1;
    }

    const { companyAdmins } = await import('../../shared/schema');
    for (const [companyId, count] of Object.entries(overdueByCompany)) {
      const adminRows = await db.select({ userId: companyAdmins.userId }).from(companyAdmins).where(eq(companyAdmins.companyId, companyId));
      for (const admin of adminRows) {
        await db.insert(inAppNotifications).values({
          userId: admin.userId,
          companyId,
          type: 'assignment_overdue',
          title: `${count} assignment${count === 1 ? '' : 's'} became overdue`,
          message: `${count} allocation${count === 1 ? '' : 's'} passed ${count === 1 ? 'its' : 'their'} due date without a submission.`,
          data: { count },
        });
      }
    }

    console.log(`[AssignmentReminder] Check complete. ${dueSoon.length} due-soon reminders sent, ${newlyOverdue.length} allocations marked overdue.`);
  } catch (err) {
    console.error('[AssignmentReminder] Error during due-date check:', err);
  }
}

export function startAssignmentReminderJob(): void {
  setTimeout(() => checkAssignmentDueDates(), 50_000);
  setInterval(() => checkAssignmentDueDates(), MS_PER_DAY / 12); // every 2 hours — due-soon window is time-sensitive
  console.log('[AssignmentReminder] Assignment due-soon/overdue job scheduled (every 2h)');
}
