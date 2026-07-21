import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTACT_FORM_RATE_LIMIT_MAX = 5;
export const CONTACT_FORM_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type ContactFormRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "rate_limited" | "unavailable" };

function hashBucketKey(raw: string): string {
  return createHash("sha256").update(`contact-form:${raw}`).digest("hex");
}

/**
 * Durable contact-form rate limit (5 hits / 10 minutes per hashed IP bucket).
 * Uses service-role client against contact_form_rate_limits.
 */
export async function consumeContactFormRateLimit(
  supabase: SupabaseClient,
  clientIp: string
): Promise<ContactFormRateLimitResult> {
  const bucketKey = hashBucketKey(clientIp || "unknown");
  const now = Date.now();
  const windowStartIso = new Date(
    now - CONTACT_FORM_RATE_LIMIT_WINDOW_MS
  ).toISOString();

  const { data: existing, error: readError } = await supabase
    .from("contact_form_rate_limits")
    .select("bucket_key, window_started_at, hit_count")
    .eq("bucket_key", bucketKey)
    .maybeSingle();

  if (readError) {
    console.error("[contact-form] rate-limit read failed", {
      at: new Date().toISOString(),
      code: readError.code,
    });
    return { ok: false, reason: "unavailable" };
  }

  if (!existing) {
    const { error: insertError } = await supabase
      .from("contact_form_rate_limits")
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

      console.error("[contact-form] rate-limit insert failed", {
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
      .from("contact_form_rate_limits")
      .update({
        window_started_at: new Date(now).toISOString(),
        hit_count: 1,
        updated_at: new Date(now).toISOString(),
      })
      .eq("bucket_key", bucketKey);

    if (resetError) {
      console.error("[contact-form] rate-limit reset failed", {
        at: new Date().toISOString(),
        code: resetError.code,
      });
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true };
  }

  if (existing.hit_count >= CONTACT_FORM_RATE_LIMIT_MAX) {
    return { ok: false, reason: "rate_limited" };
  }

  const { error: updateError } = await supabase
    .from("contact_form_rate_limits")
    .update({
      hit_count: existing.hit_count + 1,
      updated_at: new Date(now).toISOString(),
    })
    .eq("bucket_key", bucketKey)
    .eq("hit_count", existing.hit_count);

  if (updateError) {
    console.error("[contact-form] rate-limit update failed", {
      at: new Date().toISOString(),
      code: updateError.code,
    });
    return { ok: false, reason: "unavailable" };
  }

  return { ok: true };
}
