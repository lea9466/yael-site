"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { deleteTagAction } from "@/actions/tags";
import { AdminListItem } from "@/components/admin/admin-empty-state";
import { TagDeleteDialog } from "@/components/tags/tag-delete-dialog";
import { ContentTypeBadge } from "@/components/admin/content-type-badge";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getTagAccent } from "@/lib/tags/accent";
import { formatTagDate } from "@/lib/tags/format";
import type { TagListItem } from "@/lib/tags/types";

type TagRowProps = {
  item: TagListItem;
};

export function TagRow({ item }: TagRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const accent = getTagAccent(item.id);

  const canDelete = item.usageCount === 0;

  const handleDelete = () => {
    startTransition(async () => {
      setActionError("");
      const result = await deleteTagAction({ id: item.id });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <AdminListItem>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[var(--radius-full)]"
              style={{ backgroundColor: accent.solid }}
            />
            <h3 className="truncate text-card-title" title={item.name}>
              {item.name}
            </h3>
            <ContentTypeBadge type={item.type} size="sm" />
          </div>
          <p className="text-sm text-[var(--color-text-muted)]" dir="ltr">
            {item.slug}
          </p>
          <div className="flex flex-wrap gap-4 text-caption text-[var(--color-text-muted)]">
            <span>
              {item.usageCount === 0
                ? "לא בשימוש"
                : `${item.usageCount} פריטים משויכים`}
            </span>
            <span>נוצרה: {formatTagDate(item.created_at)}</span>
          </div>
          {actionError ? (
            <p role="alert" className="text-caption text-[var(--color-error)]">
              {actionError}
            </p>
          ) : null}
        </div>

        <DropdownMenu
          triggerLabel="פעולות"
          trigger={<MoreVertical aria-hidden="true" className="size-4" />}
        >
          <DropdownMenuItem onSelect={() => router.push(`/admin/tags/${item.id}`)}>
            <Pencil aria-hidden="true" className="size-4" />
            עריכה
          </DropdownMenuItem>
          {canDelete ? (
            <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              מחיקה
            </DropdownMenuItem>
          ) : null}
        </DropdownMenu>
      </div>

      <TagDeleteDialog
        open={deleteOpen}
        tagName={item.name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminListItem>
  );
}
