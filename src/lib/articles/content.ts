import { createEmptyStoredSeo } from "@/lib/seo/resolve";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type {
  ArticleBlock,
  ArticleContent,
  ArticleGalleryItem,
  ArticleTextMark,
} from "@/lib/articles/types";

export function createDefaultArticleContent(): ArticleContent {
  return {
    blocks: [],
    gallery: [],
  };
}

export function createDefaultArticleSeo() {
  return createEmptyStoredSeo();
}

export function normalizeGalleryForSave(
  gallery: ArticleContent["gallery"]
): ArticleContent["gallery"] {
  return gallery
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      media_id: item.media_id,
      order: index,
    }));
}

function normalizeMarks(value: unknown): ArticleTextMark[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (mark): mark is ArticleTextMark =>
        typeof mark === "object" &&
        mark !== null &&
        "type" in mark &&
        "start" in mark &&
        "end" in mark &&
        (mark.type === "bold" ||
          mark.type === "italic" ||
          mark.type === "link") &&
        typeof mark.start === "number" &&
        typeof mark.end === "number"
    )
    .map((mark) => ({
      type: mark.type,
      start: mark.start,
      end: mark.end,
      href:
        mark.type === "link" && typeof mark.href === "string"
          ? mark.href.trim()
          : undefined,
    }));
}

function normalizeBlock(value: unknown): ArticleBlock | null {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  switch (record.type) {
    case "paragraph":
    case "quote":
      return {
        type: record.type,
        text: typeof record.text === "string" ? record.text : "",
        marks: normalizeMarks(record.marks),
      };
    case "heading":
      return {
        type: "heading",
        level: record.level === 3 ? 3 : 2,
        text: typeof record.text === "string" ? record.text : "",
        marks: normalizeMarks(record.marks),
      };
    case "list": {
      const items = Array.isArray(record.items)
        ? record.items
            .filter(
              (item): item is { text: string; marks?: unknown } =>
                typeof item === "object" &&
                item !== null &&
                "text" in item &&
                typeof item.text === "string"
            )
            .map((item) => ({
              text: item.text,
              marks: normalizeMarks(item.marks),
            }))
        : [];

      return {
        type: "list",
        list_type: record.list_type === "ordered" ? "ordered" : "bullet",
        items,
      };
    }
    case "image":
      return {
        type: "image",
        media_id: typeof record.media_id === "string" ? record.media_id : "",
        caption:
          typeof record.caption === "string" && record.caption.trim().length > 0
            ? record.caption.trim()
            : null,
      };
    default:
      return null;
  }
}

export function normalizeArticleContent(content: unknown): ArticleContent {
  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return createDefaultArticleContent();
  }

  const record = content as Partial<ArticleContent>;
  const blocks = Array.isArray(record.blocks)
    ? record.blocks
        .map((block) => normalizeBlock(block))
        .filter((block): block is ArticleBlock => block !== null)
    : [];

  return {
    blocks,
    gallery: Array.isArray(record.gallery)
      ? record.gallery.filter(
          (item): item is ArticleGalleryItem =>
            typeof item === "object" &&
            item !== null &&
            "media_id" in item &&
            typeof item.media_id === "string"
        )
      : [],
  };
}

export function extractPlainTextFromBlocks(blocks: ArticleBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        if (block.text.trim().length > 0) {
          parts.push(sanitizePlainText(block.text));
        }
        break;
      case "list":
        for (const item of block.items) {
          if (item.text.trim().length > 0) {
            parts.push(sanitizePlainText(item.text));
          }
        }
        break;
      case "image":
        if (block.caption) {
          parts.push(sanitizePlainText(block.caption));
        }
        break;
      default:
        break;
    }
  }

  return parts.join("\n\n").trim();
}

export function buildArticleBody(blocks: ArticleBlock[]): string {
  return extractPlainTextFromBlocks(blocks);
}

export function normalizeBlocksForSave(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
          return {
            ...block,
            text: block.text.trim(),
            marks: block.marks?.filter(
              (mark) => mark.start >= 0 && mark.end > mark.start
            ),
          };
        case "list":
          return {
            ...block,
            items: block.items
              .map((item) => ({
                text: item.text.trim(),
                marks: item.marks?.filter(
                  (mark) => mark.start >= 0 && mark.end > mark.start
                ),
              }))
              .filter((item) => item.text.length > 0),
          };
        case "image":
          return {
            ...block,
            caption:
              block.caption && block.caption.trim().length > 0
                ? block.caption.trim()
                : null,
          };
        default:
          return block;
      }
    })
    .filter((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
          return block.text.length > 0;
        case "list":
          return block.items.length > 0;
        case "image":
          return block.media_id.length > 0;
        default:
          return false;
      }
    });
}

export function toArticleContentForSave(
  content: ArticleContent
): ArticleContent {
  return {
    blocks: normalizeBlocksForSave(content.blocks),
    gallery: normalizeGalleryForSave(content.gallery),
  };
}

export function hasPublishableArticleContent(blocks: ArticleBlock[]): boolean {
  return normalizeBlocksForSave(blocks).length > 0;
}
