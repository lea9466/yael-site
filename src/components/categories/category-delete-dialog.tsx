"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CategoryDeleteDialogProps = {
  open: boolean;
  categoryName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  open,
  categoryName,
  loading,
  onClose,
  onConfirm,
}: CategoryDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת קטגוריה"
      description={`האם למחוק את "${categoryName}"?`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={loading} onClick={onClose}>
            ביטול
          </Button>
          <Button
            variant="danger"
            loading={loading}
            loadingText="מוחק..."
            onClick={onConfirm}
          >
            מחיקה
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        ניתן למחוק רק קטגוריות שאינן משויכות לתוכן.
      </p>
    </Dialog>
  );
}
