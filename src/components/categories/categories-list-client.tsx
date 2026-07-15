"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChefHat, FolderTree, Plus, RefreshCw } from "lucide-react";

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
import { CategoryRow } from "@/components/categories/category-row";
import { Button } from "@/components/ui/button";
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

  const newCategoryHref =
    data.query.type === "recipe" || data.query.type === "article"
      ? `/admin/categories/new?type=${data.query.type}`
      : "/admin/categories/new";

  return (
    <AdminListShell>
      <AdminPageHeader
        module="categories"
        title="קטגוריות"
        description="ארגני את התוכן בצורה ויזואלית וברורה — לכל מתכון ומאמר בית משלו."
        action={{
          label: "קטגוריה חדשה",
          href: newCategoryHref,
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: FolderTree,
            label: "קטגוריות",
            value: data.pagination.totalCount,
            module: "categories",
            emoji: "🗂️",
          },
          {
            icon: ChefHat,
            label: "למתכונים",
            value: data.items.filter((item) => item.type === "recipe").length,
            module: "recipes",
            emoji: "🥗",
          },
          {
            icon: BookOpen,
            label: "למאמרים",
            value: data.items.filter((item) => item.type === "article").length,
            module: "articles",
            emoji: "📚",
          },
          {
            icon: FolderTree,
            label: "פנויות",
            value: data.items.filter((item) => item.usageCount === 0).length,
            module: "categories",
            emoji: "✨",
          },
        ]}
      />

      <AdminListFilters className="lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="categories-search" className="text-caption font-medium text-[var(--color-text-muted)]">
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
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} קטגוריות`}>
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
          module="categories"
          icon={FolderTree}
          emoji="🗂️"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין קטגוריות"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים."
              : "בואי ניצור קטגוריות שיעזרו לארגן את המתכונים והמאמרים בצורה יפה."
          }
          action={
            !hasFilters ? (
              <Link
                href={newCategoryHref}
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                קטגוריה חדשה
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminListItems>
          {data.items.map((item) => (
            <CategoryRow key={item.id} item={item} />
          ))}
        </AdminListItems>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildCategoriesUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildCategoriesUrl(pathname, {
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
