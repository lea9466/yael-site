"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  ChefHat,
  Clock,
  Eye,
  FileText,
  Image,
  Leaf,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  archiveRecipeAction,
  createRecipeAction,
  permanentlyDeleteRecipeAction,
  publishRecipeAction,
  restoreAndPublishRecipeAction,
  restoreRecipeToDraftAction,
  updateRecipeAction,
} from "@/actions/recipes";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import { AdminFormBody } from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { AdminSeoSection } from "@/components/admin/admin-seo-section";
import { RecipeArchiveDialog } from "@/components/recipes/recipe-archive-dialog";
import { RecipeDeleteDialog } from "@/components/recipes/recipe-delete-dialog";
import {
  createGalleryItemId,
  RecipeGalleryField,
  type GalleryFormItem,
} from "@/components/recipes/recipe-gallery-field";
import { RecipeTagPicker } from "@/components/recipes/recipe-tag-picker";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
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
  getFieldErrorMessage,
} from "@/lib/forms/recipe-validation-feedback";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import {
  DIFFICULTY_LABELS,
  RECIPE_DESCRIPTION_MAX,
  RECIPE_REPEATER_LIMITS,
} from "@/lib/recipes/constants";
import { RECIPE_ERRORS } from "@/lib/recipes/errors";
import { slugifyTitle } from "@/lib/recipes/slug";
import type {
  RecipeCategorySummary,
  RecipeDetail,
  RecipeTagSummary,
} from "@/lib/recipes/types";
import {
  mapZodErrors,
  recipeDraftInputSchema,
  recipePublishInputSchema,
  type RecipeDraftInput,
} from "@/lib/validations/recipe";

type IngredientRepeaterItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

type StepRepeaterItem = {
  id: string;
  text: string;
};

type FormContentState = {
  ingredients: IngredientRepeaterItem[];
  steps: StepRepeaterItem[];
  yael_tip: string;
  gallery: GalleryFormItem[];
};

type RecipeFormProps = {
  mode: "create" | "edit";
  initialRecipe?: RecipeDetail;
  initialValues: RecipeDraftInput;
  categories: RecipeCategorySummary[];
  availableTags: RecipeTagSummary[];
};

