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

export function getYouTubeOrVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");

      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");

      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).at(-1);

      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

// Turns a Google Drive share link into the embeddable /preview player URL.
// Accepts the common shapes: /file/d/<id>/view, /file/d/<id>/preview,
// open?id=<id> and uc?id=<id>. The Drive file must be shared so that
// "anyone with the link" can view it, otherwise the embed shows a login wall.
export function getGoogleDriveEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "drive.google.com") {
      return null;
    }

    const filePathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const id = filePathMatch?.[1] ?? parsed.searchParams.get("id");

    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
  } catch {
    return null;
  }
}

// Resolves any supported external video host (YouTube, Vimeo, Google Drive)
// to an iframe-embeddable URL, or null for a direct file URL / unknown host.
export function getExternalVideoEmbedUrl(url: string): string | null {
  return getYouTubeOrVimeoEmbedUrl(url) ?? getGoogleDriveEmbedUrl(url);
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
