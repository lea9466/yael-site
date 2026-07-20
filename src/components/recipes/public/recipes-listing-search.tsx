"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { buildRecipeListingHref } from "@/lib/public/recipe-paths";
import type { PublicRecipeListingQuery } from "@/lib/validations/public-recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesListingSearchProps = {
  basePath: string;
  query: PublicRecipeListingQuery;
  className?: string;
};

export function RecipesListingSearch({
  basePath,
  query,
  className,
}: RecipesListingSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query.q);

  useEffect(() => {
    setSearchValue(query.q);
  }, [query.q]);

  useEffect(() => {
    const normalized = searchValue.trim();
    const current = query.q.trim();

    if (normalized === current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const href = buildRecipeListingHref(basePath, {
        ...query,
        q: normalized,
        page: 1,
      });

      startTransition(() => {
        router.push(href);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchValue, query, basePath, router]);

  return (
    <form
      className={cn("recipes-listing-search", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const normalized = searchValue.trim();
        const href = buildRecipeListingHref(basePath, {
          ...query,
          q: normalized,
          page: 1,
        });

        startTransition(() => {
          router.push(href);
        });
      }}
    >
      <label htmlFor="recipes-listing-search" className="sr-only">
        חיפוש מתכונים
      </label>
      <div className="recipes-listing-search__field">
        <Search aria-hidden="true" className="recipes-listing-search__icon" />
        <Input
          id="recipes-listing-search"
          name="q"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="חיפוש מתכון..."
          className="recipes-listing-search__input"
          disabled={isPending}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
