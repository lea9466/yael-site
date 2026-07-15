"use client";

import { Loader2, X } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  getUploadQueueAdminStatus,
  getUploadQueueStatusLabel,
} from "@/lib/admin/status-system";
import { formatFileSize } from "@/lib/media/format";
import type { UploadQueueItem } from "@/lib/media/upload-queue";
import { cn } from "@/lib/utils/cn";

type MediaUploadQueueItemProps = {
  item: UploadQueueItem;
  disabled: boolean;
  onAltTextChange: (id: string, altText: string) => void;
  onRemove: (id: string) => void;
};

export function MediaUploadQueueItem({
  item,
  disabled,
  onAltTextChange,
  onRemove,
}: MediaUploadQueueItemProps) {
  const isLocked =
    disabled || item.status === "uploading" || item.status === "completed";
  const canRemove = !isLocked;
  const isFailed = item.status === "failed";
  const canRetryHint = isFailed && item.uploadAttempted === true;

  return (
    <li
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5",
        isFailed
          ? "border-[var(--color-error)]/35 bg-[var(--color-error-soft)]/35"
          : "border-[var(--color-border)]"
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] sm:size-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt={item.altText || item.file.name}
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p
                className="truncate text-sm font-medium text-[var(--color-text)]"
                title={item.file.name}
              >
                {item.file.name}
              </p>
              <p className="text-caption text-[var(--color-text-muted)]">
                גודל מקורי: {formatFileSize(item.file.size)}
              </p>
            </div>

            {canRemove ? (
              <IconButton
                label={`הסרת ${item.file.name}`}
                size="sm"
                onClick={() => onRemove(item.id)}
              >
                <X aria-hidden="true" className="size-4" />
              </IconButton>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">סטטוס:</span>
            <StatusBadge
              size="sm"
              status={getUploadQueueAdminStatus(item.status)}
              label={getUploadQueueStatusLabel(item.status)}
              icon={item.status === "uploading" ? Loader2 : undefined}
              iconClassName={
                item.status === "uploading"
                  ? "animate-spin motion-reduce:animate-none"
                  : undefined
              }
            />
          </div>

          {item.error ? (
            <p role="alert" className="text-caption text-[var(--color-error)]">
              {item.error}
            </p>
          ) : null}

          {canRetryHint ? (
            <p className="text-caption text-[var(--color-text-muted)]">
              ניתן לנסות שוב בלחיצה על &quot;העלאת תמונות&quot;.
            </p>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor={`queue-alt-${item.id}`}
              className="block text-caption font-medium"
            >
              טקסט חלופי (אופציונלי)
            </label>
            <Input
              id={`queue-alt-${item.id}`}
              value={item.altText}
              disabled={isLocked}
              maxLength={200}
              placeholder="תיאור קצר לנגישות"
              className="w-full"
              onChange={(event) => onAltTextChange(item.id, event.target.value)}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
