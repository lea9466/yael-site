"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ServiceArchiveDialogProps = {
  open: boolean;
  serviceTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ServiceArchiveDialog({
  open,
  serviceTitle,
  loading,
  onClose,
  onConfirm,
}: ServiceArchiveDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="העברה לארכיון"
      description={`האם להעביר את "${serviceTitle}" לארכיון? השירות לא יוצג באתר.`}
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
        ניתן לשחזר את השירות מהארכיון בכל עת.
      </p>
    </Dialog>
  );
}
