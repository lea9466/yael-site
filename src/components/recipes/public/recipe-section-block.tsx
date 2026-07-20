import { RecipeIngredients } from "@/components/recipes/public/recipe-ingredients";
import { RecipeSteps } from "@/components/recipes/public/recipe-steps";
import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { RecipeSection } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeSectionBlockProps = {
  section: RecipeSection;
  index: number;
  showSectionTitle: boolean;
  isPreview?: boolean;
  className?: string;
};

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

export function RecipeSectionBlock({
  section,
  index,
  showSectionTitle,
  isPreview = false,
  className,
}: RecipeSectionBlockProps) {
  const title = sanitizePlainText(section.title);
  const hasIngredients = section.ingredients.some(
    (ingredient) => formatIngredientLine(ingredient).length > 0
  );
  const hasSteps = section.steps.some(
    (step) => sanitizePlainText(step.text).length > 0
  );

  if (!hasIngredients && !hasSteps && !isPreview) {
    return null;
  }

  const nestedHeading = showSectionTitle ? "h3" : "h2";

  return (
    <section
      className={cn(
        "recipe-section",
        showSectionTitle && "recipe-section--named",
        className
      )}
      aria-labelledby={
        showSectionTitle && title ? `recipe-section-title-${index}` : undefined
      }
    >
      {showSectionTitle && title ? (
        <h2 id={`recipe-section-title-${index}`} className="recipe-section__title">
          {title}
        </h2>
      ) : null}

      <div className="recipe-section__grid">
        {hasIngredients ? (
          <RecipeIngredients
            ingredients={section.ingredients}
            headingLevel={nestedHeading}
            titleId={`recipe-section-${index}-ingredients-title`}
          />
        ) : isPreview ? (
          <section className="recipe-ingredients">
            <div className="recipe-ingredients__card">
              <h3 className="recipe-ingredients__title">רכיבים</h3>
              <EmptySectionNote>טרם נוספו רכיבים</EmptySectionNote>
            </div>
          </section>
        ) : null}

        {hasSteps ? (
          <RecipeSteps
            steps={section.steps}
            headingLevel={nestedHeading}
            titleId={`recipe-section-${index}-steps-title`}
          />
        ) : isPreview ? (
          <section className="recipe-steps">
            <h3 className="recipe-steps__title">שלבי הכנה</h3>
            <EmptySectionNote>טרם נוספו שלבי הכנה</EmptySectionNote>
          </section>
        ) : null}
      </div>
    </section>
  );
}
