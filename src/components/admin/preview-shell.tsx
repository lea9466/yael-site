import Link from "next/link";
import { Pencil } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import type { ContentStatus } from "@/types/content";

type PreviewBannerProps = {
  status: ContentStatus;
  editHref: string;
};

function PreviewBanner({ status, editHref }: PreviewBannerProps) {
  return (
    <div className="mb-6 w-full rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-warning)]">
            תצוגה מקדימה למנהלת בלבד
          </p>
          <p className="flex flex-wrap items-center gap-2 text-caption text-[var(--color-text-muted)]">
            <span>סטטוס נוכחי:</span>
            <AdminStatusBadge status={status} size="sm" />
            <span>· עמוד זה אינו נגיש לציבור.</span>
          </p>
        </div>
        <Link
          href={editHref}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-soft)]"
        >
          <Pencil aria-hidden="true" className="size-4" />
          חזרה לעריכה
        </Link>
      </div>
    </div>
  );
}

type PreviewShellProps = {
  status: ContentStatus;
  editHref: string;
  children: React.ReactNode;
};

/**
 * Shared full-width admin preview layout: banner and content share the same
 * outer container so both edges align, and the wrapper stretches to the full
 * available admin content width instead of an artificially narrow max-width.
 */
export function PreviewShell({ status, editHref, children }: PreviewShellProps) {
  return (
    <div className="w-full px-1 sm:px-0">
      <PreviewBanner status={status} editHref={editHref} />
      <div className="w-full">{children}</div>
    </div>
  );
}
