import { PUBLIC_MEDIA_BUCKET } from "@/lib/media/constants";
import { SITE_ORIGIN } from "@/lib/site/constants";

function encodeStoragePath(storagePath: string): string {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * The real Supabase Storage URL. Only ever fetch this server-side (from the
 * /api/media proxy route) — never render it into a page. Content filters
 * that scan a page's own HTML/RSC payload for the raw Supabase domain (not
 * just resources they can see loading) will kill the connection carrying
 * the whole page the instant that domain appears anywhere in it, taking
 * down the entire site for anyone behind that filter — regardless of
 * whether the referenced file is actually a video, an image, or anything
 * else. See getPublicMediaUrl.
 */
export function getUpstreamSupabaseMediaUrl(storagePath: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return null;
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");

  return `${normalizedBase}/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/${encodeStoragePath(storagePath)}`;
}

/**
 * Public-facing URL for media referenced anywhere in a page. Always
 * same-origin (proxied through /api/media/[...path]) instead of the raw
 * Supabase domain — see getUpstreamSupabaseMediaUrl for why.
 */
export function getPublicMediaUrl(storagePath: string): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  return `${SITE_ORIGIN}/api/media/${encodeStoragePath(storagePath)}`;
}
