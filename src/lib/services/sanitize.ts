export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function sanitizePlainText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function formatServiceParagraphs(value: string): string[] {
  return sanitizePlainText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
