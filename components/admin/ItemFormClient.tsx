"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ItemMediaUploader, type ItemMediaUploaderHandle } from "@/components/admin/ItemMediaUploader";
import { SeoFields } from "@/components/admin/SeoFields";
import type { ItemMediaKind } from "@/lib/admin/item-media";
import { siteDisplayHost } from "@/lib/site-url";

type ArtistOption = {
  id: string;
  name: string;
  archivedAt: Date | string | null;
};

type ItemValues = {
  artistId: string;
  artists: Array<{ id: string; name: string; sortOrder: number }>;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  preview: string[] | null;
  specs: string[];
  size: string | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  myrPriceCents: number | null;
  usdPriceCents: number | null;
  stockCount: number;
  orderMessage: string | null;
  isPublished: boolean;
  sortOrder: number | null;
};

type ExistingMedia = {
  id: string;
  storagePath: string;
  altText: string | null;
  mediaType: ItemMediaKind;
  mimeType: string;
  sortOrder: number;
  publicUrl: string;
};

type ItemFormClientProps = {
  item?: ItemValues;
  artists: ArtistOption[];
  existingMedia: ExistingMedia[];
  action: (formData: FormData) => void | Promise<void>;
};

function asMoney(cents: number | null | undefined) {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);
}

function isRedirectError(error: unknown) {
  return Boolean(error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT"));
}

type SortableArtistRowProps = {
  artist: ArtistOption;
  index: number;
  onRemove: () => void;
};

function SortableArtistRow({ artist, index, onRemove }: SortableArtistRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artist.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className={`flex flex-wrap items-center gap-2 border border-items-blue px-3 py-2 ${isDragging ? "z-10 opacity-50" : ""}`}>
      <button type="button" {...attributes} {...listeners} className="touch-none border border-items-blue p-1" title="Drag to reorder" aria-label={`Drag ${artist.name} to reorder`}><GripVertical aria-hidden className="h-4 w-4" /></button>
      <span className="min-w-0 flex-1 font-bold">{index + 1}. {artist.name}</span>
      <button type="button" onClick={onRemove} className="border border-red-600 px-2 py-1 text-sm font-bold text-red-700" aria-label={`Remove ${artist.name}`}>Remove</button>
    </li>
  );
}

export function ItemFormClient({ item, artists, existingMedia, action }: ItemFormClientProps) {
  const mediaUploaderRef = useRef<ItemMediaUploaderHandle>(null);
  const [artistIds, setArtistIds] = useState(() => item?.artists.length ? item.artists.map((artist) => artist.id) : item?.artistId ? [item.artistId] : []);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const availableArtists = artists.filter((artist) => !artist.archivedAt);
  const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
  const selectedArtists = artistIds.flatMap((id) => {
    const artist = artistsById.get(id);
    return artist ? [artist] : [];
  });

  function addArtist(artistId: string) {
    if (!artistId || artistIds.includes(artistId)) return;
    setArtistIds((current) => [...current, artistId]);
  }

  function reorderArtists(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setArtistIds((current) => {
      const from = current.indexOf(String(active.id));
      const to = current.indexOf(String(over.id));
      if (from < 0 || to < 0) return current;
      return arrayMove(current, from, to);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (artistIds.length === 0) {
      setSubmitError("Choose at least one artist.");
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      const mediaOrder = await mediaUploaderRef.current?.prepareForSubmission();
      const formData = new FormData(form);
      if (mediaOrder !== null && mediaOrder !== undefined) formData.set("mediaOrder", mediaOrder);
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) return;
      setSubmitError(error instanceof Error ? error.message : "Item could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-5">
      <fieldset className="grid gap-3 border border-items-blue p-4">
        <legend className="px-1 font-bold">Artists <span className="text-xs font-normal">The first artist is shown first across the catalog.</span></legend>
        <input name="artistIds" type="hidden" value={JSON.stringify(artistIds)} />
        <label className="grid gap-1 font-bold">Add artist<select value="" onChange={(event) => addArtist(event.currentTarget.value)} className="border border-items-blue bg-transparent p-3"><option value="">Select an artist</option>{availableArtists.filter((artist) => !artistIds.includes(artist.id)).map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></label>
        {selectedArtists.length > 0 ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderArtists}><SortableContext items={artistIds} strategy={verticalListSortingStrategy}><ol className="grid gap-2" aria-label="Selected artists in display order">{selectedArtists.map((artist, index) => <SortableArtistRow key={artist.id} artist={artist} index={index} onRemove={() => setArtistIds((current) => current.filter((id) => id !== artist.id))} />)}</ol></SortableContext></DndContext> : <p className="text-sm font-medium">Choose at least one artist.</p>}
      </fieldset>
      <label className="grid gap-1 font-bold">Category<input name="category" defaultValue={item?.category ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Name<input name="name" required defaultValue={item?.name} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">URL handle<input name="slug" required defaultValue={item?.slug} className="border border-items-blue bg-transparent p-3" /><span className="text-xs font-normal">{siteDisplayHost}/products/{item?.slug ?? "your-slug"}</span></label>
      <label className="grid gap-1 font-bold">Description<textarea name="description" required rows={5} defaultValue={item?.description} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Short description <span className="text-xs font-normal">Shown when the item card is expanded</span><textarea name="shortDescription" rows={3} defaultValue={item?.shortDescription ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
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
        <label className="grid gap-1 font-bold">Price (MYR)<input name="myrPrice" inputMode="decimal" defaultValue={asMoney(item?.myrPriceCents)} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Price (USD)<input name="usdPrice" inputMode="decimal" defaultValue={asMoney(item?.usdPriceCents)} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Stock count<input name="stockCount" type="number" min="0" defaultValue={item?.stockCount ?? 0} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Display order <span className="text-xs font-normal">Optional. Lower numbers appear first; otherwise newest created content appears first.</span><input name="sortOrder" type="number" min="0" defaultValue={item?.sortOrder ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">WhatsApp message<input name="orderMessage" defaultValue={item?.orderMessage ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      <ItemMediaUploader ref={mediaUploaderRef} existingMedia={existingMedia} />
      <label className="flex items-center gap-2 font-bold"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished ?? true} /> Published</label>
      {submitError ? <p role="alert" className="border border-red-600 p-3 text-sm font-bold text-red-700">{submitError}</p> : null}
      <button type="submit" disabled={isSaving} className="w-fit bg-items-blue px-5 py-3 font-black text-items-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Saving item…" : "Save item"}</button>
    </form>
  );
}
