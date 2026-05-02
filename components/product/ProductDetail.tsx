import type { Artist } from "@/data/artists";
import type { Product } from "@/data/products";
import { ArtistBio } from "@/components/artist/ArtistBio";
import { ProductImageStage } from "@/components/product/ProductImageStage";
import { WhatsappOrderButton } from "@/components/ui/WhatsappOrderButton";

type ProductDetailProps = {
  product: Product;
  artist?: Artist;
};

export function ProductDetail({ product, artist }: ProductDetailProps) {
  return (
    <article className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-16">
      <div className="-mx-7 overflow-hidden px-7 lg:mx-0 lg:overflow-visible lg:px-0">
        <ProductImageStage image={product.images[0]} />
      </div>

      <div className="space-y-10 lg:pt-10">
        <section className="space-y-7">
          <h1 className="text-[44px] font-black leading-none lg:text-[48px]">{product.name}</h1>
          <p className="max-w-[640px] text-[18px] font-bold leading-snug lg:text-[22px]">{product.description}</p>

          <ul className="space-y-2 text-[18px] font-bold leading-tight lg:text-[22px]">
            {product.specs.map((spec) => (
              <li key={spec}>+ {spec}</li>
            ))}
          </ul>

          <div className="space-y-5">
            <p className="text-[17px] font-bold leading-tight lg:text-[20px]">Size: {product.size}</p>
            <WhatsappOrderButton message={product.orderMessage} />
          </div>
        </section>

        <ArtistBio artist={artist} />
      </div>
    </article>
  );
}
