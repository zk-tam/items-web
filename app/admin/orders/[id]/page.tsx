import Link from "next/link";
import { deleteDraftOrderAction, updateOrderAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminOrder } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { notFound } from "next/navigation";

type OrderPageProps = { params: Promise<{ id: string }> };

const orderStatuses = ["draft", "awaiting_payment", "processing", "shipped", "completed", "cancelled"];
const paymentStatuses = ["unpaid", "paid", "refunded"];

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
      <form action={updateOrderAction.bind(null, id)} className="mt-8 grid max-w-3xl gap-5"><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1 font-bold">Customer name<input name="customerName" required defaultValue={order.customerName} className="border border-items-blue bg-transparent p-3" /></label><label className="grid gap-1 font-bold">Email<input name="customerEmail" type="email" defaultValue={order.customerEmail ?? ""} className="border border-items-blue bg-transparent p-3" /></label></div><label className="grid gap-1 font-bold">Phone<input name="customerPhone" defaultValue={order.customerPhone ?? ""} className="border border-items-blue bg-transparent p-3" /></label><label className="grid gap-1 font-bold">Shipping address<textarea name="shippingAddress" rows={3} defaultValue={order.shippingAddress ?? ""} className="border border-items-blue bg-transparent p-3" /></label><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1 font-bold">Order status<select name="status" defaultValue={order.status} className="border border-items-blue bg-transparent p-3">{orderStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label className="grid gap-1 font-bold">Payment status<select name="paymentStatus" defaultValue={order.paymentStatus} className="border border-items-blue bg-transparent p-3">{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div><label className="grid gap-1 font-bold">Shipment URL<textarea name="shipmentUrl" rows={2} defaultValue={order.shipmentUrl ?? ""} className="border border-items-blue bg-transparent p-3" /></label><label className="grid gap-1 font-bold">Internal notes<textarea name="notes" rows={4} defaultValue={order.notes ?? ""} className="border border-items-blue bg-transparent p-3" /></label><button className="w-fit bg-items-blue px-5 py-3 font-black text-items-white">Save order</button></form>
      {order.status === "draft" && documents.length === 0 ? <form action={deleteDraftOrderAction.bind(null, id)} className="mt-10"><button className="border border-red-600 px-4 py-2 font-black text-red-700">Delete draft order</button></form> : null}
    </main></>
  );
}
