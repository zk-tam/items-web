export type StorageArea = "artists" | "items";

export type UploadedImage = {
  path: string;
  publicUrl: string;
};

export interface StorageProvider {
  publicUrl(path: string): string;
  uploadImage(area: StorageArea, file: File): Promise<UploadedImage>;
  remove(path: string): Promise<void>;
}
