import { AlertCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

export function MediaPageError() {
  return (
    <Card className="flex items-start gap-4 border-[var(--color-error)]/30 bg-[var(--color-error-soft)]">
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-[var(--color-error)]"
      />
      <div className="space-y-1">
        <h2 className="text-card-title text-[var(--color-error)]">
          לא ניתן לטעון את ספריית המדיה
        </h2>
        <p className="text-muted">
          אירעה שגיאה בטעינת הנתונים. נסו לרענן את הדף מאוחר יותר.
        </p>
      </div>
    </Card>
  );
}
