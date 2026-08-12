import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_LAST_ACTIVITY_COOKIE, adminActivityCookieOptions } from "@/lib/auth/constants";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import type { AdminUser } from "@/lib/auth/types";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export async function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Missing Supabase environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  });
}

export function createPublicClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: async () => [],
      setAll: async () => {},
    },
  });
}

export async function createActionClient(rememberMe: boolean) {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Missing Supabase environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions =
            rememberMe === false
              ? {
                  ...options,
                  maxAge: undefined,
                  expires: undefined,
                }
              : options;

          cookieStore.set(name, value, cookieOptions);
        });
      },
    },
  });
}

async function fetchAdminUser(userId: string): Promise<AdminUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return fetchAdminUser(user.id);
}

export async function requireAdmin(): Promise<AdminUser> {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminUser = await fetchAdminUser(user.id);

  if (!adminUser) {
    await supabase.auth.signOut();
    redirect(`/login?reason=unauthorized`);
  }

  return adminUser;
}

export async function verifyAdminAfterLogin(
  rememberMe: boolean
): Promise<AdminUser | null> {
  const supabase = await createActionClient(rememberMe);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminUser = await fetchAdminUser(user.id);

  if (!adminUser) {
    await supabase.auth.signOut();
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_LAST_ACTIVITY_COOKIE,
    String(Date.now()),
    adminActivityCookieOptions
  );

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  return adminUser;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("admin_users").select("id").limit(1);

    return !error;
  } catch {
    return false;
  }
}

export { AUTH_ERRORS };
