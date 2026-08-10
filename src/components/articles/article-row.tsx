"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Archive,
  Copy,
  Eye,
  FileMinus,
  MoreVertical,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";

import {
  archiveArticleAction,
  duplicateArticleAction,
  permanentlyDeleteArticleAction,
  quickPublishArticleAction,
  restoreArticleToDraftAction,
  unpublishArticleAction,
} from "@/actions/articles";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { AdminListItem } from "@/components/admin/admin-empty-state";
import { ArticleArchiveDialog } from "@/components/articles/article-archive-dialog";
import { ArticleDeleteDialog } from "@/components/articles/article-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FormToast } from "@/components/ui/form-toast";
import {
  formatArticleDate,
  formatArticleExcerpt,
  formatReadingTimeLabel,
} from "@/lib/articles/format";
import type { ArticleListItem } from "@/lib/articles/types";

type ArticleRowProps = {
  item: ArticleListItem;
};

export function ArticleRow({ item }: ArticleRowProps) {
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
    options?: {
      onSuccess?: () => void;
      successMessage?: string;
      navigateOnDuplicate?: boolean;
    }
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

      options?.onSuccess?.();

      if (options?.navigateOnDuplicate && result.data?.id) {
        router.push(`/admin/articles/${result.data.id}`);
        return;
      }

      if (options?.successMessage) {
        setToast({
          open: true,
          variant: "success",
          message: options.successMessage,
        });
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
              <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">
                {formatArticleExcerpt(item.body)}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatReadingTimeLabel(item.reading_time_minutes)}
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
                onSelect={() => router.push(`/admin/articles/${item.id}/preview`)}
              >
                <Eye aria-hidden="true" className="size-4" />
                תצוגה מקדימה
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/admin/articles/${item.id}`)}
              >
                <Pencil aria-hidden="true" className="size-4" />
                עריכה
              </DropdownMenuItem>

              {item.status === "draft" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    runAction(() => quickPublishArticleAction({ id: item.id }), {
                      successMessage: "פורסם בהצלחה",
                    })
                  }
                >
                  <Send aria-hidden="true" className="size-4" />
                  פרסום
                </DropdownMenuItem>
              ) : null}

              {item.status === "published" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    runAction(() => unpublishArticleAction({ id: item.id }), {
                      successMessage: "הועבר לטיוטה",
                    })
                  }
                >
                  <FileMinus aria-hidden="true" className="size-4" />
                  ביטול פרסום
                </DropdownMenuItem>
              ) : null}

              {item.status === "archived" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    runAction(() => restoreArticleToDraftAction({ id: item.id }), {
                      successMessage: "הועבר לטיוטה",
                    })
                  }
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  שחזור
                </DropdownMenuItem>
              ) : null}

              {item.status !== "archived" ? (
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>
                  <Archive aria-hidden="true" className="size-4" />
                  העברה לארכיון
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem
                onSelect={() =>
                  runAction(() => duplicateArticleAction({ id: item.id }), {
                    navigateOnDuplicate: true,
                  })
                }
              >
                <Copy aria-hidden="true" className="size-4" />
                שכפול
              </DropdownMenuItem>

              <DropdownMenuItem
                destructive
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                מחיקה
              </DropdownMenuItem>
            </DropdownMenu>
          </div>

          <p className="text-caption text-[var(--color-text-muted)]">
            עודכן: {formatArticleDate(item.updated_at)}
          </p>
        </div>
      </div>

      <ArticleArchiveDialog
        open={archiveOpen}
        articleTitle={item.title}
        loading={isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() =>
          runAction(() => archiveArticleAction({ id: item.id }), {
            onSuccess: () => setArchiveOpen(false),
            successMessage: "הועבר לארכיון",
          })
        }
      />

      <ArticleDeleteDialog
        open={deleteOpen}
        articleTitle={item.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          runAction(() => permanentlyDeleteArticleAction({ id: item.id }), {
            onSuccess: () => setDeleteOpen(false),
            successMessage: "הפוסט נמחק.",
          })
        }
      />
    </AdminListItem>
  );
}
