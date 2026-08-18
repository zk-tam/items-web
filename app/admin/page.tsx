import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listAdminArtists, listAdminItems, listAdminOrders } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { countNewsletterSubscribers } from "@/lib/newsletter/repository";

export const runtime = "nodejs";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const [artists, items, orders, newsletterSubscribers] = await Promise.all([listAdminArtists(), listAdminItems(), listAdminOrders(), countNewsletterSubscribers()]);
  const cards = [
    { label: "Artists", count: artists.filter((artist) => !artist.archivedAt).length, href: "/admin/artists", action: "Manage artists" },
    { label: "Items", count: items.filter((item) => !item.archivedAt).length, href: "/admin/items", action: "Manage items" },
    { label: "Orders", count: orders.length, href: "/admin/orders", action: "Manage orders" },
    { label: "Newsletter", count: newsletterSubscribers, href: "/admin/newsletter", action: "View subscribers" }
  ];
  return (
    <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><h1 className="text-4xl font-black">Dashboard</h1><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Link key={card.label} href={card.href} className="border border-items-blue p-6 hover:bg-items-blue hover:text-items-white"><p className="text-sm font-bold uppercase">{card.label}</p><p className="mt-4 text-5xl font-black">{card.count}</p><p className="mt-6 font-black">{card.action} →</p></Link>)}</div></main></>
  );
}
