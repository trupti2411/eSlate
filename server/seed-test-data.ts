import { db } from './db';
import {
  users, tutoringCompanies, companyAdmins, tutors, students,
  academicYears, academicTerms, courses, classes, assignments,
  studentClassAssignments,
} from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const uid = () => crypto.randomUUID();
const password = await bcrypt.hash('password', 12);

const COMPANIES = [
  { name: 'BrightMinds Tutoring', state: 'NSW', email: 'admin@brightminds.com.au' },
  { name: 'EduEdge Academy',      state: 'VIC', email: 'admin@eduedge.com.au' },
  { name: 'SmartPath Learning',   state: 'QLD', email: 'admin@smartpath.com.au' },
  { name: 'Pinnacle Tutors',      state: 'WA',  email: 'admin@pinnacle.com.au' },
  { name: 'NextGen Education',    state: 'SA',  email: 'admin@nextgen.com.au' },
];

const SUBJECTS = ['Mathematics', 'English', 'Science'];

async function seedTestData() {
  console.log('Seeding test data...\n');

  for (const co of COMPANIES) {
    // Skip if already exists
    const existing = await db.select().from(tutoringCompanies).where(eq(tutoringCompanies.contactEmail, co.email)).limit(1);
    if (existing.length > 0) {
      console.log(`  Skipping ${co.name} — already exists`);
      continue;
    }

    // 1. Create company
    const companyId = uid();
    await db.insert(tutoringCompanies).values({
      id: companyId,
      name: co.name,
      contactEmail: co.email,
      state: co.state,
      isActive: true,
    });

    // 2. Create company admin user
    const adminUserId = uid();
    await db.insert(users).values({
      id: adminUserId,
      email: co.email,
      password,
      firstName: co.name.split(' ')[0],
      lastName: 'Admin',
      role: 'company_admin',
      isActive: true,
      isEmailVerified: true,
      authProvider: 'email',
    });
    await db.insert(companyAdmins).values({ id: uid(), userId: adminUserId, companyId });

    // 3. Create tutor
    const tutorUserId = uid();
    await db.insert(users).values({
      id: tutorUserId,
      email: `tutor@${co.email.split('@')[1]}`,
      password,
      firstName: 'Alex',
      lastName: 'Tutor',
      role: 'tutor',
      isActive: true,
      isEmailVerified: true,
      authProvider: 'email',
    });
    const tutorId = uid();
    await db.insert(tutors).values({ id: tutorId, userId: tutorUserId, companyId, isVerified: true, status: 'active' });

    // 4. Academic year + term
    const yearId = uid();
    await db.insert(academicYears).values({ id: yearId, companyId, yearNumber: 2026, name: '2026', isActive: true });

    const termId = uid();
    await db.insert(academicTerms).values({
      id: termId,
      academicYearId: yearId,
      companyId,
      name: 'Term 2 2026',
      startDate: new Date('2026-04-28'),
      endDate: new Date('2026-07-04'),
      isActive: true,
    });

    // 5. Courses & classes
    for (const subject of SUBJECTS) {
      const courseId = uid();
      await db.insert(courses).values({
        id: courseId,
        companyId,
        name: `${subject} Program`,
        description: `${subject} tutoring program`,
        status: 'active',
      });

      const classId = uid();
      await db.insert(classes).values({
        id: classId,
        termId,
        companyId,
        name: `${subject} - Saturday`,
        subject,
        tutorId,
        courseId,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '10:00',
        maxStudents: 10,
        isActive: true,
        status: 'active',
      });

      // 6. Students (3 per class)
      for (let i = 1; i <= 3; i++) {
        const stuEmail = `student${i}.${subject.toLowerCase().slice(0,4)}@${co.email.split('@')[1]}`;
        const stuUserId = uid();
        await db.insert(users).values({
          id: stuUserId,
          email: stuEmail,
          password,
          firstName: `Student${i}`,
          lastName: co.name.split(' ')[0],
          role: 'student',
          isActive: true,
          isEmailVerified: true,
          authProvider: 'email',
        });
        const studentId = uid();
        await db.insert(students).values({
          id: studentId,
          userId: stuUserId,
          companyId,
          classId,
          termId,
          yearId,
          gradeLevel: `Year ${6 + i}`,
          status: 'active',
        });
        await db.insert(studentClassAssignments).values({ id: uid(), studentId, classId });

        // 7. Assignments (2 per student per subject)
        for (let a = 1; a <= 2; a++) {
          await db.insert(assignments).values({
            id: uid(),
            title: `${subject} Assignment ${a}`,
            description: `Week ${a} ${subject} work`,
            submissionDate: new Date(`2026-07-${String(a * 7).padStart(2, '0')}`),
            companyId,
            createdBy: adminUserId,
            classId,
            subject,
            status: 'assigned',
            assignmentKind: 'file_upload',
            isActive: true,
          });
        }
      }
    }

    console.log(`  ✓ ${co.name} — admin: ${co.email} / password`);
  }

  console.log('\nTest seed complete.');
  process.exit(0);
}

seedTestData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
