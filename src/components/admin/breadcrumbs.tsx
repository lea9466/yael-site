"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ADMIN_ROUTE_LABELS } from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

function resolvePathLabel(path: string): string {
  if (ADMIN_ROUTE_LABELS[path]) {
    return ADMIN_ROUTE_LABELS[path];
  }

  if (/^\/admin\/services\/[^/]+\/preview$/.test(path)) {
    return "תצוגה מקדימה";
  }

  if (/^\/admin\/services\/[^/]+$/.test(path)) {
    return "עריכת שירות";
  }

  if (/^\/admin\/recipes\/[^/]+\/preview$/.test(path)) {
    return "תצוגה מקדימה";
  }

  if (/^\/admin\/recipes\/[^/]+$/.test(path)) {
    return "עריכת מתכון";
  }

  if (/^\/admin\/categories\/[^/]+$/.test(path)) {
    return "עריכת קטגוריה";
  }

  return "מערכת ניהול";
}

export function buildAdminBreadcrumbs(pathname: string): AdminBreadcrumbItem[] {
  if (pathname === "/admin") {
    return [{ label: "לוח בקרה" }];
  }

  const items: AdminBreadcrumbItem[] = [
    { label: "מערכת ניהול", href: "/admin" },
  ];

  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  let currentPath = "/admin";

  for (let index = 0; index < segments.length; index += 1) {
    currentPath += `/${segments[index]}`;
    const isLast = index === segments.length - 1;
    const label = resolvePathLabel(currentPath);

    if (isLast) {
      items.push({ label });
    } else {
      items.push({ label, href: currentPath });
    }
  }

  return items;
}

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
