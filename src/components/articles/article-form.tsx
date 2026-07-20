"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  BookOpen,
  Eye,
  FileText,
  Image,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  archiveArticleAction,
  createArticleAction,
  permanentlyDeleteArticleAction,
  publishArticleAction,
  restoreAndPublishArticleAction,
  restoreArticleToDraftAction,
  updateArticleAction,
} from "@/actions/articles";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminFormActionBar } from "@/components/admin/admin-form-action-bar";
import { AdminFormBody } from "@/components/admin/admin-form-section";
import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { AdminFormShell } from "@/components/admin/admin-form-shell";
import { SlugFormField } from "@/components/admin/slug-form-field";
import { AdminSeoSection } from "@/components/admin/admin-seo-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  ArticleEditor,
  articleBlocksToEditorBlocks,
  editorBlocksToArticleBlocks,
  type EditorBlockUnion,
} from "@/components/articles/article-editor";
import { ArticleArchiveDialog } from "@/components/articles/article-archive-dialog";
import { ArticleDeleteDialog } from "@/components/articles/article-delete-dialog";
import {
  ArticleGalleryField,
  createArticleGalleryItemId,
  type ArticleGalleryFormItem,
} from "@/components/articles/article-gallery-field";
import { ArticleTagPicker } from "@/components/articles/article-tag-picker";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ARTICLE_ERRORS } from "@/lib/articles/errors";
import { calculateReadingTimeMinutes } from "@/lib/articles/reading-time";
import { formatReadingTimeLabel } from "@/lib/articles/format";
import { slugifyTitle } from "@/lib/articles/slug";
import type {
  ArticleCategorySummary,
  ArticleDetail,
  ArticleTagSummary,
} from "@/lib/articles/types";
import { ADMIN_LIST_PATHS } from "@/lib/forms/admin-list-paths";
import {
  buildValidationSummary,
  focusFirstFieldError,
  getFieldErrorMessage,
} from "@/lib/forms/article-validation-feedback";
import { redirectAfterSave } from "@/lib/forms/redirect-after-save";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";
import { extractPlainTextFromBlocks } from "@/lib/articles/content";
import {
  articleDraftInputSchema,
  articlePublishInputSchema,
  mapZodErrors,
  type ArticleDraftInput,
} from "@/lib/validations/article";

type FormContentState = {
  blocks: EditorBlockUnion[];
  gallery: ArticleGalleryFormItem[];
};

type ArticleFormProps = {
  mode: "create" | "edit";
  initialArticle?: ArticleDetail;
  initialValues: ArticleDraftInput;
  categories: ArticleCategorySummary[];
  availableTags: ArticleTagSummary[];
};

