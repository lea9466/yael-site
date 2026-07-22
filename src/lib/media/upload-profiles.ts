import type { LucideIcon } from "lucide-react";
import { ImageIcon, Sunrise } from "lucide-react";

export const UPLOAD_PROFILES = ["normal", "hero"] as const;

export type UploadProfile = (typeof UPLOAD_PROFILES)[number];

export const DEFAULT_UPLOAD_PROFILE: UploadProfile = "normal";

/** Minimum source width before showing a Hero image warning. */
export const MIN_HERO_SOURCE_WIDTH = 1800;

export type UploadProfileProcessingConfig = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  outputMimeType: "image/webp";
};

export const UPLOAD_PROFILE_PROCESSING: Record<
  UploadProfile,
  UploadProfileProcessingConfig
> = {
  normal: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 82,
    outputMimeType: "image/webp",
  },
  hero: {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 85,
    outputMimeType: "image/webp",
  },
};

export type UploadProfileUiMeta = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const UPLOAD_PROFILE_UI: Record<UploadProfile, UploadProfileUiMeta> = {
  normal: {
    title: "תמונה רגילה",
    description: "מתכונים, פוסטים, שירותים, קטגוריות, תעודות וקבצי PDF.",
    icon: ImageIcon,
  },
  hero: {
    title: "תמונה ראשית",
    description: "Hero בדף הבית, באנרים ותמונות ברוחב מלא.",
    icon: Sunrise,
  },
};

export const UPLOAD_PROFILE_BADGE_LABELS: Record<UploadProfile, string> = {
  normal: "רגילה",
  hero: "ראשית",
};

export const HERO_IMAGE_WARNING =
  "התמונה קטנה יחסית ועלולה להיראות פחות חדה במסכים גדולים.";
