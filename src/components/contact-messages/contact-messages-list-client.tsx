"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, RefreshCw } from "lucide-react";

import {
  AdminListFilters,
  AdminListPagination,
  AdminListShell,
  AdminListToolbar,
} from "@/components/admin/admin-list-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { ContactMessageCard } from "@/components/contact-messages/contact-message-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CONTACT_MESSAGES_PAGE_SIZE } from "@/lib/contact-messages/constants";
import { resolveContactMessageStatus } from "@/lib/contact-messages/status";
import {
  getStoredContactMessageStatus,
  readStoredContactMessageStatusMap,
} from "@/lib/contact-messages/status-storage";
import type { ContactMessagesListData } from "@/lib/contact-messages/types";
import {
  CONTACT_MESSAGE_SORT_VALUES,
  CONTACT_MESSAGE_STATUS_FILTERS,
} from "@/lib/validations/contact-message";

type ContactMessagesListClientProps = {
  data: ContactMessagesListData;
};

const STATUS_FILTER_LABELS: Record<
  (typeof CONTACT_MESSAGE_STATUS_FILTERS)[number],
  string
> = {
  all: "הכל",
  new: "חדש",
  in_progress: "בטיפול",
  handled: "טופל",
};

const SORT_LABELS: Record<
  (typeof CONTACT_MESSAGE_SORT_VALUES)[number],
  string
> = {
  newest: "החדשות ביותר",
  oldest: "הישנות ביותר",
};

function buildContactMessagesUrl(
  pathname: string,
  params: ContactMessagesListData["query"]
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

function mergeItemsWithStoredStatus(
  data: ContactMessagesListData
): ContactMessagesListData["items"] {
  const storedMap = readStoredContactMessageStatusMap();

  return data.items.map((item) => ({
    ...item,
    status: resolveContactMessageStatus(
      item.is_read,
      storedMap[item.id] ?? getStoredContactMessageStatus(item.id)
    ),
  }));
}

export function ContactMessagesListClient({
  data,
}: ContactMessagesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query.q);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ContactMessagesListData["items"][number]["status"]>
  >({});

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();

      if (trimmed === data.query.q) {
        return;
      }

      router.push(
        buildContactMessagesUrl(pathname, {
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

  const mergedItems = useMemo(() => {
    const items = mergeItemsWithStoredStatus(data).map((item) => ({
      ...item,
      status: statusOverrides[item.id] ?? item.status,
    }));

    if (data.query.status === "all" || data.query.status === "handled") {
      return items;
    }

    const filtered = items.filter((item) => item.status === data.query.status);
    const totalCount = filtered.length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalCount / CONTACT_MESSAGES_PAGE_SIZE)
    );
    const page = Math.min(data.query.page, totalPages);
    const from = (page - 1) * CONTACT_MESSAGES_PAGE_SIZE;

    return filtered.slice(from, from + CONTACT_MESSAGES_PAGE_SIZE);
  }, [data, statusOverrides]);

  const pagination = useMemo(() => {
    if (data.query.status === "new" || data.query.status === "in_progress") {
      const allMerged = mergeItemsWithStoredStatus(data).map((item) => ({
        ...item,
        status: statusOverrides[item.id] ?? item.status,
      }));
      const filtered = allMerged.filter(
        (item) => item.status === data.query.status
      );
      const totalCount = filtered.length;
      const totalPages = Math.max(
        1,
        Math.ceil(totalCount / CONTACT_MESSAGES_PAGE_SIZE)
      );
      const page = Math.min(data.query.page, totalPages);

      return {
        page,
        totalPages,
        totalCount,
      };
    }

    return data.pagination;
  }, [data, statusOverrides]);

  const hasFilters =
    data.query.q.length > 0 || data.query.status !== "all";
  const displayCount = pagination.totalCount;

  return (
    <AdminListShell>
      <AdminPageHeader
        module="contact-messages"
        title="פניות"
        description="ניהול הפניות שהתקבלו מהאתר."
      />

      <AdminListFilters className="lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="contact-messages-search"
            className="text-caption font-medium text-[var(--color-text-muted)]"
          >
            חיפוש
          </label>
          <Input
            id="contact-messages-search"
            type="search"
            value={searchValue}
            placeholder="חיפוש לפי שם, אימייל, טלפון או הודעה"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <Select
          label="סטטוס"
          value={data.query.status}
          onChange={(event) =>
            router.push(
              buildContactMessagesUrl(pathname, {
                ...data.query,
                status:
                  event.target.value as ContactMessagesListData["query"]["status"],
                page: 1,
              })
            )
          }
        >
          {CONTACT_MESSAGE_STATUS_FILTERS.map((value) => (
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
              buildContactMessagesUrl(pathname, {
                ...data.query,
                sort: event.target.value as ContactMessagesListData["query"]["sort"],
                page: 1,
              })
            )
          }
        >
          {CONTACT_MESSAGE_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </AdminListFilters>

      <AdminListToolbar countLabel={`${displayCount} פניות`}>
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

      {mergedItems.length === 0 ? (
        <AdminEmptyState
          module="contact-messages"
          icon={Inbox}
          emoji="📬"
          title={hasFilters ? "לא נמצאו תוצאות" : "אין פניות חדשות"}
          description={
            hasFilters
              ? "נסי לשנות את החיפוש או המסננים."
              : "כאשר גולשים ישלחו טופס יצירת קשר, הפניות יופיעו כאן."
          }
          action={
            !hasFilters ? (
              <Button
                variant="outline"
                loading={isRefreshing}
                onClick={() => startRefresh(() => router.refresh())}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                רענון
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mergedItems.map((item) => (
            <ContactMessageCard
              key={item.id}
              item={item}
              onStatusChange={(id, status) => {
                setStatusOverrides((current) => ({
                  ...current,
                  [id]: status,
                }));
              }}
              onDelete={(id) => {
                setStatusOverrides((current) => {
                  const next = { ...current };
                  delete next[id];
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 ? (
        <AdminListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPrevious={() =>
            router.push(
              buildContactMessagesUrl(pathname, {
                ...data.query,
                page: pagination.page - 1,
              })
            )
          }
          onNext={() =>
            router.push(
              buildContactMessagesUrl(pathname, {
                ...data.query,
                page: pagination.page + 1,
              })
            )
          }
        />
      ) : null}
    </AdminListShell>
  );
}
