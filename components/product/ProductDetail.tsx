import type { CatalogArtist as Artist, CatalogItem as Product } from "@/lib/catalog/types";
import { ArtistBio } from "@/components/artist/ArtistBio";
import { CatalogMediaGallery } from "@/components/catalog/CatalogMediaGallery";
import { WhatsappOrderButton } from "@/components/ui/WhatsappOrderButton";
import { itemPriceLabels } from "@/lib/catalog/pricing";

type ProductDetailProps = {
  product: Product;
  artist?: Artist;
};

export function ProductDetail({ product, artist }: ProductDetailProps) {
  const prices = itemPriceLabels(product);

  return (
    <article className="grid gap-10 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-16">
      <div className="-mx-7 overflow-hidden px-7 lg:mx-0 lg:h-full lg:min-h-0 lg:overflow-visible lg:px-0">
        <div className="w-full lg:mx-auto lg:h-full lg:max-w-[calc((100vh-15.625rem)*0.8)]">
          <CatalogMediaGallery media={product.media} label={`${product.name} media`} emptyLabel="No product media" carousel showCaptions={false} />
        </div>
      </div>

      <div className="space-y-10 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pb-9 lg:pr-3 lg:pt-10">
        <section className="space-y-7">
          <div className="space-y-1">
            <h1 className="text-[20px] font-heavy">{product.name}</h1>
            {prices.length > 0 && <p className="text-[13px] font-heavy">{prices.join(" / ")}</p>}
          </div>
          <p className="max-w-[640px] text-[13px] font-medium">{product.description}</p>

          <ul className="space-y-2 text-[11px] font-medium">
            {product.specs.map((spec) => (
              <li key={spec}>+ {spec}</li>
            ))}
          </ul>

          <div className="space-y-5">
            <p className="text-[13px] font-medium">Size: {product.size}</p>
            <WhatsappOrderButton />
          </div>
        </section>

        <ArtistBio artist={artist} />
      </div>
    </article>
  );
}
