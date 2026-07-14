import {
  Award,
  BookOpen,
  ChefHat,
  FolderTree,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Settings,
  Tags,
  Wrench,
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
        icon: Wrench,
        enabled: false,
      },
      {
        label: "מתכונים",
        href: "/admin/recipes",
        icon: ChefHat,
        enabled: false,
      },
      {
        label: "מאמרים",
        href: "/admin/articles",
        icon: BookOpen,
        enabled: false,
      },
    ],
  },
  {
    title: "לקוחות",
    items: [
      {
        label: "המלצות",
        href: "/admin/testimonials",
        icon: MessageSquareQuote,
        enabled: false,
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
        enabled: false,
      },
      {
        label: "תגיות",
        href: "/admin/tags",
        icon: Tags,
        enabled: false,
      },
      {
        label: "תעודות",
        href: "/admin/certificates",
        icon: Award,
        enabled: false,
      },
      {
        label: "ספריית מדיה",
        href: "/admin/media-library",
        icon: Image,
        enabled: false,
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
};

export const DASHBOARD_QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: "שירות חדש",
    description: "יצירת שירות חדש במערכת",
    icon: Wrench,
    enabled: false,
  },
  {
    label: "מתכון חדש",
    description: "הוספת מתכון חדש לאתר",
    icon: ChefHat,
    enabled: false,
  },
  {
    label: "מאמר חדש",
    description: "פרסום מאמר חדש",
    icon: BookOpen,
    enabled: false,
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
};
