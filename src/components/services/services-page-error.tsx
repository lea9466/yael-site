import { EmptyState } from "@/components/ui/empty-state";

export function ServicesPageError() {
  return (
    <EmptyState
      title="לא ניתן לטעון את השירותים"
      description="אירעה שגיאה בטעינת רשימת השירותים. נסו לרענן את העמוד."
    />
  );
}
