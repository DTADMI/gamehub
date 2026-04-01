"use client";

import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useFlags } from "../contexts/FlagsContext";

type CarouselProps = {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  showDots?: boolean;
};

function BasicCarousel({ children, options, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollByViewport = useCallback(
    (direction: 1 | -1) => {
      if (!emblaApi) {
        return;
      }
      const snaps = emblaApi.scrollSnapList();
      const selected = emblaApi.selectedScrollSnap();
      let group = 1;
      try {
        const inView = emblaApi.slidesInView();
        if (inView && inView.length > 0) {
          group = Math.max(1, inView.length);
        }
      } catch {}

      const target =
        direction === 1
          ? Math.min(selected + group, snaps.length - 1)
          : Math.max(selected - group, 0);
      emblaApi.scrollTo(target);
    },
    [emblaApi],
  );

  return (
    <div className={className ?? "relative"}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {React.Children.map(children, (child) => (
            <div className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_calc((100%_-_2rem)/3)] xl:flex-[0_0_calc((100%_-_2rem)/3)]">
              {child}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -top-14 right-0 flex gap-2">
        <button
          aria-label="Previous"
          className="bg-background inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1 text-sm disabled:opacity-50"
          onClick={() => scrollByViewport(-1)}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next"
          className="bg-background inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1 text-sm disabled:opacity-50"
          onClick={() => scrollByViewport(1)}
          disabled={!canNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EnhancedCarousel({
  children,
  options,
  className,
  autoPlay = false,
  intervalMs = 5000,
  showDots = true,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slides = React.Children.toArray(children);

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
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!autoPlay || !emblaApi || slides.length < 2) {
      return;
    }

    intervalRef.current = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, emblaApi, intervalMs, slides.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        emblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        emblaApi.scrollNext();
      }
    },
    [emblaApi],
  );

  const onMouseEnter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!autoPlay || !emblaApi || slides.length < 2) {
      return;
    }
    intervalRef.current = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, intervalMs);
  }, [autoPlay, emblaApi, intervalMs, slides.length]);

  return (
    <div
      className={className ?? "relative group"}
      role="region"
      aria-label="Content carousel"
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {slides.map((child, index) => (
            <div
              key={`carousel-slide-${index}`}
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_calc((100%_-_2rem)/3)] xl:flex-[0_0_calc((100%_-_2rem)/3)] animate-fade-in-scale"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -top-14 right-0 flex gap-2">
        <button
          aria-label="Previous"
          className="bg-background inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1 text-sm shadow-sm disabled:opacity-50"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next"
          className="bg-background inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1 text-sm shadow-sm disabled:opacity-50"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {showDots && slides.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2" aria-label="Carousel pagination">
          {slides.map((_, index) => (
            <button
              key={`carousel-dot-${index}`}
              type="button"
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        Slide {selectedIndex + 1} of {slides.length}
      </p>
    </div>
  );
}

export function Carousel(props: CarouselProps) {
  const { flags } = useFlags();
  if (flags.ui.enhancedCarousel) {
    return <EnhancedCarousel {...props} />;
  }
  return <BasicCarousel {...props} />;
}

export default Carousel;
