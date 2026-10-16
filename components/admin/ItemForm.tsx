import type { AdminArtistOption, AdminItem } from "@/lib/admin/repository";
import type { CatalogSaveFailure } from "@/lib/admin/catalog-save-result";
import { ItemFormClient } from "@/components/admin/ItemFormClient";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

type ItemFormProps = {
  item?: AdminItem;
  artists: AdminArtistOption[];
  action: (formData: FormData) => Promise<CatalogSaveFailure>;
};

export function ItemForm({ item, artists, action }: ItemFormProps) {
  const existingMedia = item?.media.map((media) => ({ ...media, publicUrl: getStoragePublicUrl(media.storagePath) })) ?? [];
  return <ItemFormClient item={item} artists={artists} existingMedia={existingMedia} action={action} />;
}
