"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CatalogMedia } from "@/lib/catalog/types";

type CatalogMediaGalleryProps = {
  media: CatalogMedia[];
  label: string;
  emptyLabel?: string;
  carousel?: boolean;
  showCaptions?: boolean;
};

type MediaFigureProps = {
  entry: CatalogMedia;
  index: number;
  label: string;
  showCaption: boolean;
};

function MediaFigure({ entry, index, label, showCaption }: MediaFigureProps) {
  return (
    <figure className="relative overflow-visible">
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
      {showCaption && entry.alt ? <figcaption className="pt-2 text-sm font-bold">{entry.alt}</figcaption> : null}
    </figure>
  );
}

function CarouselControl({ direction, disabled, onClick }: { direction: "previous" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={`${direction === "next" ? "Next" : "Previous"} image`}
      className={`absolute ${direction === "next" ? "right-[-30px]" : "left-[-30px]"} top-[62%] z-10 h-[52px] w-[52px] -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden className="items-plus-marker left-0 top-0" />
    </button>
  );
}

function CarouselMediaGallery({ media, label, showCaptions }: Pick<CatalogMediaGalleryProps, "media" | "label"> & { showCaptions: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToSlide(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ left: viewport.clientWidth * index, behavior: "smooth" });
    setActiveIndex(index);
  }

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;
    setActiveIndex(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }

  return (
    <div aria-label={label} aria-roledescription="carousel" className="relative">
      <div ref={viewportRef} className="flex snap-x snap-mandatory overflow-x-hidden overflow-y-hidden touch-pan-y scroll-smooth" onScroll={handleScroll}>
        {media.map((entry, index) => (
          <div key={entry.id ?? entry.src} aria-hidden={index !== activeIndex} className="w-full shrink-0 snap-start">
            <MediaFigure entry={entry} index={index} label={label} showCaption={showCaptions} />
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <>
          <CarouselControl direction="previous" disabled={activeIndex === 0} onClick={() => scrollToSlide(activeIndex - 1)} />
          <CarouselControl direction="next" disabled={activeIndex === media.length - 1} onClick={() => scrollToSlide(activeIndex + 1)} />
        </>
      )}
    </div>
  );
}

export function CatalogMediaGallery({ media, label, emptyLabel, carousel = false, showCaptions = true }: CatalogMediaGalleryProps) {
  if (media.length === 0) {
    return emptyLabel ? <div className="aspect-[4/5] rounded-itemLg bg-items-placeholder" aria-label={emptyLabel} /> : null;
  }

  if (carousel) {
    return <CarouselMediaGallery media={media} label={label} showCaptions={showCaptions} />;
  }

  return (
    <div className="grid gap-5" aria-label={label}>
      {media.map((entry, index) => (
        <div key={entry.id ?? entry.src} className="relative">
          <MediaFigure entry={entry} index={index} label={label} showCaption={showCaptions} />
          {index === 0 && <><span aria-hidden className="items-plus-marker left-[-30px] top-[62%]" /><span aria-hidden className="items-plus-marker right-[-30px] top-[62%]" /></>}
        </div>
      ))}
    </div>
  );
}
