"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  CheckCheck,
  Clock3,
  Eye,
  MoreVertical,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  deleteContactMessageAction,
  updateContactMessageStatusAction,
} from "@/actions/contact-messages";
import { ContactMessageContent } from "@/components/contact-messages/contact-message-content";
import { ContactMessageDeleteDialog } from "@/components/contact-messages/contact-message-delete-dialog";
import { ContactMessageStatusBadge } from "@/components/contact-messages/contact-message-status-badge";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { ContactMessageStatus } from "@/lib/contact-messages/constants";
import {
  formatContactMessageDate,
  getContactMessageExcerpt,
  getContactMessageInitials,
} from "@/lib/contact-messages/format";
import { setStoredContactMessageStatus } from "@/lib/contact-messages/status-storage";
import { isUnreadContactMessage } from "@/lib/contact-messages/status";
import type { ContactMessageListItem } from "@/lib/contact-messages/types";
import { cn } from "@/lib/utils/cn";

type ContactMessageCardProps = {
  item: ContactMessageListItem;
  onStatusChange?: (id: string, status: ContactMessageStatus) => void;
  onDelete?: (id: string) => void;
};

export function ContactMessageCard({
  item,
  onStatusChange,
  onDelete,
}: ContactMessageCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<ContactMessageStatus | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const displayStatus = pendingStatus ?? item.status;
  const unread = isUnreadContactMessage(displayStatus);
  const initials = getContactMessageInitials(item.full_name);
  const excerpt = useMemo(
    () => getContactMessageExcerpt(item.message),
    [item.message]
  );

  const handleStatusChange = (status: ContactMessageStatus) => {
    const previousStatus = item.status;
    setPendingStatus(status);
    setActionError("");
    setStoredContactMessageStatus(item.id, status);
    onStatusChange?.(item.id, status);

    startTransition(async () => {
      const result = await updateContactMessageStatusAction({
        id: item.id,
        status,
      });

      if (!result.success) {
        setPendingStatus(null);
        setStoredContactMessageStatus(item.id, previousStatus);
        onStatusChange?.(item.id, previousStatus);
        setActionError(result.error);
        return;
      }

      setPendingStatus(null);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      setActionError("");
      const result = await deleteContactMessageAction({ id: item.id });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      onDelete?.(item.id);
      router.refresh();
    });
  };

  return (
    <article
      className={cn(
        "admin-card group flex h-full flex-col rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        unread
          ? "border-[var(--color-primary)]/35 bg-gradient-to-bl from-[var(--color-light-sage-soft)]/50 to-[var(--color-surface)] ring-1 ring-[var(--color-primary)]/10"
          : "border-[var(--color-border)]/70"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-sm font-semibold",
              unread
                ? "bg-[var(--color-accent)]/45 text-[var(--color-primary)]"
                : "bg-[var(--color-accent)]/25 text-[var(--color-primary)]"
            )}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-card-title" title={item.full_name}>
              {item.full_name}
            </h3>
            <p
              className="truncate text-sm text-[var(--color-text-muted)]"
              dir="ltr"
            >
              {item.email}
            </p>
            {item.phone ? (
              <p
                className="truncate text-sm text-[var(--color-text-muted)]"
                dir="ltr"
              >
                {item.phone}
              </p>
            ) : null}
          </div>
        </div>

        <DropdownMenu
          triggerLabel="פעולות"
          trigger={<MoreVertical aria-hidden="true" className="size-4" />}
        >
          <DropdownMenuItem
            onSelect={() => router.push(`/admin/contact-messages/${item.id}`)}
          >
            <Eye aria-hidden="true" className="size-4" />
            צפייה
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleStatusChange("new")}>
            <Sparkles aria-hidden="true" className="size-4" />
            סמן כחדש
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleStatusChange("in_progress")}>
            <Clock3 aria-hidden="true" className="size-4" />
            סמן כבטיפול
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleStatusChange("handled")}>
            <CheckCheck aria-hidden="true" className="size-4" />
            סמן כטופל
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            מחק
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      <div className="mb-4 flex-1">
        <ContactMessageContent message={excerpt} variant="excerpt" />
      </div>

      <div className="space-y-3 border-t border-[var(--color-border)]/60 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ContactMessageStatusBadge status={displayStatus} size="sm" />
          <span className="text-caption text-[var(--color-text-muted)]">
            {formatContactMessageDate(item.created_at)}
          </span>
        </div>

        {actionError ? (
          <p role="alert" className="text-caption text-[var(--color-error)]">
            {actionError}
          </p>
        ) : null}
      </div>

      <Link
        href={`/admin/contact-messages/${item.id}`}
        className="sr-only"
      >
        צפייה בפנייה של {item.full_name}
      </Link>

      <ContactMessageDeleteDialog
        open={deleteOpen}
        senderName={item.full_name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </article>
  );
}
