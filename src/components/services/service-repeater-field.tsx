"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusRepeaterItemFirstField } from "@/lib/forms/repeater-autofocus";
import { cn } from "@/lib/utils/cn";

export type RepeaterFieldHelpers = {
  requestAdd: () => void;
  isLast: boolean;
};

type RepeaterFieldProps<T extends { id: string }> = {
  label: string;
  description?: string;
  items: T[];
  minItems?: number;
  maxItems: number;
  addLabel: string;
  emptyLabel: string;
  error?: string;
  variant?: "default" | "article";
  /** Where the primary add control appears. Default keeps legacy top placement. */
  addButtonPlacement?: "top" | "bottom" | "both";
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderFields: (
    item: T,
    index: number,
    updateItem: (nextItem: T) => void,
    helpers: RepeaterFieldHelpers
  ) => React.ReactNode;
};

export function RepeaterField<T extends { id: string }>({
  label,
  description,
  items,
  minItems = 0,
  maxItems,
  addLabel,
  emptyLabel,
  error,
  variant = "default",
  addButtonPlacement = "top",
  onChange,
  createItem,
  renderFields,
}: RepeaterFieldProps<T>) {
  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;
  const isArticle = variant === "article";
  const showTopAdd =
    addButtonPlacement === "top" || addButtonPlacement === "both";
  const showBottomAdd =
    addButtonPlacement === "bottom" || addButtonPlacement === "both";
  const [pendingFocusItemId, setPendingFocusItemId] = useState<string | null>(
    null
  );
  const [liveMessage, setLiveMessage] = useState("");
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }

    const newItem = createItem();
    setPendingFocusItemId(newItem.id);
    setLiveMessage("נוסף פריט חדש");
    onChange([...items, newItem]);
  };

  useLayoutEffect(() => {
    if (!pendingFocusItemId) {
      return;
    }

    const container = itemRefs.current.get(pendingFocusItemId);

    if (!container) {
      return;
    }

    focusRepeaterItemFirstField(container);
    setPendingFocusItemId(null);
  }, [pendingFocusItemId, items]);

  useLayoutEffect(() => {
    if (!liveMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLiveMessage("");
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [liveMessage]);

  const handleRemove = (id: string) => {
    if (!canRemove) {
      return;
    }

    itemRefs.current.delete(id);
    onChange(items.filter((item) => item.id !== id));
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
    onChange(nextItems);
  };

  const getItemLabel = (index: number) =>
    isArticle ? `שלב ${index + 1}` : `פריט ${index + 1}`;

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!canAdd}
      onClick={handleAdd}
    >
      <Plus aria-hidden="true" className="size-4" />
      {addLabel}
    </Button>
  );

  return (
    <div
      className={cn(
        "space-y-5",
        error && "rounded-[var(--radius-lg)] p-4 ring-1 ring-[var(--color-error)]/30"
      )}
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </h3>
          {description ? (
            <p className="text-caption text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {showTopAdd ? addButton : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const itemLabel = getItemLabel(index);
            const helpers: RepeaterFieldHelpers = {
              requestAdd: handleAdd,
              isLast: index === items.length - 1,
            };

            return (
              <li
                key={item.id}
                ref={(node) => {
                  if (node) {
                    itemRefs.current.set(item.id, node);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop(index)}
                className={cn(
                  "admin-interactive group min-w-0 rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-4 py-5",
                  "ring-1 ring-[var(--color-border)]/80 hover:ring-[var(--color-primary)]/20 hover:shadow-[var(--shadow-sm)]",
                  isArticle && "px-5 py-6"
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button
                      type="button"
                      aria-label={`גרירה לסידור מחדש — ${itemLabel}`}
                      className="admin-interactive shrink-0 cursor-grab rounded-[var(--radius-sm)] p-1 text-[var(--color-text-muted)] opacity-50 transition-opacity hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)] group-hover:opacity-100 active:cursor-grabbing"
                    >
                      <GripVertical aria-hidden="true" className="size-4" />
                    </button>
                    <span className="text-caption font-medium text-[var(--color-text-muted)]">
                      {itemLabel}
                    </span>
                  </div>
                  <IconButton
                    label={`הסרת ${itemLabel}`}
                    size="sm"
                    disabled={!canRemove}
                    className="shrink-0 opacity-60 group-hover:opacity-100"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </IconButton>
                </div>
                {renderFields(
                  item,
                  index,
                  (nextItem) => {
                    onChange(
                      items.map((current) =>
                        current.id === item.id ? nextItem : current
                      )
                    );
                  },
                  helpers
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showBottomAdd ? (
        <div className="flex justify-start">{addButton}</div>
      ) : null}

      {error ? (
        <p role="alert" className="text-caption text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RepeaterTextField({
  value,
  onChange,
  placeholder,
  error,
  id,
  className,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
  id?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      error={error}
      className={cn("min-w-0", className)}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}

export function RepeaterTextareaField({
  value,
  onChange,
  placeholder,
  error,
  id,
  className,
  autoResize = false,
  minHeightPx = 64,
  maxHeightPx = 220,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
  id?: string;
  className?: string;
  autoResize?: boolean;
  minHeightPx?: number;
  maxHeightPx?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}) {
  if (autoResize) {
    return (
      <AutoResizeTextarea
        id={id}
        value={value}
        placeholder={placeholder}
        error={error}
        minHeightPx={minHeightPx}
        maxHeightPx={maxHeightPx}
        className={cn(
          "min-w-0 text-base leading-[var(--line-height-relaxed)]",
          className
        )}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <Textarea
      id={id}
      value={value}
      placeholder={placeholder}
      error={error}
      className={cn(
        "min-h-32 min-w-0 text-base leading-[var(--line-height-relaxed)]",
        className
      )}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}

export function createRepeaterItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
