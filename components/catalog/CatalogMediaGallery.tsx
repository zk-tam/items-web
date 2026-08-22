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
  autoPlayVideos?: boolean;
};

type MediaFigureProps = {
  entry: CatalogMedia;
  index: number;
  label: string;
  showCaption: boolean;
  priority?: boolean;
  parallax?: boolean;
  fillContainer?: boolean;
  muted?: boolean;
  autoPlayVideo?: boolean;
  isActive?: boolean;
};

function MediaFigure({
  entry,
  index,
  label,
  showCaption,
  priority = index === 0,
  parallax = false,
  fillContainer = false,
  muted = false,
  autoPlayVideo = false,
  isActive = true
}: MediaFigureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaClassName = `object-cover${parallax ? " items-media-parallax" : ""}${muted ? " items-media-muted" : " items-media-active"}`;
  const shouldAutoPlayVideo = autoPlayVideo && isActive && entry.mediaType === "video";

  useEffect(() => {
    if (entry.mediaType !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    if (!shouldAutoPlayVideo) {
      video.pause();
      return;
    }

    video.muted = true;
    const playAttempt = video.play();
    void playAttempt.catch(() => undefined);
  }, [entry.mediaType, entry.src, shouldAutoPlayVideo]);

  return (
    <figure className={`relative overflow-visible${fillContainer ? " h-full w-full" : ""}`}>
      <div className={`relative overflow-hidden rounded-itemLg bg-items-placeholder${fillContainer ? " h-full w-full" : " aspect-[4/5]"}`}>
        {entry.mediaType === "image" ? (
          <Image
            src={entry.src}
            alt={entry.alt}
            fill
            priority={priority}
            sizes="(max-width: 1023px) 86vw, 50vw"
            className={mediaClassName}
          />
        ) : (
          <video
            ref={videoRef}
            src={entry.src}
            autoPlay={shouldAutoPlayVideo}
            controls={!autoPlayVideo}
            loop={autoPlayVideo}
            muted={autoPlayVideo}
            playsInline
            preload={shouldAutoPlayVideo ? "auto" : "metadata"}
            className={`h-full w-full ${mediaClassName}`}
            aria-label={entry.alt || `${label} video ${index + 1}`}
          />
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
      className={`absolute ${direction === "next" ? "right-[calc(10%-20px)]" : "left-[calc(10%-20px)]"} top-1/2 z-10 h-[52px] w-[52px] -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden className="items-plus-marker left-0 top-0 scale-90" />
    </button>
  );
}

function getCarouselSlideStride(scrollViewport: HTMLDivElement) {
  const firstSlide = scrollViewport.firstElementChild;
  const secondSlide = firstSlide?.nextElementSibling;

  if (!(firstSlide instanceof HTMLElement)) return scrollViewport.clientWidth;

  return secondSlide instanceof HTMLElement
    ? secondSlide.offsetLeft - firstSlide.offsetLeft
    : firstSlide.offsetWidth;
}

function useDesktopGallery() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  return isDesktop;
}

function CarouselMediaGallery({ media, label, showCaptions, autoPlayVideos }: Pick<CatalogMediaGalleryProps, "media" | "label" | "autoPlayVideos"> & { showCaptions: boolean }) {
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
    scrollViewport.scrollTo({ left: getCarouselSlideStride(scrollViewport) * index, behavior });
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

    const slideIndex = Math.round(viewport.scrollLeft / getCarouselSlideStride(viewport));
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
    const slideIndex = Math.round(viewport.scrollLeft / getCarouselSlideStride(viewport));
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
      left: getCarouselSlideStride(viewport) * (direction === "next" ? 1 : -1),
      behavior: "smooth"
    });
  }

  return (
    <div aria-label={label} aria-roledescription="carousel" className="relative">
      <div className="relative">
        <div ref={viewportRef} className="items-carousel-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-[calc(10%+12px)] touch-auto" onScroll={handleScroll}>
          {slides.map(({ entry, logicalIndex, key }, slideIndex) => (
            <div key={`${key}-${slideIndex}`} aria-hidden={slideIndex !== activeSlideIndex} className="w-full shrink-0 snap-center">
              <MediaFigure
                entry={entry}
                index={logicalIndex}
                label={label}
                showCaption={showCaptions}
                priority={slideIndex === 1}
                muted={slideIndex !== activeSlideIndex}
                autoPlayVideo={autoPlayVideos}
                isActive={slideIndex === activeSlideIndex}
              />
            </div>
          ))}
        </div>
        {media.length > 1 && (
          <>
            <CarouselControl direction="previous" disabled={false} onClick={() => scrollBySlide("previous")} />
            <CarouselControl direction="next" disabled={false} onClick={() => scrollBySlide("next")} />
          </>
        )}
      </div>
      {media.length > 1 && (
        <div aria-label="Carousel position" className="mx-auto mt-3 flex w-fit items-center justify-center gap-[0.5px]">
          {media.map((entry, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={entry.id ?? entry.src}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Show image ${index + 1}`}
                className="inline-flex h-3.5 w-3.5 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue"
                onClick={() => scrollToSlide(index + 1)}
                type="button"
              >
                <span aria-hidden className={`h-1 w-1 rounded-full transition-[background-color,transform] duration-200 motion-reduce:transition-none ${isActive ? "scale-100 bg-items-blue" : "scale-75 bg-items-placeholder"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StackedMediaGallery({
  media,
  label,
  showCaptions,
  autoPlayVideos,
  scrollable = false
}: Pick<CatalogMediaGalleryProps, "media" | "label" | "autoPlayVideos"> & { showCaptions: boolean; scrollable?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasSingleMedia = media.length === 1;
  const mediaCardClassName = !scrollable
    ? ""
    : hasSingleMedia
      ? " h-full w-[min(100%,80cqh)] snap-start"
      : " h-[82cqh] w-[min(100%,65.6cqh)] snap-start";

  useEffect(() => {
    if (!scrollable) return;

    const scrollViewport = viewportRef.current;
    if (!scrollViewport) return;
    const scrollArea: HTMLDivElement = scrollViewport;

    function syncActiveImage() {
      const viewportBounds = scrollArea.getBoundingClientRect();
      let mostVisibleIndex = 0;
      let greatestVisibleHeight = -1;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        const bounds = item.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(bounds.bottom, viewportBounds.bottom) - Math.max(bounds.top, viewportBounds.top));

        if (visibleHeight > greatestVisibleHeight) {
          mostVisibleIndex = index;
          greatestVisibleHeight = visibleHeight;
        }
      });

      setActiveIndex((currentIndex) => currentIndex === mostVisibleIndex ? currentIndex : mostVisibleIndex);
    }

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
      syncActiveImage();
    }

    function scheduleParallax() {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateParallax);
    }

    function handleScroll() {
      syncActiveImage();
      scheduleParallax();
    }

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleParallax);
    scrollArea.addEventListener("scroll", handleScroll, { passive: true });
    scrollArea.addEventListener("scrollend", handleScroll, { passive: true });
    resizeObserver?.observe(scrollArea);
    scheduleParallax();

    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
      scrollArea.removeEventListener("scrollend", handleScroll);
      resizeObserver?.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [media.length, scrollable]);

  const gallery = (
    <div ref={scrollable ? viewportRef : undefined} className={scrollable ? "items-media-scroll grid h-full min-h-0 snap-y snap-mandatory content-start justify-items-center gap-4 overflow-y-auto overscroll-contain" : "grid gap-5"} aria-label={label}>
      {media.map((entry, index) => (
        <div key={entry.id ?? entry.src} ref={scrollable ? (element) => { itemRefs.current[index] = element; } : undefined} className={`relative${mediaCardClassName}`}>
          <MediaFigure
            entry={entry}
            index={index}
            label={label}
            showCaption={showCaptions}
            parallax={scrollable}
            fillContainer={scrollable}
            muted={scrollable && activeIndex !== index}
            autoPlayVideo={autoPlayVideos}
            isActive={!scrollable || activeIndex === index}
          />
        </div>
      ))}
    </div>
  );

  if (!scrollable) return gallery;

  return (
    <div className="items-media-viewport relative h-full min-h-0" data-single-media={hasSingleMedia || undefined}>
      {gallery}
      <span aria-hidden className="items-plus-marker items-media-marker-left -translate-y-1/2" />
      <span aria-hidden className="items-plus-marker items-media-marker-right -translate-y-1/2" />
    </div>
  );
}

export function CatalogMediaGallery({ media, label, emptyLabel, carousel = false, showCaptions = true, autoPlayVideos = false }: CatalogMediaGalleryProps) {
  const isDesktop = useDesktopGallery();

  if (media.length === 0) {
    return emptyLabel ? <div className="aspect-[4/5] rounded-itemLg bg-items-placeholder" aria-label={emptyLabel} /> : null;
  }

  if (carousel) {
    return (
      <>
        <div className="lg:hidden">
          <CarouselMediaGallery media={media} label={label} showCaptions={showCaptions} autoPlayVideos={autoPlayVideos && isDesktop === false} />
        </div>
        <div className="hidden h-full min-h-0 lg:block">
          <StackedMediaGallery media={media} label={label} showCaptions={showCaptions} autoPlayVideos={autoPlayVideos && isDesktop === true} scrollable />
        </div>
      </>
    );
  }

  return <StackedMediaGallery media={media} label={label} showCaptions={showCaptions} autoPlayVideos={autoPlayVideos} />;
}
