import { PUBLIC_MEDIA_BUCKET } from "@/lib/media/constants";

export function getPublicMediaUrl(storagePath: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return null;
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${normalizedBase}/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/${encodedPath}`;
}