function toRepeaterContent(
  content: RecipeDraftInput["content"],
  galleryUrls?: RecipeDetail["galleryUrls"]
): FormContentState {
  return {
    ingredients: content.ingredients.map((item) => ({
      id: createRepeaterItemId(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    })),
    steps: content.steps.map((item) => ({
      id: createRepeaterItemId(),
      text: item.text,
    })),
    yael_tip: content.yael_tip ?? "",
    gallery: content.gallery
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((item) => {
        const urlInfo = galleryUrls?.find(
          (galleryItem) => galleryItem.media_id === item.media_id
        );

        return {
          id: createGalleryItemId(),
          media_id: item.media_id,
          order: item.order,
          preview: urlInfo?.url
            ? {
                url: urlInfo.url,
                alt: urlInfo.alt ?? "",
              }
            : null,
        };
      }),
  };
}

function toSubmitContent(content: FormContentState): RecipeDraftInput["content"] {
  return {
    ingredients: content.ingredients
      .filter((item) => item.name.trim().length > 0)
      .map(({ name, quantity, unit }) => ({
        name: name.trim(),
        quantity: quantity.trim(),
        unit: unit.trim(),
      })),
    steps: content.steps
      .filter((item) => item.text.trim().length > 0)
      .map(({ text }) => ({ text: text.trim() })),
    yael_tip:
      content.yael_tip.trim().length > 0 ? content.yael_tip.trim() : null,
    gallery: content.gallery.map((item, index) => ({
      media_id: item.media_id,
      order: index,
    })),
  };
}

function buildSnapshot(input: {
  values: RecipeDraftInput;
  content: FormContentState;
}) {
  return JSON.stringify({
    ...input.values,
    content: toSubmitContent(input.content),
  });
}

export function RecipeForm({
  mode,
  initialRecipe,
  initialValues,
  categories,
  availableTags,
}: RecipeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [content, setContent] = useState(() =>
    toRepeaterContent(
      initialValues.content,
      initialRecipe?.galleryUrls
    )
  );
  const [coverPreview, setCoverPreview] = useState(
    initialRecipe?.coverUrl
      ? {
          id: initialRecipe.cover_media_id,
          url: initialRecipe.coverUrl,
          alt: initialRecipe.coverAlt ?? initialRecipe.title,
        }
      : null
  );
  const [ogPreview, setOgPreview] = useState(
    initialRecipe?.ogUrl
      ? {
          id: initialRecipe.seo_og_media_id ?? "",
          url: initialRecipe.ogUrl,
          alt: initialRecipe.ogAlt ?? initialRecipe.title,
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

  const hasCategories = categories.length > 0;

  const initialSnapshot = useMemo(
    () =>
      buildSnapshot({
        values: initialValues,
        content: toRepeaterContent(
          initialValues.content,
          initialRecipe?.galleryUrls
        ),
      }),
    [initialValues, initialRecipe?.galleryUrls]
  );

  const currentSnapshot = useMemo(
    () => buildSnapshot({ values, content }),
    [values, content]
  );

  const isDirty = !saveSucceeded && currentSnapshot !== initialSnapshot;
  useUnsavedChangesWarning(isDirty && !isPending);

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

    if (
      Object.keys(errors).some(
        (key) => key.startsWith("seo.") || key === "seo_og_media_id"
      )
    ) {
      setSeoOpen(true);
    }

    focusFirstFieldError(errors);
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

  const setField = <K extends keyof RecipeDraftInput>(
    key: K,
    value: RecipeDraftInput[K]
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

  const buildPayload = (status: RecipeDraftInput["status"]): RecipeDraftInput => ({
    ...values,
    status,
    content: toSubmitContent(content),
  });

  const handleSaveDraft = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const payload = buildPayload("draft");
      const parsed = recipeDraftInputSchema.safeParse(payload);

      if (!parsed.success) {
        showValidationFeedback(
          mapZodErrors(parsed.error),
          "יש לתקן את השדות המסומנים."
        );
        return;
      }

      const result =
        mode === "create"
          ? await createRecipeAction(parsed.data)
          : await updateRecipeAction({
              ...parsed.data,
              id: initialRecipe!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.recipe,
        "המתכון נשמר כטיוטה."
      );
    });
  };

  const handlePublish = () => {
    if (!hasCategories) {
      showToast("error", RECIPE_ERRORS.categoryMissing);
      return;
    }

    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const payload = buildPayload("published");
      const parsed = recipePublishInputSchema.safeParse({
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
          ? await createRecipeAction(parsed.data)
          : await publishRecipeAction({
              ...parsed.data,
              id: initialRecipe!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.recipe,
        "המתכון פורסם בהצלחה."
      );
    });
  };

  const handleArchive = () => {
    if (!initialRecipe) {
      return;
    }

    startTransition(async () => {
      const result = await archiveRecipeAction({ id: initialRecipe.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setArchiveOpen(false);
      showToast("success", "המתכון הועבר לארכיון.");
      router.refresh();
    });
  };

  const handleRestore = (publish: boolean) => {
    if (!initialRecipe) {
      return;
    }

    startTransition(async () => {
      const result = publish
        ? await restoreAndPublishRecipeAction({ id: initialRecipe.id })
        : await restoreRecipeToDraftAction({ id: initialRecipe.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      showToast(
        "success",
        publish ? "המתכון שוחזר ופורסם." : "המתכון שוחזר כטיוטה."
      );
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!initialRecipe) {
      return;
    }

    startTransition(async () => {
      const result = await permanentlyDeleteRecipeAction({ id: initialRecipe.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.recipe, "המתכון נמחק.");
    });
  };

  const currentStatus = initialRecipe?.status ?? values.status;
  const showPublish =
    currentStatus !== "archived" && (mode === "create" || currentStatus === "draft");

  const secondaryActions = (
    <>
      {mode === "edit" ? (
        <Link
          href={`/admin/recipes/${initialRecipe!.id}/preview`}
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
            onClick={() => {
              if (!hasCategories) {
                showToast("error", RECIPE_ERRORS.categoryMissing);
                return;
              }
              handleRestore(true);
            }}
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
          { label: "מתכונים", href: ADMIN_LIST_PATHS.recipe },
          {
            label: mode === "create" ? "מתכון חדש" : "עריכת מתכון",
          },
        ]}
        title={mode === "create" ? "מתכון חדש" : "עריכת מתכון"}
        description={
          mode === "create"
            ? "צרי מתכון חדש שיופיע באתר. אפשר לשמור כטיוטה או לפרסם בכל שלב."
            : "ערכי את המתכון, הרכיבים והתמונות. שמרי כטיוטה או פרסמי בכל שלב."
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
        <div className="space-y-16">
        <section id="section-basic" className="space-y-5">
          <AdminSectionHeader
            icon={FileText}
            module="recipes"
            emoji="📋"
            title="מידע בסיסי"
            description="שם, תיאור וקטגוריה — הבסיס לכל מתכון מוצלח."
          />

          {!hasCategories ? (
            <div
              role="alert"
              className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning)]"
            >
              <p>{RECIPE_ERRORS.categoryMissing}</p>
              <Link
                href="/admin/categories/new?type=recipe"
                className="mt-2 inline-flex font-medium underline underline-offset-2"
              >
                יצירת קטגוריית מתכונים
              </Link>
            </div>
          ) : null}

          <FormField
            label="כותרת"
            htmlFor="recipe-title"
            required
            error={fieldErrors.title}
          >
            <Input
              id="recipe-title"
              value={values.title}
              maxLength={120}
              error={Boolean(fieldErrors.title)}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
          </FormField>

          <FormField
            label="כתובת מתכון (slug)"
            htmlFor="recipe-slug"
            required
            hint="נוצר אוטומטית מהכותרת. ניתן לעריכה ידנית."
            error={fieldErrors.slug}
          >
            <Input
              id="recipe-slug"
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
            label="תיאור"
            htmlFor="recipe-description"
            hint={`${values.description.length}/${RECIPE_DESCRIPTION_MAX}`}
            error={fieldErrors.description}
          >
            <Textarea
              id="recipe-description"
              value={values.description}
              maxLength={RECIPE_DESCRIPTION_MAX}
              error={Boolean(fieldErrors.description)}
              onChange={(event) => setField("description", event.target.value)}
            />
          </FormField>

          {hasCategories ? (
            <Select
              id="recipe-category"
              label="קטגוריה"
              required
              value={values.category_id}
              error={Boolean(fieldErrors.category_id)}
              onChange={(event) => setField("category_id", event.target.value)}
            >
              <option value="" disabled>
                בחרו קטגוריה
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          ) : (
            <FormField
              label="קטגוריה"
              htmlFor="recipe-category"
              required
              error={fieldErrors.category_id ?? RECIPE_ERRORS.categoryMissing}
            >
              <Input
                id="recipe-category"
                value=""
                disabled
                placeholder="אין קטגוריות מתכונים במערכת"
                error
              />
            </FormField>
          )}

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={values.featured}
              onChange={(event) => setField("featured", event.target.checked)}
            />
            מתכון מומלץ
          </label>

          <RecipeTagPicker
            selectedIds={values.tag_ids}
            initialTags={availableTags}
            error={fieldErrors.tag_ids}
            onChange={(tagIds) => setField("tag_ids", tagIds)}
          />
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="field-cover-media" className="space-y-5">
          <AdminSectionHeader
            icon={Image}
            module="recipes"
            emoji="📸"
            title="תמונה ראשית"
            description="תמונת הכיסוי — הראשונה שהמבקרים רואים."
          />
          <ServiceMediaPicker
            variant="minimal"
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
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="section-gallery">
          <RecipeGalleryField
            items={content.gallery}
            error={getFieldErrorMessage(fieldErrors, "content.gallery")}
            onChange={(items) =>
              setContent((current) => ({ ...current, gallery: items }))
            }
          />
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="section-details" className="space-y-5">
          <AdminSectionHeader
            icon={Clock}
            module="recipes"
            emoji="⏱️"
            title="פרטי המתכון"
            description="זמן הכנה, מנות ורמת קושי."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="משך הכנה (דקות)"
              htmlFor="recipe-duration"
              required
              error={fieldErrors.duration_minutes}
            >
              <Input
                id="recipe-duration"
                type="number"
                min={1}
                max={24 * 60}
                value={values.duration_minutes}
                error={Boolean(fieldErrors.duration_minutes)}
                onChange={(event) =>
                  setField("duration_minutes", Number(event.target.value))
                }
              />
            </FormField>

            <FormField
              label="מספר מנות"
              htmlFor="recipe-servings"
              required
              error={fieldErrors.servings}
            >
              <Input
                id="recipe-servings"
                type="number"
                min={1}
                max={100}
                value={values.servings}
                error={Boolean(fieldErrors.servings)}
                onChange={(event) =>
                  setField("servings", Number(event.target.value))
                }
              />
            </FormField>
          </div>

          <Select
            id="recipe-difficulty"
            label="רמת קושי"
            required
            value={values.difficulty}
            error={Boolean(fieldErrors.difficulty)}
            onChange={(event) =>
              setField(
                "difficulty",
                event.target.value as RecipeDraftInput["difficulty"]
              )
            }
          >
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="section-ingredients">
          <AdminSectionHeader
            icon={Leaf}
            module="recipes"
            emoji="🥗"
            title="רכיבים"
            description="הוסיפי את כל רכיבי המתכון — טריים ובריאים."
            className="mb-8"
          />
          <RepeaterField
            label="רכיבים"
            description="שם הרכיב חובה. כמות ויחידת מידה אופציונליות."
            items={content.ingredients}
            minItems={RECIPE_REPEATER_LIMITS.ingredients.min}
            maxItems={RECIPE_REPEATER_LIMITS.ingredients.max}
            addLabel="הוספת רכיב"
            emptyLabel="הוסיפו לפחות רכיב אחד לפני פרסום"
            error={getFieldErrorMessage(fieldErrors, "content.ingredients")}
            createItem={() => ({
              id: createRepeaterItemId(),
              name: "",
              quantity: "",
              unit: "",
            })}
            onChange={(items) =>
              setContent((current) => ({ ...current, ingredients: items }))
            }
            renderFields={(item, _index, updateItem) => (
              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <FormField
                  label="רכיב"
                  htmlFor={`ingredient-name-${item.id}`}
                  required
                >
                  <RepeaterTextField
                    id={`ingredient-name-${item.id}`}
                    value={item.name}
                    placeholder="לדוגמה: עגבנייה"
                    onChange={(name) => updateItem({ ...item, name })}
                  />
                </FormField>
                <FormField
                  label="כמות"
                  htmlFor={`ingredient-quantity-${item.id}`}
                  hint="אופציונלי"
                >
                  <RepeaterTextField
                    id={`ingredient-quantity-${item.id}`}
                    value={item.quantity}
                    placeholder="לדוגמה: 2, חצי, לפי הטעם"
                    onChange={(quantity) => updateItem({ ...item, quantity })}
                  />
                </FormField>
                <FormField
                  label="יחידת מידה"
                  htmlFor={`ingredient-unit-${item.id}`}
                  hint="אופציונלי"
                >
                  <RepeaterTextField
                    id={`ingredient-unit-${item.id}`}
                    value={item.unit}
                    placeholder="לדוגמה: כוס, כפית"
                    onChange={(unit) => updateItem({ ...item, unit })}
                  />
                </FormField>
              </div>
            )}
          />
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="section-steps">
          <AdminSectionHeader
            icon={ChefHat}
            module="recipes"
            emoji="👩‍🍳"
            title="שלבי הכנה"
            description="כתבי את שלבי ההכנה בצורה ברורה — כמו במגזין."
            className="mb-8"
          />
          <RepeaterField
            label="שלבי הכנה"
            variant="article"
            items={content.steps}
            minItems={RECIPE_REPEATER_LIMITS.steps.min}
            maxItems={RECIPE_REPEATER_LIMITS.steps.max}
            addLabel="הוספת שלב"
            emptyLabel="הוסיפו לפחות שלב אחד לפני פרסום"
            error={getFieldErrorMessage(fieldErrors, "content.steps")}
            createItem={() => ({
              id: createRepeaterItemId(),
              text: "",
            })}
            onChange={(items) =>
              setContent((current) => ({ ...current, steps: items }))
            }
            renderFields={(item, _index, updateItem) => (
              <RepeaterTextareaField
                value={item.text}
                placeholder="תארי את השלב — כמו שכותבים מאמר"
                className="min-h-36"
                onChange={(text) => updateItem({ ...item, text })}
              />
            )}
          />
        </section>

        <hr className="border-[var(--color-border)]" />

        <section id="section-tip" className="space-y-4">
          <AdminSectionHeader
            icon={Sparkles}
            module="recipes"
            emoji="🌿"
            title="הטיפ של יעל"
            description="הוסיפי טיפ אישי שיעשיר את המתכון."
          />
          <FormField
            label="טיפ אישי"
            htmlFor="recipe-yael-tip"
            hint="אופציונלי"
            error={fieldErrors["content.yael_tip"]}
          >
            <Textarea
              id="recipe-yael-tip"
              value={content.yael_tip}
              className="min-h-32"
              maxLength={2000}
              error={Boolean(fieldErrors["content.yael_tip"])}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  yael_tip: event.target.value,
                }))
              }
            />
          </FormField>
        </section>

        <hr className="border-[var(--color-border)]" />

        <AdminSeoSection
          open={seoOpen}
          onOpenChange={setSeoOpen}
          seoTitle={values.seo.title}
          seoDescription={values.seo.description}
          ogMediaId={values.seo_og_media_id}
          ogPreview={ogPreview}
          titleSource={values.title}
          descriptionSource={values.description}
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
        cancelHref={ADMIN_LIST_PATHS.recipe}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        showPublish={showPublish}
        isDirty={isDirty}
        isPending={isPending}
        publishDisabled={!hasCategories}
      />

      <RecipeArchiveDialog
        open={archiveOpen}
        recipeTitle={values.title}
        loading={isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
      />

      <RecipeDeleteDialog
        open={deleteOpen}
        recipeTitle={values.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminFormShell>
  );
}
