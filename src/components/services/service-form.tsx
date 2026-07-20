"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  Eye,
  Trash2,
} from "lucide-react";

import {
  archiveServiceAction,
  createServiceAction,
  permanentlyDeleteServiceAction,
  publishServiceAction,
  restoreServiceAction,
  updateServiceAction,
} from "@/actions/services";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import { AdminFormBody } from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { SlugFormField } from "@/components/admin/slug-form-field";
import { AdminSeoSection } from "@/components/admin/admin-seo-section";
import { ServiceArchiveDialog } from "@/components/services/service-archive-dialog";
import { ServiceDeleteDialog } from "@/components/services/service-delete-dialog";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { ServiceTestimonialsSection } from "@/components/services/service-testimonials-section";
import {
  createRepeaterItemId,
  RepeaterField,
  RepeaterTextareaField,
  RepeaterTextField,
} from "@/components/services/service-repeater-field";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildValidationSummary,
  focusFirstFieldError,
  getSectionsWithErrors,
  getFieldErrorMessage,
} from "@/lib/forms/validation-feedback";
import {
  normalizeServiceAudienceIcon,
  SERVICE_AUDIENCE_ICON_LABELS,
  SERVICE_AUDIENCE_ICON_NAMES,
} from "@/lib/services/audience-icons";
import { SERVICE_REPEATER_LIMITS } from "@/lib/services/constants";
import { slugifyTitle } from "@/lib/services/slug";
import type { ServiceDetail } from "@/lib/services/types";
import type { ServiceTestimonialItem } from "@/lib/testimonials/types";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import {
  mapZodErrors,
  serviceDraftInputSchema,
  servicePublishInputSchema,
  type ServiceDraftInput,
} from "@/lib/validations/service";
import { cn } from "@/lib/utils/cn";

type TextRepeaterItem = { id: string; text: string };
type AudienceRepeaterItem = { id: string; text: string; icon: string };
type ProcessRepeaterItem = { id: string; title: string; description: string };
type FaqRepeaterItem = { id: string; question: string; answer: string };

type ServiceFormProps = {
  mode: "create" | "edit";
  initialService?: ServiceDetail;
  initialValues: ServiceDraftInput;
  linkedTestimonials?: ServiceTestimonialItem[];
};

type FormContentState = {
  target_audience: AudienceRepeaterItem[];
  benefits: TextRepeaterItem[];
  process_steps: ProcessRepeaterItem[];
  faq: FaqRepeaterItem[];
  cta_title: string;
  cta_text: string;
  cta_button_label: string;
  cta_link_type: "internal" | "external";
  cta_link_url: string;
};

function toRepeaterContent(content: ServiceDraftInput["content"]): FormContentState {
  return {
    target_audience: content.target_audience.map((item) => ({
      id: createRepeaterItemId(),
      text: item.text,
      icon: item.icon?.trim() ?? "",
    })),
    benefits: content.benefits.map((item) => ({
      id: createRepeaterItemId(),
      text: item.text,
    })),
    process_steps: content.process_steps.map((item) => ({
      id: createRepeaterItemId(),
      title: item.title,
      description: item.description,
    })),
    faq: content.faq.map((item) => ({
      id: createRepeaterItemId(),
      question: item.question,
      answer: item.answer,
    })),
    cta_title: content.cta_title,
    cta_text: content.cta_text,
    cta_button_label: content.cta_button_label,
    cta_link_type: content.cta_link_type,
    cta_link_url: content.cta_link_url,
  };
}

function toSubmitContent(content: FormContentState): ServiceDraftInput["content"] {
  return {
    target_audience: content.target_audience
      .filter((item) => item.text.trim().length > 0)
      .map(({ text, icon }) => {
        const normalizedIcon = normalizeServiceAudienceIcon(icon);

        return normalizedIcon
          ? { text: text.trim(), icon: normalizedIcon }
          : { text: text.trim() };
      }),
    benefits: content.benefits
      .filter((item) => item.text.trim().length > 0)
      .map(({ text }) => ({ text: text.trim() })),
    process_steps: content.process_steps
      .filter(
        (item) => item.title.trim().length > 0 && item.description.trim().length > 0
      )
      .map(({ title, description }) => ({
        title: title.trim(),
        description: description.trim(),
      })),
    faq: content.faq
      .filter(
        (item) => item.question.trim().length > 0 && item.answer.trim().length > 0
      )
      .map(({ question, answer }) => ({
        question: question.trim(),
        answer: answer.trim(),
      })),
    cta_title: content.cta_title,
    cta_text: content.cta_text,
    cta_button_label: content.cta_button_label,
    cta_link_type: content.cta_link_type,
    cta_link_url: content.cta_link_url,
  };
}

