import { randomUUID } from "crypto";

import sharp from "sharp";

import {
  ALLOWED_INPUT_MIME_TYPES,
  MAX_SOURCE_UPLOAD_BYTES,
  OUTPUT_EXTENSION,
  OUTPUT_MIME_TYPE,
  UPLOAD_PROFILE_PROCESSING,
  type UploadProfile,
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

type AllowedInputMimeType = (typeof ALLOWED_INPUT_MIME_TYPES)[number];

const SHARP_FORMAT_TO_MIME: Record<string, AllowedInputMimeType> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function detectMimeType(buffer: Buffer): AllowedInputMimeType | null {
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

type SourceValidationSuccess = {
  success: true;
  detectedMimeType: AllowedInputMimeType;
};

type SourceValidationFailure = {
  success: false;
  error: string;
};

type SourceValidationResult = SourceValidationSuccess | SourceValidationFailure;

function validateSourceBuffer(
  buffer: Buffer,
  declaredMimeType: string
): SourceValidationResult {
  if (buffer.byteLength === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (buffer.byteLength > MAX_SOURCE_UPLOAD_BYTES) {
    return { success: false, error: MEDIA_ERRORS.fileTooLarge };
  }

  const detectedMimeType = detectMimeType(buffer);

  if (
    !detectedMimeType ||
    !ALLOWED_INPUT_MIME_TYPES.includes(detectedMimeType)
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (
    !ALLOWED_INPUT_MIME_TYPES.includes(
      declaredMimeType as AllowedInputMimeType
    )
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (declaredMimeType !== detectedMimeType) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  return { success: true, detectedMimeType };
}

export function sanitizeOriginalFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() ?? "image";

  return baseName
    .replace(/[^\w.\-\u0590-\u05FF ]+/gu, "_")
    .trim()
    .slice(0, 200);
}

export function buildOptimizedStoragePath(): {
  fileName: string;
  storagePath: string;
} {
  const fileName = `${randomUUID()}.${OUTPUT_EXTENSION}`;
  const year = new Date().getFullYear().toString();
  const storagePath = `${year}/${fileName}`;

  return { fileName, storagePath };
}

export async function processImageByProfile(
  buffer: Buffer,
  declaredMimeType: string,
  profile: UploadProfile
): Promise<ProcessImageResult> {
  const sourceValidation = validateSourceBuffer(buffer, declaredMimeType);

  if (!sourceValidation.success) {
    return sourceValidation;
  }

  const config = UPLOAD_PROFILE_PROCESSING[profile];

  try {
    const image = sharp(buffer, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return { success: false, error: MEDIA_ERRORS.invalidFile };
    }

    const decodedMimeType = metadata.format
      ? SHARP_FORMAT_TO_MIME[metadata.format]
      : undefined;

    if (decodedMimeType !== sourceValidation.detectedMimeType) {
      return { success: false, error: MEDIA_ERRORS.invalidFile };
    }

    const outputBuffer = await image
      .resize({
        width: config.maxWidth,
        height: config.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: config.quality,
        effort: 4,
      })
      .toBuffer({ resolveWithObject: true });

    const { fileName, storagePath } = buildOptimizedStoragePath();

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
