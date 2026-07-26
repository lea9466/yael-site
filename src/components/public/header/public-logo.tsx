import Image from "next/image";
import Link from "next/link";

import type { WebsiteSettingsPublic } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type PublicLogoProps = {
  settings: WebsiteSettingsPublic;
  className?: string;
  priority?: boolean;
};

export function PublicLogo({
  settings,
  className,
  priority = false,
}: PublicLogoProps) {
  const businessName = settings.businessProfile.business_name;
  const logo = settings.logo;

  return (
    <Link
      href="/"
      aria-label={`${businessName} — דף הבית`}
      className={cn(
        "public-focus-ring inline-flex items-center gap-3 rounded-[var(--radius-md)]",
        className
      )}
    >
      {logo?.url ? (
        <span className="relative block h-14 w-auto min-w-[3.5rem] sm:h-16">
          <Image
            src={logo.url}
            alt={logo.alt || businessName}
            width={240}
            height={64}
            priority={priority}
            className="h-full w-auto object-contain object-right"
          />
        </span>
      ) : (
        <span className="flex flex-col text-right leading-tight">
          <span className="text-lg font-semibold text-[var(--color-primary)] sm:text-xl">
            {businessName}
          </span>
          {settings.businessProfile.tagline ? (
            <span className="text-caption text-[var(--color-text-muted)]">
              {settings.businessProfile.tagline}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
