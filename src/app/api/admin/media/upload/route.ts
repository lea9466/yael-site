import { NextResponse } from "next/server";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import { uploadMediaFromFile } from "@/lib/media/upload-media.server";
import type { UploadMediaResult } from "@/lib/media/media-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(result: UploadMediaResult, status = 200) {
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  if (request.signal.aborted) {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.uploadAborted },
      499
    );
  }

  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.unauthorized },
      401
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.invalidFile },
      400
    );
  }

  if ([...formData.keys()].length === 0) {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.missingFile },
      400
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.missingFile },
      400
    );
  }

  if (file.size === 0) {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.invalidFile },
      400
    );
  }

  const altText = formData.get("altText")?.toString();
  const uploadMode = formData.get("uploadMode")?.toString();

  try {
    const supabase = await createClient();

    const result = await uploadMediaFromFile({
      supabase,
      adminId: admin.id,
      file,
      altText,
      uploadMode:
        uploadMode === "optimized" || uploadMode === "original"
          ? uploadMode
          : "optimized",
    });

    if (!result.success) {
      const status =
        result.error === MEDIA_ERRORS.unauthorized
          ? 401
          : result.error === MEDIA_ERRORS.fileTooLarge ||
              result.error === MEDIA_ERRORS.invalidFile ||
              result.error === MEDIA_ERRORS.missingFile
            ? 400
            : 500;

      return jsonResponse(result, status);
    }

    return jsonResponse(result, 201);
  } catch {
    return jsonResponse(
      { success: false, error: MEDIA_ERRORS.generic },
      500
    );
  }
}
