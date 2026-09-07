import { db } from './db';
import { users } from '../shared/schema';

async function main() {
  const all = await db.select({
    role: users.role,
    firstName: users.firstName,
    lastName: users.lastName,
    email: users.email,
  }).from(users).orderBy(users.role, users.email);

  for (const u of all) {
    console.log(u.role.padEnd(15), `${u.firstName} ${u.lastName}`.padEnd(25), u.email);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
