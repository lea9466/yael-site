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
        "inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-primary)] transition-colors",
        "hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
