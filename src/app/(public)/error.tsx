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

    try {
      const body = JSON.stringify({
        message: error.message,
        stack: error.stack,
        source: "error-boundary",
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/client-error-log",
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch("/api/client-error-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      // best-effort diagnostics only
    }
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
      {error.message ? (
        <p
          dir="ltr"
          className="text-muted mb-8 max-w-lg break-all rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-left font-mono text-xs"
        >
          {error.message}
          {error.digest ? ` (digest: ${error.digest})` : ""}
        </p>
      ) : null}
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
