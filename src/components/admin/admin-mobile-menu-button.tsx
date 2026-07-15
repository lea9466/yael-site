"use client";

import { Menu } from "lucide-react";

import { useAdminShell } from "@/components/admin/admin-shell-context";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils/cn";

type AdminMobileMenuButtonProps = {
  className?: string;
};

export function AdminMobileMenuButton({ className }: AdminMobileMenuButtonProps) {
  const { openMobileMenu } = useAdminShell();

  return (
    <IconButton
      label="פתיחת תפריט ניווט"
      className={cn("shrink-0 lg:hidden", className)}
      onClick={openMobileMenu}
    >
      <Menu aria-hidden="true" className="size-5" />
    </IconButton>
  );
}
