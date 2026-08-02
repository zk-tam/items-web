import type { AdminArtist, AdminItem } from "@/lib/admin/repository";
import { SeoFields } from "@/components/admin/SeoFields";

type ItemFormProps = {
  item?: AdminItem;
  artists: AdminArtist[];
  action: (formData: FormData) => void | Promise<void>;
};

function asMoney(cents: number | undefined) {
  return ((cents ?? 0) / 100).toFixed(2);
}

export function ItemForm({ item, artists, action }: ItemFormProps) {
  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Artist<select name="artistId" required defaultValue={item?.artistId} className="border border-items-blue bg-transparent p-3"><option value="">Select an artist</option>{artists.filter((artist) => !artist.archivedAt).map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></label>
        <label className="grid gap-1 font-bold">Category<input name="category" defaultValue={item?.category ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">Name<input name="name" required defaultValue={item?.name} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">URL handle<input name="slug" required defaultValue={item?.slug} className="border border-items-blue bg-transparent p-3" /><span className="text-xs font-normal">itemsyouwant.com/products/{item?.slug ?? "your-slug"}</span></label>
      <label className="grid gap-1 font-bold">Description<textarea name="description" required rows={5} defaultValue={item?.description} className="border border-items-blue bg-transparent p-3" /></label>
      <SeoFields
        seoTitle={item?.seoTitle}
        seoDescription={item?.seoDescription}
        urlPath={`/products/${item?.slug ?? "your-slug"}`}
        fallbackTitle={item?.name ?? "Item name"}
        fallbackDescription={item?.description ?? "Item description"}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Specs <span className="text-xs font-normal">One per line</span><textarea name="specs" rows={4} defaultValue={item?.specs.join("\n")} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Card preview <span className="text-xs font-normal">One line per paragraph</span><textarea name="preview" rows={4} defaultValue={item?.preview?.join("\n")} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-1 font-bold">Size<input name="size" defaultValue={item?.size ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Price (MYR)<input name="price" inputMode="decimal" defaultValue={asMoney(item?.priceCents)} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Stock count<input name="stockCount" type="number" min="0" defaultValue={item?.stockCount ?? 0} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Currency<input name="currency" maxLength={3} defaultValue={item?.currency ?? "MYR"} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Sort order<input name="sortOrder" type="number" min="0" defaultValue={item?.sortOrder ?? 0} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">WhatsApp message<input name="orderMessage" defaultValue={item?.orderMessage ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Add images<input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Image alt text<input name="imageAlt" defaultValue={item?.name ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      {item?.images.length ? <p className="text-sm font-bold">{item.images.length} image{item.images.length === 1 ? "" : "s"} already attached.</p> : null}
      <label className="flex items-center gap-2 font-bold"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished ?? true} /> Published</label>
      <button className="w-fit bg-items-blue px-5 py-3 font-black text-items-white">Save item</button>
    </form>
  );
}
