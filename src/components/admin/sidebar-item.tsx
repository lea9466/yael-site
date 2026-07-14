import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SidebarItemProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  active: boolean;
  onNavigate?: () => void;
};

export function SidebarItem({
  label,
  href,
  icon: Icon,
  enabled,
  active,
  onNavigate,
}: SidebarItemProps) {
  const itemClasses = cn(
    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors",
    enabled
      ? active
        ? "bg-[var(--color-accent)] font-medium text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
        : "text-[var(--color-text-on-primary)]/90 hover:bg-[var(--color-secondary)]/70"
      : "cursor-not-allowed text-[var(--color-text-on-primary)]/55"
  );

  const content = (
    <>
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );

  if (!enabled) {
    return (
      <span aria-disabled="true" className={itemClasses}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={itemClasses}
    >
      {content}
    </Link>
  );
}
