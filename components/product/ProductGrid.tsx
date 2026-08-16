import type { CatalogItem as Product } from "@/lib/catalog/types";
import { ProductCard } from "@/components/product/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  const columns = Array.from({ length: 4 }, () => Array<{ product: Product; index: number }>());

  products.forEach((product, index) => {
    columns[index % columns.length].push({ product, index });
  });

  return (
    <main aria-label="Product catalog" className="grid gap-12 lg:grid-cols-4 lg:items-start lg:gap-x-7 lg:gap-y-0">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="contents lg:flex lg:flex-col lg:gap-12">
          {column.map(({ product, index }) => (
            <div key={product.slug} style={{ order: index }}>
              <ProductCard product={product} priority={index < 4} />
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
