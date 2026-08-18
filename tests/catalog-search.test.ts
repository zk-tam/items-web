import { describe, expect, it } from "vitest";
import { searchCatalog } from "../lib/search/catalog-search";
import type { CatalogArtist, CatalogItem } from "../lib/catalog/types";

const artists: CatalogArtist[] = [
  {
    id: "artist-1",
    slug: "zz-liu",
    name: "ZZ Liu",
    role: "Multi-disciplinary Creative",
    bio: "A creator working across image and object.",
    image: "https://example.com/zz.jpg",
    media: [],
    links: [],
    sortOrder: 2
  }
];

const items: CatalogItem[] = [
  {
    id: "item-1",
    slug: "thunder-vase",
    name: "Thunder Incense Vase",
    artistName: "ZZ Liu",
    artistSlug: "zz-liu",
    description: "A sculptural vase made from rusted mild steel.",
    shortDescription: "A vase that brings thunder to your space.",
    specs: [],
    size: "One Size",
    media: [{ src: "https://example.com/thunder.jpg", alt: "Thunder vase", mediaType: "image", mimeType: "image/jpeg" }],
    orderMessage: "Hello",
    sortOrder: 1
  }
];

describe("catalog search", () => {
  it("finds artists and items by name or descriptive text", () => {
    expect(searchCatalog("zz", artists, items).map((result) => result.href)).toEqual(["/artists/zz-liu", "/products/thunder-vase"]);
    expect(searchCatalog("thunder", artists, items)[0]).toMatchObject({
      type: "item",
      name: "Thunder Incense Vase",
      description: "A vase that brings thunder to your space.",
      thumbnail: "https://example.com/thunder.jpg"
    });
  });

  it("returns matching text in name order before descriptive matches", () => {
    expect(searchCatalog("creative", artists, items)[0]).toMatchObject({ type: "artist", name: "ZZ Liu" });
    expect(searchCatalog("", artists, items)).toEqual([]);
  });
});
