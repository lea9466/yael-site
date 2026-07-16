"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveSiteSettingsAction } from "@/actions/site-settings";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsSaveBar } from "@/components/settings/settings-save-bar";
import { SettingsTabPanels } from "@/components/settings/settings-tab-panels";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { FormToast } from "@/components/ui/form-toast";
import type { SettingsTabId } from "@/lib/settings/constants";
import {
  formStateToSavePayload,
  pageDataToFormState,
  serializeFormState,
  type SettingsFormState,
  type SettingsMediaPreview,
  type SettingsPageData,
} from "@/lib/validations/site-settings";

type SettingsPageClientProps = {
  data: SettingsPageData;
};

export function SettingsPageClient({ data }: SettingsPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [isPending, startTransition] = useTransition();

  const initialFormState = useMemo(() => pageDataToFormState(data), [data]);
  const initialSerialized = useMemo(
    () => serializeFormState(initialFormState),
    [initialFormState]
  );

  const [formState, setFormState] = useState<SettingsFormState>(initialFormState);
  const [savedSerialized, setSavedSerialized] = useState(initialSerialized);
  const [timestamps, setTimestamps] = useState({
    businessProfileUpdatedAt: data.businessProfileUpdatedAt,
    siteSettingsUpdatedAt: data.siteSettingsUpdatedAt,
    homepageUpdatedAt: data.homepageUpdatedAt,
  });

  const [logoPreview, setLogoPreview] = useState<SettingsMediaPreview | null>(
    data.mediaPreviews.logo
  );
  const [faviconPreview, setFaviconPreview] = useState<SettingsMediaPreview | null>(
    data.mediaPreviews.favicon
  );
  const [ogPreview, setOgPreview] = useState<SettingsMediaPreview | null>(
    data.mediaPreviews.ogImage
  );
  const [heroPreview, setHeroPreview] = useState<SettingsMediaPreview | null>(
    data.mediaPreviews.heroImage
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isDirty = serializeFormState(formState) !== savedSerialized;

  const handleChange = useCallback(
    <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
      setFormState((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[String(key)];
        return next;
      });
      setFormError("");
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState(pageDataToFormState(data));
    setSavedSerialized(initialSerialized);
    setLogoPreview(data.mediaPreviews.logo);
    setFaviconPreview(data.mediaPreviews.favicon);
    setOgPreview(data.mediaPreviews.ogImage);
    setHeroPreview(data.mediaPreviews.heroImage);
    setTimestamps({
      businessProfileUpdatedAt: data.businessProfileUpdatedAt,
      siteSettingsUpdatedAt: data.siteSettingsUpdatedAt,
      homepageUpdatedAt: data.homepageUpdatedAt,
    });
    setFieldErrors({});
    setFormError("");
  }, [data, initialSerialized]);

  const handleSave = () => {
    if (!isDirty || isPending) {
      return;
    }

    startTransition(async () => {
      setFieldErrors({});
      setFormError("");

      const payload = formStateToSavePayload(formState, timestamps);
      const result = await saveSiteSettingsAction(payload);

      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      const nextSerialized = serializeFormState(formState);
      setSavedSerialized(nextSerialized);
      setTimestamps({
        businessProfileUpdatedAt: result.data.businessProfileUpdatedAt,
        siteSettingsUpdatedAt: result.data.siteSettingsUpdatedAt,
        homepageUpdatedAt: result.data.homepageUpdatedAt,
      });
      setSuccessMessage("ההגדרות נשמרו בהצלחה.");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1400px] pb-28">
        <AdminPageHeader
          module="settings"
          title="הגדרות האתר"
          description="ניהול הגדרות כלליות, יצירת קשר, SEO, אנליטיקות ומיתוג."
        />

        {formError ? (
          <p
            role="alert"
            className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-error)]/30 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-start lg:gap-10">
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <SettingsTabPanels
            activeTab={activeTab}
            formState={formState}
            fieldErrors={fieldErrors}
            logoPreview={logoPreview}
            faviconPreview={faviconPreview}
            ogPreview={ogPreview}
            heroPreview={heroPreview}
            onChange={handleChange}
            onLogoChange={(mediaId, preview) => {
              handleChange("logoMediaId", mediaId);
              setLogoPreview(preview);
            }}
            onFaviconChange={(mediaId, preview) => {
              handleChange("faviconMediaId", mediaId);
              setFaviconPreview(preview);
            }}
            onOgChange={(mediaId, preview) => {
              handleChange("ogMediaId", mediaId);
              setOgPreview(preview);
            }}
            onHeroImageChange={(mediaId, preview) => {
              handleChange("heroMediaId", mediaId);
              setHeroPreview(preview);
            }}
          />
        </div>
      </div>

      <SettingsSaveBar
        isDirty={isDirty}
        isPending={isPending}
        onCancel={resetForm}
        onSave={handleSave}
      />

      <FormToast
        open={Boolean(successMessage)}
        variant="success"
        message={successMessage}
        autoHideMs={4000}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}
