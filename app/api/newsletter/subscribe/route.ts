import { NextRequest, NextResponse } from "next/server";
import { parseNewsletterEmail } from "@/lib/newsletter/definitions";
import { subscribeToNewsletter } from "@/lib/newsletter/repository";

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
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parseNewsletterEmail(payload && typeof payload === "object" ? (payload as { email?: unknown }).email : undefined);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email);
  } catch (error) {
    console.error("Newsletter subscription could not be recorded.", error);
    return NextResponse.json({ error: "Subscriptions are temporarily unavailable. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ success: true });
}
