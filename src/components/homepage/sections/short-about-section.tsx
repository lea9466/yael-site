import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { OrganicDecoration } from "@/components/homepage/organic-decoration";
import type { AboutMediaPreview } from "@/lib/about/queries";
import {
  HOMEPAGE_SHORT_ABOUT_HIGHLIGHTS,
  type ShortAboutHighlightPosition,
} from "@/lib/homepage/short-about-highlights";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import { cn } from "@/lib/utils/cn";

type ShortAboutSectionProps = {
  content: HomepageData["short_about"];
  coverPreview: AboutMediaPreview | null;
};

const highlightPositionClasses: Record<ShortAboutHighlightPosition, string> = {
  "top-start": "top-4 start-0 motion-safe:-translate-x-4",
  "top-end": "top-8 end-0 motion-safe:translate-x-4",
  "center-start": "top-1/2 start-0 -translate-y-1/2 motion-safe:-translate-x-8",
  "bottom-start": "-bottom-4 start-1/4",
  "bottom-end": "bottom-24 end-0 motion-safe:translate-x-4",
};

function AboutEditorialFallback() {
  return (
    <div
      aria-hidden="true"
      className="short-about-fallback relative mx-auto aspect-[4/5] w-[85%] overflow-hidden rounded-[3.75rem] border-4 border-white bg-[linear-gradient(145deg,var(--color-fresh-green-soft)_0%,var(--color-cream)_52%,var(--color-coral-soft)_100%)] shadow-[0_24px_60px_rgba(63,95,71,0.18)] motion-safe:-rotate-2"
    >
      <OrganicDecoration
        variant="mint"
        className="absolute -start-10 top-8 size-40 opacity-80"
      />
      <OrganicDecoration
        variant="coral"
        className="absolute -end-8 bottom-12 size-36 opacity-75"
      />
      <OrganicDecoration
        variant="section"
        className="absolute start-1/3 top-1/2 size-32 -translate-y-1/2 opacity-65"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.55),transparent_58%)]" />
    </div>
  );
}

function AboutVisualComposition({
  coverPreview,
}: {
  coverPreview: AboutMediaPreview | null;
}) {
  return (
    <div className="short-about-visual short-about-visual-enter relative mx-auto flex min-h-[28rem] w-full max-w-md items-center justify-center md:min-h-[37.5rem]">
      <OrganicDecoration
        variant="mint"
        className="absolute size-[22rem] motion-safe:translate-x-10 motion-safe:translate-y-10 opacity-60"
      />
      <OrganicDecoration
        variant="coral"
        className="absolute size-[18rem] motion-safe:-translate-x-12 motion-safe:-translate-y-12 opacity-50"
      />

      <div className="relative z-[1] w-full">
        {coverPreview?.url ? (
          <div className="short-about-image-frame group relative mx-auto aspect-[4/5] w-[85%] overflow-hidden rounded-[3.75rem] border-4 border-white bg-[var(--color-surface-soft)] shadow-[0_24px_60px_rgba(63,95,71,0.18)] motion-safe:-rotate-2">
            <Image
              src={coverPreview.url}
              alt={coverPreview.alt}
              fill
              sizes="(max-width: 1024px) 88vw, 36vw"
              className="object-cover object-[center_22%] transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <AboutEditorialFallback />
        )}

        {HOMEPAGE_SHORT_ABOUT_HIGHLIGHTS.map((highlight, index) => (
          <PublicHighlightPill
            key={highlight.id}
            label={highlight.label}
            icon={highlight.icon}
            variant={highlight.variant}
            animationDuration={highlight.animationDuration}
            className={cn(
              "absolute z-[2]",
              highlightPositionClasses[highlight.position],
              "short-about-pill-enter"
            )}
            style={{
              animationDelay: `${180 + index * 120}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AboutBodyText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return (
      <p className="short-about-body">{paragraphs[0] ?? text}</p>
    );
  }

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`} className="short-about-body">
          {paragraph}
        </p>
      ))}
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
      className="short-about relative overflow-hidden py-16 md:py-[var(--spacing-3xl)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_left,var(--color-cream)_0%,#e9f0ea_100%)]"
      />

      <div className="relative z-[1] mx-auto w-full max-w-[90rem] px-5 md:px-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <div className="order-2 space-y-8 text-start lg:order-1 lg:col-span-7 lg:pe-8">
            <div className="short-about-copy-enter space-y-8">
              <span className="short-about-eyebrow">אודות</span>

              <h2
                id="homepage-short-about-title"
                className="short-about-title"
              >
                {content.title}
              </h2>

              <div className="max-w-2xl space-y-6">
                <AboutBodyText text={content.text} />
              </div>

              <Link
                href="/about"
                className="public-focus-ring short-about-link group inline-flex items-center gap-2 pb-1"
              >
                <span>קראי עוד</span>
                <ArrowLeft
                  aria-hidden="true"
                  className="size-4 transition-transform duration-[var(--transition-base)] motion-safe:group-hover:-translate-x-2"
                />
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <AboutVisualComposition coverPreview={coverPreview} />
          </div>
        </div>
      </div>
    </section>
  );
}
