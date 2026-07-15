const ALLOWED_PROTOCOLS = new Set(["https:", "http:", "mailto:", "tel:"]);

export type LinkValidationResult =
  | { valid: true; url: string }
  | { valid: false; error: string };

/**
 * Validates a user-supplied link URL for the article editor.
 *
 * Allows absolute https/http/mailto/tel URLs and internal relative paths
 * beginning with "/". Rejects dangerous schemes (javascript:, data:, file:)
 * and malformed URLs.
 */
export function validateArticleLinkUrl(rawValue: string): LinkValidationResult {
  const value = rawValue.trim();

  if (!value) {
    return { valid: false, error: "יש להזין כתובת קישור" };
  }

  if (value.startsWith("/")) {
    if (value.startsWith("//")) {
      return { valid: false, error: "כתובת הקישור אינה תקינה" };
    }

    return { valid: true, url: value };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { valid: false, error: "כתובת הקישור אינה תקינה" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      valid: false,
      error: "סוג קישור זה אינו נתמך. ניתן להשתמש ב-https, mailto או tel",
    };
  }

  return { valid: true, url: value };
}

export function isValidArticleLinkUrl(rawValue: string): boolean {
  return validateArticleLinkUrl(rawValue).valid;
}

export function isInternalArticleLink(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function isExternalHttpArticleLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
