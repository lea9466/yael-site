"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChefHat, Plus, RefreshCw, Tag } from "lucide-react";

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
import { TagRow } from "@/components/tags/tag-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TAG_TYPE_LABELS } from "@/lib/tags/constants";
import type { TagsListData } from "@/lib/tags/types";
import { TAG_SORT_VALUES, TAG_TYPE_FILTERS } from "@/lib/validations/tag";

type TagsListClientProps = {
  data: TagsListData;
};

const TYPE_FILTER_LABELS: Record<(typeof TAG_TYPE_FILTERS)[number], string> = {
  all: "הכל",
  recipe: TAG_TYPE_LABELS.recipe,
  article: TAG_TYPE_LABELS.article,
};

const SORT_LABELS: Record<(typeof TAG_SORT_VALUES)[number], string> = {
  newest: "החדשות ביותר",
  oldest: "הישנות ביותר",
  name: "שם",
};

function buildTagsUrl(
  pathname: string,
  params: TagsListData["query"]
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

export function TagsListClient({ data }: TagsListClientProps) {
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
        buildTagsUrl(pathname, {
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

  const newTagHref =
    data.query.type === "recipe" || data.query.type === "article"
      ? `/admin/tags/new?type=${data.query.type}`
      : "/admin/tags/new";

  return (
    <AdminListShell>
      <AdminPageHeader
        module="tags"
        title="תגיות"
        description="ניהול תגיות למתכונים ולפוסטים"
        action={{
          label: "תגית חדשה",
          href: newTagHref,
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: Tag,
            label: "תגיות",
            value: data.pagination.totalCount,
            module: "tags",
            emoji: "🏷️",
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
            label: "לפוסטים",
            value: data.items.filter((item) => item.type === "article").length,
            module: "articles",
            emoji: "📚",
          },
          {
            icon: Tag,
            label: "פנויות",
            value: data.items.filter((item) => item.usageCount === 0).length,
            module: "tags",
            emoji: "✨",
          },
        ]}
      />

      <AdminListFilters className="lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="tags-search"
            className="text-caption font-medium text-[var(--color-text-muted)]"
          >
            חיפוש
          </label>
          <Input
            id="tags-search"
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
              buildTagsUrl(pathname, {
                ...data.query,
                type: event.target.value as TagsListData["query"]["type"],
                page: 1,
              })
            )
          }
        >
          {TAG_TYPE_FILTERS.map((value) => (
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
              buildTagsUrl(pathname, {
                ...data.query,
                sort: event.target.value as TagsListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {TAG_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} תגיות`}>
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
          module="tags"
          icon={Tag}
          emoji="🏷️"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין תגיות"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים."
              : "תגיות עוזרות לארגן מתכונים ופוסטים ולאפשר סינון נוח באתר."
          }
          action={
            !hasFilters ? (
              <Link
                href={newTagHref}
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                יצירת תגית ראשונה
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminListItems>
          {data.items.map((item) => (
            <TagRow key={item.id} item={item} />
          ))}
        </AdminListItems>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildTagsUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildTagsUrl(pathname, {
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
