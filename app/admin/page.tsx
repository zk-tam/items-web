import Link from "next/link";
import { updateSiteMaintenanceModeAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listAdminArtists, listAdminItems, listAdminOrders } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { countNewsletterSubscribers } from "@/lib/newsletter/repository";
import { getSiteSettings } from "@/lib/site-settings/repository";

export const runtime = "nodejs";

type AdminHomePageProps = {
  searchParams: Promise<{ maintenance?: string | string[] }>;
};

export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const [admin, artists, items, orders, newsletterSubscribers, settings, params] = await Promise.all([
    requireAdmin(),
    listAdminArtists(),
    listAdminItems(),
    listAdminOrders(),
    countNewsletterSubscribers(),
    getSiteSettings(),
    searchParams
  ]);
  const cards = [
    { label: "Artists", count: artists.filter((artist) => !artist.archivedAt).length, href: "/admin/artists", action: "Manage artists" },
    { label: "Items", count: items.filter((item) => !item.archivedAt).length, href: "/admin/items", action: "Manage items" },
    { label: "Orders", count: orders.length, href: "/admin/orders", action: "Manage orders" },
    { label: "Newsletter", count: newsletterSubscribers, href: "/admin/newsletter", action: "View subscribers" }
  ];
  const maintenanceUpdated = params.maintenance === "enabled" || params.maintenance === "disabled";

  return (
    <>
      <AdminHeader admin={admin} />
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <h1 className="text-4xl font-black">Dashboard</h1>
        {maintenanceUpdated ? <p className="mt-6 border border-items-blue bg-items-blue px-4 py-3 font-black text-items-white">Maintenance mode {settings.maintenanceMode ? "enabled" : "disabled"}.</p> : null}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => <Link key={card.label} href={card.href} className="border border-items-blue p-6 hover:bg-items-blue hover:text-items-white"><p className="text-sm font-bold uppercase">{card.label}</p><p className="mt-4 text-5xl font-black">{card.count}</p><p className="mt-6 font-black">{card.action} →</p></Link>)}
        </div>
        <section className="mt-8 max-w-2xl border border-items-blue p-6">
          <p className="text-sm font-bold uppercase">Site availability</p>
          <h2 className="mt-2 text-2xl font-black">Maintenance mode</h2>
          <p className="mt-3 max-w-xl font-medium">{settings.maintenanceMode ? "The public storefront currently shows the maintenance screen. Admin tools remain available." : "The public storefront is currently live."}</p>
          <form action={updateSiteMaintenanceModeAction} className="mt-5">
            <input type="hidden" name="maintenanceMode" value={settings.maintenanceMode ? "disabled" : "enabled"} />
            <button className={settings.maintenanceMode ? "border border-items-blue px-5 py-3 font-black" : "bg-items-blue px-5 py-3 font-black text-items-white"} type="submit">
              {settings.maintenanceMode ? "Bring site live" : "Enable maintenance mode"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
