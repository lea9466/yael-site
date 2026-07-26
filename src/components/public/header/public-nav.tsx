"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicNavLink } from "@/constants/public-navigation";
import { cn } from "@/lib/utils/cn";

type PublicNavProps = {
  links: PublicNavLink[];
  className?: string;
  onNavigate?: () => void;
};

export function PublicNav({ links, className, onNavigate }: PublicNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="ניווט ראשי" className={className}>
      <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "public-focus-ring block rounded-[var(--radius-md)] px-2.5 py-1.5 text-base font-medium transition-colors duration-[var(--transition-fast)] lg:px-2 lg:py-1",
                  isActive
                    ? "bg-[var(--color-light-sage-soft)] text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)]"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
