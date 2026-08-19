import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/auth/admin";

export function AdminHeader({ admin }: { admin: AdminUser }) {
  return (
    <header className="border-b border-items-blue px-6 py-5 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-2xl font-black">ITEMS ADMIN</Link>
          <p className="mt-1 text-xs font-bold text-items-blue">{admin.email}</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-black">
          <Link href="/admin/artists">Artists</Link>
          <Link href="/admin/items">Items</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/newsletter">Newsletter</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/settings">Settings</Link>
          <Link href="/">View site</Link>
          <form action={logoutAction}><button className="border border-items-blue px-3 py-1.5">Log out</button></form>
        </nav>
      </div>
    </header>
  );
}
