import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getArtistBySlug, getProductBySlug } from "@/lib/db/items-repository";
import { itemMetadata } from "@/lib/seo/catalog-metadata";
import { productJsonLd, serializeJsonLd } from "@/lib/seo/product-jsonld";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found"
    };
  }

  return itemMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const artist = await getArtistBySlug(product.artistSlug);
  const structuredData = productJsonLd(product);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <SiteShell activeRoute="shop" detailHeader lockDesktopViewport>
        <ProductDetail product={product} artist={artist ?? undefined} />
      </SiteShell>
    </>
  );
}
