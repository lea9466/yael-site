import Link from "next/link";

import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import { AdminOrganicBackdrop } from "@/components/admin/admin-organic-shapes";
import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  module?: AdminModuleId;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  module,
  action,
  children,
  className,
}: AdminPageHeaderProps) {
  const theme = module ? getModuleTheme(module) : null;

  return (
    <header
      className={cn(
        "admin-page-header relative overflow-hidden rounded-[var(--radius-xl)] px-1 py-2",
        className
      )}
    >
      {module ? <AdminOrganicBackdrop module={module} /> : null}

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {module && theme ? (
            <AdminIconCircle icon={theme.icon} module={module} size="lg" />
          ) : null}
          <div className="min-w-0 space-y-2 text-right">
            <h1 className="text-page-title flex items-center gap-2.5">
              {theme ? (
                <span aria-hidden="true" className="text-2xl leading-none">
                  {theme.emoji}
                </span>
              ) : null}
              <span>{title}</span>
            </h1>
            {description ? (
              <p className="text-muted max-w-2xl">{description}</p>
            ) : null}
          </div>
        </div>

        {action ? (
          <Link
            href={action.href}
            className="admin-btn-primary inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium"
          >
            {action.icon}
            {action.label}
          </Link>
        ) : null}
      </div>
      {children ? <div className="relative mt-6">{children}</div> : null}
    </header>
  );
}
