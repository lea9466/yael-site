"use client";

import { Button } from "@/components/ui/button";

type MediaBulkActionBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
};

export function MediaBulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
}: MediaBulkActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="פעולות על פריטים נבחרים"
      aria-live="polite"
      className="sticky bottom-4 z-20 mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)] sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-medium">
        נבחרו {selectedCount} תמונות
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onClearSelection}
        >
          נקה בחירה
        </Button>
        <Button
          variant="danger"
          className="w-full sm:w-auto"
          onClick={onDeleteSelected}
        >
          מחיקת הנבחרות
        </Button>
      </div>
    </div>
  );
}
