import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
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
          <PublicSectionHeader
            className="testimonials-section__header"
            titleId="homepage-testimonials-title"
            eyebrow="המלצות"
            title="מה אומרים על הליווי"
            actionLabel="לכל ההמלצות"
            actionHref="/testimonials"
          />
        </HomepageReveal>

        <HomepageReveal delayMs={120}>
          <TestimonialCarousel testimonials={testimonials} />
        </HomepageReveal>
      </div>
    </section>
  );
}
