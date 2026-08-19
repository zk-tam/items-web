import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderListControls } from "@/components/admin/OrderListControls";
import { listAdminOrders } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

const orderStatuses = ["draft", "awaiting_payment", "processing", "shipped", "completed", "cancelled"] as const;
const sortingOptions = ["newest", "oldest", "updated"] as const;

type AdminOrdersPageProps = {
  searchParams: Promise<{ id?: string; status?: string; sort?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const status = orderStatuses.includes(params.status as (typeof orderStatuses)[number]) ? params.status as (typeof orderStatuses)[number] : undefined;
  const sort = sortingOptions.includes(params.sort as (typeof sortingOptions)[number]) ? params.sort as "newest" | "oldest" | "updated" : "newest";
  const id = params.id?.trim() ?? "";
  const orders = await listAdminOrders({ id, status, sort });
  const date = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" });

  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase">Fulfilment</p><h1 className="text-4xl font-black">Orders</h1></div><Link href="/admin/orders/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New order</Link></div>
    <OrderListControls id={id} sort={sort} status={status} />
    <p className="mt-4 text-sm font-bold text-items-blue">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>
    <div className="relative z-0 mt-3 overflow-x-auto border border-items-blue"><table className="w-full min-w-[940px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Created</th><th className="p-3">Updated</th><th className="p-3" /></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{order.orderNumber}</td><td className="p-3">{order.customerName}</td><td className="p-3">{order.status.replaceAll("_", " ")}</td><td className="p-3">{order.paymentStatus}</td><td className="p-3">{date.format(order.createdAt)}</td><td className="p-3">{date.format(order.updatedAt)}</td><td className="p-3 text-right"><Link href={`/admin/orders/${order.id}`} className="font-black underline">View</Link></td></tr>)}{orders.length === 0 ? <tr><td colSpan={7} className="p-8 text-center font-bold text-items-blue">No orders match these filters.</td></tr> : null}</tbody></table></div></main></>;
}
