export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} בתים`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMediaDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDimensions(width: number, height: number): string {
  if (width <= 0 || height <= 0) {
    return "—";
  }

  return `${width} × ${height}`;
}

export function formatMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "JPEG";
    case "image/png":
      return "PNG";
    case "image/webp":
      return "WebP";
    case "video/mp4":
      return "MP4";
    case "video/webm":
      return "WebM";
    default:
      return "—";
  }
}
