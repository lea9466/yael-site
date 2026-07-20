"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buildRecipeListingHref } from "@/lib/public/recipe-paths";
import type { PublicRecipeTag } from "@/lib/public/recipe-listing";
import { DIFFICULTY_LABELS } from "@/lib/recipes/constants";
import {
  PUBLIC_RECIPE_DIFFICULTY_FILTERS,
  PUBLIC_RECIPE_SORT_VALUES,
  type PublicRecipeListingQuery,
} from "@/lib/validations/public-recipe-listing";
import { cn } from "@/lib/utils/cn";

const SORT_LABELS: Record<(typeof PUBLIC_RECIPE_SORT_VALUES)[number], string> = {
  newest: "החדשים ביותר",
  oldest: "הישנים ביותר",
  title: "לפי שם",
};

type RecipesListingFiltersProps = {
  basePath: string;
  query: PublicRecipeListingQuery;
  tags: PublicRecipeTag[];
  className?: string;
};

export function RecipesListingFilters({
  basePath,
  query,
  tags,
  className,
}: RecipesListingFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  return (
    <form
      className={cn("recipes-listing-filters", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const q = String(formData.get("q") ?? "");
        navigate({ q, page: 1 });
      }}
    >
      <div className="recipes-listing-filters__search">
        <label htmlFor="recipes-listing-search" className="sr-only">
          חיפוש מתכונים
        </label>
        <div className="recipes-listing-filters__search-field">
          <Search
            aria-hidden="true"
            className="recipes-listing-filters__search-icon"
          />
          <Input
            id="recipes-listing-search"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="חיפוש מתכון..."
            className="recipes-listing-filters__search-input"
            disabled={isPending}
          />
        </div>
        <Button type="submit" variant="secondary" loading={isPending}>
          חיפוש
        </Button>
      </div>

      <div className="recipes-listing-filters__controls">
        {tags.length > 0 ? (
          <Select
            id="recipes-listing-tag"
            label="תגית"
            value={query.tag}
            disabled={isPending}
            onChange={(event) => {
              navigate({ tag: event.target.value, page: 1 });
            }}
          >
            <option value="all">כל התגיות</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                {tag.name}
              </option>
            ))}
          </Select>
        ) : null}

        <Select
          id="recipes-listing-difficulty"
          label="רמת קושי"
          value={query.difficulty}
          disabled={isPending}
          onChange={(event) => {
            navigate({
              difficulty: event.target
                .value as PublicRecipeListingQuery["difficulty"],
              page: 1,
            });
          }}
        >
          {PUBLIC_RECIPE_DIFFICULTY_FILTERS.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? "כל הרמות" : DIFFICULTY_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          id="recipes-listing-sort"
          label="מיון"
          value={query.sort}
          disabled={isPending}
          onChange={(event) => {
            navigate({
              sort: event.target.value as PublicRecipeListingQuery["sort"],
              page: 1,
            });
          }}
        >
          {PUBLIC_RECIPE_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}
