"use client";

import Image from "next/image";

import { Dialog } from "@/components/ui/dialog";
import {
  formatDimensions,
  formatFileSize,
  formatMediaDate,
} from "@/lib/media/format";
import type { MediaListItem } from "@/lib/media/media-types";

type MediaPreviewDialogProps = {
  item: MediaListItem | null;
  open: boolean;
  onClose: () => void;
};

export function MediaPreviewDialog({
  item,
  open,
  onClose,
}: MediaPreviewDialogProps) {
  if (!item) {
    return null;
  }

  const displayName = item.original_file_name ?? item.file_name;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="תצוגה מקדימה"
      description={displayName}
      panelClassName="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="relative mx-auto aspect-[4/3] max-h-[50dvh] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]">
          {item.publicUrl ? (
            <Image
              src={item.publicUrl}
              alt={item.alt_text ?? displayName}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              לא ניתן להציג תצוגה מקדימה
            </div>
          )}
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-text-muted)]">שם קובץ</dt>
            <dd className="break-all font-medium">{displayName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">כתובת ציבורית</dt>
            <dd className="break-all">{item.publicUrl ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">מידות</dt>
            <dd>{formatDimensions(item.width, item.height)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">גודל מותאם</dt>
            <dd>{formatFileSize(item.size_bytes)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">סוג קובץ</dt>
            <dd>{item.mime_type}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">תאריך העלאה</dt>
            <dd>{formatMediaDate(item.created_at)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--color-text-muted)]">טקסט חלופי</dt>
            <dd>{item.alt_text ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </Dialog>
  );
}
