import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Sparkles } from "lucide-react";

import { AboutCertificatesSection } from "@/components/about/about-certificates-section";
import { AboutEditorialStory } from "@/components/about/about-editorial-story";
import { AboutGallery } from "@/components/about/about-gallery";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import type { AboutMediaPreview } from "@/lib/about/queries";
import type { CertificateListItem } from "@/lib/certificates/types";
import type { AboutPageData } from "@/lib/validations/about";
import { escapeHtml } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type AboutPublicViewProps = {
  data: AboutPageData;
  coverPreview: AboutMediaPreview | null;
  blockMediaUrls: Map<string, AboutMediaPreview>;
  certificates?: CertificateListItem[];
  mode?: "public" | "preview";
};

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return <p className="about-page__empty-note">{children}</p>;
}

export function AboutPublicView({
  data,
  coverPreview,
  blockMediaUrls,
  certificates = [],
  mode = "public",
}: AboutPublicViewProps) {
  const isPreview = mode === "preview";
  const hasGallery = data.content.gallery.length > 0;
  const mediaById = Object.fromEntries(blockMediaUrls.entries());

  return (
    <article
      className={cn("about-page", isPreview && "about-page--preview")}
    >
      <header className="about-page__hero">
        <div className="about-page__hero-atmosphere" aria-hidden="true">
          <span className="about-page__blob about-page__blob--hero-a" />
          <span className="about-page__blob about-page__blob--hero-b" />
          <span className="about-page__blob about-page__blob--hero-c" />
          <span className="about-page__leaf about-page__leaf--hero" />
          <span className="about-page__hero-grain" />
        </div>

        <div className="about-page__hero-inner">
          <HomepageReveal className="about-page__hero-copy">
            <p className="about-page__eyebrow">
              <Sparkles
                aria-hidden="true"
                className="about-page__eyebrow-icon"
              />
              להכיר קצת יותר
            </p>
            <h1 className="about-page__title">{escapeHtml(data.title)}</h1>
            {data.intro_text ? (
              <p className="about-page__intro">
                {escapeHtml(data.intro_text)}
              </p>
            ) : isPreview ? (
              <p className="about-page__intro about-page__intro--muted">
                ללא כותרת משנה
              </p>
            ) : null}

            {isPreview ? (
              <span className="about-page__scroll-cue about-page__scroll-cue--static">
                <span>להמשיך לקרוא</span>
                <ArrowDown
                  aria-hidden="true"
                  className="about-page__scroll-icon"
                />
              </span>
            ) : (
              <a
                href="#about-story"
                className="about-page__scroll-cue public-focus-ring"
              >
                <span>להמשיך לקרוא</span>
                <ArrowDown
                  aria-hidden="true"
                  className="about-page__scroll-icon"
                />
              </a>
            )}
          </HomepageReveal>

          <HomepageReveal
            className="about-page__hero-media-wrap"
            delayMs={140}
          >
            <span
              className="about-page__hero-media-shape"
              aria-hidden="true"
            />
            <div className="about-page__hero-media">
              {coverPreview?.url ? (
                <Image
                  src={coverPreview.url}
                  alt={coverPreview.alt || data.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="about-page__hero-image object-cover"
                />
              ) : isPreview ? (
                <EmptySectionNote>טרם נבחרה תמונת שער</EmptySectionNote>
              ) : (
                <div
                  className="about-page__hero-media-fallback"
                  aria-hidden="true"
                />
              )}
            </div>
          </HomepageReveal>
        </div>
      </header>

      <div id="about-story" className="about-page__story-anchor">
        <AboutEditorialStory
          blocks={data.content.blocks}
          blockMediaUrls={blockMediaUrls}
          isPreview={isPreview}
        />
      </div>

      {hasGallery ? (
        <AboutGallery
          items={data.content.gallery}
          mediaById={mediaById}
          isPreview={isPreview}
        />
      ) : null}

      <AboutCertificatesSection items={certificates} isPreview={isPreview} />

      <section className="about-page__cta" aria-labelledby="about-cta-heading">
        <div className="about-page__container">
          <HomepageReveal>
            <div className="about-page__cta-card">
              <span
                className="about-page__blob about-page__blob--cta"
                aria-hidden="true"
              />
              <span
                className="about-page__organic about-page__organic--cta"
                aria-hidden="true"
              />
              <div className="about-page__cta-copy">
                <h2 id="about-cta-heading" className="about-page__cta-title">
                  {escapeHtml(data.cta.title)}
                </h2>
                <p className="about-page__cta-text">
                  {escapeHtml(data.cta.text)}
                </p>
                {isPreview ? (
                  <span className="about-page__cta-button about-page__cta-button--static">
                    <span>{escapeHtml(data.cta.button_label)}</span>
                    <ArrowLeft
                      aria-hidden="true"
                      className="about-page__cta-arrow"
                    />
                  </span>
                ) : (
                  <Link
                    href={data.cta.button_url}
                    className="about-page__cta-button public-focus-ring"
                  >
                    <span>{escapeHtml(data.cta.button_label)}</span>
                    <ArrowLeft
                      aria-hidden="true"
                      className="about-page__cta-arrow"
                    />
                  </Link>
                )}
              </div>
            </div>
          </HomepageReveal>
        </div>
      </section>
    </article>
  );
}
