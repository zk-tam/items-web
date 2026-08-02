import Image from "next/image";
import type { CatalogMedia as ProductMedia } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type ProductImageStageProps = {
  media?: ProductMedia;
  className?: string;
};

export function ProductImageStage({ media, className }: ProductImageStageProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[620px]", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-itemLg bg-items-placeholder">
        {media?.mediaType === "image" && (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            loading="eager"
            sizes="(max-width: 768px) 86vw, 50vw"
            className="object-cover"
          />
        )}
        {media?.mediaType === "video" && <video src={media.src} controls playsInline preload="metadata" className="h-full w-full object-cover" aria-label={media.alt || "Product video"} />}
      </div>
      <span aria-hidden className="items-plus-marker left-[-30px] top-[62%]" />
      <span aria-hidden className="items-plus-marker right-[-30px] top-[62%]" />
    </div>
  );
}
