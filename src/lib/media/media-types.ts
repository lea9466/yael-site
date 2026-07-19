import type { UploadProfile } from "@/lib/media/constants";
import type { MediaSortValue } from "@/lib/validations/media";

export type MediaRecord = {
  id: string;
  storage_path: string;
  file_name: string;
  original_file_name: string | null;
  mime_type: string;
  width: number;
  height: number;
  size_bytes: number;
  alt_text: string | null;
  uploaded_by: string | null;
  upload_mode: UploadProfile;
  created_at: string;
};

export type MediaListItem = MediaRecord & {
  publicUrl: string | null;
};

export type MediaLibraryStats = {
  totalCount: number;
  totalSizeBytes: number;
};

export type MediaLibraryPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type MediaLibraryData = {
  items: MediaListItem[];
  stats: MediaLibraryStats;
  pagination: MediaLibraryPagination;
  query: {
    q: string;
    sort: MediaSortValue;
    page: number;
  };
};

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  fileName: string;
  storagePath: string;
};

export type MediaUsageReference = {
  label: string;
};

export type UploadMediaResult =
  | { success: true; media: MediaRecord }
  | { success: false; error: string };

export type DeleteMediaResult =
  | { success: true }
  | {
      success: false;
      error: string;
      usages?: MediaUsageReference[];
    };

export type UpdateMediaAltTextResult =
  | { success: true; media: MediaRecord }
  | { success: false; error: string };

export type BulkDeleteMediaEntry = {
  id: string;
  fileName: string;
};

export type BulkDeleteBlockedEntry = BulkDeleteMediaEntry & {
  usages: MediaUsageReference[];
};

export type BulkDeleteFailedEntry = BulkDeleteMediaEntry & {
  message: string;
};

export type BulkDeleteMediaResult = {
  deleted: BulkDeleteMediaEntry[];
  blocked: BulkDeleteBlockedEntry[];
  failed: BulkDeleteFailedEntry[];
};
