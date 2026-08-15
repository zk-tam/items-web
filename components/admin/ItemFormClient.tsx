"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { ItemMediaUploader, type ItemMediaUploaderHandle } from "@/components/admin/ItemMediaUploader";
import { SeoFields } from "@/components/admin/SeoFields";
import type { ItemMediaKind } from "@/lib/admin/item-media";

type ArtistOption = {
  id: string;
  name: string;
  archivedAt: Date | string | null;
};

type ItemValues = {
  artistId: string;
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
  sortOrder: number;
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

export function ItemFormClient({ item, artists, existingMedia, action }: ItemFormClientProps) {
  const mediaUploaderRef = useRef<ItemMediaUploaderHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      const mediaOrder = await mediaUploaderRef.current?.prepareForSubmission() ?? "[]";
      const formData = new FormData(form);
      formData.set("mediaOrder", mediaOrder);
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
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Artist<select name="artistId" required defaultValue={item?.artistId} className="border border-items-blue bg-transparent p-3"><option value="">Select an artist</option>{artists.filter((artist) => !artist.archivedAt).map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></label>
        <label className="grid gap-1 font-bold">Category<input name="category" defaultValue={item?.category ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">Name<input name="name" required defaultValue={item?.name} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">URL handle<input name="slug" required defaultValue={item?.slug} className="border border-items-blue bg-transparent p-3" /><span className="text-xs font-normal">itemsyouwant.com/products/{item?.slug ?? "your-slug"}</span></label>
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
        <label className="grid gap-1 font-bold">Sort order<input name="sortOrder" type="number" min="0" defaultValue={item?.sortOrder ?? 0} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">WhatsApp message<input name="orderMessage" defaultValue={item?.orderMessage ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
      <ItemMediaUploader ref={mediaUploaderRef} existingMedia={existingMedia} />
      <label className="flex items-center gap-2 font-bold"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished ?? true} /> Published</label>
      {submitError ? <p role="alert" className="border border-red-600 p-3 text-sm font-bold text-red-700">{submitError}</p> : null}
      <button type="submit" disabled={isSaving} className="w-fit bg-items-blue px-5 py-3 font-black text-items-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Uploading media and saving…" : "Save item"}</button>
    </form>
  );
}
