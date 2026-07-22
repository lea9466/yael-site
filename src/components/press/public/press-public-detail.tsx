import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { formatPressDate } from "@/lib/press/date";
import type { PressArticlePublicDetail } from "@/lib/press/types";

type PressPublicDetailViewProps = {
  article: PressArticlePublicDetail;
};

export function PressPublicDetailView({ article }: PressPublicDetailViewProps) {
  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-16">
      <nav aria-label="פירורי לחם" className="mb-8 text-caption text-[var(--color-text-muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="public-focus-ring hover:text-[var(--color-primary)]">
              בית
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/press"
              className="public-focus-ring hover:text-[var(--color-primary)]"
            >
              כתבות
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--color-text)]">{article.title}</li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl space-y-4">
        <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
          {article.publication_name}
        </p>
        <h1 className="text-page-title">{article.title}</h1>
        <p className="text-[var(--color-text-muted)]">
          {formatPressDate(article.published_at)}
        </p>
        {article.excerpt ? (
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)]">
            {article.excerpt}
          </p>
        ) : null}
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          תצוגת הכתבה
        </p>
        <a
          href={article.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="public-focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-4 text-sm font-medium text-[var(--color-primary)] transition-[background-color] duration-[var(--transition-base)] hover:bg-[var(--color-light-sage-soft)]"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          פתח במסך מלא
        </a>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        <iframe
          title={`כתבה: ${article.title}`}
          src={`${article.pdfUrl}#toolbar=1&navpanes=0`}
          className="h-[min(80vh,56rem)] w-full bg-[var(--color-surface-soft)]"
        />
      </div>

      <div className="mt-10">
        <Link
          href="/press"
          className="public-focus-ring text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          חזרה לכל הכתבות
        </Link>
      </div>
    </article>
  );
}
