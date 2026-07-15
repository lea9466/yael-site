import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="flex size-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
        </div>
      ) : null}
      <div className="max-w-md space-y-2">
        <h3 className="text-section-title">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
