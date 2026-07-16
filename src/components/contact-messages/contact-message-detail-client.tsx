"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCheck,
  Clock3,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  deleteContactMessageAction,
  updateContactMessageStatusAction,
} from "@/actions/contact-messages";
import { AdminBreadcrumbNav } from "@/components/admin/breadcrumbs";
import { ContactMessageContent } from "@/components/contact-messages/contact-message-content";
import { ContactMessageDeleteDialog } from "@/components/contact-messages/contact-message-delete-dialog";
import { ContactMessageQuickActions } from "@/components/contact-messages/contact-message-quick-actions";
import { ContactMessageStatusBadge } from "@/components/contact-messages/contact-message-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ContactMessageStatus } from "@/lib/contact-messages/constants";
import { formatContactMessageDate } from "@/lib/contact-messages/format";
import { resolveContactMessageStatus } from "@/lib/contact-messages/status";
import {
  getStoredContactMessageStatus,
  setStoredContactMessageStatus,
} from "@/lib/contact-messages/status-storage";
import type { ContactMessageDetail } from "@/lib/contact-messages/types";

type ContactMessageDetailClientProps = {
  message: ContactMessageDetail;
  breadcrumbItems: Array<{ label: string; href?: string }>;
};

export function ContactMessageDetailClient({
  message,
  breadcrumbItems,
}: ContactMessageDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<ContactMessageStatus | null>(
    null
  );

  const resolvedStatus = resolveContactMessageStatus(
    message.is_read,
    getStoredContactMessageStatus(message.id)
  );
  const displayStatus = pendingStatus ?? resolvedStatus;

  const handleStatusChange = (status: ContactMessageStatus) => {
    const previousStatus = resolvedStatus;
    setPendingStatus(status);
    setActionError("");
    setStoredContactMessageStatus(message.id, status);

    startTransition(async () => {
      const result = await updateContactMessageStatusAction({
        id: message.id,
        status,
      });

      if (!result.success) {
        setPendingStatus(null);
        setStoredContactMessageStatus(message.id, previousStatus);
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
      const result = await deleteContactMessageAction({ id: message.id });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      router.push("/admin/contact-messages");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <AdminBreadcrumbNav items={breadcrumbItems} />

      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-page-title">{message.full_name}</h1>
            <ContactMessageStatusBadge status={displayStatus} />
          </div>

          <Link
            href="/admin/contact-messages"
            className="admin-interactive inline-flex h-11 items-center justify-center gap-2 self-start rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
            חזרה לרשימה
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <h2 className="mb-4 text-section-title">תוכן ההודעה</h2>
          <ContactMessageContent message={message.message} variant="full" />
        </Card>

        <aside className="space-y-6">
          <Card className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 text-section-title">פרטי הפונה</h2>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-caption text-[var(--color-text-muted)]">
                  שם
                </dt>
                <dd className="font-medium">{message.full_name}</dd>
              </div>
              <div>
                <dt className="text-caption text-[var(--color-text-muted)]">
                  אימייל
                </dt>
                <dd dir="ltr" className="font-medium">
                  {message.email}
                </dd>
              </div>
              {message.phone ? (
                <div>
                  <dt className="text-caption text-[var(--color-text-muted)]">
                    טלפון
                  </dt>
                  <dd dir="ltr" className="font-medium">
                    {message.phone}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-caption text-[var(--color-text-muted)]">
                  תאריך שליחה
                </dt>
                <dd className="font-medium">
                  {formatContactMessageDate(message.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-[var(--color-text-muted)]">
                  סטטוס
                </dt>
                <dd className="pt-1">
                  <ContactMessageStatusBadge status={displayStatus} size="sm" />
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 text-section-title">פעולות מהירות</h2>
            <ContactMessageQuickActions
              email={message.email}
              phone={message.phone}
            />
          </Card>

          <Card className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 text-section-title">עדכון סטטוס</h2>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                loading={isPending}
                className="w-full justify-center gap-2"
                onClick={() => handleStatusChange("new")}
              >
                <Sparkles aria-hidden="true" className="size-4" />
                סמן כחדש
              </Button>
              <Button
                variant="outline"
                loading={isPending}
                className="w-full justify-center gap-2"
                onClick={() => handleStatusChange("in_progress")}
              >
                <Clock3 aria-hidden="true" className="size-4" />
                סמן כבטיפול
              </Button>
              <Button
                variant="secondary"
                loading={isPending}
                className="w-full justify-center gap-2"
                onClick={() => handleStatusChange("handled")}
              >
                <CheckCheck aria-hidden="true" className="size-4" />
                סמן כטופל
              </Button>
              <Button
                variant="danger"
                loading={isPending}
                className="w-full justify-center gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                מחק
              </Button>
            </div>
          </Card>

          <Card className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 p-6">
            <h2 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
              הערות פנימיות
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              הערות פנימיות אינן זמינות עדיין.
            </p>
          </Card>
        </aside>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {actionError}
        </p>
      ) : null}

      <ContactMessageDeleteDialog
        open={deleteOpen}
        senderName={message.full_name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
