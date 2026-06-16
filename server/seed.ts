import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding database...\n');

  const defaultPassword = await bcrypt.hash('password', 12);

  const existing = await db.select().from(users).where(eq(users.email, 'admin@eslate.com')).limit(1);
  if (existing.length > 0) {
    console.log('  Admin already exists — skipping');
  } else {
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email: 'admin@eslate.com',
      password: defaultPassword,
      firstName: 'eSlate',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      authProvider: 'email',
    });
    console.log('  Created: admin@eslate.com / password');
  }

  console.log('\nSeed complete.');
  console.log('  Platform admin: admin@eslate.com / password');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
