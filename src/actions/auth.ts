"use server";

import { cookies } from "next/headers";

import { ADMIN_LAST_ACTIVITY_COOKIE } from "@/lib/auth/constants";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import {
  createActionClient,
  createClient,
  verifyAdminAfterLogin,
} from "@/lib/auth/session";
import type { LoginResult, LogoutResult } from "@/lib/auth/types";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? AUTH_ERRORS.generic,
    };
  }

  try {
    const supabase = await createActionClient(parsed.data.rememberMe);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return {
        success: false,
        error: AUTH_ERRORS.invalidCredentials,
      };
    }

    const adminUser = await verifyAdminAfterLogin(parsed.data.rememberMe);

    if (!adminUser) {
      return {
        success: false,
        error: AUTH_ERRORS.unauthorized,
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: AUTH_ERRORS.generic,
    };
  }
}

export async function logoutAction(): Promise<LogoutResult> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_LAST_ACTIVITY_COOKIE);

    return { success: true };
  } catch {
    return {
      success: false,
      error: AUTH_ERRORS.generic,
    };
  }
}
