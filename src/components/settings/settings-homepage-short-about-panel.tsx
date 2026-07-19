"use client";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HOMEPAGE_SHORT_ABOUT_TEXT_MAX,
  HOMEPAGE_SHORT_ABOUT_TITLE_MAX,
} from "@/lib/homepage/constants";
import type { SettingsFormState } from "@/lib/validations/site-settings";

type SettingsHomepageShortAboutPanelProps = {
  formState: SettingsFormState;
  fieldErrors: Record<string, string>;
  onChange: <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K]
  ) => void;
};

export function SettingsHomepageShortAboutPanel({
  formState,
  fieldErrors,
  onChange,
}: SettingsHomepageShortAboutPanelProps) {
  return (
    <div className="space-y-6 border-t border-[var(--color-border)] pt-8">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          אודות בדף הבית
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          כותרת וטקסט קצרים שמוצגים בסקציית האודות בדף הבית. כפתור &quot;קראי
          עוד&quot; מוביל לעמוד האודות המלא.
        </p>
      </div>

      <FormField
        label="כותרת אודות בדף הבית"
        htmlFor="field-short-about-title"
        error={
          fieldErrors["short_about.title"] ??
          fieldErrors["homepageShortAbout.title"] ??
          fieldErrors.shortAboutTitle
        }
      >
        <Input
          id="field-short-about-title"
          value={formState.shortAboutTitle}
          maxLength={HOMEPAGE_SHORT_ABOUT_TITLE_MAX}
          error={Boolean(
            fieldErrors["short_about.title"] ??
              fieldErrors["homepageShortAbout.title"] ??
              fieldErrors.shortAboutTitle
          )}
          onChange={(event) => onChange("shortAboutTitle", event.target.value)}
        />
      </FormField>

      <FormField
        label="טקסט אודות בדף הבית"
        htmlFor="field-short-about-text"
        hint="ניתן להפריד פסקאות בשורה ריקה"
        error={
          fieldErrors["short_about.text"] ??
          fieldErrors["homepageShortAbout.text"] ??
          fieldErrors.shortAboutText
        }
      >
        <Textarea
          id="field-short-about-text"
          value={formState.shortAboutText}
          rows={8}
          maxLength={HOMEPAGE_SHORT_ABOUT_TEXT_MAX}
          error={Boolean(
            fieldErrors["short_about.text"] ??
              fieldErrors["homepageShortAbout.text"] ??
              fieldErrors.shortAboutText
          )}
          onChange={(event) => onChange("shortAboutText", event.target.value)}
        />
      </FormField>
    </div>
  );
}
