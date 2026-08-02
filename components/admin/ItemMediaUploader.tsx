"use client";

import type { ChangeEvent, DragEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { ChevronLeft, ChevronRight, Film, ImagePlus, Trash2 } from "lucide-react";
import { discardUnattachedCatalogMediaAction, requestCatalogMediaUploadAction } from "@/app/admin/actions";
import { getItemMediaMimeType, itemMediaMimeTypes, MAX_ITEM_MEDIA, MAX_ITEM_MEDIA_ALT_LENGTH, type CatalogMediaArea, type ItemMediaKind } from "@/lib/admin/item-media";

type ExistingMedia = {
  id: string;
  storagePath: string;
  altText: string | null;
  mediaType: ItemMediaKind;
  mimeType: string;
  sortOrder: number;
  publicUrl: string;
};

type SignedUpload = {
  path: string;
  token: string;
  bucket: string;
  resumableEndpoint: string;
};

type NewMedia = {
  kind: "new";
  token: string;
  file: File;
  src: string;
  mediaType: ItemMediaKind;
  mimeType: string;
  altText: string;
  storagePath?: string;
  uploadTarget?: SignedUpload;
  progress: number;
  status: "queued" | "uploading" | "ready" | "error";
};

type MediaEntry =
  | { kind: "existing"; id: string; src: string; mediaType: ItemMediaKind; mimeType: string; altText: string }
  | NewMedia;

export type ItemMediaUploaderHandle = {
  prepareForSubmission: () => Promise<string>;
  discardUploadedMedia: () => Promise<void>;
};

function entryKey(entry: MediaEntry) {
  return entry.kind === "existing" ? entry.id : entry.token;
}

function serializeMediaOrder(entries: MediaEntry[]) {
  return JSON.stringify(entries.map((entry) => entry.kind === "existing"
    ? { kind: "existing", id: entry.id, altText: entry.altText }
    : entry.storagePath
      ? { kind: "new", storagePath: entry.storagePath, mediaType: entry.mediaType, mimeType: entry.mimeType, altText: entry.altText }
      : null
  ).filter(Boolean));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Media upload failed. Please try again.";
}

async function uploadWithTus(entry: NewMedia, target: SignedUpload, onProgress: (percentage: number) => void) {
  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(entry.file, {
      endpoint: target.resumableEndpoint,
      retryDelays: [0, 1_000, 3_000, 5_000, 10_000],
      headers: { "x-signature": target.token },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: target.bucket,
        objectName: target.path,
        contentType: entry.mimeType,
        cacheControl: "31536000"
      },
      onError: reject,
      onProgress: (uploaded, total) => onProgress(total > 0 ? Math.round((uploaded / total) * 100) : 0),
      onSuccess: () => resolve()
    });

    void upload.findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) upload.resumeFromPreviousUpload(previousUploads[0]);
        upload.start();
      })
      .catch(reject);
  });
}

type ItemMediaUploaderProps = {
  area?: CatalogMediaArea;
  existingMedia: ExistingMedia[];
};

