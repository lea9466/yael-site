import Image from "next/image";
import Link from "next/link";

import { HeroResponsiveMedia } from "@/components/homepage/hero-responsive-media";
import type { HomepageHeroMediaPreview } from "@/lib/homepage/queries";
import type { HomepageHeroData } from "@/lib/validations/homepage-hero";
import { cn } from "@/lib/utils/cn";

type HeroMediaProps = {
  hero: HomepageHeroData;
  desktopMediaPreview: HomepageHeroMediaPreview | null;
  mobileMediaPreview: HomepageHeroMediaPreview | null;
  title: string;
};

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

function HeroVideoMedia({ url, title }: { url: string; title: string }) {
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

  return (
    <video
      className="hero-video"
      muted
      playsInline
      controls
      preload="metadata"
      aria-label={title}
    >
      <source src={url} type="video/mp4" />
    </video>
  );
}

function HeroAnimationMedia({ url, title }: { url: string; title: string }) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".gif") || lowerUrl.endsWith(".webp") || lowerUrl.endsWith(".png")) {
    return (
      <div className="hero-image-wrap">
        <Image
          src={url}
          alt={title}
          fill
          sizes="100vw"
          className="hero-image"
          unoptimized
        />
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
      className="hero-video border-0"
    />
  );
}

function HeroMedia({
  hero,
  desktopMediaPreview,
  mobileMediaPreview,
  title,
}: HeroMediaProps) {
  // Always use background media for the main hero background
  return (
    <HeroResponsiveMedia
      desktopPreview={desktopMediaPreview}
      mobilePreview={mobileMediaPreview}
      title={title}
    />
  );
}

function SideHeroMedia({
  hero,
  desktopMediaPreview,
  mobileMediaPreview,
  title,
}: HeroMediaProps) {
  if (hero.side_media_type === "image") {
    return (
      <HeroResponsiveMedia
        desktopPreview={desktopMediaPreview}
        mobilePreview={mobileMediaPreview}
        title={title}
      />
    );
  }

  if (hero.side_media_type === "video_url") {
    // If there's a media ID from the library, use that first
    if (hero.side_media_id && desktopMediaPreview?.url) {
      const preview = desktopMediaPreview;
      return (
        <video
          className="hero-video"
          muted
          playsInline
          controls
          preload="metadata"
          aria-label={title}
        >
          <source src={preview.url} type={preview.mimeType} />
        </video>
      );
    }
    // Otherwise use external URL
    if (hero.side_video_url) {
      return <HeroVideoMedia url={hero.side_video_url} title={title} />;
    }
  }

  if (hero.side_media_type === "animation_url" && hero.side_animation_url) {
    return <HeroAnimationMedia url={hero.side_animation_url} title={title} />;
  }

  return null;
}

function hasHeroVisualMedia(
  hero: HomepageHeroData,
  desktopMediaPreview: HomepageHeroMediaPreview | null
): boolean {
  return Boolean(hero.background_media_id && desktopMediaPreview?.url);
}

function hasSideHeroMedia(hero: HomepageHeroData): boolean {
  if (hero.side_media_type === "image") {
    return Boolean(hero.side_media_id);
  }

  if (hero.side_media_type === "video_url") {
    return Boolean(hero.side_media_id || hero.side_video_url);
  }

  if (hero.side_media_type === "animation_url") {
    return Boolean(hero.side_animation_url);
  }

  return false;
}

function HeroTitle({ title }: { title: string }) {
  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const words = normalizedTitle.split(" ").filter(Boolean);

  if (words.length <= 2) {
    return <>{normalizedTitle}</>;
  }

  const firstLine = words.slice(0, 2).join(" ");
  const secondLine = words.slice(2).join(" ");

  return (
    <>
      {firstLine}
      <br />
      {secondLine}
    </>
  );
}

type HeroButtonProps = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

function HeroButton({ label, href, variant }: HeroButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "hero-btn public-focus-ring",
        variant === "primary" ? "hero-btn--primary" : "hero-btn--secondary"
      )}
    >
      {label}
    </Link>
  );
}

type HomepageHeroSectionProps = {
  hero: HomepageHeroData;
  desktopMediaPreview: HomepageHeroMediaPreview | null;
  mobileMediaPreview: HomepageHeroMediaPreview | null;
  sideMediaPreview: HomepageHeroMediaPreview | null;
};

export function HomepageHeroSection({
  hero,
  desktopMediaPreview,
  mobileMediaPreview,
  sideMediaPreview,
}: HomepageHeroSectionProps) {
  const hasSecondary = Boolean(hero.secondary_button);
  const hasVisualMedia = hasHeroVisualMedia(hero, desktopMediaPreview);
  const hasSideMedia = hasSideHeroMedia(hero);

  return (
    <section className="hero" aria-labelledby="homepage-hero-title">
      <div className="hero-canvas">
        {hasVisualMedia ? (
          <HeroMedia
            hero={hero}
            desktopMediaPreview={desktopMediaPreview}
            mobileMediaPreview={mobileMediaPreview}
            title={hero.title}
          />
        ) : (
          <div className="hero-media-stack">
            <div className="hero-fallback" />
          </div>
        )}

        <div
          className={cn(
            "hero-overlay",
            hasVisualMedia ? "hero-overlay--media" : "hero-overlay--fallback"
          )}
        />
      </div>

      <div className="hero-stage">
        <div className="hero-stage__container">
          <div className="hero-editorial hero-editorial-enter">
            <div className="hero-content-row">
              <div className="hero-content-main">
                <h1 id="homepage-hero-title" className="hero-title">
                  <HeroTitle title={hero.title} />
                </h1>

                <p className="hero-lead">{hero.subtitle}</p>

                <div className="hero-actions">
                  <HeroButton
                    label={hero.primary_button.label}
                    href={hero.primary_button.url}
                    variant="primary"
                  />
                  {hasSecondary && hero.secondary_button ? (
                    <HeroButton
                      label={hero.secondary_button.label}
                      href={hero.secondary_button.url}
                      variant="secondary"
                    />
                  ) : null}
                </div>
              </div>

              {hasSideMedia && (
                <div className="hero-video-side">
                  <SideHeroMedia
                    hero={hero}
                    desktopMediaPreview={sideMediaPreview}
                    mobileMediaPreview={sideMediaPreview}
                    title={hero.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
