import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-secondary)] focus-visible:ring-[var(--color-primary)]/30",
  secondary:
    "bg-[var(--color-accent)] text-[var(--color-primary)] hover:opacity-90 focus-visible:ring-[var(--color-accent)]/40",
  outline:
    "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-primary)]/20",
  danger:
    "bg-[var(--color-soft-accent)] text-[var(--color-text-on-primary)] hover:opacity-90 focus-visible:ring-[var(--color-soft-accent)]/30",
  ghost:
    "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-primary)]/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}
