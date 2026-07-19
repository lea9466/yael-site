"use client";

import { MediaPreviewRender } from "@/components/media/media-preview-render";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HOMEPAGE_HERO_MEDIA_TYPES,
  HOMEPAGE_HERO_SUBTITLE_MAX,
  HOMEPAGE_HERO_TITLE_MAX,
  HOMEPAGE_HERO_BUTTON_LABEL_MAX,
} from "@/lib/homepage/constants";
import {
  getHeroVideoWeightHintMessage,
  shouldShowHeroVideoWeightHint,
} from "@/lib/homepage/hero-video-hint";
import type { SettingsFormState, SettingsMediaPreview } from "@/lib/validations/site-settings";
import { cn } from "@/lib/utils/cn";

type SettingsHomepageHeroPanelProps = {
  formState: SettingsFormState;
  fieldErrors: Record<string, string>;
  heroPreview: SettingsMediaPreview | null;
  heroMobilePreview: SettingsMediaPreview | null;
  onChange: <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K]
  ) => void;
  onHeroImageChange: (
    mediaId: string | null,
    preview: SettingsMediaPreview | null
  ) => void;
  onHeroMobileImageChange: (
    mediaId: string | null,
    preview: SettingsMediaPreview | null
  ) => void;
};

const MEDIA_TYPE_LABELS: Record<
  (typeof HOMEPAGE_HERO_MEDIA_TYPES)[number],
  string
> = {
  image: "תמונה",
  video_url: "וידאו חיצוני",
  animation_url: "אנימציה חיצונית",
};

function HeroVideoWeightHint({
  preview,
}: {
  preview: SettingsMediaPreview | null;
}) {
  if (!shouldShowHeroVideoWeightHint(preview)) {
    return null;
  }

  return (
    <p
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-caption text-[var(--color-text-muted)]"
      role="note"
    >
      {getHeroVideoWeightHintMessage(preview)}
    </p>
  );
}

function CharacterCount({
  value,
  max,
}: {
  value: string;
  max: number;
}) {
  return (
    <p className="text-caption text-[var(--color-text-muted)]" aria-live="polite">
      {value.length}/{max}
    </p>
  );
}

