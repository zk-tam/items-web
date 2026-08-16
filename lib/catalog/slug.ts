export function decodeCatalogSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
