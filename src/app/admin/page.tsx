import { Database, Lightbulb, LogIn, Server } from "lucide-react";

import { QuickActionCard } from "@/components/admin/quick-action-card";
import { StatusCard } from "@/components/admin/status-card";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { DASHBOARD_QUICK_ACTIONS } from "@/constants/navigation";
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

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8">
      <section className="relative min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 end-0 size-32 rounded-[var(--radius-full)] bg-[var(--color-accent)]/40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 start-0 size-32 rounded-[var(--radius-full)] bg-[var(--color-secondary)]/10"
        />

        <div className="relative space-y-2">
          <h1 className="text-page-title">
            שלום {adminUser.full_name} 👋
          </h1>
          <p className="max-w-2xl text-muted">
            ברוכה הבאה למערכת הניהול של יעל
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="מצב המערכת"
          description="בדיקה מהירה של חיבורי המערכת וההתחברות"
        />

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          <StatusCard
            title="סטטוס התחברות"
            value="מחוברת"
            description="החיבור שלך למערכת הניהול פעיל ומאובטח."
            ok
            icon={LogIn}
          />
          <StatusCard
            title="מסד הנתונים"
            value={databaseConnected ? "מחובר" : "לא מחובר"}
            description="בדיקת גישה לטבלאות הניהול ב-Supabase PostgreSQL."
            ok={databaseConnected}
            icon={Database}
          />
          <StatusCard
            title="Supabase"
            value={supabaseConnected ? "מחובר" : "לא מחובר"}
            description="בדיקת הגדרות חיבור ל-Supabase Auth ו-API."
            ok={supabaseConnected}
            icon={Server}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="פעולות מהירות"
          description="קיצורי דרך לפעולות נפוצות במערכת"
        />

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          {DASHBOARD_QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.label}
              label={action.label}
              description={action.description}
              icon={action.icon}
              enabled={action.enabled}
            />
          ))}
        </div>
      </section>

      <section>
        <Card className="flex items-start gap-4">
          <div className="rounded-[var(--radius-md)] bg-[var(--color-info-soft)] p-2.5 text-[var(--color-info)]">
            <Lightbulb aria-hidden="true" className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-card-title">טיפ מערכת</h2>
            <p className="text-muted">
              מודולי התוכן ייפתחו בהדרגה. בינתיים ניתן לעקוב אחר מצב המערכת
              ולהישאר מחוברת בבטחה דרך לוח הבקרה.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
