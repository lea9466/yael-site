import type { LucideIcon } from "lucide-react";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import type { AdminModuleId } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminFormSectionProps = {
  id?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  emoji?: string;
  module?: AdminModuleId;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormSection({
  id,
  title,
  description,
  icon,
  emoji,
  module,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <section id={id} className={cn("admin-form-section space-y-8", className)}>
      {icon ? (
        <AdminSectionHeader
          icon={icon}
          title={title}
          description={description}
          module={module}
          emoji={emoji}
        />
      ) : (
        <div className="space-y-2 text-right">
          <h2 className="text-section-title">{title}</h2>
          {description ? (
            <p className="text-muted max-w-2xl">{description}</p>
          ) : null}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function AdminFormDivider() {
  return (
    <hr
      aria-hidden="true"
      className="admin-form-divider border-0 border-t border-[var(--color-border)]/50"
    />
  );
}

export function AdminFormBody({ children }: { children: React.ReactNode }) {
  return <div className="admin-form-body space-y-0">{children}</div>;
}
