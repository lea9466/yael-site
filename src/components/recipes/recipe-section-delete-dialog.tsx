"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RecipeSectionDeleteDialogProps = {
  open: boolean;
  sectionLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function RecipeSectionDeleteDialog({
  open,
  sectionLabel,
  onClose,
  onConfirm,
}: RecipeSectionDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="למחוק את החלק הזה?"
      description={sectionLabel}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            מחיקת החלק
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        המחיקה תסיר את הרכיבים ואת שלבי ההכנה שבתוכו.
      </p>
    </Dialog>
  );
}
