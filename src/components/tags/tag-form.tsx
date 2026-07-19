"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { createTagAction, deleteTagAction, updateTagAction } from "@/actions/tags";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import {
  AdminFormBody,
  AdminFormSection,
} from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { SlugFormField } from "@/components/admin/slug-form-field";
import { TagDeleteDialog } from "@/components/tags/tag-delete-dialog";
import { TagPreviewPill } from "@/components/tags/tag-preview-pill";
import { ContentTypeBadge } from "@/components/admin/content-type-badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TAG_TYPE_LABELS, TAG_TYPES } from "@/lib/tags/constants";
import type { TagListItem } from "@/lib/tags/types";
import { slugifyTagName } from "@/lib/tags/slug";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  mapZodErrors,
  tagInputSchema,
  type TagInput,
} from "@/lib/validations/tag";

type TagFormProps = {
  mode: "create" | "edit";
  initialValues: TagInput;
  tag?: TagListItem;
};

function buildSnapshot(values: TagInput) {
  return JSON.stringify(values);
}

export function TagForm({ mode, initialValues, tag }: TagFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
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

  const canDelete = mode === "edit" && (tag?.usageCount ?? 0) === 0;
  const previewSeed = tag?.id ?? values.name;

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const setField = <K extends keyof TagInput>(key: K, value: TagInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugifyTagName(name),
    }));
  };

  const handleSlugResetFromName = () => {
    setSlugTouched(false);
    setValues((current) => ({
      ...current,
      slug: slugifyTagName(current.name),
    }));
  };

  const handleSubmit = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const parsed = tagInputSchema.safeParse(values);

      if (!parsed.success) {
        setFieldErrors(mapZodErrors(parsed.error));
        showToast("error", "יש לתקן את השדות המסומנים.");
        return;
      }

      const result =
        mode === "create"
          ? await createTagAction(parsed.data)
          : await updateTagAction({ ...parsed.data, id: tag!.id });

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        showToast("error", result.error);
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.tag,
        mode === "create" ? "התגית נוצרה בהצלחה." : "התגית עודכנה בהצלחה."
      );
    });
  };

  const handleDelete = () => {
    if (!tag) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTagAction({ id: tag.id });

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.tag, "התגית נמחקה.");
    });
  };

  const secondaryActions = canDelete ? (
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
          { label: "תגיות", href: ADMIN_LIST_PATHS.tag },
          { label: mode === "create" ? "תגית חדשה" : "עריכת תגית" },
        ]}
        title={mode === "create" ? "תגית חדשה" : "עריכת תגית"}
        description="ניהול פרטי התגית ואופן הצגתה"
        meta={
          mode === "edit" && tag ? (
            <>
              <ContentTypeBadge type={tag.type} size="sm" />
              <span className="text-sm text-[var(--color-text-muted)]">
                {tag.usageCount === 0
                  ? "לא בשימוש"
                  : `${tag.usageCount} פריטים משויכים`}
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
          <Select
            id="tag-type"
            label="סוג"
            required
            value={values.type}
            disabled={mode === "edit"}
            error={Boolean(fieldErrors.type)}
            onChange={(event) =>
              setField("type", event.target.value as TagInput["type"])
            }
          >
            {TAG_TYPES.map((type) => (
              <option key={type} value={type}>
                {TAG_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>

          {mode === "edit" ? (
            <p className="text-caption text-[var(--color-text-muted)]">
              לא ניתן לשנות את סוג התגית לאחר יצירה.
            </p>
          ) : null}

          <FormField
            label="שם"
            htmlFor="tag-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="tag-name"
              value={values.name}
              maxLength={80}
              error={Boolean(fieldErrors.name)}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </FormField>

          <SlugFormField
            label="כתובת (slug)"
            htmlFor="tag-slug"
            value={values.slug}
            hint="נוצר אוטומטית מהשם. ניתן לעריכה ידנית."
            error={fieldErrors.slug}
            onChange={(slug) => setField("slug", slug)}
            onManualEdit={() => setSlugTouched(true)}
            onResetFromTitle={handleSlugResetFromName}
          />

          <div className="space-y-2">
            <span className="block text-sm font-medium text-[var(--color-text)]">
              תצוגה מקדימה
            </span>
            <TagPreviewPill name={values.name} seed={previewSeed} />
          </div>
        </AdminFormSection>

        {mode === "edit" && tag && tag.usageCount > 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            לא ניתן למחוק תגית המשויכת ל-{tag.usageCount}{" "}
            {tag.type === "recipe" ? "מתכונים" : "פוסטים"}.
          </p>
        ) : null}
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.tag}
        onSave={handleSubmit}
        isDirty={isDirty}
        isPending={isPending}
      />

      <TagDeleteDialog
        open={deleteOpen}
        tagName={values.name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminFormShell>
  );
}
