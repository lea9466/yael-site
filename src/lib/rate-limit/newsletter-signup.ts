import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

export const NEWSLETTER_SIGNUP_RATE_LIMIT_MAX = 5;
export const NEWSLETTER_SIGNUP_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type NewsletterSignupRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "rate_limited" | "unavailable" };

function hashBucketKey(raw: string): string {
  return createHash("sha256").update(`newsletter-signup:${raw}`).digest("hex");
}

/**
 * Durable newsletter-signup rate limit (5 hits / 10 minutes per hashed IP
 * bucket). Uses service-role client against newsletter_signup_rate_limits.
 */
export async function consumeNewsletterSignupRateLimit(
  supabase: SupabaseClient,
  clientIp: string
): Promise<NewsletterSignupRateLimitResult> {
  const bucketKey = hashBucketKey(clientIp || "unknown");
  const now = Date.now();
  const windowStartIso = new Date(
    now - NEWSLETTER_SIGNUP_RATE_LIMIT_WINDOW_MS
  ).toISOString();

  const { data: existing, error: readError } = await supabase
    .from("newsletter_signup_rate_limits")
    .select("bucket_key, window_started_at, hit_count")
    .eq("bucket_key", bucketKey)
    .maybeSingle();

  if (readError) {
    console.error("[newsletter-signup] rate-limit read failed", {
      at: new Date().toISOString(),
      code: readError.code,
    });
    return { ok: false, reason: "unavailable" };
  }

  if (!existing) {
    const { error: insertError } = await supabase
      .from("newsletter_signup_rate_limits")
      .insert({
        bucket_key: bucketKey,
        window_started_at: new Date(now).toISOString(),
        hit_count: 1,
        updated_at: new Date(now).toISOString(),
      });

    if (insertError) {
      // Concurrent first insert — treat as one hit and continue.
      if (insertError.code === "23505") {
        return { ok: true };
      }

      console.error("[newsletter-signup] rate-limit insert failed", {
        at: new Date().toISOString(),
        code: insertError.code,
      });
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true };
  }

  const windowStartedAt = new Date(existing.window_started_at).getTime();
  const isExpired =
    Number.isNaN(windowStartedAt) || windowStartedAt < Date.parse(windowStartIso);

  if (isExpired) {
    const { error: resetError } = await supabase
      .from("newsletter_signup_rate_limits")
      .update({
        window_started_at: new Date(now).toISOString(),
        hit_count: 1,
        updated_at: new Date(now).toISOString(),
      })
      .eq("bucket_key", bucketKey);

    if (resetError) {
      console.error("[newsletter-signup] rate-limit reset failed", {
        at: new Date().toISOString(),
        code: resetError.code,
      });
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true };
  }

  if (existing.hit_count >= NEWSLETTER_SIGNUP_RATE_LIMIT_MAX) {
    return { ok: false, reason: "rate_limited" };
  }

  const { error: updateError } = await supabase
    .from("newsletter_signup_rate_limits")
    .update({
      hit_count: existing.hit_count + 1,
      updated_at: new Date(now).toISOString(),
    })
    .eq("bucket_key", bucketKey)
    .eq("hit_count", existing.hit_count);

  if (updateError) {
    console.error("[newsletter-signup] rate-limit update failed", {
      at: new Date().toISOString(),
      code: updateError.code,
    });
    return { ok: false, reason: "unavailable" };
  }

  return { ok: true };
}
