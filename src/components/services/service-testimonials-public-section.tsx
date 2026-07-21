import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { TestimonialCarousel } from "@/components/homepage/testimonial-carousel";
import type { PublicTestimonialSummary } from "@/lib/public/types";

type ServiceTestimonialsPublicSectionProps = {
  testimonials: PublicTestimonialSummary[];
};

export function ServiceTestimonialsPublicSection({
  testimonials,
}: ServiceTestimonialsPublicSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="service-testimonials-heading"
      className="testimonials-section service-page__testimonials"
    >
      <div className="testimonials-section__inner">
        <HomepageReveal>
          <PublicSectionHeader
            className="testimonials-section__header"
            titleId="service-testimonials-heading"
            eyebrow="המלצות"
            title="ממי שכבר חוותה את זה"
          />
        </HomepageReveal>

        <HomepageReveal delayMs={120}>
          <TestimonialCarousel testimonials={testimonials} />
        </HomepageReveal>
      </div>
    </section>
  );
}
