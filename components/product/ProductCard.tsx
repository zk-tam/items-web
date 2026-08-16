"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CatalogItem as Product } from "@/lib/catalog/types";
import { itemPriceLabels } from "@/lib/catalog/pricing";
import { PlusMinusIconButton } from "@/components/ui/PlusMinusIconButton";
import { ExpandableCardDetails } from "@/components/ui/ExpandableCardDetails";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const href = `/products/${product.slug}`;
  const media = product.media[0];
  const prices = itemPriceLabels(product);
  const shortDescription = product.shortDescription ?? (product.preview?.length ? undefined : product.description);
  const categoryAndSize = product.category && product.size
    ? `${product.category}: ${product.size}`
    : product.category ?? (product.size ? `Size: ${product.size}` : undefined);

  return (
    <article className="h-full">
      <div className="group flex h-full flex-col">
        <Link href={href} className="block" onFocus={() => router.prefetch(href)} onMouseEnter={() => router.prefetch(href)} prefetch>
          <div className="relative aspect-[4/5] overflow-hidden rounded-item bg-items-placeholder">
            {media?.mediaType === "image" && (
              <Image
                src={media.src}
                alt={media.alt}
                fill
                loading={priority ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
            {media?.mediaType === "video" && <video src={media.src} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-label={media.alt || `${product.name} video`} />}
          </div>
        </Link>

        <div className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pt-4 text-[16px] font-black leading-tight lg:min-h-[44px] lg:text-[12px]">
          <div className="min-w-0">
            <Link href={href} className="block hover:text-items-blueHover" onFocus={() => router.prefetch(href)} onMouseEnter={() => router.prefetch(href)} prefetch>
              {product.name} | {product.artistName}
            </Link>
            {prices.length > 0 && <p className="mt-1 text-[13px] font-medium lg:text-[10px]">{prices.join(" / ")}</p>}
          </div>
          <PlusMinusIconButton
            label={`${expanded ? "Collapse" : "Expand"} ${product.name} details`}
            onClick={() => setExpanded((current) => !current)}
            open={expanded}
          />
        </div>

        <ExpandableCardDetails open={expanded} className="text-[15px] font-bold leading-snug lg:text-[10px]">
          {shortDescription && <p>{shortDescription}</p>}
          {product.preview?.map((line) => <p key={line} className="mt-4">{line}</p>)}
          {categoryAndSize && <p className="mt-12">{categoryAndSize}</p>}
        </ExpandableCardDetails>
      </div>
    </article>
  );
}
