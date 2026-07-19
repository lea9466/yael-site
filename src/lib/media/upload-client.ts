import type { UploadMediaResult } from "@/lib/media/media-types";
import type { UploadMode } from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";

export async function uploadMediaViaApi(
  file: File,
  altText: string,
  uploadMode: UploadMode,
  signal?: AbortSignal
): Promise<UploadMediaResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("altText", altText);
  formData.append("uploadMode", uploadMode);

  try {
    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
      signal,
    });

    if (signal?.aborted) {
      return { success: false, error: MEDIA_ERRORS.uploadAborted };
    }

    const payload = (await response.json()) as UploadMediaResult;

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      typeof payload.success === "boolean"
    ) {
      return payload;
    }

    return { success: false, error: MEDIA_ERRORS.generic };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, error: MEDIA_ERRORS.uploadAborted };
    }

    return { success: false, error: MEDIA_ERRORS.generic };
  }
}
