"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Link2Off, MessageCircleHeart, Pencil, Plus } from "lucide-react";

import { unlinkTestimonialFromServiceAction } from "@/actions/testimonials";
import {
  AdminFeaturedBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-status-badge";
import { AttachTestimonialDialog } from "@/components/testimonials/attach-testimonial-dialog";
import { TestimonialContent } from "@/components/testimonials/testimonial-content";
import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import {
  getTestimonialExcerpt,
  publishedToPublicationStatus,
} from "@/lib/testimonials/format";
import type { ServiceTestimonialItem } from "@/lib/testimonials/types";
import { cn } from "@/lib/utils/cn";

type ServiceTestimonialsSectionProps = {
  serviceId: string;
  serviceTitle: string;
  testimonials: ServiceTestimonialItem[];
  className?: string;
};

export function ServiceTestimonialsSection({
  serviceId,
  serviceTitle,
  testimonials,
  className,
}: ServiceTestimonialsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [attachOpen, setAttachOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    open: false,
    variant: "success",
    message: "",
  });

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ open: true, variant, message });
  };

  const handleDetach = (testimonialId: string) => {
    startTransition(async () => {
      const result = await unlinkTestimonialFromServiceAction({
        testimonialId,
        serviceId,
      });

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      showToast("success", "השיוך הוסר.");
      router.refresh();
    });
  };

  return (
    <section
      id="section-testimonials"
      className={cn("admin-form-section space-y-4", className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-section-title">המלצות לשירות</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            ניהול שיוך המלצות לשירות זה. ניתן גם לעדכן שיוך ממסך עריכת ההמלצה.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setAttachOpen(true)}
          >
            <MessageCircleHeart aria-hidden="true" className="size-4" />
            שיוך המלצה קיימת
          </Button>
          <Link
            href={`/admin/testimonials/new?service_id=${serviceId}`}
            className="admin-btn-primary inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium"
          >
            <Plus aria-hidden="true" className="size-4" />
            המלצה חדשה
          </Link>
        </div>
      </div>

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        autoHideMs={toast.variant === "success" ? 4000 : undefined}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      {testimonials.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 px-4 py-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            עדיין אין המלצות משויכות לשירות זה.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => {
            const publicationStatus = publishedToPublicationStatus(
              item.is_published
            );

            return (
              <li
                key={item.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-card-title">{item.name}</h3>
                    {item.city ? (
                      <p className="truncate text-sm text-[var(--color-text-muted)]">
                        {item.city}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <AdminStatusBadge status={publicationStatus} size="sm" />
                    {item.featured ? <AdminFeaturedBadge size="sm" /> : null}
                  </div>
                </div>

                <TestimonialContent
                  content={getTestimonialExcerpt(item.content)}
                  variant="excerpt"
                  quoted
                  className="mb-4"
                />

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/testimonials/${item.id}`}
                    className="admin-btn-outline inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    עריכה
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    loading={isPending}
                    onClick={() => handleDetach(item.id)}
                  >
                    <Link2Off aria-hidden="true" className="size-4" />
                    הסרת שיוך
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AttachTestimonialDialog
        open={attachOpen}
        serviceId={serviceId}
        serviceTitle={serviceTitle}
        linkedTestimonialIds={testimonials.map((item) => item.id)}
        onClose={() => setAttachOpen(false)}
        onAttached={() => {
          showToast("success", "ההמלצה שויכה לשירות.");
          router.refresh();
        }}
      />
    </section>
  );
}
