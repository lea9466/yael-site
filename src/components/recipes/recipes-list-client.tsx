"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { RecipeRow } from "@/components/recipes/recipe-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { RecipesListData } from "@/lib/recipes/types";
import {
  RECIPE_FEATURED_FILTERS,
  RECIPE_SORT_VALUES,
  RECIPE_STATUS_FILTERS,
} from "@/lib/validations/recipe";

type RecipesListClientProps = {
  data: RecipesListData;
};

const STATUS_FILTER_LABELS: Record<(typeof RECIPE_STATUS_FILTERS)[number], string> = {
  all: "הכל",
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

const FEATURED_FILTER_LABELS: Record<
  (typeof RECIPE_FEATURED_FILTERS)[number],
  string
> = {
  all: "הכל",
  featured: "מומלצים",
};

const SORT_LABELS: Record<(typeof RECIPE_SORT_VALUES)[number], string> = {
  newest: "החדשים ביותר",
  oldest: "הישנים ביותר",
  title: "כותרת",
  updated: "עדכון אחרון",
};

function buildRecipesUrl(
  pathname: string,
  params: RecipesListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) search.set("q", params.q);
  if (params.status !== "all") search.set("status", params.status);
  if (params.featured !== "all") search.set("featured", params.featured);
  if (params.category !== "all") search.set("category", params.category);
  if (params.tag !== "all") search.set("tag", params.tag);
  if (params.sort !== "newest") search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function RecipesListClient({ data }: RecipesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query.q);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed === data.query.q) return;

      router.push(
        buildRecipesUrl(pathname, { ...data.query, q: trimmed, page: 1 })
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchValue, data.query, pathname, router]);

  const hasFilters =
    data.query.q.length > 0 ||
    data.query.status !== "all" ||
    data.query.featured !== "all" ||
    data.query.category !== "all" ||
    data.query.tag !== "all";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-page-title">מתכונים</h1>
          <p className="text-muted">ניהול המתכונים המוצגים באתר</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-on-primary)] transition-colors hover:bg-[var(--color-secondary)]"
        >
          <Plus aria-hidden="true" className="size-4" />
          מתכון חדש
        </Link>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="recipes-search" className="text-sm font-medium">
            חיפוש
          </label>
          <Input
            id="recipes-search"
            type="search"
            value={searchValue}
            placeholder="חיפוש לפי כותרת"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <Select
          label="סטטוס"
          value={data.query.status}
          onChange={(event) =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                status: event.target.value as RecipesListData["query"]["status"],
                page: 1,
              })
            )
          }
        >
          {RECIPE_STATUS_FILTERS.map((value) => (
            <option key={value} value={value}>
              {STATUS_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="מומלצים"
          value={data.query.featured}
          onChange={(event) =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                featured: event.target.value as RecipesListData["query"]["featured"],
                page: 1,
              })
            )
          }
        >
          {RECIPE_FEATURED_FILTERS.map((value) => (
            <option key={value} value={value}>
              {FEATURED_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="קטגוריה"
          value={data.query.category}
          onChange={(event) =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                category: event.target.value,
                page: 1,
              })
            )
          }
        >
          <option value="all">הכל</option>
          {data.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          label="תגית"
          value={data.query.tag}
          onChange={(event) =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                tag: event.target.value,
                page: 1,
              })
            )
          }
        >
          <option value="all">הכל</option>
          {data.tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>

        <Select
          label="מיון"
          value={data.query.sort}
          onChange={(event) =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                sort: event.target.value as RecipesListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {RECIPE_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          {data.pagination.totalCount} מתכונים
        </p>
        <Button
          variant="outline"
          size="sm"
          loading={isRefreshing}
          onClick={() => startRefresh(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          רענון
        </Button>
      </div>

      {data.items.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={hasFilters ? "לא נמצאו תוצאות" : "אין מתכונים עדיין"}
            description={
              hasFilters
                ? "נסו לשנות את החיפוש או המסננים."
                : "צרו את המתכון הראשון שלכם."
            }
          />
          {!hasFilters ? (
            <Link
              href="/admin/recipes/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-on-primary)]"
            >
              <Plus aria-hidden="true" className="size-4" />
              מתכון חדש
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <RecipeRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={data.pagination.page <= 1}
            onClick={() =>
              router.push(
                buildRecipesUrl(pathname, {
                  ...data.query,
                  page: data.pagination.page - 1,
                })
              )
            }
          >
            הקודם
          </Button>
          <p className="text-caption text-[var(--color-text-muted)]">
            עמוד {data.pagination.page} מתוך {data.pagination.totalPages}
          </p>
          <Button
            variant="outline"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() =>
              router.push(
                buildRecipesUrl(pathname, {
                  ...data.query,
                  page: data.pagination.page + 1,
                })
              )
            }
          >
            הבא
          </Button>
        </div>
      ) : null}
    </div>
  );
}
