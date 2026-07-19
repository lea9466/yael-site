"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PublicTestimonialSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

const CONTENT_PREVIEW_LENGTH = 220;

function TestimonialSlide({
  testimonial,
}: {
  testimonial: PublicTestimonialSummary;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.content.length > CONTENT_PREVIEW_LENGTH;
  const displayContent =
    expanded || !isLong
      ? testimonial.content
      : `${testimonial.content.slice(0, CONTENT_PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <blockquote className="mx-auto max-w-3xl space-y-5 text-center">
      <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--color-text)] sm:text-xl">
        &ldquo;{displayContent}&rdquo;
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="public-focus-ring rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-soft-accent)] transition-colors hover:text-[var(--color-primary)]"
          aria-expanded={expanded}
        >
          {expanded ? "הצג פחות" : "קראי עוד"}
        </button>
      ) : null}
      <footer className="space-y-1">
        <cite className="not-italic">
          <span className="text-base font-semibold text-[var(--color-primary)]">
            {testimonial.name}
          </span>
          {testimonial.city ? (
            <span className="text-muted text-sm"> · {testimonial.city}</span>
          ) : null}
        </cite>
        {testimonial.serviceTitle ? (
          <p className="text-caption text-[var(--color-soft-accent)]">
            {testimonial.serviceTitle}
          </p>
        ) : null}
      </footer>
    </blockquote>
  );
}

type TestimonialCarouselProps = {
  testimonials: PublicTestimonialSummary[];
};

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const regionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      const total = testimonials.length;

      if (total === 0) {
        return;
      }

      setActiveIndex((index + total) % total);
    },
    [testimonials.length]
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrevious = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const node = trackRef.current;

    if (!node) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
      }
    };

    node.addEventListener("keydown", handleKeyDown);

    return () => {
      node.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious]);

  if (testimonials.length === 0) {
    return null;
  }

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div
      ref={trackRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="המלצות"
      id={regionId}
      className="public-focus-ring relative rounded-[var(--radius-xl)] outline-none"
    >
      <div className="relative min-h-[280px] px-2 py-4 sm:min-h-[240px]">
        <TestimonialSlide
          key={activeTestimonial.id}
          testimonial={activeTestimonial}
        />
      </div>

      {testimonials.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="המלצה קודמת"
            className="public-focus-ring inline-flex size-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-soft-accent)]/40 bg-[var(--color-surface)] text-[var(--color-soft-accent)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[var(--color-coral-soft)]"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="בחירת המלצה">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`המלצה ${index + 1} מתוך ${testimonials.length}`}
                onClick={() => goTo(index)}
                className={cn(
                  "public-focus-ring size-2.5 rounded-[var(--radius-full)] transition-[transform,background-color] duration-[var(--transition-fast)]",
                  index === activeIndex
                    ? "scale-125 bg-[var(--color-soft-accent)]"
                    : "bg-[var(--color-border-strong)] hover:bg-[var(--color-soft-accent)]/60"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="המלצה הבאה"
            className="public-focus-ring inline-flex size-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-soft-accent)]/40 bg-[var(--color-surface)] text-[var(--color-soft-accent)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[var(--color-coral-soft)]"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        המלצה {activeIndex + 1} מתוך {testimonials.length}: {activeTestimonial.name}
      </p>
    </div>
  );
}
