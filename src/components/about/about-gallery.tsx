"use client";

import Image from "next/image";
import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import type { AboutMediaPreview } from "@/lib/about/queries";
import type { ArticleGalleryItem } from "@/lib/articles/types";
import { escapeHtml } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type GalleryEntry = {
  item: ArticleGalleryItem;
  media: AboutMediaPreview;
};

type AboutGalleryProps = {
  items: ArticleGalleryItem[];
  mediaById: Record<string, AboutMediaPreview>;
  isPreview?: boolean;
};

function sortGalleryItems(items: ArticleGalleryItem[]): ArticleGalleryItem[] {
  return [...items].sort((left, right) => left.order - right.order);
}

export function AboutGallery({
  items,
  mediaById,
  isPreview = false,
}: AboutGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const entries: GalleryEntry[] = sortGalleryItems(items)
    .map((item) => {
      const media = mediaById[item.media_id];

      if (!media?.url) {
        return null;
      }

      return { item, media };
    })
    .filter((entry): entry is GalleryEntry => entry !== null);

  if (entries.length === 0) {
    return null;
  }

  const active = activeIndex !== null ? entries[activeIndex] : null;

  return (
    <section className="about-page__gallery" aria-label="גלריית תמונות">
      <div className="about-page__gallery-atmosphere" aria-hidden="true">
        <span className="about-page__blob about-page__blob--gallery-a" />
        <span className="about-page__blob about-page__blob--gallery-b" />
        <span className="about-page__dot-field" />
      </div>

      <div className="about-page__container">
        <HomepageReveal>
          <div className="about-page__gallery-head">
            <p className="about-page__eyebrow">רגעים מהדרך</p>
            <h2 className="about-page__gallery-title">מבט מקרוב</h2>
          </div>
        </HomepageReveal>

        <div className="about-page__gallery-masonry">
          {entries.map((entry, index) => {
            const sizeClass =
              index % 5 === 0
                ? "about-page__gallery-item--hero"
                : index % 5 === 3
                  ? "about-page__gallery-item--wide"
                  : "about-page__gallery-item--tile";

            return (
              <HomepageReveal
                key={`${entry.item.media_id}-${entry.item.order}`}
                delayMs={Math.min(index * 90, 360)}
                className={cn("about-page__gallery-item", sizeClass)}
              >
                <button
                  type="button"
                  className="about-page__gallery-trigger public-focus-ring"
                  onClick={() => {
                    if (!isPreview) {
                      setActiveIndex(index);
                    }
                  }}
                  aria-label={`פתיחת תמונה ${index + 1}`}
                >
                  <Image
                    src={entry.media.url}
                    alt={entry.media.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                    className="about-page__gallery-image object-cover"
                  />
                  <span className="about-page__gallery-veil" aria-hidden="true" />
                </button>
              </HomepageReveal>
            );
          })}
        </div>
      </div>

      <Dialog
        open={active !== null && !isPreview}
        onClose={() => setActiveIndex(null)}
        title={active ? escapeHtml(active.media.alt) : "תמונה"}
        panelClassName="about-page__lightbox-panel"
        bodyClassName="about-page__lightbox-body"
      >
        {active ? (
          <div className="about-page__lightbox-stage">
            <Image
              src={active.media.url}
              alt={active.media.alt}
              width={1400}
              height={1050}
              className="about-page__lightbox-image"
              sizes="(max-width: 768px) 94vw, min(80vw, 56rem)"
            />
          </div>
        ) : null}
      </Dialog>
    </section>
  );
}
