import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listAdminItems } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

export default async function AdminItemsPage() {
  const admin = await requireAdmin();
  const items = await listAdminItems();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase">Catalog</p><h1 className="text-4xl font-black">Items</h1></div><Link href="/admin/items/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New item</Link></div><div className="mt-8 overflow-x-auto border border-items-blue"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Item</th><th className="p-3">Artist</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">State</th><th className="p-3" /></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{item.name}<span className="ml-2 text-xs font-normal">/{item.slug}</span></td><td className="p-3">{item.artistName}</td><td className="p-3">{item.currency} {(item.priceCents / 100).toFixed(2)}</td><td className="p-3">{item.stockCount}</td><td className="p-3">{item.archivedAt ? "Archived" : item.isPublished ? "Published" : "Hidden"}</td><td className="p-3 text-right"><Link href={`/admin/items/${item.id}`} className="font-black underline">Edit</Link></td></tr>)}</tbody></table></div></main></>;
}
