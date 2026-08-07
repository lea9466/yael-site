import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "הדף לא נמצא | יעל קנייבסקי",
  },
  description: "הדף שחיפשתם אינו קיים.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-page-title mb-3">הדף לא נמצא</h1>
      <p className="text-muted mb-8 max-w-md">הדף שחיפשתם אינו קיים במערכת.</p>
      <Link
        href="/"
        className="public-focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-5 text-sm font-medium text-[var(--color-text-on-primary)]"
      >
        חזרה לדף הבית
      </Link>
    </main>
  );
}
