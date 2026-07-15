"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { renderArticleRichText } from "@/lib/articles/render";
import type { ArticleTextMark } from "@/lib/articles/types";
import { cn } from "@/lib/utils/cn";

const EDITOR_INPUT_LAYER =
  "article-editor-editable relative z-[1] w-full border-0 bg-transparent text-transparent shadow-none [-webkit-text-fill-color:transparent] caret-[var(--color-text)] selection:bg-[color-mix(in_srgb,var(--color-sky-blue)_28%,transparent)] selection:text-transparent focus-visible:ring-0";

const EDITOR_FIELD_SHELL =
  "article-editor-field admin-interactive relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15";

type RichTextMirrorProps = {
  value: string;
  marks?: ArticleTextMark[];
  className?: string;
};

function RichTextMirror({ value, marks, className }: RichTextMirrorProps) {
  return (
    <div
      aria-hidden="true"
      dir="rtl"
      lang="he"
      className={cn(
        "article-editor-mirror article-content pointer-events-none absolute inset-0 z-0 overflow-hidden whitespace-pre-wrap break-words text-[var(--color-text)]",
        className
      )}
    >
      {value.length > 0 ? renderArticleRichText(value, marks) : "\u00a0"}
    </div>
  );
}

function getFieldBlockKey(
  blockId?: string,
  listItemId?: string
): string {
  return `${blockId ?? ""}:${listItemId ?? ""}`;
}

function useRichTextFieldState(
  externalValue: string,
  externalMarks: ArticleTextMark[] | undefined,
  blockKey: string
) {
  const [draftValue, setDraftValue] = useState(externalValue);
  const [draftMarks, setDraftMarks] = useState(externalMarks ?? []);
  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null
  );
  const lastBlockKeyRef = useRef(blockKey);
  const lastEmittedValueRef = useRef(externalValue);

  useEffect(() => {
    if (lastBlockKeyRef.current === blockKey) {
      return;
    }

    lastBlockKeyRef.current = blockKey;
    setDraftValue(externalValue);
    setDraftMarks(externalMarks ?? []);
    lastEmittedValueRef.current = externalValue;
  }, [blockKey, externalValue, externalMarks]);

  useEffect(() => {
    if (!isFocusedRef.current && !isComposingRef.current) {
      setDraftValue(externalValue);
      setDraftMarks(externalMarks ?? []);
      lastEmittedValueRef.current = externalValue;
      return;
    }

    if (externalValue === lastEmittedValueRef.current) {
      setDraftMarks(externalMarks ?? []);
    }
  }, [externalValue, externalMarks]);

  const captureSelection = useCallback(
    (field: HTMLInputElement | HTMLTextAreaElement) => {
      pendingSelectionRef.current = {
        start: field.selectionStart ?? 0,
        end: field.selectionEnd ?? 0,
      };
    },
    []
  );

  return {
    draftValue,
    setDraftValue,
    draftMarks,
    isFocusedRef,
    isComposingRef,
    pendingSelectionRef,
    lastEmittedValueRef,
    captureSelection,
  };
}

type SharedRichTextFieldProps = {
  marks?: ArticleTextMark[];
  error?: boolean;
  shellClassName?: string;
  mirrorClassName?: string;
  "data-block-id"?: string;
  "data-list-item-id"?: string;
};

type ArticleRichTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & SharedRichTextFieldProps;

