import { EmptyState } from "@/components/ui/empty-state";

export function RecipesPageError() {
  return (
    <EmptyState
      title="לא ניתן לטעון את המתכונים"
      description="אירעה שגיאה בטעינת הרשימה. נסו לרענן את העמוד."
    />
  );
}
