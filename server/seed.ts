import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const email = 'admin@eslate.com';
  const password = 'password';

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    console.log(`Admin user already exists (${email}), skipping.`);
  } else {
    await db.insert(users).values({
      email,
      password: hashed,
      firstName: 'eSlate',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      authProvider: 'email',
    });
    console.log(`Created admin user: ${email} / password`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
