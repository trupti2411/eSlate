import { db } from './db';
import { users, tutoringCompanies, companyAdmins } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function upsertUser(email: string, fields: Parameters<typeof db.insert>[0] extends { values: (v: infer V) => any } ? V : any) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`  User already exists: ${email} — skipping`);
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await db.insert(users).values({ ...fields, id });
  return id;
}

async function seed() {
  console.log('Seeding database...\n');

  const defaultPassword = await bcrypt.hash('password', 12);

  // ── 1. Platform admin ────────────────────────────────────────────────────────
  console.log('1. Platform admin');
  await upsertUser('admin@eslate.com', {
    email: 'admin@eslate.com',
    password: defaultPassword,
    firstName: 'eSlate',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    authProvider: 'email',
  });

  // ── 2. Tutoring company ──────────────────────────────────────────────────────
  console.log('\n2. Tutoring company — Homework and Study Academy');
  const companyId = 'fe80a24c-ad97-445f-8241-5ead71bccfd2';

  const existingCompany = await db
    .select()
    .from(tutoringCompanies)
    .where(eq(tutoringCompanies.id, companyId))
    .limit(1);

  if (existingCompany.length > 0) {
    console.log('  Company already exists — skipping');
  } else {
    await db.insert(tutoringCompanies).values({
      id: companyId,
      name: 'Homework and Study Academy',
      contactEmail: 'nish1882@outlook.com',
      contactPhone: '02 1234 5678',
      address: '22 Bruhn Circuit, Kellyville Ridge',
      state: 'NSW',
      isActive: true,
      tutorChatEnabled: true,
    });
    console.log('  Created: Homework and Study Academy');
  }

  // ── 3. Company admin (Nirav Shah / nish1882@outlook.com) ────────────────────
  console.log('\n3. Company admin — nish1882@outlook.com');
  const companyAdminId = 'e2127a4d-816f-425a-b070-bfacbc47287c';

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'nish1882@outlook.com'))
    .limit(1);

  let adminUserId: string;
  if (existingAdmin.length > 0) {
    console.log('  User already exists — skipping');
    adminUserId = existingAdmin[0].id;
  } else {
    await db.insert(users).values({
      id: companyAdminId,
      email: 'nish1882@outlook.com',
      password: defaultPassword,
      firstName: 'Nirav',
      lastName: 'Shah',
      role: 'company_admin',
      isActive: true,
      isEmailVerified: true,
      authProvider: 'email',
    });
    adminUserId = companyAdminId;
    console.log('  Created: nish1882@outlook.com / password');
  }

  // Link company admin to company
  const existingLink = await db
    .select()
    .from(companyAdmins)
    .where(eq(companyAdmins.userId, adminUserId))
    .limit(1);

  if (existingLink.length === 0) {
    await db.insert(companyAdmins).values({
      userId: adminUserId,
      companyId,
      permissions: ['manage_tutors', 'view_reports'],
    });
    console.log('  Linked to Homework and Study Academy');
  }

  console.log('\nSeed complete.\n');
  console.log('Login credentials:');
  console.log('  Platform admin : admin@eslate.com / password');
  console.log('  Company admin  : nish1882@outlook.com / password');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
