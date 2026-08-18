import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_OPT_OUT_COOKIE, ANALYTICS_VISITOR_COOKIE } from "@/lib/analytics/definitions";
import { analyticsCookieOptions } from "@/lib/analytics/server";

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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid preference" }, { status: 400 });
  }

  const enabled = typeof payload === "object" && payload !== null && (payload as Record<string, unknown>).enabled;
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid preference" }, { status: 400 });
  }

  const response = NextResponse.json({ enabled });
  if (enabled) {
    response.cookies.set(ANALYTICS_OPT_OUT_COOKIE, "", { ...analyticsCookieOptions, maxAge: 0 });
  } else {
    response.cookies.set(ANALYTICS_OPT_OUT_COOKIE, "1", analyticsCookieOptions);
    response.cookies.set(ANALYTICS_VISITOR_COOKIE, "", { ...analyticsCookieOptions, maxAge: 0 });
  }
  return response;
}
