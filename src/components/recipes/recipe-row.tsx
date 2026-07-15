"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Archive,
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";

import {
  archiveRecipeAction,
  duplicateRecipeAction,
  permanentlyDeleteRecipeAction,
  restoreAndPublishRecipeAction,
  restoreRecipeToDraftAction,
} from "@/actions/recipes";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { AdminListItem } from "@/components/admin/admin-empty-state";
import { RecipeArchiveDialog } from "@/components/recipes/recipe-archive-dialog";
import { RecipeDeleteDialog } from "@/components/recipes/recipe-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FormToast } from "@/components/ui/form-toast";
import {
  formatDifficulty,
  formatDurationMinutes,
  formatRecipeDate,
} from "@/lib/recipes/format";
import type { RecipeListItem } from "@/lib/recipes/types";

type RecipeRowProps = {
  item: RecipeListItem;
};

export function RecipeRow({ item }: RecipeRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    open: false,
    variant: "error",
    message: "",
  });

  const runAction = (
    action: () => Promise<{ success: boolean; error?: string; data?: { id: string } }>,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      setToast((current) => ({ ...current, open: false }));
      const result = await action();

      if (!result.success) {
        setToast({
          open: true,
          variant: "error",
          message: result.error ?? "הפעולה נכשלה.",
        });
        return;
      }

      onSuccess?.();

      if (result.data?.id) {
        router.push(`/admin/recipes/${result.data.id}`);
        return;
      }

      router.refresh();
    });
  };

  return (
    <AdminListItem>
      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] sm:size-36">
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={item.coverAlt ?? item.title}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-caption text-[var(--color-text-muted)]">
              אין תמונה
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <h3 className="truncate text-card-title" title={item.title}>
                {item.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {item.categoryName ?? "ללא קטגוריה"} ·{" "}
                {formatDurationMinutes(item.duration_minutes)} ·{" "}
                {formatDifficulty(item.difficulty)}
              </p>
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge status={item.status} />
                {item.featured ? <AdminFeaturedBadge /> : null}
              </div>
            </div>

            <DropdownMenu
              triggerLabel="פעולות"
              trigger={<MoreVertical aria-hidden="true" className="size-4" />}
            >
              <DropdownMenuItem
                onSelect={() => router.push(`/admin/recipes/${item.id}/preview`)}
              >
                <Eye aria-hidden="true" className="size-4" />
                תצוגה מקדימה
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/admin/recipes/${item.id}`)}
              >
                <Pencil aria-hidden="true" className="size-4" />
                עריכה
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  runAction(() => duplicateRecipeAction({ id: item.id }))
                }
              >
                <Copy aria-hidden="true" className="size-4" />
                שכפול
              </DropdownMenuItem>

              {item.status === "draft" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/admin/recipes/${item.id}?publish=1`)
                  }
                >
                  <Send aria-hidden="true" className="size-4" />
                  פרסום
                </DropdownMenuItem>
              ) : null}

              {item.status !== "archived" ? (
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>
                  <Archive aria-hidden="true" className="size-4" />
                  העברה לארכיון
                </DropdownMenuItem>
              ) : null}

              {item.status === "archived" ? (
                <>
                  <DropdownMenuItem
                    onSelect={() =>
                      runAction(() =>
                        restoreRecipeToDraftAction({ id: item.id })
                      )
                    }
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    שחזור כטיוטה
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      runAction(() =>
                        restoreAndPublishRecipeAction({ id: item.id })
                      )
                    }
                  >
                    <Send aria-hidden="true" className="size-4" />
                    שחזור ופרסום
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => setDeleteOpen(true)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    מחיקה לצמיתות
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenu>
          </div>

          <p className="text-caption text-[var(--color-text-muted)]">
            עודכן: {formatRecipeDate(item.updated_at)}
          </p>
        </div>
      </div>

      <RecipeArchiveDialog
        open={archiveOpen}
        recipeTitle={item.title}
        loading={isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() =>
          runAction(() => archiveRecipeAction({ id: item.id }), () =>
            setArchiveOpen(false)
          )
        }
      />

      <RecipeDeleteDialog
        open={deleteOpen}
        recipeTitle={item.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          runAction(() => permanentlyDeleteRecipeAction({ id: item.id }), () =>
            setDeleteOpen(false)
          )
        }
      />
    </AdminListItem>
  );
}
