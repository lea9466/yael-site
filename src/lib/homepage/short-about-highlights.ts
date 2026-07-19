import type { LucideIcon } from "lucide-react";
import { Heart, Leaf, Sparkles, Sprout } from "lucide-react";

export type ShortAboutHighlightVariant = "mint" | "teal" | "coral" | "gold";

export type ShortAboutHighlightPosition =
  | "top-start"
  | "top-end"
  | "center-start"
  | "bottom-start"
  | "bottom-end";

export type ShortAboutHighlight = {
  id: string;
  label: string;
  variant: ShortAboutHighlightVariant;
  icon: LucideIcon;
  position: ShortAboutHighlightPosition;
  animationDuration: string;
};

/** Approved highlight pills for the homepage short-about visual composition. */
export const HOMEPAGE_SHORT_ABOUT_HIGHLIGHTS: ShortAboutHighlight[] = [
  {
    id: "personal-guidance",
    label: "ליווי אישי",
    variant: "mint",
    icon: Sparkles,
    position: "top-start",
    animationDuration: "3s",
  },
  {
    id: "natural-approach",
    label: "גישה טבעית",
    variant: "teal",
    icon: Leaf,
    position: "bottom-end",
    animationDuration: "4s",
  },
  {
    id: "sustainable-change",
    label: "שינוי בר קיימא",
    variant: "coral",
    icon: Sprout,
    position: "center-start",
    animationDuration: "3.5s",
  },
  {
    id: "body-listening",
    label: "הקשבה לגוף",
    variant: "gold",
    icon: Heart,
    position: "bottom-start",
    animationDuration: "4.5s",
  },
];
