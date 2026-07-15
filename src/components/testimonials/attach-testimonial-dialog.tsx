"use client";

import { useEffect, useState, useTransition } from "react";
import { Link2, Search } from "lucide-react";

import {
  linkTestimonialToServiceAction,
  searchTestimonialsAction,
} from "@/actions/testimonials";
import { MoveTestimonialDialog } from "@/components/testimonials/move-testimonial-dialog";
import { TestimonialServiceLabel } from "@/components/testimonials/testimonial-service-label";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getTestimonialExcerpt } from "@/lib/testimonials/format";
import type { TestimonialSearchResult } from "@/lib/testimonials/types";

type AttachTestimonialDialogProps = {
  open: boolean;
  serviceId: string;
  serviceTitle: string;
  linkedTestimonialIds: string[];
  onClose: () => void;
  onAttached: () => void;
};

export function AttachTestimonialDialog({
  open,
  serviceId,
  serviceTitle,
  linkedTestimonialIds,
  onClose,
  onAttached,
}: AttachTestimonialDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<TestimonialSearchResult[]>([]);
  const [actionError, setActionError] = useState("");
  const [moveCandidate, setMoveCandidate] =
    useState<TestimonialSearchResult | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const items = await searchTestimonialsAction({
          q: searchValue.trim(),
          limit: 20,
        });
        setResults(items);
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, searchValue]);

  const handleAttach = (item: TestimonialSearchResult, confirmMove = false) => {
    startTransition(async () => {
      setActionError("");
      const result = await linkTestimonialToServiceAction({
        testimonialId: item.id,
        serviceId,
        confirmMove,
      });

      if (!result.success) {
        if (result.conflict) {
          setMoveCandidate(item);
          return;
        }

        setActionError(result.error);
        return;
      }

      setMoveCandidate(null);
      onAttached();
      onClose();
    });
  };

  const handleConfirmMove = () => {
    if (!moveCandidate) {
      return;
    }

    handleAttach(moveCandidate, true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title="שיוך המלצה לשירות"
        description={`חיפוש והוספת המלצות לשירות "${serviceTitle}".`}
        panelClassName="max-w-2xl"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" disabled={isPending} onClick={onClose}>
              סגירה
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="attach-testimonial-search"
              className="text-caption font-medium text-[var(--color-text-muted)]"
            >
              חיפוש לפי שם לקוח
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <Input
                id="attach-testimonial-search"
                type="search"
                value={searchValue}
                placeholder="הקלידי שם לקוח..."
                className="ps-10"
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </div>

          {actionError ? (
            <p role="alert" className="text-sm text-[var(--color-error)]">
              {actionError}
            </p>
          ) : null}

          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {results.length === 0 ? (
              <li className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                לא נמצאו המלצות.
              </li>
            ) : (
              results.map((item) => {
                const isLinked = linkedTestimonialIds.includes(item.id);
                const isLinkedElsewhere =
                  item.service_id !== null && item.service_id !== serviceId;

                return (
                  <li
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)]/80 bg-[var(--color-surface-soft)]/40 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="font-medium text-[var(--color-text)]">
                          {item.name}
                        </p>
                        <p className="line-clamp-2 whitespace-pre-line text-sm text-[var(--color-text-muted)]">
                          {getTestimonialExcerpt(item.content, 100)}
                        </p>
                        <TestimonialServiceLabel
                          serviceTitle={item.serviceTitle}
                          size="sm"
                        />
                        {isLinkedElsewhere ? (
                          <p className="text-caption text-[var(--color-warning)]">
                            שייכת כרגע לשירות: {item.serviceTitle}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        variant={isLinked ? "outline" : "primary"}
                        disabled={isPending || isLinked}
                        onClick={() => handleAttach(item)}
                      >
                        <Link2 aria-hidden="true" className="size-4" />
                        {isLinked ? "משויכת" : "שיוך"}
                      </Button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Dialog>

      <MoveTestimonialDialog
        open={moveCandidate !== null}
        clientName={moveCandidate?.name ?? ""}
        currentServiceTitle={moveCandidate?.serviceTitle ?? "שירות אחר"}
        targetServiceTitle={serviceTitle}
        loading={isPending}
        onClose={() => setMoveCandidate(null)}
        onConfirm={handleConfirmMove}
      />
    </>
  );
}