export const ItemMediaUploader = forwardRef<ItemMediaUploaderHandle, ItemMediaUploaderProps>(function ItemMediaUploader({ area = "items", existingMedia }, ref) {
  const singular = area === "artists" ? "artist" : "item";
  const heading = area === "artists" ? "Artist gallery" : "Item media";
  const inputId = `${area}-media`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<MediaEntry[]>(() => existingMedia.map((media) => ({
    kind: "existing",
    id: media.id,
    src: media.publicUrl,
    mediaType: media.mediaType,
    mimeType: media.mimeType,
    altText: media.altText ?? ""
  })));

  useEffect(() => () => {
    for (const url of previewUrlsRef.current) URL.revokeObjectURL(url);
  }, []);

  function addFiles(selectedFiles: File[]) {
    setError(null);
    const accepted: File[] = [];
    for (const file of selectedFiles) {
      const mimeType = getItemMediaMimeType(file.type);
      if (!mimeType) {
        setError("Use JPEG, PNG, WebP, GIF, or MP4 files.");
        return;
      }
      if (file.size === 0 || file.size > itemMediaMimeTypes[mimeType].maxBytes) {
        const maximum = itemMediaMimeTypes[mimeType].maxBytes / (1024 * 1024);
        setError(`${itemMediaMimeTypes[mimeType].kind === "video" ? "MP4 videos" : "Images"} must be ${maximum} MB or smaller.`);
        return;
      }
      accepted.push(file);
    }

    const availableSlots = MAX_ITEM_MEDIA - entries.length;
    const filesToAdd = accepted.slice(0, Math.max(0, availableSlots));
    if (filesToAdd.length < accepted.length) {
      setError(`A ${singular} can have at most ${MAX_ITEM_MEDIA} media files.`);
    }
    if (filesToAdd.length === 0) return;

    setEntries((current) => [
      ...current,
      ...filesToAdd.map((file) => {
        const mimeType = getItemMediaMimeType(file.type)!;
        const src = URL.createObjectURL(file);
        previewUrlsRef.current.add(src);
        return {
          kind: "new" as const,
          token: `new-${crypto.randomUUID()}`,
          file,
          src,
          mediaType: itemMediaMimeTypes[mimeType].kind,
          mimeType,
          altText: "",
          progress: 0,
          status: "queued" as const
        };
      })
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function moveEntry(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= entries.length) return;
    setEntries((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  function removeEntry(index: number) {
    const removed = entries[index];
    if (!removed || (removed.kind === "new" && removed.status === "uploading")) return;
    if (removed.kind === "new") {
      URL.revokeObjectURL(removed.src);
      previewUrlsRef.current.delete(removed.src);
      if (removed.storagePath) void discardUnattachedCatalogMediaAction(area, [removed.storagePath]).catch(() => undefined);
    }
    setEntries((current) => current.filter((_, entryIndex) => entryIndex !== index));
  }

  function updateAltText(index: number, altText: string) {
    setEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, altText } : entry));
  }

  const prepareForSubmission = useCallback(async () => {
    const snapshot = entries;
    const waitingEntries = snapshot.filter((entry): entry is NewMedia => entry.kind === "new" && !entry.storagePath);
    if (waitingEntries.length === 0) return serializeMediaOrder(snapshot);

    const unsignedEntries = waitingEntries.filter((entry) => !entry.uploadTarget);
    const targetsByToken = new Map(waitingEntries.filter((entry) => entry.uploadTarget).map((entry) => [entry.token, entry.uploadTarget!]));
    try {
      if (unsignedEntries.length > 0) {
        const signedUploads = await requestCatalogMediaUploadAction(area, unsignedEntries.map((entry) => ({ name: entry.file.name, mimeType: entry.mimeType, size: entry.file.size })));
        if (signedUploads.length !== unsignedEntries.length) throw new Error("Some media files could not be authorized for upload.");
        for (const [index, entry] of unsignedEntries.entries()) targetsByToken.set(entry.token, signedUploads[index]);
      }

      const preparedEntries = snapshot.map((entry) => entry.kind === "new" && !entry.storagePath
        ? { ...entry, uploadTarget: targetsByToken.get(entry.token), status: "uploading" as const, progress: entry.progress || 0 }
        : entry
      );
      setEntries(preparedEntries);

      const jobs = preparedEntries.filter((entry): entry is NewMedia => entry.kind === "new" && !entry.storagePath);
      const pathsByToken = new Map<string, string>();
      let cursor = 0;
      await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, async () => {
        while (cursor < jobs.length) {
          const job = jobs[cursor++];
          if (!job?.uploadTarget) throw new Error("A media upload authorization is missing.");
          await uploadWithTus(job, job.uploadTarget, (progress) => {
            setEntries((current) => current.map((entry) => entry.kind === "new" && entry.token === job.token ? { ...entry, progress } : entry));
          });
          pathsByToken.set(job.token, job.uploadTarget.path);
        }
      }));

      const completedEntries = preparedEntries.map((entry) => entry.kind === "new" && pathsByToken.has(entry.token)
        ? { ...entry, storagePath: pathsByToken.get(entry.token), progress: 100, status: "ready" as const }
        : entry
      );
      setEntries(completedEntries);
      return serializeMediaOrder(completedEntries);
    } catch (uploadError) {
      setEntries((current) => current.map((entry) => entry.kind === "new" && !entry.storagePath ? { ...entry, status: "error" as const } : entry));
      setError(errorMessage(uploadError));
      throw uploadError;
    }
  }, [area, entries]);

  const discardUploadedMedia = useCallback(async () => {
    const paths = entries.filter((entry): entry is NewMedia => entry.kind === "new" && Boolean(entry.storagePath)).map((entry) => entry.storagePath!);
    if (paths.length > 0) await discardUnattachedCatalogMediaAction(area, paths);
  }, [area, entries]);

  useImperativeHandle(ref, () => ({ prepareForSubmission, discardUploadedMedia }), [discardUploadedMedia, prepareForSubmission]);

  return (
    <section className="grid gap-4" aria-labelledby={`${area}-media-heading`}>
      <input ref={fileInputRef} id={inputId} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" onChange={handleInputChange} className="sr-only" />
      <div>
        <h2 id={`${area}-media-heading`} className="font-bold">{heading}</h2>
        <p className="mt-1 text-sm">Add up to {MAX_ITEM_MEDIA} images, GIFs, or MP4 videos. Uploads go directly to storage; reorder with the arrows.{area === "items" ? " The first file is the product cover." : " Gallery media appears after the artist profile image."}</p>
      </div>
      <div
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`grid min-h-36 place-items-center border-2 border-dashed p-6 text-center transition-colors ${isDragging ? "border-items-blue bg-items-placeholder" : "border-items-blue"}`}
      >
        <div className="grid justify-items-center gap-2">
          <ImagePlus aria-hidden className="h-7 w-7" />
          <p className="font-bold">Drop media here</p>
          <p className="text-sm">Images and GIFs up to 8 MB · MP4 videos up to 500 MB</p>
          <label htmlFor={inputId} className="cursor-pointer border border-items-blue px-4 py-2 font-bold hover:bg-items-blue hover:text-items-white">Choose media</label>
        </div>
      </div>
      {error ? <p role="alert" className="border border-red-600 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      {entries.length > 0 ? (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <li key={entryKey(entry)} className="grid gap-3 border border-items-blue p-3">
              <div className="relative aspect-square overflow-hidden bg-items-placeholder">
                {entry.mediaType === "video" ? <video src={entry.src} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : (
                  // Blob previews cannot be processed by next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.src} alt={entry.altText || `${singular} image ${index + 1}`} className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 bg-items-white px-2 py-1 text-xs font-black">{index + 1}{index === 0 && area === "items" ? " · Cover" : ""}</span>
                {entry.mediaType === "video" ? <span className="absolute right-2 top-2 bg-items-blue p-1 text-items-white"><Film aria-label="Video" className="h-4 w-4" /></span> : null}
                {entry.kind === "new" ? <span className="absolute bottom-2 right-2 bg-items-blue px-2 py-1 text-xs font-black text-items-white">{entry.status === "uploading" ? `${entry.progress}%` : entry.status === "ready" ? "Uploaded" : entry.status === "error" ? "Retry upload" : "Ready"}</span> : null}
              </div>
              <label className="grid gap-1 text-sm font-bold">{entry.mediaType === "video" ? "Caption" : "Alt text"}<input value={entry.altText} maxLength={MAX_ITEM_MEDIA_ALT_LENGTH} onChange={(event) => updateAltText(index, event.currentTarget.value)} className="border border-items-blue bg-transparent p-2" /></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveEntry(index, -1)} disabled={index === 0 || (entry.kind === "new" && entry.status === "uploading")} aria-label={`Move media ${index + 1} earlier`} className="border border-items-blue p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft aria-hidden className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveEntry(index, 1)} disabled={index === entries.length - 1 || (entry.kind === "new" && entry.status === "uploading")} aria-label={`Move media ${index + 1} later`} className="border border-items-blue p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight aria-hidden className="h-4 w-4" /></button>
                <button type="button" onClick={() => removeEntry(index)} disabled={entry.kind === "new" && entry.status === "uploading"} aria-label={`Remove media ${index + 1}`} className="ml-auto border border-red-600 p-2 text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 aria-hidden className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ol>
      ) : <p className="border border-dashed border-items-blue p-4 text-sm">No {singular} media yet.</p>}
    </section>
  );
});
