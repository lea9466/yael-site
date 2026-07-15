import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SidebarItemProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarItem({
  label,
  href,
  icon: Icon,
  enabled,
  active,
  collapsed = false,
  onNavigate,
}: SidebarItemProps) {
  const itemClasses = cn(
    "admin-interactive flex items-center rounded-[var(--radius-md)] text-sm",
    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
    enabled
      ? active
        ? "bg-gradient-to-l from-[var(--color-fresh-green-soft)] to-[var(--color-light-sage-soft)] font-medium text-[var(--color-primary)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-fresh-green)]/15"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-primary)]"
      : "cursor-not-allowed text-[var(--color-text-muted)]/50"
  );

  const content = (
    <>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-[18px] shrink-0",
          active && enabled && "text-[var(--color-primary)]"
        )}
      />
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </>
  );

  if (!enabled) {
    return (
      <span
        aria-disabled="true"
        title={collapsed ? label : undefined}
        className={itemClasses}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={itemClasses}
    >
      {content}
    </Link>
  );
}
