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
    "bg-[image:var(--gradient-warm)] text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-md)] hover:brightness-[1.03] focus-visible:ring-[var(--color-primary)]/25 active:scale-[0.98]",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-cream)]/50 text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)] focus-visible:ring-[var(--color-primary)]/20 active:scale-[0.98]",
  outline:
    "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)] focus-visible:ring-[var(--color-primary)]/20 active:scale-[0.98]",
  danger:
    "bg-[var(--color-soft-accent)] text-[var(--color-text-on-primary)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] focus-visible:ring-[var(--color-soft-accent)]/30 active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)] focus-visible:ring-[var(--color-primary)]/15 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
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
        "admin-interactive inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none",
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
