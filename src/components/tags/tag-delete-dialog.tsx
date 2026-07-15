"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TagDeleteDialogProps = {
  open: boolean;
  tagName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TagDeleteDialog({
  open,
  tagName,
  loading,
  onClose,
  onConfirm,
}: TagDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת תגית"
      description={`האם למחוק את "${tagName}"?`}
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
            מחיקה
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        ניתן למחוק רק תגיות שאינן משויכות לתוכן.
      </p>
    </Dialog>
  );
}
