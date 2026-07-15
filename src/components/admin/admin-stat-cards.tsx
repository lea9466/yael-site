import type { LucideIcon } from "lucide-react";

import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

export type AdminStatItem = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  module?: AdminModuleId;
  emoji?: string;
};

type AdminStatCardsProps = {
  stats: AdminStatItem[];
  className?: string;
};

export function AdminStatCards({ stats, className }: AdminStatCardsProps) {
  return (
    <div
      className={cn(
        "admin-stat-cards grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => {
        const theme = stat.module ? getModuleTheme(stat.module) : getModuleTheme("dashboard");
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="admin-stat-card admin-interactive group relative overflow-hidden rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            style={{ background: theme.gradient }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 opacity-80"
              style={{ background: theme.iconGradient }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-caption font-medium text-[var(--color-text-muted)]">
                  {stat.emoji ? (
                    <span aria-hidden="true" className="me-1.5">
                      {stat.emoji}
                    </span>
                  ) : null}
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-[var(--color-primary)]">
                  {stat.value}
                </p>
              </div>
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-white shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105"
                style={{ background: theme.iconGradient }}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
