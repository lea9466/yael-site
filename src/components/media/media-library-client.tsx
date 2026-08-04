"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ImagePlus, RefreshCw, Search, Upload } from "lucide-react";

import { MediaBulkActionBar } from "@/components/media/media-bulk-action-bar";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminBreadcrumbsRow } from "@/components/admin/admin-breadcrumbs-row";
import { MediaBulkDeleteDialog } from "@/components/media/media-bulk-delete-dialog";
import { MediaDeleteDialog } from "@/components/media/media-delete-dialog";
import { MediaEditAltDialog } from "@/components/media/media-edit-alt-dialog";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaPreviewDialog } from "@/components/media/media-preview-dialog";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { formatFileSize } from "@/lib/media/format";
import type {
  BulkDeleteMediaResult,
  MediaLibraryData,
  MediaListItem,
} from "@/lib/media/media-types";
import type { MediaSortValue } from "@/lib/validations/media";
import { cn } from "@/lib/utils/cn";

type MediaLibraryClientProps = {
  data: MediaLibraryData;
};

const SORT_OPTIONS: { value: MediaSortValue; label: string }[] = [
  { value: "newest", label: "החדשות ביותר" },
  { value: "oldest", label: "הישנות ביותר" },
  { value: "filename", label: "שם קובץ" },
  { value: "size", label: "גודל קובץ" },
];

