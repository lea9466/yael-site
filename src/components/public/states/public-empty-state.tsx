import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

type PublicEmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function PublicEmptyState({
  title,
  description,
  icon,
  action,
  className,
}: PublicEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
      action={action}
      className={cn("py-16", className)}
    />
  );
}
