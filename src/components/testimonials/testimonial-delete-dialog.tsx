"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TestimonialDeleteDialogProps = {
  open: boolean;
  clientName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TestimonialDeleteDialog({
  open,
  clientName,
  loading,
  onClose,
  onConfirm,
}: TestimonialDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת המלצה"
      description={`האם למחוק לצמיתות את ההמלצה של "${clientName}"?`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={loading} onClick={onClose}>
            ביטול
          </Button>
          <Button
            variant="danger"
            loading={loading}
            loadingText="מוחקת..."
            onClick={onConfirm}
          >
            מחיקה לצמיתות
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        פעולה זו אינה ניתנת לביטול. ההמלצה תוסר מהאתר.
      </p>
    </Dialog>
  );
}
