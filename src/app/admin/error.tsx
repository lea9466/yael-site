"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// A single failed Server Component render or Server Action inside /admin
// previously took down the whole page with the bare Next.js error screen.
// This keeps the admin chrome usable and surfaces the digest so a failure
// can be traced in the Vercel logs.
export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin] error boundary", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-error-soft)] text-[var(--color-error)]">
        <AlertTriangle aria-hidden="true" className="size-7" strokeWidth={1.5} />
      </div>
      <h1 className="text-page-title mb-3">משהו השתבש</h1>
      <p className="text-muted mb-8 max-w-md">
        אירעה שגיאה בטעינת העמוד או בשמירה. אפשר לנסות שוב.
      </p>
      {(error.message || error.digest) ? (
        <p
          dir="ltr"
          className="text-muted mb-8 max-w-lg break-all rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-left font-mono text-xs"
        >
          {error.message}
          {error.digest ? ` (digest: ${error.digest})` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          ניסיון נוסף
        </Button>
        <Link
          href="/admin"
          className="admin-btn-outline inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-medium"
        >
          חזרה ללוח הבקרה
        </Link>
      </div>
    </div>
  );
}
