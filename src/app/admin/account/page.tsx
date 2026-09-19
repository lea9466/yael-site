import { ChangePasswordForm } from "@/components/account/change-password-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <AdminPageHeader
        title="החשבון שלי"
        description="שינוי הסיסמה שבה נכנסים למערכת הניהול."
      />

      <Card elevated className="space-y-6 p-6 sm:p-8">
        <div className="space-y-1 text-right">
          <h2 className="text-section-title">שינוי סיסמה</h2>
          {admin.email ? (
            <p className="text-muted">
              מחוברת בתור <span dir="ltr">{admin.email}</span>
            </p>
          ) : null}
        </div>

        <ChangePasswordForm />
      </Card>
    </div>
  );
}
