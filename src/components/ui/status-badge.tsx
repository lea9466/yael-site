"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock3,
  EyeOff,
  FilePenLine,
  Globe2,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";

import {
  ADMIN_STATUS_LABELS,
  type AdminStatusKey,
  type StatusBadgeVariant,
} from "@/lib/admin/status-system";
import { cn } from "@/lib/utils/cn";

export type { AdminStatusKey, StatusBadgeVariant };

type StatusBadgeSize = "sm" | "md";

type StatusBadgeProps = {
  status: AdminStatusKey;
  children?: React.ReactNode;
  label?: string;
  icon?: LucideIcon;
  size?: StatusBadgeSize;
  showIcon?: boolean;
  iconClassName?: string;
  className?: string;
};

const STATUS_ICONS: Record<AdminStatusKey, LucideIcon> = {
  draft: FilePenLine,
  published: CircleCheck,
  archived: Archive,
  featured: Star,
  new: Sparkles,
  active: Activity,
  hidden: EyeOff,
  public: Globe2,
  private: Lock,
  pending: Clock3,
  handled: CheckCheck,
  error: CircleX,
};

export function StatusBadge({
  status,
  children,
  label,
  icon,
  size = "md",
  showIcon = true,
  iconClassName,
  className,
}: StatusBadgeProps) {
  const Icon = icon ?? STATUS_ICONS[status];
  const text = children ?? label ?? ADMIN_STATUS_LABELS[status];

  return (
    <span
      data-variant={status}
      data-size={size}
      className={cn("status-badge", className)}
    >
      {showIcon ? (
        <Icon
          aria-hidden="true"
          className={cn("status-badge-icon", iconClassName)}
          strokeWidth={2.25}
        />
      ) : null}
      <span className="status-badge-label">{text}</span>
    </span>
  );
}
