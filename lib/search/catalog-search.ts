import type { CatalogArtist, CatalogItem, CatalogMedia } from "@/lib/catalog/types";

export type CatalogSearchResult = {
  id: string;
  type: "artist" | "item";
  href: string;
  name: string;
  description: string;
  thumbnail: string | null;
  thumbnailAlt: string;
};

const MAX_RESULTS = 12;

function normalizedText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function searchText(value: string | undefined) {
  return normalizedText(value ?? "");
}

function firstImage(media: CatalogMedia[]) {
  return media.find((entry) => entry.mediaType === "image")?.src ?? null;
}

function scoreMatch(query: string, name: string, description: string) {
  const normalizedName = searchText(name);
  const normalizedDescription = searchText(description);

  if (normalizedName.startsWith(query)) return 0;
  if (normalizedName.includes(query)) return 1;
  if (normalizedDescription.includes(query)) return 2;
  return null;
}

export function searchCatalog(
  query: string,
  artists: CatalogArtist[],
  items: CatalogItem[],
  limit = MAX_RESULTS
): CatalogSearchResult[] {
  const normalizedQuery = normalizedText(query);
  if (!normalizedQuery) return [];

  const matches: Array<CatalogSearchResult & { score: number; sortOrder: number }> = [];

  for (const artist of artists) {
    const description = artist.bio?.trim() || artist.role;
    const score = scoreMatch(normalizedQuery, artist.name, `${artist.role} ${description}`);
    if (score === null) continue;

    matches.push({
      id: artist.id ?? artist.slug,
      type: "artist",
      href: `/artists/${artist.slug}`,
      name: artist.name,
      description,
      thumbnail: artist.image ?? firstImage(artist.media),
      thumbnailAlt: artist.imageAlt ?? artist.name,
      score,
      sortOrder: artist.sortOrder ?? Number.MAX_SAFE_INTEGER
    });
  }

  for (const item of items) {
    const description = item.shortDescription?.trim() || item.description;
    const score = scoreMatch(normalizedQuery, item.name, `${item.artistName} ${description}`);
    if (score === null) continue;

    matches.push({
      id: item.id ?? item.slug,
      type: "item",
      href: `/products/${item.slug}`,
      name: item.name,
      description,
      thumbnail: firstImage(item.media),
      thumbnailAlt: item.media[0]?.alt ?? item.name,
      score,
      sortOrder: item.sortOrder ?? Number.MAX_SAFE_INTEGER
    });
  }

  return matches
    .sort((left, right) => left.score - right.score || left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .slice(0, limit)
    .map((result) => ({
      id: result.id,
      type: result.type,
      href: result.href,
      name: result.name,
      description: result.description,
      thumbnail: result.thumbnail,
      thumbnailAlt: result.thumbnailAlt
    }));
}
