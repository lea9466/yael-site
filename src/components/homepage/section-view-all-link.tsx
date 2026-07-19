import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SectionViewAllLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function SectionViewAllLink({
  href,
  label,
  className,
}: SectionViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={cn("section-view-all-link public-focus-ring", className)}
    >
      <span>{label}</span>
      <ArrowLeft aria-hidden="true" className="section-view-all-link__icon" />
    </Link>
  );
}
