import { RecipeBreadcrumbs } from "@/components/recipes/public/recipe-breadcrumbs";
import { RecipeGallery } from "@/components/recipes/public/recipe-gallery";
import { RecipeHero } from "@/components/recipes/public/recipe-hero";
import { RecipeSectionBlock } from "@/components/recipes/public/recipe-section-block";
import { RecipeTip } from "@/components/recipes/public/recipe-tip";
import { normalizeRecipeSections } from "@/lib/recipes/content";
import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { RecipeDetail } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipePublicViewProps = {
  recipe: RecipeDetail;
  mode?: "public" | "preview";
  showBreadcrumbs?: boolean;
};

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

export function RecipePublicView({
  recipe,
  mode = "public",
  showBreadcrumbs = mode === "public",
}: RecipePublicViewProps) {
  const isPreview = mode === "preview";
  const yaelTip = recipe.content.yael_tip
    ? sanitizePlainText(recipe.content.yael_tip)
    : null;

  const galleryImages = recipe.galleryUrls.filter(
    (item): item is typeof item & { url: string } => Boolean(item.url)
  );

  const sections = normalizeRecipeSections(recipe.content);
  const hasMultipleSections = sections.length > 1;
  const hasRecipeBody = sections.some(
    (section) =>
      section.ingredients.some(
        (ingredient) => formatIngredientLine(ingredient).length > 0
      ) ||
      section.steps.some((step) => sanitizePlainText(step.text).length > 0)
  );
  const hasTip = Boolean(yaelTip);
  const hasGallery = galleryImages.length > 0;

  return (
    <article
      className={cn(
        "recipe-detail",
        isPreview && "recipe-detail--preview"
      )}
    >
      {showBreadcrumbs ? (
        <RecipeBreadcrumbs
          recipeTitle={recipe.title}
          category={recipe.category}
        />
      ) : null}

      <RecipeHero recipe={recipe} showActions={!isPreview} />

      {hasRecipeBody || isPreview ? (
        <div
          className={cn(
            "recipe-detail__body",
            hasMultipleSections && "recipe-detail__body--sections"
          )}
        >
          {hasRecipeBody ? (
            sections.map((section, index) => {
              const sectionTitle = sanitizePlainText(section.title);

              return (
                <RecipeSectionBlock
                  key={`section-${index}-${sectionTitle}`}
                  section={section}
                  index={index}
                  showSectionTitle={hasMultipleSections}
                  isPreview={isPreview}
                />
              );
            })
          ) : (
            <section className="recipe-section recipe-section--named">
              <div className="recipe-section__grid">
                <section className="recipe-ingredients">
                  <div className="recipe-ingredients__card">
                    <h2 className="recipe-ingredients__title">רכיבים</h2>
                    <EmptySectionNote>טרם נוספו רכיבים</EmptySectionNote>
                  </div>
                </section>
                <section className="recipe-steps">
                  <h2 className="recipe-steps__title">שלבי הכנה</h2>
                  <EmptySectionNote>טרם נוספו שלבי הכנה</EmptySectionNote>
                </section>
              </div>
            </section>
          )}
        </div>
      ) : null}

      {hasTip ? (
        <RecipeTip tip={yaelTip} />
      ) : isPreview ? (
        <section className="recipe-tip recipe-tip--empty">
          <h2 className="recipe-tip__title">הטיפ של יעל</h2>
          <EmptySectionNote>טרם נוסף טיפ</EmptySectionNote>
        </section>
      ) : null}

      {hasGallery ? (
        <RecipeGallery images={galleryImages} recipeTitle={recipe.title} />
      ) : isPreview ? (
        <section className="recipe-gallery">
          <h2 className="recipe-gallery__title">גלריה</h2>
          <EmptySectionNote>טרם נוספו תמונות לגלריה</EmptySectionNote>
        </section>
      ) : null}
    </article>
  );
}
