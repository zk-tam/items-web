import Link from "next/link";
import { createOrderAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderForm } from "@/components/admin/OrderForm";
import { listItemOptions } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewOrderPage() {
  const admin = await requireAdmin();
  const items = await listItemOptions();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/orders" className="font-bold underline">← Orders</Link><h1 className="mb-8 mt-4 text-4xl font-black">New order</h1><OrderForm items={items} action={createOrderAction} /></main></>;
}
