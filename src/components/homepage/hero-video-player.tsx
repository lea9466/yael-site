"use client";

import { HeroPosterImage } from "@/components/homepage/hero-poster-image";
import { buildHeroVideoEmbedSrc } from "@/lib/homepage/hero-video-embed";

type HeroVideoPlayerProps = {
  src: string;
  mimeType: string;
  posterUrl: string | null;
  title: string;
  reducedMotion: boolean;
  controls?: boolean;
  muted?: boolean;
};

function HeroVideoPosterOnly({
  posterUrl,
  title,
}: {
  posterUrl: string | null;
  title: string;
}) {
  return (
    <div className="hero-media-stack">
      {posterUrl ? (
        <HeroPosterImage url={posterUrl} alt={title} priority />
      ) : (
        <div aria-hidden="true" className="hero-fallback" />
      )}
    </div>
  );
}

function HeroVideoPlayerFrame({
  src,
  mimeType,
  posterUrl,
  title,
  controls = false,
  muted = true,
}: Omit<HeroVideoPlayerProps, "reducedMotion">) {
  const embedSrc = buildHeroVideoEmbedSrc({
    src,
    mimeType,
    posterUrl,
    title,
    autoplay: !controls,
    loop: !controls,
    muted,
    controls,
  });

  return (
    <div className="hero-media-stack">
      <div aria-hidden="true" className="hero-fallback" />
      <iframe
        src={embedSrc}
        title={title}
        className="hero-video hero-video--visible"
        style={{ border: 0 }}
        allow="autoplay"
        sandbox="allow-scripts allow-popups allow-presentation"
      />
    </div>
  );
}

export function HeroVideoPlayer({
  src,
  mimeType,
  posterUrl,
  title,
  reducedMotion,
  controls,
  muted,
}: HeroVideoPlayerProps) {
  if (reducedMotion) {
    return <HeroVideoPosterOnly posterUrl={posterUrl} title={title} />;
  }

  return (
    <HeroVideoPlayerFrame
      key={src}
      src={src}
      mimeType={mimeType}
      posterUrl={posterUrl}
      title={title}
      controls={controls}
      muted={muted}
    />
  );
}
