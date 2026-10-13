"use server";

import { cookies } from "next/headers";

import {
  ADMIN_LAST_ACTIVITY_COOKIE,
  adminActivityCookieOptions,
} from "@/lib/auth/constants";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset-email";
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
  RequestPasswordResetResult,
  ResetPasswordResult,
} from "@/lib/auth/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
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

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Emails a one-time reset link, but only to addresses that belong to an admin.
 * Always reports success for unknown addresses so the form can't be used to
 * discover which emails have admin access.
 */
export async function requestPasswordResetAction(
  input: ForgotPasswordInput
): Promise<RequestPasswordResetResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? AUTH_ERRORS.generic,
    };
  }

  try {
    const serviceClient = createServiceRoleClient();

    if (!serviceClient) {
      console.error("[auth] requestPasswordResetAction: missing service role key");
      return { success: false, error: AUTH_ERRORS.generic };
    }

    const { data: adminUser, error: lookupError } = await serviceClient
      .from("admin_users")
      .select("email")
      .ilike("email", escapeLikePattern(parsed.data.email))
      .maybeSingle();

    if (lookupError) {
      console.error("[auth] requestPasswordResetAction lookup failed", {
        code: lookupError.code,
      });
      return { success: false, error: AUTH_ERRORS.generic };
    }

    if (!adminUser?.email) {
      return { success: true };
    }

    // generateLink only creates the token; we send our own Hebrew email so the
    // link works from any device and doesn't depend on Supabase's mailer.
    const { data: linkData, error: linkError } =
      await serviceClient.auth.admin.generateLink({
        type: "recovery",
        email: adminUser.email,
      });

    const tokenHash = linkData?.properties?.hashed_token;

    if (linkError || !tokenHash) {
      console.error("[auth] requestPasswordResetAction generateLink failed", {
        code: linkError?.code,
      });
      return { success: false, error: AUTH_ERRORS.generic };
    }

    const sent = await sendPasswordResetEmail(adminUser.email, tokenHash);

    if (!sent) {
      return { success: false, error: AUTH_ERRORS.generic };
    }

    return { success: true };
  } catch (err) {
    console.error("[auth] requestPasswordResetAction threw", err);
    return { success: false, error: AUTH_ERRORS.generic };
  }
}

/**
 * The token is redeemed only here, on submit — never on page load — so email
 * scanners that prefetch the link can't burn it.
 */
export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? AUTH_ERRORS.generic,
    };
  }

  try {
    const supabase = await createActionClient(false);
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: parsed.data.tokenHash,
    });

    const user = otpData?.user;

    if (otpError || !user) {
      return { success: false, error: AUTH_ERRORS.resetLinkInvalid };
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminUser) {
      await supabase.auth.signOut();
      return { success: false, error: AUTH_ERRORS.unauthorized };
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

      console.error("[auth] resetPasswordAction updateUser failed", {
        code: updateError.code,
        status: updateError.status,
      });
      return { success: false, error: AUTH_ERRORS.generic };
    }

    // Whoever knew the old password is signed out everywhere else.
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "others",
    });

    if (signOutError) {
      console.error("[auth] resetPasswordAction signOut(others) failed", {
        code: signOutError.code,
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_LAST_ACTIVITY_COOKIE,
      String(Date.now()),
      adminActivityCookieOptions
    );

    return { success: true };
  } catch (err) {
    console.error("[auth] resetPasswordAction threw", err);
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
