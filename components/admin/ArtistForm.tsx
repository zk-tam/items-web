"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { ItemMediaUploader, type ItemMediaUploaderHandle } from "@/components/admin/ItemMediaUploader";
import { SeoFields } from "@/components/admin/SeoFields";
import type { ItemMediaKind } from "@/lib/admin/item-media";
import type { AdminArtist } from "@/lib/admin/repository";

type ArtistFormProps = {
  artist?: AdminArtist;
  profileImageUrl?: string | null;
  existingMedia?: Array<{ id: string; storagePath: string; altText: string | null; mediaType: ItemMediaKind; mimeType: string; sortOrder: number; publicUrl: string }>;
  action: (formData: FormData) => void | Promise<void>;
};

function value(value: string | number | null | undefined) {
  return value ?? "";
}

function isRedirectError(error: unknown) {
  return Boolean(error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT"));
}

export function ArtistForm({ artist, profileImageUrl = null, existingMedia = [], action }: ArtistFormProps) {
  const links = artist?.links.map((link) => `${link.label} | ${link.url}`).join("\n") ?? "";
  const existingProfileImagePath = artist?.profileImagePath ?? "";
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(profileImageUrl);
  const [isNewImagePreview, setIsNewImagePreview] = useState(false);
  const [retainExistingImage, setRetainExistingImage] = useState(Boolean(existingProfileImagePath));
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const mediaUploaderRef = useRef<ItemMediaUploaderHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [artistName, setArtistName] = useState(artist?.name ?? "");
  const [artistDescription, setArtistDescription] = useState(artist?.description ?? "");

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  function selectProfileImage(file: File | null) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setIsNewImagePreview(false);
      setImagePreviewUrl(retainExistingImage ? profileImageUrl : null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size === 0 || file.size > 8 * 1024 * 1024) {
      setImageError("Use a JPEG, PNG, WebP, or GIF image smaller than 8 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (profileImageInputRef.current) profileImageInputRef.current.files = transfer.files;
    setImageError(null);
    setIsNewImagePreview(true);
    setImagePreviewUrl(objectUrl);
  }

  function handleProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    selectProfileImage(event.currentTarget.files?.[0] ?? null);
  }

  function clearSelectedImage() {
    if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    selectProfileImage(null);
    setImageError(null);
  }

  function removeProfileImage() {
    if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsNewImagePreview(false);
    setRetainExistingImage(false);
    setImagePreviewUrl(null);
    setImageError(null);
  }

  function handleProfileImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingImage(false);
    selectProfileImage(event.dataTransfer.files[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      const mediaOrder = await mediaUploaderRef.current?.prepareForSubmission() ?? "[]";
      const formData = new FormData(form);
      formData.set("artistMediaOrder", mediaOrder);
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) return;
      await mediaUploaderRef.current?.discardUploadedMedia().catch(() => undefined);
      setSubmitError(error instanceof Error ? error.message : "Artist could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-5">
      <input type="hidden" name="existingProfileImagePath" value={retainExistingImage ? existingProfileImagePath : ""} />
      <input type="hidden" name="previousProfileImagePath" value={existingProfileImagePath} />
      <label className="grid gap-1 font-bold">Name<input name="name" required value={artistName} onChange={(event) => setArtistName(event.currentTarget.value)} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">URL handle<input name="slug" required defaultValue={artist?.slug} className="border border-items-blue bg-transparent p-3" /><span className="text-xs font-normal">itemsart.com/artists/{artist?.slug ?? "your-slug"}</span></label>
      <label className="grid gap-1 font-bold">Role / subtitle<input name="role" defaultValue={value(artist?.role)} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Description<textarea name="description" rows={5} value={artistDescription} onChange={(event) => setArtistDescription(event.currentTarget.value)} className="border border-items-blue bg-transparent p-3" /></label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Email<input name="email" type="email" defaultValue={value(artist?.email)} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Website<input name="websiteUrl" type="url" defaultValue={value(artist?.websiteUrl)} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">Social links <span className="text-xs font-normal">One per line: https://… or Label | https://…</span><textarea name="socialLinks" rows={4} defaultValue={links} className="border border-items-blue bg-transparent p-3" /></label>
      <SeoFields
        seoTitle={artist?.seoTitle}
        seoDescription={artist?.seoDescription}
        urlPath={`/artists/${artist?.slug ?? "your-slug"}`}
        fallbackTitle={artistName || "Artist name"}
        fallbackDescription={artistDescription || "Artist description"}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-3">
          <input ref={profileImageInputRef} id="profile-image" name="profileImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleProfileImageChange} className="sr-only" />
          <div
            onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }}
            onDragLeave={() => setIsDraggingImage(false)}
            onDrop={handleProfileImageDrop}
            className={`grid gap-3 border-2 border-dashed p-4 ${isDraggingImage ? "border-items-blue bg-items-placeholder" : "border-items-blue"}`}
          >
            {imagePreviewUrl ? (
              <div className="grid gap-3 sm:grid-cols-[128px_1fr] sm:items-center">
                {/* Blob URLs from the selected file cannot be processed by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreviewUrl} alt={artist?.profileImageAlt || artist?.name || "Artist profile preview"} className="h-32 w-32 border border-items-blue object-cover" />
                <div className="grid gap-2">
                  <p className="font-bold">{isNewImagePreview ? "New profile image ready" : "Current profile image"}</p>
                  <p className="text-sm">Drop a replacement image here, or choose another file.</p>
                  <div className="flex flex-wrap gap-2">
                    <label htmlFor="profile-image" className="cursor-pointer border border-items-blue px-3 py-2 text-sm font-bold hover:bg-items-blue hover:text-items-white">Replace image</label>
                    {isNewImagePreview ? <button type="button" onClick={clearSelectedImage} className="border border-items-blue px-3 py-2 text-sm font-bold"><RotateCcw aria-hidden className="mr-1 inline h-4 w-4" />Reset</button> : null}
                    <button type="button" onClick={removeProfileImage} className="border border-red-600 px-3 py-2 text-sm font-bold text-red-700"><Trash2 aria-hidden className="mr-1 inline h-4 w-4" />Remove</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid justify-items-center gap-2 py-4 text-center">
                <ImagePlus aria-hidden className="h-7 w-7" />
                <p className="font-bold">Drop a profile image here</p>
                <p className="text-sm">JPEG, PNG, WebP, or GIF · up to 8 MB</p>
                <label htmlFor="profile-image" className="cursor-pointer border border-items-blue px-4 py-2 text-sm font-bold hover:bg-items-blue hover:text-items-white">Choose image</label>
              </div>
            )}
          </div>
          {imageError ? <p role="alert" className="border border-red-600 p-3 text-sm font-bold text-red-700">{imageError}</p> : null}
        </div>
        <label className="grid gap-1 font-bold">Profile-image alt text<input name="profileImageAlt" defaultValue={value(artist?.profileImageAlt)} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <ItemMediaUploader ref={mediaUploaderRef} area="artists" existingMedia={existingMedia} />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 font-bold">Display order <span className="text-xs font-normal">Optional. Lower numbers appear first; otherwise newest created content appears first.</span><input name="sortOrder" type="number" min="0" defaultValue={artist?.sortOrder ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="flex items-center gap-2 font-bold"><input name="isPublished" type="checkbox" defaultChecked={artist?.isPublished ?? true} /> Published</label>
        <label className="flex items-center gap-2 font-bold"><input name="initiallyExpanded" type="checkbox" defaultChecked={artist?.initiallyExpanded ?? false} /> Expand bio</label>
      </div>
      {submitError ? <p role="alert" className="border border-red-600 p-3 text-sm font-bold text-red-700">{submitError}</p> : null}
      <button type="submit" disabled={isSaving} className="w-fit bg-items-blue px-5 py-3 font-black text-items-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Uploading media and saving…" : "Save artist"}</button>
    </form>
  );
}
