import { LayoutDashboard, Lightbulb } from "lucide-react";

import { AdminOrganicBackdrop } from "@/components/admin/admin-organic-shapes";
import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import { AdminBreadcrumbsRow } from "@/components/admin/admin-breadcrumbs-row";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { QuickActionCard } from "@/components/admin/quick-action-card";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { DASHBOARD_QUICK_ACTIONS } from "@/constants/navigation";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-12">
      <section className="admin-page-header">
        <AdminBreadcrumbsRow>
          <Breadcrumbs />
        </AdminBreadcrumbsRow>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] px-1">
          <AdminOrganicBackdrop module="dashboard" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <AdminIconCircle module="dashboard" icon={LayoutDashboard} size="xl" />
              <div className="admin-page-title-block">
                <h1 className="text-page-title">שלום יעל</h1>
                <p className="text-muted max-w-2xl text-base">
                  ברוכה הבאה לסטודיו הדיגיטלי שלך. היום יום מצוין ליצור תוכן
                  בריא, יפה ומלא השראה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="פעולות מהירות"
          description="קיצורי דרך לפעולות נפוצות — התחילי מכאן"
        />

        <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          {DASHBOARD_QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.label}
              label={action.label}
              description={action.description}
              icon={action.icon}
              enabled={action.enabled}
              href={action.href}
              module={
                action.label.includes("מתכון")
                  ? "recipes"
                  : action.label.includes("שירות")
                    ? "services"
                    : action.label.includes("פוסט")
                      ? "articles"
                      : "dashboard"
              }
            />
          ))}
        </div>
      </section>

      <section>
        <Card accentModule="dashboard" className="flex items-start gap-4">
          <div
            className="rounded-[var(--radius-full)] p-3 text-[var(--color-warm-gold)]"
            style={{ background: "var(--color-warm-gold-soft)" }}
          >
            <Lightbulb aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-card-title">טיפ ליום פרודוקטיבי</h2>
            <p className="text-muted">
              התחילי ביצירת תוכן שאת אוהבת — מתכון מנחם או שירות שמדבר אל הלב.
              המערכת תדאג לכל השאר.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
