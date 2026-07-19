export function normalizeMultilineText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function normalizeMultilineTextForSeo(value: string): string {
  return normalizeMultilineText(value).replace(/\s+/g, " ");
}

export function normalizeOptionalMultilineText(
  value: string | null | undefined
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = normalizeMultilineText(value);

  return normalized.length > 0 ? normalized : null;
}
