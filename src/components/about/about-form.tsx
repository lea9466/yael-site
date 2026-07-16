"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Eye, FileText, ImageIcon, Sparkles } from "lucide-react";

import { saveAboutPageAction } from "@/actions/about";
import { AdminFormBody } from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import {
  ArticleEditor,
  articleBlocksToEditorBlocks,
  editorBlocksToArticleBlocks,
  type EditorBlockUnion,
} from "@/components/articles/article-editor";
import { AboutPublicView } from "@/components/about/about-public-view";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { SettingsSaveBar } from "@/components/settings/settings-save-bar";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateReadingTimeMinutes } from "@/lib/articles/reading-time";
import { formatReadingTimeLabel } from "@/lib/articles/format";
import { aboutContentToEditorMediaUrls } from "@/lib/about/editor";
import type { AboutPageDetail } from "@/lib/about/queries";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  aboutPageDataToFormState,
  formStateToAboutPageData,
  type AboutFormState,
} from "@/lib/validations/about";

type AboutFormProps = {
  detail: AboutPageDetail;
};

function buildSnapshot(input: {
  formState: AboutFormState;
  blocks: EditorBlockUnion[];
}) {
  return JSON.stringify({
    ...input.formState,
    blocks: editorBlocksToArticleBlocks(input.blocks),
  });
}

