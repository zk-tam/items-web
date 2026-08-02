import Image from "next/image";
import { Instagram } from "lucide-react";
import type { CatalogArtist as Artist, CatalogItem as Product } from "@/lib/catalog/types";
import { CatalogMediaGallery } from "@/components/catalog/CatalogMediaGallery";
import { getInstagramUrl, isInstagramUrl } from "@/lib/catalog/socials";
import { ProductGrid } from "@/components/product/ProductGrid";

type ArtistDetailProps = {
  artist: Artist;
  products: Product[];
};

export function ArtistDetail({ artist, products }: ArtistDetailProps) {
  const instagramUrl = getInstagramUrl(artist.links);
  const otherLinks = artist.links.filter((link) => !isInstagramUrl(link.href));

  return (
    <article className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-16">
        <div className="-mx-7 overflow-hidden px-7 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-itemLg bg-items-placeholder">
              {artist.image && (
                <Image
                  src={artist.image}
                  alt={artist.imageAlt ?? artist.name}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 86vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <span aria-hidden className="items-plus-marker left-[-30px] top-[62%]" />
            <span aria-hidden className="items-plus-marker right-[-30px] top-[62%]" />
          </div>
        </div>

        <div className="space-y-9 lg:pt-10">
          <section className="space-y-6">
            <h1 className="text-[44px] font-black leading-none lg:text-[48px]">{artist.name}</h1>
            <p className="max-w-[640px] text-[18px] font-black leading-tight lg:text-[22px]">{artist.role}</p>
            {artist.bio && <p className="max-w-[640px] text-[16px] font-bold leading-snug lg:text-[20px]">{artist.bio}</p>}
          </section>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[18px] font-black leading-none lg:text-[20px]">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-items-blueHover" aria-label={`${artist.name} on Instagram`}>
                <Instagram aria-hidden className="h-5 w-5" strokeWidth={1.9} />
                Instagram
              </a>
            )}
            {otherLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="hover:text-items-blueHover"
              >
                + {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {artist.media.length > 0 && (
        <section className="space-y-6 border-t border-items-blue pt-9">
          <h2 className="text-[22px] font-black leading-tight lg:text-[24px]">More from {artist.name}</h2>
          <div className="mx-auto max-w-[620px]">
            <CatalogMediaGallery media={artist.media} label={`${artist.name} gallery`} />
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="space-y-8 border-t border-items-blue pt-9">
          <h2 className="text-[22px] font-black leading-tight lg:text-[24px]">Items by {artist.name}</h2>
          <ProductGrid products={products} />
        </section>
      )}
    </article>
  );
}
