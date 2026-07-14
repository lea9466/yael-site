"use client";

import { Bell, Menu } from "lucide-react";

import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";

type AdminHeaderProps = {
  fullName: string;
  email: string | null;
  onMenuOpen: () => void;
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    return "מ";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export function AdminHeader({ fullName, email, onMenuOpen }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex min-h-[var(--header-height)] flex-col justify-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              label="פתיחת תפריט ניווט"
              className="lg:hidden"
              onClick={onMenuOpen}
            >
              <Menu aria-hidden="true" className="size-5" />
            </IconButton>
            <Breadcrumbs />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <IconButton
              label="התראות - יתווסף בעתיד"
              disabled
              className="hidden sm:inline-flex"
            >
              <Bell
                aria-hidden="true"
                className="size-5 text-[var(--color-text-muted)]"
              />
            </IconButton>

            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 py-1.5">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-primary)]"
              >
                {getInitials(fullName)}
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                  {fullName}
                </p>
                {email ? (
                  <p
                    className="truncate text-caption text-[var(--color-text-muted)]"
                    dir="ltr"
                  >
                    {email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden max-w-xl md:block">
          <SearchInput
            disabled
            placeholder="חיפוש במערכת (בקרוב)"
            aria-label="חיפוש במערכת - יתווסף בעתיד"
          />
        </div>
      </div>
    </header>
  );
}
