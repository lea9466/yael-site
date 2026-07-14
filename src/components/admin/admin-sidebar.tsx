"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { SidebarItem } from "@/components/admin/sidebar-item";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_SECTIONS } from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

type AdminSidebarProps = {
  currentPath: string;
  fullName: string;
  isMobileOpen: boolean;
  onClose: () => void;
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

export function AdminSidebar({
  currentPath,
  fullName,
  isMobileOpen,
  onClose,
}: AdminSidebarProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const drawer = drawerRef.current;

    if (!drawer) {
      return;
    }

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, onClose]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <aside
      ref={drawerRef}
      aria-label="תפריט צד"
      aria-hidden={!isDesktop && !isMobileOpen}
      className={cn(
        "flex h-dvh w-[var(--sidebar-width)] shrink-0 flex-col overflow-hidden bg-[var(--color-primary)] text-[var(--color-text-on-primary)]",
        "max-lg:fixed max-lg:top-0 max-lg:z-50 max-lg:inset-inline-start-0 max-lg:shadow-[var(--shadow-lg)] max-lg:transition-transform",
        isMobileOpen
          ? "max-lg:translate-x-0"
          : "max-lg:pointer-events-none max-lg:translate-x-full",
        "lg:fixed lg:top-0 lg:z-30 lg:inset-inline-start-0 lg:translate-x-0 lg:shadow-none"
      )}
    >
      <div className="shrink-0 border-b border-[var(--color-text-on-primary)]/10 px-[var(--spacing-lg)] py-[var(--spacing-lg)]">
        <p className="text-lg font-semibold">יעל כנייבסקי</p>
        <p className="text-sm text-[var(--color-text-on-primary)]/75">מערכת ניהול</p>
      </div>

      <nav
        aria-label="ניווט מערכת הניהול"
        className="sidebar-nav px-3 py-4"
      >
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5 last:mb-0">
            <p className="mb-2 px-3 text-caption font-medium text-[var(--color-text-on-primary)]/60">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? currentPath === "/admin"
                    : currentPath.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <SidebarItem
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      enabled={item.enabled}
                      active={isActive}
                      onNavigate={onClose}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--color-text-on-primary)]/10 px-[var(--spacing-lg)] py-[var(--spacing-md)]">
        <div className="mb-3 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-primary)]"
          >
            {getInitials(fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="text-caption text-[var(--color-text-on-primary)]/70">
              מנהלת מערכת
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          loading={isPending}
          loadingText="מתנתק..."
          onClick={handleLogout}
          className="w-full border-[var(--color-text-on-primary)]/20 bg-transparent text-[var(--color-text-on-primary)] hover:bg-[var(--color-secondary)]/60 hover:text-[var(--color-text-on-primary)]"
        >
          <LogOut aria-hidden="true" className="size-4" />
          התנתקות
        </Button>
      </div>
    </aside>
  );
}
