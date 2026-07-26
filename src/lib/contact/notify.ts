import "server-only";

import { Resend } from "resend";

import {
  buildContactNotificationHtml,
  buildContactNotificationSubject,
  buildContactNotificationText,
} from "@/lib/contact/notification-email";
import type { ContactNotificationPayload } from "@/lib/contact/types";
import type { PublicContactMessageValues } from "@/lib/validations/public-contact";

export type { ContactNotificationPayload };

function resolveRecipient(businessEmail: string | null): string | null {
  const fromProfile = businessEmail?.trim() || null;

  if (fromProfile) {
    return fromProfile;
  }

  const fallback = process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || null;
  return fallback || null;
}

function resolveFromAddress(): string | null {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || null;

  if (!fromEmail) {
    return null;
  }

  if (fromEmail.includes("<")) {
    return fromEmail;
  }

  return `Yaelifestyle <${fromEmail}>`;
}

/**
 * Notify Yael about a new contact message.
 *
 * Flow after insert:
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
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const from = resolveFromAddress();
  const to = resolveRecipient(payload.businessEmail);

  if (!apiKey || !from) {
    console.error("[contact-form] notification skipped: missing Resend config", {
      at: new Date().toISOString(),
      messageId: payload.messageId,
      type: "config",
    });
    return;
  }

  if (!to) {
    console.error("[contact-form] notification skipped: missing recipient", {
      at: new Date().toISOString(),
      messageId: payload.messageId,
      type: "recipient",
    });
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: buildContactNotificationSubject(payload.fullName),
    html: buildContactNotificationHtml(payload),
    text: buildContactNotificationText(payload),
  });

  if (error) {
    console.error("[contact-form] Resend send failed", {
      at: new Date().toISOString(),
      messageId: payload.messageId,
      type: error.name || "ResendError",
    });
  }
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
