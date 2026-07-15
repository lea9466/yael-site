"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  Eye,
  Save,
  Send,
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
import { AdminSeoSection } from "@/components/admin/admin-seo-section";
import { ServiceArchiveDialog } from "@/components/services/service-archive-dialog";
import { ServiceDeleteDialog } from "@/components/services/service-delete-dialog";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import {
  createRepeaterItemId,
  RepeaterField,
  RepeaterTextareaField,
  RepeaterTextField,
} from "@/components/services/service-repeater-field";
import { Badge } from "@/components/ui/badge";
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
import { SERVICE_REPEATER_LIMITS, SERVICE_FORM_SECTIONS } from "@/lib/services/constants";
import { STATUS_LABELS } from "@/lib/services/constants";
import { slugifyTitle } from "@/lib/services/slug";
import type { ServiceDetail } from "@/lib/services/types";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  mapZodErrors,
  serviceDraftInputSchema,
  servicePublishInputSchema,
  type ServiceDraftInput,
} from "@/lib/validations/service";
import { cn } from "@/lib/utils/cn";

type TextRepeaterItem = { id: string; text: string };
type ProcessRepeaterItem = { id: string; title: string; description: string };
type FaqRepeaterItem = { id: string; question: string; answer: string };

type ServiceFormProps = {
  mode: "create" | "edit";
  initialService?: ServiceDetail;
  initialValues: ServiceDraftInput;
};

type FormContentState = {
  target_audience: TextRepeaterItem[];
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
      .map(({ text }) => ({ text: text.trim() })),
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
  const [activeSection, setActiveSection] = useState("basic");
  const [seoOpen, setSeoOpen] = useState(false);

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

  const isDirty = currentSnapshot !== initialSnapshot;
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

    const { sectionId } = focusFirstFieldError(errors);

    if (
      Object.keys(errors).some(
        (key) => key.startsWith("seo.") || key === "seo_og_media_id"
      )
    ) {
      setSeoOpen(true);
    }

    if (sectionId) {
      setActiveSection(sectionId);
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

  const buildPayload = (status: ServiceDraftInput["status"]): ServiceDraftInput => ({
    ...values,
    status,
    content: toSubmitContent(content),
  });

  const handleSaveDraft = () => {
    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const payload = buildPayload("draft");
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

      setFieldErrors({});
      showToast("success", "השירות נשמר כטיוטה.");

      if (mode === "create" && result.data?.id) {
        router.replace(`/admin/services/${result.data.id}`);
        router.refresh();
        return;
      }

      router.refresh();
    });
  };

  const handlePublish = () => {
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

      setFieldErrors({});
      showToast("success", "השירות פורסם בהצלחה.");
      setValues((current) => ({ ...current, status: "published" }));

      if (mode === "create" && result.data?.id) {
        router.replace(`/admin/services/${result.data.id}`);
      }

      router.refresh();
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
      router.push("/admin/services");
      router.refresh();
    });
  };

  const currentStatus = initialService?.status ?? values.status;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-title">
              {mode === "create" ? "שירות חדש" : "עריכת שירות"}
            </h1>
            {mode === "edit" ? (
              <Badge
                variant={
                  currentStatus === "published"
                    ? "success"
                    : currentStatus === "archived"
                      ? "warning"
                      : "neutral"
                }
              >
                {STATUS_LABELS[currentStatus]}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted">
            {mode === "create"
              ? "יצירת שירות חדש לאתר"
              : "עדכון פרטי השירות והתוכן שלו"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {mode === "edit" ? (
            <Link
              href={`/admin/services/${initialService!.id}/preview`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-4 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-soft)]"
            >
              <Eye aria-hidden="true" className="size-4" />
              תצוגה מקדימה
            </Link>
          ) : null}
        </div>
      </div>

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        autoHideMs={toast.variant === "success" ? 4000 : undefined}
        onClose={closeToast}
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="אזורי הטופס"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {SERVICE_FORM_SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-start text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]"
                      : "bg-[var(--color-surface-soft)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]/80",
                    errorSections.has(section.id) &&
                      activeSection !== section.id &&
                      "border border-[var(--color-error)] bg-[var(--color-error-soft)]/50 text-[var(--color-error)]"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span>{section.label}</span>
                  {errorSections.has(section.id) ? (
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-[var(--color-error)]"
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8 pb-28">
          <section
            id="section-basic"
            className={cn(
              "space-y-5 rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("basic")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "basic" && "hidden lg:block"
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

            <FormField
              label="כתובת שירות (slug)"
              htmlFor="service-slug"
              required
              hint="נוצר אוטומטית מהכותרת. ניתן לעריכה ידנית."
              error={fieldErrors.slug}
            >
              <Input
                id="service-slug"
                value={values.slug}
                dir="ltr"
                className="text-left"
                error={Boolean(fieldErrors.slug)}
                onChange={(event) => {
                  setSlugTouched(true);
                  setField("slug", event.target.value);
                }}
              />
            </FormField>

            <FormField
              label="תיאור קצר"
              htmlFor="service-short-description"
              required
              hint={`${values.short_description.length}/300`}
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
              "space-y-4 rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("content")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "content" && "hidden lg:block"
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
              "rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("audience")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "audience" && "hidden lg:block"
            )}
          >
            <RepeaterField
              label="למי מתאים"
              description="רשימת קהלי יעד"
              items={content.target_audience}
              minItems={SERVICE_REPEATER_LIMITS.target_audience.min}
              maxItems={SERVICE_REPEATER_LIMITS.target_audience.max}
              addLabel="הוספת קהל יעד"
              emptyLabel="הוסיפו לפחות פריט אחד לפני פרסום"
              error={getFieldErrorMessage(fieldErrors, "content.target_audience")}
              createItem={() => ({ id: createRepeaterItemId(), text: "" })}
              onChange={(items) =>
                setContent((current) => ({ ...current, target_audience: items }))
              }
              renderFields={(item, _index, updateItem) => (
                <RepeaterTextField
                  value={item.text}
                  placeholder="לדוגמה: נשים בהריון"
                  onChange={(text) => updateItem({ ...item, text })}
                />
              )}
            />
          </section>

          <section
            id="section-benefits"
            className={cn(
              "rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("benefits")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "benefits" && "hidden lg:block"
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
              "rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("process")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "process" && "hidden lg:block"
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
              "rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("faq")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "faq" && "hidden lg:block"
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
              "space-y-4 rounded-[var(--radius-xl)] border bg-[var(--color-surface)] p-5 sm:p-6",
              errorSections.has("cta")
                ? "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/15"
                : "border-[var(--color-border)]",
              activeSection !== "cta" && "hidden lg:block"
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
      </div>

      <div className="sticky bottom-0 z-[var(--z-sticky)] -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              loading={isPending}
              loadingText="שומר..."
              onClick={handleSaveDraft}
            >
              <Save aria-hidden="true" className="size-4" />
              שמירה כטיוטה
            </Button>
            <Button
              variant="secondary"
              loading={isPending}
              loadingText="מפרסם..."
              onClick={handlePublish}
            >
              <Send aria-hidden="true" className="size-4" />
              פרסום
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {mode === "edit" && currentStatus !== "archived" ? (
              <Button
                variant="outline"
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
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleRestore(false)}
                >
                  שחזור כטיוטה
                </Button>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleRestore(true)}
                >
                  שחזור ופרסום
                </Button>
                <Button
                  variant="danger"
                  disabled={isPending}
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  מחיקה לצמיתות
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

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
    </div>
  );
}
