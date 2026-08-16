export type HeroVideoEmbedParams = {
  src: string;
  mimeType?: string;
  posterUrl?: string | null;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

export function buildHeroVideoEmbedSrc({
  src,
  mimeType,
  posterUrl,
  title,
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
}: HeroVideoEmbedParams): string {
  const params = new URLSearchParams();
  params.set("src", src);

  if (mimeType) {
    params.set("type", mimeType);
  }

  if (posterUrl) {
    params.set("poster", posterUrl);
  }

  if (title) {
    params.set("title", title);
  }

  params.set("autoplay", autoplay ? "1" : "0");
  params.set("loop", loop ? "1" : "0");
  params.set("muted", muted ? "1" : "0");
  params.set("controls", controls ? "1" : "0");

  return `/embed/hero-video?${params.toString()}`;
}

// The embed page is a public route, so this only needs to stop it being
// abused as an open redirect / arbitrary-content frame (non-https schemes
// like javascript:/data:). The video URLs it receives already come from
// trusted sources: the media library (Supabase storage) or an admin-entered
// hero video URL.
export function isAllowedHeroVideoSrc(src: string): boolean {
  if (!src) {
    return false;
  }

  try {
    return new URL(src).protocol === "https:";
  } catch {
    return false;
  }
}
