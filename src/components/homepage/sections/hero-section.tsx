import Image from "next/image";
import Link from "next/link";

import type { HomepageHeroMediaPreview } from "@/lib/homepage/queries";
import type { HomepageHeroData } from "@/lib/validations/homepage-hero";
import { cn } from "@/lib/utils/cn";

type HeroMediaProps = {
  hero: HomepageHeroData;
  mediaPreview: HomepageHeroMediaPreview | null;
  title: string;
  priority?: boolean;
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
        className="absolute inset-0 size-full border-0 object-cover"
      />
    );
  }

  return (
    <video
      src={url}
      muted
      playsInline
      controls
      preload="metadata"
      aria-label={title}
      className="absolute inset-0 size-full object-cover"
    />
  );
}

function HeroAnimationMedia({ url, title }: { url: string; title: string }) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".gif") || lowerUrl.endsWith(".webp") || lowerUrl.endsWith(".png")) {
    return (
      <Image
        src={url}
        alt={title}
        fill
        sizes="100vw"
        className="object-cover object-[center_40%]"
        unoptimized
      />
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
      className="absolute inset-0 size-full border-0"
    />
  );
}

function HeroMedia({ hero, mediaPreview, title, priority = false }: HeroMediaProps) {
  if (hero.media_type === "image" && mediaPreview?.url) {
    const isOriginalQuality = mediaPreview.uploadMode === "original";

    return (
      <Image
        src={mediaPreview.url}
        alt={mediaPreview.alt || title}
        fill
        priority={priority}
        sizes="100vw"
        quality={isOriginalQuality ? 95 : 75}
        className="object-cover object-[center_40%]"
      />
    );
  }

  if (hero.media_type === "video_url" && hero.video_url) {
    return <HeroVideoMedia url={hero.video_url} title={title} />;
  }

  if (hero.media_type === "animation_url" && hero.animation_url) {
    return <HeroAnimationMedia url={hero.animation_url} title={title} />;
  }

  return null;
}

function hasHeroVisualMedia(
  hero: HomepageHeroData,
  mediaPreview: HomepageHeroMediaPreview | null
): boolean {
  if (hero.media_type === "image") {
    return Boolean(mediaPreview?.url);
  }

  if (hero.media_type === "video_url") {
    return Boolean(hero.video_url);
  }

  if (hero.media_type === "animation_url") {
    return Boolean(hero.animation_url);
  }

  return false;
}

type HeroButtonProps = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  className?: string;
};

function HeroButton({ label, href, variant, className }: HeroButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "public-focus-ring inline-flex min-h-[3.25rem] items-center justify-center rounded-[var(--radius-full)] px-7 text-[0.9375rem] font-semibold transition-[transform,box-shadow,background-color,border-color] duration-[var(--transition-base)] motion-reduce:transition-none",
        variant === "primary"
          ? "bg-[var(--color-soft-accent)] text-[var(--color-text-on-primary)] shadow-[0_10px_28px_rgba(217,138,128,0.38)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(217,138,128,0.48)] motion-reduce:hover:translate-y-0"
          : "border border-[var(--color-text-on-primary)]/50 bg-[var(--color-text-on-primary)]/10 text-[var(--color-text-on-primary)] backdrop-blur-sm hover:bg-[var(--color-text-on-primary)]/18",
        className
      )}
    >
      {label}
    </Link>
  );
}

type HomepageHeroSectionProps = {
  hero: HomepageHeroData;
  mediaPreview: HomepageHeroMediaPreview | null;
};

export function HomepageHeroSection({
  hero,
  mediaPreview,
}: HomepageHeroSectionProps) {
  const hasSecondary = Boolean(hero.secondary_button);
  const hasVisualMedia = hasHeroVisualMedia(hero, mediaPreview);

  return (
    <section
      aria-labelledby="homepage-hero-title"
      className={cn(
        "homepage-hero relative -mt-[var(--public-header-height)] isolate overflow-hidden",
        "h-[100dvh] min-h-[100dvh]"
      )}
    >
      <div className="absolute inset-0">
        {hasVisualMedia ? (
          <HeroMedia
            hero={hero}
            mediaPreview={mediaPreview}
            title={hero.title}
            priority
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(145deg,var(--color-light-sage-soft)_0%,var(--color-cream)_42%,var(--color-coral-soft)_100%)]"
          />
        )}
      </div>

      {hasVisualMedia ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(225deg,rgba(63,95,71,0.82)_0%,rgba(63,95,71,0.42)_22%,rgba(63,95,71,0.12)_42%,transparent_62%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(0deg,rgba(42,56,48,0.48)_0%,rgba(42,56,48,0.18)_18%,transparent_42%)]"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(225deg,rgba(253,251,247,0.55)_0%,transparent_50%)]"
        />
      )}

      <div
        className={cn(
          "relative z-[2] flex h-full min-h-[inherit] flex-col justify-end",
          "ps-3 pe-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[var(--public-header-height)]",
          "sm:ps-5 sm:pe-8 sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]",
          "lg:ps-[5vw] lg:pe-[9vw] lg:pb-[12vh]"
        )}
      >
        <div
          className={cn(
            "homepage-hero-content me-auto w-full max-w-[600px] space-y-6 text-start",
            "motion-safe:animate-[public-page-enter_var(--transition-base)_ease]"
          )}
        >
          <div className="space-y-4">
            <h1
              id="homepage-hero-title"
              className={cn(
                "text-balance font-semibold leading-[1.06] tracking-[-0.03em]",
                "text-[clamp(2.25rem,3.8vw+0.75rem,4.5rem)]",
                hasVisualMedia
                  ? "text-[var(--color-text-on-primary)]"
                  : "text-[var(--color-primary)]"
              )}
            >
              {hero.title}
            </h1>
            <p
              className={cn(
                "max-w-[34rem] text-[1.0625rem] leading-[1.8] sm:text-xl sm:leading-[1.75]",
                hasVisualMedia
                  ? "text-[var(--color-text-on-primary)]/94"
                  : "text-[var(--color-text-muted)]"
              )}
            >
              {hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
            <HeroButton
              label={hero.primary_button.label}
              href={hero.primary_button.url}
              variant="primary"
              className={
                hasVisualMedia
                  ? undefined
                  : "bg-[var(--color-primary)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              }
            />
            {hasSecondary && hero.secondary_button ? (
              <HeroButton
                label={hero.secondary_button.label}
                href={hero.secondary_button.url}
                variant="secondary"
                className={
                  hasVisualMedia
                    ? undefined
                    : "border-[var(--color-primary)]/35 bg-[var(--color-surface)]/85 text-[var(--color-primary)] hover:bg-[var(--color-surface)]"
                }
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
