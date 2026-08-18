import { requireAdmin } from "@/lib/auth/admin";
import { newsletterSubscribersCsv } from "@/lib/newsletter/csv";
import { listNewsletterSubscribers } from "@/lib/newsletter/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const subscribers = await listNewsletterSubscribers();
  const csv = newsletterSubscribersCsv(subscribers);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=items-newsletter-subscribers.csv",
      "Cache-Control": "no-store"
    }
  });
}
