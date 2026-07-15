import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  elevated?: boolean;
  accentModule?: AdminModuleId;
};

export function Card({
  children,
  className,
  hoverable = false,
  elevated = false,
  accentModule,
}: CardProps) {
  const accent = accentModule ? getModuleTheme(accentModule) : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-[var(--spacing-lg)]",
        elevated
          ? "border border-[var(--color-border)]/60 shadow-[var(--shadow-sm)]"
          : "border border-[var(--color-border)]/70",
        hoverable && "surface-card-hover",
        className
      )}
    >
      {accent ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: accent.iconGradient }}
        />
      ) : null}
      {children}
    </div>
  );
}
