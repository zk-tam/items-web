import { NextResponse } from "next/server";
import { grantMaintenanceAccess, isMaintenanceAccessCodeValid } from "@/lib/auth/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A passcode is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const passcode = typeof body === "object" && body !== null && "passcode" in body
    ? body.passcode
    : undefined;

  if (!isMaintenanceAccessCodeValid(passcode)) {
    return NextResponse.json({ error: "Incorrect access code." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  await grantMaintenanceAccess();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
