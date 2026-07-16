import { AdminBreadcrumbNav } from "@/components/admin/breadcrumbs";
import type { AdminBreadcrumbItem } from "@/lib/admin/breadcrumbs";
import { AdminBreadcrumbsRow } from "@/components/admin/admin-breadcrumbs-row";
import { cn } from "@/lib/utils/cn";

type AdminFormHeaderProps = {
  breadcrumbs: AdminBreadcrumbItem[];
  title: string;
  description?: string;
  meta?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  className?: string;
};

function withRootBreadcrumb(items: AdminBreadcrumbItem[]): AdminBreadcrumbItem[] {
  if (items[0]?.label === "מערכת ניהול") {
    return items;
  }

  return [{ label: "מערכת ניהול", href: "/admin" }, ...items];
}

export function AdminFormHeader({
  breadcrumbs,
  title,
  description,
  meta,
  secondaryActions,
  className,
}: AdminFormHeaderProps) {
  const items = withRootBreadcrumb(breadcrumbs);

  return (
    <header className={cn("admin-form-header", className)}>
      <AdminBreadcrumbsRow>
        <AdminBreadcrumbNav items={items} />
      </AdminBreadcrumbsRow>

      <div className="admin-page-title-block text-right">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title">{title}</h1>
          {meta}
        </div>
        {description ? (
          <p className="text-muted max-w-2xl">{description}</p>
        ) : null}
        {secondaryActions ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {secondaryActions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
