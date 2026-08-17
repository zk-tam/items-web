"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  priority?: boolean;
  parallax?: boolean;
};

function MediaFigure({ entry, index, label, showCaption, priority = index === 0, parallax = false }: MediaFigureProps) {
  return (
    <figure className="relative overflow-visible">
      <div className="relative aspect-[4/5] overflow-hidden rounded-itemLg bg-items-placeholder">
        {entry.mediaType === "image" ? (
          <Image
            src={entry.src}
            alt={entry.alt}
            fill
            priority={priority}
            sizes="(max-width: 1023px) 86vw, 50vw"
            className={`object-cover${parallax ? " items-media-parallax" : ""}`}
          />
        ) : (
          <video src={entry.src} controls playsInline preload="metadata" className={`h-full w-full object-cover${parallax ? " items-media-parallax" : ""}`} aria-label={entry.alt || `${label} video ${index + 1}`} />
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
  const scrollEndTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(1);
  const slides = [
    { entry: media.at(-1)!, logicalIndex: media.length - 1, key: "loop-last" },
    ...media.map((entry, index) => ({ entry, logicalIndex: index, key: entry.id ?? entry.src })),
    { entry: media[0]!, logicalIndex: 0, key: "loop-first" }
  ];

  function scrollToSlide(index: number, behavior: ScrollBehavior = "smooth") {
    const scrollViewport = viewportRef.current;
    if (!scrollViewport) return;
    scrollViewport.scrollTo({ left: scrollViewport.clientWidth * index, behavior });
  }

  useEffect(() => {
    const scrollViewport = viewportRef.current;
    if (!scrollViewport) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToSlide(1, "auto");
      setActiveIndex(0);
      setActiveSlideIndex(1);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [media.length]);

  function normalizeLoopPosition() {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;

    const slideIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
    if (slideIndex === 0) {
      scrollToSlide(media.length, "auto");
      setActiveSlideIndex(media.length);
    } else if (slideIndex === media.length + 1) {
      scrollToSlide(1, "auto");
      setActiveSlideIndex(1);
    }
  }

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;
    const slideIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
    const logicalIndex = slideIndex === 0 ? media.length - 1 : slideIndex === media.length + 1 ? 0 : slideIndex - 1;
    setActiveIndex(logicalIndex);
    setActiveSlideIndex(slideIndex);

    if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = window.setTimeout(normalizeLoopPosition, 120);
  }

  function scrollBySlide(direction: "previous" | "next") {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: viewport.clientWidth * (direction === "next" ? 1 : -1),
      behavior: "smooth"
    });
  }

  return (
    <div aria-label={label} aria-roledescription="carousel" className="relative">
      <div ref={viewportRef} className="flex snap-x snap-mandatory overflow-x-hidden overflow-y-hidden touch-pan-y" onScroll={handleScroll}>
        {slides.map(({ entry, logicalIndex, key }, slideIndex) => (
          <div key={`${key}-${slideIndex}`} aria-hidden={slideIndex !== activeSlideIndex} className="w-full shrink-0 snap-start">
            <MediaFigure entry={entry} index={logicalIndex} label={label} showCaption={showCaptions} priority={slideIndex === 1} />
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <>
          <CarouselControl direction="previous" disabled={false} onClick={() => scrollBySlide("previous")} />
          <CarouselControl direction="next" disabled={false} onClick={() => scrollBySlide("next")} />
          <div aria-label="Carousel position" className="mt-3 flex justify-center gap-1">
            {media.map((entry, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={entry.id ?? entry.src}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Show image ${index + 1}`}
                  className="inline-flex h-5 w-5 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue"
                  onClick={() => scrollToSlide(index + 1)}
                  type="button"
                >
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full transition-[background-color,transform] duration-200 motion-reduce:transition-none ${isActive ? "scale-100 bg-items-blue" : "scale-75 bg-items-placeholder"}`} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StackedMediaGallery({
  media,
  label,
  showCaptions,
  scrollable = false
}: Pick<CatalogMediaGalleryProps, "media" | "label"> & { showCaptions: boolean; scrollable?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scrollable) return;

    const scrollViewport = viewportRef.current;
    if (!scrollViewport) return;
    const scrollArea: HTMLDivElement = scrollViewport;

    function updateParallax() {
      frameRef.current = null;
      const viewportBounds = scrollArea.getBoundingClientRect();
      const viewportCenter = viewportBounds.top + viewportBounds.height / 2;

      itemRefs.current.forEach((item) => {
        if (!item) return;

        const bounds = item.getBoundingClientRect();
        const itemCenter = bounds.top + bounds.height / 2;
        const progress = Math.max(-1, Math.min(1, (itemCenter - viewportCenter) / viewportBounds.height));
        item.style.setProperty("--items-media-parallax-y", `${Math.round(-progress * 18)}px`);
        item.style.setProperty("--items-media-parallax-scale", `${1.03 + (1 - Math.abs(progress)) * 0.025}`);
      });
    }

    function scheduleParallax() {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateParallax);
    }

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleParallax);
    scrollArea.addEventListener("scroll", scheduleParallax, { passive: true });
    resizeObserver?.observe(scrollArea);
    scheduleParallax();

    return () => {
      scrollArea.removeEventListener("scroll", scheduleParallax);
      resizeObserver?.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [media.length, scrollable]);

  return (
    <div ref={scrollable ? viewportRef : undefined} className={scrollable ? "grid h-full min-h-0 snap-y snap-proximity content-start gap-5 overflow-y-auto overscroll-contain pb-9 pr-3" : "grid gap-5"} aria-label={label}>
      {media.map((entry, index) => (
        <div key={entry.id ?? entry.src} ref={scrollable ? (element) => { itemRefs.current[index] = element; } : undefined} className={`relative${scrollable ? " snap-start" : ""}`}>
          <MediaFigure entry={entry} index={index} label={label} showCaption={showCaptions} parallax={scrollable} />
          {index === 0 && <><span aria-hidden className="items-plus-marker left-[-30px] top-[62%] lg:hidden" /><span aria-hidden className="items-plus-marker right-[-30px] top-[62%] lg:hidden" /></>}
        </div>
      ))}
    </div>
  );
}

export function CatalogMediaGallery({ media, label, emptyLabel, carousel = false, showCaptions = true }: CatalogMediaGalleryProps) {
  if (media.length === 0) {
    return emptyLabel ? <div className="aspect-[4/5] rounded-itemLg bg-items-placeholder" aria-label={emptyLabel} /> : null;
  }

  if (carousel) {
    return (
      <>
        <div className="lg:hidden">
          <CarouselMediaGallery media={media} label={label} showCaptions={showCaptions} />
        </div>
        <div className="hidden h-full min-h-0 lg:block">
          <StackedMediaGallery media={media} label={label} showCaptions={showCaptions} scrollable />
        </div>
      </>
    );
  }

  return <StackedMediaGallery media={media} label={label} showCaptions={showCaptions} />;
}
