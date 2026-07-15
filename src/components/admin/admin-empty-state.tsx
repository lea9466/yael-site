import type { LucideIcon } from "lucide-react";

import { AdminOrganicBackdrop } from "@/components/admin/admin-organic-shapes";
import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  module?: AdminModuleId;
  emoji?: string;
  action?: React.ReactNode;
  className?: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  module = "dashboard",
  emoji,
  action,
  className,
}: AdminEmptyStateProps) {
  const theme = getModuleTheme(module);

  return (
    <div
      className={cn(
        "admin-empty-state relative overflow-hidden rounded-[var(--radius-xl)] py-16 text-center",
        className
      )}
    >
      <AdminOrganicBackdrop module={module} />

      <div className="relative flex flex-col items-center gap-6 px-6">
        <div
          className="flex size-24 items-center justify-center rounded-[var(--radius-full)] shadow-[var(--shadow-md)] transition-transform hover:scale-105"
          style={{ background: theme.gradient }}
        >
          <Icon
            aria-hidden="true"
            className="size-10 text-[var(--color-primary)]"
            strokeWidth={1.5}
          />
        </div>

        {emoji ? (
          <span aria-hidden="true" className="text-4xl leading-none">
            {emoji}
          </span>
        ) : null}

        <div className="max-w-md space-y-2">
          <h3 className="text-section-title">{title}</h3>
          <p className="text-muted text-base">{description}</p>
        </div>

        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}

type AdminListItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminListItem({ children, className }: AdminListItemProps) {
  return (
    <article
      className={cn(
        "admin-list-item group -mx-2 rounded-[var(--radius-xl)] px-3 py-6 transition-all duration-200 first:pt-0",
        "hover:bg-gradient-to-l hover:from-[var(--color-light-sage-soft)]/40 hover:to-transparent",
        className
      )}
    >
      {children}
    </article>
  );
}
