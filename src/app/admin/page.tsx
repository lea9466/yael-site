import { Database, LayoutDashboard, Lightbulb, LogIn, Server, Sparkles } from "lucide-react";

import { AdminOrganicBackdrop } from "@/components/admin/admin-organic-shapes";
import { AdminIconCircle } from "@/components/admin/admin-icon-circle";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { AdminBreadcrumbsRow } from "@/components/admin/admin-breadcrumbs-row";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { QuickActionCard } from "@/components/admin/quick-action-card";
import { StatusCard } from "@/components/admin/status-card";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { ADMIN_NAV_SECTIONS, DASHBOARD_QUICK_ACTIONS } from "@/constants/navigation";
import {
  checkDatabaseConnection,
  isSupabaseConfigured,
  requireAdmin,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const adminUser = await requireAdmin();
  const supabaseConnected = isSupabaseConfigured();
  const databaseConnected = await checkDatabaseConnection();
  const enabledModules = ADMIN_NAV_SECTIONS.flatMap((section) =>
    section.items.filter((item) => item.enabled)
  ).length;
  const enabledActions = DASHBOARD_QUICK_ACTIONS.filter((action) => action.enabled).length;
  const systemScore = [true, databaseConnected, supabaseConnected].filter(Boolean).length;

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
                <h1 className="text-page-title">
                  <span aria-hidden="true" className="me-2">
                    🌞
                  </span>
                  בוקר טוב, {adminUser.full_name}
                </h1>
                <p className="text-muted max-w-2xl text-base">
                  ברוכה הבאה לסטודיו הדיגיטלי שלך. היום יום מצוין ליצור תוכן
                  בריא, יפה ומלא השראה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminStatCards
        stats={[
          {
            icon: Sparkles,
            label: "מודולים פעילים",
            value: enabledModules,
            module: "dashboard",
            emoji: "🌿",
          },
          {
            icon: Server,
            label: "מערכת תקינה",
            value: `${systemScore}/3`,
            module: "services",
            emoji: "✅",
          },
          {
            icon: LogIn,
            label: "פעולות מהירות",
            value: enabledActions,
            module: "recipes",
            emoji: "⭐",
          },
          {
            icon: Database,
            label: "חיבורים פעילים",
            value: systemScore,
            module: "articles",
            emoji: "✨",
          },
        ]}
      />

      <section className="space-y-6">
        <SectionHeader
          title="מצב המערכת"
          description="בדיקה מהירה של חיבורי המערכת וההתחברות"
        />

        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          <StatusCard
            title="סטטוס התחברות"
            value="מחוברת"
            description="החיבור שלך למערכת הניהול פעיל ומאובטח."
            ok
            icon={LogIn}
            module="dashboard"
          />
          <StatusCard
            title="מסד הנתונים"
            value={databaseConnected ? "מחובר" : "לא מחובר"}
            description="בדיקת גישה לטבלאות הניהול ב-Supabase PostgreSQL."
            ok={databaseConnected}
            icon={Database}
            module="services"
          />
          <StatusCard
            title="Supabase"
            value={supabaseConnected ? "מחובר" : "לא מחובר"}
            description="בדיקת הגדרות חיבור ל-Supabase Auth ו-API."
            ok={supabaseConnected}
            icon={Server}
            module="articles"
          />
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
                    : action.label.includes("מאמר")
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
