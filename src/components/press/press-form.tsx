"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Trash2 } from "lucide-react";

import {
  createPressArticleAction,
  deletePressArticleAction,
  updatePressArticleAction,
} from "@/actions/press";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  AdminFormBody,
  AdminFormSection,
} from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { PressDeleteDialog } from "@/components/press/press-delete-dialog";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  PRESS_STATUS_LABELS,
  PRESS_STATUSES,
} from "@/lib/press/constants";
import { slugifyPressTitle } from "@/lib/press/format";
import type {
  PressArticleDetail,
  PressArticleFormValues,
  PressMediaPreview,
} from "@/lib/press/types";
import { cn } from "@/lib/utils/cn";

type PressFormProps = {
  mode: "create" | "edit";
  initialValues: PressArticleFormValues;
  article?: PressArticleDetail;
};

function buildSnapshot(values: PressArticleFormValues) {
  return JSON.stringify(values);
}

export function PressForm({ mode, initialValues, article }: PressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [pdfPreview, setPdfPreview] = useState<PressMediaPreview | null>(
    article?.pdfPreview ?? null
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [seoOpen, setSeoOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    open: false,
    variant: "success",
    message: "",
  });

  const initialSnapshot = useMemo(
    () => buildSnapshot(initialValues),
    [initialValues]
  );
  const currentSnapshot = useMemo(() => buildSnapshot(values), [values]);
  const isDirty = !saveSucceeded && currentSnapshot !== initialSnapshot;

  useUnsavedChangesWarning(isDirty && !isPending);

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const setField = <K extends keyof PressArticleFormValues>(
    key: K,
    value: PressArticleFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    setField("title", title);

    if (!slugTouched) {
      setField("slug", slugifyPressTitle(title));
    }
  };

  const handleSubmit = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const result =
        mode === "create"
          ? await createPressArticleAction(values)
          : await updatePressArticleAction({
              ...values,
              id: article!.id,
            });

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        showToast("error", result.error);
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.press,
        mode === "create"
          ? "הכתבה נוצרה בהצלחה."
          : "הכתבה עודכנה בהצלחה."
      );
    });
  };

  const handleDelete = () => {
    if (!article || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await deletePressArticleAction(article.id);

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      setSaveSucceeded(true);
      setDeleteOpen(false);
      router.push(ADMIN_LIST_PATHS.press);
      router.refresh();
    });
  };

  return (
    <AdminFormShell>
      <AdminFormHeader
        breadcrumbs={[
          { label: "כתבות וראיונות", href: ADMIN_LIST_PATHS.press },
          { label: mode === "create" ? "כתבה חדשה" : "עריכת כתבה" },
        ]}
        title={mode === "create" ? "כתבה חדשה" : "עריכת כתבה"}
        description="העלאת כתבות וראיונות מהעיתונות להצגה באתר"
        meta={<AdminStatusBadge status={values.status} size="sm" />}
        secondaryActions={
          mode === "edit" ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              מחיקה
            </Button>
          ) : null
        }
      />

      <AdminFormBody>
        <AdminFormSection
          title="פרטי הכתבה"
          description="כותרת, גוף תקשורת ותיאור קצר"
        >
          <FormField
            label="כותרת"
            htmlFor="press-title"
            error={fieldErrors.title}
            required={values.status === "published"}
          >
            <Input
              id="press-title"
              value={values.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
          </FormField>

          <FormField
            label="Slug"
            htmlFor="press-slug"
            error={fieldErrors.slug}
            required={values.status === "published"}
            hint="כתובת העמוד באתר"
          >
            <Input
              id="press-slug"
              value={values.slug}
              dir="ltr"
              className="text-start"
              onChange={(event) => {
                setSlugTouched(true);
                setField("slug", event.target.value);
              }}
            />
          </FormField>

          <FormField
            label="תיאור קצר"
            htmlFor="press-excerpt"
            error={fieldErrors.excerpt}
          >
            <Textarea
              id="press-excerpt"
              value={values.excerpt}
              rows={3}
              onChange={(event) => setField("excerpt", event.target.value)}
            />
          </FormField>

          <FormField
            label="גוף התקשורת"
            htmlFor="press-publication"
            error={fieldErrors.publication_name}
            required={values.status === "published"}
          >
            <Input
              id="press-publication"
              value={values.publication_name}
              placeholder="לדוגמה: ידיעות אחרונות"
              onChange={(event) =>
                setField("publication_name", event.target.value)
              }
            />
          </FormField>

          <FormField
            label="תאריך פרסום"
            htmlFor="press-published-at"
            error={fieldErrors.published_at}
            required={values.status === "published"}
          >
            <Input
              id="press-published-at"
              type="date"
              value={values.published_at}
              onChange={(event) => setField("published_at", event.target.value)}
            />
          </FormField>
        </AdminFormSection>

        <AdminFormSection
          title="מדיה"
          description="קובץ PDF של הכתבה מספריית המדיה"
        >
          <ServiceMediaPicker
            fieldId="press-pdf"
            label="קובץ PDF"
            mimeFilter="pdf"
            required={values.status === "published"}
            value={values.pdf_media_id}
            preview={pdfPreview}
            error={fieldErrors.pdf_media_id}
            emptyTitle="בחרו קובץ PDF"
            emptyDescription="בחרו מספריית המדיה או העלו קובץ PDF של הכתבה"
            selectLabel="בחירת PDF"
            replaceLabel="החלפת PDF"
            dialogTitle="בחירת PDF מספריית המדיה"
            dialogDescription="בחרו קובץ PDF קיים מהספרייה"
            onChange={(mediaId, preview) => {
              setField("pdf_media_id", mediaId);
              setPdfPreview(
                preview
                  ? {
                      id: preview.id,
                      url: preview.url,
                      alt: preview.alt,
                      mimeType: preview.mimeType ?? "application/pdf",
                      sizeBytes: preview.sizeBytes ?? 0,
                    }
                  : null
              );
            }}
          />
        </AdminFormSection>

        <AdminFormSection title="תצוגה וסטטוס">
          <FormField
            label="סדר תצוגה"
            htmlFor="press-display-order"
            error={fieldErrors.display_order}
            hint="מספר נמוך יותר מופיע קודם"
          >
            <Input
              id="press-display-order"
              type="number"
              min={0}
              value={values.display_order}
              onChange={(event) =>
                setField(
                  "display_order",
                  Number.parseInt(event.target.value || "0", 10) || 0
                )
              }
            />
          </FormField>

          <div className="space-y-2">
            <Select
              id="press-status"
              label="סטטוס"
              value={values.status}
              error={Boolean(fieldErrors.status)}
              onChange={(event) =>
                setField(
                  "status",
                  event.target.value as PressArticleFormValues["status"]
                )
              }
            >
              {PRESS_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PRESS_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            {fieldErrors.status ? (
              <p role="alert" className="text-caption text-[var(--color-error)]">
                {fieldErrors.status}
              </p>
            ) : null}
          </div>
        </AdminFormSection>

        <section className="admin-form-section border-b-0 pb-0">
          <button
            type="button"
            className="admin-interactive flex w-full items-center justify-between gap-4 py-2 text-start"
            aria-expanded={seoOpen}
            onClick={() => setSeoOpen((open) => !open)}
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
                seoOpen && "rotate-180"
              )}
            />
          </button>

          {seoOpen ? (
            <div className="mt-6 space-y-5">
              <FormField
                label="SEO Title"
                htmlFor="press-seo-title"
                error={fieldErrors.seo_title}
              >
                <Input
                  id="press-seo-title"
                  value={values.seo_title}
                  placeholder={values.title || "כותרת הכתבה"}
                  onChange={(event) => setField("seo_title", event.target.value)}
                />
              </FormField>
              <FormField
                label="SEO Description"
                htmlFor="press-seo-description"
                error={fieldErrors.seo_description}
              >
                <Textarea
                  id="press-seo-description"
                  rows={3}
                  value={values.seo_description}
                  placeholder={
                    values.excerpt ||
                    values.publication_name ||
                    "תיאור קצר לתוצאות חיפוש"
                  }
                  onChange={(event) =>
                    setField("seo_description", event.target.value)
                  }
                />
              </FormField>
            </div>
          ) : null}
        </section>
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.press}
        isDirty={isDirty}
        isPending={isPending}
        onSave={handleSubmit}
        saveLabel={
          values.status === "published" ? "שמירה ופרסום" : "שמירת טיוטה"
        }
      />

      {mode === "edit" && article ? (
        <PressDeleteDialog
          open={deleteOpen}
          title={article.title || "כתבה ללא כותרת"}
          isPending={isPending}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      ) : null}

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        onClose={closeToast}
      />
    </AdminFormShell>
  );
}
