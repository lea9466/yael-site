"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { buildBlogListingHref } from "@/lib/public/blog-paths";
import type { PublicBlogListingQuery } from "@/lib/validations/public-blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogListingSearchProps = {
  basePath: string;
  query: PublicBlogListingQuery;
  className?: string;
};

export function BlogListingSearch({
  basePath,
  query,
  className,
}: BlogListingSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query.q);
  const [syncedQuery, setSyncedQuery] = useState(query.q);

  if (query.q !== syncedQuery) {
    setSyncedQuery(query.q);
    setSearchValue(query.q);
  }

  useEffect(() => {
    const normalized = searchValue.trim();
    const current = query.q.trim();

    if (normalized === current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const href = buildBlogListingHref(basePath, {
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
        const href = buildBlogListingHref(basePath, {
          ...query,
          q: normalized,
          page: 1,
        });

        startTransition(() => {
          router.push(href);
        });
      }}
    >
      <label htmlFor="blog-listing-search" className="sr-only">
        חיפוש פוסטים
      </label>
      <div className="recipes-listing-search__field">
        <Search aria-hidden="true" className="recipes-listing-search__icon" />
        <Input
          id="blog-listing-search"
          name="q"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="חיפוש פוסט..."
          className="recipes-listing-search__input"
          disabled={isPending}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
