"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import {
  buildAdminBreadcrumbs,
  type AdminBreadcrumbItem,
} from "@/lib/admin/breadcrumbs";
import { cn } from "@/lib/utils/cn";

export type { AdminBreadcrumbItem };
export { buildAdminBreadcrumbs };

type AdminBreadcrumbNavProps = {
  items: AdminBreadcrumbItem[];
  className?: string;
};

export function AdminBreadcrumbNav({ items, className }: AdminBreadcrumbNavProps) {
  return (
    <nav
      aria-label="מיקום במערכת"
      className={cn("text-caption text-[var(--color-text-muted)]", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <ChevronLeft
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-[var(--color-text-muted)]"
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "font-medium text-[var(--color-primary)]")}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = buildAdminBreadcrumbs(pathname);

  return <AdminBreadcrumbNav items={items} />;
}
