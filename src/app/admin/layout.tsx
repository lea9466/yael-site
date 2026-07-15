import type { Metadata } from "next";

import { PostSaveToastHost } from "@/components/admin/post-save-toast-host";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";

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
