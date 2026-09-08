"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  Bold,
  GripVertical,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Trash2,
  Type,
} from "lucide-react";

import { MediaMultiSelectDialog } from "@/components/media/media-multi-select-dialog";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { ArticleLinkDialog } from "@/components/articles/article-link-dialog";
import {
  ArticleRichTextInput,
  ArticleRichTextarea,
} from "@/components/articles/article-rich-text-field";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { focusRepeaterItemFirstField } from "@/lib/forms/repeater-autofocus";
import {
  addMarkToRange,
  isCaretInsideMark,
  isRangeFullyMarked,
  removeMarkFromRange,
  toggleInlineMark,
  updateMarksForTextEdit,
} from "@/lib/articles/marks";
import {
  buildListItemPastePlan,
  buildPasteInsertionPlan,
  flattenDraftsToSegments,
  mergePastedDrafts,
  parsePastedHtml,
  parsePastedPlainText,
  type PastedBlockDraft,
} from "@/lib/articles/paste";
import type {
  ArticleBlock,
  ArticleListBlockItem,
  ArticleTextMark,
} from "@/lib/articles/types";
import { cn } from "@/lib/utils/cn";

type PendingMarks = { bold: boolean; italic: boolean };

const EMPTY_PENDING_MARKS: PendingMarks = { bold: false, italic: false };

type LinkDialogState = {
  blockId: string;
  listItemId?: string;
  start: number;
  end: number;
  mode: "insert" | "edit";
  initialUrl: string;
  initialText: string;
  requiresText: boolean;
};

function getFieldKey(blockId: string, listItemId?: string): string {
  return listItemId ? `${blockId}:${listItemId}` : blockId;
}

export type EditorBlock = ArticleBlock & { id: string };

export type EditorListItem = ArticleListBlockItem & { id: string };

export type EditorListBlock = {
  type: "list";
  list_type: "bullet" | "ordered";
  items: EditorListItem[];
  id: string;
};

export type EditorImageBlock = {
  type: "image";
  media_id: string;
  caption: string | null;
  preview?: {
    url: string;
    alt: string;
  } | null;
  id: string;
};

export type EditorBlockUnion =
  | (Exclude<ArticleBlock, { type: "list" | "image" }> & { id: string })
  | EditorListBlock
  | EditorImageBlock;

export type EditorBlockType = EditorBlockUnion["type"];

const ALL_EDITOR_BLOCK_TYPES: readonly EditorBlockType[] = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "image",
];

type ArticleEditorProps = {
  blocks: EditorBlockUnion[];
  error?: string;
  /** Shown in the editor header; omit together with `hideHeader`. */
  readingTimeLabel?: string;
  /**
   * Which block types the "add block" toolbar offers. Defaults to all of them.
   * Excluded types are also stripped from pasted content.
   */
  allowedBlockTypes?: readonly EditorBlockType[];
  /** Hide the built-in "תוכן הפוסט" header (when the host form supplies its own). */
  hideHeader?: boolean;
  onChange: (blocks: EditorBlockUnion[]) => void;
};

export function createEditorBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyBlock(
  type: EditorBlockUnion["type"],
  listType: "bullet" | "ordered" = "bullet"
): EditorBlockUnion {
  const id = createEditorBlockId();

  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, text: "" };
    case "quote":
      return { id, type: "quote", text: "" };
    case "list":
      return {
        id,
        type: "list",
        list_type: listType,
        items: [{ id: createEditorBlockId(), text: "" }],
      };
    case "image":
      return { id, type: "image", media_id: "", caption: null };
    case "paragraph":
    default:
      return { id, type: "paragraph", text: "" };
  }
}

function getFormattingContext(
  blocks: EditorBlockUnion[],
  activeField: HTMLInputElement | HTMLTextAreaElement | null,
  selection: { start: number; end: number },
  pendingMarks: PendingMarks
): {
  canFormat: boolean;
  canToggleBold: boolean;
  canToggleItalic: boolean;
  canToggleLink: boolean;
  activeMarks: { bold: boolean; italic: boolean; link: boolean };
} {
  const inactive = {
    canFormat: false,
    canToggleBold: false,
    canToggleItalic: false,
    canToggleLink: false,
    activeMarks: { bold: false, italic: false, link: false },
  };

  if (!activeField) {
    return inactive;
  }

  const blockId = activeField.dataset.blockId;
  const listItemId = activeField.dataset.listItemId;

  if (!blockId) {
    return inactive;
  }

  const block = blocks.find((entry) => entry.id === blockId);

  if (!block) {
    return inactive;
  }

  let marks: ArticleTextMark[] | undefined;

  if (block.type === "list" && listItemId) {
    const item = block.items.find((entry) => entry.id === listItemId);

    if (!item) {
      return inactive;
    }

    marks = item.marks;
  } else if (
    block.type === "paragraph" ||
    block.type === "heading" ||
    block.type === "quote"
  ) {
    marks = block.marks;
  } else {
    return inactive;
  }

  const rangeStart = Math.min(selection.start, selection.end);
  const rangeEnd = Math.max(selection.start, selection.end);
  const hasSelection = rangeStart < rangeEnd;

  const boldActive = hasSelection
    ? isRangeFullyMarked(marks, "bold", rangeStart, rangeEnd)
    : isCaretInsideMark(marks, "bold", rangeStart) || pendingMarks.bold;

  const italicActive = hasSelection
    ? isRangeFullyMarked(marks, "italic", rangeStart, rangeEnd)
    : isCaretInsideMark(marks, "italic", rangeStart) || pendingMarks.italic;

  const linkActive = hasSelection
    ? isRangeFullyMarked(marks, "link", rangeStart, rangeEnd)
    : isCaretInsideMark(marks, "link", rangeStart);

  return {
    canFormat: true,
    canToggleBold: true,
    canToggleItalic: true,
    canToggleLink: true,
    activeMarks: {
      bold: boldActive,
      italic: italicActive,
      link: linkActive,
    },
  };
}

type EditorToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  preserveFocus?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function EditorToolbarButton({
  label,
  active = false,
  disabled = false,
  preserveFocus = false,
  onClick,
  children,
}: EditorToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={
        preserveFocus
          ? (event) => {
              event.preventDefault();
            }
          : undefined
      }
      onClick={onClick}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sky-blue)]/25",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-[var(--color-sky-blue-soft)] text-[var(--color-sky-blue)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-sky-blue)_35%,transparent)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)]"
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbarDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-0.5 hidden h-7 w-px shrink-0 bg-[var(--color-border)] sm:block"
    />
  );
}

function createBlockFromDraft(draft: PastedBlockDraft): EditorBlockUnion {
  const id = createEditorBlockId();

  switch (draft.kind) {
    case "heading":
      return { id, type: "heading", level: draft.level, text: draft.text, marks: draft.marks };
    case "quote":
      return { id, type: "quote", text: draft.text, marks: draft.marks };
    case "list":
      return {
        id,
        type: "list",
        list_type: draft.list_type,
        items: draft.items.map((item) => ({
          id: createEditorBlockId(),
          text: item.text,
          marks: item.marks,
        })),
      };
    case "paragraph":
    default:
      return { id, type: "paragraph", text: draft.text, marks: draft.marks };
  }
}

function stripBlockForSubmit(block: EditorBlockUnion): ArticleBlock {
  switch (block.type) {
    case "list":
      return {
        type: "list",
        list_type: block.list_type,
        items: block.items.map(({ text, marks }) => ({ text, marks })),
      };
    case "image":
      return {
        type: "image",
        media_id: block.media_id,
        caption: block.caption,
      };
    default:
      return block;
  }
}

export function editorBlocksToArticleBlocks(
  blocks: EditorBlockUnion[]
): ArticleBlock[] {
  return blocks.map((block) => stripBlockForSubmit(block));
}

export function articleBlocksToEditorBlocks(
  blocks: ArticleBlock[],
  blockMediaUrls?: Map<string, { url: string | null; alt: string | null }>
): EditorBlockUnion[] {
  // Use deterministic IDs so SSR HTML matches the client's first paint.
  // Random UUIDs here cause hydration mismatches on admin edit forms.
  return blocks.map((block, index) => {
    const id = `editor-block-${index}`;

    if (block.type === "list") {
      return {
        id,
        type: "list",
        list_type: block.list_type,
        items: block.items.map((item, itemIndex) => ({
          id: `editor-block-${index}-item-${itemIndex}`,
          text: item.text,
          marks: item.marks,
        })),
      };
    }

    if (block.type === "image") {
      const media = blockMediaUrls?.get(block.media_id);

      return {
        id,
        type: "image",
        media_id: block.media_id,
        caption: block.caption,
        preview: media?.url
          ? { url: media.url, alt: media.alt ?? "" }
          : null,
      };
    }

    return { ...block, id };
  });
}

