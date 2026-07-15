import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type QuickActionCardProps = {
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  href?: string;
};

export function QuickActionCard({
  label,
  description,
  icon: Icon,
  enabled,
  href,
}: QuickActionCardProps) {
  const content = (
    <>
      <div className="w-fit rounded-[var(--radius-md)] bg-[var(--color-accent)]/35 p-2.5 text-[var(--color-primary)]">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-card-title">{label}</h3>
        <p className="text-muted">{description}</p>
      </div>
      {!enabled ? (
        <span className="text-caption text-[var(--color-text-muted)]">
          יהיה זמין בהמשך
        </span>
      ) : null}
    </>
  );

  if (enabled && href) {
    return (
      <Card hoverable className="flex h-full flex-col gap-3">
        <Link href={href} className="flex h-full flex-col gap-3">
          {content}
        </Link>
      </Card>
    );
  }

  return (
    <Card
      hoverable={enabled}
      className={cn("flex h-full flex-col gap-3", !enabled && "opacity-70")}
    >
      <div
        aria-disabled={!enabled}
        className={cn(
          "flex h-full flex-col gap-3",
          enabled ? "cursor-pointer" : "cursor-not-allowed"
        )}
      >
        {content}
      </div>
    </Card>
  );
}
