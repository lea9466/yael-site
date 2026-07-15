import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: boolean;
};

export function Select({
  label,
  className,
  id,
  error,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? label.replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="block text-caption font-medium text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          "admin-interactive h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)]",
          "hover:border-[var(--color-border-strong)]",
          "focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/15",
          "disabled:cursor-not-allowed disabled:bg-[var(--color-surface-soft)] disabled:opacity-70",
          error &&
            "border-[var(--color-error)] focus-visible:border-[var(--color-error)] focus-visible:ring-[var(--color-error)]/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
