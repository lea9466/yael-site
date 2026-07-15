import { StatusBadge } from "@/components/ui/status-badge";
import {
  getContentAdminStatus,
  getContentStatusLabel,
} from "@/lib/admin/status-system";
import type { ContentStatus } from "@/types/content";

type AdminStatusBadgeProps = {
  status: ContentStatus;
  className?: string;
  size?: "sm" | "md";
};

export function AdminStatusBadge({
  status,
  className,
  size = "md",
}: AdminStatusBadgeProps) {
  return (
    <StatusBadge
      status={getContentAdminStatus(status)}
      label={getContentStatusLabel(status)}
      size={size}
      className={className}
    />
  );
}

export function AdminFeaturedBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <StatusBadge status="featured" size={size} className={className} />
  );
}

export function AdminNewBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return <StatusBadge status="new" size={size} className={className} />;
}

export function AdminHiddenBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return <StatusBadge status="hidden" size={size} className={className} />;
}

export function AdminPublicBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return <StatusBadge status="public" size={size} className={className} />;
}

export function AdminPrivateBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return <StatusBadge status="private" size={size} className={className} />;
}
