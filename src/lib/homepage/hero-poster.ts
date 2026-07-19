import type { HomepageHeroMediaPreview } from "@/lib/homepage/queries";
import { isVideoMimeType } from "@/lib/media/mime";

export function resolveHeroPosterUrl(
  activePreview: HomepageHeroMediaPreview | null,
  desktopPreview: HomepageHeroMediaPreview | null,
  mobilePreview: HomepageHeroMediaPreview | null
): string | null {
  if (!activePreview || !isVideoMimeType(activePreview.mimeType)) {
    return null;
  }

  if (desktopPreview && !isVideoMimeType(desktopPreview.mimeType)) {
    return desktopPreview.url;
  }

  if (mobilePreview && !isVideoMimeType(mobilePreview.mimeType)) {
    return mobilePreview.url;
  }

  return null;
}

export function resolveBootstrapPosterUrl(
  desktopPreview: HomepageHeroMediaPreview | null,
  mobilePreview: HomepageHeroMediaPreview | null
): string | null {
  if (desktopPreview && !isVideoMimeType(desktopPreview.mimeType)) {
    return desktopPreview.url;
  }

  if (mobilePreview && !isVideoMimeType(mobilePreview.mimeType)) {
    return mobilePreview.url;
  }

  return null;
}
