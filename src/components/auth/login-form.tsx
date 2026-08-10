"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

type LoginFormProps = {
  initialMessage?: string;
};

export function LoginForm({ initialMessage }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(initialMessage ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError("");

    startTransition(async () => {
      const result = await loginAction(values);

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
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/20">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          כניסה למערכת הניהול
        </h1>
        <p className="text-sm text-gray-600">
          התחברות למנהלת האתר בלבד
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
          )}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          סיסמה
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            dir="ltr"
            className={cn(
              "w-full rounded-xl border border-gray-200 px-4 py-3 pe-12 text-sm outline-none transition-all duration-200",
              "focus:border-green-500 focus:ring-2 focus:ring-green-500/10 bg-white/50",
              errors.password && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 end-3 my-auto rounded px-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 rounded border-gray-300 text-green-600 focus:ring-green-500/30 focus:ring-offset-0"
          {...register("rememberMe")}
        />
        זכור אותי
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-green-900/20",
          "hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-900/30 disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isPending ? "מתחבר..." : "התחברות"}
      </button>
    </form>
  );
}
