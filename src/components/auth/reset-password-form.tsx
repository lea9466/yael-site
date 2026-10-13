"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { resetPasswordAction } from "@/actions/auth";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { cn } from "@/lib/utils/cn";
import {
  PASSWORD_MIN_LENGTH,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  tokenHash: string;
};

const inputClassName =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 bg-white/50";
const inputErrorClassName =
  "border-red-300 focus:border-red-500 focus:ring-red-500/10";

export function ResetPasswordForm({ tokenHash }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPasswords, setShowPasswords] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { tokenHash, newPassword: "", confirmPassword: "" },
  });

  const inputType = showPasswords ? "text" : "password";
  const linkExpired = formError === AUTH_ERRORS.resetLinkInvalid;

  const onSubmit = handleSubmit((values) => {
    setFormError("");

    startTransition(async () => {
      const result = await resetPasswordAction(values);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-green-900/10 sm:p-10"
      noValidate
    >
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold text-gray-800">בחירת סיסמה חדשה</h1>
        <p className="text-sm text-gray-600">
          לפחות {PASSWORD_MIN_LENGTH} תווים. אחרי השמירה תיכנסי ישר למערכת.
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{formError}</p>
          {linkExpired ? (
            <Link
              href="/login/forgot-password"
              className="font-semibold underline"
            >
              שליחת קישור חדש
            </Link>
          ) : null}
        </div>
      ) : null}

      <input type="hidden" {...register("tokenHash")} />

      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700"
        >
          סיסמה חדשה
        </label>
        <input
          id="newPassword"
          type={inputType}
          autoComplete="new-password"
          dir="ltr"
          className={cn(inputClassName, errors.newPassword && inputErrorClassName)}
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          אישור הסיסמה החדשה
        </label>
        <input
          id="confirmPassword"
          type={inputType}
          autoComplete="new-password"
          dir="ltr"
          className={cn(
            inputClassName,
            errors.confirmPassword && inputErrorClassName
          )}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(event) => setShowPasswords(event.target.checked)}
          className="size-4 rounded border-gray-300 text-green-600 focus:ring-green-500/30 focus:ring-offset-0"
        />
        הצגת הסיסמאות
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-green-900/20",
          "hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-900/30 disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isPending ? "שומר..." : "שמירת הסיסמה"}
      </button>
    </form>
  );
}
