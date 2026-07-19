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
  archiveServiceAction,
  duplicateServiceAction,
  permanentlyDeleteServiceAction,
  restoreServiceAction,
} from "@/actions/services";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { AdminListItem } from "@/components/admin/admin-empty-state";
import { ServiceArchiveDialog } from "@/components/services/service-archive-dialog";
import { ServiceDeleteDialog } from "@/components/services/service-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MultilineText } from "@/components/ui/multiline-text";
import { formatServiceDate } from "@/lib/services/format";
import type { ServiceListItem } from "@/lib/services/types";

type ServiceRowProps = {
  item: ServiceListItem;
};

export function ServiceRow({ item }: ServiceRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const runAction = (
    action: () => Promise<{ success: boolean; error?: string; data?: { id: string } }>,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      setActionError("");
      const result = await action();

      if (!result.success) {
        setActionError(result.error ?? "הפעולה נכשלה.");
        return;
      }

      onSuccess?.();

      if (result.data?.id) {
        router.push(`/admin/services/${result.data.id}`);
        return;
      }

      router.refresh();
    });
  };

  return (
    <AdminListItem>
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
              <MultilineText
                as="p"
                className="line-clamp-2 text-sm text-[var(--color-text-muted)]"
              >
                {item.short_description}
              </MultilineText>
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
                onSelect={() => router.push(`/admin/services/${item.id}/preview`)}
              >
                <Eye aria-hidden="true" className="size-4" />
                תצוגה מקדימה
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/admin/services/${item.id}`)}
              >
                <Pencil aria-hidden="true" className="size-4" />
                עריכה
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  runAction(() => duplicateServiceAction({ id: item.id }))
                }
              >
                <Copy aria-hidden="true" className="size-4" />
                שכפול
              </DropdownMenuItem>

              {item.status === "draft" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/admin/services/${item.id}?publish=1`)
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
                      runAction(() => restoreServiceAction({ id: item.id }))
                    }
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    שחזור
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
            עודכן: {formatServiceDate(item.updated_at)}
          </p>
          {actionError ? (
            <p role="alert" className="text-caption text-[var(--color-error)]">
              {actionError}
            </p>
          ) : null}
        </div>
      </div>

      <ServiceArchiveDialog
        open={archiveOpen}
        serviceTitle={item.title}
        loading={isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() =>
          runAction(() => archiveServiceAction({ id: item.id }), () =>
            setArchiveOpen(false)
          )
        }
      />

      <ServiceDeleteDialog
        open={deleteOpen}
        serviceTitle={item.title}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          runAction(() => permanentlyDeleteServiceAction({ id: item.id }), () =>
            setDeleteOpen(false)
          )
        }
      />
    </AdminListItem>
  );
}
