"use client";

import { useEffect, useState, useTransition } from "react";

import { searchArticleTagsAction } from "@/actions/taxonomy";
import { TAG_PILL_CLASSES } from "@/lib/articles/constants";
import type { ArticleTagSummary } from "@/lib/articles/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type ArticleTagPickerProps = {
  selectedIds: string[];
  initialTags: ArticleTagSummary[];
  error?: string;
  onChange: (tagIds: string[]) => void;
};

export function ArticleTagPicker({
  selectedIds,
  initialTags,
  error,
  onChange,
}: ArticleTagPickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleTagSummary[] | null>(
    null
  );
  const [loadError, setLoadError] = useState("");
  const [isLoading, startLoading] = useTransition();

  const trimmedSearch = searchValue.trim();
  const items =
    trimmedSearch.length === 0 ? initialTags : (searchResults ?? []);

  const selectedTags = [...initialTags, ...(searchResults ?? [])].filter(
    (tag, index, array) =>
      selectedIds.includes(tag.id) &&
      array.findIndex((entry) => entry.id === tag.id) === index
  );

  useEffect(() => {
    if (trimmedSearch.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startLoading(async () => {
        setLoadError("");
        const result = await searchArticleTagsAction(trimmedSearch);

        if (!result.success) {
          setLoadError(result.error);
          return;
        }

        setSearchResults(result.items);
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [trimmedSearch]);

  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
      return;
    }

    onChange([...selectedIds, tagId]);
  };

  return (
    <div
      id="section-tags"
      className={cn(
        "space-y-3",
        error &&
          "rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-soft)]/35 p-3"
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">תגיות</p>
        <p className="text-caption text-[var(--color-text-muted)]">
          אופציונלי. ניתן לבחור מספר תגיות פוסטים.
        </p>
      </div>

      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              className={cn(
                "inline-flex items-center rounded-[var(--radius-full)] px-3 py-1.5 text-caption font-medium ring-1 transition-opacity hover:opacity-80",
                TAG_PILL_CLASSES[index % TAG_PILL_CLASSES.length]
              )}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name} ×
            </button>
          ))}
        </div>
      ) : null}

      <Input
        value={searchValue}
        placeholder="חיפוש תגית"
        onChange={(event) => {
          const nextValue = event.target.value;
          setSearchValue(nextValue);

          if (nextValue.trim().length === 0) {
            setSearchResults(null);
            setLoadError("");
          }
        }}
      />

      {loadError ? (
        <p role="alert" className="text-caption text-[var(--color-error)]">
          {loadError}
        </p>
      ) : null}

      <div className="max-h-56 space-y-2 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 p-3">
        {items.length === 0 && !isLoading ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            לא נמצאו תגיות פוסטים.
          </p>
        ) : null}

        {items.map((tag, index) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-surface-soft)]"
          >
            <Checkbox
              checked={selectedIds.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
            />
            <span
              className={cn(
                "rounded-[var(--radius-full)] px-2.5 py-1 text-caption font-medium ring-1",
                TAG_PILL_CLASSES[index % TAG_PILL_CLASSES.length]
              )}
            >
              {tag.name}
            </span>
          </label>
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-caption text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
