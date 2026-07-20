import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { ServiceAudienceIcon } from "@/components/services/service-audience-icon";
import { ServiceProcessTimeline } from "@/components/services/service-process-timeline";
import { MultilineText } from "@/components/ui/multiline-text";
import { escapeHtml, formatServiceParagraphs } from "@/lib/services/sanitize";
import type { ServiceDetail } from "@/lib/services/types";
import { cn } from "@/lib/utils/cn";

type ServicePublicViewProps = {
  service: ServiceDetail;
  mode?: "public" | "preview";
};

const AUDIENCE_TONES = 4;
const BENEFIT_VARIANTS = ["a", "b", "c", "d"] as const;

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
  mode = "public",
}: ServicePublicViewProps) {
  const isPreview = mode === "preview";
  const ogImageUrl = service.ogUrl ?? service.coverUrl;
  const paragraphs = formatServiceParagraphs(service.full_introduction);
  const leadParagraph = paragraphs[0] ?? null;
  const restParagraphs = paragraphs.slice(1);
  const hasCtaButton =
    Boolean(service.content.cta_button_label?.trim()) &&
    Boolean(service.content.cta_link_url?.trim());
  const heroCtaHref = hasCtaButton
    ? service.content.cta_link_url
    : "#service-cta";
  const heroCtaLabel = hasCtaButton
    ? service.content.cta_button_label
    : "לפרטים נוספים";
  const heroCtaType = hasCtaButton
    ? service.content.cta_link_type
    : "internal";

  return (
    <article
      className={cn("service-page", isPreview && "service-page--preview")}
    >
      <header className="service-page__hero">
        <div className="service-page__hero-atmosphere" aria-hidden="true">
          <span className="service-page__blob service-page__blob--hero-a" />
          <span className="service-page__blob service-page__blob--hero-b" />
          <span className="service-page__blob service-page__blob--hero-c" />
          <span className="service-page__hero-grain" />
        </div>

        <div className="service-page__hero-inner">
          <div className="service-page__hero-copy">
            <p className="service-page__eyebrow">
              <Sparkles aria-hidden="true" className="service-page__eyebrow-icon" />
              שירות אישי
            </p>
            <h1 className="service-page__title">{escapeHtml(service.title)}</h1>
            <MultilineText as="p" className="service-page__lead">
              {service.short_description}
            </MultilineText>
            <ServiceCtaLink
              href={heroCtaHref}
              linkType={heroCtaType}
              className="service-page__hero-cta public-focus-ring"
            >
              <span>{escapeHtml(heroCtaLabel)}</span>
              <ArrowLeft aria-hidden="true" className="service-page__cta-arrow" />
            </ServiceCtaLink>
          </div>

          <div className="service-page__hero-media-wrap">
            <div className="service-page__hero-media-glow" aria-hidden="true" />
            <div className="service-page__hero-media relative overflow-hidden">
              {service.coverUrl ? (
                <Image
                  src={service.coverUrl}
                  alt={service.coverAlt ?? service.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  className="service-page__hero-image object-cover"
                />
              ) : (
                <div
                  className="service-page__hero-media-fallback"
                  aria-hidden="true"
                />
              )}
            </div>
            <span
              className="service-page__hero-orbit"
              aria-hidden="true"
            />
          </div>
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
                        `service-page__audience-card--tone-${index % AUDIENCE_TONES}`
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
            <HomepageReveal>
              <div className="service-page__section-head service-page__section-head--benefits">
                <p className="service-page__section-kicker">מה יוצא מזה</p>
                <h2
                  id="service-benefits-heading"
                  className="service-page__heading"
                >
                  יתרונות
                </h2>
              </div>
            </HomepageReveal>

            <ul className="service-page__benefits-bento">
              {service.content.benefits.map((item, index) => (
                <li
                  key={`${item.text}-${index}`}
                  className={cn(
                    "service-page__benefit-item",
                    `service-page__benefit-item--${BENEFIT_VARIANTS[index % BENEFIT_VARIANTS.length]}`
                  )}
                >
                  <HomepageReveal delayMs={Math.min(index * 60, 240)}>
                    <div className="service-page__benefit-card">
                      <span
                        className="service-page__benefit-index"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
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
                  <details className="service-page__faq-item">
                    <summary className="service-page__faq-summary">
                      <span className="service-page__faq-index" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="service-page__faq-question">
                        {escapeHtml(item.question)}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className="service-page__faq-chevron"
                      />
                    </summary>
                    <div className="service-page__faq-answer">
                      <p>{escapeHtml(item.answer)}</p>
                    </div>
                  </details>
                </HomepageReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.content.cta_title ? (
        <section
          id="service-cta"
          className="service-page__section service-page__cta"
          aria-labelledby="service-cta-heading"
        >
          <div className="service-page__container">
            <HomepageReveal>
              <div className="service-page__cta-stage">
                <div
                  className="service-page__cta-atmosphere"
                  aria-hidden="true"
                >
                  <span className="service-page__blob service-page__blob--cta-a" />
                  <span className="service-page__blob service-page__blob--cta-b" />
                  <span className="service-page__cta-pattern" />
                </div>

                <div className="service-page__cta-content">
                  <div className="service-page__cta-copy">
                    <h2
                      id="service-cta-heading"
                      className="service-page__cta-title"
                    >
                      {escapeHtml(service.content.cta_title)}
                    </h2>
                    {service.content.cta_text ? (
                      <p className="service-page__cta-text">
                        {escapeHtml(service.content.cta_text)}
                      </p>
                    ) : null}
                    {hasCtaButton ? (
                      <ServiceCtaLink
                        href={service.content.cta_link_url}
                        linkType={service.content.cta_link_type}
                        className="service-page__cta-button public-focus-ring"
                      >
                        <span>
                          {escapeHtml(service.content.cta_button_label)}
                        </span>
                        <ArrowLeft
                          aria-hidden="true"
                          className="service-page__cta-arrow"
                        />
                      </ServiceCtaLink>
                    ) : null}
                  </div>

                  {service.coverUrl ? (
                    <div className="service-page__cta-media relative overflow-hidden">
                      <Image
                        src={service.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 40vw, 220px"
                        className="object-cover"
                      />
                    </div>
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