function toEditorContent(
  content: ArticleDraftInput["content"],
  galleryUrls?: ArticleDetail["galleryUrls"],
  blockMediaUrls?: ArticleDetail["blockMediaUrls"]
): FormContentState {
  return {
    blocks: articleBlocksToEditorBlocks(content.blocks, blockMediaUrls),
    gallery: content.gallery
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((item) => {
        const urlInfo = galleryUrls?.find(
          (galleryItem) => galleryItem.media_id === item.media_id
        );

        return {
          id: createArticleGalleryItemId(),
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

function toSubmitContent(content: FormContentState): ArticleDraftInput["content"] {
  return {
    blocks: editorBlocksToArticleBlocks(content.blocks),
    gallery: content.gallery.map((item, index) => ({
      media_id: item.media_id,
      order: index,
    })),
  };
}

function buildSnapshot(input: {
  values: ArticleDraftInput;
  content: FormContentState;
}) {
  return JSON.stringify({
    ...input.values,
    content: toSubmitContent(input.content),
  });
}

export function ArticleForm({
  mode,
  initialArticle,
  initialValues,
  categories,
  availableTags,
}: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [content, setContent] = useState(() =>
    toEditorContent(
      initialValues.content,
      initialArticle?.galleryUrls,
      initialArticle?.blockMediaUrls
    )
  );
  const [coverPreview, setCoverPreview] = useState(
    initialArticle?.coverUrl
      ? {
          id: initialArticle.cover_media_id,
          url: initialArticle.coverUrl,
          alt: initialArticle.coverAlt ?? initialArticle.title,
        }
      : null
  );
  const [ogPreview, setOgPreview] = useState(
    initialArticle?.ogUrl
      ? {
          id: initialArticle.seo_og_media_id ?? "",
          url: initialArticle.ogUrl,
          alt: initialArticle.ogAlt ?? initialArticle.title,
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
  const readingTimeMinutes = calculateReadingTimeMinutes(
    editorBlocksToArticleBlocks(content.blocks)
  );
  const readingTimeLabel = formatReadingTimeLabel(readingTimeMinutes);
  const seoDescriptionSource = extractPlainTextFromBlocks(
    editorBlocksToArticleBlocks(content.blocks)
  );

  const initialSnapshot = useMemo(
    () =>
      buildSnapshot({
        values: initialValues,
        content: toEditorContent(
          initialValues.content,
          initialArticle?.galleryUrls,
          initialArticle?.blockMediaUrls
        ),
      }),
    [initialValues, initialArticle?.galleryUrls, initialArticle?.blockMediaUrls]
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

  const setField = <K extends keyof ArticleDraftInput>(
    key: K,
    value: ArticleDraftInput[K]
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

  const buildPayload = (status: ArticleDraftInput["status"]): ArticleDraftInput => ({
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
        mode === "create" ? "draft" : (initialArticle?.status ?? values.status);
      const payload = buildPayload(statusToKeep);
      const parsed = articleDraftInputSchema.safeParse(payload);

      if (!parsed.success) {
        showValidationFeedback(
          mapZodErrors(parsed.error),
          "יש לתקן את השדות המסומנים."
        );
        return;
      }

      const result =
        mode === "create"
          ? await createArticleAction(parsed.data)
          : await updateArticleAction({
              ...parsed.data,
              id: initialArticle!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.article,
        "הפוסט נשמר בהצלחה."
      );
    });
  };

  const handlePublish = () => {
    if (!hasCategories) {
      showToast("error", ARTICLE_ERRORS.categoryMissing);
      return;
    }

    if (isPending) {
      return;
    }

    startTransition(async () => {
      closeToast();
      setFieldErrors({});

      const payload = buildPayload("published");
      const parsed = articlePublishInputSchema.safeParse({
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
          ? await createArticleAction(parsed.data)
          : await publishArticleAction({
              ...parsed.data,
              id: initialArticle!.id,
            });

      if (!result.success) {
        showActionError(result.error, result.fieldErrors ?? {});
        return;
      }

      setSaveSucceeded(true);
      setFieldErrors({});
      redirectAfterSave(
        router,
        ADMIN_LIST_PATHS.article,
        "הפוסט פורסם בהצלחה."
      );
    });
  };

  const handleArchive = () => {
    if (!initialArticle) {
      return;
    }

    startTransition(async () => {
      const result = await archiveArticleAction({ id: initialArticle.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setArchiveOpen(false);
      showToast("success", "הפוסט הועבר לארכיון.");
      router.refresh();
    });
  };

  const handleRestore = (publish: boolean) => {
    if (!initialArticle) {
      return;
    }

    startTransition(async () => {
      const result = publish
        ? await restoreAndPublishArticleAction({ id: initialArticle.id })
        : await restoreArticleToDraftAction({ id: initialArticle.id });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      showToast(
        "success",
        publish ? "הפוסט שוחזר ופורסם." : "הפוסט שוחזר כטיוטה."
      );
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!initialArticle) {
      return;
    }

    startTransition(async () => {
      const result = await permanentlyDeleteArticleAction({
        id: initialArticle.id,
      });

      if (!result.success) {
        showActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      setSaveSucceeded(true);
      redirectAfterSave(router, ADMIN_LIST_PATHS.article, "הפוסט נמחק.");
    });
  };

  const currentStatus = initialArticle?.status ?? values.status;
  const showPublish =
    currentStatus !== "archived" &&
    (mode === "create" || currentStatus === "draft");

  const secondaryActions = (
    <>
      {mode === "edit" ? (
        <Link
          href={`/admin/articles/${initialArticle!.id}/preview`}
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
                showToast("error", ARTICLE_ERRORS.categoryMissing);
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
          { label: "פוסטים", href: ADMIN_LIST_PATHS.article },
          {
            label: mode === "create" ? "פוסט חדש" : "עריכת פוסט",
          },
        ]}
        title={mode === "create" ? "פוסט חדש" : "עריכת פוסט"}
        description={
          mode === "create"
            ? "כתבי פוסט מקצועי חדש. אפשר לשמור כטיוטה ולפרסם כשמוכן."
            : "ערכי את הפוסט, התוכן והתמונות. שמרי כטיוטה או פרסמי בכל שלב."
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
              module="articles"
              emoji="📝"
              title="מידע בסיסי"
              description="כותרת, כתובת, קטגוריה ותמונת כיסוי."
            />

            {!hasCategories ? (
              <div
                role="alert"
                className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning)]"
              >
                <p>{ARTICLE_ERRORS.categoryMissing}</p>
                <Link
                  href="/admin/categories/new?type=article"
                  className="mt-2 inline-flex font-medium underline underline-offset-2"
                >
                  יצירת קטגוריית פוסטים
                </Link>
              </div>
            ) : null}

            <FormField
              label="כותרת"
              htmlFor="article-title"
              required
              error={fieldErrors.title}
            >
              <Input
                id="article-title"
                value={values.title}
                maxLength={120}
                error={Boolean(fieldErrors.title)}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </FormField>

            <SlugFormField
              label="כתובת פוסט (slug)"
              htmlFor="article-slug"
              value={values.slug}
              error={fieldErrors.slug}
              onChange={(slug) => setField("slug", slug)}
              onManualEdit={() => setSlugTouched(true)}
              onResetFromTitle={handleSlugResetFromTitle}
            />

            {hasCategories ? (
              <Select
                id="article-category"
                label="קטגוריה"
                value={values.category_id}
                error={Boolean(fieldErrors.category_id)}
                onChange={(event) => setField("category_id", event.target.value)}
              >
                <option value="" disabled>
                  בחרי קטגוריה
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
                htmlFor="article-category"
                required
                error={fieldErrors.category_id ?? ARTICLE_ERRORS.categoryMissing}
              >
                <Input
                  id="article-category"
                  value=""
                  disabled
                  placeholder="אין קטגוריות פוסטים במערכת"
                  error
                />
              </FormField>
            )}

            <ServiceMediaPicker
              fieldId="field-cover-media"
              label="תמונת כיסוי"
              description="נדרשת לשמירה. לפרסום חובה."
              value={values.cover_media_id}
              preview={coverPreview}
              required
              error={fieldErrors.cover_media_id}
              onChange={(mediaId, preview) => {
                setField("cover_media_id", mediaId);
                setCoverPreview(preview);
              }}
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 px-4 py-3">
              <Checkbox
                checked={values.featured}
                onChange={(event) => setField("featured", event.target.checked)}
              />
              <span className="flex items-center gap-2 text-sm">
                <Sparkles aria-hidden="true" className="size-4 text-[var(--color-soft-accent)]" />
                סימון כפוסט מומלץ
              </span>
            </label>
          </section>

          <section className="space-y-5">
            <AdminSectionHeader
              icon={BookOpen}
              module="articles"
              emoji="✍️"
              title="תוכן עריכה"
              description="כתבי את גוף הפוסט בסגנון מגזין — פסקאות, כותרות, ציטוטים ותמונות."
            />

            <ArticleEditor
              blocks={content.blocks}
              readingTimeLabel={readingTimeLabel}
              error={getFieldErrorMessage(fieldErrors, "content.blocks")}
              onChange={(blocks) => setContent((current) => ({ ...current, blocks }))}
            />
          </section>

          <section className="space-y-5">
            <AdminSectionHeader
              icon={Image}
              module="articles"
              emoji="🖼️"
              title="תגיות וגלריה"
              description="הוסיפי תגיות ותמונות משלימות לפוסט."
            />

            <ArticleTagPicker
              selectedIds={values.tag_ids}
              initialTags={availableTags}
              error={fieldErrors.tag_ids}
              onChange={(tagIds) => setField("tag_ids", tagIds)}
            />

            <ArticleGalleryField
              items={content.gallery}
              error={getFieldErrorMessage(fieldErrors, "content.gallery")}
              onChange={(gallery) => setContent((current) => ({ ...current, gallery }))}
            />
          </section>

          <AdminSeoSection
            open={seoOpen}
            onOpenChange={setSeoOpen}
            seoTitle={values.seo.title}
            seoDescription={values.seo.description}
            ogMediaId={values.seo_og_media_id}
            ogPreview={ogPreview}
            titleSource={values.title}
            descriptionSource={seoDescriptionSource}
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

          <p className="text-sm text-[var(--color-text-muted)]">
            המערכת יוצרת ערכי SEO אוטומטיים. בדרך כלל אין צורך לשנות אותם.
          </p>
        </div>
      </AdminFormBody>

      <AdminFormActionBar
        cancelHref={ADMIN_LIST_PATHS.article}
        onSave={handleSave}
        onPublish={showPublish ? handlePublish : undefined}
        showPublish={showPublish}
        isDirty={isDirty}
        isPending={isPending}
        saveLabel="שמירה"
        publishLabel="פרסום"
      />

      {initialArticle ? (
        <>
          <ArticleArchiveDialog
            open={archiveOpen}
            articleTitle={initialArticle.title}
            loading={isPending}
            onClose={() => setArchiveOpen(false)}
            onConfirm={handleArchive}
          />
          <ArticleDeleteDialog
            open={deleteOpen}
            articleTitle={initialArticle.title}
            loading={isPending}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </AdminFormShell>
  );
}
