"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Copy,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  deleteCertificateAction,
  duplicateCertificateAction,
} from "@/actions/certificates";
import { CertificateDeleteDialog } from "@/components/certificates/certificate-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MultilineText } from "@/components/ui/multiline-text";
import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import { cn } from "@/lib/utils/cn";

type CertificateCardProps = {
  item: CertificateListItem;
  updatedAt: string;
  onEdit: (item: CertificateListItem) => void;
  onUpdatedAtChange: (updatedAt: string) => void;
  onDragStart: (index: number) => (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (index: number) => (event: React.DragEvent) => void;
  index: number;
};

export function CertificateCard({
  item,
  updatedAt,
  onEdit,
  onUpdatedAtChange,
  onDragStart,
  onDragOver,
  onDrop,
  index,
}: CertificateCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const yearLabel = formatCertificateYear(item.year);

  const handleDuplicate = () => {
    startTransition(async () => {
      setActionError("");
      const result = await duplicateCertificateAction({
        id: item.id,
        updatedAt,
      });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      if (result.data?.updatedAt) {
        onUpdatedAtChange(result.data.updatedAt);
      }

      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      setActionError("");
      const result = await deleteCertificateAction({
        id: item.id,
        updatedAt,
      });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      if (result.data?.updatedAt) {
        onUpdatedAtChange(result.data.updatedAt);
      }

      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <article
      draggable
      onDragStart={onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={onDrop(index)}
      className={cn(
        "admin-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        isPending && "opacity-70"
      )}
    >
      <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)]">
        {item.mediaPreview?.url ? (
          <Image
            src={item.mediaPreview.url}
            alt={item.mediaPreview.alt || item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-text-muted)]">
            תמונה חסרה
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
          <button
            type="button"
            aria-label={`גרירה לסידור מחדש — ${item.title}`}
            className="admin-interactive flex size-9 cursor-grab items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface)]/90 text-[var(--color-text-muted)] opacity-0 shadow-[var(--shadow-sm)] transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical aria-hidden="true" className="size-4" />
          </button>

          <DropdownMenu
            triggerLabel="פעולות"
            trigger={
              <span className="admin-interactive flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface)]/90 text-[var(--color-text)] opacity-0 shadow-[var(--shadow-sm)] transition-opacity group-hover:opacity-100">
                <MoreVertical aria-hidden="true" className="size-4" />
              </span>
            }
          >
            <DropdownMenuItem onSelect={() => onEdit(item)}>
              <Pencil aria-hidden="true" className="size-4" />
              עריכה
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDuplicate}>
              <Copy aria-hidden="true" className="size-4" />
              שכפול
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              מחיקה
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-card-title" title={item.title}>
            {item.title}
          </h3>
          <p
            className="truncate text-sm text-[var(--color-text-muted)]"
            title={item.organization}
          >
            {item.organization}
          </p>
          {yearLabel ? (
            <p className="text-caption text-[var(--color-text-muted)]">
              שנת {yearLabel}
            </p>
          ) : null}
        </div>

        {item.description ? (
          <MultilineText
            as="p"
            className="line-clamp-3 text-sm text-[var(--color-text-muted)]"
          >
            {item.description}
          </MultilineText>
        ) : null}

        {actionError ? (
          <p role="alert" className="text-caption text-[var(--color-error)]">
            {actionError}
          </p>
        ) : null}
      </div>

      <CertificateDeleteDialog
        open={deleteOpen}
        title={item.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </article>
  );
}
