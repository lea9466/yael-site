"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  RECIPE_LISTING_SORT_UI,
  countActiveRecipeListingFilters,
  parseRecipeListingTagSlugs,
  serializeRecipeListingTagSlugs,
} from "@/lib/public/recipe-listing-ui";
import { buildRecipeListingHref } from "@/lib/public/recipe-paths";
import type { PublicRecipeTag } from "@/lib/public/recipe-listing";
import { DIFFICULTY_LABELS, RECIPE_DIFFICULTIES } from "@/lib/recipes/constants";
import type { PublicRecipeListingQuery } from "@/lib/validations/public-recipe-listing";
import { cn } from "@/lib/utils/cn";

type DraftFilters = {
  tags: string[];
  difficulty: PublicRecipeListingQuery["difficulty"];
  sort: PublicRecipeListingQuery["sort"];
};

type RecipesListingFiltersProps = {
  basePath: string;
  query: PublicRecipeListingQuery;
  tags: PublicRecipeTag[];
  className?: string;
};

function toDraft(query: PublicRecipeListingQuery): DraftFilters {
  return {
    tags: parseRecipeListingTagSlugs(query.tag),
    difficulty: query.difficulty,
    sort: query.sort === "oldest" ? "newest" : query.sort,
  };
}

export function RecipesListingFilters({
  basePath,
  query,
  tags,
  className,
}: RecipesListingFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>(() => toDraft(query));
  const difficultyGroupId = useId();
  const sortGroupId = useId();
  const activeFilterCount = countActiveRecipeListingFilters(query);

  useEffect(() => {
    if (!drawerOpen) {
      setDraft(toDraft(query));
    }
  }, [query, drawerOpen]);

  const navigate = (next: Partial<PublicRecipeListingQuery>) => {
    const href = buildRecipeListingHref(basePath, {
      q: next.q ?? query.q,
      tag: next.tag ?? query.tag,
      difficulty: next.difficulty ?? query.difficulty,
      sort: next.sort ?? query.sort,
      page: next.page ?? 1,
    });

    startTransition(() => {
      router.push(href);
    });
  };

  const toggleTag = (slug: string) => {
    setDraft((current) => {
      const exists = current.tags.includes(slug);

      return {
        ...current,
        tags: exists
          ? current.tags.filter((item) => item !== slug)
          : [...current.tags, slug],
      };
    });
  };

  const applyDraft = () => {
    navigate({
      tag: serializeRecipeListingTagSlugs(draft.tags),
      difficulty: draft.difficulty,
      sort: draft.sort,
      page: 1,
    });
    setDrawerOpen(false);
  };

  const clearAndApply = () => {
    setDraft({
      tags: [],
      difficulty: "all",
      sort: "newest",
    });
    navigate({
      tag: "all",
      difficulty: "all",
      sort: "newest",
      page: 1,
    });
    setDrawerOpen(false);
  };

  return (
    <div className={cn("recipes-listing-filter-trigger", className)}>
      <button
        type="button"
        className={cn(
          "recipes-listing-filter-trigger__button public-focus-ring",
          activeFilterCount > 0 &&
            "recipes-listing-filter-trigger__button--active"
        )}
        onClick={() => setDrawerOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span>סינון</span>
        {activeFilterCount > 0 ? (
          <span className="recipes-listing-filter-trigger__badge">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="סינון מתקדם"
        description="בחרי תגיות, רמת קושי ומיון"
        className="recipes-filter-drawer-overlay"
        panelClassName="recipes-filter-drawer"
        footer={
          <div className="recipes-filter-drawer__actions">
            <Button
              type="button"
              variant="ghost"
              onClick={clearAndApply}
              disabled={isPending}
            >
              נקה סינון
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={applyDraft}
              loading={isPending}
            >
              החל סינון
            </Button>
          </div>
        }
      >
        <div className="recipes-filter-drawer__sections">
          <fieldset className="recipes-filter-drawer__section">
            <legend className="recipes-filter-drawer__legend">רמת קושי</legend>
            <div
              className="recipes-filter-drawer__radios"
              role="radiogroup"
              aria-labelledby={difficultyGroupId}
            >
              <span id={difficultyGroupId} className="sr-only">
                רמת קושי
              </span>
              {RECIPE_DIFFICULTIES.map((value) => (
                <label
                  key={value}
                  className={cn(
                    "recipes-filter-drawer__radio",
                    draft.difficulty === value &&
                      "recipes-filter-drawer__radio--active"
                  )}
                >
                  <input
                    type="radio"
                    name="recipes-difficulty"
                    value={value}
                    checked={draft.difficulty === value}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        difficulty: value,
                      }))
                    }
                  />
                  <span>{DIFFICULTY_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {tags.length > 0 ? (
            <fieldset className="recipes-filter-drawer__section">
              <legend className="recipes-filter-drawer__legend">תגיות</legend>
              <div className="recipes-filter-drawer__chips">
                {tags.map((tag) => {
                  const selected = draft.tags.includes(tag.slug);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={cn(
                        "recipes-filter-drawer__chip public-focus-ring",
                        selected && "recipes-filter-drawer__chip--active"
                      )}
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag.slug)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <fieldset className="recipes-filter-drawer__section">
            <legend className="recipes-filter-drawer__legend">מיון</legend>
            <div
              className="recipes-filter-drawer__radios"
              role="radiogroup"
              aria-labelledby={sortGroupId}
            >
              <span id={sortGroupId} className="sr-only">
                מיון
              </span>
              {RECIPE_LISTING_SORT_UI.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "recipes-filter-drawer__radio",
                    draft.sort === option.value &&
                      "recipes-filter-drawer__radio--active"
                  )}
                >
                  <input
                    type="radio"
                    name="recipes-sort"
                    value={option.value}
                    checked={draft.sort === option.value}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        sort: option.value,
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Dialog>
    </div>
  );
}
