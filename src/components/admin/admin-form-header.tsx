import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type AdminFormBreadcrumb = {
  label: string;
  href?: string;
};

type AdminFormHeaderProps = {
  breadcrumbs: AdminFormBreadcrumb[];
  title: string;
  description?: string;
  meta?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  className?: string;
};

export function AdminFormHeader({
  breadcrumbs,
  title,
  description,
  meta,
  secondaryActions,
  className,
}: AdminFormHeaderProps) {
  return (
    <header className={cn("admin-form-header space-y-4 pb-6", className)}>
      <nav
        aria-label="ניווט"
        className="text-caption text-[var(--color-text-muted)]"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <span key={`${crumb.label}-${index}`}>
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="admin-interactive hover:text-[var(--color-primary)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "text-[var(--color-text)]" : undefined}>
                  {crumb.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true"> / </span> : null}
            </span>
          );
        })}
      </nav>

      <div className="space-y-3 text-right">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title">{title}</h1>
          {meta}
        </div>
        {description ? (
          <p className="text-muted max-w-2xl">{description}</p>
        ) : null}
        {secondaryActions ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {secondaryActions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
