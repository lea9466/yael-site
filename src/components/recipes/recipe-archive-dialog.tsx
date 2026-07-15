"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RecipeArchiveDialogProps = {
  open: boolean;
  recipeTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RecipeArchiveDialog({
  open,
  recipeTitle,
  loading,
  onClose,
  onConfirm,
}: RecipeArchiveDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="העברה לארכיון"
      description={`האם להעביר את "${recipeTitle}" לארכיון? המתכון לא יוצג באתר.`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={loading} onClick={onClose}>
            ביטול
          </Button>
          <Button loading={loading} loadingText="מעביר..." onClick={onConfirm}>
            העברה לארכיון
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">
        ניתן לשחזר את המתכון מהארכיון בכל עת.
      </p>
    </Dialog>
  );
}
