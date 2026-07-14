import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type StatusCardProps = {
  title: string;
  value: string;
  description: string;
  ok: boolean;
  icon: LucideIcon;
};

export function StatusCard({
  title,
  value,
  description,
  ok,
  icon: Icon,
}: StatusCardProps) {
  return (
    <Card hoverable className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-2.5 text-[var(--color-primary)]">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <Badge variant={ok ? "success" : "error"}>
          {ok ? "תקין" : "דורש בדיקה"}
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="text-card-title">{title}</h3>
        <p className="text-lg font-semibold text-[var(--color-primary)]">{value}</p>
        <p className="text-muted">{description}</p>
      </div>
    </Card>
  );
}
