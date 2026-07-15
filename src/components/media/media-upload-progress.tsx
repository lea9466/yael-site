import type { BatchProgressStats } from "@/lib/media/upload-queue";

type MediaUploadProgressProps = {
  progress: BatchProgressStats | null;
  isUploading: boolean;
};

export function MediaUploadProgress({
  progress,
  isUploading,
}: MediaUploadProgressProps) {
  if (!progress || progress.total === 0) {
    return null;
  }

  const percent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;
  const remaining = Math.max(progress.total - progress.processed, 0);

  return (
    <section aria-labelledby="upload-progress-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h3 id="upload-progress-title" className="text-sm font-medium">
            סיכום התקדמות
          </h3>
          <p
            className="text-sm text-[var(--color-text-muted)]"
            aria-live="polite"
          >
            {isUploading
              ? `מעלה קבצים... ${progress.processed} מתוך ${progress.total} הושלמו`
              : `מוכן להעלאה: ${progress.total} קבצים`}
          </p>
        </div>

        <p
          className="text-caption text-[var(--color-text-muted)]"
          aria-live="polite"
        >
          הושלמו: {progress.success} · נכשלו: {progress.failed} · נותרו:{" "}
          {remaining}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="התקדמות העלאת קבצים"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isUploading || percent > 0 ? percent : 0}
        className="h-3 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-border)]"
      >
        <div
          className="h-full rounded-[var(--radius-full)] bg-[var(--color-primary)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${isUploading || percent > 0 ? percent : 0}%` }}
        />
      </div>

      <p className="text-caption font-medium text-[var(--color-text)]">
        {percent}%
      </p>
    </section>
  );
}
