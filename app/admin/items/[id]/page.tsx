import Link from "next/link";
import { archiveItemAction, updateItemAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ItemForm } from "@/components/admin/ItemForm";
import { getAdminItem, listAdminArtists } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { notFound } from "next/navigation";

type ItemPageProps = { params: Promise<{ id: string }> };

export default async function EditItemPage({ params }: ItemPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [item, artists] = await Promise.all([getAdminItem(id), listAdminArtists()]);
  if (!item) notFound();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/items" className="font-bold underline">← Items</Link><h1 className="mb-8 mt-4 text-4xl font-black">Edit {item.name}</h1><ItemForm item={item} artists={artists} action={updateItemAction.bind(null, id)} />{!item.archivedAt ? <form action={archiveItemAction.bind(null, id)} className="mt-10"><button className="border border-red-600 px-4 py-2 font-black text-red-700">Archive item</button></form> : null}</main></>;
}
