"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { requestPasswordResetAction } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError("");

    startTransition(async () => {
      const result = await requestPasswordResetAction(values);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      setIsSent(true);
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-green-900/10 sm:p-10"
      noValidate
    >
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold text-gray-800">שכחת סיסמה?</h1>
        <p className="text-sm text-gray-600">
          נשלח לך קישור לבחירת סיסמה חדשה לאימייל של מערכת הניהול
        </p>
      </div>

      {isSent ? (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-relaxed text-green-800"
        >
          אם הכתובת שייכת למערכת הניהול, ישלח אליה תוך כמה דקות מייל עם קישור
          לאיפוס. כדאי לבדוק גם בתיקיית הספאם.
        </p>
      ) : (
        <>
          {formError ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              אימייל
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              className={cn(
                "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-200",
                "focus:border-green-500 focus:ring-2 focus:ring-green-500/10 bg-white/50",
                errors.email &&
                  "border-red-300 focus:border-red-500 focus:ring-red-500/10"
              )}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-green-900/20",
              "hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-900/30 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isPending ? "שולח..." : "שליחת קישור לאיפוס"}
          </button>
        </>
      )}

      <Link
        href="/login"
        className="text-center text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
      >
        חזרה לכניסה
      </Link>
    </form>
  );
}
