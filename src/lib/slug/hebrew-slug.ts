const HEBREW_LETTER_PATTERN = /[\u05D0-\u05EA]/;
const ENGLISH_LETTER_PATTERN = /[a-zA-Z]/;
const DIGIT_PATTERN = /[0-9]/;
const WHITESPACE_PATTERN = /\s/;

/** Slug segment: Hebrew letters, English lowercase, or digits. */
const SLUG_SEGMENT = "[\\u05D0-\\u05EAa-z0-9]+";

export const HEBREW_SLUG_PATTERN = new RegExp(
  `^${SLUG_SEGMENT}(-${SLUG_SEGMENT})*$`
);

export function containsHebrew(value: string): boolean {
  return HEBREW_LETTER_PATTERN.test(value);
}

export function slugifyHebrewTitle(title: string, fallback: string): string {
  let buffer = "";

  for (const char of title.normalize("NFC")) {
    if (
      HEBREW_LETTER_PATTERN.test(char) ||
      ENGLISH_LETTER_PATTERN.test(char) ||
      DIGIT_PATTERN.test(char)
    ) {
      buffer += ENGLISH_LETTER_PATTERN.test(char)
        ? char.toLowerCase()
        : char;
      continue;
    }

    if (WHITESPACE_PATTERN.test(char) || char === "_") {
      buffer += " ";
    }
  }

  const slug = buffer
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length > 0 ? slug : fallback;
}

export function isValidSlug(slug: string): boolean {
  return HEBREW_SLUG_PATTERN.test(slug);
}

export async function buildUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export type SlugSuffix = {
  base: string;
  numericSuffix: number | null;
  copySuffix: boolean;
};

export function parseSlugSuffix(slug: string): SlugSuffix {
  const copyMatch = slug.match(/^(.*)-copy(?:-(\d+))?$/);

  if (copyMatch) {
    const numericSuffix = copyMatch[2] ? Number.parseInt(copyMatch[2], 10) : null;

    return {
      base: copyMatch[1],
      numericSuffix,
      copySuffix: true,
    };
  }

  const numericMatch = slug.match(/^(.*)-(\d+)$/);

  if (numericMatch) {
    const numericSuffix = Number.parseInt(numericMatch[2], 10);

    if (numericSuffix >= 2) {
      return {
        base: numericMatch[1],
        numericSuffix,
        copySuffix: false,
      };
    }
  }

  return {
    base: slug,
    numericSuffix: null,
    copySuffix: false,
  };
}

export function applySlugSuffix(
  baseSlug: string,
  suffix: Pick<SlugSuffix, "numericSuffix" | "copySuffix">
): string {
  let slug = baseSlug;

  if (suffix.copySuffix) {
    slug = `${slug}-copy`;
  }

  if (suffix.numericSuffix !== null) {
    slug = `${slug}-${suffix.numericSuffix}`;
  }

  return slug;
}
