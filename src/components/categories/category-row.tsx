"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { deleteCategoryAction } from "@/actions/categories";
import { CategoryDeleteDialog } from "@/components/categories/category-delete-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_TYPE_LABELS } from "@/lib/categories/constants";
import { formatCategoryDate } from "@/lib/categories/format";
import type { CategoryListItem } from "@/lib/categories/types";

type CategoryRowProps = {
  item: CategoryListItem;
};

export function CategoryRow({ item }: CategoryRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const canDelete = item.usageCount === 0;

  const handleDelete = () => {
    startTransition(async () => {
      setActionError("");
      const result = await deleteCategoryAction({ id: item.id });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <article className="surface-card overflow-visible p-0">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-card-title" title={item.name}>
              {item.name}
            </h3>
            <Badge variant="neutral">{CATEGORY_TYPE_LABELS[item.type]}</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]" dir="ltr">
            {item.slug}
          </p>
          <div className="flex flex-wrap gap-3 text-caption text-[var(--color-text-muted)]">
            <span>
              {item.usageCount === 0
                ? "לא בשימוש"
                : `${item.usageCount} פריטים משויכים`}
            </span>
            <span>נוצר: {formatCategoryDate(item.created_at)}</span>
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
          <DropdownMenuItem
            onSelect={() => router.push(`/admin/categories/${item.id}`)}
          >
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

      <CategoryDeleteDialog
        open={deleteOpen}
        categoryName={item.name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </article>
  );
}
