import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <main aria-label="Product catalog" className="grid items-stretch gap-12 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} priority={index < 4} />
      ))}
    </main>
  );
}
