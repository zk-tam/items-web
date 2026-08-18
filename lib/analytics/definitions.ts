export const ANALYTICS_VISITOR_COOKIE = "items_analytics_visitor";
export const ANALYTICS_OPT_OUT_COOKIE = "items_analytics_opt_out";
export const ANALYTICS_OPT_OUT_STORAGE_KEY = "items-analytics-opt-out";
export const ANALYTICS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 395;
export const ANALYTICS_RETENTION_MONTHS = 13;
export const ANALYTICS_TIME_ZONE = "Asia/Kuala_Lumpur";

export type AnalyticsPageViewInput = {
  eventId: string;
  path: string;
  isLanding: boolean;
  referrer: string | null;
};

export type AnalyticsDateRange = {
  from: Date;
  until: Date;
  fromDate: string;
  toDate: string;
};

const ANALYTICS_URL_ORIGIN = "https://itemsyouwant.com";
const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CRAWLER_PATTERN = /bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|prerender|lighthouse|pagespeed|headless|wget|curl/i;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function dateInAnalyticsTimeZone(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((candidate) => candidate.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function normalizeAnalyticsPath(value: unknown) {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return null;

  try {
    const url = new URL(value, ANALYTICS_URL_ORIGIN);
    if (url.origin !== ANALYTICS_URL_ORIGIN) return null;
    const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
    return path.length <= 1024 ? path : null;
  } catch {
    return null;
  }
}

export function isTrackablePublicPath(path: string) {
  return path === "/"
    || path === "/about"
    || path === "/shipping-returns"
    || path === "/artists"
    || /^\/artists\/[^/]+$/.test(path)
    || /^\/products\/[^/]+$/.test(path);
}

export function parseAnalyticsPageView(value: unknown): AnalyticsPageViewInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const path = normalizeAnalyticsPath(input.path);
  const eventId = typeof input.eventId === "string" && EVENT_ID_PATTERN.test(input.eventId) ? input.eventId : null;
  const isLanding = typeof input.isLanding === "boolean" ? input.isLanding : null;
  const referrer = typeof input.referrer === "string" && input.referrer.length <= 4096 ? input.referrer : null;

  if (!path || !isTrackablePublicPath(path) || !eventId || isLanding === null) return null;

  return {
    eventId,
    path,
    isLanding,
    referrer: isLanding ? referrer : null
  };
}

export function extractExternalReferrerHost(referrer: string | null, currentHost: string) {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const hostname = normalizeHostname(url.hostname);
    const currentHostname = normalizeHostname(currentHost.split(":")[0] ?? "");
    const siteHostname = "itemsyouwant.com";
    const isCurrentSite = hostname === currentHostname || hostname.endsWith(`.${currentHostname}`);
    const isItemsSite = hostname === siteHostname || hostname.endsWith(`.${siteHostname}`);
    return hostname && !isCurrentSite && !isItemsSite ? hostname : null;
  } catch {
    return null;
  }
}

export function isKnownCrawler(userAgent: string | null) {
  return Boolean(userAgent && CRAWLER_PATTERN.test(userAgent));
}

export function normalizeCountryCode(value: string | null) {
  const countryCode = value?.trim().toUpperCase() ?? "";
  return COUNTRY_CODE_PATTERN.test(countryCode) ? countryCode : null;
}

export function getAnalyticsDateRange(rawFrom?: string, rawTo?: string, now = new Date()): AnalyticsDateRange {
  const defaultTo = dateInAnalyticsTimeZone(now);
  const defaultFrom = addDays(defaultTo, -29);
  const fromDate = rawFrom && isValidDate(rawFrom) ? rawFrom : defaultFrom;
  const toDate = rawTo && isValidDate(rawTo) ? rawTo : defaultTo;

  if (fromDate > toDate || fromDate < addDays(toDate, -365)) {
    return getAnalyticsDateRange(undefined, undefined, now);
  }

  return {
    from: new Date(`${fromDate}T00:00:00+08:00`),
    until: new Date(`${addDays(toDate, 1)}T00:00:00+08:00`),
    fromDate,
    toDate
  };
}
