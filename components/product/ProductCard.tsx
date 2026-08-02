"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CatalogItem as Product } from "@/lib/catalog/types";
import { PlusMinusIconButton } from "@/components/ui/PlusMinusIconButton";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const image = product.images[0];
  const details = product.preview ?? [product.description, `Size: ${product.size}`];

  return (
    <article className="h-full">
      <div className="group flex h-full flex-col">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-item bg-items-placeholder">
            {image && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading={priority ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
          </div>
        </Link>

        <div className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pt-4 text-[16px] font-black leading-tight lg:min-h-[44px] lg:text-[12px]">
          <Link href={`/products/${product.slug}`} className="min-w-0 hover:text-items-blueHover">
            <span>
              {product.name} | {product.artistName}
            </span>
          </Link>
          <PlusMinusIconButton
            label={`${expanded ? "Collapse" : "Expand"} ${product.name} details`}
            onClick={() => setExpanded((current) => !current)}
            open={expanded}
          />
        </div>

        {expanded && (
          <div className="mt-3 border-y border-items-blue py-3 text-[15px] font-bold leading-snug lg:text-[10px]">
            {details.map((line) => (
              <p key={line} className="mb-4 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
