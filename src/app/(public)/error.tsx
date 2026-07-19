"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Container } from "@/components/public/layout/container";
import { Button } from "@/components/ui/button";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-error-soft)] text-[var(--color-error)]">
        <AlertTriangle aria-hidden="true" className="size-7" strokeWidth={1.5} />
      </div>
      <h1 className="text-page-title mb-3">משהו השתבש</h1>
      <p className="text-muted mb-8 max-w-md">
        אירעה שגיאה בלתי צפויה. אפשר לנסות שוב או לחזור לדף הבית.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          ניסיון נוסף
        </Button>
        <Link
          href="/"
          className="public-focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-primary)]"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </Container>
  );
}
