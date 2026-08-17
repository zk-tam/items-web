export const MAX_ITEM_MEDIA = 30;
export const MAX_ITEM_MEDIA_ALT_LENGTH = 250;
export const MAX_ITEM_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_ITEM_VIDEO_BYTES = 500 * 1024 * 1024;

export const itemMediaMimeTypes = {
  "image/jpeg": { kind: "image", extension: "jpg", maxBytes: MAX_ITEM_IMAGE_BYTES },
  "image/png": { kind: "image", extension: "png", maxBytes: MAX_ITEM_IMAGE_BYTES },
  "image/webp": { kind: "image", extension: "webp", maxBytes: MAX_ITEM_IMAGE_BYTES },
  "image/gif": { kind: "image", extension: "gif", maxBytes: MAX_ITEM_IMAGE_BYTES },
  "video/mp4": { kind: "video", extension: "mp4", maxBytes: MAX_ITEM_VIDEO_BYTES }
} as const;

export type ItemMediaKind = "image" | "video";
export type ItemMediaMimeType = keyof typeof itemMediaMimeTypes;
export type CatalogMediaArea = "artists" | "items";

export type ItemMediaUploadRequest = {
  name: string;
  mimeType: string;
  size: number;
};

export type ItemMediaOrderEntry =
  | { kind: "existing"; id: string; altText: string | null }
  | { kind: "new"; storagePath: string; mediaType: ItemMediaKind; mimeType: ItemMediaMimeType; altText: string | null };

export function getItemMediaMimeType(value: string): ItemMediaMimeType | null {
  return Object.prototype.hasOwnProperty.call(itemMediaMimeTypes, value) ? value as ItemMediaMimeType : null;
}

export function isDirectItemMediaPath(path: string) {
  return isDirectCatalogMediaPath("items", path);
}

export function isDirectCatalogMediaPath(area: CatalogMediaArea, path: string) {
  return new RegExp(`^${area}\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(?:jpg|png|webp|gif|mp4)$`, "i").test(path);
}

export function validateItemMediaUploadRequest(value: unknown): ItemMediaUploadRequest & { mimeType: ItemMediaMimeType } {
  if (!value || typeof value !== "object") throw new Error("Media upload details are invalid.");
  const request = value as Record<string, unknown>;
  const name = typeof request.name === "string" ? request.name.trim() : "";
  const mimeType = typeof request.mimeType === "string" ? getItemMediaMimeType(request.mimeType) : null;
  const size = typeof request.size === "number" ? request.size : Number.NaN;

  if (!name || !mimeType || !Number.isSafeInteger(size) || size <= 0) {
    throw new Error("Media upload details are invalid.");
  }
  if (size > itemMediaMimeTypes[mimeType].maxBytes) {
    const label = itemMediaMimeTypes[mimeType].kind === "video" ? "MP4 videos" : "Images";
    const maximum = itemMediaMimeTypes[mimeType].maxBytes / (1024 * 1024);
    throw new Error(`${label} must be ${maximum} MB or smaller.`);
  }

  return { name, mimeType, size };
}