export function AboutForm({ detail }: AboutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialFormState = useMemo(
    () => aboutPageDataToFormState(detail.data),
    [detail.data]
  );

  const initialBlocks = useMemo(
    () =>
      articleBlocksToEditorBlocks(
        detail.data.content.blocks,
        aboutContentToEditorMediaUrls(
          detail.data.content,
          detail.blockMediaUrls
        )
      ),
    [detail.data.content, detail.blockMediaUrls]
  );

  const initialSnapshot = useMemo(
    () => buildSnapshot({ formState: initialFormState, blocks: initialBlocks }),
    [initialFormState, initialBlocks]
  );

  const [formState, setFormState] = useState<AboutFormState>(initialFormState);
  const [blocks, setBlocks] = useState<EditorBlockUnion[]>(initialBlocks);
  const [coverPreview, setCoverPreview] = useState(detail.coverPreview);
  const [updatedAt, setUpdatedAt] = useState(detail.updatedAt);
  const [savedSnapshot, setSavedSnapshot] = useState(initialSnapshot);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentSnapshot = useMemo(
    () => buildSnapshot({ formState, blocks }),
    [formState, blocks]
  );

  const isDirty = currentSnapshot !== savedSnapshot;
  useUnsavedChangesWarning(isDirty && !isPending);

  const readingTimeLabel = formatReadingTimeLabel(
    calculateReadingTimeMinutes(editorBlocksToArticleBlocks(blocks))
  );

  const contentError =
    fieldErrors["content.blocks"] ??
    fieldErrors.content ??
    Object.entries(fieldErrors).find(([key]) => key.startsWith("content."))?.[1];

  const blockMediaUrlsForPreview = useMemo(() => {
    const map = new Map(detail.blockMediaUrls);

    for (const block of blocks) {
      if (block.type === "image" && block.preview?.url) {
        map.set(block.media_id, {
          id: block.media_id,
          url: block.preview.url,
          alt: block.preview.alt,
        });
      }
    }

    return map;
  }, [blocks, detail.blockMediaUrls]);

  const previewData = useMemo(
    () =>
      formStateToAboutPageData(formState, {
        blocks: editorBlocksToArticleBlocks(blocks),
        gallery: [],
      }),
    [formState, blocks]
  );

  const handleChange = <K extends keyof AboutFormState>(
    key: K,
    value: AboutFormState[K]
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[String(key)];
      return next;
    });
    setFormError("");
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setBlocks(initialBlocks);
    setCoverPreview(detail.coverPreview);
    setSavedSnapshot(initialSnapshot);
    setUpdatedAt(detail.updatedAt);
    setFieldErrors({});
    setFormError("");
  };

  const handleSave = () => {
    if (!isDirty || isPending) {
      return;
    }

    startTransition(async () => {
      setFieldErrors({});
      setFormError("");

      const payload = {
        data: formStateToAboutPageData(formState, {
          blocks: editorBlocksToArticleBlocks(blocks),
          gallery: [],
        }),
        updatedAt,
      };

      const result = await saveAboutPageAction(payload);

      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setSavedSnapshot(currentSnapshot);
      setUpdatedAt(result.data.updatedAt);
      setSuccessMessage("עמוד אודות נשמר בהצלחה.");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1400px] pb-28">
        <AdminFormHeader
          breadcrumbs={[{ label: "אודות" }]}
          title="עמוד אודות"
          description="עריכת תוכן עריכה עשיר לעמוד אודות — כותרת, תמונת שער, תוכן והנעה לפעולה."
          secondaryActions={
            <Link
              href="/admin/about/preview"
              className="admin-btn-outline inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium"
            >
              <Eye aria-hidden="true" className="size-4" />
              תצוגה מקדימה
            </Link>
          }
        />

        {formError ? (
          <p
            role="alert"
            className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-error)]/30 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {formError}
          </p>
        ) : null}

        <AdminFormBody>
          <div className="space-y-10">
          <section className="surface-card-elevated space-y-6 p-6 sm:p-8">
            <AdminSectionHeader
              icon={FileText}
              title="כותרת העמוד"
              description="כותרת ראשית וכותרת משנה אופציונלית לעמוד."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                label="כותרת העמוד"
                htmlFor="field-about-title"
                error={fieldErrors.title}
              >
                <Input
                  id="field-about-title"
                  value={formState.title}
                  error={Boolean(fieldErrors.title)}
                  onChange={(event) => handleChange("title", event.target.value)}
                />
              </FormField>

              <FormField
                label="כותרת משנה"
                htmlFor="field-about-subtitle"
                hint="אופציונלי"
                error={fieldErrors.intro_text ?? fieldErrors.subtitle}
              >
                <Input
                  id="field-about-subtitle"
                  value={formState.subtitle}
                  error={Boolean(
                    fieldErrors.intro_text ?? fieldErrors.subtitle
                  )}
                  onChange={(event) =>
                    handleChange("subtitle", event.target.value)
                  }
                />
              </FormField>
            </div>
          </section>

          <section className="surface-card-elevated space-y-6 p-6 sm:p-8">
            <AdminSectionHeader
              icon={ImageIcon}
              title="תמונת שער"
              description="תמונת שער אופציונלית שמוצגת בראש העמוד."
            />

            <ServiceMediaPicker
              fieldId="field-about-cover"
              label="תמונת שער"
              description="בחרו תמונה מספריית המדיה או העלו תמונה חדשה"
              value={formState.coverMediaId}
              preview={coverPreview}
              variant="minimal"
              error={fieldErrors.cover_media_id}
              onChange={(mediaId, preview) => {
                handleChange("coverMediaId", mediaId);
                setCoverPreview(preview);
              }}
            />
          </section>

          <section className="surface-card-elevated space-y-6 p-6 sm:p-8">
            <AdminSectionHeader
              icon={FileText}
              title="תוכן אודות"
              description="עריכה עשירה עם כותרות, פסקאות, רשימות, ציטוטים, קישורים ותמונות."
            />

            <ArticleEditor
              blocks={blocks}
              error={contentError}
              readingTimeLabel={readingTimeLabel}
              onChange={setBlocks}
            />
          </section>

          <section className="surface-card-elevated space-y-6 p-6 sm:p-8">
            <AdminSectionHeader
              icon={Sparkles}
              title="הנעה לפעולה"
              description="בלוק סיום קבוע בעמוד הציבורי — ניתן לערוך את הטקסט והכפתור."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                label="כותרת"
                htmlFor="field-about-cta-title"
                error={fieldErrors["cta.title"] ?? fieldErrors.ctaTitle}
              >
                <Input
                  id="field-about-cta-title"
                  value={formState.ctaTitle}
                  error={Boolean(
                    fieldErrors["cta.title"] ?? fieldErrors.ctaTitle
                  )}
                  onChange={(event) =>
                    handleChange("ctaTitle", event.target.value)
                  }
                />
              </FormField>

              <FormField
                label="תווית כפתור"
                htmlFor="field-about-cta-button-label"
                error={
                  fieldErrors["cta.button_label"] ?? fieldErrors.ctaButtonLabel
                }
              >
                <Input
                  id="field-about-cta-button-label"
                  value={formState.ctaButtonLabel}
                  error={Boolean(
                    fieldErrors["cta.button_label"] ??
                      fieldErrors.ctaButtonLabel
                  )}
                  onChange={(event) =>
                    handleChange("ctaButtonLabel", event.target.value)
                  }
                />
              </FormField>
            </div>

            <FormField
              label="טקסט"
              htmlFor="field-about-cta-text"
              error={fieldErrors["cta.text"] ?? fieldErrors.ctaText}
            >
              <Textarea
                id="field-about-cta-text"
                value={formState.ctaText}
                error={Boolean(fieldErrors["cta.text"] ?? fieldErrors.ctaText)}
                onChange={(event) => handleChange("ctaText", event.target.value)}
              />
            </FormField>

            <FormField
              label="קישור לכפתור"
              htmlFor="field-about-cta-button-url"
              hint="ניתן להזין קישור פנימי או חיצוני"
              error={
                fieldErrors["cta.button_url"] ?? fieldErrors.ctaButtonUrl
              }
            >
              <Input
                id="field-about-cta-button-url"
                dir="ltr"
                value={formState.ctaButtonUrl}
                error={Boolean(
                  fieldErrors["cta.button_url"] ?? fieldErrors.ctaButtonUrl
                )}
                onChange={(event) =>
                  handleChange("ctaButtonUrl", event.target.value)
                }
              />
            </FormField>
          </section>

          <section className="surface-card-elevated space-y-4 p-6 sm:p-8">
            <AdminSectionHeader
              icon={Eye}
              title="תצוגה מקדימה מהירה"
              description="תצוגה מקומית של המבנה הקבוע — לתצוגה מלאה עברו לעמוד התצוגה המקדימה."
            />
            <AboutPublicView
              data={previewData}
              coverPreview={coverPreview}
              blockMediaUrls={blockMediaUrlsForPreview}
              mode="preview"
            />
          </section>
          </div>
        </AdminFormBody>
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
