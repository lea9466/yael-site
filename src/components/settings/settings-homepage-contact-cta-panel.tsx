"use client";

import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { HOMEPAGE_CONTACT_CTA_TEXT_MAX } from "@/lib/homepage/constants";
import type { SettingsFormState } from "@/lib/validations/site-settings";

type SettingsHomepageContactCtaPanelProps = {
  formState: SettingsFormState;
  fieldErrors: Record<string, string>;
  onChange: <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K]
  ) => void;
};

export function SettingsHomepageContactCtaPanel({
  formState,
  fieldErrors,
  onChange,
}: SettingsHomepageContactCtaPanelProps) {
  return (
    <div className="space-y-6 border-t border-[var(--color-border)] pt-8">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          &quot;טוב להיות בקשר&quot; — סקציית יצירת הקשר בדף הבית
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          הכותרת וכפתורי הפעולה קבועים בעיצוב האתר — ניתן לערוך כאן רק את
          שורת הטקסט שמופיעה מתחת לכותרת.
        </p>
      </div>

      <FormField
        label="טקסט פנייה ליצירת קשר"
        htmlFor="field-contact-cta-text"
        error={fieldErrors.homepageContactCtaText ?? fieldErrors.contactCtaText}
      >
        <Textarea
          id="field-contact-cta-text"
          value={formState.contactCtaText}
          rows={3}
          maxLength={HOMEPAGE_CONTACT_CTA_TEXT_MAX}
          error={Boolean(
            fieldErrors.homepageContactCtaText ?? fieldErrors.contactCtaText
          )}
          onChange={(event) => onChange("contactCtaText", event.target.value)}
        />
      </FormField>
    </div>
  );
}
