import Image from "next/image";

import { OrganicDecoration } from "@/components/homepage/organic-decoration";
import { SectionCTA } from "@/components/homepage/section-cta";
import { Container } from "@/components/public/layout/container";
import type { AboutMediaPreview } from "@/lib/about/queries";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import { cn } from "@/lib/utils/cn";

type ShortAboutSectionProps = {
  content: HomepageData["short_about"];
  coverPreview: AboutMediaPreview | null;
};

function AboutImageFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative flex min-h-[22rem] w-full items-center justify-center overflow-hidden rounded-[2rem_1.5rem_2rem_1.75rem] bg-[linear-gradient(145deg,var(--color-light-sage-soft)_0%,var(--color-cream)_55%,var(--color-coral-soft)_100%)] shadow-[var(--shadow-lg)] lg:min-h-[65vh]"
    >
      <OrganicDecoration
        variant="mint"
        className="absolute -start-16 top-12 size-56 opacity-80"
      />
      <OrganicDecoration
        variant="coral"
        className="absolute -end-10 bottom-10 size-44 opacity-70"
      />
      <OrganicDecoration
        variant="section"
        className="absolute start-1/3 top-1/2 size-36 -translate-y-1/2 opacity-60"
      />
      <div className="relative z-[1] flex flex-col items-center gap-3 px-8 text-center">
        <span className="text-[clamp(3rem,8vw,5rem)] font-semibold leading-none tracking-[-0.04em] text-[var(--color-primary)]/18">
          יעל
        </span>
        <span className="h-1 w-16 rounded-full bg-[image:var(--gradient-warm)] opacity-90" />
      </div>
    </div>
  );
}

export function ShortAboutSection({
  content,
  coverPreview,
}: ShortAboutSectionProps) {
  return (
    <section
      aria-labelledby="homepage-short-about-title"
      className={cn(
        "relative isolate -mt-6 overflow-hidden",
        "min-h-[70vh] lg:min-h-[78vh]",
        "bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-surface-soft)_38%,var(--color-light-sage-soft)_100%)]",
        "py-16 sm:py-20 lg:py-24"
      )}
    >
      <OrganicDecoration
        variant="section"
        className="absolute -end-24 top-16 size-72 opacity-50"
      />
      <OrganicDecoration
        variant="mint"
        className="absolute -start-20 bottom-20 size-64 opacity-40"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 flex flex-col items-start gap-6 text-start lg:order-1 lg:gap-7">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-10 w-1 rounded-full bg-[var(--color-soft-accent)]"
              />
              <p className="text-caption font-semibold tracking-[0.08em] text-[var(--color-secondary)]">
                אודות
              </p>
            </div>

            <h2
              id="homepage-short-about-title"
              className="max-w-xl text-balance text-[clamp(2rem,3.5vw+0.5rem,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--color-primary)]"
            >
              {content.title}
            </h2>

            <p className="max-w-xl text-[1.0625rem] leading-[1.85] text-[var(--color-text)] sm:text-lg sm:leading-[1.8]">
              {content.text}
            </p>

            <SectionCTA
              label="קראי עוד"
              href="/about"
              variant="primary"
              className="min-h-12 px-7 text-[0.9375rem] shadow-[0_8px_24px_rgba(217,138,128,0.28)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(217,138,128,0.36)] motion-reduce:hover:translate-y-0"
            />
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <OrganicDecoration
                variant="hero"
                className="absolute -end-8 -top-8 size-40 opacity-60 lg:size-52"
              />

              {coverPreview?.url ? (
                <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem_1.5rem_2rem_1.75rem] bg-[var(--color-surface-soft)] shadow-[0_24px_60px_rgba(63,95,71,0.14)] lg:aspect-[4/5] lg:min-h-[65vh]">
                  <Image
                    src={coverPreview.url}
                    alt={coverPreview.alt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="object-cover object-[center_20%]"
                  />
                </div>
              ) : (
                <AboutImageFallback />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
