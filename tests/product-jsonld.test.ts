import { describe, expect, it } from "vitest";
import { productJsonLd, serializeJsonLd } from "../lib/seo/product-jsonld";

describe("product JSON-LD", () => {
  it("uses the MYR price as the primary searchable product offer", () => {
    const structuredData = productJsonLd({
      slug: "item-name",
      name: "Item Name",
      artistName: "Artist Name",
      artistSlug: "artist-name",
      description: "Item description.",
      myrPriceCents: 120000,
      usdPriceCents: 25000,
      stockCount: 2,
      specs: [],
      size: "One size",
      media: [{ src: "/item.jpg", alt: "Item image", mediaType: "image", mimeType: "image/jpeg" }],
      orderMessage: "Hello"
    });

    expect(structuredData.offers).toMatchObject({
      price: 1200,
      priceCurrency: "MYR",
      availability: "https://schema.org/InStock"
    });
    expect(structuredData.image).toEqual(["https://itemsart.com/item.jpg"]);
  });

  it("escapes JSON-LD script content", () => {
    expect(serializeJsonLd({ name: "<script>" })).toBe('{"name":"\\u003cscript>"}');
  });
});
