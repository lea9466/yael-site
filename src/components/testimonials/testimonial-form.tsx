"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import {
  createTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialAction,
} from "@/actions/testimonials";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import {
  AdminFormBody,
  AdminFormSection,
} from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { TestimonialDeleteDialog } from "@/components/testimonials/testimonial-delete-dialog";
import { TestimonialPreviewCard } from "@/components/testimonials/testimonial-public-view";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TESTIMONIAL_CONTENT_MAX,
  TESTIMONIAL_PUBLICATION_STATUS_LABELS,
  TESTIMONIAL_PUBLICATION_STATUSES,
} from "@/lib/testimonials/constants";
import { getTestimonialContentLength } from "@/lib/testimonials/text";
import type {
  ServiceOption,
  TestimonialDetail,
  TestimonialFormValues,
} from "@/lib/testimonials/types";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  mapZodErrors,
  testimonialInputSchema,
} from "@/lib/validations/testimonial";

type TestimonialFormProps = {
  mode: "create" | "edit";
  initialValues: TestimonialFormValues;
  testimonial?: TestimonialDetail;
  serviceOptions: ServiceOption[];
};

function buildSnapshot(values: TestimonialFormValues) {
  return JSON.stringify(values);
}

export function TestimonialForm({
  mode,
  initialValues,
  testimonial,
  serviceOptions,
}: TestimonialFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
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

  const selectedServiceTitle =
    serviceOptions.find((option) => option.id === values.service_id)?.title ??
    testimonial?.serviceTitle ??
    null;

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const setField = <K extends keyof TestimonialFormValues>(
    key: K,
    value: TestimonialFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const parsed = testimonialInputSchema.safeParse(values);

      if (!parsed.success) {
        setFieldErrors(mapZodErrors(parsed.error));
        showToast("error", "יש לתקן את השדות המסומנים.");
        return;
      }

      const result =
        mode === "create"
          ? await createTestimonialAction(parsed.data)
          : await updateTestimonialAction({
              ...parsed.data,
              id: testimonial!.id,
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
        ADMIN_LIST_PATHS.testimonial,
        mode === "create"
          ? "ההמלצה נוצרה בהצלחה."
          : "ההמלצה עודכנה בהצלחה."
      );
    });
  };

  const handleDelete = () => {
    if (!testimonial) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTestimonialAction({ id: testimonial.id });

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.testimonial, "ההמלצה נמחקה.");
    });
  };

  const secondaryActions =
    mode === "edit" ? (
      <Button
        variant="ghost"
        size="sm"
        type="button"
        disabled={isPending}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 aria-hidden="true" className="size-4" />
        מחיקה
      </Button>
    ) : null;

  return (
    <AdminFormShell width="wide" withActionBar>
      <AdminFormHeader
        breadcrumbs={[
          { label: "המלצות", href: ADMIN_LIST_PATHS.testimonial },
          { label: mode === "create" ? "המלצה חדשה" : "עריכת המלצה" },
        ]}
        title={mode === "create" ? "המלצה חדשה" : "עריכת המלצה"}
        description="ניהול פרטי ההמלצה ואופן הצגתה באתר"
        meta={
          <>
            <AdminStatusBadge
              status={
                values.publication_status === "published" ? "published" : "draft"
              }
              size="sm"
            />
            {values.featured ? <AdminFeaturedBadge size="sm" /> : null}
          </>
        }
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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-8">
            <AdminFormSection title="פרטי הלקוח">
              <FormField
                label="לקוח"
                htmlFor="testimonial-name"
                required
                error={fieldErrors.name}
              >
                <Input
                  id="testimonial-name"
                  value={values.name}
                  maxLength={120}
                  error={Boolean(fieldErrors.name)}
                  onChange={(event) => setField("name", event.target.value)}
                />
              </FormField>

              <FormField
                label="עיר"
                htmlFor="testimonial-city"
                hint="אופציונלי"
                error={fieldErrors.city}
              >
                <Input
                  id="testimonial-city"
                  value={values.city}
                  maxLength={80}
                  error={Boolean(fieldErrors.city)}
                  onChange={(event) => setField("city", event.target.value)}
                />
              </FormField>

              <Select
                id="testimonial-service"
                label="שירות קשור"
                value={values.service_id ?? ""}
                error={Boolean(fieldErrors.service_id)}
                onChange={(event) =>
                  setField(
                    "service_id",
                    event.target.value.length > 0 ? event.target.value : null
                  )
                }
              >
                <option value="">ללא שירות</option>
                {serviceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </Select>
              <p className="text-caption text-[var(--color-text-muted)]">
                אופציונלי. ניתן גם לנהל את שיוך ההמלצות מתוך מסך עריכת השירות.
              </p>
            </AdminFormSection>

            <AdminFormSection title="תוכן ההמלצה">
              <FormField
                label="טקסט ההמלצה"
                htmlFor="testimonial-content"
                required
                error={fieldErrors.content}
              >
                <Textarea
                  id="testimonial-content"
                  value={values.content}
                  maxLength={TESTIMONIAL_CONTENT_MAX}
                  rows={8}
                  error={Boolean(fieldErrors.content)}
                  onChange={(event) => setField("content", event.target.value)}
                />
              </FormField>
              <p className="text-caption text-[var(--color-text-muted)]">
                {getTestimonialContentLength(values.content)}/{TESTIMONIAL_CONTENT_MAX}{" "}
                תווים. שורות חדשות נשמרות כפי שהוזנו.
              </p>
            </AdminFormSection>

            <AdminFormSection title="הגדרות פרסום">
              <Select
                id="testimonial-status"
                label="סטטוס"
                required
                value={values.publication_status}
                error={Boolean(fieldErrors.publication_status)}
                onChange={(event) =>
                  setField(
                    "publication_status",
                    event.target.value as TestimonialFormValues["publication_status"]
                  )
                }
              >
                {TESTIMONIAL_PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TESTIMONIAL_PUBLICATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>

              <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                <Checkbox
                  checked={values.featured}
                  onChange={(event) => setField("featured", event.target.checked)}
                />
                <span>הצגה מודגשת בדף הבית</span>
              </label>
            </AdminFormSection>
          </div>

          <AdminFormSection title="תצוגה מקדימה">
            <TestimonialPreviewCard
              values={values}
              serviceTitle={selectedServiceTitle}
            />
          </AdminFormSection>
        </div>
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.testimonial}
        onSave={handleSubmit}
        isDirty={isDirty}
        isPending={isPending}
      />

      {mode === "edit" && testimonial ? (
        <TestimonialDeleteDialog
          open={deleteOpen}
          clientName={values.name}
          loading={isPending}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </AdminFormShell>
  );
}
