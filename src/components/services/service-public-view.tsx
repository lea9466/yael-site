import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { ServiceAudienceIcon } from "@/components/services/service-audience-icon";
import { ServiceFaqItem } from "@/components/services/service-faq-item";
import { ServiceProcessTimeline } from "@/components/services/service-process-timeline";
import { ServiceTestimonialsPublicSection } from "@/components/services/service-testimonials-public-section";
import { MultilineText } from "@/components/ui/multiline-text";
import type { PublicTestimonialSummary } from "@/lib/public/types";
import { escapeHtml, formatServiceParagraphs } from "@/lib/services/sanitize";
import type { ServiceDetail } from "@/lib/services/types";
import { cn } from "@/lib/utils/cn";

type ServicePublicViewProps = {
  service: ServiceDetail;
  testimonials?: PublicTestimonialSummary[];
  mode?: "public" | "preview";
};

const PASTEL_TONES = 3;

function ServiceCtaLink({
  href,
  linkType,
  className,
  children,
}: {
  href: string;
  linkType: "internal" | "external";
  className?: string;
  children: ReactNode;
}) {
  if (linkType === "external") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function ServicePublicView({
  service,
  testimonials = [],
  mode = "public",
}: ServicePublicViewProps) {
  const isPreview = mode === "preview";
  const ogImageUrl = service.ogUrl ?? service.coverUrl;
  const paragraphs = formatServiceParagraphs(service.full_introduction);
  const leadParagraph = paragraphs[0] ?? null;
  const restParagraphs = paragraphs.slice(1);
  const shortDescription = service.short_description.trim();
  const displayTitle = service.title.trim();
  const ctaTitle = service.content.cta_title.trim();
  const ctaText = service.content.cta_text.trim();
  const ctaButtonLabel = service.content.cta_button_label.trim();
  const ctaLinkUrl = service.content.cta_link_url.trim();
  const hasCtaButton = Boolean(ctaButtonLabel && ctaLinkUrl);
  const hasCtaSection = Boolean(ctaTitle || ctaText || hasCtaButton);
  const hasCover = Boolean(service.coverUrl);
  const heroCtaHref = hasCtaButton ? ctaLinkUrl : "/contact";
  const heroCtaLabel = hasCtaButton ? ctaButtonLabel : "יצירת קשר";
  const heroCtaType = hasCtaButton
    ? service.content.cta_link_type
    : "internal";

  return (
    <article
      className={cn(
        "service-page",
        isPreview && "service-page--preview",
        !hasCover && "service-page--no-cover"
      )}
    >
      <header className="service-page__hero">
        <div className="service-page__hero-atmosphere" aria-hidden="true">
          <span className="service-page__blob service-page__blob--hero-a" />
          <span className="service-page__blob service-page__blob--hero-b" />
          <span className="service-page__blob service-page__blob--hero-c" />
          <span className="service-page__hero-grain" />
        </div>

        <div className="service-page__hero-inner">
          <HomepageReveal className="service-page__hero-copy">
            {displayTitle ? (
              <h1 className="service-page__title">{escapeHtml(displayTitle)}</h1>
            ) : null}
            {shortDescription ? (
              <MultilineText as="p" className="service-page__lead">
                {shortDescription}
              </MultilineText>
            ) : null}
            <ServiceCtaLink
              href={heroCtaHref}
              linkType={heroCtaType}
              className="service-page__hero-cta public-focus-ring"
            >
              <span>{escapeHtml(heroCtaLabel)}</span>
              <ArrowLeft aria-hidden="true" className="service-page__cta-arrow" />
            </ServiceCtaLink>
          </HomepageReveal>

          {hasCover ? (
            <HomepageReveal className="service-page__hero-media-wrap" delayMs={140}>
              <div className="service-page__hero-media-glow" aria-hidden="true" />
              <div className="service-page__hero-media relative overflow-hidden">
                <Image
                  src={service.coverUrl!}
                  alt={service.coverAlt ?? displayTitle}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  className="service-page__hero-image object-cover"
                />
              </div>
              <span
                className="service-page__hero-orbit"
                aria-hidden="true"
              />
            </HomepageReveal>
          ) : null}
        </div>
      </header>

      {paragraphs.length > 0 ? (
        <section
          className="service-page__section service-page__intro"
          aria-labelledby="service-intro-heading"
        >
          <div className="service-page__intro-atmosphere" aria-hidden="true">
            <span className="service-page__blob service-page__blob--intro" />
          </div>
          <HomepageReveal className="service-page__intro-panel">
            <h2 id="service-intro-heading" className="sr-only">
              על השירות
            </h2>
            <span className="service-page__quote-mark" aria-hidden="true">
              ”
            </span>
            <div className="service-page__intro-copy">
              {leadParagraph ? (
                <p className="service-page__intro-lead">
                  {escapeHtml(leadParagraph)}
                </p>
              ) : null}
              {restParagraphs.map((paragraph) => (
                <p key={paragraph} className="service-page__body">
                  {escapeHtml(paragraph)}
                </p>
              ))}
            </div>
          </HomepageReveal>
        </section>
      ) : null}

      {service.content.target_audience.length > 0 ? (
        <section
          className="service-page__section service-page__audience"
          aria-labelledby="service-audience-heading"
        >
          <div className="service-page__container">
            <HomepageReveal>
              <div className="service-page__section-head">
                <p className="service-page__section-kicker">קהל יעד</p>
                <h2
                  id="service-audience-heading"
                  className="service-page__heading"
                >
                  למי השירות מתאים
                </h2>
              </div>
            </HomepageReveal>

            <ul className="service-page__audience-grid">
              {service.content.target_audience.map((item, index) => (
                <li key={`${item.text}-${index}`}>
                  <HomepageReveal delayMs={Math.min(index * 70, 280)}>
                    <div
                      className={cn(
                        "service-page__audience-card",
                        `service-page__audience-card--tone-${index % PASTEL_TONES}`
                      )}
                    >
                      <span
                        className="service-page__audience-icon"
                        aria-hidden="true"
                      >
                        <ServiceAudienceIcon name={item.icon} />
                      </span>
                      <p className="service-page__audience-text">
                        {escapeHtml(item.text)}
                      </p>
                    </div>
                  </HomepageReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {service.content.benefits.length > 0 ? (
        <section
          className="service-page__section service-page__benefits"
          aria-labelledby="service-benefits-heading"
        >
          <div
            className="service-page__benefits-atmosphere"
            aria-hidden="true"
          >
            <span className="service-page__blob service-page__blob--benefits-a" />
            <span className="service-page__blob service-page__blob--benefits-b" />
          </div>

          <div className="service-page__container">
            <h2 id="service-benefits-heading" className="sr-only">
              יתרונות
            </h2>

            <ul className="service-page__benefits-row">
              {service.content.benefits.map((item, index) => (
                <li key={`${item.text}-${index}`} className="service-page__benefit-item">
                  <HomepageReveal delayMs={Math.min(index * 60, 240)}>
                    <div
                      className={cn(
                        "service-page__benefit-card",
                        `service-page__benefit-card--tone-${index % PASTEL_TONES}`
                      )}
                    >
                      <p className="service-page__benefit-text">
                        {escapeHtml(item.text)}
                      </p>
                    </div>
                  </HomepageReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ServiceProcessTimeline steps={service.content.process_steps} />

      {service.content.faq.length > 0 ? (
        <section
          className="service-page__section service-page__faq"
          aria-labelledby="service-faq-heading"
        >
          <div className="service-page__container service-page__container--faq">
            <HomepageReveal>
              <div className="service-page__section-head">
                <p className="service-page__section-kicker">שאלות ותשובות</p>
                <h2 id="service-faq-heading" className="service-page__heading">
                  שאלות נפוצות
                </h2>
              </div>
            </HomepageReveal>

            <div className="service-page__faq-list">
              {service.content.faq.map((item, index) => (
                <HomepageReveal
                  key={`${item.question}-${index}`}
                  delayMs={Math.min(index * 50, 200)}
                >
                  <ServiceFaqItem
                    index={index}
                    question={escapeHtml(item.question)}
                    answer={escapeHtml(item.answer)}
                  />
                </HomepageReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ServiceTestimonialsPublicSection testimonials={testimonials} />

      {hasCtaSection ? (
        <section
          className="service-page__cta"
          aria-labelledby={ctaTitle ? "service-cta-heading" : undefined}
        >
          <div className="service-page__cta-inner">
            <HomepageReveal>
              <div className="service-page__cta-stage">
                <div
                  aria-hidden="true"
                  className="service-page__cta-glow service-page__cta-glow--start"
                />
                <div
                  aria-hidden="true"
                  className="service-page__cta-glow service-page__cta-glow--end"
                />
                <div
                  aria-hidden="true"
                  className="service-page__cta-shape service-page__cta-shape--one"
                />
                <div
                  aria-hidden="true"
                  className="service-page__cta-shape service-page__cta-shape--two"
                />

                <div className="service-page__cta-content">
                  <div className="service-page__cta-copy">
                    {ctaTitle ? (
                      <h2
                        id="service-cta-heading"
                        className="service-page__cta-title"
                      >
                        {escapeHtml(ctaTitle)}
                      </h2>
                    ) : null}
                    {ctaText ? (
                      <p className="service-page__cta-text">
                        {escapeHtml(ctaText)}
                      </p>
                    ) : null}
                  </div>
                  {hasCtaButton ? (
                    <ServiceCtaLink
                      href={ctaLinkUrl}
                      linkType={service.content.cta_link_type}
                      className="service-page__cta-button public-focus-ring"
                    >
                      <span>{escapeHtml(ctaButtonLabel)}</span>
                      <ArrowLeft
                        aria-hidden="true"
                        className="service-page__cta-arrow"
                      />
                    </ServiceCtaLink>
                  ) : null}
                </div>
              </div>
            </HomepageReveal>
          </div>
        </section>
      ) : null}

      {ogImageUrl ? (
        <div className="sr-only" aria-hidden="true">
          OG image: {ogImageUrl}
        </div>
      ) : null}
    </article>
  );
}
