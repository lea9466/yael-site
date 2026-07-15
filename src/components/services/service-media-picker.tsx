"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";

import { searchMediaPickerAction } from "@/actions/media";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaListItem } from "@/lib/media/media-types";
import { cn } from "@/lib/utils/cn";

type SelectedMedia = {
  id: string;
  url: string;
  alt: string;
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

  const loadItems = (query: string, nextPage: number) => {
    startLoading(async () => {
      setLoadError("");
      const result = await searchMediaPickerAction(query, nextPage);

      if (!result.success) {
        setLoadError(result.error ?? "לא ניתן לטעון תמונות.");
        setItems([]);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setPage(nextPage);
    });
  };

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      loadItems(searchValue, 1);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue, pickerOpen]);

  const handleSelect = (item: MediaListItem) => {
    onChange(item.id, {
      id: item.id,
      url: item.publicUrl ?? "",
      alt: item.alt_text ?? item.original_file_name ?? item.file_name,
    });
    setPickerOpen(false);
  };

  return (
    <div
      id={fieldId}
      className={cn(
        "space-y-3",
        error &&
          "rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-soft)]/35 p-3"
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {label}
          {required ? <span className="text-[var(--color-error)]"> *</span> : null}
        </p>
        {description ? (
          <p className="text-caption text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          variant === "default" &&
            "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 p-4",
          variant === "minimal" && "space-y-4"
        )}
      >
        {preview?.url ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative size-36 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface)]">
              <Image
                src={preview.url}
                alt={preview.alt}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPickerOpen(true)}
              >
                החלפת תמונה
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <ImageIcon aria-hidden="true" className="size-8" />
              <p className="text-sm">לא נבחרה תמונה</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setPickerOpen(true)}>
                בחירת תמונה
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(true)}
              >
                <Upload aria-hidden="true" className="size-4" />
                העלאת תמונה
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
        title="בחירת תמונה מספריית המדיה"
        description="בחרו תמונה קיימת מהספרייה"
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
                  "overflow-hidden rounded-[var(--radius-md)] border text-start transition-shadow hover:shadow-[var(--shadow-sm)]",
                  value === item.id
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-border)]"
                )}
                onClick={() => handleSelect(item)}
              >
                <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)]">
                  {item.publicUrl ? (
                    <Image
                      src={item.publicUrl}
                      alt={item.alt_text ?? item.file_name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="truncate px-3 py-2 text-sm">
                  {item.original_file_name ?? item.file_name}
                </p>
              </button>
            ))}
          </div>

          {items.length === 0 && !isLoading ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              לא נמצאו תמונות.
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
