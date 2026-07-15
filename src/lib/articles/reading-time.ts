import { READING_WORDS_PER_MINUTE } from "@/lib/articles/constants";
import { extractPlainTextFromBlocks } from "@/lib/articles/content";
import type { ArticleBlock } from "@/lib/articles/types";

export function countWords(text: string): number {
  const normalized = text.trim();

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.split(/\s+/).filter(Boolean).length;
}

export function calculateReadingTimeMinutes(blocks: ArticleBlock[]): number {
  const plainText = extractPlainTextFromBlocks(blocks);
  const words = countWords(plainText);

  if (words === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return "דקת קריאה";
  }

  return `${minutes} דקות קריאה`;
}
