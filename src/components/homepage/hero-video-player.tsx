"use client";

import { useCallback, useRef, useState } from "react";

import { HeroPosterImage } from "@/components/homepage/hero-poster-image";
import { cn } from "@/lib/utils/cn";

export type HeroVideoReadiness = "idle" | "loading" | "ready" | "error";

type HeroVideoPlayerProps = {
  src: string;
  mimeType: string;
  posterUrl: string | null;
  title: string;
  reducedMotion: boolean;
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

function HeroVideoPlayerAutoplay({
  src,
  mimeType,
  posterUrl,
  title,
}: Omit<HeroVideoPlayerProps, "reducedMotion">) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readiness, setReadiness] = useState<HeroVideoReadiness>("loading");

  const markReady = useCallback(() => {
    setReadiness((current) => (current === "error" ? current : "ready"));
  }, []);

  const markError = useCallback(() => {
    setReadiness("error");
  }, []);

  const showVideo = readiness === "ready";
  const showPosterLayer = !showVideo;

  return (
    <div className="hero-media-stack">
      {posterUrl ? (
        <div
          aria-hidden="true"
          className={cn("hero-poster", !showPosterLayer && "hero-poster--hidden")}
        >
          <HeroPosterImage url={posterUrl} alt={title} priority />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={cn("hero-fallback", !showPosterLayer && "hero-poster--hidden")}
        />
      )}

      <video
        ref={videoRef}
        aria-hidden="true"
        className={cn("hero-video", showVideo && "hero-video--visible")}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={markReady}
        onCanPlay={markReady}
        onError={markError}
      >
        <source src={src} type={mimeType} />
      </video>
    </div>
  );
}

export function HeroVideoPlayer({
  src,
  mimeType,
  posterUrl,
  title,
  reducedMotion,
}: HeroVideoPlayerProps) {
  if (reducedMotion) {
    return <HeroVideoPosterOnly posterUrl={posterUrl} title={title} />;
  }

  return (
    <HeroVideoPlayerAutoplay
      key={src}
      src={src}
      mimeType={mimeType}
      posterUrl={posterUrl}
      title={title}
    />
  );
}
