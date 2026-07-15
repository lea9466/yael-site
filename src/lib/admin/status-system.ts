import type { ContentStatus } from "@/types/content";
import type { UploadQueueStatus } from "@/lib/media/upload-queue";

export const ADMIN_STATUS_KEYS = [
  "draft",
  "published",
  "archived",
  "featured",
  "new",
  "active",
  "hidden",
  "public",
  "private",
  "pending",
  "handled",
  "error",
] as const;

export type AdminStatusKey = (typeof ADMIN_STATUS_KEYS)[number];

/** Visual variant used by StatusBadge CSS — identical to AdminStatusKey. */
export type StatusBadgeVariant = AdminStatusKey;

export const ADMIN_STATUS_LABELS: Record<AdminStatusKey, string> = {
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
  featured: "מומלץ",
  new: "חדש",
  active: "פעיל",
  hidden: "מוסתר",
  public: "ציבורי",
  private: "פרטי",
  pending: "ממתין",
  handled: "טופל",
  error: "נכשל",
};

/** Maps content lifecycle statuses to the global admin status palette. */
export const CONTENT_STATUS_MAP: Record<ContentStatus, AdminStatusKey> = {
  draft: "draft",
  published: "published",
  archived: "archived",
};

/** Maps media upload queue statuses to the global admin status palette. */
export const UPLOAD_QUEUE_STATUS_MAP: Record<UploadQueueStatus, AdminStatusKey> =
  {
    pending: "pending",
    uploading: "active",
    completed: "handled",
    failed: "error",
  };

export const UPLOAD_QUEUE_STATUS_LABELS: Record<UploadQueueStatus, string> = {
  pending: ADMIN_STATUS_LABELS.pending,
  uploading: "מעלה ומעבדת…",
  completed: "הושלם",
  failed: ADMIN_STATUS_LABELS.error,
};

export function getAdminStatusLabel(status: AdminStatusKey): string {
  return ADMIN_STATUS_LABELS[status];
}

export function getContentStatusLabel(status: ContentStatus): string {
  return ADMIN_STATUS_LABELS[CONTENT_STATUS_MAP[status]];
}

export function getContentAdminStatus(status: ContentStatus): AdminStatusKey {
  return CONTENT_STATUS_MAP[status];
}

export function getUploadQueueAdminStatus(
  status: UploadQueueStatus
): AdminStatusKey {
  return UPLOAD_QUEUE_STATUS_MAP[status];
}

export function getUploadQueueStatusLabel(status: UploadQueueStatus): string {
  return UPLOAD_QUEUE_STATUS_LABELS[status];
}
