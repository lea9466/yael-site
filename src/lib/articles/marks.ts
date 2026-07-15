import type { ArticleTextMark } from "@/lib/articles/types";

export type InlineMarkType = "bold" | "italic";

export function isRangeFullyMarked(
  marks: ArticleTextMark[] | undefined,
  markType: ArticleTextMark["type"],
  rangeStart: number,
  rangeEnd: number
): boolean {
  if (rangeStart >= rangeEnd) {
    return false;
  }

  for (let index = rangeStart; index < rangeEnd; index += 1) {
    const covered = marks?.some(
      (mark) =>
        mark.type === markType && mark.start <= index && mark.end > index
    );

    if (!covered) {
      return false;
    }
  }

  return true;
}

export function isCaretInsideMark(
  marks: ArticleTextMark[] | undefined,
  markType: ArticleTextMark["type"],
  position: number
): boolean {
  return (
    marks?.some(
      (mark) =>
        mark.type === markType &&
        mark.start <= position &&
        mark.end > position
    ) ?? false
  );
}

export function removeMarkFromRange(
  marks: ArticleTextMark[],
  markType: ArticleTextMark["type"],
  rangeStart: number,
  rangeEnd: number
): ArticleTextMark[] {
  const result: ArticleTextMark[] = [];

  for (const mark of marks) {
    if (mark.type !== markType) {
      result.push(mark);
      continue;
    }

    if (mark.end <= rangeStart || mark.start >= rangeEnd) {
      result.push(mark);
      continue;
    }

    if (mark.start < rangeStart) {
      result.push({ ...mark, end: rangeStart });
    }

    if (mark.end > rangeEnd) {
      result.push({ ...mark, start: rangeEnd });
    }
  }

  return result;
}

export function addMarkToRange(
  marks: ArticleTextMark[],
  markType: ArticleTextMark["type"],
  rangeStart: number,
  rangeEnd: number,
  href?: string
): ArticleTextMark[] {
  const withoutOverlap = removeMarkFromRange(
    marks,
    markType,
    rangeStart,
    rangeEnd
  );

  return [
    ...withoutOverlap,
    {
      type: markType,
      start: rangeStart,
      end: rangeEnd,
      ...(markType === "link" && href ? { href } : {}),
    },
  ];
}

export function toggleInlineMark(
  marks: ArticleTextMark[] | undefined,
  selectionStart: number,
  selectionEnd: number,
  markType: InlineMarkType
): ArticleTextMark[] {
  const rangeStart = Math.min(selectionStart, selectionEnd);
  const rangeEnd = Math.max(selectionStart, selectionEnd);
  const existing = marks ?? [];

  if (rangeStart >= rangeEnd) {
    return existing;
  }

  if (isRangeFullyMarked(existing, markType, rangeStart, rangeEnd)) {
    return removeMarkFromRange(existing, markType, rangeStart, rangeEnd);
  }

  return addMarkToRange(existing, markType, rangeStart, rangeEnd);
}

export function applyPendingMarksToInsert(
  marks: ArticleTextMark[] | undefined,
  insertStart: number,
  insertEnd: number,
  pending: { bold: boolean; italic: boolean }
): ArticleTextMark[] {
  if (insertStart >= insertEnd) {
    return marks ?? [];
  }

  let nextMarks = marks ?? [];

  if (pending.bold) {
    nextMarks = addMarkToRange(nextMarks, "bold", insertStart, insertEnd);
  }

  if (pending.italic) {
    nextMarks = addMarkToRange(nextMarks, "italic", insertStart, insertEnd);
  }

  return nextMarks;
}

export type TextEditDiff = {
  changeStart: number;
  removedLength: number;
  insertedLength: number;
};

export function computeTextEditDiff(
  previousText: string,
  nextText: string
): TextEditDiff {
  let changeStart = 0;

  while (
    changeStart < previousText.length &&
    changeStart < nextText.length &&
    previousText[changeStart] === nextText[changeStart]
  ) {
    changeStart += 1;
  }

  let previousEnd = previousText.length;
  let nextEnd = nextText.length;

  while (
    previousEnd > changeStart &&
    nextEnd > changeStart &&
    previousText[previousEnd - 1] === nextText[nextEnd - 1]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return {
    changeStart,
    removedLength: previousEnd - changeStart,
    insertedLength: nextEnd - changeStart,
  };
}

function shiftMarksAfterEdit(
  marks: ArticleTextMark[],
  changeStart: number,
  removedLength: number,
  insertedLength: number
): ArticleTextMark[] {
  const deleteEnd = changeStart + removedLength;
  const delta = insertedLength - removedLength;

  if (removedLength === 0 && insertedLength === 0) {
    return marks;
  }

  const adjusted: ArticleTextMark[] = [];

  for (const mark of marks) {
    if (mark.end <= changeStart) {
      adjusted.push(mark);
      continue;
    }

    if (mark.start >= deleteEnd) {
      adjusted.push({
        ...mark,
        start: mark.start + delta,
        end: mark.end + delta,
      });
      continue;
    }

    const clippedEnd = Math.min(mark.end, deleteEnd);

    if (mark.start < changeStart) {
      adjusted.push({
        ...mark,
        end: changeStart,
      });
    }

    const survivingLength = mark.end - clippedEnd;

    if (survivingLength > 0) {
      adjusted.push({
        ...mark,
        start: changeStart + insertedLength,
        end: changeStart + insertedLength + survivingLength,
      });
    }
  }

  return adjusted;
}

export function updateMarksForTextEdit(
  marks: ArticleTextMark[] | undefined,
  previousText: string,
  nextText: string,
  pending: { bold: boolean; italic: boolean }
): ArticleTextMark[] {
  const diff = computeTextEditDiff(previousText, nextText);
  let nextMarks = shiftMarksAfterEdit(
    marks ?? [],
    diff.changeStart,
    diff.removedLength,
    diff.insertedLength
  );

  if (diff.insertedLength > 0) {
    nextMarks = applyPendingMarksToInsert(
      nextMarks,
      diff.changeStart,
      diff.changeStart + diff.insertedLength,
      pending
    );
  }

  return nextMarks;
}
