import { formatFileSize } from "@/lib/media/format";
import { isVideoMimeType } from "@/lib/media/mime";
import type { SettingsMediaPreview } from "@/lib/validations/site-settings";

export const HERO_VIDEO_RECOMMENDED_MAX_BYTES = 3 * 1024 * 1024;

export const HERO_VIDEO_WEIGHT_HINT =
  "לביצועים טובים מומלץ להשתמש בסרטון Hero קצר של 4–8 שניות ובמשקל של עד כ־3MB.";

export function shouldShowHeroVideoWeightHint(
  preview: SettingsMediaPreview | null
): boolean {
  if (!preview?.mimeType || !isVideoMimeType(preview.mimeType)) {
    return false;
  }

  if (preview.sizeBytes === undefined) {
    return false;
  }

  return preview.sizeBytes > HERO_VIDEO_RECOMMENDED_MAX_BYTES;
}

export function getHeroVideoWeightHintMessage(
  preview: SettingsMediaPreview | null
): string {
  if (!preview?.sizeBytes) {
    return HERO_VIDEO_WEIGHT_HINT;
  }

  return `${HERO_VIDEO_WEIGHT_HINT} (גודל הקובץ הנוכחי: ${formatFileSize(preview.sizeBytes)})`;
}
