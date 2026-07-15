"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircleHeart, Plus, RefreshCw } from "lucide-react";

import {
  AdminListFilters,
  AdminListPagination,
  AdminListShell,
  AdminListToolbar,
} from "@/components/admin/admin-list-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TestimonialsListData } from "@/lib/testimonials/types";
import {
  TESTIMONIAL_SORT_VALUES,
  TESTIMONIAL_STATUS_FILTERS,
} from "@/lib/validations/testimonial";

type TestimonialsListClientProps = {
  data: TestimonialsListData;
};

const STATUS_FILTER_LABELS: Record<
  (typeof TESTIMONIAL_STATUS_FILTERS)[number],
  string
> = {
  all: "הכל",
  published: "מפורסם",
  draft: "טיוטה",
};

const SORT_LABELS: Record<(typeof TESTIMONIAL_SORT_VALUES)[number], string> = {
  newest: "החדשות ביותר",
  oldest: "הישנות ביותר",
  name: "שם לקוח",
};

function buildTestimonialsUrl(
  pathname: string,
  params: TestimonialsListData["query"]
): string {
  const search = new URLSearchParams();

  if (params.q.length > 0) {
    search.set("q", params.q);
  }

  if (params.status !== "all") {
    search.set("status", params.status);
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

export function TestimonialsListClient({ data }: TestimonialsListClientProps) {
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
        buildTestimonialsUrl(pathname, {
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
    data.query.q.length > 0 || data.query.status !== "all";
  const publishedCount = data.items.filter((item) => item.is_published).length;
  const draftCount = data.items.filter((item) => !item.is_published).length;
  const featuredCount = data.items.filter((item) => item.featured).length;

  return (
    <AdminListShell>
      <AdminPageHeader
        module="testimonials"
        title="המלצות"
        description="ניהול המלצות שמוצגות באתר."
        action={{
          label: "המלצה חדשה",
          href: "/admin/testimonials/new",
          icon: <Plus aria-hidden="true" className="size-4" />,
        }}
      />

      <AdminStatCards
        stats={[
          {
            icon: MessageCircleHeart,
            label: "המלצות",
            value: data.pagination.totalCount,
            module: "testimonials",
            emoji: "💬",
          },
          {
            icon: MessageCircleHeart,
            label: "מפורסמות",
            value: publishedCount,
            module: "testimonials",
            emoji: "✨",
          },
          {
            icon: MessageCircleHeart,
            label: "טיוטות",
            value: draftCount,
            module: "testimonials",
            emoji: "📝",
          },
          {
            icon: MessageCircleHeart,
            label: "מודגשות",
            value: featuredCount,
            module: "testimonials",
            emoji: "⭐",
          },
        ]}
      />

      <AdminListFilters className="lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="testimonials-search"
            className="text-caption font-medium text-[var(--color-text-muted)]"
          >
            חיפוש
          </label>
          <Input
            id="testimonials-search"
            type="search"
            value={searchValue}
            placeholder="חיפוש לפי שם לקוח"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <Select
          label="סטטוס"
          value={data.query.status}
          onChange={(event) =>
            router.push(
              buildTestimonialsUrl(pathname, {
                ...data.query,
                status:
                  event.target.value as TestimonialsListData["query"]["status"],
                page: 1,
              })
            )
          }
        >
          {TESTIMONIAL_STATUS_FILTERS.map((value) => (
            <option key={value} value={value}>
              {STATUS_FILTER_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          label="מיון"
          value={data.query.sort}
          onChange={(event) =>
            router.push(
              buildTestimonialsUrl(pathname, {
                ...data.query,
                sort: event.target.value as TestimonialsListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {TESTIMONIAL_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${data.pagination.totalCount} המלצות`}>
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
          module="testimonials"
          icon={MessageCircleHeart}
          emoji="💬"
          title={hasFilters ? "לא נמצאו תוצאות" : "עדיין אין המלצות"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים."
              : "המלצות מלקוחות מחזקות את האמון באתר ומופיעות בדף הבית."
          }
          action={
            !hasFilters ? (
              <Link
                href="/admin/testimonials/new"
                className="admin-btn-primary inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
              >
                <Plus aria-hidden="true" className="size-4" />
                יצירת המלצה ראשונה
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {data.pagination.totalPages > 1 ? (
        <AdminListPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildTestimonialsUrl(pathname, {
                ...data.query,
                page: data.pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildTestimonialsUrl(pathname, {
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
