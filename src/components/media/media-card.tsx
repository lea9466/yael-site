"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  formatDimensions,
  formatFileSize,
  formatMediaDate,
} from "@/lib/media/format";
import type { MediaListItem } from "@/lib/media/media-types";
import { cn } from "@/lib/utils/cn";

type MediaCardProps = {
  item: MediaListItem;
  selected: boolean;
  onToggleSelect: (item: MediaListItem) => void;
  onPreview: (item: MediaListItem) => void;
  onEditAlt: (item: MediaListItem) => void;
  onDelete: (item: MediaListItem) => void;
};

async function copyPublicUrl(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
  } catch {
    return false;
  }
}

export function MediaCard({
  item,
  selected,
  onToggleSelect,
  onPreview,
  onEditAlt,
  onDelete,
}: MediaCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const displayName = item.original_file_name ?? item.file_name;

  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copyStatus]);

  const handleCopyUrl = async () => {
    if (!item.publicUrl) {
      setCopyStatus("error");
      return;
    }

    const copied = await copyPublicUrl(item.publicUrl);
    setCopyStatus(copied ? "success" : "error");
  };

  return (
    <article
      className={cn(
        "surface-card flex min-w-0 flex-col overflow-visible p-0 transition-shadow",
        selected &&
          "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-background)]"
      )}
    >
      <div className="relative overflow-hidden rounded-t-[var(--radius-lg)]">
        <div className="absolute start-3 top-3 z-10">
          <Checkbox
            checked={selected}
            aria-label={`בחירת ${displayName}`}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onChange={() => {
              onToggleSelect(item);
            }}
          />
        </div>

        <button
          type="button"
          className="group relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]/40"
          onClick={() => onPreview(item)}
          aria-label={`תצוגה מקדימה של ${displayName}`}
        >
          {item.publicUrl ? (
            <Image
              src={item.publicUrl}
              alt={item.alt_text ?? displayName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              אין תצוגה מקדימה
            </div>
          )}
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-card-title" title={displayName}>
              {displayName}
            </h3>
            <p className="truncate text-caption text-[var(--color-text-muted)]">
              {item.alt_text ? item.alt_text : "ללא טקסט חלופי"}
            </p>
          </div>

          <DropdownMenu
            triggerLabel="פעולות"
            trigger={<MoreVertical aria-hidden="true" className="size-4" />}
          >
            <DropdownMenuItem onSelect={() => onPreview(item)}>
              <Eye aria-hidden="true" className="size-4" />
              תצוגה מקדימה
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEditAlt(item)}>
              <Pencil aria-hidden="true" className="size-4" />
              עריכת טקסט חלופי
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCopyUrl}>
              <Copy aria-hidden="true" className="size-4" />
              העתקת כתובת ציבורית
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => onDelete(item)}>
              <Trash2 aria-hidden="true" className="size-4" />
              מחיקה
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <dl className="grid gap-1 text-caption text-[var(--color-text-muted)]">
          <div className="flex justify-between gap-2">
            <dt>מידות</dt>
            <dd>{formatDimensions(item.width, item.height)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>גודל</dt>
            <dd>{formatFileSize(item.size_bytes)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>הועלה</dt>
            <dd>{formatMediaDate(item.created_at)}</dd>
          </div>
        </dl>

        {copyStatus !== "idle" ? (
          <p
            role="status"
            className={cn(
              "text-caption",
              copyStatus === "success"
                ? "text-[var(--color-success)]"
                : "text-[var(--color-error)]"
            )}
          >
            {copyStatus === "success"
              ? "הכתובת הועתקה ללוח."
              : "לא ניתן להעתיק את הכתובת."}
          </p>
        ) : null}
      </div>
    </article>
  );
}
