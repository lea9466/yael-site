import Link from "next/link";

import { Container } from "@/components/public/layout/container";
import { cn } from "@/lib/utils/cn";

type CTASectionProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  className?: string;
};

export function CTASection({
  title,
  description,
  buttonLabel,
  buttonHref,
  className,
}: CTASectionProps) {
  return (
    <section
      aria-labelledby="public-cta-title"
      className={cn(
        "py-[var(--spacing-section)] sm:py-[var(--spacing-3xl)]",
        className
      )}
    >
      <Container>
        <div className="surface-card-elevated relative overflow-hidden rounded-[var(--radius-xl)] px-6 py-10 sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -start-16 -top-16 size-48 rounded-full bg-[var(--color-light-sage-soft)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -end-10 size-56 rounded-full bg-[var(--color-coral-soft)] blur-2xl"
          />
          <div className="relative z-[var(--z-page)] mx-auto max-w-2xl space-y-5 text-center">
            <h2 id="public-cta-title" className="text-section-title">
              {title}
            </h2>
            <p className="text-muted text-base sm:text-lg">{description}</p>
            <div>
              <Link
                href={buttonHref}
                className="public-focus-ring inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-6 text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                {buttonLabel}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
