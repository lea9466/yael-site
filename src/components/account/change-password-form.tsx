"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { changePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  PASSWORD_MIN_LENGTH,
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/auth";

const EMPTY_VALUES: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [showPasswords, setShowPasswords] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_VALUES,
  });

  const inputType = showPasswords ? "text" : "password";

  const onSubmit = handleSubmit((values) => {
    setFormError("");
    setIsSaved(false);

    startTransition(async () => {
      const result = await changePasswordAction(values);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      reset(EMPTY_VALUES);
      setIsSaved(true);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[var(--color-error-soft)] px-4 py-3 text-sm font-medium text-[var(--color-error)]"
        >
          {formError}
        </p>
      ) : null}

      {isSaved ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]"
        >
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          הסיסמה עודכנה בהצלחה
        </p>
      ) : null}

      <FormField
        label="סיסמה נוכחית"
        htmlFor="current-password"
        required
        error={errors.currentPassword?.message}
      >
        <Input
          id="current-password"
          type={inputType}
          dir="ltr"
          autoComplete="current-password"
          error={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        label="סיסמה חדשה"
        htmlFor="new-password"
        required
        hint={`לפחות ${PASSWORD_MIN_LENGTH} תווים. כדאי משפט או שילוב מילים שקל לזכור.`}
        error={errors.newPassword?.message}
      >
        <Input
          id="new-password"
          type={inputType}
          dir="ltr"
          autoComplete="new-password"
          error={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        label="אישור סיסמה חדשה"
        htmlFor="confirm-password"
        required
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirm-password"
          type={inputType}
          dir="ltr"
          autoComplete="new-password"
          error={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </FormField>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          loading={isPending}
          loadingText="מעדכנת..."
        >
          עדכון סיסמה
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowPasswords((current) => !current)}
          aria-pressed={showPasswords}
        >
          {showPasswords ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
          {showPasswords ? "הסתרת הסיסמאות" : "הצגת הסיסמאות"}
        </Button>
      </div>
    </form>
  );
}
