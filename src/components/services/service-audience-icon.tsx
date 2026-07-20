import {
  Activity,
  Apple,
  Baby,
  Brain,
  CheckCircle,
  Clock,
  Dumbbell,
  Flower2,
  HandHeart,
  Heart,
  Leaf,
  Salad,
  Scale,
  Shield,
  Smile,
  Sparkles,
  Target,
  User,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_SERVICE_AUDIENCE_ICON,
  normalizeServiceAudienceIcon,
  type ServiceAudienceIconName,
} from "@/lib/services/audience-icons";
import { cn } from "@/lib/utils/cn";

const AUDIENCE_ICON_MAP: Record<ServiceAudienceIconName, LucideIcon> = {
  Heart,
  Leaf,
  Apple,
  Sparkles,
  Smile,
  Activity,
  User,
  Baby,
  Dumbbell,
  Shield,
  CheckCircle,
  Users,
  HandHeart,
  Salad,
  Brain,
  Clock,
  Target,
  Flower2,
  Utensils,
  Scale,
};

type ServiceAudienceIconProps = {
  name?: string | null;
  className?: string;
};

export function ServiceAudienceIcon({
  name,
  className,
}: ServiceAudienceIconProps) {
  const resolved =
    normalizeServiceAudienceIcon(name) ?? DEFAULT_SERVICE_AUDIENCE_ICON;
  const Icon = AUDIENCE_ICON_MAP[resolved];

  return <Icon aria-hidden="true" className={cn("size-6", className)} />;
}
