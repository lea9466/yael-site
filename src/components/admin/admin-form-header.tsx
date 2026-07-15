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
  actions?: React.ReactNode;
  className?: string;
};

export function AdminFormHeader({
  breadcrumbs,
  title,
  description,
  meta,
  actions,
  className,
}: AdminFormHeaderProps) {
  return (
    <header className={cn("admin-form-header space-y-4", className)}>
      <nav
        aria-label="ניווט"
        className="text-sm text-[var(--color-text-muted)]"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <span key={`${crumb.label}-${index}`}>
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-[var(--color-text)]"
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2 text-right">
          <h1 className="text-page-title">{title}</h1>
          {description ? <p className="text-muted">{description}</p> : null}
          {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
