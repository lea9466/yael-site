import { sanitizePlainText } from "@/lib/services/sanitize";
import type { RecipeStep } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeStepsProps = {
  steps: RecipeStep[];
  className?: string;
  headingLevel?: "h2" | "h3";
  showTitle?: boolean;
  titleId?: string;
};

export function RecipeSteps({
  steps,
  className,
  headingLevel = "h2",
  showTitle = true,
  titleId = "recipe-steps-title",
}: RecipeStepsProps) {
  const HeadingTag = headingLevel;
  const items = steps
    .map((step, index) => ({
      index,
      text: sanitizePlainText(step.text),
    }))
    .filter((step) => step.text.length > 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={showTitle ? titleId : undefined}
      aria-label={showTitle ? undefined : "שלבי הכנה"}
      className={cn("recipe-steps", className)}
    >
      {showTitle ? (
        <HeadingTag id={titleId} className="recipe-steps__title">
          שלבי הכנה
        </HeadingTag>
      ) : null}

      <ol className="recipe-steps__list">
        {items.map((step, displayIndex) => (
          <li
            key={`${step.index}-${step.text}`}
            className="recipe-steps__item"
          >
            <span className="recipe-steps__number" aria-hidden="true">
              {displayIndex + 1}
            </span>
            <p className="recipe-steps__text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
