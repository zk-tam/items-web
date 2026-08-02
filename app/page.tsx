import { SiteShell } from "@/components/layout/SiteShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { listProducts } from "@/lib/db/items-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();

  return (
    <SiteShell activeRoute="shop">
      <ProductGrid products={products} />
    </SiteShell>
  );
}
