"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RecipeDeleteDialogProps = {
  open: boolean;
  recipeTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RecipeDeleteDialog({
  open,
  recipeTitle,
  loading,
  onClose,
  onConfirm,
}: RecipeDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מחיקה לצמיתות"
      description={`האם למחוק לצמיתות את "${recipeTitle}"?`}
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
      <p className="text-sm text-[var(--color-text-muted)]">
        פעולה זו בלתי הפיכה. קבצי המדיה לא יימחקו אוטומטית.
      </p>
    </Dialog>
  );
}
