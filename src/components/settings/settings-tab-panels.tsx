"use client";

import { SettingsHomepageHeroPanel } from "@/components/settings/settings-homepage-hero-panel";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { SettingsWorkingHoursEditor } from "@/components/settings/settings-working-hours-editor";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SITE_BRAND_COLORS, SITE_PRIMARY_FONT } from "@/lib/settings/branding";
import type { SettingsTabId } from "@/lib/settings/constants";
import type {
  SettingsFormState,
  SettingsMediaPreview,
} from "@/lib/validations/site-settings";
import { cn } from "@/lib/utils/cn";

type SelectedMedia = {
  id: string;
  url: string;
  alt: string;
};

type SettingsTabPanelsProps = {
  activeTab: SettingsTabId;
  formState: SettingsFormState;
  fieldErrors: Record<string, string>;
  logoPreview: SelectedMedia | null;
  faviconPreview: SelectedMedia | null;
  ogPreview: SelectedMedia | null;
  heroPreview: SelectedMedia | null;
  onChange: <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K]
  ) => void;
  onLogoChange: (mediaId: string | null, preview: SettingsMediaPreview | null) => void;
  onFaviconChange: (
    mediaId: string | null,
    preview: SettingsMediaPreview | null
  ) => void;
  onOgChange: (mediaId: string | null, preview: SettingsMediaPreview | null) => void;
  onHeroImageChange: (
    mediaId: string | null,
    preview: SettingsMediaPreview | null
  ) => void;
};

