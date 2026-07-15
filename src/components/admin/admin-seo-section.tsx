"use client";

import { ChevronDown } from "lucide-react";

import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildAutoSeoTitle,
  shortenForSeoDescription,
} from "@/lib/seo/resolve";
import { cn } from "@/lib/utils/cn";

type SelectedMedia = {
  id: string;
  url: string;
  alt: string;
};

type AdminSeoSectionProps = {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seoTitle: string;
  seoDescription: string;
  ogMediaId: string | null;
  ogPreview: SelectedMedia | null;
  titleSource: string;
  descriptionSource: string;
  fieldErrors: Record<string, string>;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onOgMediaChange: (mediaId: string | null, preview: SelectedMedia | null) => void;
  className?: string;
};

export function AdminSeoSection({
  id = "section-seo-advanced",
  open,
  onOpenChange,
  seoTitle,
  seoDescription,
  ogMediaId,
  ogPreview,
  titleSource,
  descriptionSource,
  fieldErrors,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onOgMediaChange,
  className,
}: AdminSeoSectionProps) {
  return (
    <section
      id={id}
      className={cn("admin-form-section border-b-0 pb-0", className)}
    >
      <button
        type="button"
        className="admin-interactive flex w-full items-center justify-between gap-4 py-2 text-start"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <div className="space-y-2">
          <h2 className="text-section-title">אפשרויות SEO מתקדמות</h2>
          <p className="text-muted">
            בדרך כלל אין צורך לערוך — הערכים נוצרים אוטומטית מהתוכן.
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-8 space-y-6 border-t border-[var(--color-border)]/60 pt-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            אם לא תמלאו שדות כאן, המערכת תשתמש בכותרת, בתיאור ובתמונת הכיסוי
            לצורך SEO. כתובת קנונית נוצרת אוטומטית.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onSeoTitleChange(buildAutoSeoTitle(titleSource));
                onSeoDescriptionChange(
                  shortenForSeoDescription(descriptionSource)
                );
              }}
            >
              מילוי אוטומטי
            </Button>
          </div>

          <FormField
            label="כותרת SEO"
            htmlFor="field-seo-title"
            hint="אופציונלי"
            error={fieldErrors["seo.title"]}
          >
            <Input
              id="field-seo-title"
              value={seoTitle}
              placeholder="נוצר אוטומטית מהכותרת"
              error={Boolean(fieldErrors["seo.title"])}
              onChange={(event) => onSeoTitleChange(event.target.value)}
            />
          </FormField>

          <FormField
            label="תיאור SEO"
            htmlFor="field-seo-description"
            hint="אופציונלי"
            error={fieldErrors["seo.description"]}
          >
            <Textarea
              id="field-seo-description"
              value={seoDescription}
              placeholder="נוצר אוטומטית מהתיאור"
              error={Boolean(fieldErrors["seo.description"])}
              onChange={(event) => onSeoDescriptionChange(event.target.value)}
            />
          </FormField>

          <ServiceMediaPicker
            fieldId="field-seo-og-media"
            label="תמונת OG"
            description="אופציונלי. אם לא נבחרה, תוצג תמונת הכיסוי."
            value={ogMediaId}
            preview={ogPreview}
            variant="minimal"
            error={fieldErrors.seo_og_media_id}
            onChange={onOgMediaChange}
          />
        </div>
      ) : null}
    </section>
  );
}