export function ArticleRichTextarea({
  marks,
  className,
  shellClassName,
  mirrorClassName,
  error,
  value,
  onChange,
  onFocus,
  onBlur,
  onCompositionStart,
  onCompositionEnd,
  "data-block-id": blockId,
  "data-list-item-id": listItemId,
  ...props
}: ArticleRichTextareaProps) {
  const externalValue = typeof value === "string" ? value : "";
  const blockKey = getFieldBlockKey(blockId, listItemId);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    draftValue,
    setDraftValue,
    draftMarks,
    isFocusedRef,
    isComposingRef,
    pendingSelectionRef,
    lastEmittedValueRef,
    captureSelection,
  } = useRichTextFieldState(externalValue, marks, blockKey);

  useLayoutEffect(() => {
    const field = inputRef.current;
    const selection = pendingSelectionRef.current;

    if (!field || !selection || document.activeElement !== field) {
      return;
    }

    const maxPosition = field.value.length;

    try {
      field.setSelectionRange(
        Math.min(selection.start, maxPosition),
        Math.min(selection.end, maxPosition)
      );
    } catch {
      // Ignore invalid selection while the DOM is syncing.
    }

    pendingSelectionRef.current = null;
  }, [draftValue, draftMarks, pendingSelectionRef]);

  const emitChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      captureSelection(event.target);
      setDraftValue(nextValue);
      lastEmittedValueRef.current = nextValue;
      onChange?.(event);
    },
    [captureSelection, lastEmittedValueRef, onChange, setDraftValue]
  );

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;

    captureSelection(event.target);
    setDraftValue(nextValue);

    if (isComposingRef.current) {
      return;
    }

    lastEmittedValueRef.current = nextValue;
    onChange?.(event);
  };

  return (
    <div
      dir="rtl"
      lang="he"
      className={cn(
        EDITOR_FIELD_SHELL,
        error &&
          "border-[var(--color-error)] focus-within:border-[var(--color-error)] focus-within:ring-[var(--color-error)]/15",
        shellClassName
      )}
    >
      <RichTextMirror
        value={draftValue}
        marks={draftMarks}
        className={cn(
          "px-4 py-3.5 text-sm leading-[var(--line-height-relaxed)]",
          mirrorClassName ?? className
        )}
      />
      <Textarea
        {...props}
        ref={inputRef}
        dir="rtl"
        lang="he"
        data-block-id={blockId}
        data-list-item-id={listItemId}
        error={error}
        value={draftValue}
        onChange={handleChange}
        onFocus={(event) => {
          isFocusedRef.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          isFocusedRef.current = false;
          isComposingRef.current = false;
          lastEmittedValueRef.current = event.target.value;
          onBlur?.(event);
        }}
        onCompositionStart={(event) => {
          isComposingRef.current = true;
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          isComposingRef.current = false;
          onCompositionEnd?.(event);
          emitChange(
            event as unknown as React.ChangeEvent<HTMLTextAreaElement>
          );
        }}
        className={cn(EDITOR_INPUT_LAYER, className)}
      />
    </div>
  );
}

type ArticleRichTextInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & SharedRichTextFieldProps;

export function ArticleRichTextInput({
  marks,
  className,
  shellClassName,
  mirrorClassName,
  error,
  value,
  onChange,
  onFocus,
  onBlur,
  onCompositionStart,
  onCompositionEnd,
  "data-block-id": blockId,
  "data-list-item-id": listItemId,
  ...props
}: ArticleRichTextInputProps) {
  const externalValue = typeof value === "string" ? value : "";
  const blockKey = getFieldBlockKey(blockId, listItemId);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    draftValue,
    setDraftValue,
    draftMarks,
    isFocusedRef,
    isComposingRef,
    pendingSelectionRef,
    lastEmittedValueRef,
    captureSelection,
  } = useRichTextFieldState(externalValue, marks, blockKey);

  useLayoutEffect(() => {
    const field = inputRef.current;
    const selection = pendingSelectionRef.current;

    if (!field || !selection || document.activeElement !== field) {
      return;
    }

    const maxPosition = field.value.length;

    try {
      field.setSelectionRange(
        Math.min(selection.start, maxPosition),
        Math.min(selection.end, maxPosition)
      );
    } catch {
      // Ignore invalid selection while the DOM is syncing.
    }

    pendingSelectionRef.current = null;
  }, [draftValue, draftMarks, pendingSelectionRef]);

  const emitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      captureSelection(event.target);
      setDraftValue(nextValue);
      lastEmittedValueRef.current = nextValue;
      onChange?.(event);
    },
    [captureSelection, lastEmittedValueRef, onChange, setDraftValue]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    captureSelection(event.target);
    setDraftValue(nextValue);

    if (isComposingRef.current) {
      return;
    }

    lastEmittedValueRef.current = nextValue;
    onChange?.(event);
  };

  return (
    <div
      dir="rtl"
      lang="he"
      className={cn(
        EDITOR_FIELD_SHELL,
        error &&
          "border-[var(--color-error)] focus-within:border-[var(--color-error)] focus-within:ring-[var(--color-error)]/15",
        shellClassName
      )}
    >
      <RichTextMirror
        value={draftValue}
        marks={draftMarks}
        className={cn(
          "flex h-11 items-center px-4 text-sm leading-[var(--line-height-relaxed)]",
          mirrorClassName ?? className
        )}
      />
      <Input
        {...props}
        ref={inputRef}
        dir="rtl"
        lang="he"
        data-block-id={blockId}
        data-list-item-id={listItemId}
        error={error}
        value={draftValue}
        onChange={handleChange}
        onFocus={(event) => {
          isFocusedRef.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          isFocusedRef.current = false;
          isComposingRef.current = false;
          lastEmittedValueRef.current = event.target.value;
          onBlur?.(event);
        }}
        onCompositionStart={(event) => {
          isComposingRef.current = true;
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          isComposingRef.current = false;
          onCompositionEnd?.(event);
          emitChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
        }}
        className={cn(EDITOR_INPUT_LAYER, "h-11", className)}
      />
    </div>
  );
}
