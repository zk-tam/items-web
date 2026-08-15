import { describe, expect, it } from "vitest";
import { artistMetadata, itemMetadata } from "../lib/seo/catalog-metadata";

describe("catalog metadata", () => {
  it("uses configured artist SEO values and emits a canonical artist URL", () => {
    const metadata = artistMetadata({
      slug: "artist-name",
      name: "Artist Name",
      role: "Artist",
      seoTitle: "Artist Name — Works",
      seoDescription: "A concise artist description.",
      media: [],
      links: []
    });

    expect(metadata.title).toBe("Artist Name — Works");
    expect(metadata.description).toBe("A concise artist description.");
    expect(metadata.alternates).toEqual({ canonical: "/artists/artist-name" });
  });

  it("falls back to the item name and description when fields are blank", () => {
    const metadata = itemMetadata({
      slug: "item-name",
      name: "Item Name",
      artistName: "Artist Name",
      artistSlug: "artist-name",
      description: "Item description.",
      specs: [],
      size: "One size",
      media: [],
      orderMessage: "Hello"
    });

    expect(metadata.title).toBe("Item Name");
    expect(metadata.description).toBe("Item description.");
    expect(metadata.alternates).toEqual({ canonical: "/products/item-name" });
  });

  it("appends an item's price to the SEO and social-preview description", () => {
    const metadata = itemMetadata({
      slug: "item-name",
      name: "Item Name",
      artistName: "Artist Name",
      artistSlug: "artist-name",
      description: "Item description.",
      seoDescription: "Custom item description.",
      myrPriceCents: 120000,
      usdPriceCents: 25000,
      specs: [],
      size: "One size",
      media: [],
      orderMessage: "Hello"
    });

    expect(metadata.description).toBe("Custom item description.\nPrice: MYR 1200.00 / USD 250.00.");
    expect(metadata.openGraph?.description).toBe("Custom item description.\nPrice: MYR 1200.00 / USD 250.00.");
    expect(metadata.twitter?.description).toBe("Custom item description.\nPrice: MYR 1200.00 / USD 250.00.");
  });
});
