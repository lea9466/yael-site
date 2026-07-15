export const ADMIN_LIST_PATHS = {
  category: "/admin/categories",
  tag: "/admin/tags",
  service: "/admin/services",
  recipe: "/admin/recipes",
  article: "/admin/articles",
} as const;

export type AdminListPathKey = keyof typeof ADMIN_LIST_PATHS;
