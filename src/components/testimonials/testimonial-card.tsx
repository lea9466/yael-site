"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { deleteTestimonialAction } from "@/actions/testimonials";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { TestimonialContent } from "@/components/testimonials/testimonial-content";
import { TestimonialDeleteDialog } from "@/components/testimonials/testimonial-delete-dialog";
import { TestimonialServiceLabel } from "@/components/testimonials/testimonial-service-label";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  formatTestimonialDate,
  getTestimonialExcerpt,
  getTestimonialInitials,
  publishedToPublicationStatus,
} from "@/lib/testimonials/format";
import type { TestimonialListItem } from "@/lib/testimonials/types";

type TestimonialCardProps = {
  item: TestimonialListItem;
};

export function TestimonialCard({ item }: TestimonialCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const initials = getTestimonialInitials(item.name);
  const excerpt = getTestimonialExcerpt(item.content);
  const publicationStatus = publishedToPublicationStatus(item.is_published);

  const handleDelete = () => {
    startTransition(async () => {
      setActionError("");
      const result = await deleteTestimonialAction({ id: item.id });

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <article className="admin-card group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)]/35 text-sm font-semibold text-[var(--color-primary)]"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-card-title" title={item.name}>
              {item.name}
            </h3>
            {item.city ? (
              <p className="truncate text-sm text-[var(--color-text-muted)]">
                {item.city}
              </p>
            ) : null}
          </div>
        </div>

        <DropdownMenu
          triggerLabel="פעולות"
          trigger={<MoreVertical aria-hidden="true" className="size-4" />}
        >
          <DropdownMenuItem
            onSelect={() => router.push(`/admin/testimonials/${item.id}`)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            עריכה
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            מחיקה
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      <div className="mb-4 flex-1">
        <TestimonialContent content={excerpt} variant="excerpt" quoted />
      </div>

      <div className="space-y-3 border-t border-[var(--color-border)]/60 pt-4">
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge status={publicationStatus} size="sm" />
          {item.featured ? <AdminFeaturedBadge size="sm" /> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-[var(--color-text-muted)]">
          <span>עודכן: {formatTestimonialDate(item.updated_at)}</span>
          <TestimonialServiceLabel
            serviceTitle={item.serviceTitle}
            size="sm"
          />
        </div>

        {actionError ? (
          <p role="alert" className="text-caption text-[var(--color-error)]">
            {actionError}
          </p>
        ) : null}
      </div>

      <Link href={`/admin/testimonials/${item.id}`} className="sr-only">
        עריכת המלצה של {item.name}
      </Link>

      <TestimonialDeleteDialog
        open={deleteOpen}
        clientName={item.name}
        loading={isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </article>
  );
}
