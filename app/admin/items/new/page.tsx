import Link from "next/link";
import { createItemAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ItemForm } from "@/components/admin/ItemForm";
import { listAdminArtists } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewItemPage() {
  const admin = await requireAdmin();
  const artists = await listAdminArtists();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/items" className="font-bold underline">← Items</Link><h1 className="mb-8 mt-4 text-4xl font-black">New item</h1><ItemForm artists={artists} action={createItemAction} /></main></>;
}
