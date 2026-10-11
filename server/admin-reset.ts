import 'dotenv/config';
import { createDatabase, migrateBackend } from './database';
import { hashPassword } from './auth';

// Credentials are read from temporary environment variables, never CLI arguments.
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_NEW_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_NEW_PASSWORD locally.');
}

const db = createDatabase();
try {
  await migrateBackend(db);
  const hash = hashPassword(password);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result]: any = await connection.execute(
      'UPDATE app_admins SET password_hash=?, active=1 WHERE email=?',
      [hash, email],
    );
    if (result.affectedRows !== 1) throw new Error('No administrator exists with that email address.');
    await connection.execute(
      'DELETE s FROM app_sessions s JOIN app_admins a ON a.id=s.admin_id WHERE a.email=?',
      [email],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  console.log('Administrator password reset. Remove ADMIN_NEW_PASSWORD from the environment now.');
} finally {
  await db.end();
}
