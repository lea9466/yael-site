import {
  ALLOWED_INPUT_MIME_TYPES,
  DEFAULT_UPLOAD_PROFILE,
  HERO_VIDEO_MIME_TYPES,
  MAX_BATCH_UPLOAD_CONCURRENCY,
  MAX_SOURCE_UPLOAD_BYTES,
  PDF_MIME_TYPE,
  type UploadProfile,
} from "@/lib/media/constants";
import { isPdfMimeType, isVideoMimeType } from "@/lib/media/mime";

export type UploadQueueStatus = "pending" | "uploading" | "completed" | "failed";

export const UPLOAD_QUEUE_STATUS_LABELS: Record<UploadQueueStatus, string> = {
  pending: "ממתין",
  uploading: "מעלה ומעבדת…",
  completed: "הושלם",
  failed: "נכשל",
};

export type BatchProgressStats = {
  total: number;
  processed: number;
  success: number;
  failed: number;
};

export const COMPLETED_ITEM_REMOVE_DELAY_MS = 800;
export const COMPLETED_ITEM_REMOVE_DELAY_REDUCED_MS = 300;

export type UploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
  uploadProfile: UploadProfile;
  status: UploadQueueStatus;
  error?: string;
  uploadAttempted?: boolean;
};

const ACCEPTED_IMAGE_MIME_SET = new Set<string>(ALLOWED_INPUT_MIME_TYPES);
const HERO_VIDEO_MIME_SET = new Set<string>(HERO_VIDEO_MIME_TYPES);

export function isVideoUploadFile(file: File): boolean {
  return isVideoMimeType(file.type);
}

export function isPdfUploadFile(file: File): boolean {
  return isPdfMimeType(file.type);
}

export function validateUploadFile(
  file: File,
  uploadProfile: UploadProfile = DEFAULT_UPLOAD_PROFILE
): string | null {
  const isImage = ACCEPTED_IMAGE_MIME_SET.has(file.type);
  const isPdf = file.type === PDF_MIME_TYPE;
  const isHeroVideo =
    uploadProfile === "hero" && HERO_VIDEO_MIME_SET.has(file.type);

  if (!isImage && !isHeroVideo && !isPdf) {
    if (HERO_VIDEO_MIME_SET.has(file.type)) {
      return "סרטונים נתמכים רק בפרופיל תמונה ראשית.";
    }

    return "הקובץ אינו תקין או אינו נתמך.";
  }

  if (file.size > MAX_SOURCE_UPLOAD_BYTES) {
    return "הקובץ גדול מדי.";
  }

  return null;
}

export function createUploadQueueItem(file: File): UploadQueueItem {
  const validationError = validateUploadFile(file);

  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    altText: "",
    uploadProfile: DEFAULT_UPLOAD_PROFILE,
    status: validationError ? "failed" : "pending",
    error: validationError ?? undefined,
  };
}

export function revalidateQueueItemForProfile(
  item: UploadQueueItem,
  uploadProfile: UploadProfile
): Pick<UploadQueueItem, "uploadProfile" | "status" | "error"> {
  const validationError = validateUploadFile(item.file, uploadProfile);

  if (validationError) {
    return {
      uploadProfile,
      status: "failed",
      error: validationError,
    };
  }

  return {
    uploadProfile,
    status: item.uploadAttempted ? item.status : "pending",
    error: undefined,
  };
}

export function revokeQueueItemPreview(item: UploadQueueItem): void {
  URL.revokeObjectURL(item.previewUrl);
}

type UploadItemResult = {
  success: boolean;
  error?: string;
};

type ProcessBatchOptions = {
  items: UploadQueueItem[];
  concurrency?: number;
  uploadItem: (item: UploadQueueItem) => Promise<UploadItemResult>;
  onItemUpdate: (
    id: string,
    update: Partial<
      Pick<UploadQueueItem, "status" | "error" | "uploadAttempted">
    >
  ) => void;
  onProgress?: (stats: BatchProgressStats) => void;
};

export async function processUploadBatch({
  items,
  concurrency = MAX_BATCH_UPLOAD_CONCURRENCY,
  uploadItem,
  onItemUpdate,
  onProgress,
}: ProcessBatchOptions): Promise<{ completed: number; failed: number }> {
  const uploadable = items.filter(
    (item) =>
      item.status === "pending" ||
      (item.status === "failed" && item.uploadAttempted === true)
  );

  let completed = 0;
  let failed = 0;
  let index = 0;

  const total = uploadable.length;

  const reportProgress = () => {
    onProgress?.({
      total,
      processed: completed + failed,
      success: completed,
      failed,
    });
  };

  async function worker(): Promise<void> {
    while (index < uploadable.length) {
      const currentIndex = index;
      index += 1;
      const item = uploadable[currentIndex];

      onItemUpdate(item.id, { status: "uploading", error: undefined });

      const result = await uploadItem(item);

      if (result.success) {
        completed += 1;
        onItemUpdate(item.id, {
          status: "completed",
          error: undefined,
          uploadAttempted: true,
        });
      } else {
        failed += 1;
        onItemUpdate(item.id, {
          status: "failed",
          error: result.error ?? "אירעה שגיאה. נסו שוב מאוחר יותר.",
          uploadAttempted: true,
        });
      }

      reportProgress();
    }
  }

  const workerCount = Math.min(concurrency, uploadable.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return { completed, failed };
}

export function buildBatchSummary(completed: number, failed: number): string {
  if (completed === 0 && failed === 0) {
    return "לא הועלו קבצים.";
  }

  if (completed > 0 && failed === 0) {
    return `הועלו בהצלחה ${completed} קבצים.`;
  }

  if (completed === 0 && failed > 0) {
    return `כל ${failed} הקבצים נכשלו בהעלאה.`;
  }

  return `הועלו בהצלחה ${completed} קבצים. ${failed} קבצים נכשלו.`;
}
