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

/** Legacy Latin transliteration slug generator used before Hebrew slugs. */
export function legacySlugifyTitle(title: string, fallback: string): string {
  const transliterated = transliterateToSlugSource(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return transliterated.length > 0 ? transliterated : fallback;
}
