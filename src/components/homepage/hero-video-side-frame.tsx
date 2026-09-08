"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FullscreenableElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

function isFullscreenSupported(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled);
}

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function subscribeToFullscreenChange(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  document.addEventListener("webkitfullscreenchange", callback);
  return () => {
    document.removeEventListener("fullscreenchange", callback);
    document.removeEventListener("webkitfullscreenchange", callback);
  };
}

function getServerSnapshotFalse() {
  return false;
}

export function HeroVideoSideFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const supportsFullscreen = useSyncExternalStore(
    () => () => {},
    isFullscreenSupported,
    getServerSnapshotFalse
  );

  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreenChange,
    () => getFullscreenElement() === containerRef.current,
    getServerSnapshotFalse
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current as FullscreenableElement | null;
    if (!container) {
      return;
    }

    const doc = document as FullscreenDocument;

    if (getFullscreenElement()) {
      const exit = doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc);
      Promise.resolve(exit?.()).catch((error: unknown) => {
        console.error("Failed to exit fullscreen", error);
      });
      return;
    }

    const request =
      container.requestFullscreen?.bind(container) ??
      container.webkitRequestFullscreen?.bind(container);
    Promise.resolve(request?.()).catch((error: unknown) => {
      console.error("Failed to enter fullscreen", error);
    });
  }, []);

  return (
    <div ref={containerRef} className={cn("hero-video-side", className)}>
      {children}
      {supportsFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hero-video-side__expand"
          aria-label={isFullscreen ? "צמצום למסך רגיל" : "הגדלה למסך מלא"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      )}
    </div>
  );
}
