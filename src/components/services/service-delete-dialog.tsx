"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ServiceDeleteDialogProps = {
  open: boolean;
  serviceTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ServiceDeleteDialog({
  open,
  serviceTitle,
  loading,
  onClose,
  onConfirm,
}: ServiceDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקה לצמיתות"
      description={`פעולה זו תמחק לצמיתות את "${serviceTitle}".`}
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
            מחיקה לצמיתות
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-error)]">
        לא ניתן לבטל פעולה זו. קבצי המדיה לא יימחקו אוטומטית.
      </p>
    </Dialog>
  );
}
