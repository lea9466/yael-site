import { RESERVED_SERVICE_SLUGS } from "@/lib/services/constants";

const HEBREW_TO_LATIN: Record<string, string> = {
  א: "",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "ch",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  פ: "p",
  ף: "p",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function transliterateToSlugSource(value: string): string {
  let result = "";

  for (const char of value.normalize("NFC")) {
    if (HEBREW_TO_LATIN[char] !== undefined) {
      result += HEBREW_TO_LATIN[char];
      continue;
    }

    result += char;
  }

  return result;
}

export function slugifyTitle(title: string): string {
  const transliterated = transliterateToSlugSource(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return transliterated.length > 0 ? transliterated : "service";
}

export function isValidServiceSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function isReservedServiceSlug(slug: string): boolean {
  return (RESERVED_SERVICE_SLUGS as readonly string[]).includes(slug);
}

export async function buildUniqueServiceSlug(
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

export function buildDuplicateTitle(title: string): string {
  const suffix = "(עותק)";

  if (title.endsWith(suffix)) {
    return `${title} 2`;
  }

  return `${title} ${suffix}`;
}

export function buildDuplicateSlugBase(slug: string): string {
  const copySuffix = "-copy";

  if (slug.endsWith(copySuffix)) {
    return `${slug}-2`;
  }

  return `${slug}${copySuffix}`;
}
