import { randomUUID } from "crypto";

import sharp from "sharp";

import {
  ALLOWED_INPUT_MIME_TYPES,
  MAX_IMAGE_WIDTH,
  MAX_SOURCE_UPLOAD_BYTES,
  OUTPUT_EXTENSION,
  OUTPUT_MIME_TYPE,
} from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import type { ProcessedImage } from "@/lib/media/media-types";

type ProcessImageSuccess = {
  success: true;
  image: ProcessedImage;
};

type ProcessImageFailure = {
  success: false;
  error: string;
};

export type ProcessImageResult = ProcessImageSuccess | ProcessImageFailure;

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function sanitizeOriginalFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() ?? "image";

  return baseName
    .replace(/[^\w.\-\u0590-\u05FF ]+/gu, "_")
    .trim()
    .slice(0, 200);
}

export function buildStoragePath(): { fileName: string; storagePath: string } {
  const fileName = `${randomUUID()}.${OUTPUT_EXTENSION}`;
  const year = new Date().getFullYear().toString();
  const storagePath = `${year}/${fileName}`;

  return { fileName, storagePath };
}

export async function processImageBuffer(
  buffer: Buffer,
  declaredMimeType: string
): Promise<ProcessImageResult> {
  if (buffer.byteLength === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (buffer.byteLength > MAX_SOURCE_UPLOAD_BYTES) {
    return { success: false, error: MEDIA_ERRORS.fileTooLarge };
  }

  const detectedMimeType = detectMimeType(buffer);

  if (
    !detectedMimeType ||
    !ALLOWED_INPUT_MIME_TYPES.includes(
      detectedMimeType as (typeof ALLOWED_INPUT_MIME_TYPES)[number]
    )
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (
    !ALLOWED_INPUT_MIME_TYPES.includes(
      declaredMimeType as (typeof ALLOWED_INPUT_MIME_TYPES)[number]
    )
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  try {
    const image = sharp(buffer, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return { success: false, error: MEDIA_ERRORS.invalidFile };
    }

    const resized = image.resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    });

    const outputBuffer = await resized
      .webp({
        quality: 82,
        effort: 4,
      })
      .toBuffer({ resolveWithObject: true });

    const { fileName, storagePath } = buildStoragePath();

    return {
      success: true,
      image: {
        buffer: outputBuffer.data,
        width: outputBuffer.info.width,
        height: outputBuffer.info.height,
        sizeBytes: outputBuffer.data.byteLength,
        mimeType: OUTPUT_MIME_TYPE,
        fileName,
        storagePath,
      },
    };
  } catch {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }
}
