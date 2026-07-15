import { Checkbox } from "@/components/ui/checkbox";
import type { MediaListItem } from "@/lib/media/media-types";

import { MediaCard } from "@/components/media/media-card";

type MediaGridProps = {
  items: MediaListItem[];
  selectedIds: Set<string>;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleSelect: (item: MediaListItem) => void;
  onToggleSelectAllVisible: () => void;
  onPreview: (item: MediaListItem) => void;
  onEditAlt: (item: MediaListItem) => void;
  onDelete: (item: MediaListItem) => void;
};

export function MediaGrid({
  items,
  selectedIds,
  allVisibleSelected,
  someVisibleSelected,
  onToggleSelect,
  onToggleSelectAllVisible,
  onPreview,
  onEditAlt,
  onDelete,
}: MediaGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected && !allVisibleSelected}
            aria-label="בחירת כל התמונות בעמוד הנוכחי"
            onChange={onToggleSelectAllVisible}
          />
          בחירת כל התמונות בעמוד
        </label>

        {selectedIds.size > 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]" aria-live="polite">
            נבחרו {selectedIds.size} תמונות
          </p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggleSelect={onToggleSelect}
            onPreview={onPreview}
            onEditAlt={onEditAlt}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
