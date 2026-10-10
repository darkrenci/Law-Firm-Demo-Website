import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

export function createDatabase(env = process.env) {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!env[key]) throw new Error(`Missing server configuration: ${key}`);
  }
  return mysql.createPool({
    host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME, connectionLimit: 5,
    charset: 'utf8mb4', timezone: 'Z', dateStrings: true,
    multipleStatements: false, connectTimeout: 10000,
    ...(env.DB_SSL_CA_FILE ? { ssl: { ca: readFileSync(env.DB_SSL_CA_FILE, 'utf8'), rejectUnauthorized: true } } : {}),
  });
}

// Run explicitly before deployment; the runtime account need not have DDL privileges.
export async function migrateBackend(db: mysql.Pool) {
  await db.execute(`CREATE TABLE IF NOT EXISTS app_admins (
    id CHAR(36) PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
  await db.execute(`CREATE TABLE IF NOT EXISTS app_sessions (
    token_hash CHAR(64) PRIMARY KEY, admin_id CHAR(36) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES app_admins(id) ON DELETE CASCADE,
    INDEX (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
}
