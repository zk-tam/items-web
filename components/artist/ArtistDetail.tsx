import Image from "next/image";
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
  const hasSingleMedia = artist.media.length === 0;

  return (
    <article className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-2 lg:gap-0">
        <div className="-mx-7 overflow-hidden px-7 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className={`relative mx-auto w-full max-w-[620px] ${hasSingleMedia ? "lg:max-w-[calc((100vh-15.625rem)*0.8)]" : "lg:max-w-[calc((100vh-15.625rem)*0.656)]"}`}>
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
            <span aria-hidden className="items-plus-marker left-[-26px] top-1/2 -translate-y-1/2" />
            <span aria-hidden className="items-plus-marker right-[-26px] top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-9">
          <section className="space-y-7">
            <div className="space-y-1">
              <h1 className="text-[20px] font-heavy">{artist.name}</h1>
              <p className="text-[13px] font-heavy">{artist.role}</p>
            </div>
            {artist.bio && <p className="max-w-[640px] text-[13px] font-medium">{artist.bio}</p>}
          </section>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] font-heavy">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-items-blueHover" aria-label={`${artist.name} on Instagram`}>
                <Image src="/assets/instagram.svg" alt="" aria-hidden height={26} width={26} className="h-5 w-5" />
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
          <h2 className="text-[13px] font-heavy">More from {artist.name}</h2>
          <div className="mx-auto max-w-[620px]">
            <CatalogMediaGallery media={artist.media} label={`${artist.name} gallery`} />
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="space-y-8 border-t border-items-blue pt-9">
          <h2 className="text-[13px] font-heavy">Items by {artist.name}</h2>
          <ProductGrid products={products} />
        </section>
      )}
    </article>
  );
}
