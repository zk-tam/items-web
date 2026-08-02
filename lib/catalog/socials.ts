import type { CatalogArtistLink } from "@/lib/catalog/types";

export function isInstagramUrl(href: string) {
  try {
    const hostname = new URL(href).hostname.toLowerCase();
    return hostname === "instagram.com" || hostname.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

export function getInstagramUrl(links: CatalogArtistLink[]) {
  return links.find((link) => isInstagramUrl(link.href))?.href;
}
