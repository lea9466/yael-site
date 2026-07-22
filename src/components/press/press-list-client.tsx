"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Newspaper, Plus, RefreshCw } from "lucide-react";

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
import { PressRow } from "@/components/press/press-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PressArticlesListData } from "@/lib/press/types";
import {
  PRESS_SORT_VALUES,
  PRESS_STATUS_FILTERS,
} from "@/lib/validations/press-article";

type PressListClientProps = {
  data: PressArticlesListData;
};

const STATUS_FILTER_LABELS: Record<(typeof PRESS_STATUS_FILTERS)[number], string> = {
  all: "הכל",
  draft: "טיוטה",
  published: "מפורסם",
};

const SORT_LABELS: Record<(typeof PRESS_SORT_VALUES)[number], string> = {
  display_order: "סדר תצוגה",
  newest: "החדשים ביותר",
  oldest: "הישנים ביותר",
  title: "כותרת",
  updated: "עדכון אחרון",
};

function buildPressUrl(
  pathname: string,
  params: PressArticlesListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) search.set("q", params.q);
  if (params.status !== "all") search.set("status", params.status);
  if (params.sort !== "display_order") search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function PressListClient({ data }: PressListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query.q);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed === data.query.q) return;

      router.push(
        buildPressUrl(pathname, { ...data.query, q: trimmed, page: 1 })
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchValue, data.query, pathname, router]);

  const hasFilters =
    data.query.q.length > 0 || data.query.status !== "all";

  return (
    <AdminListShell>
      <AdminPageHeader
        module="press"
        title="כתבות וראיונות"
        description="ניהול כתבות מהעיתונות והצגתן באתר"
        action={{
          label: "כתבה חדשה",
          href: "/admin/press/new",
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: Newspaper,
            label: "כתבות",
            value: data.stats.totalCount,
            module: "press",
            emoji: "📰",
          },
          {
            icon: Newspaper,
            label: "מפורסמות",
            value: data.stats.publishedCount,
            module: "press",
            emoji: "✅",
          },
          {
            icon: Newspaper,
            label: "טיוטות",
            value: data.stats.draftCount,
            module: "press",
            emoji: "📝",
          },
        ]}
      />

      <AdminListFilters className="lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="press-search"
            className="text-caption font-medium text-[var(--color-text-muted)]"
          >
            חיפוש
          </label>
          <Input
            id="press-search"
            type="search"
            value={searchValue}
            placeholder="חיפוש לפי כותרת או גוף תקשורת"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        <Select
          label="סטטוס"
          value={data.query.status}
          onChange={(event) =>
            router.push(
              buildPressUrl(pathname, {
                ...data.query,
                status: event.target.value as (typeof PRESS_STATUS_FILTERS)[number],
                page: 1,
              })
            )
          }
        >
          {PRESS_STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {STATUS_FILTER_LABELS[status]}
            </option>
          ))}
        </Select>
        <Select
          label="מיון"
          value={data.query.sort}
          onChange={(event) =>
            router.push(
              buildPressUrl(pathname, {
                ...data.query,
                sort: event.target.value as (typeof PRESS_SORT_VALUES)[number],
                page: 1,
              })
            )
          }
        >
          {PRESS_SORT_VALUES.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} כתבות`}>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
          >
            ניקוי סינון
          </Button>
        ) : null}
        <Button
          type="button"
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
          icon={Newspaper}
          title={hasFilters ? "לא נמצאו כתבות" : "עדיין אין כתבות"}
          description={
            hasFilters
              ? "נסו לשנות את הסינון או החיפוש."
              : "הוסיפו כתבה ראשונה מהעיתונות להצגה באתר."
          }
          action={
            hasFilters ? undefined : (
              <Link
                href="/admin/press/new"
                className="admin-btn-primary inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-medium"
              >
                כתבה חדשה
              </Link>
            )
          }
        />
      ) : (
        <>
          <AdminListItems>
            {data.items.map((item) => (
              <PressRow key={item.id} item={item} />
            ))}
          </AdminListItems>
          <AdminListPagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPrevious={() =>
              router.push(
                buildPressUrl(pathname, {
                  ...data.query,
                  page: Math.max(1, data.pagination.page - 1),
                })
              )
            }
            onNext={() =>
              router.push(
                buildPressUrl(pathname, {
                  ...data.query,
                  page: Math.min(
                    data.pagination.totalPages,
                    data.pagination.page + 1
                  ),
                })
              )
            }
          />
        </>
      )}

      <div className="sr-only">
        <Link href="/admin/press/new">כתבה חדשה</Link>
      </div>
    </AdminListShell>
  );
}