function buildSnapshot(input: {
  values: ServiceDraftInput;
  content: FormContentState;
}) {
  return JSON.stringify({
    ...input.values,
    content: toSubmitContent(input.content),
  });
}

export function ServiceForm({
  mode,
  initialService,
  initialValues,
  linkedTestimonials = [],
}: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [content, setContent] = useState(() => toRepeaterContent(initialValues.content));
  const [coverPreview, setCoverPreview] = useState(
    initialService?.coverUrl
      ? {
          id: initialService.cover_media_id,
          url: initialService.coverUrl,
          alt: initialService.coverAlt ?? initialService.title,
        }
      : null
  );
  const [ogPreview, setOgPreview] = useState(
    initialService?.ogUrl
      ? {
          id: initialService.seo_og_media_id ?? "",
          url: initialService.ogUrl,
          alt: initialService.ogAlt ?? initialService.title,
        }
      : null
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    open: false,
    variant: "success",
    message: "",
  });
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      buildSnapshot({
        values: initialValues,
        content: toRepeaterContent(initialValues.content),
      }),
    [initialValues]
  );

  const currentSnapshot = useMemo(
    () => buildSnapshot({ values, content }),
    [values, content]
  );

  const isDirty = !saveSucceeded && currentSnapshot !== initialSnapshot;
  useUnsavedChangesWarning(isDirty && !isPending);

  const errorSections = useMemo(
    () => getSectionsWithErrors(fieldErrors),
    [fieldErrors]
  );

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const showValidationFeedback = (
    errors: Record<string, string>,
    fallback: string
  ) => {
    const summary = buildValidationSummary(errors, fallback);
    setFieldErrors(errors);
    showToast("error", summary);
    focusFirstFieldError(errors);

    if (
      Object.keys(errors).some(
        (key) => key.startsWith("seo.") || key === "seo_og_media_id"
      )
    ) {
      setSeoOpen(true);
    }
  };

  const showActionError = (
    message: string,
    errors: Record<string, string> = {}
  ) => {
    if (Object.keys(errors).length > 0) {
      showValidationFeedback(errors, message);
      return;
    }

    setFieldErrors({});
    showToast("error", message);
  };

  const setField = <K extends keyof ServiceDraftInput>(
    key: K,
    value: ServiceDraftInput[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    setValues((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugifyTitle(title),
    }));
  };

  const handleSlugResetFromTitle = () => {
    setSlugTouched(false);
    setValues((current) => ({
      ...current,
      slug: slugifyTitle(current.title),
    }));
  };

  const buildPayload = (status: ServiceDraftInput["status"]): ServiceDraftInput => ({
    ...values,
    status,
    content: toSubmitContent(content),
  });

  const handleSave = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const statusToKeep =
        mode === "create" ? "draft" : (initialService?.status ?? values.status);
      const payload = buildPayload(statusToKeep);
      const parsed = serviceDraftInputSchema.safeParse(payload);

      if (!parsed.success) {
        showValidationFeedback(
          mapZodErrors(parsed.error),
          "יש לתקן את השדות המסומנים."
        );
        return;
      }

      const result =
        mode === "create"
          ? await createServiceAction(parsed.data)
          : await updateServiceAction({
              ...parsed.data,
              id: initialService!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.service,
        "השירות נשמר בהצלחה."
      );
    });
  };

  const handlePublish = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const payload = buildPayload("published");

      const parsed = servicePublishInputSchema.safeParse({
        ...payload,
        status: "published",
      });

      if (!parsed.success) {
        showValidationFeedback(
          mapZodErrors(parsed.error),
          "יש להשלים את כל השדות הנדרשים לפרסום."
        );
        return;
      }

      const result =
        mode === "create"
          ? await createServiceAction(parsed.data)
          : await publishServiceAction({
              ...parsed.data,
              id: initialService!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.service,
        "השירות פורסם בהצלחה."
      );
    });
  };

  const handleArchive = () => {
    if (!initialService) {
      return;
    }

    startTransition(async () => {
      const result = await archiveServiceAction({ id: initialService.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setArchiveOpen(false);
      showToast("success", "השירות הועבר לארכיון.");
      router.refresh();
    });
  };

  const handleRestore = (publish: boolean) => {
    if (!initialService) {
      return;
    }

    startTransition(async () => {
      const result = await restoreServiceAction({
        id: initialService.id,
        publish,
      });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      showToast(
        "success",
        publish ? "השירות שוחזר ופורסם." : "השירות שוחזר כטיוטה."
      );
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!initialService) {
      return;
    }

    startTransition(async () => {
      const result = await permanentlyDeleteServiceAction({ id: initialService.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.service, "השירות נמחק.");
    });
  };

  const currentStatus = initialService?.status ?? values.status;
  const showPublish =
    currentStatus !== "archived" && (mode === "create" || currentStatus === "draft");

  const secondaryActions = (
    <>
      {mode === "edit" ? (
        <Link
          href={`/admin/services/${initialService!.id}/preview`}
          className="admin-btn-outline inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium"
        >
          <Eye aria-hidden="true" className="size-4" />
          תצוגה מקדימה
        </Link>
      ) : null}
      {mode === "edit" && currentStatus !== "archived" ? (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setArchiveOpen(true)}
          disabled={isPending}
        >
          <Archive aria-hidden="true" className="size-4" />
          העברה לארכיון
        </Button>
      ) : null}
      {mode === "edit" && currentStatus === "archived" ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={isPending}
            onClick={() => handleRestore(false)}
          >
            שחזור כטיוטה
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={isPending}
            onClick={() => handleRestore(true)}
          >
            שחזור ופרסום
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={isPending}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            מחיקה לצמיתות
          </Button>
        </>
      ) : null}
    </>
  );

  return (
    <AdminFormShell width="wide" withActionBar>
      <AdminFormHeader
        breadcrumbs={[
          { label: "שירותים", href: ADMIN_LIST_PATHS.service },
          {
            label: mode === "create" ? "שירות חדש" : "עריכת שירות",
          },
        ]}
        title={mode === "create" ? "שירות חדש" : "עריכת שירות"}
        description={
          mode === "create"
            ? "צרי שירות חדש שיופיע באתר. אפשר לשמור כטיוטה או לפרסם בכל שלב."
            : "ערכי את השירות והתוכן שלו. שמרי כטיוטה או פרסמי בכל שלב."
        }
        meta={<AdminStatusBadge status={currentStatus} />}
        secondaryActions={secondaryActions}
      />

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        autoHideMs={toast.variant === "success" ? 4000 : undefined}
        onClose={closeToast}
      />

      <AdminFormBody>
        <div className="space-y-12">
          <section
            id="section-basic"
            className={cn(
              "admin-form-section space-y-5",
              errorSections.has("basic") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <h2 className="text-section-title">מידע בסיסי</h2>

            <FormField
              label="כותרת"
              htmlFor="service-title"
              required
              error={fieldErrors.title}
            >
              <Input
                id="service-title"
                value={values.title}
                maxLength={120}
                error={Boolean(fieldErrors.title)}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </FormField>

            <SlugFormField
              label="כתובת שירות (slug)"
              htmlFor="service-slug"
              value={values.slug}
              error={fieldErrors.slug}
              onChange={(slug) => setField("slug", slug)}
              onManualEdit={() => setSlugTouched(true)}
              onResetFromTitle={handleSlugResetFromTitle}
            />

            <FormField
              label="תיאור קצר"
              htmlFor="service-short-description"
              required
              hint={`${values.short_description.length}/300 · ניתן להוסיף שורות חדשות`}
              error={fieldErrors.short_description}
            >
              <Textarea
                id="service-short-description"
                value={values.short_description}
                maxLength={300}
                error={Boolean(fieldErrors.short_description)}
                onChange={(event) =>
                  setField("short_description", event.target.value)
                }
              />
            </FormField>

            <ServiceMediaPicker
              label="תמונת כיסוי"
              description="נדרשת לשמירה. חובה לפרסום."
              required
              value={values.cover_media_id}
              preview={coverPreview}
              error={fieldErrors.cover_media_id}
              onChange={(mediaId, preview) => {
                setField("cover_media_id", mediaId);
                setCoverPreview(preview);
              }}
            />

            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={values.featured}
                onChange={(event) => setField("featured", event.target.checked)}
              />
              שירות מומלץ
            </label>
          </section>

          <section
            id="section-content"
            className={cn(
              "admin-form-section space-y-4",
              errorSections.has("content") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <h2 className="text-section-title">תוכן השירות</h2>
            <FormField
              label="הקדמה מלאה"
              htmlFor="service-full-introduction"
              required
              hint="טקסט רציף. יוצג בפסקאות נפרדות באתר."
              error={fieldErrors.full_introduction}
            >
              <Textarea
                id="service-full-introduction"
                value={values.full_introduction}
                className="min-h-48"
                error={Boolean(fieldErrors.full_introduction)}
                onChange={(event) =>
                  setField("full_introduction", event.target.value)
                }
              />
            </FormField>
          </section>

          <section
            id="section-audience"
            className={cn(
              "admin-form-section",
              errorSections.has("audience") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <RepeaterField
              label="למי מתאים"
              description="רשימת קהלי יעד עם אייקון אופציונלי"
              items={content.target_audience}
              minItems={SERVICE_REPEATER_LIMITS.target_audience.min}
              maxItems={SERVICE_REPEATER_LIMITS.target_audience.max}
              addLabel="הוספת קהל יעד"
              emptyLabel="הוסיפו לפחות פריט אחד לפני פרסום"
              error={getFieldErrorMessage(fieldErrors, "content.target_audience")}
              createItem={() => ({
                id: createRepeaterItemId(),
                text: "",
                icon: "",
              })}
              onChange={(items) =>
                setContent((current) => ({ ...current, target_audience: items }))
              }
              renderFields={(item, _index, updateItem) => (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                  <RepeaterTextField
                    value={item.text}
                    placeholder="לדוגמה: נשים בהריון"
                    onChange={(text) => updateItem({ ...item, text })}
                  />
                  <Select
                    label="אייקון"
                    id={`audience-icon-${item.id}`}
                    value={item.icon}
                    onChange={(event) =>
                      updateItem({ ...item, icon: event.target.value })
                    }
                  >
                    <option value="">ברירת מחדל (CheckCircle)</option>
                    {SERVICE_AUDIENCE_ICON_NAMES.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {SERVICE_AUDIENCE_ICON_LABELS[iconName]} ({iconName})
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            />
          </section>

          <section
            id="section-benefits"
            className={cn(
              "admin-form-section",
              errorSections.has("benefits") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <RepeaterField
              label="יתרונות"
              items={content.benefits}
              minItems={SERVICE_REPEATER_LIMITS.benefits.min}
              maxItems={SERVICE_REPEATER_LIMITS.benefits.max}
              addLabel="הוספת יתרון"
              emptyLabel="הוסיפו יתרונות לשירות"
              error={getFieldErrorMessage(fieldErrors, "content.benefits")}
              createItem={() => ({ id: createRepeaterItemId(), text: "" })}
              onChange={(items) =>
                setContent((current) => ({ ...current, benefits: items }))
              }
              renderFields={(item, _index, updateItem) => (
                <RepeaterTextField
                  value={item.text}
                  placeholder="יתרון השירות"
                  onChange={(text) => updateItem({ ...item, text })}
                />
              )}
            />
          </section>

          <section
            id="section-process"
            className={cn(
              "admin-form-section",
              errorSections.has("process") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <RepeaterField
              label="שלבי התהליך"
              items={content.process_steps}
              minItems={SERVICE_REPEATER_LIMITS.process_steps.min}
              maxItems={SERVICE_REPEATER_LIMITS.process_steps.max}
              addLabel="הוספת שלב"
              emptyLabel="הוסיפו שלבי תהליך"
              error={getFieldErrorMessage(fieldErrors, "content.process_steps")}
              createItem={() => ({
                id: createRepeaterItemId(),
                title: "",
                description: "",
              })}
              onChange={(items) =>
                setContent((current) => ({ ...current, process_steps: items }))
              }
              renderFields={(item, _index, updateItem) => (
                <div className="space-y-3">
                  <RepeaterTextField
                    value={item.title}
                    placeholder="כותרת השלב"
                    onChange={(title) => updateItem({ ...item, title })}
                  />
                  <RepeaterTextareaField
                    value={item.description}
                    placeholder="תיאור השלב"
                    onChange={(description) =>
                      updateItem({ ...item, description })
                    }
                  />
                </div>
              )}
            />
          </section>

          <section
            id="section-faq"
            className={cn(
              "admin-form-section",
              errorSections.has("faq") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <RepeaterField
              label="שאלות נפוצות"
              description="אופציונלי"
              items={content.faq}
              minItems={SERVICE_REPEATER_LIMITS.faq.min}
              maxItems={SERVICE_REPEATER_LIMITS.faq.max}
              addLabel="הוספת שאלה"
              emptyLabel="אין שאלות נפוצות"
              error={getFieldErrorMessage(fieldErrors, "content.faq")}
              createItem={() => ({
                id: createRepeaterItemId(),
                question: "",
                answer: "",
              })}
              onChange={(items) =>
                setContent((current) => ({ ...current, faq: items }))
              }
              renderFields={(item, _index, updateItem) => (
                <div className="space-y-3">
                  <RepeaterTextField
                    value={item.question}
                    placeholder="שאלה"
                    onChange={(question) => updateItem({ ...item, question })}
                  />
                  <RepeaterTextareaField
                    value={item.answer}
                    placeholder="תשובה"
                    onChange={(answer) => updateItem({ ...item, answer })}
                  />
                </div>
              )}
            />
          </section>

          <section
            id="section-cta"
            className={cn(
              "admin-form-section space-y-4",
              errorSections.has("cta") &&
                "rounded-[var(--radius-md)] ring-2 ring-[var(--color-error)]/20"
            )}
          >
            <h2 className="text-section-title">הנעה לפעולה</h2>

            <FormField
              label="כותרת"
              htmlFor="field-cta-title"
              required
              error={fieldErrors["content.cta_title"]}
            >
              <Input
                id="field-cta-title"
                value={content.cta_title}
                placeholder="כותרת"
                error={Boolean(fieldErrors["content.cta_title"])}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    cta_title: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField
              label="טקסט"
              htmlFor="field-cta-text"
              required
              error={fieldErrors["content.cta_text"]}
            >
              <Textarea
                id="field-cta-text"
                value={content.cta_text}
                placeholder="טקסט"
                error={Boolean(fieldErrors["content.cta_text"])}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    cta_text: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField
              label="תווית כפתור"
              htmlFor="field-cta-button-label"
              required
              error={fieldErrors["content.cta_button_label"]}
            >
              <Input
                id="field-cta-button-label"
                value={content.cta_button_label}
                placeholder="תווית כפתור"
                error={Boolean(fieldErrors["content.cta_button_label"])}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    cta_button_label: event.target.value,
                  }))
                }
              />
            </FormField>

            <Select
              label="סוג קישור"
              value={content.cta_link_type}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  cta_link_type: event.target.value as "internal" | "external",
                }))
              }
            >
              <option value="internal">קישור פנימי</option>
              <option value="external">קישור חיצוני</option>
            </Select>

            <FormField
              label="כתובת קישור"
              htmlFor="field-cta-link-url"
              required
              error={fieldErrors["content.cta_link_url"]}
            >
              <Input
                id="field-cta-link-url"
                value={content.cta_link_url}
                placeholder={
                  content.cta_link_type === "internal"
                    ? "/contact"
                    : "https://example.com"
                }
                dir="ltr"
                className="text-left"
                error={Boolean(fieldErrors["content.cta_link_url"])}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    cta_link_url: event.target.value,
                  }))
                }
              />
            </FormField>
          </section>

          {mode === "edit" && initialService ? (
            <ServiceTestimonialsSection
              serviceId={initialService.id}
              serviceTitle={initialService.title}
              testimonials={linkedTestimonials}
            />
          ) : null}

          <AdminSeoSection
            open={seoOpen}
            onOpenChange={setSeoOpen}
            seoTitle={values.seo.title}
            seoDescription={values.seo.description}
            ogMediaId={values.seo_og_media_id}
            ogPreview={ogPreview}
            titleSource={values.title}
            descriptionSource={values.short_description}
            fieldErrors={fieldErrors}
            onSeoTitleChange={(title) =>
              setValues((current) => ({
                ...current,
                seo: { ...current.seo, title },
              }))
            }
            onSeoDescriptionChange={(description) =>
              setValues((current) => ({
                ...current,
                seo: { ...current.seo, description },
              }))
            }
            onOgMediaChange={(mediaId, preview) => {
              setField("seo_og_media_id", mediaId);
              setOgPreview(preview);
            }}
          />
        </div>
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.service}
        onSave={handleSave}
        onPublish={handlePublish}
        showPublish={showPublish}
        isDirty={isDirty}
        isPending={isPending}
      />

      <ServiceArchiveDialog
        open={archiveOpen}
        serviceTitle={values.title}
        loading={isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
      />

      <ServiceDeleteDialog
        open={deleteOpen}
        serviceTitle={values.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminFormShell>
  );
}
