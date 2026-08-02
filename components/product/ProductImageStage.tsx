import Image from "next/image";
import type { CatalogImage as ProductImage } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type ProductImageStageProps = {
  image?: ProductImage;
  className?: string;
};

export function ProductImageStage({ image, className }: ProductImageStageProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[620px]", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-itemLg bg-items-placeholder">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="eager"
            sizes="(max-width: 768px) 86vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      <span aria-hidden className="items-plus-marker left-[-30px] top-[62%]" />
      <span aria-hidden className="items-plus-marker right-[-30px] top-[62%]" />
    </div>
  );
}
