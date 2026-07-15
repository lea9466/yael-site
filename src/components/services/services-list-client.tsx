"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, HeartHandshake, Plus, RefreshCw, Star } from "lucide-react";

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
import { ServiceRow } from "@/components/services/service-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ServicesListData } from "@/lib/services/types";
import {
  SERVICE_FEATURED_FILTERS,
  SERVICE_SORT_VALUES,
  SERVICE_STATUS_FILTERS,
} from "@/lib/validations/service";

type ServicesListClientProps = {
  data: ServicesListData;
};

const STATUS_FILTER_LABELS: Record<(typeof SERVICE_STATUS_FILTERS)[number], string> = {
  all: "הכל",
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

const FEATURED_FILTER_LABELS: Record<
  (typeof SERVICE_FEATURED_FILTERS)[number],
  string
> = {
  all: "הכל",
  featured: "מומלצים",
};

const SORT_LABELS: Record<(typeof SERVICE_SORT_VALUES)[number], string> = {
  newest: "החדשים ביותר",
  oldest: "הישנים ביותר",
  title: "כותרת",
  updated: "עדכון אחרון",
};

function buildServicesUrl(
  pathname: string,
  params: ServicesListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) {
    search.set("q", params.q);
  }

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.featured !== "all") {
    search.set("featured", params.featured);
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

export function ServicesListClient({ data }: ServicesListClientProps) {
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
        buildServicesUrl(pathname, {
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

  const hasFilters =
    data.query.q.length > 0 ||
    data.query.status !== "all" ||
    data.query.featured !== "all";

  return (
    <AdminListShell>
      <AdminPageHeader
        module="services"
        title="שירותים"
        description="נהלי את השירותים שמציגים את הגישה של יעל — רגוע, מקצועי ומלא אמון."
        action={{
          label: "שירות חדש",
          href: "/admin/services/new",
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: HeartHandshake,
            label: "שירותים",
            value: data.pagination.totalCount,
            module: "services",
            emoji: "🌿",
          },
          {
            icon: CheckCircle2,
            label: "מפורסמים",
            value: data.items.filter((item) => item.status === "published").length,
            module: "services",
            emoji: "✅",
          },
          {
            icon: Star,
            label: "מומלצים",
            value: data.items.filter((item) => item.featured).length,
            module: "services",
            emoji: "⭐",
          },
          {
            icon: HeartHandshake,
            label: "טיוטות",
            value: data.items.filter((item) => item.status === "draft").length,
            module: "services",
            emoji: "📝",
          },
        ]}
      />

      <AdminListFilters className="lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="services-search" className="text-caption font-medium text-[var(--color-text-muted)]">
            חיפוש
          </label>
          <Input
            id="services-search"
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
              buildServicesUrl(pathname, {
                ...data.query,
                status: event.target.value as ServicesListData["query"]["status"],
                page: 1,
              })
            )
          }
        >
          {SERVICE_STATUS_FILTERS.map((value) => (
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
              buildServicesUrl(pathname, {
                ...data.query,
                featured: event.target.value as ServicesListData["query"]["featured"],
                page: 1,
              })
            )
          }
        >
          {SERVICE_FEATURED_FILTERS.map((value) => (
            <option key={value} value={value}>
              {FEATURED_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="מיון"
          value={data.query.sort}
          onChange={(event) =>
            router.push(
              buildServicesUrl(pathname, {
                ...data.query,
                sort: event.target.value as ServicesListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {SERVICE_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} שירותים`}>
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
          module="services"
          icon={HeartHandshake}
          emoji="🌿"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין שירותים"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים."
              : "בואי ניצור את השירות הראשון — שמספר את הסיפור שלך בצורה יפה ומרגיעה."
          }
          action={
            !hasFilters ? (
              <Link
                href="/admin/services/new"
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                שירות חדש
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminListItems>
          {data.items.map((item) => (
            <ServiceRow key={item.id} item={item} />
          ))}
        </AdminListItems>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildServicesUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildServicesUrl(pathname, {
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
