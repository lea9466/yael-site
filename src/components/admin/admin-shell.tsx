"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminInactivityGuard } from "@/components/admin/admin-inactivity-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useSidebarCollapse } from "@/lib/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils/cn";

type AdminShellProps = {
  fullName: string;
  email: string | null;
  children: React.ReactNode;
};

export function AdminShell({ fullName, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { collapsed, toggle } = useSidebarCollapse();

  const handleClose = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  return (
    <div className="admin-layout-root flex min-h-dvh w-full max-w-full overflow-x-hidden bg-[var(--color-background)] lg:flex-row">
      <AdminInactivityGuard />

      <button
        type="button"
        aria-label="סגור תפריט ניווט"
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-40 bg-[var(--color-text)]/20 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <AdminSidebar
        currentPath={pathname}
        fullName={fullName}
        isMobileOpen={isMobileOpen}
        collapsed={collapsed}
        onToggleCollapse={toggle}
        onClose={handleClose}
      />

      <div className="admin-main-column flex min-w-0 flex-1 flex-col">
        <AdminHeader
          fullName={fullName}
          email={email}
          onMenuOpen={handleOpen}
        />
        <main className="admin-content-area min-w-0 flex-1 px-5 py-8 sm:px-10 sm:py-12 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
