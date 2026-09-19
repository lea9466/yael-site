"use server";

import { cookies } from "next/headers";

import { ADMIN_LAST_ACTIVITY_COOKIE } from "@/lib/auth/constants";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import {
  createActionClient,
  createClient,
  createPublicClient,
  getAuthenticatedAdmin,
  verifyAdminAfterLogin,
} from "@/lib/auth/session";
import type {
  ChangePasswordResult,
  LoginResult,
  LogoutResult,
} from "@/lib/auth/types";
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordInput,
  type LoginInput,
} from "@/lib/validations/auth";

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
  } catch (err) {
    console.error("[auth] loginAction threw", err);
    return {
      success: false,
      error: AUTH_ERRORS.generic,
    };
  }
}

export async function changePasswordAction(
  input: ChangePasswordInput
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? AUTH_ERRORS.generic,
    };
  }

  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return { success: false, error: AUTH_ERRORS.unauthorized };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, error: AUTH_ERRORS.unauthorized };
    }

    // Verify the current password on a cookie-less client so the check can
    // never touch (or replace) the session stored in this browser.
    const { error: verifyError } = await createPublicClient().auth.signInWithPassword(
      {
        email: user.email,
        password: parsed.data.currentPassword,
      }
    );

    if (verifyError) {
      const isWrongPassword =
        verifyError.code === "invalid_credentials" || verifyError.status === 400;

      return {
        success: false,
        error: isWrongPassword
          ? AUTH_ERRORS.currentPasswordInvalid
          : AUTH_ERRORS.generic,
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (updateError) {
      if (updateError.code === "same_password") {
        return { success: false, error: AUTH_ERRORS.passwordSame };
      }

      if (updateError.code === "weak_password") {
        return { success: false, error: AUTH_ERRORS.passwordWeak };
      }

      console.error("[auth] changePasswordAction updateUser failed", {
        code: updateError.code,
        status: updateError.status,
      });
      return { success: false, error: AUTH_ERRORS.generic };
    }

    // Anyone else signed in with the old password (or the verification session
    // above) is logged out; this browser stays signed in.
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "others",
    });

    if (signOutError) {
      console.error("[auth] changePasswordAction signOut(others) failed", {
        code: signOutError.code,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("[auth] changePasswordAction threw", err);
    return { success: false, error: AUTH_ERRORS.generic };
  }
}

export async function logoutAction(): Promise<LogoutResult> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_LAST_ACTIVITY_COOKIE);

    return { success: true };
  } catch (err) {
    console.error("[auth] logoutAction threw", err);
    return {
      success: false,
      error: AUTH_ERRORS.generic,
    };
  }
}
