import { randomUUID } from "crypto";

import {
  HERO_VIDEO_MIME_TYPES,
  MAX_SOURCE_UPLOAD_BYTES,
  VIDEO_EXTENSION_BY_MIME,
  type HeroVideoMimeType,
} from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import { isVideoMimeType } from "@/lib/media/mime";
import type { ProcessImageResult } from "@/lib/media/process-image";

function detectVideoMimeType(buffer: Buffer): HeroVideoMimeType | null {
  if (buffer.length < 12) {
    return null;
  }

  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return "video/mp4";
  }

  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }

  return null;
}

function buildVideoStoragePath(mimeType: HeroVideoMimeType): {
  fileName: string;
  storagePath: string;
} {
  const extension = VIDEO_EXTENSION_BY_MIME[mimeType];
  const fileName = `${randomUUID()}.${extension}`;
  const year = new Date().getFullYear().toString();
  const storagePath = `${year}/${fileName}`;

  return { fileName, storagePath };
}

export async function processHeroVideoBuffer(
  buffer: Buffer,
  declaredMimeType: string
): Promise<ProcessImageResult> {
  if (buffer.byteLength === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (buffer.byteLength > MAX_SOURCE_UPLOAD_BYTES) {
    return { success: false, error: MEDIA_ERRORS.fileTooLarge };
  }

  const detectedMimeType = detectVideoMimeType(buffer);

  if (
    !detectedMimeType ||
    !HERO_VIDEO_MIME_TYPES.includes(detectedMimeType)
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (
    !HERO_VIDEO_MIME_TYPES.includes(declaredMimeType as HeroVideoMimeType)
  ) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  if (declaredMimeType !== detectedMimeType) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  const { fileName, storagePath } = buildVideoStoragePath(detectedMimeType);

  return {
    success: true,
    image: {
      buffer,
      width: 0,
      height: 0,
      sizeBytes: buffer.byteLength,
      mimeType: detectedMimeType,
      fileName,
      storagePath,
    },
  };
}

export function isHeroVideoMimeType(mimeType: string): boolean {
  return isVideoMimeType(mimeType);
}
