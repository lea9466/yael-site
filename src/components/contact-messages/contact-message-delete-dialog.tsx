"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ContactMessageDeleteDialogProps = {
  open: boolean;
  senderName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ContactMessageDeleteDialog({
  open,
  senderName,
  loading,
  onClose,
  onConfirm,
}: ContactMessageDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת פנייה"
      description={`האם למחוק לצמיתות את הפנייה של "${senderName}"?`}
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
        פעולה זו אינה ניתנת לביטול. ההודעה תימחק לצמיתות מהמערכת.
      </p>
    </Dialog>
  );
}
