"use client";

import { useEffect, useRef, useState } from "react";
import { SeoFields } from "@/components/admin/SeoFields";
import type { AdminArtist } from "@/lib/admin/repository";

type ArtistFormProps = {
  artist?: AdminArtist;
  profileImageUrl?: string | null;
  action: (formData: FormData) => void | Promise<void>;
};

function value(value: string | number | null | undefined) {
  return value ?? "";
}

export function ArtistForm({ artist, profileImageUrl = null, action }: ArtistFormProps) {
  const links = artist?.links.map((link) => `${link.label} | ${link.url}`).join("\n") ?? "";
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(profileImageUrl);
  const [isNewImagePreview, setIsNewImagePreview] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

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
      setImagePreviewUrl(profileImageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setIsNewImagePreview(true);
    setImagePreviewUrl(objectUrl);
  }

  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <input type="hidden" name="existingProfileImagePath" value={artist?.profileImagePath ?? ""} />
      <label className="grid gap-1 font-bold">Name<input name="name" required defaultValue={artist?.name} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">URL handle<input name="slug" required defaultValue={artist?.slug} className="border border-items-blue bg-transparent p-3" /><span className="text-xs font-normal">itemsyouwant.com/artists/{artist?.slug ?? "your-slug"}</span></label>
      <label className="grid gap-1 font-bold">Role / subtitle<input name="role" defaultValue={value(artist?.role)} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Description<textarea name="description" rows={5} defaultValue={value(artist?.description)} className="border border-items-blue bg-transparent p-3" /></label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Email<input name="email" type="email" defaultValue={value(artist?.email)} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Website<input name="websiteUrl" type="url" defaultValue={value(artist?.websiteUrl)} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">Social links <span className="text-xs font-normal">One per line: https://… or Label | https://…</span><textarea name="socialLinks" rows={4} defaultValue={links} className="border border-items-blue bg-transparent p-3" /></label>
      <SeoFields
        seoTitle={artist?.seoTitle}
        seoDescription={artist?.seoDescription}
        urlPath={`/artists/${artist?.slug ?? "your-slug"}`}
        fallbackTitle={artist?.name ?? "Artist name"}
        fallbackDescription={artist?.description ?? artist?.role ?? "Artist description"}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-3">
          <label className="grid gap-1 font-bold">Profile image<input name="profileImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => selectProfileImage(event.currentTarget.files?.[0] ?? null)} className="border border-items-blue bg-transparent p-3" /></label>
          {imagePreviewUrl ? (
            <div className="grid w-fit gap-2">
              <p className="text-sm font-bold">{isNewImagePreview ? "New image preview" : "Current image"}</p>
              {/* Blob URLs from the selected file cannot be processed by next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreviewUrl} alt={artist?.profileImageAlt || artist?.name || "Artist profile preview"} className="h-40 w-40 border border-items-blue object-cover" />
            </div>
          ) : <p className="border border-dashed border-items-blue p-4 text-sm">No profile image selected.</p>}
        </div>
        <label className="grid gap-1 font-bold">Profile-image alt text<input name="profileImageAlt" defaultValue={value(artist?.profileImageAlt)} className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 font-bold">Sort order<input name="sortOrder" type="number" min="0" defaultValue={artist?.sortOrder ?? 0} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="flex items-center gap-2 font-bold"><input name="isPublished" type="checkbox" defaultChecked={artist?.isPublished ?? true} /> Published</label>
        <label className="flex items-center gap-2 font-bold"><input name="initiallyExpanded" type="checkbox" defaultChecked={artist?.initiallyExpanded ?? false} /> Expand bio</label>
      </div>
      <button className="w-fit bg-items-blue px-5 py-3 font-black text-items-white">Save artist</button>
    </form>
  );
}
