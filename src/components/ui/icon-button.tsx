import { cn } from "@/lib/utils/cn";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "size-9",
  md: "size-11",
};

export function IconButton({
  label,
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "admin-interactive inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)]",
        "hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-95",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
