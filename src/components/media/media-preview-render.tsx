import Image from "next/image";

import { isVideoMimeType } from "@/lib/media/mime";
import { cn } from "@/lib/utils/cn";

type MediaPreviewVariant = "preview" | "hero";

type MediaPreviewRenderProps = {
  url: string | null;
  alt: string;
  mimeType?: string;
  variant?: MediaPreviewVariant;
  fill?: boolean;
  objectFit?: "cover" | "contain";
  sizes?: string;
  priority?: boolean;
  quality?: number;
  posterUrl?: string | null;
  respectReducedMotion?: boolean;
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
  emptyClassName?: string;
  emptyLabel?: string;
};

export function MediaPreviewRender({
  url,
  alt,
  mimeType = "image/webp",
  variant = "preview",
  fill = true,
  objectFit = "cover",
  sizes = "100vw",
  priority = false,
  quality = 75,
  posterUrl = null,
  respectReducedMotion = false,
  className,
  imageClassName,
  videoClassName,
  emptyClassName,
  emptyLabel = "אין תצוגה מקדימה",
}: MediaPreviewRenderProps) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center text-sm text-[var(--color-text-muted)]",
          emptyClassName,
          className
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  if (isVideoMimeType(mimeType)) {
    const isHero = variant === "hero";
    const shouldAutoplay = isHero && !respectReducedMotion;

    return (
      <video
        aria-label={isHero ? undefined : alt}
        aria-hidden={isHero ? true : undefined}
        poster={posterUrl ?? undefined}
        className={cn(
          fill ? "absolute inset-0 size-full" : undefined,
          objectFit === "contain" ? "object-contain" : "object-cover",
          videoClassName,
          className
        )}
        controls={!isHero || respectReducedMotion}
        autoPlay={shouldAutoplay}
        muted={shouldAutoplay || isHero}
        loop={shouldAutoplay}
        playsInline
        preload="metadata"
      >
        <source src={url} type={mimeType} />
      </video>
    );
  }

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={cn(fitClass, imageClassName, className)}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={1200}
      height={900}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={cn("size-full", fitClass, imageClassName, className)}
    />
  );
}
