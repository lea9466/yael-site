"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { deletePressArticleAction } from "@/actions/press";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminListItem } from "@/components/admin/admin-empty-state";
import { PressDeleteDialog } from "@/components/press/press-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FormToast } from "@/components/ui/form-toast";
import { formatPressDateShort } from "@/lib/press/date";
import type { PressArticleListItem } from "@/lib/press/types";

type PressRowProps = {
  item: PressArticleListItem;
};

export function PressRow({ item }: PressRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePressArticleAction(item.id);

      if (!result.success) {
        setToast({
          open: true,
          variant: "error",
          message: result.error,
        });
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <AdminListItem>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]">
            {item.coverUrl ? (
              <Image
                src={item.coverUrl}
                alt={item.coverAlt ?? item.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-caption text-[var(--color-text-muted)]">
                אין
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/press/${item.id}`}
                className="truncate text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]"
              >
                {item.title || "ללא כותרת"}
              </Link>
              <AdminStatusBadge status={item.status} />
            </div>
            <p className="text-caption text-[var(--color-text-muted)]">
              {item.publication_name || "—"} ·{" "}
              {formatPressDateShort(item.published_at)} · סדר{" "}
              {item.display_order}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href={`/admin/press/${item.id}`}
              className="admin-interactive inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]"
              aria-label={`עריכת ${item.title || "כתבה"}`}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Link>
            <DropdownMenu
              triggerLabel="פעולות"
              trigger={<MoreVertical aria-hidden="true" className="size-4" />}
            >
              <DropdownMenuItem
                onSelect={() => router.push(`/admin/press/${item.id}`)}
              >
                <Pencil aria-hidden="true" className="size-4" />
                עריכה
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
        </div>
      </AdminListItem>

      <PressDeleteDialog
        open={deleteOpen}
        title={item.title || "כתבה ללא כותרת"}
        isPending={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </>
  );
}
