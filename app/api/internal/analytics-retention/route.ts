import { NextRequest, NextResponse } from "next/server";
import { deleteExpiredAnalyticsPageViews } from "@/lib/analytics/repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedCount = await deleteExpiredAnalyticsPageViews();
    return NextResponse.json({ deletedCount });
  } catch (error) {
    console.error("Analytics retention could not complete.", error);
    return NextResponse.json({ error: "Analytics retention could not complete." }, { status: 500 });
  }
}
