import { HERO_VIDEO_MIME_TYPES, type HeroVideoMimeType } from "@/lib/media/constants";

export function isVideoMimeType(mimeType: string): mimeType is HeroVideoMimeType {
  return HERO_VIDEO_MIME_TYPES.includes(mimeType as HeroVideoMimeType);
}
