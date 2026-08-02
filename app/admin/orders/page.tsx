import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listAdminOrders } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();
  const orders = await listAdminOrders();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase">Fulfilment</p><h1 className="text-4xl font-black">Orders</h1></div><Link href="/admin/orders/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New order</Link></div><div className="mt-8 overflow-x-auto border border-items-blue"><table className="w-full min-w-[800px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Created</th><th className="p-3" /></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{order.orderNumber}</td><td className="p-3">{order.customerName}</td><td className="p-3">{order.status.replaceAll("_", " ")}</td><td className="p-3">{order.paymentStatus}</td><td className="p-3">{new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(order.createdAt)}</td><td className="p-3 text-right"><Link href={`/admin/orders/${order.id}`} className="font-black underline">View</Link></td></tr>)}</tbody></table></div></main></>;
}
