"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";

import { MediaPreviewRender } from "@/components/media/media-preview-render";
import { searchMediaPickerAction } from "@/actions/media";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaListItem } from "@/lib/media/media-types";
import type { MediaMimeFilter } from "@/lib/validations/media";
import { cn } from "@/lib/utils/cn";

type SelectedMedia = {
  id: string;
  url: string;
  alt: string;
  mimeType?: string;
  sizeBytes?: number;
};

type ServiceMediaPickerProps = {
  fieldId?: string;
  label: string;
  description?: string;
  value: string | null;
  preview?: SelectedMedia | null;
  required?: boolean;
  error?: string;
  variant?: "default" | "minimal";
  /** Filter library results. Defaults to all (existing behavior). */
  mimeFilter?: MediaMimeFilter;
  emptyTitle?: string;
  emptyDescription?: string;
  selectLabel?: string;
  replaceLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  onChange: (mediaId: string | null, preview: SelectedMedia | null) => void;
};

export function ServiceMediaPicker({
  fieldId = "field-cover-media",
  label,
  description,
  value,
  preview,
  required = false,
  error,
  variant = "default",
  mimeFilter = "all",
  emptyTitle = "בחרו תמונת כיסוי",
  emptyDescription = "בחרו מספריית המדיה או העלו תמונה חדשה",
  selectLabel = "בחירת תמונה",
  replaceLabel = "החלפת תמונה",
  dialogTitle = "בחירת תמונה מספריית המדיה",
  dialogDescription = "בחרו תמונה קיימת מהספרייה",
  onChange,
}: ServiceMediaPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [isLoading, startLoading] = useTransition();
  const isPdfMode = mimeFilter === "pdf";
  const EmptyIcon = isPdfMode ? FileText : ImageIcon;

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startLoading(async () => {
        setLoadError("");
        const result = await searchMediaPickerAction(
          searchValue,
          1,
          mimeFilter
        );

        if (!result.success) {
          setLoadError(result.error ?? "לא ניתן לטעון קבצים.");
          setItems([]);
          return;
        }

        setItems(result.items);
        setTotalPages(result.totalPages);
        setPage(1);
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue, pickerOpen, mimeFilter]);

  const loadItems = (query: string, nextPage: number) => {
    startLoading(async () => {
      setLoadError("");
      const result = await searchMediaPickerAction(query, nextPage, mimeFilter);

      if (!result.success) {
        setLoadError(result.error ?? "לא ניתן לטעון קבצים.");
        setItems([]);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setPage(nextPage);
    });
  };

  const handleSelect = (item: MediaListItem) => {
    onChange(item.id, {
      id: item.id,
      url: item.publicUrl ?? "",
      alt: item.alt_text ?? item.original_file_name ?? item.file_name,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
    });
    setPickerOpen(false);
  };

  return (
    <div
      id={fieldId}
      className={cn("space-y-4", error && "rounded-[var(--radius-lg)] ring-1 ring-[var(--color-error)]/30 p-4")}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {label}
          {required ? <span className="text-[var(--color-soft-accent)]"> *</span> : null}
        </p>
        {description ? (
          <p className="text-caption text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      <div className={cn(variant === "minimal" && "space-y-4")}>
        {preview?.url ? (
          <div className="space-y-4">
            <div className="relative aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]">
              <MediaPreviewRender
                url={preview.url}
                alt={preview.alt}
                mimeType={preview.mimeType ?? (isPdfMode ? "application/pdf" : "image/webp")}
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPickerOpen(true)}
              >
                {replaceLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(null, null)}
              >
                <X aria-hidden="true" className="size-4" />
                הסרה
              </Button>
            </div>
          </div>
        ) : (
          <div className="admin-interactive group flex w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-14 text-center hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-soft)]/50">
            <div className="flex size-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary)]/8 text-[var(--color-primary)] transition-transform group-hover:scale-105">
              <EmptyIcon aria-hidden="true" className="size-6" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {emptyTitle}
              </p>
              <p className="text-caption text-[var(--color-text-muted)]">
                {emptyDescription}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button type="button" onClick={() => setPickerOpen(true)}>
                <EmptyIcon aria-hidden="true" className="size-4" />
                {selectLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadOpen(true)}
              >
                <Upload aria-hidden="true" className="size-4" />
                העלאה
              </Button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-caption text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <Dialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={dialogTitle}
        description={dialogDescription}
        className="p-3 sm:p-6"
        panelClassName="max-h-[min(90dvh,760px)] w-[min(960px,calc(100vw-32px))]"
      >
        <div className="space-y-4">
          <Input
            value={searchValue}
            placeholder="חיפוש לפי שם קובץ או טקסט חלופי"
            onChange={(event) => setSearchValue(event.target.value)}
          />

          {loadError ? (
            <p role="alert" className="text-sm text-[var(--color-error)]">
              {loadError}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "admin-interactive overflow-hidden rounded-[var(--radius-md)] text-start hover:shadow-[var(--shadow-sm)]",
                  value === item.id
                    ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                    : "ring-1 ring-[var(--color-border)]"
                )}
                onClick={() => handleSelect(item)}
              >
                <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)]">
                  <MediaPreviewRender
                    url={item.publicUrl}
                    alt={item.alt_text ?? item.file_name}
                    mimeType={item.mime_type}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <p className="truncate px-3 py-2.5 text-sm">
                  {item.original_file_name ?? item.file_name}
                </p>
              </button>
            ))}
          </div>

          {items.length === 0 && !isLoading ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              {isPdfMode ? "לא נמצאו קבצי PDF." : "לא נמצאו תמונות."}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => loadItems(searchValue, page - 1)}
            >
              הקודם
            </Button>
            <p className="text-caption text-[var(--color-text-muted)]">
              עמוד {page} מתוך {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => loadItems(searchValue, page + 1)}
            >
              הבא
            </Button>
          </div>
        </div>
      </Dialog>

      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          loadItems(searchValue, 1);
        }}
      />
    </div>
  );
}
