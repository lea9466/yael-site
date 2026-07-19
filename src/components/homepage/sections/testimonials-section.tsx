import Link from "next/link";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { TestimonialCarousel } from "@/components/homepage/testimonial-carousel";
import type { PublicTestimonialSummary } from "@/lib/public/types";

type TestimonialsSectionProps = {
  testimonials: PublicTestimonialSummary[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="homepage-testimonials-title"
      className="testimonials-section"
    >
      <div className="testimonials-section__inner">
        <HomepageReveal>
          <header className="testimonials-section__header">
            <p className="testimonials-section__eyebrow">המלצות</p>
            <h2
              id="homepage-testimonials-title"
              className="testimonials-section__title"
            >
              מה אומרים על הליווי
            </h2>
            <Link
              href="/testimonials"
              className="testimonials-section__action public-focus-ring"
            >
              כל ההמלצות
            </Link>
          </header>
        </HomepageReveal>

        <HomepageReveal delayMs={120}>
          <TestimonialCarousel testimonials={testimonials} />
        </HomepageReveal>
      </div>
    </section>
  );
}
