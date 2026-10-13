import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "שכחתי סיסמה | מערכת ניהול",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-10">
      <ForgotPasswordForm />
    </main>
  );
}
