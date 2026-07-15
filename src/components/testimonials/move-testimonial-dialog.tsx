"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MoveTestimonialDialogProps = {
  open: boolean;
  clientName: string;
  currentServiceTitle: string;
  targetServiceTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function MoveTestimonialDialog({
  open,
  clientName,
  currentServiceTitle,
  targetServiceTitle,
  loading,
  onClose,
  onConfirm,
}: MoveTestimonialDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="העברת המלצה לשירות"
      description={`ההמלצה של "${clientName}" שייכת כרגע לשירות "${currentServiceTitle}".`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={loading} onClick={onClose}>
            ביטול
          </Button>
          <Button
            loading={loading}
            loadingText="מעבירה..."
            onClick={onConfirm}
          >
            העברה ל-{targetServiceTitle}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        המלצה יכולה להיות משויכת לשירות אחד בלבד. לאחר האישור, השיוך יעודכן ל-
        {targetServiceTitle}.
      </p>
    </Dialog>
  );
}
