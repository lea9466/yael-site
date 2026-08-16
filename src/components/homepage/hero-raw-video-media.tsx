"use client";

import { buildHeroVideoEmbedSrc } from "@/lib/homepage/hero-video-embed";

function getYouTubeEmbedUrl(url: string): string | null {
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

export function HeroRawVideoMedia({ url, title }: { url: string; title: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="hero-video border-0"
      />
    );
  }

  const heroEmbedSrc = buildHeroVideoEmbedSrc({
    src: url,
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
  });

  return (
    <iframe
      src={heroEmbedSrc}
      title={title}
      className="hero-video border-0"
      allow="autoplay"
    />
  );
}