export function ArticleEditor({
  blocks,
  error,
  readingTimeLabel,
  allowedBlockTypes = ALL_EDITOR_BLOCK_TYPES,
  hideHeader = false,
  onChange,
}: ArticleEditorProps) {
  const canUseBlockType = (type: EditorBlockType) =>
    allowedBlockTypes.includes(type);
  const [pendingFocusBlockId, setPendingFocusBlockId] = useState<string | null>(
    null
  );
  const [pendingFocusListItemId, setPendingFocusListItemId] = useState<
    string | null
  >(null);
  const [activeField, setActiveField] = useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const [imagePickerBlockId, setImagePickerBlockId] = useState<string | null>(
    null
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [pendingMarksByField, setPendingMarksByField] = useState<
    Record<string, PendingMarks>
  >({});
  const [linkDialogState, setLinkDialogState] = useState<LinkDialogState | null>(
    null
  );
  const blockRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const fieldTextRef = useRef<Map<string, string>>(new Map());
  const lastSelectionRef = useRef({ start: 0, end: 0 });

  const bumpSelection = (
    field: HTMLInputElement | HTMLTextAreaElement
  ) => {
    const nextSelection = {
      start: field.selectionStart ?? 0,
      end: field.selectionEnd ?? 0,
    };

    lastSelectionRef.current = nextSelection;
    setSelectionRange(nextSelection);
  };

  const syncSelectionFromField = (
    field: HTMLInputElement | HTMLTextAreaElement
  ) => {
    lastSelectionRef.current = {
      start: field.selectionStart ?? 0,
      end: field.selectionEnd ?? 0,
    };
  };

  const handleFieldFocus = (
    field: HTMLInputElement | HTMLTextAreaElement
  ) => {
    setActiveField(field);
    bumpSelection(field);

    const blockId = field.dataset.blockId;
    const listItemId = field.dataset.listItemId;

    if (!blockId) {
      return;
    }

    const block = blocks.find((entry) => entry.id === blockId);

    if (!block) {
      return;
    }

    const fieldKey = getFieldKey(blockId, listItemId);
    const currentText =
      block.type === "list" && listItemId
        ? block.items.find((item) => item.id === listItemId)?.text ?? ""
        : block.type === "paragraph" ||
            block.type === "heading" ||
            block.type === "quote"
          ? block.text
          : "";

    fieldTextRef.current.set(fieldKey, currentText);
  };

  const activeFieldKey = activeField
    ? getFieldKey(
        activeField.dataset.blockId ?? "",
        activeField.dataset.listItemId
      )
    : "";

  const activePendingMarks =
    pendingMarksByField[activeFieldKey] ?? EMPTY_PENDING_MARKS;

  const {
    canFormat,
    canToggleBold,
    canToggleItalic,
    canToggleLink,
    activeMarks,
  } = getFormattingContext(
    blocks,
    activeField,
    selectionRange,
    activePendingMarks
  );

  const updateBlock = (id: string, nextBlock: EditorBlockUnion) => {
    onChange(blocks.map((block) => (block.id === id ? nextBlock : block)));
  };

  const removeBlock = (id: string) => {
    blockRefs.current.delete(id);
    onChange(blocks.filter((block) => block.id !== id));
  };

  const addBlock = (
    type: EditorBlockUnion["type"],
    listType: "bullet" | "ordered" = "bullet"
  ) => {
    const block = createEmptyBlock(type, listType);
    setPendingFocusBlockId(block.id);
    onChange([...blocks, block]);
  };

  const addListItem = (blockId: string) => {
    const block = blocks.find((entry) => entry.id === blockId);

    if (!block || block.type !== "list") {
      return;
    }

    const newItem = { id: createEditorBlockId(), text: "" };
    setPendingFocusListItemId(newItem.id);
    updateBlock(blockId, {
      ...block,
      items: [...block.items, newItem],
    });
  };

  useLayoutEffect(() => {
    if (!pendingFocusBlockId) {
      return;
    }

    const container = blockRefs.current.get(pendingFocusBlockId);

    if (!container) {
      return;
    }

    focusRepeaterItemFirstField(container);
    setPendingFocusBlockId(null);
  }, [pendingFocusBlockId, blocks]);

  useLayoutEffect(() => {
    if (!pendingFocusListItemId) {
      return;
    }

    for (const block of blocks) {
      if (block.type !== "list") {
        continue;
      }

      if (!block.items.some((item) => item.id === pendingFocusListItemId)) {
        continue;
      }

      const container = blockRefs.current.get(block.id);

      if (!container) {
        return;
      }

      focusRepeaterItemFirstField(container);
      setPendingFocusListItemId(null);
      return;
    }
  }, [pendingFocusListItemId, blocks]);

  const applyToolbarMark = (markType: ArticleTextMark["type"]) => {
    if (!activeField || !canFormat) {
      return;
    }

    const blockId = activeField.dataset.blockId;
    const listItemId = activeField.dataset.listItemId;

    if (!blockId) {
      return;
    }

    const block = blocks.find((entry) => entry.id === blockId);

    if (!block) {
      return;
    }

    const fieldKey = getFieldKey(blockId, listItemId);
    const start =
      activeField.selectionStart ?? lastSelectionRef.current.start;
    const end = activeField.selectionEnd ?? lastSelectionRef.current.end;
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);

    if (markType === "bold" || markType === "italic") {
      if (rangeStart >= rangeEnd) {
        setPendingMarksByField((previous) => {
          const current = previous[fieldKey] ?? EMPTY_PENDING_MARKS;

          return {
            ...previous,
            [fieldKey]: {
              ...current,
              [markType]: !current[markType],
            },
          };
        });
        activeField.focus();
        return;
      }

      setPendingMarksByField((previous) => ({
        ...previous,
        [fieldKey]: EMPTY_PENDING_MARKS,
      }));

      const applyToggle = (
        text: string,
        marks: ArticleTextMark[] | undefined
      ) => ({
        text,
        marks: toggleInlineMark(marks, start, end, markType),
      });

      if (block.type === "list" && listItemId) {
        updateBlock(blockId, {
          ...block,
          items: block.items.map((item) => {
            if (item.id !== listItemId) {
              return item;
            }

            const updated = applyToggle(item.text, item.marks);

            return { ...item, text: updated.text, marks: updated.marks };
          }),
        });
      } else if (
        block.type === "paragraph" ||
        block.type === "heading" ||
        block.type === "quote"
      ) {
        const updated = applyToggle(block.text, block.marks);

        updateBlock(blockId, {
          ...block,
          text: updated.text,
          marks: updated.marks,
        });
      }

      requestAnimationFrame(() => {
        activeField.focus();
        activeField.setSelectionRange(start, end);
        syncSelectionFromField(activeField);
      });

      return;
    }

    if (!canToggleLink) {
      return;
    }

    openLinkDialogForField(activeField, block, blockId, listItemId);
  };

  const openLinkDialogForField = (
    field: HTMLInputElement | HTMLTextAreaElement,
    block: EditorBlockUnion,
    blockId: string,
    listItemId: string | undefined
  ) => {
    let text: string;
    let marks: ArticleTextMark[] | undefined;

    if (block.type === "list" && listItemId) {
      const item = block.items.find((entry) => entry.id === listItemId);

      if (!item) {
        return;
      }

      text = item.text;
      marks = item.marks;
    } else if (
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
    ) {
      text = block.text;
      marks = block.marks;
    } else {
      return;
    }

    const start = field.selectionStart ?? lastSelectionRef.current.start;
    const end = field.selectionEnd ?? lastSelectionRef.current.end;
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);
    const hasSelection = rangeStart < rangeEnd;
    const caretPosition = rangeStart;

    const existingLink = (marks ?? []).find(
      (mark) =>
        mark.type === "link" &&
        (hasSelection
          ? mark.start <= rangeStart && mark.end >= rangeEnd
          : mark.start <= caretPosition && mark.end > caretPosition)
    );

    const linkStart = existingLink ? existingLink.start : rangeStart;
    const linkEnd = existingLink ? existingLink.end : rangeEnd;

    setLinkDialogState({
      blockId,
      listItemId,
      start: linkStart,
      end: linkEnd,
      mode: existingLink ? "edit" : "insert",
      initialUrl: existingLink?.href ?? "",
      initialText: text.slice(linkStart, linkEnd),
      requiresText: !existingLink && !hasSelection,
    });
  };

  const closeLinkDialog = (caretPosition?: number) => {
    const field = activeField;
    setLinkDialogState(null);
    requestAnimationFrame(() => {
      field?.focus();

      if (field && caretPosition !== undefined) {
        try {
          field.setSelectionRange(caretPosition, caretPosition);
        } catch {
          // Ignore invalid selection while the DOM is syncing.
        }
      }
    });
  };

  const handleLinkDialogSubmit = (url: string, linkText: string | undefined) => {
    if (!linkDialogState) {
      return;
    }

    const { blockId, listItemId, start, end, requiresText } = linkDialogState;
    const block = blocks.find((entry) => entry.id === blockId);

    if (!block) {
      setLinkDialogState(null);
      return;
    }

    const applyLink = (
      text: string,
      marks: ArticleTextMark[] | undefined
    ): { text: string; marks: ArticleTextMark[] } => {
      if (!requiresText) {
        return { text, marks: addMarkToRange(marks ?? [], "link", start, end, url) };
      }

      const insertText = linkText && linkText.length > 0 ? linkText : url;
      const before = text.slice(0, start);
      const after = text.slice(start);
      const beforeMarks = (marks ?? []).filter((mark) => mark.end <= start);
      const afterMarks = (marks ?? [])
        .filter((mark) => mark.start >= start)
        .map((mark) => ({
          ...mark,
          start: mark.start + insertText.length,
          end: mark.end + insertText.length,
        }));
      const newMark: ArticleTextMark = {
        type: "link",
        start,
        end: start + insertText.length,
        href: url,
      };

      return {
        text: before + insertText + after,
        marks: [...beforeMarks, newMark, ...afterMarks],
      };
    };

    if (block.type === "list" && listItemId) {
      updateBlock(blockId, {
        ...block,
        items: block.items.map((item) => {
          if (item.id !== listItemId) {
            return item;
          }

          const updated = applyLink(item.text, item.marks);

          return { ...item, text: updated.text, marks: updated.marks };
        }),
      });
    } else if (
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
    ) {
      const updated = applyLink(block.text, block.marks);

      updateBlock(blockId, { ...block, text: updated.text, marks: updated.marks });
    }

    const caretPosition = requiresText
      ? start + (linkText && linkText.length > 0 ? linkText.length : url.length)
      : end;

    closeLinkDialog(caretPosition);
  };

  const handleLinkDialogRemove = () => {
    if (!linkDialogState) {
      return;
    }

    const { blockId, listItemId, start, end } = linkDialogState;
    const block = blocks.find((entry) => entry.id === blockId);

    if (!block) {
      setLinkDialogState(null);
      return;
    }

    if (block.type === "list" && listItemId) {
      updateBlock(blockId, {
        ...block,
        items: block.items.map((item) => {
          if (item.id !== listItemId) {
            return item;
          }

          return {
            ...item,
            marks: removeMarkFromRange(item.marks ?? [], "link", start, end),
          };
        }),
      });
    } else if (
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
    ) {
      updateBlock(blockId, {
        ...block,
        marks: removeMarkFromRange(block.marks ?? [], "link", start, end),
      });
    }

    closeLinkDialog(end);
  };

  const handleFormatKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    syncSelectionFromField(event.currentTarget);

    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "b") {
      event.preventDefault();
      applyToolbarMark("bold");
    }

    if (key === "i") {
      event.preventDefault();
      applyToolbarMark("italic");
    }

    if (key === "k") {
      event.preventDefault();
      applyToolbarMark("link");
    }
  };

  const handleTextFieldChange = (
    blockId: string,
    listItemId: string | undefined,
    previousText: string,
    nextText: string,
    currentMarks: ArticleTextMark[] | undefined,
    onUpdate: (text: string, marks: ArticleTextMark[]) => void
  ) => {
    const fieldKey = getFieldKey(blockId, listItemId);
    const pending = pendingMarksByField[fieldKey] ?? EMPTY_PENDING_MARKS;
    const nextMarks = updateMarksForTextEdit(
      currentMarks,
      previousText,
      nextText,
      pending
    );

    fieldTextRef.current.set(fieldKey, nextText);
    onUpdate(nextText, nextMarks);
  };

  const coerceDraftToAllowed = (draft: PastedBlockDraft): PastedBlockDraft => {
    if (canUseBlockType(draft.kind)) {
      return draft;
    }

    const text =
      draft.kind === "list"
        ? draft.items.map((item) => item.text).join("\n")
        : draft.text;
    const marks = draft.kind === "list" ? [] : draft.marks;

    return { kind: "paragraph", text, marks };
  };

  const parseClipboardDrafts = (
    clipboardData: DataTransfer
  ): PastedBlockDraft[] => {
    const html = clipboardData.getData("text/html");

    if (html && html.trim().length > 0) {
      const htmlDrafts = parsePastedHtml(html);

      if (htmlDrafts.length > 0) {
        return htmlDrafts.map(coerceDraftToAllowed);
      }
    }

    return parsePastedPlainText(clipboardData.getData("text/plain")).map(
      coerceDraftToAllowed
    );
  };

  /**
   * Refocuses a field after a programmatic (non-native) content update so
   * the mirror/draft state resyncs from the new external value instead of
   * staying stuck on the stale in-progress draft (see article-rich-text-field's
   * focused-typing protection).
   */
  const restoreFieldFocus = (
    field: HTMLInputElement | HTMLTextAreaElement,
    caretPosition: number
  ) => {
    field.blur();
    requestAnimationFrame(() => {
      field.focus();
      try {
        field.setSelectionRange(caretPosition, caretPosition);
      } catch {
        // Ignore invalid selection while the DOM is syncing.
      }
      syncSelectionFromField(field);
    });
  };

  const handleTextareaPaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
    blockId: string
  ) => {
    const block = blocks.find((entry) => entry.id === blockId);

    if (
      !block ||
      (block.type !== "paragraph" &&
        block.type !== "heading" &&
        block.type !== "quote")
    ) {
      return;
    }

    const drafts = parseClipboardDrafts(event.clipboardData);

    if (drafts.length <= 1) {
      return;
    }

    event.preventDefault();

    const field = event.currentTarget;
    const start = field.selectionStart ?? block.text.length;
    const end = field.selectionEnd ?? block.text.length;

    const mergedDraft = mergePastedDrafts(drafts);
    const plan = buildPasteInsertionPlan(block.text, block.marks, start, end, [
      mergedDraft,
    ]);
    const fieldKey = getFieldKey(blockId);
    fieldTextRef.current.set(fieldKey, plan.updatedCurrentText);

    const index = blocks.findIndex((entry) => entry.id === blockId);

    if (index === -1) {
      return;
    }

    const nextBlocks = [...blocks];
    nextBlocks[index] = {
      ...block,
      text: plan.updatedCurrentText,
      marks: plan.updatedCurrentMarks,
    };
    nextBlocks.splice(
      index + 1,
      0,
      ...plan.newBlocksAfter.map((draft) => createBlockFromDraft(draft))
    );
    onChange(nextBlocks);

    restoreFieldFocus(field, plan.updatedCurrentText.length);
  };

  const handleListItemPaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    blockId: string,
    listItemId: string
  ) => {
    const block = blocks.find((entry) => entry.id === blockId);

    if (!block || block.type !== "list") {
      return;
    }

    const item = block.items.find((entry) => entry.id === listItemId);

    if (!item) {
      return;
    }

    const drafts = parseClipboardDrafts(event.clipboardData);
    const segments = flattenDraftsToSegments(drafts);

    if (segments.length <= 1) {
      return;
    }

    event.preventDefault();

    const field = event.currentTarget;
    const start = field.selectionStart ?? item.text.length;
    const end = field.selectionEnd ?? item.text.length;

    const plan = buildListItemPastePlan(item.text, item.marks, start, end, segments);
    const fieldKey = getFieldKey(blockId, listItemId);
    fieldTextRef.current.set(fieldKey, plan.updatedCurrentText);

    const itemIndex = block.items.findIndex((entry) => entry.id === listItemId);

    if (itemIndex === -1) {
      return;
    }

    const nextItems = [...block.items];
    nextItems[itemIndex] = {
      ...item,
      text: plan.updatedCurrentText,
      marks: plan.updatedCurrentMarks,
    };
    nextItems.splice(
      itemIndex + 1,
      0,
      ...plan.newItemsAfter.map((segment) => ({
        id: createEditorBlockId(),
        text: segment.text,
        marks: segment.marks,
      }))
    );
    updateBlock(blockId, { ...block, items: nextItems });

    restoreFieldFocus(field, plan.updatedCurrentText.length);
  };

  const handleDragStart = (index: number) => (event: React.DragEvent) => {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetIndex: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      sourceIndex >= blocks.length
    ) {
      return;
    }

    const nextBlocks = [...blocks];
    const [moved] = nextBlocks.splice(sourceIndex, 1);
    nextBlocks.splice(targetIndex, 0, moved);
    onChange(nextBlocks);
  };

  return (
    <div
      id="section-content"
      className={cn(
        "space-y-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]/35 p-4 sm:p-6",
        error && "ring-1 ring-[var(--color-error)]/40"
      )}
    >
      {hideHeader ? null : (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              תוכן הפוסט
            </h3>
            <p className="text-caption text-[var(--color-text-muted)]">
              כתבי, עצבי וסדרי את הפוסט{readingTimeLabel ? ` — ${readingTimeLabel}` : ""}
            </p>
          </div>
        </div>
      )}

      <div
        role="toolbar"
        aria-label="סרגל עריכה"
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]/95 p-1.5 shadow-[var(--shadow-sm)] backdrop-blur-sm"
      >
        <div
          role="group"
          aria-label="הוספת בלוקים"
          className="flex flex-wrap items-center gap-0.5"
        >
          {canUseBlockType("paragraph") ? (
            <EditorToolbarButton
              label="פסקה"
              onClick={() => addBlock("paragraph")}
            >
              <Type aria-hidden="true" className="size-4" strokeWidth={2} />
            </EditorToolbarButton>
          ) : null}
          {canUseBlockType("heading") ? (
            <EditorToolbarButton
              label="כותרת"
              onClick={() => addBlock("heading")}
            >
              <Heading2 aria-hidden="true" className="size-4" strokeWidth={2} />
            </EditorToolbarButton>
          ) : null}
          {canUseBlockType("list") ? (
            <>
              <EditorToolbarButton
                label="רשימת תבליטים"
                onClick={() => addBlock("list", "bullet")}
              >
                <List aria-hidden="true" className="size-4" strokeWidth={2} />
              </EditorToolbarButton>
              <EditorToolbarButton
                label="רשימה ממוספרת"
                onClick={() => addBlock("list", "ordered")}
              >
                <ListOrdered
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              </EditorToolbarButton>
            </>
          ) : null}
          {canUseBlockType("quote") ? (
            <EditorToolbarButton label="ציטוט" onClick={() => addBlock("quote")}>
              <Quote aria-hidden="true" className="size-4" strokeWidth={2} />
            </EditorToolbarButton>
          ) : null}
        </div>

        <EditorToolbarDivider />

        <div
          role="group"
          aria-label="עיצוב טקסט"
          className="flex flex-wrap items-center gap-0.5"
        >
          <EditorToolbarButton
            label="מודגש"
            active={activeMarks.bold}
            disabled={!canToggleBold}
            preserveFocus
            onClick={() => applyToolbarMark("bold")}
          >
            <Bold aria-hidden="true" className="size-4" strokeWidth={2.25} />
          </EditorToolbarButton>
          <EditorToolbarButton
            label="נטוי"
            active={activeMarks.italic}
            disabled={!canToggleItalic}
            preserveFocus
            onClick={() => applyToolbarMark("italic")}
          >
            <Italic aria-hidden="true" className="size-4" strokeWidth={2.25} />
          </EditorToolbarButton>
          <EditorToolbarButton
            label="הוספת קישור (Ctrl+K)"
            active={activeMarks.link}
            disabled={!canToggleLink}
            preserveFocus
            onClick={() => applyToolbarMark("link")}
          >
            <Link2 aria-hidden="true" className="size-4" strokeWidth={2} />
          </EditorToolbarButton>
        </div>

        {!canFormat ? (
          <p className="me-auto w-full px-1 pt-1 text-[0.6875rem] text-[var(--color-text-muted)] sm:w-auto sm:pt-0">
            מקמי את הסמן בשדה טקסט כדי לעצב
          </p>
        ) : null}
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] px-6 py-16 text-center text-sm text-[var(--color-text-muted)]">
          התחילי מהסרגל למעלה — הוסיפי פסקה, כותרת או ציטוט.
        </div>
      ) : (
        <ul className="space-y-4">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              ref={(node) => {
                if (node) {
                  blockRefs.current.set(block.id, node);
                } else {
                  blockRefs.current.delete(block.id);
                }
              }}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop(index)}
              className="group rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]/70"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-caption text-[var(--color-text-muted)]">
                  <button
                    type="button"
                    aria-label="גרירה לסידור מחדש"
                    className="rounded-[var(--radius-sm)] p-1 hover:bg-[var(--color-surface-soft)]"
                  >
                    <GripVertical aria-hidden="true" className="size-4" />
                  </button>
                  <span>
                    {block.type === "paragraph"
                      ? "פסקה"
                      : block.type === "heading"
                        ? "כותרת"
                        : block.type === "quote"
                          ? "ציטוט"
                          : block.type === "list"
                            ? "רשימה"
                            : "תמונה"}
                  </span>
                </div>
                <IconButton
                  label="הסרת בלוק"
                  size="sm"
                  onClick={() => removeBlock(block.id)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </IconButton>
              </div>

              {block.type === "paragraph" ? (
                <ArticleRichTextarea
                  data-block-id={block.id}
                  value={block.text}
                  marks={block.marks}
                  rows={5}
                  className="min-h-36 text-base leading-[1.9]"
                  mirrorClassName="min-h-36 px-4 py-3.5 text-base leading-[1.9]"
                  onFocus={(event) => handleFieldFocus(event.currentTarget)}
                  onSelect={(event) => bumpSelection(event.currentTarget)}
                  onKeyUp={(event) => bumpSelection(event.currentTarget)}
                  onKeyDown={handleFormatKeyDown}
                  onMouseUp={(event) => bumpSelection(event.currentTarget)}
                  onPaste={(event) => handleTextareaPaste(event, block.id)}
                  onChange={(event) => {
                    const fieldKey = getFieldKey(block.id);
                    const previousText =
                      fieldTextRef.current.get(fieldKey) ?? block.text;

                    handleTextFieldChange(
                      block.id,
                      undefined,
                      previousText,
                      event.target.value,
                      block.marks,
                      (text, marks) =>
                        updateBlock(block.id, { ...block, text, marks })
                    );
                  }}
                />
              ) : null}

              {block.type === "heading" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={block.level === 2 ? "primary" : "outline"}
                      onClick={() => updateBlock(block.id, { ...block, level: 2 })}
                    >
                      כותרת גדולה
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={block.level === 3 ? "primary" : "outline"}
                      onClick={() => updateBlock(block.id, { ...block, level: 3 })}
                    >
                      כותרת בינונית
                    </Button>
                  </div>
                  <ArticleRichTextarea
                    data-block-id={block.id}
                    value={block.text}
                    marks={block.marks}
                    rows={2}
                    className="text-xl font-semibold leading-snug"
                    mirrorClassName="px-4 py-3.5 text-xl font-semibold leading-snug"
                    onFocus={(event) => handleFieldFocus(event.currentTarget)}
                    onSelect={(event) => bumpSelection(event.currentTarget)}
                    onKeyUp={(event) => bumpSelection(event.currentTarget)}
                    onKeyDown={handleFormatKeyDown}
                    onMouseUp={(event) => bumpSelection(event.currentTarget)}
                    onPaste={(event) => handleTextareaPaste(event, block.id)}
                    onChange={(event) => {
                      const fieldKey = getFieldKey(block.id);
                      const previousText =
                        fieldTextRef.current.get(fieldKey) ?? block.text;

                      handleTextFieldChange(
                        block.id,
                        undefined,
                        previousText,
                        event.target.value,
                        block.marks,
                        (text, marks) =>
                          updateBlock(block.id, { ...block, text, marks })
                      );
                    }}
                  />
                </div>
              ) : null}

              {block.type === "quote" ? (
                <ArticleRichTextarea
                  data-block-id={block.id}
                  value={block.text}
                  marks={block.marks}
                  rows={3}
                  shellClassName="border-s-4 border-[var(--color-sky-blue)]/40 bg-[var(--color-sky-blue-soft)]/25"
                  className="text-lg italic leading-[1.85]"
                  mirrorClassName="px-4 py-3.5 text-lg italic leading-[1.85]"
                  onFocus={(event) => handleFieldFocus(event.currentTarget)}
                  onSelect={(event) => bumpSelection(event.currentTarget)}
                  onKeyUp={(event) => bumpSelection(event.currentTarget)}
                  onKeyDown={handleFormatKeyDown}
                  onMouseUp={(event) => bumpSelection(event.currentTarget)}
                  onPaste={(event) => handleTextareaPaste(event, block.id)}
                  onChange={(event) => {
                    const fieldKey = getFieldKey(block.id);
                    const previousText =
                      fieldTextRef.current.get(fieldKey) ?? block.text;

                    handleTextFieldChange(
                      block.id,
                      undefined,
                      previousText,
                      event.target.value,
                      block.marks,
                      (text, marks) =>
                        updateBlock(block.id, { ...block, text, marks })
                    );
                  }}
                />
              ) : null}

              {block.type === "list" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={block.list_type === "bullet" ? "primary" : "outline"}
                      onClick={() =>
                        updateBlock(block.id, { ...block, list_type: "bullet" })
                      }
                    >
                      <List aria-hidden="true" className="size-4" />
                      תבליטים
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={block.list_type === "ordered" ? "primary" : "outline"}
                      onClick={() =>
                        updateBlock(block.id, { ...block, list_type: "ordered" })
                      }
                    >
                      <ListOrdered aria-hidden="true" className="size-4" />
                      ממוספר
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item.id} className="flex items-start gap-2">
                        <ArticleRichTextInput
                          data-block-id={block.id}
                          data-list-item-id={item.id}
                          value={item.text}
                          marks={item.marks}
                          shellClassName="flex-1"
                          className="flex-1"
                          onFocus={(event) => handleFieldFocus(event.currentTarget)}
                          onSelect={(event) =>
                            bumpSelection(event.currentTarget)
                          }
                          onKeyUp={(event) =>
                            bumpSelection(event.currentTarget)
                          }
                          onKeyDown={handleFormatKeyDown}
                          onMouseUp={(event) =>
                            bumpSelection(event.currentTarget)
                          }
                          onPaste={(event) =>
                            handleListItemPaste(event, block.id, item.id)
                          }
                          onChange={(event) => {
                            const fieldKey = getFieldKey(block.id, item.id);
                            const previousText =
                              fieldTextRef.current.get(fieldKey) ?? item.text;

                            handleTextFieldChange(
                              block.id,
                              item.id,
                              previousText,
                              event.target.value,
                              item.marks,
                              (text, marks) =>
                                updateBlock(block.id, {
                                  ...block,
                                  items: block.items.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, text, marks }
                                      : entry
                                  ),
                                })
                            );
                          }}
                        />
                        <IconButton
                          label="הסרת פריט"
                          size="sm"
                          onClick={() =>
                            updateBlock(block.id, {
                              ...block,
                              items: block.items.filter(
                                (entry) => entry.id !== item.id
                              ),
                            })
                          }
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(block.id)}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    הוספת פריט
                  </Button>
                </div>
              ) : null}

              {block.type === "image" ? (
                <div className="space-y-3">
                  {block.preview?.url ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]">
                      <Image
                        src={block.preview.url}
                        alt={block.preview.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 768px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
                      טרם נבחרה תמונה
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setImagePickerBlockId(block.id)}
                    >
                      בחירת תמונה
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadOpen(true)}
                    >
                      העלאה חדשה
                    </Button>
                  </div>
                  <Input
                    data-block-id={block.id}
                    value={block.caption ?? ""}
                    placeholder="כיתוב תמונה (אופציונלי)"
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        caption: event.target.value,
                      })
                    }
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canUseBlockType("image") ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)]/60 pt-4">
          <span className="text-caption text-[var(--color-text-muted)]">
            הוספת מדיה
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("image")}
          >
            <ImageIcon aria-hidden="true" className="size-4" />
            תמונה
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      <MediaMultiSelectDialog
        open={Boolean(imagePickerBlockId)}
        onClose={() => setImagePickerBlockId(null)}
        maxSelectable={1}
        title="בחירת תמונה לתוכן"
        description="בחרו תמונה אחת מהספרייה"
        onConfirm={(selected) => {
          const media = selected[0];

          if (!imagePickerBlockId || !media) {
            return;
          }

          const block = blocks.find((entry) => entry.id === imagePickerBlockId);

          if (!block || block.type !== "image") {
            return;
          }

          updateBlock(imagePickerBlockId, {
            ...block,
            media_id: media.id,
            preview: { url: media.url, alt: media.alt },
          });
          setImagePickerBlockId(null);
        }}
      />

      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
        }}
      />

      <ArticleLinkDialog
        open={Boolean(linkDialogState)}
        mode={linkDialogState?.mode ?? "insert"}
        initialUrl={linkDialogState?.initialUrl ?? ""}
        initialText={linkDialogState?.initialText ?? ""}
        requiresText={linkDialogState?.requiresText ?? false}
        onCancel={closeLinkDialog}
        onSubmit={handleLinkDialogSubmit}
        onRemove={handleLinkDialogRemove}
      />
    </div>
  );
}
