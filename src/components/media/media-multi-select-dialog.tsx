"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import { searchMediaPickerAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaListItem } from "@/lib/media/media-types";
import { cn } from "@/lib/utils/cn";

export type MultiSelectMediaItem = {
  id: string;
  url: string;
  alt: string;
};

type MediaMultiSelectDialogProps = {
  open: boolean;
  onClose: () => void;
  maxSelectable: number;
  excludedIds?: string[];
  title?: string;
  description?: string;
  onConfirm: (items: MultiSelectMediaItem[]) => void;
};

export function MediaMultiSelectDialog({
  open,
  onClose,
  maxSelectable,
  excludedIds = [],
  title = "בחירת תמונות מספריית המדיה",
  description = "בחרו מספר תמונות ואשרו את הבחירה",
  onConfirm,
}: MediaMultiSelectDialogProps) {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Record<string, MultiSelectMediaItem>
  >({});
  const [isLoading, startLoading] = useTransition();

  const excludedSet = useMemo(() => new Set(excludedIds), [excludedIds]);

  const loadItems = (query: string, nextPage: number) => {
    startLoading(async () => {
      setLoadError("");
      const result = await searchMediaPickerAction(query, nextPage);

      if (!result.success) {
        setLoadError(result.error ?? "לא ניתן לטעון תמונות.");
        setItems([]);
        return;
      }

      setItems(result.items);
      setTotalPages(result.totalPages);
      setPage(nextPage);
    });
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSelectedItemsMap({});
    setSearchValue("");
    onClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      loadItems(searchValue, 1);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue, open]);

  const toggleItem = (item: MediaListItem) => {
    if (excludedSet.has(item.id)) {
      return;
    }

    if (selectedIds.includes(item.id)) {
      setSelectedIds((current) => current.filter((id) => id !== item.id));
      setSelectedItemsMap((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      return;
    }

    if (selectedIds.length >= maxSelectable) {
      return;
    }

    setSelectedIds((current) => [...current, item.id]);
    setSelectedItemsMap((current) => ({
      ...current,
      [item.id]: {
        id: item.id,
        url: item.publicUrl ?? "",
        alt: item.alt_text ?? item.original_file_name ?? item.file_name,
      },
    }));
  };

  const handleConfirm = () => {
    const selectedItems = selectedIds
      .map((id) => selectedItemsMap[id])
      .filter((item): item is MultiSelectMediaItem => Boolean(item));

    onConfirm(selectedItems);
    handleClose();
  };

  const remainingSlots = maxSelectable - selectedIds.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      className="p-3 sm:p-6"
      panelClassName="max-h-[min(90dvh,760px)] w-[min(960px,calc(100vw-32px))]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            נבחרו {selectedIds.length} מתוך {maxSelectable}
            {remainingSlots > 0
              ? ` · נותרו ${remainingSlots} מקומות`
              : " · הגעתם למקסימום"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              ביטול
            </Button>
            <Button
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
            >
              <Check aria-hidden="true" className="size-4" />
              הוספת {selectedIds.length} תמונות
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          value={searchValue}
          placeholder="חיפוש לפי שם קובץ או טקסט חלופי"
          onChange={(event) => setSearchValue(event.target.value)}
        />

        {loadError ? (
          <p role="alert" className="text-sm text-[var(--color-error)]">
            {loadError}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isExcluded = excludedSet.has(item.id);
            const isSelected = selectedIds.includes(item.id);
            const isDisabled =
              isExcluded || (!isSelected && selectedIds.length >= maxSelectable);

            return (
              <button
                key={item.id}
                type="button"
                disabled={isDisabled}
                className={cn(
                  "relative overflow-hidden rounded-[var(--radius-md)] border text-start transition-shadow",
                  isSelected
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-border)] hover:shadow-[var(--shadow-sm)]",
                  isDisabled && !isSelected && "cursor-not-allowed opacity-50"
                )}
                onClick={() => toggleItem(item)}
              >
                <div className="absolute start-2 top-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => toggleItem(item)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </div>

                <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)]">
                  {item.publicUrl ? (
                    <Image
                      src={item.publicUrl}
                      alt={item.alt_text ?? item.file_name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="truncate px-3 py-2 text-sm">
                  {item.original_file_name ?? item.file_name}
                </p>
              </button>
            );
          })}
        </div>

        {items.length === 0 && !isLoading ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            לא נמצאו תמונות.
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => loadItems(searchValue, page - 1)}
          >
            הקודם
          </Button>
          <p className="text-caption text-[var(--color-text-muted)]">
            עמוד {page} מתוך {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => loadItems(searchValue, page + 1)}
          >
            הבא
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
