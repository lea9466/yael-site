import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { PUBLIC_MEDIA_BUCKET } from "@/lib/media/constants";
import { findMediaUsages } from "@/lib/media/check-usage";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import type { MediaUsageReference } from "@/lib/media/media-types";

export type DeleteMediaItemResult =
  | {
      outcome: "deleted";
      id: string;
      fileName: string;
    }
  | {
      outcome: "blocked";
      id: string;
      fileName: string;
      usages: MediaUsageReference[];
    }
  | {
      outcome: "failed";
      id: string;
      fileName: string;
      message: string;
    };

export async function deleteMediaItem(
  supabase: SupabaseClient,
  mediaId: string
): Promise<DeleteMediaItemResult> {
  try {
    const { data: mediaRow, error: loadError } = await supabase
      .from("media_library")
      .select("id, storage_path, original_file_name, file_name")
      .eq("id", mediaId)
      .maybeSingle();

    if (loadError) {
      return {
        outcome: "failed",
        id: mediaId,
        fileName: mediaId,
        message: MEDIA_ERRORS.generic,
      };
    }

    if (!mediaRow) {
      return {
        outcome: "failed",
        id: mediaId,
        fileName: mediaId,
        message: MEDIA_ERRORS.deleteNotFound,
      };
    }

    const fileName = mediaRow.original_file_name ?? mediaRow.file_name;
    const usages = await findMediaUsages(supabase, mediaId);

    if (usages.length > 0) {
      return {
        outcome: "blocked",
        id: mediaId,
        fileName,
        usages,
      };
    }

    const { error: storageError } = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .remove([mediaRow.storage_path]);

    if (storageError) {
      return {
        outcome: "failed",
        id: mediaId,
        fileName,
        message: MEDIA_ERRORS.generic,
      };
    }

    const { error: deleteError } = await supabase
      .from("media_library")
      .delete()
      .eq("id", mediaId);

    if (deleteError) {
      return {
        outcome: "failed",
        id: mediaId,
        fileName,
        message: MEDIA_ERRORS.generic,
      };
    }

    return {
      outcome: "deleted",
      id: mediaId,
      fileName,
    };
  } catch {
    return {
      outcome: "failed",
      id: mediaId,
      fileName: mediaId,
      message: MEDIA_ERRORS.generic,
    };
  }
}
