import "server-only";

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StorageArea, StorageProvider, UploadedImage } from "@/lib/storage/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

function storageConfig() {
  const url = process.env.SUPABASE_URL;
  // Supabase calls its current server-only credential a "Secret key". Keep the
  // legacy variable as a fallback so existing deployments do not break.
  const key = process.env.SUPABASE_STORAGE_SECRET_KEY ?? process.env.SUPABASE_STORAGE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "catalog-images";

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_STORAGE_SECRET_KEY are required for image uploads.");
  }

  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_STORAGE_SECRET_KEY must contain a server-only Supabase Secret key, not a publishable key. " +
      "A publishable key is subject to Storage row-level security and cannot authorize this app's custom pg admin sessions."
    );
  }

  return { url, key, bucket };
}

function publicUrl(baseUrl: string, bucket: string, path: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

export function getStoragePublicUrl(path: string) {
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const url = process.env.SUPABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "catalog-images";

  return url ? publicUrl(url, bucket, path) : path;
}

export class SupabaseStorageProvider implements StorageProvider {
  private readonly client: SupabaseClient;
  private readonly url: string;
  private readonly bucket: string;

  constructor() {
    const config = storageConfig();
    this.client = createClient(config.url, config.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    this.url = config.url;
    this.bucket = config.bucket;
  }

  publicUrl(path: string) {
    return getStoragePublicUrl(path);
  }

  async uploadImage(area: StorageArea, file: File): Promise<UploadedImage> {
    const extension = extensionsByMimeType[file.type];

    if (!extension) {
      throw new Error("Images must be JPEG, PNG, WebP, or GIF files.");
    }

    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      throw new Error("Images must be smaller than 8 MB.");
    }

    const path = `${area}/${randomUUID()}.${extension}`;
    const { error } = await this.client.storage.from(this.bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000"
    });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    return { path, publicUrl: this.publicUrl(path) };
  }

  async remove(path: string) {
    const { error } = await this.client.storage.from(this.bucket).remove([path]);

    if (error) {
      throw new Error(`Image removal failed: ${error.message}`);
    }
  }
}

let provider: StorageProvider | undefined;

export function getStorageProvider(): StorageProvider {
  provider ??= new SupabaseStorageProvider();
  return provider;
}
