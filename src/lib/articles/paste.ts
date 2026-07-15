import { validateArticleLinkUrl } from "@/lib/articles/link-validation";
import type { ArticleTextMark } from "@/lib/articles/types";

export type TextWithMarks = {
  text: string;
  marks: ArticleTextMark[];
};

export type PastedBlockDraft =
  | { kind: "paragraph"; text: string; marks: ArticleTextMark[] }
  | { kind: "heading"; level: 2 | 3; text: string; marks: ArticleTextMark[] }
  | { kind: "quote"; text: string; marks: ArticleTextMark[] }
  | {
      kind: "list";
      list_type: "bullet" | "ordered";
      items: TextWithMarks[];
    };

function normalizeWhitespace(value: string): string {
  return value.replace(/[\r\n\t\f\v]+/g, " ").replace(/ {2,}/g, " ");
}

function trimTextWithMarks(text: string, marks: ArticleTextMark[]): TextWithMarks {
  const leadingMatch = text.match(/^\s+/);
  const leadingTrim = leadingMatch ? leadingMatch[0].length : 0;
  const trimmedEnd = text.replace(/\s+$/, "");
  const finalText = text.slice(leadingTrim, trimmedEnd.length);

  const shiftedMarks = marks
    .map((mark) => ({
      ...mark,
      start: mark.start - leadingTrim,
      end: mark.end - leadingTrim,
    }))
    .map((mark) => ({
      ...mark,
      start: Math.max(0, mark.start),
      end: Math.min(finalText.length, mark.end),
    }))
    .filter((mark) => mark.end > mark.start);

  return { text: finalText, marks: shiftedMarks };
}

/**
 * Splits raw pasted plain text into paragraphs. Since the article editor's
 * data model has no soft line-break primitive (each block is a single flat
 * string), every newline - blank or not - starts a new paragraph block.
 * Consecutive blank lines are collapsed instead of producing empty paragraphs.
 */
export function parsePastedPlainText(raw: string): PastedBlockDraft[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ kind: "paragraph" as const, text, marks: [] }));
}

function isBoldElement(el: HTMLElement): boolean {
  const tag = el.tagName;

  if (tag === "STRONG" || tag === "B") {
    return true;
  }

  const weight = el.style.fontWeight;

  if (!weight) {
    return false;
  }

  const numeric = Number.parseInt(weight, 10);

  return (Number.isFinite(numeric) && numeric >= 600) || weight === "bold";
}

function isItalicElement(el: HTMLElement): boolean {
  return (
    el.tagName === "EM" ||
    el.tagName === "I" ||
    el.style.fontStyle === "italic"
  );
}

type InlineContext = { bold: boolean; italic: boolean; href?: string };

function walkInline(
  node: ChildNode,
  ctx: InlineContext,
  state: { text: string },
  marks: ArticleTextMark[]
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const raw = node.textContent ?? "";
    const value = normalizeWhitespace(raw);

    if (!value) {
      return;
    }

    const start = state.text.length;
    state.text += value;
    const end = state.text.length;

    if (ctx.bold) {
      marks.push({ type: "bold", start, end });
    }

    if (ctx.italic) {
      marks.push({ type: "italic", start, end });
    }

    if (ctx.href) {
      marks.push({ type: "link", start, end, href: ctx.href });
    }

    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const el = node as HTMLElement;
  const tag = el.tagName;

  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
    return;
  }

  if (tag === "BR") {
    if (state.text.length > 0 && !state.text.endsWith(" ")) {
      state.text += " ";
    }

    return;
  }

  const nextCtx: InlineContext = {
    bold: ctx.bold || isBoldElement(el),
    italic: ctx.italic || isItalicElement(el),
    href: ctx.href,
  };

  if (tag === "A") {
    const rawHref = el.getAttribute("href");
    const validated = rawHref ? validateArticleLinkUrl(rawHref) : null;

    if (validated?.valid) {
      nextCtx.href = validated.url;
    }
  }

  el.childNodes.forEach((child) => walkInline(child, nextCtx, state, marks));
}

function extractInline(el: Element): TextWithMarks {
  const state = { text: "" };
  const marks: ArticleTextMark[] = [];

  el.childNodes.forEach((child) =>
    walkInline(child, { bold: false, italic: false }, state, marks)
  );

  return trimTextWithMarks(state.text, marks);
}

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

