import type { AdminArtist, AdminItem } from "@/lib/admin/repository";
import { ItemFormClient } from "@/components/admin/ItemFormClient";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

type ItemFormProps = {
  item?: AdminItem;
  artists: AdminArtist[];
  action: (formData: FormData) => void | Promise<void>;
};

export function ItemForm({ item, artists, action }: ItemFormProps) {
  const existingMedia = item?.media.map((media) => ({ ...media, publicUrl: getStoragePublicUrl(media.storagePath) })) ?? [];
  return <ItemFormClient item={item} artists={artists} existingMedia={existingMedia} action={action} />;
}
