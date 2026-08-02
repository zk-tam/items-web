export type StorageArea = "artists" | "items";

export type UploadedImage = {
  path: string;
  publicUrl: string;
};

export type SignedItemMediaUpload = {
  path: string;
  token: string;
  bucket: string;
  resumableEndpoint: string;
};

export interface StorageProvider {
  publicUrl(path: string): string;
  uploadImage(area: StorageArea, file: File): Promise<UploadedImage>;
  createSignedCatalogMediaUpload(area: StorageArea, mimeType: string): Promise<SignedItemMediaUpload>;
  remove(path: string): Promise<void>;
}
