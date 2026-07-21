import "server-only";

import type { PublicContactMessageValues } from "@/lib/validations/public-contact";

export type ContactNotificationPayload = {
  messageId: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  businessEmail: string | null;
};

/**
 * Notify Yael about a new contact message.
 *
 * TODO(resend): Wire Resend here once RESEND_API_KEY / RESEND_FROM_EMAIL
 * are configured. Expected flow after insert:
 * 1. Resolve recipient from business profile email (fallback CONTACT_NOTIFICATION_EMAIL).
 * 2. Send RTL HTML email with subject: `פנייה חדשה מהאתר – {fullName}`.
 * 3. Include name, email, phone, message, received time, admin deep link.
 * 4. Include mailto / tel / WhatsApp action buttons when available.
 * 5. Do NOT send an auto-reply to the visitor.
 * 6. On Resend failure: log securely (message id + error type only) and
 *    still treat the visitor submission as successful (row is already saved).
 */
export async function notifyContactMessageReceived(
  payload: ContactNotificationPayload
): Promise<void> {
  // TODO(resend): replace this no-op with Resend sendMail implementation.
  void payload;
}

export function buildContactNotificationPayload(input: {
  messageId: string;
  values: PublicContactMessageValues;
  createdAt: string;
  businessEmail: string | null;
}): ContactNotificationPayload {
  return {
    messageId: input.messageId,
    fullName: input.values.full_name,
    email: input.values.email,
    phone: input.values.phone,
    message: input.values.message,
    createdAt: input.createdAt,
    businessEmail: input.businessEmail,
  };
}
