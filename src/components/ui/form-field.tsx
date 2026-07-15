import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-[var(--radius-md)]",
        error &&
          "rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-soft)]/35 p-3",
        className
      )}
    >
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? <span className="text-[var(--color-error)]"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="text-caption text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-caption font-medium text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
