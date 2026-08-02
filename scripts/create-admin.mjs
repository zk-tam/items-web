#!/usr/bin/env node
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, PGSSLMODE } = process.env;

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters long.");
  process.exit(1);
}

const scrypt = promisify(scryptCallback);
const salt = randomBytes(16);
const derived = await scrypt(ADMIN_PASSWORD, salt, 64);
const passwordHash = `scrypt$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: PGSSLMODE === "require" || DATABASE_URL.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
});

await client.connect();
try {
  const result = await client.query(
    `insert into admin_users (email, password_hash)
     values ($1, $2)
     on conflict (email) do update set password_hash = excluded.password_hash, is_active = true
     returning email`,
    [ADMIN_EMAIL.trim().toLowerCase(), passwordHash]
  );
  console.log(`Admin ready: ${result.rows[0].email}`);
} finally {
  await client.end();
}
