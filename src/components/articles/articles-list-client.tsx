"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Plus, RefreshCw, Star, Tags } from "lucide-react";

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
import { ArticleRow } from "@/components/articles/article-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ArticlesListData } from "@/lib/articles/types";
import {
  ARTICLE_FEATURED_FILTERS,
  ARTICLE_SORT_VALUES,
  ARTICLE_STATUS_FILTERS,
} from "@/lib/validations/article";

type ArticlesListClientProps = {
  data: ArticlesListData;
};

const STATUS_FILTER_LABELS: Record<(typeof ARTICLE_STATUS_FILTERS)[number], string> = {
  all: "הכל",
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

const FEATURED_FILTER_LABELS: Record<
  (typeof ARTICLE_FEATURED_FILTERS)[number],
  string
> = {
  all: "הכל",
  featured: "מומלצים",
};

const SORT_LABELS: Record<(typeof ARTICLE_SORT_VALUES)[number], string> = {
  newest: "החדשים ביותר",
  oldest: "הישנים ביותר",
  title: "כותרת",
  updated: "עדכון אחרון",
};

function buildArticlesUrl(
  pathname: string,
  params: ArticlesListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) search.set("q", params.q);
  if (params.status !== "all") search.set("status", params.status);
  if (params.featured !== "all") search.set("featured", params.featured);
  if (params.tag !== "all") search.set("tag", params.tag);
  if (params.sort !== "newest") search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ArticlesListClient({ data }: ArticlesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query.q);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed === data.query.q) return;

      router.push(
        buildArticlesUrl(pathname, { ...data.query, q: trimmed, page: 1 })
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchValue, data.query, pathname, router]);

  const hasFilters =
    data.query.q.length > 0 ||
    data.query.status !== "all" ||
    data.query.featured !== "all" ||
    data.query.tag !== "all";

  return (
    <AdminListShell>
      <AdminPageHeader
        module="articles"
        title="פוסטים"
        description="ניהול הפוסטים והתוכן המקצועי באתר"
        action={{
          label: "פוסט חדש",
          href: "/admin/articles/new",
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: BookOpen,
            label: "פוסטים",
            value: data.pagination.totalCount,
            module: "articles",
            emoji: "📚",
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
            module: "articles",
            emoji: "⭐",
          },
        ]}
      />

      <AdminListFilters>
        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="articles-search" className="text-caption font-medium text-[var(--color-text-muted)]">
            חיפוש
          </label>
          <Input
            id="articles-search"
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
              buildArticlesUrl(pathname, {
                ...data.query,
                status: event.target.value as ArticlesListData["query"]["status"],
                page: 1,
              })
            )
          }
        >
          {ARTICLE_STATUS_FILTERS.map((value) => (
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
              buildArticlesUrl(pathname, {
                ...data.query,
                featured: event.target.value as ArticlesListData["query"]["featured"],
                page: 1,
              })
            )
          }
        >
          {ARTICLE_FEATURED_FILTERS.map((value) => (
            <option key={value} value={value}>
              {FEATURED_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="תגית"
          value={data.query.tag}
          onChange={(event) =>
            router.push(
              buildArticlesUrl(pathname, {
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
              buildArticlesUrl(pathname, {
                ...data.query,
                sort: event.target.value as ArticlesListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {ARTICLE_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} פוסטים`}>
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
          module="articles"
          icon={BookOpen}
          emoji="📚"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין פוסטים"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים — אולי הפוסט שחיפשת מחכה בטיוטות."
              : "בואי ניצור את הפוסט הראשון ונוסיף ידע מקצועי לאתר."
          }
          action={
            !hasFilters ? (
              <Link
                href="/admin/articles/new"
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                יצירת פוסט
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminListItems>
          {data.items.map((item) => (
            <ArticleRow key={item.id} item={item} />
          ))}
        </AdminListItems>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildArticlesUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildArticlesUrl(pathname, {
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
