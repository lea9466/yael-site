import Image from "next/image";

import { escapeHtml, formatServiceParagraphs } from "@/lib/services/sanitize";
import { MultilineText } from "@/components/ui/multiline-text";
import type { ServiceDetail } from "@/lib/services/types";
import { cn } from "@/lib/utils/cn";

type ServicePublicViewProps = {
  service: ServiceDetail;
  mode?: "public" | "preview";
};

export function ServicePublicView({
  service,
  mode = "public",
}: ServicePublicViewProps) {
  const isPreview = mode === "preview";
  const ogImageUrl = service.ogUrl ?? service.coverUrl;
  const paragraphs = formatServiceParagraphs(service.full_introduction);

  return (
    <article
      className={cn(
        "w-full space-y-10",
        isPreview
          ? "rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 sm:p-8"
          : "mx-auto max-w-5xl"
      )}
    >
      <header className={cn("space-y-4", isPreview && "mx-auto w-full max-w-[900px]")}>
        {service.coverUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]">
            <Image
              src={service.coverUrl}
              alt={service.coverAlt ?? service.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <h1 className="text-page-title">{escapeHtml(service.title)}</h1>
          <MultilineText
            as="p"
            className="text-lg text-[var(--color-text-muted)]"
          >
            {service.short_description}
          </MultilineText>
        </div>
      </header>

      <section className={cn("space-y-4", isPreview && "mx-auto w-full max-w-[900px]")}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-body leading-8">
            {escapeHtml(paragraph)}
          </p>
        ))}
      </section>

      {service.content.target_audience.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">למי מתאים</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {service.content.target_audience.map((item) => (
              <li
                key={item.text}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                {escapeHtml(item.text)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.content.benefits.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">יתרונות</h2>
          <ul className="space-y-3">
            {service.content.benefits.map((item) => (
              <li
                key={item.text}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3"
              >
                {escapeHtml(item.text)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.content.process_steps.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">שלבי התהליך</h2>
          <ol className="space-y-4">
            {service.content.process_steps.map((step, index) => (
              <li
                key={`${step.title}-${index}`}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <h3 className="text-card-title">
                  {index + 1}. {escapeHtml(step.title)}
                </h3>
                <p className="mt-2 text-body text-[var(--color-text-muted)]">
                  {escapeHtml(step.description)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {service.content.faq.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">שאלות נפוצות</h2>
          <div className="space-y-3">
            {service.content.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  {escapeHtml(item.question)}
                </summary>
                <p className="mt-3 text-body text-[var(--color-text-muted)]">
                  {escapeHtml(item.answer)}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {service.content.cta_title ? (
        <section className="rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-6 py-8 text-[var(--color-text-on-primary)] sm:px-8">
          <h2 className="text-section-title text-[var(--color-text-on-primary)]">
            {escapeHtml(service.content.cta_title)}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 opacity-90">
            {escapeHtml(service.content.cta_text)}
          </p>
          {service.content.cta_button_label && service.content.cta_link_url ? (
            <p className="mt-5 inline-flex rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-primary)]">
              {escapeHtml(service.content.cta_button_label)}
            </p>
          ) : null}
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
