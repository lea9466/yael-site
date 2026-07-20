import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

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
      className={cn(
        "service-page",
        isPreview && "service-page--preview"
      )}
    >
      <header className="service-page__hero">
        <div className="service-page__hero-copy">
          <p className="service-page__badge">שירות אישי</p>
          <h1 className="service-page__title">{escapeHtml(service.title)}</h1>
          <MultilineText as="p" className="service-page__lead">
            {service.short_description}
          </MultilineText>
          <ServiceCtaLink
            href={heroCtaHref}
            linkType={heroCtaType}
            className="service-page__hero-cta public-focus-ring"
          >
            {escapeHtml(heroCtaLabel)}
          </ServiceCtaLink>
        </div>

        <div className="service-page__hero-media relative overflow-hidden">
          {service.coverUrl ? (
            <Image
              src={service.coverUrl}
              alt={service.coverAlt ?? service.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          ) : (
            <div className="service-page__hero-media-fallback" aria-hidden="true" />
          )}
        </div>
      </header>

      {paragraphs.length > 0 ? (
        <section
          className="service-page__section service-page__intro"
          aria-labelledby="service-intro-heading"
        >
          <h2 id="service-intro-heading" className="sr-only">
            על השירות
          </h2>
          <div className="service-page__intro-copy">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="service-page__body">
                {escapeHtml(paragraph)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {service.content.target_audience.length > 0 ? (
        <section
          className="service-page__section service-page__audience"
          aria-labelledby="service-audience-heading"
        >
          <div className="service-page__container">
            <h2 id="service-audience-heading" className="service-page__heading">
              למי השירות מתאים
            </h2>
            <ul className="service-page__audience-grid">
              {service.content.target_audience.map((item, index) => (
                <li
                  key={`${item.text}-${index}`}
                  className="service-page__feature-card"
                >
                  <span className="service-page__feature-icon" aria-hidden="true">
                    <ServiceAudienceIcon name={item.icon} />
                  </span>
                  <p className="service-page__feature-text">
                    {escapeHtml(item.text)}
                  </p>
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
          <div className="service-page__container">
            <h2 id="service-benefits-heading" className="service-page__heading">
              יתרונות
            </h2>
            <ul className="service-page__benefits-grid">
              {service.content.benefits.map((item, index) => (
                <li
                  key={`${item.text}-${index}`}
                  className="service-page__feature-card service-page__feature-card--benefit"
                >
                  <span className="service-page__feature-icon" aria-hidden="true">
                    <Check className="size-6" strokeWidth={2.25} />
                  </span>
                  <p className="service-page__feature-text">
                    {escapeHtml(item.text)}
                  </p>
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
          <div className="service-page__container service-page__container--narrow">
            <h2 id="service-faq-heading" className="service-page__heading">
              שאלות נפוצות
            </h2>
            <div className="service-page__faq-list">
              {service.content.faq.map((item, index) => (
                <details
                  key={`${item.question}-${index}`}
                  className="service-page__faq-item"
                >
                  <summary className="service-page__faq-summary">
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
            <div className="service-page__cta-card">
              <h2 id="service-cta-heading" className="service-page__cta-title">
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
                  {escapeHtml(service.content.cta_button_label)}
                </ServiceCtaLink>
              ) : null}
            </div>
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
