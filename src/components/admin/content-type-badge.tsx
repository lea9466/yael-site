import type { LucideIcon } from "lucide-react";

import {
  CONTENT_TYPE_LABELS,
  getContentTypeTheme,
  type ContentType,
} from "@/lib/content-types/system";
import { cn } from "@/lib/utils/cn";

type ContentTypeBadgeProps = {
  type: ContentType;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
};

const sizeClasses: Record<NonNullable<ContentTypeBadgeProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-[0.6875rem]",
  md: "px-3 py-1.5 text-caption",
};

export function ContentTypeBadge({
  type,
  size = "md",
  showIcon = true,
  className,
}: ContentTypeBadgeProps) {
  const theme = getContentTypeTheme(type);
  const Icon: LucideIcon = theme.icon;
  const label = CONTENT_TYPE_LABELS[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border font-medium",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: theme.accentSoft,
        color: theme.text,
        borderColor: theme.border,
        boxShadow: theme.glow,
      }}
    >
      {showIcon ? (
        <span
          aria-hidden="true"
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-white"
          style={{ background: theme.iconBackground }}
        >
          <Icon className="size-2.5" strokeWidth={2.25} />
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}
