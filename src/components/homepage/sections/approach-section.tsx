import { OrganicDecoration, OrganicDivider } from "@/components/homepage/organic-decoration";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import { HOMEPAGE_APPROACH_POINTS } from "@/lib/homepage/approach-points";
import type { HomepageData } from "@/lib/validations/homepage-hero";

type ApproachSectionProps = {
  content: HomepageData["approach"];
};

export function ApproachSection({ content }: ApproachSectionProps) {
  return (
    <Section tone="cream" ariaLabelledBy="homepage-approach-title" className="relative overflow-hidden">
      <OrganicDecoration variant="mint" className="start-0 top-0 size-56" />
      <OrganicDecoration variant="section" className="-bottom-10 end-0 size-64" />

      <Container className="relative space-y-10">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 id="homepage-approach-title" className="text-section-title">
            {content.title}
          </h2>
          <p className="text-muted text-base sm:text-lg">{content.text}</p>
          <OrganicDivider className="mx-auto" />
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {HOMEPAGE_APPROACH_POINTS.map((point) => {
            const Icon = point.icon;

            return (
              <li
                key={point.id}
                className="rounded-[var(--radius-xl)] bg-[var(--color-surface)]/85 p-6 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-light-sage-soft)] text-[var(--color-primary)]">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <h3 className="text-card-title mb-2">{point.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{point.description}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
