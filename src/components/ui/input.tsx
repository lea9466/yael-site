import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "admin-interactive h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)]",
        "placeholder:text-[var(--color-text-muted)]",
        "hover:border-[var(--color-border-strong)]",
        "focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/15",
        "disabled:cursor-not-allowed disabled:bg-[var(--color-surface-soft)] disabled:opacity-70",
        error &&
          "border-[var(--color-error)] focus-visible:border-[var(--color-error)] focus-visible:ring-[var(--color-error)]/15",
        className
      )}
      {...props}
    />
  );
}
