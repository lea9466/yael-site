"use server";

import { headers } from "next/headers";

import { PUBLIC_CONTACT_ERRORS } from "@/lib/contact/errors";
import {
  buildContactNotificationPayload,
  notifyContactMessageReceived,
} from "@/lib/contact/notify";
import { getWebsiteSettings } from "@/lib/public/queries";
import { consumeContactFormRateLimit } from "@/lib/rate-limit/contact-form";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  publicContactMessageSchema,
  type PublicContactMessageInput,
} from "@/lib/validations/public-contact";

export type PublicContactFieldErrors = Partial<
  Record<
    "full_name" | "email" | "phone" | "message" | "privacy_policy_accepted",
    string
  >
>;

export type PublicContactActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: PublicContactFieldErrors;
    };

async function resolveClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  const realIp = headerStore.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function mapFieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>
): PublicContactFieldErrors {
  const fieldErrors: PublicContactFieldErrors = {};

  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");

    if (
      key === "full_name" ||
      key === "email" ||
      key === "phone" ||
      key === "message" ||
      key === "privacy_policy_accepted"
    ) {
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
  }

  return fieldErrors;
}

export async function submitPublicContactAction(
  input: PublicContactMessageInput
): Promise<PublicContactActionResult> {
  const parsed = publicContactMessageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const values = parsed.data;

  // Honeypot filled — pretend success without saving or notifying.
  if (values.company_website && values.company_website.trim().length > 0) {
    return { success: true };
  }

  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("[contact-form] service role client unavailable", {
      at: new Date().toISOString(),
    });
    return {
      success: false,
      error: PUBLIC_CONTACT_ERRORS.unavailable,
    };
  }

  const clientIp = await resolveClientIp();
  const rateLimit = await consumeContactFormRateLimit(supabase, clientIp);

  if (!rateLimit.ok) {
    if (rateLimit.reason === "rate_limited") {
      return {
        success: false,
        error: PUBLIC_CONTACT_ERRORS.rateLimited,
      };
    }

    return {
      success: false,
      error: PUBLIC_CONTACT_ERRORS.unavailable,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      message: values.message,
      privacy_policy_accepted: true,
      is_read: false,
    })
    .select("id, created_at")
    .single();

  if (insertError || !inserted) {
    console.error("[contact-form] insert failed", {
      at: new Date().toISOString(),
      code: insertError?.code,
    });
    return {
      success: false,
      error: PUBLIC_CONTACT_ERRORS.generic,
    };
  }

  const settings = await getWebsiteSettings();
  const businessEmail = settings.businessProfile.email?.trim() || null;

  try {
    await notifyContactMessageReceived(
      buildContactNotificationPayload({
        messageId: inserted.id,
        values,
        createdAt: inserted.created_at,
        businessEmail,
      })
    );
  } catch (error) {
    // Message is already saved — visitor still sees success.
    console.error("[contact-form] notification failed after insert", {
      at: new Date().toISOString(),
      messageId: inserted.id,
      type: error instanceof Error ? error.name : "unknown",
    });
  }

  return { success: true };
}
