import Link from "next/link";
import { deleteDraftOrderAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { OrderShareLink } from "@/components/orders/OrderShareLink";
import { getAdminOrder } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { siteUrl } from "@/lib/site-url";
import { notFound } from "next/navigation";

type OrderPageProps = { params: Promise<{ id: string }> };

export default async function EditOrderPage({ params }: OrderPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const detail = await getAdminOrder(id);
  if (!detail) notFound();
  const { order, lines, documents } = detail;
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
  return (
    <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/orders" className="font-bold underline">← Orders</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase">Order</p><h1 className="text-4xl font-black">{order.orderNumber}</h1></div><div className="flex gap-3"><a href={`/admin/orders/${id}/documents/invoice`} className="border border-items-blue px-4 py-2 font-black">{documents.some((document) => document.kind === "invoice") ? "Download invoice" : "Generate invoice"}</a>{order.paymentStatus === "paid" ? <a href={`/admin/orders/${id}/documents/receipt`} className="bg-items-blue px-4 py-2 font-black text-items-white">{documents.some((document) => document.kind === "receipt") ? "Download receipt" : "Generate receipt"}</a> : null}</div></div>
      <section className="mt-8 border border-items-blue p-5"><h2 className="text-xl font-black">Line items</h2><div className="mt-4 grid gap-2">{lines.map((line) => <div key={line.id} className="flex flex-wrap justify-between gap-3 border-t border-items-blue pt-2 font-bold"><span>{line.quantity} × {line.itemName} <span className="font-normal">— {line.artistName}</span></span><span>MYR {(line.quantity * line.unitPriceCents / 100).toFixed(2)}</span></div>)}<div className="mt-2 flex justify-between border-t border-items-blue pt-3 text-lg font-black"><span>Total</span><span>MYR {(total / 100).toFixed(2)}</span></div></div></section>
      <OrderShareLink href={`${siteUrl}/orders/${order.publicToken}`} />
      <OrderUpdateForm order={order} />
      {order.status === "draft" && documents.length === 0 ? <form action={deleteDraftOrderAction.bind(null, id)} className="mt-10"><button className="border border-red-600 px-4 py-2 font-black text-red-700">Delete draft order</button></form> : null}
    </main></>
  );
}
