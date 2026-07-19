"use client";

import { useRef, useState } from "react";
import { ImageIcon, ImagePlus, Upload } from "lucide-react";

import { uploadMediaViaApi } from "@/lib/media/upload-client";
import { MediaUploadProgress } from "@/components/media/media-upload-progress";
import { MediaUploadQueueItem } from "@/components/media/media-upload-queue-item";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { MAX_BATCH_UPLOAD_FILES } from "@/lib/media/constants";
import {
  buildBatchSummary,
  COMPLETED_ITEM_REMOVE_DELAY_MS,
  COMPLETED_ITEM_REMOVE_DELAY_REDUCED_MS,
  createUploadQueueItem,
  processUploadBatch,
  revokeQueueItemPreview,
  type BatchProgressStats,
  type UploadQueueItem,
} from "@/lib/media/upload-queue";
import type { UploadMode } from "@/lib/media/constants";
import { cn } from "@/lib/utils/cn";

type MediaUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
const BATCH_LIMIT_MESSAGE = "ניתן להעלות עד 10 קבצים בכל פעם.";

const UPLOAD_DIALOG_PANEL_CLASS =
  "max-h-full max-w-full lg:max-h-[min(820px,100%)] lg:max-w-[min(1100px,100%)]";

function getUploadableCount(queue: UploadQueueItem[]): number {
  return queue.filter(
    (item) =>
      item.status === "pending" ||
      (item.status === "failed" && item.uploadAttempted === true)
  ).length;
}

