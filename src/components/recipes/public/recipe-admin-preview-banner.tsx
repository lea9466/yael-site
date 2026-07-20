import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import type { ContentStatus } from "@/types/content";

type RecipeAdminPreviewBannerProps = {
  status: ContentStatus;
  editHref: string;
};

export function RecipeAdminPreviewBanner({
  status,
  editHref,
}: RecipeAdminPreviewBannerProps) {
  return (
    <div className="border-b border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)]">
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-warning)]">
            <Eye aria-hidden="true" className="size-4" />
            תצוגה מקדימה בכתובת הציבורית — למנהלת בלבד
          </p>
          <p className="flex flex-wrap items-center gap-2 text-caption text-[var(--color-text-muted)]">
            <span>סטטוס נוכחי:</span>
            <AdminStatusBadge status={status} size="sm" />
            <span>· המבקרים באתר לא רואים את המתכון עד לפרסום.</span>
          </p>
        </div>
        <Link
          href={editHref}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-soft)]"
        >
          <Pencil aria-hidden="true" className="size-4" />
          חזרה לעריכה
        </Link>
      </div>
    </div>
  );
}
