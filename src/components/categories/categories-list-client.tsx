"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { CategoryRow } from "@/components/categories/category-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORY_TYPE_LABELS } from "@/lib/categories/constants";
import type { CategoriesListData } from "@/lib/categories/types";
import {
  CATEGORY_SORT_VALUES,
  CATEGORY_TYPE_FILTERS,
} from "@/lib/validations/category";

type CategoriesListClientProps = {
  data: CategoriesListData;
};

const TYPE_FILTER_LABELS: Record<
  (typeof CATEGORY_TYPE_FILTERS)[number],
  string
> = {
  all: "הכל",
  recipe: CATEGORY_TYPE_LABELS.recipe,
  article: CATEGORY_TYPE_LABELS.article,
};

const SORT_LABELS: Record<(typeof CATEGORY_SORT_VALUES)[number], string> = {
  newest: "החדשות ביותר",
  oldest: "הישנות ביותר",
  name: "שם",
};

function buildCategoriesUrl(
  pathname: string,
  params: CategoriesListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) {
    search.set("q", params.q);
  }

  if (params.type !== "all") {
    search.set("type", params.type);
  }

  if (params.sort !== "newest") {
    search.set("sort", params.sort);
  }

  if (params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function CategoriesListClient({ data }: CategoriesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query.q);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();

      if (trimmed === data.query.q) {
        return;
      }

      router.push(
        buildCategoriesUrl(pathname, {
          ...data.query,
          q: trimmed,
          page: 1,
        })
      );
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue, data.query, pathname, router]);

  const hasFilters = data.query.q.length > 0 || data.query.type !== "all";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-page-title">קטגוריות</h1>
          <p className="text-muted">ניהול קטגוריות למתכונים ומאמרים</p>
        </div>
        <Link
          href={
            data.query.type === "recipe" || data.query.type === "article"
              ? `/admin/categories/new?type=${data.query.type}`
              : "/admin/categories/new"
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-on-primary)] transition-colors hover:bg-[var(--color-secondary)]"
        >
          <Plus aria-hidden="true" className="size-4" />
          קטגוריה חדשה
        </Link>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="categories-search" className="text-sm font-medium">
            חיפוש
          </label>
          <Input
            id="categories-search"
            type="search"
            value={searchValue}
            placeholder="חיפוש לפי שם או כתובת"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <Select
          label="סוג"
          value={data.query.type}
          onChange={(event) =>
            router.push(
              buildCategoriesUrl(pathname, {
                ...data.query,
                type: event.target.value as CategoriesListData["query"]["type"],
                page: 1,
              })
            )
          }
        >
          {CATEGORY_TYPE_FILTERS.map((value) => (
            <option key={value} value={value}>
              {TYPE_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="מיון"
          value={data.query.sort}
          onChange={(event) =>
            router.push(
              buildCategoriesUrl(pathname, {
                ...data.query,
                sort: event.target.value as CategoriesListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {CATEGORY_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          {data.pagination.totalCount} קטגוריות
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
            title={hasFilters ? "לא נמצאו תוצאות" : "אין קטגוריות עדיין"}
            description={
              hasFilters
                ? "נסו לשנות את החיפוש או המסננים."
                : "צרו את הקטגוריה הראשונה שלכם."
            }
          />
          {!hasFilters ? (
            <Link
              href="/admin/categories/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-on-primary)]"
            >
              <Plus aria-hidden="true" className="size-4" />
              קטגוריה חדשה
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <CategoryRow key={item.id} item={item} />
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
                buildCategoriesUrl(pathname, {
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
                buildCategoriesUrl(pathname, {
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
