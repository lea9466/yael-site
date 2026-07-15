import { Quote } from "lucide-react";

import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { TestimonialContent } from "@/components/testimonials/testimonial-content";
import { TestimonialServiceLabel } from "@/components/testimonials/testimonial-service-label";
import {
  getTestimonialInitials,
  publishedToPublicationStatus,
} from "@/lib/testimonials/format";
import { normalizeTestimonialContent } from "@/lib/testimonials/text";
import type { TestimonialFormValues } from "@/lib/testimonials/types";
import { cn } from "@/lib/utils/cn";

type TestimonialPublicViewProps = {
  name: string;
  city?: string | null;
  content: string;
  featured?: boolean;
  isPublished?: boolean;
  serviceTitle?: string | null;
  mode?: "public" | "preview";
  className?: string;
};

export function TestimonialPublicView({
  name,
  city,
  content,
  featured = false,
  isPublished = false,
  serviceTitle,
  mode = "public",
  className,
}: TestimonialPublicViewProps) {
  const displayName = name.trim().length > 0 ? name.trim() : "שם הלקוח";
  const displayContent = normalizeTestimonialContent(content);
  const subtitle = city?.trim() || null;
  const initials = getTestimonialInitials(displayName);
  const publicationStatus = publishedToPublicationStatus(isPublished);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8",
        "before:absolute before:inset-inline-end-0 before:top-0 before:h-24 before:w-24 before:rounded-full before:bg-[var(--color-coral-soft)]/50 before:blur-2xl",
        className
      )}
    >
      <div className="relative space-y-5">
        {mode === "preview" ? (
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge status={publicationStatus} size="sm" />
            {featured ? <AdminFeaturedBadge size="sm" /> : null}
            <TestimonialServiceLabel serviceTitle={serviceTitle} size="sm" />
          </div>
        ) : null}

        <Quote
          aria-hidden="true"
          className="size-8 text-[var(--color-warm-gold)]/80"
        />

        <blockquote>
          <TestimonialContent content={displayContent} quoted />
        </blockquote>

        <footer className="flex items-center gap-4 border-t border-[var(--color-border)]/60 pt-5">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)]/35 text-sm font-semibold text-[var(--color-primary)]"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <cite className="not-italic">
              <p className="truncate text-base font-semibold text-[var(--color-primary)]">
                {displayName}
              </p>
            </cite>
            {subtitle ? (
              <p className="truncate text-sm text-[var(--color-text-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </footer>
      </div>
    </article>
  );
}

type TestimonialPreviewCardProps = {
  values: TestimonialFormValues;
  serviceTitle?: string | null;
};

export function TestimonialPreviewCard({
  values,
  serviceTitle,
}: TestimonialPreviewCardProps) {
  return (
    <TestimonialPublicView
      mode="preview"
      name={values.name}
      city={values.city}
      content={values.content}
      featured={values.featured}
      isPublished={values.publication_status === "published"}
      serviceTitle={serviceTitle}
    />
  );
}
