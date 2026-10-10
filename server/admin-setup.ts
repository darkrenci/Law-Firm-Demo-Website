import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createDatabase, migrateBackend } from './database';
import { hashPassword } from './auth';

// Password is read from a temporary server environment variable, never a CLI argument.
const db = createDatabase();
try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD locally.');
  const hash = hashPassword(password);
  await migrateBackend(db);
  const [rows]: any = await db.execute('SELECT id FROM app_admins LIMIT 1');
  if (rows.length) throw new Error('An administrator already exists; refusing to overwrite credentials.');
  await db.execute('INSERT INTO app_admins (id,email,password_hash) VALUES (?,?,?)', [randomUUID(), email, hash]);
  console.log('Administrator created. Remove ADMIN_INITIAL_PASSWORD from the environment now.');
} finally { await db.end(); }
