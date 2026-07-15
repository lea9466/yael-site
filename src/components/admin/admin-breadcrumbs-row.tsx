"use client";

import { AdminMobileMenuButton } from "@/components/admin/admin-mobile-menu-button";

type AdminBreadcrumbsRowProps = {
  children: React.ReactNode;
};

export function AdminBreadcrumbsRow({ children }: AdminBreadcrumbsRowProps) {
  return (
    <div className="flex items-center gap-3">
      <AdminMobileMenuButton />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
