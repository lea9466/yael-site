"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  StatusBadge,
  type AdminStatusKey,
} from "@/components/ui/status-badge";
import { ADMIN_STATUS_KEYS } from "@/lib/admin/status-system";

type NeutralBadgeVariant = "info" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: NeutralBadgeVariant | AdminStatusKey;
  icon?: LucideIcon;
  className?: string;
};

const neutralVariantClasses: Record<NeutralBadgeVariant, string> = {
  info: "bg-[var(--color-sky-blue-soft)] text-[var(--color-sky-blue)] ring-1 ring-[var(--color-sky-blue)]/25",
  neutral:
    "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]",
};

const adminStatusKeys = new Set<string>(ADMIN_STATUS_KEYS);

export function Badge({
  children,
  variant = "neutral",
  icon: Icon,
  className,
}: BadgeProps) {
  if (adminStatusKeys.has(variant)) {
    return (
      <StatusBadge
        status={variant as AdminStatusKey}
        icon={Icon}
        className={className}
      >
        {children}
      </StatusBadge>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-3 py-1.5 text-caption font-medium",
        neutralVariantClasses[variant as NeutralBadgeVariant],
        className
      )}
    >
      {Icon ? (
        <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      ) : null}
      {children}
    </span>
  );
}