/**
 * Parses pasted HTML (e.g. from Google Docs or Word) into a flat list of
 * block drafts, extracting bold/italic/link marks and preserving paragraph,
 * heading, quote and list structure. Unsafe tags (scripts, styles, unknown
 * elements) are ignored; only text content and the safe inline marks above
 * are kept.
 */
export function parsePastedHtml(html: string): PastedBlockDraft[] {
  if (typeof DOMParser === "undefined") {
    return [];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const drafts: PastedBlockDraft[] = [];

  const visit = (node: Element): void => {
    const tag = node.tagName;

    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
      return;
    }

    if (tag === "UL" || tag === "OL") {
      const items = Array.from(node.children)
        .filter((child) => child.tagName === "LI")
        .map((li) => extractInline(li))
        .filter((item) => item.text.length > 0);

      if (items.length > 0) {
        drafts.push({
          kind: "list",
          list_type: tag === "OL" ? "ordered" : "bullet",
          items,
        });
      }

      return;
    }

    if (tag === "BLOCKQUOTE") {
      const { text, marks } = extractInline(node);

      if (text) {
        drafts.push({ kind: "quote", text, marks });
      }

      return;
    }

    if (HEADING_TAGS.has(tag)) {
      const { text, marks } = extractInline(node);

      if (text) {
        drafts.push({
          kind: "heading",
          level: tag === "H1" || tag === "H2" ? 2 : 3,
          text,
          marks,
        });
      }

      return;
    }

    if (tag === "P" || tag === "DIV" || tag === "LI") {
      const { text, marks } = extractInline(node);

      if (text) {
        drafts.push({ kind: "paragraph", text, marks });
      }

      return;
    }

    Array.from(node.children).forEach(visit);
  };

  Array.from(doc.body.children).forEach(visit);

  if (drafts.length === 0) {
    const { text, marks } = extractInline(doc.body);

    if (text) {
      drafts.push({ kind: "paragraph", text, marks });
    }
  }

  return drafts;
}

function shiftMarks(marks: ArticleTextMark[], delta: number): ArticleTextMark[] {
  return marks.map((mark) => ({
    ...mark,
    start: mark.start + delta,
    end: mark.end + delta,
  }));
}

function clipMarksBefore(marks: ArticleTextMark[], position: number): ArticleTextMark[] {
  return marks.filter((mark) => mark.end <= position);
}

function clipMarksFromAfter(
  marks: ArticleTextMark[],
  position: number
): ArticleTextMark[] {
  return shiftMarks(
    marks.filter((mark) => mark.start >= position),
    -position
  );
}

export type PasteInsertionPlan = {
  updatedCurrentText: string;
  updatedCurrentMarks: ArticleTextMark[];
  newBlocksAfter: PastedBlockDraft[];
};

/**
 * Builds the plan for splicing multi-paragraph pasted content into a
 * paragraph/heading/quote block: the first mergeable draft merges with the
 * text before the caret, the last mergeable draft merges with the text
 * after the caret, and everything else becomes new sibling blocks.
 *
 * Only called when `drafts.length >= 2` - single-segment pastes are left to
 * the browser's native paste handling.
 */