function HeroLivePreview({
  formState,
  heroPreview,
}: {
  formState: SettingsFormState;
  heroPreview: SettingsMediaPreview | null;
}) {
  const hasSecondary =
    formState.heroSecondaryButtonLabel.trim().length > 0 &&
    formState.heroSecondaryButtonUrl.trim().length > 0;

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-light-sage-soft)_0%,var(--color-cream)_55%,var(--color-surface)_100%)]">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
          <p className="text-caption font-medium text-[var(--color-text-muted)]">
            תצוגה מקדימה
          </p>
          <h3 className="text-2xl font-semibold leading-tight text-[var(--color-primary)] sm:text-3xl">
            {formState.heroTitle || "כותרת ראשית"}
          </h3>
          <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">
            {formState.heroSubtitle || "כותרת משנה"}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex h-11 items-center rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-text-on-primary)]">
              {formState.heroPrimaryButtonLabel || "כפתור ראשי"}
            </span>
            {hasSecondary ? (
              <span className="inline-flex h-11 items-center rounded-[var(--radius-full)] border border-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-primary)]">
                {formState.heroSecondaryButtonLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[220px] bg-[var(--color-surface-soft)] lg:min-h-[320px]">
          {formState.heroMediaType === "image" && heroPreview?.url ? (
            <MediaPreviewRender
              url={heroPreview.url}
              alt={heroPreview.alt}
              mimeType={heroPreview.mimeType ?? "image/webp"}
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : formState.heroMediaType === "video_url" &&
            formState.heroVideoUrl.trim() ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-sm font-medium text-[var(--color-text)]">
                וידאו חיצוני
              </p>
              <p className="break-all text-caption text-[var(--color-text-muted)]" dir="ltr">
                {formState.heroVideoUrl}
              </p>
            </div>
          ) : formState.heroMediaType === "animation_url" &&
            formState.heroAnimationUrl.trim() ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-sm font-medium text-[var(--color-text)]">
                אנימציה חיצונית
              </p>
              <p className="break-all text-caption text-[var(--color-text-muted)]" dir="ltr">
                {formState.heroAnimationUrl}
              </p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[var(--color-text-muted)]">
              בחרו מדיה ל-Hero
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsHomepageHeroPanel({
  formState,
  fieldErrors,
  heroPreview,
  heroMobilePreview,
  onChange,
  onHeroImageChange,
  onHeroMobileImageChange,
}: SettingsHomepageHeroPanelProps) {
  return (
    <div className="space-y-8">
      <HeroLivePreview formState={formState} heroPreview={heroPreview} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FormField
          label="כותרת ראשית"
          htmlFor="field-hero-title"
          error={fieldErrors["hero.title"] ?? fieldErrors.heroTitle}
        >
          <Input
            id="field-hero-title"
            value={formState.heroTitle}
            error={Boolean(fieldErrors["hero.title"] ?? fieldErrors.heroTitle)}
            onChange={(event) => onChange("heroTitle", event.target.value)}
          />
          <CharacterCount
            value={formState.heroTitle}
            max={HOMEPAGE_HERO_TITLE_MAX}
          />
        </FormField>

        <FormField
          label="כותרת משנה"
          htmlFor="field-hero-subtitle"
          error={fieldErrors["hero.subtitle"] ?? fieldErrors.heroSubtitle}
        >
          <Textarea
            id="field-hero-subtitle"
            value={formState.heroSubtitle}
            error={Boolean(
              fieldErrors["hero.subtitle"] ?? fieldErrors.heroSubtitle
            )}
            onChange={(event) => onChange("heroSubtitle", event.target.value)}
          />
          <CharacterCount
            value={formState.heroSubtitle}
            max={HOMEPAGE_HERO_SUBTITLE_MAX}
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-text)]">
          כפתור ראשי
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="תווית"
            htmlFor="field-hero-primary-label"
            error={
              fieldErrors["hero.primary_button.label"] ??
              fieldErrors.heroPrimaryButtonLabel
            }
          >
            <Input
              id="field-hero-primary-label"
              value={formState.heroPrimaryButtonLabel}
              error={Boolean(
                fieldErrors["hero.primary_button.label"] ??
                  fieldErrors.heroPrimaryButtonLabel
              )}
              onChange={(event) =>
                onChange("heroPrimaryButtonLabel", event.target.value)
              }
            />
            <CharacterCount
              value={formState.heroPrimaryButtonLabel}
              max={HOMEPAGE_HERO_BUTTON_LABEL_MAX}
            />
          </FormField>

          <FormField
            label="קישור"
            htmlFor="field-hero-primary-url"
            hint="ניתן להזין קישור פנימי או חיצוני"
            error={
              fieldErrors["hero.primary_button.url"] ??
              fieldErrors.heroPrimaryButtonUrl
            }
          >
            <Input
              id="field-hero-primary-url"
              dir="ltr"
              value={formState.heroPrimaryButtonUrl}
              error={Boolean(
                fieldErrors["hero.primary_button.url"] ??
                  fieldErrors.heroPrimaryButtonUrl
              )}
              onChange={(event) =>
                onChange("heroPrimaryButtonUrl", event.target.value)
              }
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-text)]">
          כפתור משני
        </h3>
        <p className="text-caption text-[var(--color-text-muted)]">
          אופציונלי — הכפתור יוצג רק כשגם התווית וגם הקישור מלאים.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="תווית"
            htmlFor="field-hero-secondary-label"
            hint="אופציונלי"
            error={
              fieldErrors["hero.secondary_button.label"] ??
              fieldErrors.heroSecondaryButtonLabel
            }
          >
            <Input
              id="field-hero-secondary-label"
              value={formState.heroSecondaryButtonLabel}
              error={Boolean(
                fieldErrors["hero.secondary_button.label"] ??
                  fieldErrors.heroSecondaryButtonLabel
              )}
              onChange={(event) =>
                onChange("heroSecondaryButtonLabel", event.target.value)
              }
            />
          </FormField>

          <FormField
            label="קישור"
            htmlFor="field-hero-secondary-url"
            hint="נדרש רק אם הוזנה תווית"
            error={
              fieldErrors["hero.secondary_button.url"] ??
              fieldErrors.heroSecondaryButtonUrl
            }
          >
            <Input
              id="field-hero-secondary-url"
              dir="ltr"
              value={formState.heroSecondaryButtonUrl}
              error={Boolean(
                fieldErrors["hero.secondary_button.url"] ??
                  fieldErrors.heroSecondaryButtonUrl
              )}
              onChange={(event) =>
                onChange("heroSecondaryButtonUrl", event.target.value)
              }
            />
          </FormField>
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-[var(--color-text)]">
          סוג מדיה ב-Hero
        </legend>
        <div className="flex flex-wrap gap-3">
          {HOMEPAGE_HERO_MEDIA_TYPES.map((mediaType) => {
            const checked = formState.heroMediaType === mediaType;

            return (
              <label
                key={mediaType}
                className={cn(
                  "admin-interactive inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-full)] px-4 py-2.5 text-sm font-medium ring-1",
                  checked
                    ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] ring-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-[var(--color-border)] hover:text-[var(--color-text)]"
                )}
              >
                <input
                  type="radio"
                  name="hero-media-type"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onChange("heroMediaType", mediaType)}
                />
                {MEDIA_TYPE_LABELS[mediaType]}
              </label>
            );
          })}
        </div>
        {fieldErrors["hero.media_type"] ?? fieldErrors.heroMediaType ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {fieldErrors["hero.media_type"] ?? fieldErrors.heroMediaType}
          </p>
        ) : null}
      </fieldset>

      {formState.heroMediaType === "image" ? (
        <div className="space-y-8">
          <ServiceMediaPicker
            fieldId="field-hero-desktop-media"
            label="Hero לדסקטופ"
            description="בחרו תמונה או וידאו מספריית המדיה או העלו קובץ חדש"
            value={formState.heroMediaId}
            preview={heroPreview}
            required
            error={fieldErrors["hero.media_id"] ?? fieldErrors.heroMediaId}
            onChange={onHeroImageChange}
          />
          <HeroVideoWeightHint preview={heroPreview} />

          <ServiceMediaPicker
            fieldId="field-hero-mobile-media"
            label="Hero למובייל"
            description="אופציונלי — אם לא נבחרה מדיה למובייל, יוצג הקובץ של הדסקטופ."
            value={formState.heroMobileMediaId}
            preview={heroMobilePreview}
            error={
              fieldErrors["hero.mobile_media_id"] ?? fieldErrors.heroMobileMediaId
            }
            onChange={onHeroMobileImageChange}
          />
          <HeroVideoWeightHint preview={heroMobilePreview} />
        </div>
      ) : null}

      {formState.heroMediaType === "video_url" ? (
        <FormField
          label="כתובת וידאו חיצונית"
          htmlFor="field-hero-video-url"
          hint="הזינו קישור https לווידאו חיצוני — ללא העלאה לספריית המדיה"
          error={fieldErrors["hero.video_url"] ?? fieldErrors.heroVideoUrl}
        >
          <Input
            id="field-hero-video-url"
            type="url"
            dir="ltr"
            placeholder="https://"
            value={formState.heroVideoUrl}
            error={Boolean(
              fieldErrors["hero.video_url"] ?? fieldErrors.heroVideoUrl
            )}
            onChange={(event) => onChange("heroVideoUrl", event.target.value)}
          />
        </FormField>
      ) : null}

      {formState.heroMediaType === "animation_url" ? (
        <FormField
          label="כתובת אנימציה חיצונית"
          htmlFor="field-hero-animation-url"
          hint="הזינו קישור https לאנימציה חיצונית"
          error={
            fieldErrors["hero.animation_url"] ?? fieldErrors.heroAnimationUrl
          }
        >
          <Input
            id="field-hero-animation-url"
            type="url"
            dir="ltr"
            placeholder="https://"
            value={formState.heroAnimationUrl}
            error={Boolean(
              fieldErrors["hero.animation_url"] ?? fieldErrors.heroAnimationUrl
            )}
            onChange={(event) =>
              onChange("heroAnimationUrl", event.target.value)
            }
          />
        </FormField>
      ) : null}

      <p className="text-caption text-[var(--color-text-muted)]">
        סדר מקטעי דף הבית, מספר הפריטים בכל מקטע וקישורי הניווט נשארים קבועים
        בקוד ואינם ניתנים לעריכה מכאן.
      </p>
    </div>
  );
}
