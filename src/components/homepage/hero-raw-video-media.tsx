"use client";

import { useState } from "react";

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
  const [hasError, setHasError] = useState(false);
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

  if (hasError) {
    return (
      <div className="hero-media-stack">
        <div aria-hidden="true" className="hero-fallback" />
      </div>
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
      onError={() => setHasError(true)}
    >
      <source src={url} type="video/mp4" />
    </video>
  );
}
