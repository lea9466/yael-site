import { cn } from "@/lib/utils/cn";

type AdminFormSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormSection({
  id,
  title,
  description,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <section id={id} className={cn("admin-form-section space-y-5", className)}>
      <div className="space-y-1 text-right">
        <h2 className="text-section-title">{title}</h2>
        {description ? (
          <p className="text-caption text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AdminFormDivider() {
  return <hr className="admin-form-divider border-0 border-t border-[var(--color-border)]/70" />;
}

export function AdminFormBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-form-body space-y-12 rounded-[var(--radius-lg)] bg-[var(--color-form-surface)] py-8">
      {children}
    </div>
  );
}
