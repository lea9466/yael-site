import type { ContactMessageStatus } from "@/lib/contact-messages/constants";
import type { ListContactMessagesQuery } from "@/lib/validations/contact-message";

export type ContactMessageRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  privacy_policy_accepted: boolean;
  is_read: boolean;
  created_at: string;
};

export type ContactMessageListItem = ContactMessageRecord & {
  status: ContactMessageStatus;
};

export type ContactMessageDetail = ContactMessageListItem;

export type ContactMessagesListData = {
  items: ContactMessageListItem[];
  query: ListContactMessagesQuery;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
};

export type ContactMessageActionResult =
  | { success: true; data?: { id: string; status: ContactMessageStatus } }
  | {
      success: false;
      error: string;
    };
