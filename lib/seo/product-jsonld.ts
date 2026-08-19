import type { CatalogItem } from "@/lib/catalog/types";
import { siteUrl } from "../site-url";
import { itemPrices } from "../catalog/pricing";

export function productJsonLd(item: CatalogItem) {
  const prices = itemPrices(item);
  const price = prices.find((candidate) => candidate.currency === "MYR") ?? prices[0];
  const images = item.media
    .filter((media) => media.mediaType === "image")
    .map((media) => new URL(media.src, siteUrl).toString());

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description,
    sku: item.slug,
    brand: {
      "@type": "Brand",
      name: "ITEMS"
    },
    ...(images.length > 0 ? { image: images } : {}),
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/products/${item.slug}`,
            price: price.cents / 100,
            priceCurrency: price.currency,
            availability: item.stockCount === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition"
          }
        }
      : {})
  };
}

export function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
