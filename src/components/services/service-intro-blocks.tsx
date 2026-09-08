import { renderArticleRichText } from "@/lib/articles/render";
import type { ServiceIntroBlock } from "@/lib/services/types";

type ServiceIntroBlocksProps = {
  blocks: ServiceIntroBlock[];
};

/**
 * Renders a service's full-introduction blocks inside the centered editorial
 * panel on the public service page. Inline marks (bold / italic / link) reuse
 * the posts renderer; block wrappers use the service page's own styling so the
 * panel keeps its centered, calm look.
 */
export function ServiceIntroBlocks({ blocks }: ServiceIntroBlocksProps) {
  return (
    <div className="service-page__intro-copy">
      {blocks.map((block, index) => {
        const key = `${index}-${block.type}`;

        if (block.type === "heading") {
          const Heading = block.level === 3 ? "h3" : "h2";
          const className =
            block.level === 3
              ? "service-page__intro-subheading"
              : "service-page__intro-heading";

          return (
            <Heading key={key} className={className}>
              {renderArticleRichText(block.text, block.marks)}
            </Heading>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={key} className="service-page__intro-quote">
              {renderArticleRichText(block.text, block.marks)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.list_type === "ordered" ? "ol" : "ul";

          return (
            <ListTag
              key={key}
              className={`service-page__intro-list service-page__intro-list--${block.list_type}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item.text}`}>
                  {renderArticleRichText(item.text, item.marks)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={key} className="service-page__intro-paragraph">
            {renderArticleRichText(block.text, block.marks)}
          </p>
        );
      })}
    </div>
  );
}
