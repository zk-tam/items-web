import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductDetail } from "@/components/product/ProductDetail";
import { products } from "@/data/products";
import { getArtistBySlug, getProductBySlug } from "@/lib/db/items-repository";

export const runtime = "nodejs";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found"
    };
  }

  return {
    title: product.name,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const artist = await getArtistBySlug(product.artistSlug);

  return (
    <SiteShell activeRoute="shop">
      <ProductDetail product={product} artist={artist ?? undefined} />
    </SiteShell>
  );
}
