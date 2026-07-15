import Link from "next/link";

import type { ArticleBlock, ArticleTextMark } from "@/lib/articles/types";
import { escapeHtml, sanitizePlainText } from "@/lib/services/sanitize";

type RenderSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
};

function isValidLink(href: string): boolean {
  try {
    const url = new URL(href);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildSegments(text: string, marks: ArticleTextMark[] = []): RenderSegment[] {
  const safeText = sanitizePlainText(text);

  if (safeText.length === 0) {
    return [];
  }

  if (marks.length === 0) {
    return [{ text: safeText }];
  }

  const sortedMarks = marks
    .filter(
      (mark) =>
        mark.start >= 0 &&
        mark.end <= safeText.length &&
        mark.end > mark.start &&
        (mark.type !== "link" || (mark.href && isValidLink(mark.href)))
    )
    .sort((left, right) => left.start - right.start || left.end - right.end);

  const segments: RenderSegment[] = [];
  let cursor = 0;

  for (const mark of sortedMarks) {
    if (mark.start > cursor) {
      segments.push({ text: safeText.slice(cursor, mark.start) });
    }

    const markedText = safeText.slice(mark.start, mark.end);
    const segment: RenderSegment = { text: markedText };

    if (mark.type === "bold") {
      segment.bold = true;
    }

    if (mark.type === "italic") {
      segment.italic = true;
    }

    if (mark.type === "link" && mark.href && isValidLink(mark.href)) {
      segment.href = mark.href;
    }

    segments.push(segment);
    cursor = mark.end;
  }

  if (cursor < safeText.length) {
    segments.push({ text: safeText.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ text: safeText }];
}

function renderSegments(segments: RenderSegment[]): React.ReactNode[] {
  return segments.map((segment, index) => {
    let node: React.ReactNode = escapeHtml(segment.text);

    if (segment.italic) {
      node = <em key={`em-${index}`}>{node}</em>;
    }

    if (segment.bold) {
      node = <strong key={`strong-${index}`}>{node}</strong>;
    }

    if (segment.href) {
      return (
        <Link
          key={`link-${index}`}
          href={segment.href}
          className="font-medium text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-4 hover:decoration-[var(--color-primary)]"
          rel="noopener noreferrer"
          target="_blank"
        >
          {node}
        </Link>
      );
    }

    return <span key={`segment-${index}`}>{node}</span>;
  });
}

export function renderArticleRichText(
  text: string,
  marks?: ArticleTextMark[]
): React.ReactNode {
  const segments = buildSegments(text, marks);

  if (segments.length === 0) {
    return null;
  }

  return renderSegments(segments);
}

type ArticleBlockRendererProps = {
  block: ArticleBlock;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export function ArticleBlockRenderer({
  block,
  imageUrl,
  imageAlt,
}: ArticleBlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-body leading-[1.9] text-[var(--color-text)]">
          {renderArticleRichText(block.text, block.marks)}
        </p>
      );
    case "heading":
      if (block.level === 3) {
        return (
          <h3 className="text-xl font-semibold leading-snug text-[var(--color-text)]">
            {renderArticleRichText(block.text, block.marks)}
          </h3>
        );
      }

      return (
        <h2 className="text-2xl font-semibold leading-snug text-[var(--color-text)]">
          {renderArticleRichText(block.text, block.marks)}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="border-s-4 border-[var(--color-sky-blue)]/50 bg-[var(--color-sky-blue-soft)]/35 px-5 py-4 text-lg italic leading-[1.85] text-[var(--color-text-muted)]">
          {renderArticleRichText(block.text, block.marks)}
        </blockquote>
      );
    case "list": {
      const ListTag = block.list_type === "ordered" ? "ol" : "ul";
      const listClass =
        block.list_type === "ordered"
          ? "list-decimal space-y-2 ps-6 text-body leading-[1.85]"
          : "list-disc space-y-2 ps-6 text-body leading-[1.85]";

      return (
        <ListTag className={listClass}>
          {block.items.map((item, index) => (
            <li key={`${index}-${item.text}`}>
              {renderArticleRichText(item.text, item.marks)}
            </li>
          ))}
        </ListTag>
      );
    }
    case "image":
      if (!imageUrl) {
        return (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
            תמונה חסרה
          </div>
        );
      }

      return (
        <figure className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt ?? block.caption ?? "תמונה במאמר"}
            className="w-full rounded-[var(--radius-xl)] object-cover"
          />
          {block.caption ? (
            <figcaption className="text-center text-sm text-[var(--color-text-muted)]">
              {escapeHtml(block.caption)}
            </figcaption>
          ) : null}
        </figure>
      );
    default:
      return null;
  }
}
