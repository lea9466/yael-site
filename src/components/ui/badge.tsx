import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  success:
    "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20",
  warning:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  error:
    "bg-[var(--color-error-soft)] text-[var(--color-error)] border-[var(--color-error)]/20",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/20",
  neutral:
    "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] border-[var(--color-border)]",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] border px-2.5 py-1 text-caption font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
