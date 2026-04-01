"use client";

import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type CarouselProps = {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  className?: string;
  /** Show dot indicators for navigation */
  showDots?: boolean;
  /** Label for accessibility */
  ariaLabel?: string;
};

export function Carousel({ children, options, className, showDots = true, ariaLabel = "Carousel" }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    // Use snap points for predictable paging by viewport
    dragFree: false,
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("reInit", () => setScrollSnaps(emblaApi.scrollSnapList()));
  }, [emblaApi, onSelect]);

  const scrollByViewport = useCallback(
    (direction: 1 | -1) => {
      if (!emblaApi) {
        return;
      }
      const snaps = emblaApi.scrollSnapList();
      const selected = emblaApi.selectedScrollSnap();
      // Estimate slides in view as difference between next/prev snap indices that change visibility
      // Fallback to 1 if unknown
      let group = 1;
      try {
        // Embla v8: slidesInView has no parameters
        const inView = emblaApi.slidesInView();
        if (inView && inView.length > 0) {
          group = Math.max(1, inView.length);
        }
      } catch {
        // ignore and use group = 1
      }

      const target =
        direction === 1
          ? Math.min(selected + group, snaps.length - 1)
          : Math.max(selected - group, 0);
      emblaApi.scrollTo(target);
    },
    [emblaApi],
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi],
  );

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !emblaApi) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if carousel or its children are focused
      if (!container.contains(document.activeElement)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByViewport(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByViewport(1);
      } else if (e.key === "Home") {
        e.preventDefault();
        emblaApi.scrollTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        emblaApi.scrollTo(scrollSnaps.length - 1);
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi, scrollByViewport, scrollSnaps.length]);

  const childCount = React.Children.count(children);
  // Only show dots if we have more items than visible and total is reasonable
  const shouldShowDots = showDots && scrollSnaps.length > 1 && scrollSnaps.length <= 10;

  return (
    <div 
      ref={containerRef}
      className={className ?? "relative"} 
      role="region" 
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4" role="list">
          {React.Children.map(children, (child, index) => (
            <div 
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_calc((100%_-_2rem)/3)] xl:flex-[0_0_calc((100%_-_2rem)/3)]"
              role="listitem"
              aria-label={`Slide ${index + 1} of ${childCount}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="absolute -top-14 right-0 flex items-center gap-2">
        {/* Dot indicators */}
        {shouldShowDots && (
          <div className="hidden sm:flex items-center gap-1.5 mr-2" role="tablist" aria-label="Slide navigation">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  index === selectedIndex
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <button
          aria-label="Previous slides"
          className={cn(
            "bg-background inline-flex items-center justify-center rounded-md border px-2 py-1.5 text-sm",
            "transition-colors hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[36px] min-w-[36px]"
          )}
          onClick={() => scrollByViewport(-1)}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next slides"
          className={cn(
            "bg-background inline-flex items-center justify-center rounded-md border px-2 py-1.5 text-sm",
            "transition-colors hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[36px] min-w-[36px]"
          )}
          onClick={() => scrollByViewport(1)}
          disabled={!canNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile dot indicators (below carousel) */}
      {shouldShowDots && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-4" role="tablist" aria-label="Slide navigation">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                index === selectedIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
