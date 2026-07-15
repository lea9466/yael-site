import type { LucideIcon } from "lucide-react";

import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import type { AdminModuleId } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminSectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  module?: AdminModuleId;
  emoji?: string;
  className?: string;
};

export function AdminSectionHeader({
  icon,
  title,
  description,
  module,
  emoji,
  className,
}: AdminSectionHeaderProps) {
  return (
    <div className={cn("admin-section-header flex items-start gap-4 text-right", className)}>
      <AdminIconCircle icon={icon} module={module} size="md" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2 className="text-section-title flex items-center gap-2">
          {emoji ? (
            <span aria-hidden="true" className="text-xl leading-none">
              {emoji}
            </span>
          ) : null}
          <span>{title}</span>
        </h2>
        {description ? (
          <p className="text-muted max-w-2xl">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
