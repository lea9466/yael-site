"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, GripVertical, Images, Plus, Trash2 } from "lucide-react";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { MediaMultiSelectDialog } from "@/components/media/media-multi-select-dialog";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { ARTICLE_REPEATER_LIMITS } from "@/lib/articles/constants";

export type ArticleGalleryFormItem = {
  id: string;
  media_id: string;
  order: number;
  preview: {
    url: string;
    alt: string;
  } | null;
};

type ArticleGalleryFieldProps = {
  items: ArticleGalleryFormItem[];
  error?: string;
  onChange: (items: ArticleGalleryFormItem[]) => void;
};

export function createArticleGalleryItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ArticleGalleryField({
  items,
  error,
  onChange,
}: ArticleGalleryFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ArticleGalleryFormItem | null>(
    null
  );

  const maxItems = ARTICLE_REPEATER_LIMITS.gallery.max;
  const remainingSlots = maxItems - items.length;
  const canAdd = remainingSlots > 0;

  const handleAddMultiple = (
    selected: Array<{ id: string; url: string; alt: string }>
  ) => {
    const toAdd = selected.slice(0, remainingSlots);

    onChange([
      ...items,
      ...toAdd.map((item, index) => ({
        id: createArticleGalleryItemId(),
        media_id: item.id,
        order: items.length + index,
        preview: { url: item.url, alt: item.alt },
      })),
    ]);
  };

  const handleRemove = (id: string) => {
    onChange(
      items
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, order: index }))
    );
  };

  const handleDragStart = (index: number) => (event: React.DragEvent) => {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetIndex: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      sourceIndex >= items.length
    ) {
      return;
    }

    const nextItems = [...items];
    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    onChange(nextItems.map((item, index) => ({ ...item, order: index })));
  };

  return (
    <div id="section-gallery" className="space-y-6">
      <AdminSectionHeader
        icon={Images}
        module="articles"
        emoji="🖼️"
        title="גלריה"
        description={`עד ${maxItems} תמונות נוספות — הציגי את הפוסט בצורה עשירה.`}
      />

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop(index)}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]/50"
            >
              <div className="relative aspect-square">
                {item.preview?.url ? (
                  <Image
                    src={item.preview.url}
                    alt={item.preview.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : null}

                <div className="absolute inset-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/35 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="גרירה לסידור מחדש"
                    className="rounded-[var(--radius-sm)] bg-black/45 p-1.5 text-white"
                  >
                    <GripVertical aria-hidden="true" className="size-4" />
                  </button>

                  <div className="flex gap-1">
                    <IconButton
                      label="תצוגה מקדימה"
                      size="sm"
                      className="bg-black/45 text-white hover:bg-black/60"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye aria-hidden="true" className="size-4" />
                    </IconButton>
                    <IconButton
                      label="הסרת תמונה"
                      size="sm"
                      className="bg-black/45 text-white hover:bg-black/60"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {canAdd ? (
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            הוספת תמונות
          </Button>
          <Button type="button" variant="ghost" onClick={() => setUploadOpen(true)}>
            העלאת תמונות חדשות
          </Button>
        </div>
      ) : null}

      <p className="text-sm text-[var(--color-text-muted)]">
        {items.length} מתוך {maxItems} תמונות
        {canAdd ? ` · ניתן להוסיף עוד ${remainingSlots}` : ""}
      </p>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <MediaMultiSelectDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        maxSelectable={remainingSlots}
        excludedIds={items.map((item) => item.media_id)}
        title="הוספת תמונות לגלריה"
        description={`בחרו עד ${remainingSlots} תמונות מהספרייה`}
        onConfirm={handleAddMultiple}
      />

      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          setPickerOpen(true);
        }}
      />

      <Dialog
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title="תצוגה מקדימה"
        panelClassName="max-w-3xl"
      >
        {previewItem?.preview?.url ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]">
            <Image
              src={previewItem.preview.url}
              alt={previewItem.preview.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
