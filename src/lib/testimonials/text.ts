/**
 * Trims whitespace only at the start and end of a string.
 * Internal newlines and paragraph spacing are preserved.
 */
export function trimOuterWhitespace(value: string): string {
  return value.replace(/^\s+|\s+$/g, "");
}

export function normalizeTestimonialContent(value: string): string {
  return trimOuterWhitespace(value);
}

export function getTestimonialContentLength(value: string): number {
  return normalizeTestimonialContent(value).length;
}
