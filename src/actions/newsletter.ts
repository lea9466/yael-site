"use server";

import { headers } from "next/headers";

import { NEWSLETTER_SIGNUP_ERRORS } from "@/lib/newsletter/errors";
import { addRavMessageSubscriber } from "@/lib/newsletter/ravmessage";
import { consumeNewsletterSignupRateLimit } from "@/lib/rate-limit/newsletter-signup";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  newsletterSignupSchema,
  type NewsletterSignupInput,
} from "@/lib/validations/newsletter";

export type NewsletterSignupFieldErrors = Partial<
  Record<"full_name" | "email" | "marketing_consent", string>
>;

export type NewsletterSignupActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: NewsletterSignupFieldErrors;
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
): NewsletterSignupFieldErrors {
  const fieldErrors: NewsletterSignupFieldErrors = {};

  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");

    if (key === "full_name" || key === "email" || key === "marketing_consent") {
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
  }

  return fieldErrors;
}

export async function submitNewsletterSignupAction(
  input: NewsletterSignupInput
): Promise<NewsletterSignupActionResult> {
  const parsed = newsletterSignupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const values = parsed.data;

  // Honeypot filled — pretend success without registering the subscriber.
  if (values.company_website && values.company_website.trim().length > 0) {
    return { success: true };
  }

  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("[newsletter-signup] service role client unavailable", {
      at: new Date().toISOString(),
    });
    return {
      success: false,
      error: NEWSLETTER_SIGNUP_ERRORS.unavailable,
    };
  }

  const clientIp = await resolveClientIp();
  const rateLimit = await consumeNewsletterSignupRateLimit(supabase, clientIp);

  if (!rateLimit.ok) {
    if (rateLimit.reason === "rate_limited") {
      return {
        success: false,
        error: NEWSLETTER_SIGNUP_ERRORS.rateLimited,
      };
    }

    return {
      success: false,
      error: NEWSLETTER_SIGNUP_ERRORS.unavailable,
    };
  }

  const result = await addRavMessageSubscriber({
    fullName: values.full_name,
    email: values.email,
  });

  if (!result.ok) {
    return {
      success: false,
      error: NEWSLETTER_SIGNUP_ERRORS.generic,
    };
  }

  return { success: true };
}
