import {
  Award,
  BookOpen,
  ChefHat,
  FolderTree,
  HeartHandshake,
  Image,
  LayoutDashboard,
  Mail,
  MessageCircleHeart,
  Settings,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "ראשי",
    items: [
      {
        label: "לוח בקרה",
        href: "/admin",
        icon: LayoutDashboard,
        enabled: true,
      },
    ],
  },
  {
    title: "תוכן",
    items: [
      {
        label: "שירותים",
        href: "/admin/services",
        icon: HeartHandshake,
        enabled: true,
      },
      {
        label: "מתכונים",
        href: "/admin/recipes",
        icon: ChefHat,
        enabled: true,
      },
      {
        label: "פוסטים",
        href: "/admin/articles",
        icon: BookOpen,
        enabled: true,
      },
    ],
  },
  {
    title: "לקוחות",
    items: [
      {
        label: "המלצות",
        href: "/admin/testimonials",
        icon: MessageCircleHeart,
        enabled: true,
      },
      {
        label: "פניות",
        href: "/admin/contact-messages",
        icon: Mail,
        enabled: false,
      },
    ],
  },
  {
    title: "ניהול",
    items: [
      {
        label: "קטגוריות",
        href: "/admin/categories",
        icon: FolderTree,
        enabled: true,
      },
      {
        label: "תגיות",
        href: "/admin/tags",
        icon: Tag,
        enabled: true,
      },
      {
        label: "תעודות",
        href: "/admin/certificates",
        icon: Award,
        enabled: false,
      },
      {
        label: "ספריית מדיה",
        href: "/admin/media",
        icon: Image,
        enabled: true,
      },
      {
        label: "הגדרות אתר",
        href: "/admin/site-settings",
        icon: Settings,
        enabled: false,
      },
    ],
  },
];

export type QuickActionItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  href?: string;
};

export const DASHBOARD_QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: "שירות חדש",
    description: "יצירת שירות חדש במערכת",
    icon: HeartHandshake,
    enabled: true,
    href: "/admin/services/new",
  },
  {
    label: "מתכון חדש",
    description: "הוספת מתכון חדש לאתר",
    icon: ChefHat,
    enabled: true,
    href: "/admin/recipes/new",
  },
  {
    label: "פוסט חדש",
    description: "פרסום פוסט חדש",
    icon: BookOpen,
    enabled: true,
    href: "/admin/articles/new",
  },
  {
    label: "פניות חדשות",
    description: "צפייה בפניות מהאתר",
    icon: Mail,
    enabled: false,
  },
  {
    label: "הגדרות האתר",
    description: "עדכון הגדרות כלליות",
    icon: Settings,
    enabled: false,
  },
];

export const ADMIN_ROUTE_LABELS: Record<string, string> = {
  "/admin": "לוח בקרה",
  "/admin/media": "ספריית מדיה",
  "/admin/services": "שירותים",
  "/admin/services/new": "שירות חדש",
  "/admin/recipes": "מתכונים",
  "/admin/recipes/new": "מתכון חדש",
  "/admin/articles": "פוסטים",
  "/admin/articles/new": "פוסט חדש",
  "/admin/categories": "קטגוריות",
  "/admin/categories/new": "קטגוריה חדשה",
  "/admin/tags": "תגיות",
  "/admin/tags/new": "תגית חדשה",
  "/admin/testimonials": "המלצות",
  "/admin/testimonials/new": "המלצה חדשה",
};
