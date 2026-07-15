"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, RefreshCw, ChefHat, FolderTree, Star, Tags } from "lucide-react";

import {
  AdminListFilters,
  AdminListItems,
  AdminListPagination,
  AdminListShell,
  AdminListToolbar,
} from "@/components/admin/admin-list-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { RecipeRow } from "@/components/recipes/recipe-row";
import { Button } from "@/components/ui/button";
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
    <AdminListShell>
      <AdminPageHeader
        module="recipes"
        title="מתכונים"
        description="נהלי את כל המתכונים שיופיעו באתר — בריאים, טעימים ומלאי השראה."
        action={{
          label: "מתכון חדש",
          href: "/admin/recipes/new",
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: ChefHat,
            label: "מתכונים",
            value: data.pagination.totalCount,
            module: "recipes",
            emoji: "🥗",
          },
          {
            icon: FolderTree,
            label: "קטגוריות",
            value: data.categories.length,
            module: "categories",
            emoji: "🌿",
          },
          {
            icon: Tags,
            label: "תגיות",
            value: data.tags.length,
            module: "tags",
            emoji: "🏷️",
          },
          {
            icon: Star,
            label: "מומלצים",
            value: data.items.filter((item) => item.featured).length,
            module: "recipes",
            emoji: "⭐",
          },
        ]}
      />

      <AdminListFilters>
        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="recipes-search" className="text-caption font-medium text-[var(--color-text-muted)]">
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
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} מתכונים`}>
        <Button
          variant="outline"
          size="sm"
          loading={isRefreshing}
          onClick={() => startRefresh(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          רענון
        </Button>
      </AdminListToolbar>

      {data.items.length === 0 ? (
        <AdminEmptyState
          module="recipes"
          icon={ChefHat}
          emoji="🥗"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין מתכונים"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים — אולי המתכון הבא מחכה ממש מאחורי פינה."
              : "בואי ניצור את המתכון הראשון שלך — בריא, טעים ומלא השראה."
          }
          action={
            !hasFilters ? (
              <Link
                href="/admin/recipes/new"
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                מתכון חדש
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminListItems>
          {data.items.map((item) => (
            <RecipeRow key={item.id} item={item} />
          ))}
        </AdminListItems>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildRecipesUrl(pathname, {
                ...data.query,
                page: data.pagination.page + 1,
              })
            )
          }
        />
      ) : null}
    </AdminListShell>
  );
}
