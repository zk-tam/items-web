import { SiteShell } from "@/components/layout/SiteShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductMenuItem } from "@/data/navigation";
import { listProducts } from "@/lib/db/items-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();
  const productMenuItems: ProductMenuItem[] = products.map((product) => ({
    name: product.name,
    href: `/products/${product.slug}`
  }));

  return (
    <SiteShell activeRoute="shop" productMenuExpanded productMenuItems={productMenuItems}>
      <ProductGrid products={products} />
    </SiteShell>
  );
}
