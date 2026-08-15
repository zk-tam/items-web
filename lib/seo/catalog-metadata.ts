import type { Metadata } from "next";
import type { CatalogArtist, CatalogItem } from "@/lib/catalog/types";
import { itemPriceLabels } from "../catalog/pricing";

function valueOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function artistMetadata(artist: CatalogArtist): Metadata {
  const title = valueOrFallback(artist.seoTitle, artist.name);
  const description = valueOrFallback(artist.seoDescription, artist.bio ?? artist.role);

  return {
    title,
    description,
    alternates: { canonical: `/artists/${artist.slug}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/artists/${artist.slug}`,
      images: artist.image ? [{ url: artist.image, alt: artist.imageAlt ?? artist.name }] : undefined
    },
    twitter: {
      card: artist.image ? "summary_large_image" : "summary",
      title,
      description,
      images: artist.image ? [artist.image] : undefined
    }
  };
}

export function itemMetadata(item: CatalogItem): Metadata {
  const title = valueOrFallback(item.seoTitle, item.name);
  const baseDescription = valueOrFallback(item.seoDescription, item.description);
  const prices = itemPriceLabels(item);
  const description = prices.length > 0 ? `${baseDescription}\nPrice: ${prices.join(" / ")}.` : baseDescription;
  const image = item.media.find((media) => media.mediaType === "image");

  return {
    title,
    description,
    alternates: { canonical: `/products/${item.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${item.slug}`,
      images: image ? [{ url: image.src, alt: image.alt }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.src] : undefined
    }
  };
}
