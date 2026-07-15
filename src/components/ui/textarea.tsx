import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "admin-interactive min-h-28 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm leading-[var(--line-height-relaxed)] text-[var(--color-text)]",
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
