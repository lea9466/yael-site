"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { validateArticleLinkUrl } from "@/lib/articles/link-validation";

const LINK_DIALOG_FORM_ID = "article-link-dialog-form";

type ArticleLinkDialogProps = {
  open: boolean;
  mode: "insert" | "edit";
  initialUrl: string;
  initialText: string;
  requiresText: boolean;
  onCancel: () => void;
  onSubmit: (url: string, text: string | undefined) => void;
  onRemove: () => void;
};

export function ArticleLinkDialog({
  open,
  mode,
  initialUrl,
  initialText,
  requiresText,
  onCancel,
  onSubmit,
  onRemove,
}: ArticleLinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(initialText);
      setUrlError(null);
      setTextError(null);
    }
  }, [open, initialUrl, initialText]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateArticleLinkUrl(url);

    if (requiresText && text.trim().length === 0) {
      setTextError("יש להזין טקסט לקישור");

      if (!result.valid) {
        setUrlError(result.error);
      }

      return;
    }

    if (!result.valid) {
      setUrlError(result.error);
      return;
    }

    setUrlError(null);
    setTextError(null);
    onSubmit(result.url, requiresText ? text.trim() : undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={mode === "edit" ? "עדכון קישור" : "הוספת קישור"}
      description={
        requiresText
          ? "לא נבחר טקסט בעריכה — הזיני טקסט וכתובת עבור הקישור."
          : undefined
      }
      panelClassName="max-h-[min(90dvh,560px)] max-w-md"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onRemove}
              className="me-auto text-[var(--color-error)] hover:text-[var(--color-error)]"
            >
              הסרת קישור
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit" form={LINK_DIALOG_FORM_ID}>
            {mode === "edit" ? "עדכון קישור" : "הוספת קישור"}
          </Button>
        </div>
      }
    >
      <form
        id={LINK_DIALOG_FORM_ID}
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {requiresText ? (
          <FormField
            label="טקסט הקישור"
            htmlFor="article-link-dialog-text"
            required
            error={textError ?? undefined}
          >
            <Input
              id="article-link-dialog-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setTextError(null);
              }}
              placeholder="הטקסט שיוצג כקישור"
            />
          </FormField>
        ) : null}

        <FormField
          label="כתובת הקישור"
          htmlFor="article-link-dialog-url"
          required
          error={urlError ?? undefined}
          hint="כתובות מותרות: https://, mailto:, tel: או נתיב פנימי המתחיל ב-/"
        >
          <Input
            id="article-link-dialog-url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setUrlError(null);
            }}
            dir="ltr"
            className="text-left"
            placeholder="https://example.com"
          />
        </FormField>
      </form>
    </Dialog>
  );
}
