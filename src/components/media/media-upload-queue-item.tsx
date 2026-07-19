"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { MediaPreviewRender } from "@/components/media/media-preview-render";
import { UploadProfileSelector } from "@/components/media/upload-profile-selector";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  getUploadQueueAdminStatus,
  getUploadQueueStatusLabel,
} from "@/lib/admin/status-system";
import { formatFileSize } from "@/lib/media/format";
import { isVideoMimeType } from "@/lib/media/mime";
import {
  HERO_IMAGE_WARNING,
  MIN_HERO_SOURCE_WIDTH,
} from "@/lib/media/upload-profiles";
import { type UploadQueueItem } from "@/lib/media/upload-queue";
import type { UploadProfile } from "@/lib/media/constants";
import { cn } from "@/lib/utils/cn";

type MediaUploadQueueItemProps = {
  item: UploadQueueItem;
  disabled: boolean;
  onAltTextChange: (id: string, altText: string) => void;
  onUploadProfileChange: (id: string, uploadProfile: UploadProfile) => void;
  onRemove: (id: string) => void;
};

export function MediaUploadQueueItem({
  item,
  disabled,
  onAltTextChange,
  onUploadProfileChange,
  onRemove,
}: MediaUploadQueueItemProps) {
  const isLocked =
    disabled || item.status === "uploading" || item.status === "completed";
  const canRemove = !isLocked;
  const isFailed = item.status === "failed";
  const canRetryHint = isFailed && item.uploadAttempted === true;
  const isVideo = isVideoMimeType(item.file.type);

  const [sourceWidth, setSourceWidth] = useState<number | null>(null);

  const showHeroWidthWarning =
    item.uploadProfile === "hero" &&
    !isVideo &&
    sourceWidth !== null &&
    sourceWidth < MIN_HERO_SOURCE_WIDTH;

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
          {!isVideo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.previewUrl}
              alt=""
              aria-hidden="true"
              className="sr-only"
              onLoad={(event) => {
                setSourceWidth(event.currentTarget.naturalWidth);
              }}
            />
          ) : null}
          <MediaPreviewRender
            url={item.previewUrl}
            alt={item.altText || item.file.name}
            mimeType={item.file.type}
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

          <UploadProfileSelector
            name={`upload-profile-${item.id}`}
            value={item.uploadProfile}
            disabled={isLocked}
            onChange={(profile) => {
              onUploadProfileChange(item.id, profile);
            }}
          />

          {showHeroWidthWarning ? (
            <p
              role="note"
              aria-live="polite"
              className="rounded-[var(--radius-sm)] border border-[var(--color-warning)]/35 bg-[var(--color-warning-soft)]/50 px-3 py-2 text-caption text-[var(--color-warning)]"
            >
              {HERO_IMAGE_WARNING}
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
