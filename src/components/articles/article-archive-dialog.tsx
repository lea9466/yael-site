"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ArticleArchiveDialogProps = {
  open: boolean;
  articleTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ArticleArchiveDialog({
  open,
  articleTitle,
  loading,
  onClose,
  onConfirm,
}: ArticleArchiveDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="העברה לארכיון"
      description={`האם להעביר את "${articleTitle}" לארכיון? הפוסט לא יוצג באתר.`}
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
        ניתן לשחזר את הפוסט מהארכיון בכל עת.
      </p>
    </Dialog>
  );
}
