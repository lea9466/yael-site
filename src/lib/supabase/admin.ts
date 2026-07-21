import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getServiceRoleEnv(): { url: string; serviceRoleKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

/**
 * Server-only Supabase client with the service role key.
 * Bypasses RLS — use only for trusted server operations (e.g. contact form insert).
 * Never import this from Client Components.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const env = getServiceRoleEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
