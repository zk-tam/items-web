import { getOrderIdByPublicToken, getOrCreateOrderDocument } from "@/lib/admin/repository";
import { createOrderPdf } from "@/lib/documents/order-pdf";

export const runtime = "nodejs";

type CustomerInvoiceRouteProps = {
  params: Promise<{ token: string }>;
};

export async function GET(_: Request, { params }: CustomerInvoiceRouteProps) {
  const { token } = await params;
  const order = await getOrderIdByPublicToken(token);
  if (!order) return new Response("Not found", { status: 404 });

  try {
    const document = await getOrCreateOrderDocument(order.id, "invoice");
    const pdf = await createOrderPdf(document.snapshot);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.documentNumber}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Invoice could not be generated.", { status: 422 });
  }
}
