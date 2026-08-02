import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { queryRow } from "@/lib/db/postgres";
import { verifyPassword } from "@/lib/auth/password";

const SESSION_COOKIE = "items_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

export type AdminUser = {
  id: string;
  email: string;
};

type AdminLoginRow = AdminUser & {
  passwordHash: string;
  isActive: boolean;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const row = await queryRow<AdminLoginRow>(
    `select id, email, password_hash as "passwordHash", is_active as "isActive"
     from admin_users
     where email = $1
     limit 1`,
    [normalizedEmail]
  );

  if (!row || !row.isActive || !(await verifyPassword(password, row.passwordHash))) {
    return null;
  }

  return { id: row.id, email: row.email };
}

export async function createAdminSession(admin: AdminUser) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await queryRow(
    `insert into admin_sessions (admin_user_id, token_hash, expires_at)
     values ($1, $2, $3)
     returning id`,
    [admin.id, hashSessionToken(token), expiresAt]
  );
  await queryRow(`update admin_users set last_login_at = now() where id = $1 returning id`, [admin.id]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await queryRow<AdminUser>(
    `select user_row.id, user_row.email
     from admin_sessions session
     join admin_users user_row on user_row.id = session.admin_user_id
     where session.token_hash = $1
       and session.revoked_at is null
       and session.expires_at > now()
       and user_row.is_active = true
     limit 1`,
    [hashSessionToken(token)]
  );

  return session;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function revokeCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await queryRow(`update admin_sessions set revoked_at = now() where token_hash = $1 returning id`, [hashSessionToken(token)]);
  }

  cookieStore.delete(SESSION_COOKIE);
}