function getCompletedRemoveDelay(): number {
  if (typeof window === "undefined") {
    return COMPLETED_ITEM_REMOVE_DELAY_MS;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? COMPLETED_ITEM_REMOVE_DELAY_REDUCED_MS
    : COMPLETED_ITEM_REMOVE_DELAY_MS;
}

export function MediaUploadDialog({
  open,
  onClose,
  onSuccess,
}: MediaUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [summaryMessage, setSummaryMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgressStats | null>(
    null
  );

  const uploadableCount = getUploadableCount(queue);
  const hasUploadableItems = uploadableCount > 0;

  const displayProgress: BatchProgressStats | null =
    batchProgress ??
    (uploadableCount > 0
      ? {
          total: uploadableCount,
          processed: 0,
          success: 0,
          failed: 0,
        }
      : null);

  const resetForm = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    queue.forEach(revokeQueueItemPreview);
    setQueue([]);
    setBatchError("");
    setSummaryMessage("");
    setBatchProgress(null);
    setIsDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isUploading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleClearQueue = () => {
    if (isUploading) {
      return;
    }

    queue.forEach(revokeQueueItemPreview);
    setQueue([]);
    setBatchError("");
    setSummaryMessage("");
    setBatchProgress(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addFilesToQueue = (files: File[]) => {
    setBatchError("");
    setSummaryMessage("");
    setBatchProgress(null);

    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_BATCH_UPLOAD_FILES - queue.length;

    if (remainingSlots <= 0 || files.length > remainingSlots) {
      setBatchError(BATCH_LIMIT_MESSAGE);
      return;
    }

    const newItems = files.map(createUploadQueueItem);
    setQueue((current) => [...current, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        revokeQueueItemPreview(target);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const handleUploadModeChange = (id: string, uploadMode: UploadMode) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id ? { ...item, uploadMode } : item
      )
    );
  };

  const handleAltTextChange = (id: string, altText: string) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, altText } : item))
    );
  };

  const updateQueueItem = (
    id: string,
    update: Partial<
      Pick<UploadQueueItem, "status" | "error" | "uploadAttempted">
    >
  ) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item))
    );
  };

  const handleUpload = async () => {
    if (!hasUploadableItems || isUploading) {
      return;
    }

    setBatchError("");
    setSummaryMessage("");
    setIsUploading(true);

    const snapshot = [...queue];
    const uploadable = snapshot.filter(
      (item) =>
        item.status === "pending" ||
        (item.status === "failed" && item.uploadAttempted === true)
    );

    setBatchProgress({
      total: uploadable.length,
      processed: 0,
      success: 0,
      failed: 0,
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { completed: completedCount, failed: failedCount } =
      await processUploadBatch({
        items: snapshot,
        uploadItem: async (item) => {
          const result = await uploadMediaViaApi(
            item.file,
            item.altText,
            item.uploadMode,
            abortController.signal
          );

          if (!result.success) {
            return { success: false, error: result.error };
          }

          return { success: true };
        },
        onItemUpdate: (id, update) => {
          updateQueueItem(id, update);

          if (update.status === "completed") {
            window.setTimeout(() => {
              handleRemoveItem(id);
            }, getCompletedRemoveDelay());
          }
        },
        onProgress: setBatchProgress,
      });

    setBatchProgress({
      total: uploadable.length,
      processed: uploadable.length,
      success: completedCount,
      failed: failedCount,
    });

    setSummaryMessage(buildBatchSummary(completedCount, failedCount));

    if (completedCount > 0) {
      onSuccess();
    }

    abortControllerRef.current = null;
    setIsUploading(false);
  };

  const progressSlot = (
    <div className="space-y-4">
      {batchError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
        >
          {batchError}
        </p>
      ) : null}

      {summaryMessage ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-[var(--radius-md)] bg-[var(--color-info-soft)] px-4 py-3 text-sm text-[var(--color-info)]"
        >
          {summaryMessage}
        </p>
      ) : null}

      <MediaUploadProgress
        progress={displayProgress}
        isUploading={isUploading}
      />
    </div>
  );

  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          variant="outline"
          disabled={isUploading}
          className="w-full sm:w-auto"
          onClick={handleClose}
        >
          ביטול
        </Button>
        {queue.length > 0 ? (
          <Button
            variant="outline"
            disabled={isUploading}
            className="w-full sm:w-auto"
            onClick={handleClearQueue}
          >
            ניקוי התור
          </Button>
        ) : null}
      </div>

      <Button
        loading={isUploading}
        loadingText="מעלה..."
        disabled={!hasUploadableItems || isUploading}
        className="w-full sm:w-auto"
        onClick={() => {
          void handleUpload();
        }}
      >
        <Upload aria-hidden="true" className="size-4" />
        העלאת תמונות
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="העלאת תמונות"
      description="ניתן לבחור עד 10 תמונות בכל העלאה"
      className="p-2 sm:p-5 lg:p-8"
      panelClassName={UPLOAD_DIALOG_PANEL_CLASS}
      progressSlot={progressSlot}
      footer={footer}
      disableEscapeClose={isUploading}
      bodyClassName="py-5 sm:py-6"
    >
      <div className="grid min-h-0 gap-6 lg:grid-cols-2 lg:gap-8">
        <section
          aria-labelledby="upload-dropzone-title"
          className="flex min-h-0 flex-col"
        >
          <div className="mb-4 space-y-1">
            <h3 id="upload-dropzone-title" className="text-sm font-medium">
              בחירת קבצים
            </h3>
            <p className="text-caption text-[var(--color-text-muted)]">
              גררו תמונות או בחרו מהמחשב
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="אזור גרירה להעלאת תמונות. לחצו Enter או בחרו קבצים."
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);

              const files = Array.from(event.dataTransfer.files);
              addFilesToQueue(files);
            }}
            className={cn(
              "flex min-h-[min(320px,40dvh)] flex-1 cursor-pointer flex-col items-center justify-center gap-5 rounded-[var(--radius-xl)] border-2 border-dashed px-6 py-10 text-center transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30",
              isDragActive
                ? "border-[var(--color-primary)] bg-[var(--color-surface-soft)]"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface-soft)]/60",
              isUploading && "pointer-events-none opacity-70"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex size-16 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
              <ImagePlus
                aria-hidden="true"
                className="size-8 text-[var(--color-primary)]"
              />
            </div>

            <div className="max-w-sm space-y-2">
              <p className="text-base font-medium text-[var(--color-text)]">
                גררו תמונות לכאן
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                או לחצו לבחירת קבצים מהמחשב
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            >
              בחירת קבצים
            </Button>

            <div className="space-y-1 text-caption text-[var(--color-text-muted)]">
              <p>פורמטים נתמכים: JPEG, PNG, WebP</p>
              <p>עד {MAX_BATCH_UPLOAD_FILES} קבצים · עד 30MB לקובץ</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              addFilesToQueue(files);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          />
        </section>

        <section
          aria-labelledby="upload-queue-title"
          className="flex min-h-0 min-w-0 flex-col"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 id="upload-queue-title" className="text-sm font-medium">
                תור העלאה
              </h3>
              <p className="text-caption text-[var(--color-text-muted)]">
                {queue.length > 0
                  ? `${queue.length} מתוך ${MAX_BATCH_UPLOAD_FILES} קבצים נבחרו`
                  : "הקבצים שתבחרו יופיעו כאן"}
              </p>
            </div>
          </div>

          {queue.length > 0 ? (
            <ul className="space-y-4">
              {queue.map((item) => (
                <MediaUploadQueueItem
                  key={item.id}
                  item={item}
                  disabled={isUploading}
                  onAltTextChange={handleAltTextChange}
                  onUploadModeChange={handleUploadModeChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </ul>
          ) : (
            <div className="flex min-h-[min(280px,35dvh)] flex-1 flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 px-6 py-10 text-center">
              <ImageIcon
                aria-hidden="true"
                className="size-10 text-[var(--color-text-muted)]"
              />
              <div className="max-w-xs space-y-1">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  אין קבצים בתור
                </p>
                <p className="text-caption text-[var(--color-text-muted)]">
                  בחרו או גררו תמונות כדי להוסיף אותן להעלאה
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </Dialog>
  );
}
