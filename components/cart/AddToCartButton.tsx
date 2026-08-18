"use client";

import type { CatalogItem } from "@/lib/catalog/types";
import { itemPriceLabels } from "@/lib/catalog/pricing";
import { useCartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ product }: { product: CatalogItem }) {
  const addItem = useCartStore((state) => state.addItem);
  const { openCart } = useCartDrawer();

  function handleAddToCart() {
    const thumbnail = product.media.find((entry) => entry.mediaType === "image");
    addItem({
      artistName: product.artistName,
      name: product.name,
      priceLabels: itemPriceLabels(product),
      slug: product.slug,
      thumbnail: thumbnail?.src ?? null,
      thumbnailAlt: thumbnail?.alt ?? product.name
    });
    openCart();
  }

  return (
    <Button className="h-11 w-full text-[13px] lg:h-10 lg:text-[13px]" onClick={handleAddToCart} type="button" variant="outline">
      Add to Cart
    </Button>
  );
}
