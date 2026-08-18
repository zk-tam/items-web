import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_OPT_OUT_COOKIE, ANALYTICS_VISITOR_COOKIE, extractExternalReferrerHost, isKnownCrawler, normalizeCountryCode, parseAnalyticsPageView } from "@/lib/analytics/definitions";
import { recordAnalyticsPageView } from "@/lib/analytics/repository";
import { analyticsCookieOptions, createAnalyticsVisitorToken, hashAnalyticsVisitorToken, isAnalyticsVisitorToken } from "@/lib/analytics/server";

export const runtime = "nodejs";

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (request.cookies.get(ANALYTICS_OPT_OUT_COOKIE)?.value === "1" || isKnownCrawler(request.headers.get("user-agent"))) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("Invalid analytics payload", { status: 400 });
  }

  const pageView = parseAnalyticsPageView(payload);
  if (!pageView) {
    return new NextResponse("Invalid analytics payload", { status: 400 });
  }

  const storedVisitorToken = request.cookies.get(ANALYTICS_VISITOR_COOKIE)?.value;
  const visitorToken = isAnalyticsVisitorToken(storedVisitorToken) ? storedVisitorToken : createAnalyticsVisitorToken();
  const createdVisitorToken = visitorToken !== storedVisitorToken;

  try {
    await recordAnalyticsPageView({
      eventId: pageView.eventId,
      visitorHash: hashAnalyticsVisitorToken(visitorToken),
      pagePath: pageView.path,
      referrerHost: pageView.isLanding ? extractExternalReferrerHost(pageView.referrer, request.nextUrl.hostname) : null,
      countryCode: normalizeCountryCode(request.headers.get("x-vercel-ip-country")),
      isLanding: pageView.isLanding
    });
  } catch (error) {
    console.error("Analytics page view could not be recorded.", error);
    return new NextResponse("Analytics temporarily unavailable", { status: 503 });
  }

  const response = new NextResponse(null, { status: 204 });
  if (createdVisitorToken) {
    response.cookies.set(ANALYTICS_VISITOR_COOKIE, visitorToken, analyticsCookieOptions);
  }
  return response;
}
