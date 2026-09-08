export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function sanitizePlainText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}
