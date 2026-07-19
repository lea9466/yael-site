import type { LucideIcon } from "lucide-react";
import { Heart, Leaf, Sparkles } from "lucide-react";

export type HomepageApproachPoint = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const HOMEPAGE_APPROACH_POINTS: HomepageApproachPoint[] = [
  {
    id: "personal",
    title: "ליווי אישי ומותאם",
    description: "תהליך שמכבד את הקצב, ההעדפות והחיים שלכם — בלי תבניות קבועות.",
    icon: Heart,
  },
  {
    id: "mindful",
    title: "קשר מודע לאוכל",
    description: "יחד נבנה תשומת לב, סקרנות וחמלה כלפי הגוף — מעבר לכללים ומספרים.",
    icon: Leaf,
  },
  {
    id: "sustainable",
    title: "שינוי בר-קיימא",
    description: "כלים פרקטיים ליומיום שמאפשרים לשמור על איזון לאורך זמן.",
    icon: Sparkles,
  },
];
