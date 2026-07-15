import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { escapeHtml, sanitizePlainText } from "@/lib/services/sanitize";
import { DIFFICULTY_LABELS } from "@/lib/recipes/constants";
import { formatDurationMinutes } from "@/lib/recipes/format";
import type { RecipeDetail } from "@/lib/recipes/types";

type RecipePublicViewProps = {
  recipe: RecipeDetail;
};

export function RecipePublicView({ recipe }: RecipePublicViewProps) {
  const ogImageUrl = recipe.ogUrl ?? recipe.coverUrl;
  const description = sanitizePlainText(recipe.description);
  const yaelTip = recipe.content.yael_tip
    ? sanitizePlainText(recipe.content.yael_tip)
    : null;

  return (
    <article className="mx-auto w-full max-w-5xl space-y-10">
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
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-title">{escapeHtml(recipe.title)}</h1>
            {recipe.featured ? <Badge variant="info">מומלץ</Badge> : null}
          </div>

          {description ? (
            <p className="text-lg text-[var(--color-text-muted)]">
              {escapeHtml(description)}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
            {recipe.category ? (
              <span>קטגוריה: {escapeHtml(recipe.category.name)}</span>
            ) : null}
            <span>{formatDurationMinutes(recipe.duration_minutes)}</span>
            <span>{recipe.servings} מנות</span>
            <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
          </div>

          {recipe.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag.id} variant="neutral">
                  {escapeHtml(tag.name)}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {recipe.content.ingredients.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">רכיבים</h2>
          <ul className="space-y-2">
            {recipe.content.ingredients.map((ingredient) => (
              <li
                key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                {escapeHtml(ingredient.name)} — {escapeHtml(ingredient.quantity)}{" "}
                {escapeHtml(ingredient.unit)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recipe.content.steps.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">שלבי הכנה</h2>
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
        </section>
      ) : null}

      {yaelTip ? (
        <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
          <h2 className="text-section-title">הטיפ של יעל</h2>
          <p className="text-body leading-8">{escapeHtml(yaelTip)}</p>
        </section>
      ) : null}

      {recipe.galleryUrls.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-section-title">גלריה</h2>
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
        </section>
      ) : null}

      {ogImageUrl ? (
        <p className="sr-only">תמונת שיתוף: {ogImageUrl}</p>
      ) : null}
    </article>
  );
}
