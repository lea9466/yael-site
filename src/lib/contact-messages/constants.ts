export const CONTACT_MESSAGES_PAGE_SIZE = 12;

export const CONTACT_MESSAGE_EXCERPT_LINES = 3;
export const CONTACT_MESSAGE_EXCERPT_MAX_LENGTH = 220;

export const CONTACT_MESSAGE_STATUSES = [
  "new",
  "in_progress",
  "handled",
] as const;

export type ContactMessageStatus =
  (typeof CONTACT_MESSAGE_STATUSES)[number];

export const CONTACT_MESSAGE_STATUS_LABELS: Record<
  ContactMessageStatus,
  string
> = {
  new: "חדש",
  in_progress: "בטיפול",
  handled: "טופל",
};

export const CONTACT_MESSAGE_STATUS_STORAGE_KEY =
  "yael-contact-message-status-v1";
