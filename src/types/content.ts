/**
 * Shared content status for services, recipes and articles.
 * Keep in sync with the allowlist enforced by Zod schemas on the server.
 */
export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];
