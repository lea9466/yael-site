"use client";

import { HeroPosterImage } from "@/components/homepage/hero-poster-image";
import { HeroVideoPlayer } from "@/components/homepage/hero-video-player";
import {
  resolveBootstrapPosterUrl,
  resolveHeroPosterUrl,
} from "@/lib/homepage/hero-poster";
import type { HomepageHeroMediaPreview } from "@/lib/homepage/queries";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { isVideoMimeType } from "@/lib/media/mime";

const HERO_DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

type HeroResponsiveMediaProps = {
  desktopPreview: HomepageHeroMediaPreview | null;
  mobilePreview: HomepageHeroMediaPreview | null;
  title: string;
};

function HeroStaticImage({
  preview,
  title,
  priority = false,
}: {
  preview: HomepageHeroMediaPreview;
  title: string;
  priority?: boolean;
}) {
  const isHeroProfile = preview.uploadProfile === "hero";

  return (
    <div className="hero-media-stack">
      <HeroPosterImage
        url={preview.url}
        alt={preview.alt || title}
        priority={priority}
        quality={isHeroProfile ? 90 : 85}
      />
    </div>
  );
}

function HeroBootstrapMedia({
  desktopPreview,
  mobilePreview,
  title,
}: HeroResponsiveMediaProps) {
  const bootstrapPoster = resolveBootstrapPosterUrl(desktopPreview, mobilePreview);

  if (bootstrapPoster) {
    return (
      <div className="hero-media-stack">
        <HeroPosterImage url={bootstrapPoster} alt={title} priority />
      </div>
    );
  }

  return (
    <div className="hero-media-stack">
      <div aria-hidden="true" className="hero-fallback" />
    </div>
  );
}

export function HeroResponsiveMedia({
  desktopPreview,
  mobilePreview,
  title,
}: HeroResponsiveMediaProps) {
  const isDesktop = useMediaQuery(HERO_DESKTOP_MEDIA_QUERY);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (isDesktop === null) {
    return (
      <HeroBootstrapMedia
        desktopPreview={desktopPreview}
        mobilePreview={mobilePreview}
        title={title}
      />
    );
  }

  const activePreview = isDesktop
    ? desktopPreview
    : (mobilePreview ?? desktopPreview);

  if (!activePreview?.url) {
    return (
      <div className="hero-media-stack">
        <div aria-hidden="true" className="hero-fallback" />
      </div>
    );
  }

  if (isVideoMimeType(activePreview.mimeType)) {
    const posterUrl = resolveHeroPosterUrl(
      activePreview,
      desktopPreview,
      mobilePreview
    );

    return (
      <HeroVideoPlayer
        src={activePreview.url}
        mimeType={activePreview.mimeType}
        posterUrl={posterUrl}
        title={title}
        reducedMotion={prefersReducedMotion}
      />
    );
  }

  return (
    <HeroStaticImage preview={activePreview} title={title} priority />
  );
}
