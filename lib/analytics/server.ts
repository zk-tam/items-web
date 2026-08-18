import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { ANALYTICS_COOKIE_MAX_AGE_SECONDS } from "@/lib/analytics/definitions";

const VISITOR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

function getAnalyticsHashSecret() {
  const secret = process.env.ANALYTICS_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ANALYTICS_HASH_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

export function createAnalyticsVisitorToken() {
  return randomBytes(32).toString("base64url");
}

export function isAnalyticsVisitorToken(value: unknown): value is string {
  return typeof value === "string" && VISITOR_TOKEN_PATTERN.test(value);
}

export function hashAnalyticsVisitorToken(token: string) {
  return createHmac("sha256", getAnalyticsHashSecret()).update(token).digest("hex");
}

export const analyticsCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: ANALYTICS_COOKIE_MAX_AGE_SECONDS,
  path: "/"
};
