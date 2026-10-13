import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "בחירת סיסמה חדשה | מערכת ניהול",
  robots: {
    index: false,
    follow: false,
  },
  // The reset token is in the URL; don't leak it to other sites.
  referrer: "no-referrer",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token_hash?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token_hash: tokenHash } = await searchParams;

  if (!tokenHash) {
    redirect("/login/forgot-password");
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-10">
      <ResetPasswordForm tokenHash={tokenHash} />
    </main>
  );
}
