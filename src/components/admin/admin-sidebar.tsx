"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { SidebarItem } from "@/components/admin/sidebar-item";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ADMIN_NAV_SECTIONS } from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

type AdminSidebarProps = {
  currentPath: string;
  fullName: string;
  email: string | null;
  isMobileOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
  email,
  isMobileOpen,
  collapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const router = useRouter();
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
      const result = await logoutAction();

      if (result.success) {
        router.replace("/login");
        router.refresh();
      }
    });
  };

  const showCollapsed = collapsed && isDesktop;

  return (
    <aside
      ref={drawerRef}
      aria-label="תפריט צד"
      aria-hidden={!isDesktop && !isMobileOpen}
      className={cn(
        "admin-sidebar flex h-dvh w-[var(--sidebar-width)] shrink-0 flex-col overflow-hidden border-e border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]",
        "max-lg:fixed max-lg:top-0 max-lg:z-50 max-lg:inset-inline-start-0 max-lg:shadow-[var(--shadow-lg)] max-lg:transition-transform max-lg:duration-300",
        isMobileOpen
          ? "max-lg:translate-x-0"
          : "max-lg:pointer-events-none max-lg:translate-x-full",
        "lg:fixed lg:top-0 lg:z-30 lg:inset-inline-start-0 lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-[var(--color-border)]/70 py-6",
          showCollapsed ? "px-3" : "px-6"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            showCollapsed ? "flex-col" : "justify-between"
          )}
        >
          <div className={cn("min-w-0", showCollapsed && "text-center")}>
            <p
              className={cn(
                "font-semibold text-[var(--color-primary)]",
                showCollapsed ? "text-sm" : "text-lg tracking-tight"
              )}
            >
              {showCollapsed ? "יעל" : "יעל קנייבסקי"}
            </p>
            {!showCollapsed ? (
              <p className="text-caption text-[var(--color-text-muted)]">
                מערכת ניהול
              </p>
            ) : null}
          </div>

          <IconButton
            label={showCollapsed ? "הרחבת תפריט" : "כיווץ תפריט"}
            size="sm"
            className="hidden lg:inline-flex"
            onClick={onToggleCollapse}
          >
            {showCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </IconButton>
        </div>
      </div>

      <nav
        aria-label="ניווט מערכת הניהול"
        className="sidebar-nav px-3 py-5"
      >
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            {!showCollapsed ? (
              <p className="mb-2.5 px-3 text-caption font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                {section.title}
              </p>
            ) : null}
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
                      collapsed={showCollapsed}
                      onNavigate={onClose}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-[var(--color-border)]/70 py-5",
          showCollapsed ? "px-3" : "px-6"
        )}
      >
        <div
          className={cn(
            "mb-4 flex items-center gap-3",
            showCollapsed && "justify-center"
          )}
        >
          <span
            aria-hidden="true"
            title={showCollapsed ? fullName : undefined}
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)]/30 text-sm font-semibold text-[var(--color-primary)]"
          >
            {getInitials(fullName)}
          </span>
          {!showCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{fullName}</p>
              {email ? (
                <p className="truncate text-caption text-[var(--color-text-muted)]" dir="ltr">
                  {email}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {showCollapsed ? (
          <IconButton
            label="התנתקות"
            size="sm"
            className="mx-auto w-full"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="size-4" />
          </IconButton>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            loadingText="מתנתק..."
            onClick={handleLogout}
            className="w-full justify-start text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <LogOut aria-hidden="true" className="size-4" />
            התנתקות
          </Button>
        )}
      </div>
    </aside>
  );
}
