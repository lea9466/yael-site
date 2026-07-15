import { Tag as TagIcon } from "lucide-react";

import { getTagAccent } from "@/lib/tags/accent";

type TagPreviewPillProps = {
  name: string;
  seed: string;
};

export function TagPreviewPill({ name, seed }: TagPreviewPillProps) {
  const accent = getTagAccent(seed);
  const label = name.trim().length > 0 ? name.trim() : "שם התגית";

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1.5 text-sm font-medium text-[var(--color-text)]"
      style={{
        backgroundColor: accent.soft,
        borderColor: accent.solid,
      }}
    >
      <TagIcon
        aria-hidden="true"
        className="size-3.5 shrink-0"
        style={{ color: accent.solid }}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
