import { z } from "zod";

import {
  CONTACT_MESSAGES_PAGE_SIZE,
  CONTACT_MESSAGE_STATUSES,
} from "@/lib/contact-messages/constants";

export const CONTACT_MESSAGE_STATUS_FILTERS = [
  "all",
  ...CONTACT_MESSAGE_STATUSES,
] as const;

export const CONTACT_MESSAGE_SORT_VALUES = ["newest", "oldest"] as const;

export type ContactMessageSortValue =
  (typeof CONTACT_MESSAGE_SORT_VALUES)[number];

export type ContactMessageStatusFilter =
  (typeof CONTACT_MESSAGE_STATUS_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

export const listContactMessagesQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(200, "חיפוש ארוך מדי")
    .optional()
    .transform((value) => value ?? ""),
  status: z
    .enum(CONTACT_MESSAGE_STATUS_FILTERS)
    .optional()
    .transform((value) => value ?? "all"),
  sort: z
    .enum(CONTACT_MESSAGE_SORT_VALUES)
    .optional()
    .transform((value) => value ?? "newest"),
  page: z
    .string()
    .optional()
    .transform((value) => {
      const parsed = Number.parseInt(value ?? "1", 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }),
});

export type ListContactMessagesQuery = z.infer<
  typeof listContactMessagesQuerySchema
>;

export const updateContactMessageStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(CONTACT_MESSAGE_STATUSES, {
    message: "יש לבחור סטטוס",
  }),
});

export const deleteContactMessageSchema = z.object({
  id: uuidSchema,
});

export const getContactMessageSchema = z.object({
  id: uuidSchema,
});

export { CONTACT_MESSAGES_PAGE_SIZE };
