/**
 * Normalizes a dynamic route slug from Next.js params.
 * Handles percent-encoding that can appear with non-ASCII (Hebrew) slugs.
 */
export function normalizeRouteSlug(slug: string): string {
  const trimmed = slug.trim();

  if (!trimmed) {
    return trimmed;
  }

  let current = trimmed;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const decoded = decodeURIComponent(current);

      if (decoded === current) {
        break;
      }

      current = decoded;
    } catch {
      break;
    }
  }

  return current;
}
