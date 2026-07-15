import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import { Card } from "@/components/ui/card";
import type { AdminModuleId } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type QuickActionCardProps = {
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  href?: string;
  module?: AdminModuleId;
};

export function QuickActionCard({
  label,
  description,
  icon,
  enabled,
  href,
  module = "dashboard",
}: QuickActionCardProps) {
  const content = (
    <>
      <AdminIconCircle icon={icon} module={module} size="md" />
      <div className="space-y-1.5">
        <h3 className="text-card-title">{label}</h3>
        <p className="text-muted">{description}</p>
      </div>
      {!enabled ? (
        <span className="text-caption text-[var(--color-text-muted)]">
          יהיה זמין בהמשך ✨
        </span>
      ) : null}
    </>
  );

  if (enabled && href) {
    return (
      <Card hoverable accentModule={module} className="flex h-full flex-col gap-4">
        <Link href={href} className="flex h-full flex-col gap-4">
          {content}
        </Link>
      </Card>
    );
  }

  return (
    <Card
      hoverable={enabled}
      accentModule={module}
      className={cn("flex h-full flex-col gap-4", !enabled && "opacity-60")}
    >
      <div
        aria-disabled={!enabled}
        className={cn(
          "flex h-full flex-col gap-4",
          enabled ? "cursor-pointer" : "cursor-not-allowed"
        )}
      >
        {content}
      </div>
    </Card>
  );
}
