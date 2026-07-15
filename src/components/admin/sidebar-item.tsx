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
    "flex items-center rounded-[var(--radius-md)] text-sm transition-colors",
    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
    enabled
      ? active
        ? "bg-[var(--color-accent)] font-medium text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
        : "text-[var(--color-text-on-primary)]/90 hover:bg-[var(--color-secondary)]/70"
      : "cursor-not-allowed text-[var(--color-text-on-primary)]/55"
  );

  const content = (
    <>
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
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
