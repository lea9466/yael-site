"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CertificateDeleteDialogProps = {
  open: boolean;
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CertificateDeleteDialog({
  open,
  title,
  loading,
  onClose,
  onConfirm,
}: CertificateDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת תעודה"
      description={`האם למחוק לצמיתות את "${title}"?`}
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
        פעולה זו אינה ניתנת לביטול. התעודה תוסר מהאתר, אך התמונה תישאר בספריית
        המדיה.
      </p>
    </Dialog>
  );
}
