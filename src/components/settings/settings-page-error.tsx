import { AlertCircle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function SettingsPageError() {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <AdminPageHeader
        module="settings"
        title="הגדרות האתר"
        description="ניהול הגדרות כלליות, יצירת קשר, SEO, אנליטיקות ומיתוג."
      />

      <div
        role="alert"
        className="surface-card-elevated flex items-start gap-4 p-6 text-[var(--color-error)]"
      >
        <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">לא ניתן לטעון את ההגדרות</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            נסו לרענן את העמוד. אם הבעיה נמשכת, בדקו את חיבור מסד הנתונים.
          </p>
        </div>
      </div>
    </div>
  );
}
