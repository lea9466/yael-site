import Image from "next/image";

import { AdminFeaturedBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { escapeHtml, sanitizePlainText } from "@/lib/services/sanitize";
import { DIFFICULTY_LABELS } from "@/lib/recipes/constants";
import { formatDurationMinutes } from "@/lib/recipes/format";
import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import type { RecipeDetail } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipePublicViewProps = {
  recipe: RecipeDetail;
  mode?: "public" | "preview";
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
}: RecipePublicViewProps) {
  const isPreview = mode === "preview";
  const ogImageUrl = recipe.ogUrl ?? recipe.coverUrl;
  const description = sanitizePlainText(recipe.description);
  const yaelTip = recipe.content.yael_tip
    ? sanitizePlainText(recipe.content.yael_tip)
    : null;

  const hasIngredients = recipe.content.ingredients.length > 0;
  const hasSteps = recipe.content.steps.length > 0;
  const showIngredients = isPreview || hasIngredients;
  const showSteps = isPreview || hasSteps;
  const showYaelTip = isPreview || Boolean(yaelTip);
  const hasGalleryImages = recipe.galleryUrls.some((item) => item.url);
  const showGallery = isPreview || hasGalleryImages;

  return (
    <article
      className={cn(
        "w-full space-y-10",
        isPreview
          ? "rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 sm:p-8"
          : "mx-auto max-w-5xl"
      )}
    >
      <header className="space-y-4">
        {recipe.coverUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]">
            <Image
              src={recipe.coverUrl}
              alt={recipe.coverAlt ?? recipe.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : isPreview ? (
          <EmptySectionNote>טרם נבחרה תמונת כיסוי</EmptySectionNote>
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-title">{escapeHtml(recipe.title)}</h1>
            {recipe.featured ? <AdminFeaturedBadge size="sm" /> : null}
          </div>

          {description ? (
            <p className="text-lg text-[var(--color-text-muted)]">
              {escapeHtml(description)}
            </p>
          ) : isPreview ? (
            <p className="text-sm text-[var(--color-text-muted)]">אין תיאור</p>
          ) : null}

          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
            {recipe.category ? (
              <span>קטגוריה: {escapeHtml(recipe.category.name)}</span>
            ) : isPreview ? (
              <span>ללא קטגוריה</span>
            ) : null}
            <span>זמן הכנה: {formatDurationMinutes(recipe.duration_minutes)}</span>
            <span>{recipe.servings} מנות</span>
            <span>רמת קושי: {DIFFICULTY_LABELS[recipe.difficulty]}</span>
          </div>

          {recipe.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag.id} variant="neutral">
                  {escapeHtml(tag.name)}
                </Badge>
              ))}
            </div>
          ) : isPreview ? (
            <p className="text-sm text-[var(--color-text-muted)]">אין תגיות</p>
          ) : null}
        </div>
      </header>

      {showIngredients ? (
        <section className="space-y-4">
          <h2 className="text-section-title">רכיבים</h2>
          {hasIngredients ? (
            <ul className="space-y-2">
              {recipe.content.ingredients.map((ingredient, index) => (
                <li
                  key={`${index}-${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  {escapeHtml(formatIngredientLine(ingredient))}
                </li>
              ))}
            </ul>
          ) : (
            <EmptySectionNote>טרם נוספו רכיבים</EmptySectionNote>
          )}
        </section>
      ) : null}

      {showSteps ? (
        <section className="space-y-4">
          <h2 className="text-section-title">שלבי הכנה</h2>
          {hasSteps ? (
            <ol className="space-y-3">
              {recipe.content.steps.map((step, index) => (
                <li
                  key={`${index}-${step.text}`}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3"
                >
                  <span className="font-medium">שלב {index + 1}: </span>
                  {escapeHtml(sanitizePlainText(step.text))}
                </li>
              ))}
            </ol>
          ) : (
            <EmptySectionNote>טרם נוספו שלבי הכנה</EmptySectionNote>
          )}
        </section>
      ) : null}

      {showYaelTip ? (
        <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
          <h2 className="text-section-title">הטיפ של יעל</h2>
          {yaelTip ? (
            <p className="text-body leading-8">{escapeHtml(yaelTip)}</p>
          ) : (
            <EmptySectionNote>טרם נוסף טיפ</EmptySectionNote>
          )}
        </section>
      ) : null}

      {showGallery ? (
        <section className="space-y-4">
          <h2 className="text-section-title">גלריה</h2>
          {hasGalleryImages ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipe.galleryUrls.map((item) =>
                item.url ? (
                  <div
                    key={item.media_id}
                    className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
                  >
                    <Image
                      src={item.url}
                      alt={item.alt ?? recipe.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <EmptySectionNote>טרם נוספו תמונות לגלריה</EmptySectionNote>
          )}
        </section>
      ) : null}

      {ogImageUrl ? (
        <p className="sr-only">תמונת שיתוף: {ogImageUrl}</p>
      ) : null}
    </article>
  );
}
