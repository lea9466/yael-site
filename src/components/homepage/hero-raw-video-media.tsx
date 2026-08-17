"use client";

import { buildHeroVideoEmbedSrc } from "@/lib/homepage/hero-video-embed";

export function HeroRawVideoMedia({ url, title }: { url: string; title: string }) {
  const embedSrc = buildHeroVideoEmbedSrc({
    src: url,
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
    title,
  });

  return (
    <iframe
      src={embedSrc}
      title={title}
      className="hero-video border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
      sandbox="allow-scripts allow-popups allow-presentation"
    />
  );
}
