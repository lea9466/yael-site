import type { Metadata } from "next";
import NextDynamic from "next/dynamic";

import { PostSaveToastHost } from "@/components/admin/post-save-toast-host";
import { requireAdmin } from "@/lib/auth/session";

const AdminShell = NextDynamic(
  () =>
    import("@/components/admin/admin-shell").then((module) => module.AdminShell),
  {
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-[var(--color-text-muted)]">טוען את מערכת הניהול…</p>
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "מערכת ניהול",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminUser = await requireAdmin();

  return (
    <AdminShell fullName={adminUser.full_name} email={adminUser.email}>
      <PostSaveToastHost />
      {children}
    </AdminShell>
  );
}
