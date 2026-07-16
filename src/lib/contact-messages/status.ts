import type { AdminStatusKey } from "@/lib/admin/status-system";
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  type ContactMessageStatus,
} from "@/lib/contact-messages/constants";

export function isReadToStatus(isRead: boolean): ContactMessageStatus {
  return isRead ? "handled" : "new";
}

export function statusToIsRead(status: ContactMessageStatus): boolean {
  return status === "handled";
}

export function getContactMessageStatusBadgeKey(
  status: ContactMessageStatus
): AdminStatusKey {
  switch (status) {
    case "new":
      return "new";
    case "in_progress":
      return "pending";
    case "handled":
      return "handled";
  }
}

export function getContactMessageStatusLabel(
  status: ContactMessageStatus
): string {
  return CONTACT_MESSAGE_STATUS_LABELS[status];
}

export function resolveContactMessageStatus(
  isRead: boolean,
  storedStatus: ContactMessageStatus | null
): ContactMessageStatus {
  if (isRead) {
    return "handled";
  }

  if (storedStatus === "in_progress") {
    return "in_progress";
  }

  return "new";
}

export function isUnreadContactMessage(status: ContactMessageStatus): boolean {
  return status === "new";
}
