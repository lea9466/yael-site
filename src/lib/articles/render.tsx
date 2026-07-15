import Link from "next/link";

import { isRangeFullyMarked } from "@/lib/articles/marks";
import {
  isExternalHttpArticleLink,
  isInternalArticleLink,
  isValidArticleLinkUrl,
} from "@/lib/articles/link-validation";
import type { ArticleBlock, ArticleTextMark } from "@/lib/articles/types";
import { escapeHtml, sanitizePlainText } from "@/lib/services/sanitize";

type RenderSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
};

function isValidLink(href: string): boolean {
  return isValidArticleLinkUrl(href);
}

function getValidMarks(text: string, marks: ArticleTextMark[] = []): ArticleTextMark[] {
  return marks.filter(
    (mark) =>
      mark.start >= 0 &&
      mark.end <= text.length &&
      mark.end > mark.start &&
      (mark.type !== "link" || (mark.href && isValidLink(mark.href)))
  );
}

function getLinkHrefForRange(
  marks: ArticleTextMark[],
  rangeStart: number,
  rangeEnd: number
): string | undefined {
  if (!isRangeFullyMarked(marks, "link", rangeStart, rangeEnd)) {
    return undefined;
  }

  const linkMark = marks.find(
    (mark) =>
      mark.type === "link" &&
      mark.start <= rangeStart &&
      mark.end >= rangeEnd &&
      mark.href &&
      isValidLink(mark.href)
  );

  return linkMark?.href;
}

function buildSegments(text: string, marks: ArticleTextMark[] = []): RenderSegment[] {
  const safeText = sanitizePlainText(text);

  if (safeText.length === 0) {
    return [];
  }

  const validMarks = getValidMarks(safeText, marks);

  if (validMarks.length === 0) {
    return [{ text: safeText }];
  }

  const breakpoints = new Set<number>([0, safeText.length]);

  for (const mark of validMarks) {
    breakpoints.add(mark.start);
    breakpoints.add(mark.end);
  }

  const points = [...breakpoints].sort((left, right) => left - right);
  const segments: RenderSegment[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const rangeStart = points[index];
    const rangeEnd = points[index + 1];

    if (rangeStart >= rangeEnd) {
      continue;
    }

    const segmentText = safeText.slice(rangeStart, rangeEnd);
    const segment: RenderSegment = { text: segmentText };

    if (isRangeFullyMarked(validMarks, "bold", rangeStart, rangeEnd)) {
      segment.bold = true;
    }

    if (isRangeFullyMarked(validMarks, "italic", rangeStart, rangeEnd)) {
      segment.italic = true;
    }

    const href = getLinkHrefForRange(validMarks, rangeStart, rangeEnd);

    if (href) {
      segment.href = href;
    }

    segments.push(segment);
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
      const linkClassName =
        "font-medium text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-4 hover:decoration-[var(--color-primary)]";

      if (isInternalArticleLink(segment.href)) {
        return (
          <Link key={`link-${index}`} href={segment.href} className={linkClassName}>
            {node}
          </Link>
        );
      }

      const isExternal = isExternalHttpArticleLink(segment.href);

      return (
        <a
          key={`link-${index}`}
          href={segment.href}
          className={linkClassName}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {node}
        </a>
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
        <p className="article-content text-body leading-[1.9] text-[var(--color-text)]">
          {renderArticleRichText(block.text, block.marks)}
        </p>
      );
    case "heading":
      if (block.level === 3) {
        return (
          <h3 className="article-content text-xl font-semibold leading-snug text-[var(--color-text)]">
            {renderArticleRichText(block.text, block.marks)}
          </h3>
        );
      }

      return (
        <h2 className="article-content text-2xl font-semibold leading-snug text-[var(--color-text)]">
          {renderArticleRichText(block.text, block.marks)}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="article-content border-s-4 border-[var(--color-sky-blue)]/50 bg-[var(--color-sky-blue-soft)]/35 px-5 py-4 text-lg italic leading-[1.85] text-[var(--color-text-muted)]">
          {renderArticleRichText(block.text, block.marks)}
        </blockquote>
      );
    case "list": {
      const ListTag = block.list_type === "ordered" ? "ol" : "ul";
      const listClass =
        block.list_type === "ordered"
          ? "article-content list-decimal space-y-2 ps-6 text-body leading-[1.85]"
          : "article-content list-disc space-y-2 ps-6 text-body leading-[1.85]";

      return (
        <ListTag className={listClass}>
          {block.items.map((item, index) => (
            <li key={`${index}-${item.text}`} className="article-content">
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
            alt={imageAlt ?? block.caption ?? "תמונה בפוסט"}
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
