import {
  BookOpen,
  ChefHat,
  FolderTree,
  HeartHandshake,
  Image,
  LayoutDashboard,
  MessageCircleHeart,
  Settings,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type AdminModuleId =
  | "dashboard"
  | "recipes"
  | "services"
  | "articles"
  | "categories"
  | "tags"
  | "media"
  | "testimonials"
  | "settings";

export type ModuleTheme = {
  id: AdminModuleId;
  icon: LucideIcon;
  emoji: string;
  accent: string;
  accentSoft: string;
  accentRing: string;
  gradient: string;
  iconGradient: string;
};

export const ADMIN_MODULE_THEMES: Record<AdminModuleId, ModuleTheme> = {
  dashboard: {
    id: "dashboard",
    icon: LayoutDashboard,
    emoji: "🌞",
    accent: "var(--color-warm-gold)",
    accentSoft: "var(--color-warm-gold-soft)",
    accentRing: "var(--color-warm-gold)",
    gradient:
      "linear-gradient(135deg, var(--color-warm-gold-soft) 0%, var(--color-sky-blue-soft) 55%, var(--color-light-sage-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-warm-gold) 0%, var(--color-secondary) 100%)",
  },
  recipes: {
    id: "recipes",
    icon: ChefHat,
    emoji: "🥗",
    accent: "var(--color-fresh-green)",
    accentSoft: "var(--color-fresh-green-soft)",
    accentRing: "var(--color-fresh-green)",
    gradient:
      "linear-gradient(135deg, var(--color-fresh-green-soft) 0%, var(--color-light-sage-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-fresh-green) 0%, var(--color-secondary) 100%)",
  },
  services: {
    id: "services",
    icon: HeartHandshake,
    emoji: "🌿",
    accent: "var(--color-primary)",
    accentSoft: "var(--color-light-sage-soft)",
    accentRing: "var(--color-secondary)",
    gradient:
      "linear-gradient(135deg, var(--color-light-sage-soft) 0%, var(--color-fresh-green-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
  },
  articles: {
    id: "articles",
    icon: BookOpen,
    emoji: "📚",
    accent: "var(--color-sky-blue)",
    accentSoft: "var(--color-sky-blue-soft)",
    accentRing: "var(--color-sky-blue)",
    gradient:
      "linear-gradient(135deg, var(--color-sky-blue-soft) 0%, var(--color-light-sage-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-sky-blue) 0%, var(--color-primary) 100%)",
  },
  categories: {
    id: "categories",
    icon: FolderTree,
    emoji: "🗂️",
    accent: "var(--color-warm-gold)",
    accentSoft: "var(--color-cream)",
    accentRing: "var(--color-warm-gold)",
    gradient:
      "linear-gradient(135deg, var(--color-cream) 0%, var(--color-warm-gold-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-warm-gold) 0%, var(--color-accent) 100%)",
  },
  tags: {
    id: "tags",
    icon: Tag,
    emoji: "🏷️",
    accent: "var(--color-soft-accent)",
    accentSoft: "var(--color-coral-soft)",
    accentRing: "var(--color-soft-accent)",
    gradient:
      "linear-gradient(135deg, var(--color-coral-soft) 0%, var(--color-warm-gold-soft) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-soft-accent) 0%, var(--color-warm-gold) 100%)",
  },
  media: {
    id: "media",
    icon: Image,
    emoji: "🖼️",
    accent: "var(--color-sky-blue)",
    accentSoft: "var(--color-sky-blue-soft)",
    accentRing: "var(--color-sky-blue)",
    gradient:
      "linear-gradient(135deg, var(--color-sky-blue-soft) 0%, var(--color-cream) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-sky-blue) 0%, var(--color-secondary) 100%)",
  },
  testimonials: {
    id: "testimonials",
    icon: MessageCircleHeart,
    emoji: "💬",
    accent: "var(--color-soft-accent)",
    accentSoft: "var(--color-coral-soft)",
    accentRing: "var(--color-soft-accent)",
    gradient:
      "linear-gradient(135deg, var(--color-coral-soft) 0%, var(--color-cream) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-soft-accent) 0%, var(--color-warm-gold) 100%)",
  },
  settings: {
    id: "settings",
    icon: Settings,
    emoji: "⚙️",
    accent: "var(--color-text-muted)",
    accentSoft: "var(--color-surface-soft)",
    accentRing: "var(--color-border-strong)",
    gradient:
      "linear-gradient(135deg, var(--color-surface-soft) 0%, var(--color-cream) 100%)",
    iconGradient:
      "linear-gradient(135deg, var(--color-text-muted) 0%, var(--color-primary) 100%)",
  },
};

export function getModuleTheme(module: AdminModuleId): ModuleTheme {
  return ADMIN_MODULE_THEMES[module];
}
