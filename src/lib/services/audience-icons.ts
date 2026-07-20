export const SERVICE_AUDIENCE_ICON_NAMES = [
  "Heart",
  "Leaf",
  "Apple",
  "Sparkles",
  "Smile",
  "Activity",
  "User",
  "Baby",
  "Dumbbell",
  "Shield",
  "CheckCircle",
  "Users",
  "HandHeart",
  "Salad",
  "Brain",
  "Clock",
  "Target",
  "Flower2",
  "Utensils",
  "Scale",
] as const;

export type ServiceAudienceIconName =
  (typeof SERVICE_AUDIENCE_ICON_NAMES)[number];

export const SERVICE_AUDIENCE_ICON_LABELS: Record<
  ServiceAudienceIconName,
  string
> = {
  Heart: "לב",
  Leaf: "עלה",
  Apple: "תפוח",
  Sparkles: "ניצוצות",
  Smile: "חיוך",
  Activity: "פעילות",
  User: "משתמשת",
  Baby: "תינוק",
  Dumbbell: "כושר",
  Shield: "מגן",
  CheckCircle: "וי",
  Users: "קבוצה",
  HandHeart: "יד עם לב",
  Salad: "סלט",
  Brain: "מוח",
  Clock: "שעון",
  Target: "מטרה",
  Flower2: "פרח",
  Utensils: "סכו״ם",
  Scale: "מאזניים",
};

export const DEFAULT_SERVICE_AUDIENCE_ICON: ServiceAudienceIconName = "Leaf";

export function isServiceAudienceIconName(
  value: string
): value is ServiceAudienceIconName {
  return (SERVICE_AUDIENCE_ICON_NAMES as readonly string[]).includes(value);
}

export function normalizeServiceAudienceIcon(
  value: string | null | undefined
): ServiceAudienceIconName | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || !isServiceAudienceIconName(trimmed)) {
    return undefined;
  }

  return trimmed;
}
