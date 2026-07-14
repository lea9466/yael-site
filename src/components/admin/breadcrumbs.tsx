"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ADMIN_ROUTE_LABELS } from "@/constants/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const currentLabel = ADMIN_ROUTE_LABELS[pathname] ?? "מערכת ניהול";

  return (
    <nav aria-label="מיקום במערכת" className="text-sm">
      <ol className="flex items-center gap-2 text-[var(--color-text-muted)]">
        {pathname === "/admin" ? (
          <li aria-current="page" className="font-medium text-[var(--color-primary)]">
            לוח בקרה
          </li>
        ) : (
          <>
            <li>
              <Link
                href="/admin"
                className="rounded-sm transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
              >
                מערכת ניהול
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronLeft className="size-4 text-[var(--color-text-muted)]" />
            </li>
            <li aria-current="page" className="font-medium text-[var(--color-primary)]">
              {currentLabel}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
