"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { Container } from "@/components/public/layout/container";
import { Button } from "@/components/ui/button";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

// Third-party scripts some visitors' networks inject into the page (content
// filters, etc.) occasionally mutate the DOM in ways that collide with
// React's hydration/streaming and throw here — timing-dependent, so a retry
// very rarely hits the same bad timing twice. Auto-retry a couple of times
// before ever showing the visitor an error screen. Capped + time-windowed
// via sessionStorage so a genuinely broken page still surfaces the real UI
// instead of retrying forever.
const AUTO_RETRY_STORAGE_KEY = "public-error-auto-retry";
const MAX_AUTO_RETRIES = 2;
const AUTO_RETRY_WINDOW_MS = 15000;
const AUTO_RETRY_DELAY_MS = 400;

function readAutoRetryCount(): number {
  try {
    const raw = sessionStorage.getItem(AUTO_RETRY_STORAGE_KEY);

    if (!raw) {
      return 0;
    }

    const { count, timestamp } = JSON.parse(raw) as {
      count: number;
      timestamp: number;
    };

    if (Date.now() - timestamp > AUTO_RETRY_WINDOW_MS) {
      return 0;
    }

    return count;
  } catch {
    return MAX_AUTO_RETRIES;
  }
}

function writeAutoRetryCount(count: number): void {
  try {
    sessionStorage.setItem(
      AUTO_RETRY_STORAGE_KEY,
      JSON.stringify({ count, timestamp: Date.now() })
    );
  } catch {
    // best-effort only
  }
}

function reportError(error: Error & { digest?: string }): void {
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
}

export default function PublicError({ error, reset, unstable_retry }: PublicErrorProps) {
  const [isAutoRetrying] = useState(() => readAutoRetryCount() < MAX_AUTO_RETRIES);

  useEffect(() => {
    reportError(error);

    if (!isAutoRetrying) {
      return;
    }

    writeAutoRetryCount(readAutoRetryCount() + 1);
    const retry = unstable_retry ?? reset;
    const timer = setTimeout(retry, AUTO_RETRY_DELAY_MS);

    return () => clearTimeout(timer);
    // Only run once per mount (a fresh error boundary instance per thrown error).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAutoRetrying) {
    return null;
  }

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
        <Button type="button" onClick={() => (unstable_retry ?? reset)()}>
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
