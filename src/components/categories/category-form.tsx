"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import {
  AdminFormBody,
  AdminFormDivider,
  AdminFormSection,
} from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { SlugFormField } from "@/components/admin/slug-form-field";
import { CategoryDeleteDialog } from "@/components/categories/category-delete-dialog";
import { ContentTypeBadge } from "@/components/admin/content-type-badge";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { CATEGORY_TYPE_LABELS } from "@/lib/categories/constants";
import type { CategoryListItem } from "@/lib/categories/types";
import { slugifyCategoryName } from "@/lib/categories/slug";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  categoryInputSchema,
  mapZodErrors,
  type CategoryInput,
} from "@/lib/validations/category";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialValues: CategoryInput;
  category?: CategoryListItem;
};

function buildSnapshot(values: CategoryInput) {
  return JSON.stringify(values);
}

export function CategoryForm({
  mode,
  initialValues,
  category,
}: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    category?.imageUrl
      ? {
          id: category.image_media_id ?? "",
          url: category.imageUrl,
          alt: category.imageAlt ?? category.name,
        }
      : null
  );
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

  const canDelete = mode === "edit" && (category?.usageCount ?? 0) === 0;

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const setField = <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
      slug:
        mode === "edit" || slugTouched
          ? current.slug
          : slugifyCategoryName(name),
    }));
  };

  const handleSlugResetFromName = () => {
    if (mode === "edit") {
      return;
    }

    setSlugTouched(false);
    setValues((current) => ({
      ...current,
      slug: slugifyCategoryName(current.name),
    }));
  };

  const handleSubmit = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const parsed = categoryInputSchema.safeParse(values);

      if (!parsed.success) {
        setFieldErrors(mapZodErrors(parsed.error));
        showToast("error", "יש לתקן את השדות המסומנים.");
        return;
      }

      const result =
        mode === "create"
          ? await createCategoryAction(parsed.data)
          : await updateCategoryAction({
              ...parsed.data,
              id: category!.id,
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
        ADMIN_LIST_PATHS.category,
        mode === "create"
          ? "הקטגוריה נוצרה בהצלחה."
          : "הקטגוריה עודכנה בהצלחה."
      );
    });
  };

  const handleDelete = () => {
    if (!category) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategoryAction({ id: category.id });

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.category, "הקטגוריה נמחקה.");
    });
  };

  const secondaryActions =
    canDelete ? (
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
    <AdminFormShell width="standard" withActionBar>
      <AdminFormHeader
        breadcrumbs={[
          { label: "קטגוריות", href: ADMIN_LIST_PATHS.category },
          {
            label: mode === "create" ? "קטגוריה חדשה" : "עריכת קטגוריה",
          },
        ]}
        title={mode === "create" ? "קטגוריה חדשה" : "עריכת קטגוריה"}
        description="ניהול פרטי הקטגוריה והתמונה האופציונלית שלה"
        meta={
          mode === "edit" && category ? (
            <>
              <ContentTypeBadge type={category.type} size="sm" />
              <span className="text-sm text-[var(--color-text-muted)]">
                {category.usageCount === 0
                  ? "לא בשימוש"
                  : `${category.usageCount} פריטים משויכים`}
              </span>
            </>
          ) : mode === "create" ? (
            <ContentTypeBadge type={values.type} size="sm" />
          ) : null
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
        <AdminFormSection title="מידע כללי">
          <FormField
            label="שם"
            htmlFor="category-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="category-name"
              value={values.name}
              maxLength={80}
              error={Boolean(fieldErrors.name)}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </FormField>

          <SlugFormField
            label="כתובת (slug)"
            htmlFor="category-slug"
            value={values.slug}
            hint={
              mode === "edit"
                ? undefined
                : "נוצר אוטומטית מהשם. ניתן לעריכה ידנית לפני השמירה הראשונה."
            }
            locked={mode === "edit"}
            error={fieldErrors.slug}
            onChange={(slug) => setField("slug", slug)}
            onManualEdit={() => setSlugTouched(true)}
            onResetFromTitle={handleSlugResetFromName}
          />
        </AdminFormSection>

        <AdminFormDivider />

        <AdminFormSection
          title="תמונת קטגוריה"
          description="התמונה אופציונלית ותשמש להצגת הקטגוריה באתר."
        >
          <ServiceMediaPicker
            fieldId="field-category-image"
            variant="minimal"
            label="תמונת קטגוריה"
            value={values.image_media_id}
            preview={imagePreview}
            error={fieldErrors.image_media_id}
            onChange={(mediaId, preview) => {
              setField("image_media_id", mediaId);
              setImagePreview(preview);
            }}
          />
        </AdminFormSection>

        {mode === "edit" && category && category.usageCount > 0 ? (
          <>
            <AdminFormDivider />
            <p className="text-sm text-[var(--color-text-muted)]">
              לא ניתן למחוק קטגוריה שמשויכת ל-{category.usageCount} פריטים.
            </p>
          </>
        ) : null}
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.category}
        onSave={handleSubmit}
        isDirty={isDirty}
        isPending={isPending}
      />

      <CategoryDeleteDialog
        open={deleteOpen}
        categoryName={values.name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminFormShell>
  );
}
