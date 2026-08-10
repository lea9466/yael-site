import { Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type RecipeMetadataProps = {
  servings: string;
  className?: string;
};

type MetaItem = {
  key: "servings";
  label: string;
  value: string;
  icon: LucideIcon;
};

export function RecipeMetadata({
  servings,
  className,
}: RecipeMetadataProps) {
  const yieldText = servings.trim();

  const items: MetaItem[] = [];

  if (yieldText.length > 0) {
    items.push({
      key: "servings",
      label: "מנות",
      value: yieldText,
      icon: Utensils,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <dl
      className={cn(
        "recipe-metadata",
        `recipe-metadata--count-${items.length}`,
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.key} className="recipe-metadata__item">
            <dt className="recipe-metadata__header">
              <Icon
                aria-hidden="true"
                className="recipe-metadata__icon"
                strokeWidth={1.75}
              />
              <span className="recipe-metadata__label">{item.label}</span>
            </dt>
            <dd className="recipe-metadata__value">
              {item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
