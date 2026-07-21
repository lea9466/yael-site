import Image from "next/image";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import type { AboutMediaPreview } from "@/lib/about/queries";
import {
  composeAboutEditorialUnits,
  type AboutEditorialUnit,
} from "@/lib/about/editorial-layout";
import { renderArticleRichText } from "@/lib/articles/render";
import type { ArticleBlock } from "@/lib/articles/types";
import { escapeHtml } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type AboutEditorialStoryProps = {
  blocks: ArticleBlock[];
  blockMediaUrls: Map<string, AboutMediaPreview>;
  isPreview?: boolean;
};

function EmptyStoryNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="about-page__empty-note">{children}</p>
  );
}

function StoryImage({
  mediaId,
  caption,
  blockMediaUrls,
  isPreview,
  className,
  sizes,
}: {
  mediaId: string;
  caption: string | null;
  blockMediaUrls: Map<string, AboutMediaPreview>;
  isPreview: boolean;
  className?: string;
  sizes: string;
}) {
  const media = blockMediaUrls.get(mediaId);

  if (!media?.url) {
    if (!isPreview) {
      return null;
    }

    return (
      <div className={cn("about-page__media-missing", className)}>
        תמונה חסרה
      </div>
    );
  }

  return (
    <figure className={cn("about-page__figure", className)}>
      <div className="about-page__figure-frame">
        <Image
          src={media.url}
          alt={media.alt || caption || "תמונה בעמוד האודות"}
          fill
          sizes={sizes}
          className="about-page__figure-image object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="about-page__figure-caption">
          {escapeHtml(caption)}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ProseBlockView({
  block,
}: {
  block: Extract<ArticleBlock, { type: "paragraph" | "list" }>;
}) {
  if (block.type === "paragraph") {
    return (
      <p className="about-page__paragraph article-content">
        {renderArticleRichText(block.text, block.marks)}
      </p>
    );
  }

  const ListTag = block.list_type === "ordered" ? "ol" : "ul";

  return (
    <ListTag
      className={cn(
        "about-page__list article-content",
        block.list_type === "ordered"
          ? "about-page__list--ordered"
          : "about-page__list--bullet"
      )}
    >
      {block.items.map((item, itemIndex) => (
        <li key={`${itemIndex}-${item.text}`}>
          {renderArticleRichText(item.text, item.marks)}
        </li>
      ))}
    </ListTag>
  );
}

function EditorialUnitView({
  unit,
  unitIndex,
  blockMediaUrls,
  isPreview,
}: {
  unit: AboutEditorialUnit;
  unitIndex: number;
  blockMediaUrls: Map<string, AboutMediaPreview>;
  isPreview: boolean;
}) {
  switch (unit.type) {
    case "heading": {
      const HeadingTag = unit.block.level === 3 ? "h3" : "h2";

      return (
        <HomepageReveal delayMs={40}>
          <div className="about-page__reading">
            <HeadingTag
              className={cn(
                "about-page__heading article-content",
                unit.block.level === 3
                  ? "about-page__heading--h3"
                  : "about-page__heading--h2"
              )}
            >
              {renderArticleRichText(unit.block.text, unit.block.marks)}
            </HeadingTag>
          </div>
        </HomepageReveal>
      );
    }

    case "paragraphs":
      return (
        <HomepageReveal delayMs={60}>
          <div className="about-page__reading about-page__prose-stack">
            {unit.blocks.map((paragraph, paragraphIndex) => (
              <p
                key={`${unitIndex}-p-${paragraphIndex}`}
                className="about-page__paragraph article-content"
              >
                {renderArticleRichText(paragraph.text, paragraph.marks)}
              </p>
            ))}
          </div>
        </HomepageReveal>
      );

    case "list":
      return (
        <HomepageReveal delayMs={60}>
          <div className="about-page__reading">
            <ProseBlockView block={unit.block} />
          </div>
        </HomepageReveal>
      );

    case "quote":
      return (
        <HomepageReveal delayMs={80}>
          <section
            className={cn(
              "about-page__quote-band",
              `about-page__quote-band--${unit.band}`
            )}
          >
            <div className="about-page__quote-inner">
              <span className="about-page__quote-rule" aria-hidden="true" />
              <span className="about-page__quote-mark" aria-hidden="true">
                ”
              </span>
              <blockquote className="about-page__quote article-content">
                {renderArticleRichText(unit.block.text, unit.block.marks)}
              </blockquote>
            </div>
          </section>
        </HomepageReveal>
      );

    case "image-feature":
      return (
        <HomepageReveal delayMs={100} className="about-page__media-reveal">
          <div
            className={cn(
              "about-page__image-feature",
              `about-page__image-feature--${unit.variant}`
            )}
          >
            <span
              className="about-page__organic about-page__organic--image"
              aria-hidden="true"
            />
            <StoryImage
              mediaId={unit.block.media_id}
              caption={unit.block.caption}
              blockMediaUrls={blockMediaUrls}
              isPreview={isPreview}
              sizes="(max-width: 768px) 92vw, (max-width: 1280px) 70vw, 880px"
            />
          </div>
        </HomepageReveal>
      );

    case "split":
      return (
        <section
          className={cn(
            "about-page__split",
            `about-page__split--${unit.band}`,
            unit.imageSide === "end" && "about-page__split--image-end"
          )}
        >
          <div className="about-page__split-atmosphere" aria-hidden="true">
            <span className="about-page__blob about-page__blob--split" />
          </div>
          <div className="about-page__container about-page__split-grid">
            <HomepageReveal
              delayMs={80}
              className="about-page__split-media about-page__media-reveal"
            >
              <StoryImage
                mediaId={unit.image.media_id}
                caption={unit.image.caption}
                blockMediaUrls={blockMediaUrls}
                isPreview={isPreview}
                sizes="(max-width: 1024px) 92vw, 44vw"
              />
            </HomepageReveal>
            <HomepageReveal delayMs={140} className="about-page__split-copy">
              <div className="about-page__split-prose">
                {unit.prose.map((proseBlock, proseIndex) => (
                  <ProseBlockView
                    key={`${unitIndex}-split-${proseIndex}`}
                    block={proseBlock}
                  />
                ))}
              </div>
            </HomepageReveal>
          </div>
        </section>
      );

    default:
      return null;
  }
}

export function AboutEditorialStory({
  blocks,
  blockMediaUrls,
  isPreview = false,
}: AboutEditorialStoryProps) {
  if (blocks.length === 0) {
    return isPreview ? (
      <EmptyStoryNote>טרם נוסף תוכן עריכה</EmptyStoryNote>
    ) : null;
  }

  const units = composeAboutEditorialUnits(blocks);

  return (
    <div className="about-page__story">
      {units.map((unit, unitIndex) => (
        <EditorialUnitView
          key={`${unit.type}-${unitIndex}`}
          unit={unit}
          unitIndex={unitIndex}
          blockMediaUrls={blockMediaUrls}
          isPreview={isPreview}
        />
      ))}
    </div>
  );
}
