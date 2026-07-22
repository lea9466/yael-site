import {
  HERO_VIDEO_MIME_TYPES,
  PDF_MIME_TYPE,
  type HeroVideoMimeType,
} from "@/lib/media/constants";

export function isVideoMimeType(
  mimeType: string
): mimeType is HeroVideoMimeType {
  return HERO_VIDEO_MIME_TYPES.includes(mimeType as HeroVideoMimeType);
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === PDF_MIME_TYPE;
}

export function isImageMimeType(mimeType: string): boolean {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp"
  );
}
