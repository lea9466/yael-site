import type { LucideIcon } from "lucide-react";

import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import type { AdminModuleId } from "@/lib/admin/module-themes";

type StatusCardProps = {
  title: string;
  value: string;
  description: string;
  ok: boolean;
  icon: LucideIcon;
  module?: AdminModuleId;
};

export function StatusCard({
  title,
  value,
  description,
  ok,
  icon,
  module = "dashboard",
}: StatusCardProps) {
  return (
    <Card hoverable accentModule={module} className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <AdminIconCircle icon={icon} module={module} size="md" />
        {ok ? (
          <StatusBadge status="handled" label="תקין" />
        ) : (
          <StatusBadge status="pending" label="דורש בדיקה" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-card-title">{title}</h3>
        <p className="text-xl font-semibold tracking-tight text-[var(--color-primary)]">
          {value}
        </p>
        <p className="text-muted">{description}</p>
      </div>
    </Card>
  );
}
