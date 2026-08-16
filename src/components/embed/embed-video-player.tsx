"use client";

import { useCallback, useState, type CSSProperties } from "react";

type EmbedVideoPlayerProps = {
  src: string;
  mimeType: string;
  posterUrl: string | null;
  title: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
};

const containerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  background: "transparent",
};

const fillStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export function EmbedVideoPlayer({
  src,
  mimeType,
  posterUrl,
  title,
  autoplay,
  loop,
  muted,
  controls,
}: EmbedVideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const markReady = useCallback(() => setIsReady(true), []);
  const markError = useCallback(() => setHasError(true), []);

  const showVideo = isReady && !hasError;

  return (
    <div style={containerStyle}>
      {posterUrl && !showVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt={title} style={fillStyle} />
      ) : null}

      {!hasError ? (
        <video
          style={{
            ...fillStyle,
            opacity: showVideo ? 1 : 0,
            transition: "opacity 350ms ease",
          }}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline
          preload={controls ? "metadata" : "auto"}
          aria-label={title}
          onLoadedData={markReady}
          onCanPlay={markReady}
          onError={markError}
        >
          <source src={src} type={mimeType} />
        </video>
      ) : null}
    </div>
  );
}
