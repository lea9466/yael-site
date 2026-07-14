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
      className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-brand-beige/60 bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-brand-green-deep">
          כניסה למערכת הניהול
        </h1>
        <p className="text-sm text-brand-green-olive">
          התחברות למנהלת האתר בלבד
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-brand-coral/40 bg-brand-coral/10 px-4 py-3 text-sm text-brand-green-deep"
        >
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-brand-green-deep">
          אימייל
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors",
            "border-brand-beige focus:border-brand-green-olive focus:ring-2 focus:ring-brand-green-olive/20",
            errors.email && "border-brand-coral"
          )}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-brand-coral">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-brand-green-deep"
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
              "w-full rounded-lg border px-4 py-3 pe-12 text-sm outline-none transition-colors",
              "border-brand-beige focus:border-brand-green-olive focus:ring-2 focus:ring-brand-green-olive/20",
              errors.password && "border-brand-coral"
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 end-3 my-auto rounded px-2 text-sm text-brand-green-olive hover:text-brand-green-deep"
            aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
          >
            {showPassword ? "הסתר" : "הצג"}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-brand-coral">{errors.password.message}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-green-deep">
        <input
          type="checkbox"
          className="size-4 rounded border-brand-beige text-brand-green-deep focus:ring-brand-green-olive/30"
          {...register("rememberMe")}
        />
        זכור אותי
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "rounded-lg bg-brand-green-deep px-4 py-3 text-sm font-medium text-white transition-colors",
          "hover:bg-brand-green-olive disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isPending ? "מתחבר..." : "התחברות"}
      </button>
    </form>
  );
}
