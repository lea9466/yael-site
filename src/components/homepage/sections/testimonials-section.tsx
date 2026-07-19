import { TestimonialCarousel } from "@/components/homepage/testimonial-carousel";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { PublicTestimonialSummary } from "@/lib/public/types";

type TestimonialsSectionProps = {
  testimonials: PublicTestimonialSummary[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Section tone="soft" ariaLabelledBy="homepage-testimonials-title">
      <Container className="space-y-10">
        <PublicSectionHeader
          eyebrow="המלצות"
          title="מה אומרים על הליווי"
          actionLabel="כל ההמלצות"
          actionHref="/testimonials"
          titleId="homepage-testimonials-title"
        />
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-soft-accent)]/20 bg-[var(--color-surface)]/90 px-4 py-8 shadow-[var(--shadow-sm)] sm:px-8">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </Container>
    </Section>
  );
}
