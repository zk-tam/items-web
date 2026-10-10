import { updateItemOrderAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ItemsManagement } from "@/components/admin/ItemsManagement";
import { listAdminItems } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

export const runtime = "nodejs";

type AdminItemsPageProps = { searchParams: Promise<{ order?: string }> };

export default async function AdminItemsPage({ searchParams }: AdminItemsPageProps) {
  const [admin, items, params] = await Promise.all([requireAdmin(), listAdminItems(), searchParams]);
  const itemEntries = items.map((item) => ({
    ...item,
    thumbnailUrl: item.thumbnailPath ? getStoragePublicUrl(item.thumbnailPath) : null
  }));

  return (
    <>
      <AdminHeader admin={admin} />
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <ItemsManagement items={itemEntries} orderSaved={params.order === "saved"} updateOrderAction={updateItemOrderAction} />
      </main>
    </>
  );
}