export function buildPasteInsertionPlan(
  currentText: string,
  currentMarks: ArticleTextMark[] | undefined,
  start: number,
  end: number,
  drafts: PastedBlockDraft[]
): PasteInsertionPlan {
  const marks = currentMarks ?? [];
  const beforeText = currentText.slice(0, start);
  const afterText = currentText.slice(end);
  const beforeMarks = clipMarksBefore(marks, start);
  const afterMarks = clipMarksFromAfter(marks, end);

  const firstDraft = drafts[0];
  const lastDraft = drafts[drafts.length - 1];

  let updatedCurrentText: string;
  let updatedCurrentMarks: ArticleTextMark[];
  let remainingDrafts: PastedBlockDraft[];

  if (firstDraft.kind !== "list") {
    updatedCurrentText = beforeText + firstDraft.text;
    updatedCurrentMarks = [
      ...beforeMarks,
      ...shiftMarks(firstDraft.marks, beforeText.length),
    ];
    remainingDrafts = drafts.slice(1);
  } else {
    updatedCurrentText = beforeText;
    updatedCurrentMarks = beforeMarks;
    remainingDrafts = drafts;
  }

  if (remainingDrafts.length === 0) {
    return {
      updatedCurrentText: updatedCurrentText + afterText,
      updatedCurrentMarks: [
        ...updatedCurrentMarks,
        ...shiftMarks(afterMarks, updatedCurrentText.length),
      ],
      newBlocksAfter: [],
    };
  }

  const lastRemainingIndex = remainingDrafts.length - 1;
  const lastRemaining = remainingDrafts[lastRemainingIndex];

  if (lastRemaining === lastDraft && lastRemaining.kind !== "list") {
    const mergedText = lastRemaining.text + afterText;
    const mergedMarks = [
      ...lastRemaining.marks,
      ...shiftMarks(afterMarks, lastRemaining.text.length),
    ];

    const merged: PastedBlockDraft =
      lastRemaining.kind === "heading"
        ? { ...lastRemaining, text: mergedText, marks: mergedMarks }
        : lastRemaining.kind === "quote"
          ? { ...lastRemaining, text: mergedText, marks: mergedMarks }
          : { kind: "paragraph", text: mergedText, marks: mergedMarks };

    const newBlocksAfter = [...remainingDrafts];
    newBlocksAfter[lastRemainingIndex] = merged;

    return { updatedCurrentText, updatedCurrentMarks, newBlocksAfter };
  }

  const trailing: PastedBlockDraft[] =
    afterText.length > 0 || afterMarks.length > 0
      ? [{ kind: "paragraph", text: afterText, marks: afterMarks }]
      : [];

  return {
    updatedCurrentText,
    updatedCurrentMarks,
    newBlocksAfter: [...remainingDrafts, ...trailing],
  };
}

/** Flattens block drafts (including list items) into plain text+marks segments. */
export function flattenDraftsToSegments(drafts: PastedBlockDraft[]): TextWithMarks[] {
  const segments: TextWithMarks[] = [];

  for (const draft of drafts) {
    if (draft.kind === "list") {
      segments.push(...draft.items);
    } else {
      segments.push({ text: draft.text, marks: draft.marks });
    }
  }

  return segments.filter((segment) => segment.text.length > 0);
}

export type ListItemPastePlan = {
  updatedCurrentText: string;
  updatedCurrentMarks: ArticleTextMark[];
  newItemsAfter: TextWithMarks[];
};

/**
 * Builds the plan for splicing multi-line pasted content into a single-line
 * list item input: each resulting text segment becomes its own list item,
 * with the first merging into the text before the caret and the last
 * merging into the text after the caret.
 *
 * Only called when `segments.length >= 2`.
 */
export function buildListItemPastePlan(
  currentText: string,
  currentMarks: ArticleTextMark[] | undefined,
  start: number,
  end: number,
  segments: TextWithMarks[]
): ListItemPastePlan {
  const marks = currentMarks ?? [];
  const beforeText = currentText.slice(0, start);
  const afterText = currentText.slice(end);
  const beforeMarks = clipMarksBefore(marks, start);
  const afterMarks = clipMarksFromAfter(marks, end);

  const [first, ...rest] = segments;

  const updatedCurrentText = beforeText + first.text;
  const updatedCurrentMarks = [
    ...beforeMarks,
    ...shiftMarks(first.marks, beforeText.length),
  ];

  if (rest.length === 0) {
    return {
      updatedCurrentText: updatedCurrentText + afterText,
      updatedCurrentMarks: [
        ...updatedCurrentMarks,
        ...shiftMarks(afterMarks, updatedCurrentText.length),
      ],
      newItemsAfter: [],
    };
  }

  const lastIndex = rest.length - 1;
  const newItemsAfter = rest.map((segment, index) => {
    if (index !== lastIndex) {
      return segment;
    }

    return {
      text: segment.text + afterText,
      marks: [...segment.marks, ...shiftMarks(afterMarks, segment.text.length)],
    };
  });

  return { updatedCurrentText, updatedCurrentMarks, newItemsAfter };
}
