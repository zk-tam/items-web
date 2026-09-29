import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const MAINTENANCE_ACCESS_COOKIE = "items_maintenance_access";
export const MAINTENANCE_ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function getMaintenanceAccessCode() {
  const value = process.env.MAINTENANCE_ACCESS_CODE;
  return value && value.length >= 16 ? value : null;
}

function safelyEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createMaintenanceAccessSignature(passcode: string) {
  return createHmac("sha256", passcode).update("items-maintenance-access:v1").digest("base64url");
}

export function isMaintenanceAccessCodeValid(value: unknown) {
  const configuredCode = getMaintenanceAccessCode();
  return typeof value === "string"
    && value.length <= 256
    && configuredCode !== null
    && safelyEqual(value, configuredCode);
}

export async function hasMaintenanceAccess() {
  const configuredCode = getMaintenanceAccessCode();
  const accessCookie = (await cookies()).get(MAINTENANCE_ACCESS_COOKIE)?.value;

  return configuredCode !== null
    && typeof accessCookie === "string"
    && safelyEqual(accessCookie, createMaintenanceAccessSignature(configuredCode));
}

export async function grantMaintenanceAccess() {
  const configuredCode = getMaintenanceAccessCode();
  if (!configuredCode) throw new Error("MAINTENANCE_ACCESS_CODE must be configured before maintenance access can be granted.");

  (await cookies()).set(MAINTENANCE_ACCESS_COOKIE, createMaintenanceAccessSignature(configuredCode), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAINTENANCE_ACCESS_COOKIE_MAX_AGE_SECONDS,
    path: "/"
  });
}
