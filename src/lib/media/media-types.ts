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
  created_at: string;
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
