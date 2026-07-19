import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Container } from "@/components/public/layout/container";
import { PUBLIC_CTA } from "@/constants/public-navigation";

export default function PublicNotFound() {
  return (
    <Container className="flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-light-sage-soft)] text-[var(--color-primary)]">
        <FileQuestion aria-hidden="true" className="size-7" strokeWidth={1.5} />
      </div>
      <h1 className="text-page-title mb-3">הדף לא נמצא</h1>
      <p className="text-muted mb-8 max-w-md">
        נראה שהגעתם לכתובת שאינה קיימת. אפשר לחזור לדף הבית או ליצור קשר.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="public-focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-5 text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)]"
        >
          חזרה לדף הבית
        </Link>
        <Link
          href={PUBLIC_CTA.href}
          className="public-focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-primary)]"
        >
          {PUBLIC_CTA.label}
        </Link>
      </div>
    </Container>
  );
}
