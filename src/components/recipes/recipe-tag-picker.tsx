"use client";

import { useEffect, useState, useTransition } from "react";

import { searchRecipeTagsAction } from "@/actions/taxonomy";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { RecipeTagSummary } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeTagPickerProps = {
  selectedIds: string[];
  initialTags: RecipeTagSummary[];
  error?: string;
  onChange: (tagIds: string[]) => void;
};

export function RecipeTagPicker({
  selectedIds,
  initialTags,
  error,
  onChange,
}: RecipeTagPickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<RecipeTagSummary[] | null>(
    null
  );
  const [loadError, setLoadError] = useState("");
  const [isLoading, startLoading] = useTransition();

  const trimmedSearch = searchValue.trim();
  const items =
    trimmedSearch.length === 0 ? initialTags : (searchResults ?? []);

  useEffect(() => {
    if (trimmedSearch.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startLoading(async () => {
        setLoadError("");
        const result = await searchRecipeTagsAction(trimmedSearch);

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
      className={cn(
        "space-y-3",
        error &&
          "rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-soft)]/35 p-3"
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">תגיות</p>
        <p className="text-caption text-[var(--color-text-muted)]">
          אופציונלי. ניתן לבחור מספר תגיות מתכונים.
        </p>
      </div>

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
            לא נמצאו תגיות מתכונים.
          </p>
        ) : null}

        {items.map((tag) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-surface-soft)]"
          >
            <Checkbox
              checked={selectedIds.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
            />
            <span className="text-sm">{tag.name}</span>
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
