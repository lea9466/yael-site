import { StatusBadge } from "@/components/ui/status-badge";
import {
  getContactMessageStatusBadgeKey,
  getContactMessageStatusLabel,
} from "@/lib/contact-messages/status";
import type { ContactMessageStatus } from "@/lib/contact-messages/constants";

type ContactMessageStatusBadgeProps = {
  status: ContactMessageStatus;
  className?: string;
  size?: "sm" | "md";
};

export function ContactMessageStatusBadge({
  status,
  className,
  size = "md",
}: ContactMessageStatusBadgeProps) {
  return (
    <StatusBadge
      status={getContactMessageStatusBadgeKey(status)}
      label={getContactMessageStatusLabel(status)}
      size={size}
      className={className}
    />
  );
}
