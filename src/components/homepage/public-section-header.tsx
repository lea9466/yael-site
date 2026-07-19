import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type PublicSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  titleId?: string;
};

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  titleId,
}: PublicSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow ? (
          <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 id={titleId} className="text-section-title">
          {title}
        </h2>
        {description ? (
          <p className="text-muted text-base sm:text-lg">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="public-focus-ring inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--color-primary)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-secondary)]"
        >
          {actionLabel}
          <span aria-hidden="true">←</span>
        </Link>
      ) : null}
    </div>
  );
}
