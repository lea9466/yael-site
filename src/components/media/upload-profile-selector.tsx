"use client";

import {
  UPLOAD_PROFILES,
  UPLOAD_PROFILE_UI,
  type UploadProfile,
} from "@/lib/media/upload-profiles";
import { cn } from "@/lib/utils/cn";

type UploadProfileSelectorProps = {
  value: UploadProfile;
  disabled?: boolean;
  name: string;
  onChange: (profile: UploadProfile) => void;
};

export function UploadProfileSelector({
  value,
  disabled = false,
  name,
  onChange,
}: UploadProfileSelectorProps) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium text-[var(--color-text)]">
        ייעוד התמונה
      </legend>

      <div
        role="radiogroup"
        aria-label="ייעוד התמונה"
        className="grid gap-3 sm:grid-cols-2"
      >
        {UPLOAD_PROFILES.map((profile) => {
          const meta = UPLOAD_PROFILE_UI[profile];
          const Icon = meta.icon;
          const isSelected = value === profile;

          return (
            <label
              key={profile}
              className={cn(
                "relative flex cursor-pointer flex-col gap-3 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-sm)] transition-colors",
                "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/40"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name={name}
                value={profile}
                checked={isSelected}
                disabled={disabled}
                className="sr-only"
                onChange={() => {
                  onChange(profile);
                }}
              />

              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                    isSelected
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-soft)] text-[var(--color-primary)]"
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </div>

                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-medium text-white"
                  >
                    נבחר
                  </span>
                ) : null}
              </div>

              <div className="space-y-1">
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  {meta.title}
                </span>
                <span className="block text-caption text-[var(--color-text-muted)]">
                  {meta.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
