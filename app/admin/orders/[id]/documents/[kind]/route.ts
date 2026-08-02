import { getOrCreateOrderDocument } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { createOrderPdf } from "@/lib/documents/order-pdf";

export const runtime = "nodejs";

type DocumentRouteProps = {
  params: Promise<{ id: string; kind: string }>;
};

export async function GET(_: Request, { params }: DocumentRouteProps) {
  await requireAdmin();
  const { id, kind } = await params;
  if (kind !== "invoice" && kind !== "receipt") {
    return new Response("Not found", { status: 404 });
  }

  try {
    const document = await getOrCreateOrderDocument(id, kind);
    const pdf = createOrderPdf(document.snapshot);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.documentNumber}.pdf"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Document could not be generated.", { status: 422 });
  }
}
