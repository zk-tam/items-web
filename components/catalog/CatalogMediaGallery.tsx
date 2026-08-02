import Image from "next/image";
import type { CatalogMedia } from "@/lib/catalog/types";

type CatalogMediaGalleryProps = {
  media: CatalogMedia[];
  label: string;
  emptyLabel?: string;
};

export function CatalogMediaGallery({ media, label, emptyLabel }: CatalogMediaGalleryProps) {
  if (media.length === 0) {
    return emptyLabel ? <div className="aspect-[4/5] rounded-itemLg bg-items-placeholder" aria-label={emptyLabel} /> : null;
  }

  return (
    <div className="grid gap-5" aria-label={label}>
      {media.map((entry, index) => (
        <figure key={entry.id ?? entry.src} className="relative overflow-visible">
          <div className="relative aspect-[4/5] overflow-hidden rounded-itemLg bg-items-placeholder">
            {entry.mediaType === "image" ? (
              <Image
                src={entry.src}
                alt={entry.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 1023px) 86vw, 50vw"
                className="object-cover"
              />
            ) : (
              <video src={entry.src} controls playsInline preload="metadata" className="h-full w-full object-cover" aria-label={entry.alt || `${label} video ${index + 1}`} />
            )}
          </div>
          {index === 0 ? <><span aria-hidden className="items-plus-marker left-[-30px] top-[62%]" /><span aria-hidden className="items-plus-marker right-[-30px] top-[62%]" /></> : null}
          {entry.alt ? <figcaption className="pt-2 text-sm font-bold">{entry.alt}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
