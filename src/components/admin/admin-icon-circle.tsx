import type { LucideIcon } from "lucide-react";

import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminIconCircleProps = {
  icon: LucideIcon;
  module?: AdminModuleId;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-11 [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-6",
  xl: "size-20 [&_svg]:size-9",
};

export function AdminIconCircle({
  icon: Icon,
  module,
  size = "md",
  className,
}: AdminIconCircleProps) {
  const theme = module ? getModuleTheme(module) : null;

  return (
    <div
      className={cn(
        "admin-icon-circle flex shrink-0 items-center justify-center rounded-[var(--radius-full)] text-white shadow-[var(--shadow-sm)]",
        sizeClasses[size],
        className
      )}
      style={{
        background: theme?.iconGradient ?? "var(--gradient-primary)",
      }}
    >
      <Icon aria-hidden="true" strokeWidth={1.75} />
    </div>
  );
}
