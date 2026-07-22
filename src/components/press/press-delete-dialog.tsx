"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type PressDeleteDialogProps = {
  open: boolean;
  title: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PressDeleteDialog({
  open,
  title,
  isPending,
  onClose,
  onConfirm,
}: PressDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקת כתבה"
      description={`האם למחוק את "${title}" לצמיתות? פעולה זו אינה ניתנת לביטול.`}
    >
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          ביטול
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "מוחק…" : "מחיקה לצמיתות"}
        </Button>
      </div>
    </Dialog>
  );
}