function SettingsPanel({
  id,
  activeTab,
  tabId,
  title,
  description,
  children,
}: {
  id: SettingsTabId;
  activeTab: SettingsTabId;
  tabId: SettingsTabId;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const isActive = activeTab === tabId;

  return (
    <section
      id={`settings-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`settings-tab-${id}`}
      hidden={!isActive}
      className={cn(!isActive && "hidden")}
    >
      <div className="surface-card-elevated space-y-8 p-6 sm:p-8">
        <div className="space-y-2">
          <h2 className="text-section-title">{title}</h2>
          {description ? (
            <p className="text-muted">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function SettingsTabPanels({
  activeTab,
  formState,
  fieldErrors,
  logoPreview,
  faviconPreview,
  ogPreview,
  heroPreview,
  onChange,
  onLogoChange,
  onFaviconChange,
  onOgChange,
  onHeroImageChange,
}: SettingsTabPanelsProps) {
  return (
    <div className="min-w-0 flex-1">
      <SettingsPanel
        id="general"
        activeTab={activeTab}
        tabId="general"
        title="הגדרות כלליות"
        description="שם האתר, סלוגן, תיאור קצר ונכסי מיתוג בסיסיים."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="שם האתר"
            htmlFor="field-site-name"
            error={fieldErrors.business_name}
          >
            <Input
              id="field-site-name"
              value={formState.businessName}
              error={Boolean(fieldErrors.business_name)}
              onChange={(event) => onChange("businessName", event.target.value)}
            />
          </FormField>

          <FormField
            label="סלוגן"
            htmlFor="field-tagline"
            hint="אופציונלי"
            error={fieldErrors.tagline}
          >
            <Input
              id="field-tagline"
              value={formState.tagline}
              error={Boolean(fieldErrors.tagline)}
              onChange={(event) => onChange("tagline", event.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="תיאור קצר"
          htmlFor="field-short-description"
          hint="אופציונלי"
          error={fieldErrors.short_description}
        >
          <Textarea
            id="field-short-description"
            value={formState.shortDescription}
            error={Boolean(fieldErrors.short_description)}
            onChange={(event) =>
              onChange("shortDescription", event.target.value)
            }
          />
        </FormField>

        <div className="grid gap-8 lg:grid-cols-2">
          <ServiceMediaPicker
            fieldId="field-logo-media"
            label="לוגו"
            description="בחרו לוגו מספריית המדיה"
            value={formState.logoMediaId}
            preview={logoPreview}
            variant="minimal"
            error={fieldErrors.logo_media_id}
            onChange={onLogoChange}
          />

          <ServiceMediaPicker
            fieldId="field-favicon-media"
            label="Favicon"
            description="אייקון קטן שמופיע בלשונית הדפדפן"
            value={formState.faviconMediaId}
            preview={faviconPreview}
            variant="minimal"
            error={fieldErrors.favicon_media_id}
            onChange={onFaviconChange}
          />
        </div>
      </SettingsPanel>

      <SettingsPanel
        id="homepage"
        activeTab={activeTab}
        tabId="homepage"
        title="Hero — דף הבית"
        description="עריכת הכותרת, הכפתורים והמדיה של אזור ה-Hero בלבד."
      >
        <SettingsHomepageHeroPanel
          formState={formState}
          fieldErrors={fieldErrors}
          heroPreview={heroPreview}
          onChange={onChange}
          onHeroImageChange={onHeroImageChange}
        />
      </SettingsPanel>

      <SettingsPanel
        id="contact"
        activeTab={activeTab}
        tabId="contact"
        title="יצירת קשר"
        description="פרטי התקשרות שמוצגים באתר."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="טלפון"
            htmlFor="field-phone"
            hint="אופציונלי"
            error={fieldErrors.phone}
          >
            <Input
              id="field-phone"
              type="tel"
              dir="ltr"
              value={formState.phone}
              error={Boolean(fieldErrors.phone)}
              onChange={(event) => onChange("phone", event.target.value)}
            />
          </FormField>

          <FormField
            label="WhatsApp"
            htmlFor="field-whatsapp"
            hint="אופציונלי — מספר או קישור"
            error={fieldErrors["social.whatsapp"]}
          >
            <Input
              id="field-whatsapp"
              dir="ltr"
              value={formState.whatsapp}
              error={Boolean(fieldErrors["social.whatsapp"])}
              onChange={(event) => onChange("whatsapp", event.target.value)}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="field-email"
            hint="אופציונלי"
            error={fieldErrors.email}
          >
            <Input
              id="field-email"
              type="email"
              dir="ltr"
              value={formState.email}
              error={Boolean(fieldErrors.email)}
              onChange={(event) => onChange("email", event.target.value)}
            />
          </FormField>

          <FormField
            label="עיר"
            htmlFor="field-city"
            hint="אופציונלי"
            error={fieldErrors.city}
          >
            <Input
              id="field-city"
              value={formState.city}
              error={Boolean(fieldErrors.city)}
              onChange={(event) => onChange("city", event.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="כתובת"
          htmlFor="field-address"
          hint="אופציונלי"
          error={fieldErrors.address}
        >
          <Textarea
            id="field-address"
            value={formState.address}
            error={Boolean(fieldErrors.address)}
            onChange={(event) => onChange("address", event.target.value)}
          />
        </FormField>

        <SettingsWorkingHoursEditor
          value={formState.workingHours}
          fieldErrors={fieldErrors}
          onChange={(value) => onChange("workingHours", value)}
        />
      </SettingsPanel>

      <SettingsPanel
        id="social"
        activeTab={activeTab}
        tabId="social"
        title="רשתות חברתיות"
        description="קישורים לפרופילים ברשתות החברתיות."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {(
            [
              ["socialFacebook", "Facebook", "social.facebook"],
              ["socialInstagram", "Instagram", "social.instagram"],
              ["socialYoutube", "YouTube", "social.youtube"],
              ["socialTiktok", "TikTok", "social.tiktok"],
              ["socialLinkedin", "LinkedIn", "social.linkedin"],
              ["socialPinterest", "Pinterest", "social.pinterest"],
            ] as const
          ).map(([key, label, errorKey]) => (
            <FormField
              key={key}
              label={label}
              htmlFor={`field-${key}`}
              hint="אופציונלי"
              error={fieldErrors[errorKey]}
            >
              <Input
                id={`field-${key}`}
                type="url"
                dir="ltr"
                placeholder="https://"
                value={formState[key]}
                error={Boolean(fieldErrors[errorKey])}
                onChange={(event) => onChange(key, event.target.value)}
              />
            </FormField>
          ))}
        </div>
      </SettingsPanel>

      <SettingsPanel
        id="seo"
        activeTab={activeTab}
        tabId="seo"
        title="SEO"
        description="ברירות מחדל לתוצאות חיפוש ושיתוף ברשתות."
      >
        <FormField
          label="Default SEO Title"
          htmlFor="field-seo-title"
          error={fieldErrors["default_seo.title"]}
        >
          <Input
            id="field-seo-title"
            value={formState.seoTitle}
            error={Boolean(fieldErrors["default_seo.title"])}
            onChange={(event) => onChange("seoTitle", event.target.value)}
          />
        </FormField>

        <FormField
          label="Default Meta Description"
          htmlFor="field-seo-description"
          error={fieldErrors["default_seo.description"]}
        >
          <Textarea
            id="field-seo-description"
            value={formState.seoDescription}
            error={Boolean(fieldErrors["default_seo.description"])}
            onChange={(event) => onChange("seoDescription", event.target.value)}
          />
        </FormField>

        <ServiceMediaPicker
          fieldId="field-og-media"
          label="Default Open Graph Image"
          description="תמונה שמוצגת בעת שיתוף הקישור"
          value={formState.ogMediaId}
          preview={ogPreview}
          variant="minimal"
          error={fieldErrors["default_seo.og_media_id"]}
          onChange={onOgChange}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--color-text)]">
            Robots
          </legend>
          <div className="flex flex-wrap gap-3">
            {(
              [
                [true, "Index"],
                [false, "No Index"],
              ] as const
            ).map(([value, label]) => {
              const checked = formState.robotsIndexingEnabled === value;

              return (
                <label
                  key={label}
                  className={cn(
                    "admin-interactive inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-full)] px-4 py-2.5 text-sm font-medium ring-1",
                    checked
                      ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] ring-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-[var(--color-border)] hover:text-[var(--color-text)]"
                  )}
                >
                  <input
                    type="radio"
                    name="robots-indexing"
                    className="sr-only"
                    checked={checked}
                    onChange={() => onChange("robotsIndexingEnabled", value)}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="text-caption text-[var(--color-text-muted)]">
          המערכת יוצרת כתובות Canonical באופן אוטומטי.
        </p>
      </SettingsPanel>

      <SettingsPanel
        id="analytics"
        activeTab={activeTab}
        tabId="analytics"
        title="אנליטיקות"
        description="חיבור כלי מדידה ואימות — כל השדות אופציונליים."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="Google Analytics ID"
            htmlFor="field-ga4"
            hint="אופציונלי"
            error={fieldErrors.ga4_measurement_id}
          >
            <Input
              id="field-ga4"
              dir="ltr"
              placeholder="G-XXXXXXXXXX"
              value={formState.ga4MeasurementId}
              error={Boolean(fieldErrors.ga4_measurement_id)}
              onChange={(event) =>
                onChange("ga4MeasurementId", event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Google Tag Manager ID"
            htmlFor="field-gtm"
            hint="אופציונלי"
            error={fieldErrors.gtm_container_id}
          >
            <Input
              id="field-gtm"
              dir="ltr"
              placeholder="GTM-XXXXXXX"
              value={formState.gtmContainerId}
              error={Boolean(fieldErrors.gtm_container_id)}
              onChange={(event) =>
                onChange("gtmContainerId", event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Meta Pixel ID"
            htmlFor="field-meta-pixel"
            hint="אופציונלי"
            error={fieldErrors.meta_pixel_id}
          >
            <Input
              id="field-meta-pixel"
              dir="ltr"
              value={formState.metaPixelId}
              error={Boolean(fieldErrors.meta_pixel_id)}
              onChange={(event) => onChange("metaPixelId", event.target.value)}
            />
          </FormField>

          <FormField
            label="Google Search Console Verification"
            htmlFor="field-gsc-verification"
            hint="אופציונלי"
            error={fieldErrors.google_site_verification}
          >
            <Input
              id="field-gsc-verification"
              dir="ltr"
              value={formState.googleSiteVerification}
              error={Boolean(fieldErrors.google_site_verification)}
              onChange={(event) =>
                onChange("googleSiteVerification", event.target.value)
              }
            />
          </FormField>
        </div>
      </SettingsPanel>

      <SettingsPanel
        id="branding"
        activeTab={activeTab}
        tabId="branding"
        title="מיתוג"
        description="צפייה בערכי המותג הקבועים — עריכה תתאפשר בעתיד."
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Primary font
            </p>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-5 py-4">
              <p className="text-lg font-semibold text-[var(--color-primary)]">
                {SITE_PRIMARY_FONT}
              </p>
              <p className="text-caption text-[var(--color-text-muted)]">
                גופן ראשי של האתר
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Brand colors
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {SITE_BRAND_COLORS.map((color) => (
                <li
                  key={color.id}
                  className="surface-card flex items-center gap-4 p-4"
                >
                  <span
                    aria-hidden="true"
                    className="size-12 shrink-0 rounded-[var(--radius-md)] ring-1 ring-[var(--color-border)]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {color.label}
                    </p>
                    <p className="font-mono text-caption text-[var(--color-text-muted)]" dir="ltr">
                      {color.hex}
                    </p>
                    <p className="text-caption text-[var(--color-text-muted)]" dir="ltr">
                      {color.cssVar}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-caption text-[var(--color-text-muted)]">
              עריכת משתני CSS תתאפשר בגרסה עתידית.
            </p>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}
