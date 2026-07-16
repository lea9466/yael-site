import Link from "next/link";
import Image from "next/image";

import { ArticleBlockRenderer } from "@/lib/articles/render";
import type { AboutPageData } from "@/lib/validations/about";
import type { AboutMediaPreview } from "@/lib/about/queries";
import { escapeHtml } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type AboutPublicViewProps = {
  data: AboutPageData;
  coverPreview: AboutMediaPreview | null;
  blockMediaUrls: Map<string, AboutMediaPreview>;
  mode?: "public" | "preview";
};

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

export function AboutPublicView({
  data,
  coverPreview,
  blockMediaUrls,
  mode = "public",
}: AboutPublicViewProps) {
  const isPreview = mode === "preview";
  const hasBlocks = data.content.blocks.length > 0;

  return (
    <article
      className={cn(
        "w-full space-y-10",
        isPreview
          ? "rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 sm:p-8"
          : "mx-auto max-w-4xl"
      )}
    >
      <header className={cn("space-y-5", isPreview && "mx-auto w-full max-w-[900px]")}>
        {coverPreview?.url ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]">
            <Image
              src={coverPreview.url}
              alt={coverPreview.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : isPreview ? (
          <EmptySectionNote>טרם נבחרה תמונת שער</EmptySectionNote>
        ) : null}

        <div className="space-y-3">
          <h1 className="text-page-title">{escapeHtml(data.title)}</h1>
          {data.intro_text ? (
            <p className="text-lg text-[var(--color-text-muted)]">
              {escapeHtml(data.intro_text)}
            </p>
          ) : isPreview ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              ללא כותרת משנה
            </p>
          ) : null}
        </div>
      </header>

      <section className={cn("space-y-6", isPreview && "mx-auto w-full max-w-[900px]")}>
        {hasBlocks ? (
          data.content.blocks.map((block, index) => {
            const media =
              block.type === "image"
                ? blockMediaUrls.get(block.media_id)
                : undefined;

            return (
              <ArticleBlockRenderer
                key={`${index}-${block.type}`}
                block={block}
                imageUrl={media?.url}
                imageAlt={media?.alt}
              />
            );
          })
        ) : isPreview ? (
          <EmptySectionNote>טרם נוסף תוכן עריכה</EmptySectionNote>
        ) : null}
      </section>

      <section
        className={cn(
          "rounded-[var(--radius-xl)] bg-[var(--color-light-sage-soft)] px-6 py-8 sm:px-8",
          isPreview && "mx-auto w-full max-w-[900px]"
        )}
      >
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-primary)]">
            {escapeHtml(data.cta.title)}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">
            {escapeHtml(data.cta.text)}
          </p>
          {isPreview ? (
            <span className="inline-flex h-11 items-center rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 text-sm font-medium text-[var(--color-text-on-primary)]">
              {escapeHtml(data.cta.button_label)}
            </span>
          ) : (
            <Link
              href={data.cta.button_url}
              className="inline-flex h-11 items-center rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 text-sm font-medium text-[var(--color-text-on-primary)]"
            >
              {escapeHtml(data.cta.button_label)}
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
