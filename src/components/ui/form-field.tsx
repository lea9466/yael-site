import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  errorId,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-text)]">
        {label}
        {required ? <span className="text-[var(--color-soft-accent)]"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="text-caption text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-caption font-medium text-[var(--color-error)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
