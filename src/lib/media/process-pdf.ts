import { randomUUID } from "crypto";

import {
  MAX_SOURCE_UPLOAD_BYTES,
  PDF_MIME_TYPE,
} from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import type { ProcessImageResult } from "@/lib/media/process-image";

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) {
    return false;
  }

  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

function buildPdfStoragePath(): { fileName: string; storagePath: string } {
  const fileName = `${randomUUID()}.pdf`;
  const year = new Date().getFullYear().toString();
  const storagePath = `${year}/${fileName}`;

  return { fileName, storagePath };
}

export async function processPdfBuffer(
  buffer: Buffer,
  declaredMimeType: string
): Promise<ProcessImageResult> {
  if (buffer.byteLength === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (buffer.byteLength > MAX_SOURCE_UPLOAD_BYTES) {
    return { success: false, error: MEDIA_ERRORS.fileTooLarge };
  }

  if (declaredMimeType !== PDF_MIME_TYPE) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (!isPdfBuffer(buffer)) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  const { fileName, storagePath } = buildPdfStoragePath();

  return {
    success: true,
    image: {
      buffer,
      width: 0,
      height: 0,
      sizeBytes: buffer.byteLength,
      mimeType: PDF_MIME_TYPE,
      fileName,
      storagePath,
    },
  };
}
