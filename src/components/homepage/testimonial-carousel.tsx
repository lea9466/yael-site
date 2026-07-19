"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { MultilineText } from "@/components/ui/multiline-text";
import { getTestimonialInitials } from "@/lib/testimonials/format";
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
  const initials = getTestimonialInitials(testimonial.name);

  return (
    <article className="testimonial-carousel__card">
      <Quote
        aria-hidden="true"
        className="testimonial-carousel__quote-icon"
        strokeWidth={1.5}
      />

      <blockquote className="testimonial-carousel__quote">
        <MultilineText as="p" className="testimonial-carousel__text">
          {displayContent}
        </MultilineText>
      </blockquote>

      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="testimonial-carousel__expand public-focus-ring"
          aria-expanded={expanded}
        >
          {expanded ? "הצג פחות" : "קראי עוד"}
        </button>
      ) : null}

      <footer className="testimonial-carousel__footer">
        <span aria-hidden="true" className="testimonial-carousel__avatar">
          {initials}
        </span>
        <div className="testimonial-carousel__meta">
          <cite className="testimonial-carousel__name not-italic">
            {testimonial.name}
          </cite>
          {testimonial.city ? (
            <p className="testimonial-carousel__subtitle">{testimonial.city}</p>
          ) : null}
          {testimonial.serviceTitle ? (
            <p className="testimonial-carousel__service">
              {testimonial.serviceTitle}
            </p>
          ) : null}
        </div>
      </footer>
    </article>
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
      className="testimonial-carousel public-focus-ring outline-none"
    >
      <div className="testimonial-carousel__stage">
        <div
          key={activeTestimonial.id}
          className="testimonial-carousel__slide"
        >
          <TestimonialSlide testimonial={activeTestimonial} />
        </div>
      </div>

      {testimonials.length > 1 ? (
        <div className="testimonial-carousel__controls">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="המלצה קודמת"
            className="testimonial-carousel__nav public-focus-ring"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <div
            className="testimonial-carousel__dots"
            role="tablist"
            aria-label="בחירת המלצה"
          >
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`המלצה ${index + 1} מתוך ${testimonials.length}`}
                onClick={() => goTo(index)}
                className={cn(
                  "testimonial-carousel__dot public-focus-ring",
                  index === activeIndex && "testimonial-carousel__dot--active"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="המלצה הבאה"
            className="testimonial-carousel__nav public-focus-ring"
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
