type ClassValue = string | number | boolean | null | undefined;

/**
 * Joins class names, filtering out falsy values.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
