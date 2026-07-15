"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

type RepeaterFieldProps<T extends { id: string }> = {
  label: string;
  description?: string;
  items: T[];
  minItems?: number;
  maxItems: number;
  addLabel: string;
  emptyLabel: string;
  error?: string;
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderFields: (
    item: T,
    index: number,
    updateItem: (nextItem: T) => void
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
  onChange,
  createItem,
  renderFields,
}: RepeaterFieldProps<T>) {
  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }

    onChange([...items, createItem()]);
  };

  const handleRemove = (id: string) => {
    if (!canRemove) {
      return;
    }

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

  return (
    <div
      className={cn(
        "space-y-4",
        error &&
          "rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-soft)]/35 p-3"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </h3>
          {description ? (
            <p className="text-caption text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
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
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/50 px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop(index)}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-caption text-[var(--color-text-muted)]">
                  <GripVertical aria-hidden="true" className="size-4" />
                  פריט {index + 1}
                </div>
                <IconButton
                  label="הסרת פריט"
                  size="sm"
                  disabled={!canRemove}
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </IconButton>
              </div>
              {renderFields(item, index, (nextItem) => {
                onChange(
                  items.map((current) =>
                    current.id === item.id ? nextItem : current
                  )
                );
              })}
            </li>
          ))}
        </ul>
      )}

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
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
}) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      error={error}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function RepeaterTextareaField({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
}) {
  return (
    <Textarea
      value={value}
      placeholder={placeholder}
      error={error}
      className="min-h-24"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function createRepeaterItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