function buildMediaUrl(
  pathname: string,
  params: {
    q?: string;
    sort?: MediaSortValue;
    page?: number;
  }
): string {
  const search = new URLSearchParams();

  if (params.q && params.q.length > 0) {
    search.set("q", params.q);
  }

  if (params.sort && params.sort !== "newest") {
    search.set("sort", params.sort);
  }

  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function MediaLibraryClient({ data }: MediaLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();

  const [searchValue, setSearchValue] = useState(data.query.q);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaListItem | null>(null);
  const [editItem, setEditItem] = useState<MediaListItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaListItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectionQueryKey, setSelectionQueryKey] = useState(
    () => `${data.query.q}|${data.query.sort}|${data.query.page}`
  );

  const currentQueryKey = `${data.query.q}|${data.query.sort}|${data.query.page}`;
  const effectiveSelectedIds = useMemo(() => {
    if (selectionQueryKey !== currentQueryKey) {
      return new Set<string>();
    }

    return selectedIds;
  }, [selectionQueryKey, currentQueryKey, selectedIds]);

  const visibleIds = useMemo(
    () => data.items.map((item) => item.id),
    [data.items]
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => effectiveSelectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) =>
    effectiveSelectedIds.has(id)
  );

  const selectedItems = useMemo(
    () => data.items.filter((item) => effectiveSelectedIds.has(item.id)),
    [data.items, effectiveSelectedIds]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchValue.trim();

      if (trimmed === data.query.q) {
        return;
      }

      router.push(
        buildMediaUrl(pathname, {
          q: trimmed,
          sort: data.query.sort,
          page: 1,
        })
      );
      setSelectedIds(new Set());
      setSelectionQueryKey(`${trimmed}|${data.query.sort}|1`);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue, data.query.q, data.query.sort, pathname, router]);

  const handleRefresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  const handleSortChange = (sort: MediaSortValue) => {
    setSelectedIds(new Set());
    setSelectionQueryKey(`${data.query.q}|${sort}|1`);
    router.push(
      buildMediaUrl(pathname, {
        q: data.query.q,
        sort,
        page: 1,
      })
    );
  };

  const handlePageChange = (page: number) => {
    setSelectedIds(new Set());
    setSelectionQueryKey(`${data.query.q}|${data.query.sort}|${page}`);
    router.push(
      buildMediaUrl(pathname, {
        q: data.query.q,
        sort: data.query.sort,
        page,
      })
    );
  };

  const handleMutationSuccess = () => {
    router.refresh();
  };

  const handleToggleSelect = (item: MediaListItem) => {
    setSelectionQueryKey(currentQueryKey);
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }

      return next;
    });
  };

  const handleToggleSelectAllVisible = () => {
    setSelectionQueryKey(currentQueryKey);
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }

      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectionQueryKey(currentQueryKey);
  };

  const handleBulkDeleteSuccess = (result: BulkDeleteMediaResult) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      result.deleted.forEach((entry) => next.delete(entry.id));
      return next;
    });
    setSelectionQueryKey(currentQueryKey);

    if (result.deleted.length > 0) {
      router.refresh();
    }
  };

  const isEmptyLibrary =
    data.stats.totalCount === 0 && data.query.q.length === 0;
  const hasNoSearchResults =
    data.pagination.totalCount === 0 && data.query.q.length > 0;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
      <section className="admin-page-header space-y-0">
        <AdminBreadcrumbsRow>
          <Breadcrumbs />
        </AdminBreadcrumbsRow>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="admin-page-title-block min-w-0">
            <h1 className="text-page-title">ספריית מדיה</h1>
            <p className="text-muted">ניהול התמונות המשמשות באתר</p>
          </div>

          <Button
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setUploadOpen(true)}
          >
            <Upload aria-hidden="true" className="size-4" />
            העלאת תמונה
          </Button>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-caption text-[var(--color-text-muted)]">סה״כ פריטים</p>
            <p className="text-lg font-semibold">{data.stats.totalCount}</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-caption text-[var(--color-text-muted)]">
              נפח אחסון מותאם
            </p>
            <p className="text-lg font-semibold">
              {formatFileSize(data.stats.totalSizeBytes)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="media-search" className="sr-only">
              חיפוש בספריית המדיה
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-auto end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              id="media-search"
              type="search"
              value={searchValue}
              placeholder="חיפוש לפי שם קובץ או טקסט חלופי"
              className={cn(
                "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] ps-4 pe-10 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
              )}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              label="מיון"
              value={data.query.sort}
              className="min-w-44"
              onChange={(event) =>
                handleSortChange(event.target.value as MediaSortValue)
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Button
              variant="outline"
              loading={isRefreshing}
              loadingText="מרענן..."
              onClick={handleRefresh}
              className="w-full sm:w-auto"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              רענון
            </Button>
          </div>
        </div>

        {isEmptyLibrary ? (
          <EmptyState
            title="עדיין לא הועלו תמונות לספריית המדיה"
            description="העלי תמונה ראשונה כדי להתחיל לנהל את נכסי האתר."
            className="items-center text-center"
          />
        ) : null}

        {!isEmptyLibrary && hasNoSearchResults ? (
          <EmptyState
            title="לא נמצאו תוצאות"
            description="נסו חיפוש אחר לפי שם קובץ או טקסט חלופי."
          />
        ) : null}

        <MediaBulkActionBar
          selectedCount={effectiveSelectedIds.size}
          onClearSelection={handleClearSelection}
          onDeleteSelected={() => setBulkDeleteOpen(true)}
        />

        {!isEmptyLibrary && !hasNoSearchResults ? (
          <>
            <MediaGrid
              items={data.items}
              selectedIds={effectiveSelectedIds}
              allVisibleSelected={allVisibleSelected}
              someVisibleSelected={someVisibleSelected}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAllVisible={handleToggleSelectAllVisible}
              onPreview={setPreviewItem}
              onEditAlt={setEditItem}
              onDelete={setDeleteItem}
            />

            {data.pagination.totalPages > 1 ? (
              <nav
                aria-label="עימוד ספריית מדיה"
                className="flex flex-col items-center justify-between gap-3 sm:flex-row"
              >
                <p className="text-sm text-[var(--color-text-muted)]">
                  עמוד {data.pagination.page} מתוך {data.pagination.totalPages}
                  {" · "}
                  {data.pagination.totalCount} תוצאות
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                  >
                    הקודם
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      data.pagination.page >= data.pagination.totalPages
                    }
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                  >
                    הבא
                  </Button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}

        {isEmptyLibrary ? (
          <div className="flex justify-center">
            <Button onClick={() => setUploadOpen(true)}>
              <ImagePlus aria-hidden="true" className="size-4" />
              העלי תמונה ראשונה
            </Button>
          </div>
        ) : null}
      </section>

      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <MediaPreviewDialog
        item={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />

      <MediaEditAltDialog
        item={editItem}
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        onSuccess={handleMutationSuccess}
      />

      <MediaDeleteDialog
        item={deleteItem}
        open={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onSuccess={handleMutationSuccess}
      />

      <MediaBulkDeleteDialog
        items={selectedItems}
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onSuccess={handleBulkDeleteSuccess}
      />
    </div>
  );
}
