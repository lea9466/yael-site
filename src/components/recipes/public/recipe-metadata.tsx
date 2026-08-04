import { Gauge, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getDifficultyDisplay } from "@/lib/recipes/difficulty-display";
import type { RecipeDifficulty } from "@/lib/recipes/constants";
import { cn } from "@/lib/utils/cn";

type RecipeMetadataProps = {
  servings: string;
  difficulty: RecipeDifficulty;
  className?: string;
};

type MetaItem =
  | {
      key: "servings";
      label: string;
      value: string;
      icon: LucideIcon;
    }
  | {
      key: "difficulty";
      label: string;
      value: string;
      icon: LucideIcon;
      difficulty: RecipeDifficulty;
    };

export function RecipeMetadata({
  servings,
  difficulty,
  className,
}: RecipeMetadataProps) {
  const yieldText = servings.trim();
  const difficultyDisplay = getDifficultyDisplay(difficulty);

  const items: MetaItem[] = [];

  if (yieldText.length > 0) {
    items.push({
      key: "servings",
      label: "מנות",
      value: yieldText,
      icon: Utensils,
    });
  }

  items.push({
    key: "difficulty",
    label: "רמת קושי",
    value: difficultyDisplay.label,
    icon: Gauge,
    difficulty,
  });

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
            <dd
              className={cn(
                "recipe-metadata__value",
                item.key === "difficulty" &&
                  "recipe-metadata__value--difficulty",
                item.key === "difficulty" &&
                  `recipe-metadata__value--${item.difficulty}`
              )}
            >
              {item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
