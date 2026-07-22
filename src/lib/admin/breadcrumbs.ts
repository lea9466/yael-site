import { ADMIN_ROUTE_LABELS } from "@/constants/navigation";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

function resolvePathLabel(path: string): string {
  if (ADMIN_ROUTE_LABELS[path]) {
    return ADMIN_ROUTE_LABELS[path];
  }

  if (/^\/admin\/services\/[^/]+\/preview$/.test(path)) {
    return "תצוגה מקדימה";
  }

  if (/^\/admin\/services\/[^/]+$/.test(path)) {
    return "עריכת שירות";
  }

  if (/^\/admin\/recipes\/[^/]+\/preview$/.test(path)) {
    return "תצוגה מקדימה";
  }

  if (/^\/admin\/recipes\/[^/]+$/.test(path)) {
    return "עריכת מתכון";
  }

  if (/^\/admin\/articles\/[^/]+\/preview$/.test(path)) {
    return "תצוגה מקדימה";
  }

  if (/^\/admin\/articles\/[^/]+$/.test(path)) {
    return "עריכת פוסט";
  }

  if (/^\/admin\/press\/[^/]+$/.test(path)) {
    return "עריכת כתבה";
  }

  if (path === "/admin/about/preview") {
    return "תצוגה מקדימה";
  }

  if (path === "/admin/about") {
    return "אודות";
  }

  if (/^\/admin\/categories\/[^/]+$/.test(path)) {
    return "עריכת קטגוריה";
  }

  if (/^\/admin\/tags\/[^/]+$/.test(path)) {
    return "עריכת תגית";
  }

  if (/^\/admin\/testimonials\/[^/]+$/.test(path)) {
    return "עריכת המלצה";
  }

  if (/^\/admin\/contact-messages\/[^/]+$/.test(path)) {
    return "צפייה בפנייה";
  }

  if (path === "/admin/certificates") {
    return "תעודות והסמכות";
  }

  if (path === "/admin/settings") {
    return "הגדרות האתר";
  }

  return "מערכת ניהול";
}

export function buildAdminBreadcrumbs(pathname: string): AdminBreadcrumbItem[] {
  if (pathname === "/admin") {
    return [{ label: "לוח בקרה" }];
  }

  const items: AdminBreadcrumbItem[] = [
    { label: "מערכת ניהול", href: "/admin" },
  ];

  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  let currentPath = "/admin";

  for (let index = 0; index < segments.length; index += 1) {
    currentPath += `/${segments[index]}`;
    const isLast = index === segments.length - 1;
    const label = resolvePathLabel(currentPath);

    if (isLast) {
      items.push({ label });
    } else {
      items.push({ label, href: currentPath });
    }
  }

  return items;
}
