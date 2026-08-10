import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "התחברות | מערכת ניהול",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

function getInitialMessage(reason?: string): string | undefined {
  if (reason === "unauthorized") {
    return AUTH_ERRORS.unauthorized;
  }

  if (reason === "inactivity") {
    return AUTH_ERRORS.inactivity;
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const adminUser = await getAuthenticatedAdmin();

  if (adminUser) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-10">
      <LoginForm initialMessage={getInitialMessage(params.reason)} />
    </main>
  );
}
